import express from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();
const port = 3000;

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
app.post('/upload', upload.any(), (req, res) => {
    // multer attaches files to req.files when using any(); pick the first file
    const files = (req as any).files as any[] | undefined;
    const file = files?.[0];
    if (!file) return res.status(400).json({ error: 'No file uploaded or invalid file type' });

    // enforce PDF mime/extension server-side as an extra safety
    const isPdf = file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf';
    if (!isPdf) return res.status(400).json({ error: 'Only PDF files are allowed' });

    res.status(201).json({
        originalName: file.originalname,
        fileName: file.filename,
        size: file.size,
        mimeType: file.mimetype,
        path: file.path
    });
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
