import express from 'express';
// NOTE: relative path assumes this file is at server/src/routes/chat.ts
// and ai-engine is at ../../ai-engine/src -> adjust if your layout differs
import { askAI } from '../../../ai-engine/src';

const router = express.Router();

router.post('/chat', async (req, res) => {
    try {
        const { question } = req.body;
        const answer = await askAI(question);
        res.json({ answer });
    } catch (error) {
        console.error('AI Error', error);
        // Handle rate-limit / quota errors from Google SDK
        const err: any = error;
        if (err && (err.status === 429 || (err.errorDetails && Array.isArray(err.errorDetails)))) {
            // try to extract retryDelay from error details
            let retrySeconds: number | undefined;
            try {
                const details = err.errorDetails;
                if (Array.isArray(details)) {
                    for (const d of details) {
                        if (d && d['@type'] && String(d['@type']).includes('RetryInfo') && d.retryDelay) {
                            const m = String(d.retryDelay).match(/(\d+)(s)?/);
                            if (m) retrySeconds = parseInt(m[1], 10);
                        }
                    }
                }
            } catch (__) {}

            if (retrySeconds === undefined) retrySeconds = 60; // default
            res.setHeader('Retry-After', String(retrySeconds));
            return res.status(503).json({ error: 'Rate limit / quota exceeded', retry_after: retrySeconds });
        }

        res.status(500).json({ error: 'AI Error' });
    }
});

export default router;
