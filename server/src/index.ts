import express from 'express';
import cors from 'cors';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 5000;

// Load environment variables (try server/.env first, then ai-engine/.env)
dotenv.config();
const aeEnv = path.resolve(__dirname, '..', '..', 'ai-engine', '.env');
dotenv.config({ path: aeEnv });

// CORS: Allow all origins (dev) or specific Vercel app (prod)
app.use(cors({
  origin: process.env.CLIENT_URL || '*'
}));

// parse JSON bodies for routes like /chat
app.use(express.json());

// Register chat router
import chatRouter from './routes/chat';
import { ingestionQueue } from './queue/ingestionQueue';
app.use('/', chatRouter);

// ensure uploads directory exists (at runtime this will resolve relative to compiled output)
const uploadsDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

// Multer storage config
const storage = multer.diskStorage({
    destination: (req: express.Request, file: Express.Multer.File, cb: (error: any, destination: string) => void) => {
        cb(null, uploadsDir);
    },
    filename: (req: express.Request, file: Express.Multer.File, cb: (error: any, filename: string) => void) => {
        const ext = path.extname(file.originalname) || '';
        const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, name);
    }
});

// Accept only PDFs
const fileFilter = (req: express.Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowed = file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf';
    if (allowed) cb(null, true);
    else cb(new Error('Only PDF files are allowed'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit

app.get('/', (req, res) => {
    res.send('Hello from OpsMind Server!');
});

// POST /upload -- accept any single file field (permissive)
app.post('/upload', upload.any(), async (req, res) => {
    // multer attaches files to req.files when using any(); pick the first file
    const files = (req as any).files as any[] | undefined;
    const file = files?.[0];
    if (!file) return res.status(400).json({ error: 'No file uploaded or invalid file type' });

    // enforce PDF mime/extension server-side as an extra safety
    const isPdf = file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf';
    if (!isPdf) return res.status(400).json({ error: 'Only PDF files are allowed' });

    // Trigger background ingestion
    await ingestionQueue.add('ingest-job', { filePath: file.path });

    res.status(201).json({
        status: 'queued',
        message: 'PDF processing started in background',
        originalName: file.originalname,
        fileName: file.filename,
        path: file.path
    });
});


// Start server after establishing MongoDB connection (askAI expects a live connection)
const start = async () => {
    const mongoUri = process.env.MONGODB_URI || '';
    if (!mongoUri) {
        console.warn('⚠️  MONGODB_URI not set. AI queries may fail.');
    } else {
        try {
            console.log('Connecting to MongoDB...');
            await mongoose.connect(mongoUri, { 
                serverSelectionTimeoutMS: 20000,
            });
            console.log('✅ Connected to MongoDB');
        } catch (err) {
            console.error('❌ MongoDB connection error:', err);
        }
    }

    // health endpoint
    app.get('/health', (req, res) => {
        const states: Record<number, string> = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };
        const state = mongoose.connection.readyState;
        res.json({ status: 'ok', db: states[state] || 'unknown' });
    });

    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
};

start();
