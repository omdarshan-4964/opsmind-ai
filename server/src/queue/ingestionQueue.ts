import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import path from 'path';
// Import the ingestion logic from ai-engine
// Note: Ensure tsconfig.json allows including files from outside src if strict boundaries are enforced,
// or that ai-engine is built and linked. Since we updated tsconfig, this imports the source directly.
import { ingestPDF } from '../../../ai-engine/src/ingest';

// Connection to Redis
const connection = new IORedis({
  maxRetriesPerRequest: null,
  // Default to localhost:6379, usually sufficient for dev
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
});

export const INGESTION_QUEUE_NAME = 'pdf-ingestion';

// 1. Define the Queue
export const ingestionQueue = new Queue(INGESTION_QUEUE_NAME, { 
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false
    }
});

// 2. Define the Worker
// The worker processes jobs from the queue automatically
const worker = new Worker(INGESTION_QUEUE_NAME, async (job: Job) => {
    console.log(`[Worker] Processing job ${job.id} for file: ${job.data.filePath}`);
    
    // Validate payload
    const { filePath } = job.data;
    if (!filePath) {
        throw new Error('Job missing filePath');
    }

    try {
        // Call the actual ingestion logic from AI Engine
        await ingestPDF(filePath);
        console.log(`[Worker] Successfully processed job ${job.id}`);
        return { status: 'success', file: filePath };
    } catch (error) {
        console.error(`[Worker] Error processing job ${job.id}:`, error);
        throw error; // Rethrow to let BullMQ handle retries
    }
}, { connection });

// Worker event listeners for logging
worker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed with error ${err.message}`);
});

console.log(`[Queue] Ingestion queue '${INGESTION_QUEUE_NAME}' initialized and worker started.`);
