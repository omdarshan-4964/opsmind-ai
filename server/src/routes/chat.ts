import express from 'express';
// NOTE: relative path assumes this file is at server/src/routes/chat.ts
// and ai-engine is at ../../ai-engine/src -> adjust if your layout differs
import { askAgenticAI } from '../../../ai-engine/src/query';
import { ChatMessage } from '../../../ai-engine/src/types';

const router = express.Router();

/**
 * Format sources with citations for client display
 */
function formatSources(sources: any[]) {
    return sources.map(s => ({
        title: s.metadata?.sourceFile || 'Unknown Document',
        reference: `Page ${s.metadata?.pageNumber || 'N/A'} (Relevance: ${(s.score * 100).toFixed(1)}%)`
    }));
}

router.post('/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        const question = message || req.body.question; // Support both 'message' and 'question'
        
        if (!question) {
            return res.status(400).json({ error: 'Message is required' });
        }
        
        // Set up Server-Sent Events (SSE) headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering for Nginx
        
        // Pass history to AI engine for context-aware responses
        const response = await askAgenticAI({ 
            question, 
            history: history || [] 
        });
        
        // Stream answer character-by-character
        const answer = response.answer;
        for (let i = 0; i < answer.length; i++) {
            const chunk = {
                type: 'content',
                data: answer[i]
            };
            res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        }
        
        // Send sources with formatted citations
        if (response.sources && response.sources.length > 0) {
            const formattedSources = formatSources(response.sources);
            const sourcesChunk = {
                type: 'sources',
                sources: formattedSources
            };
            res.write(`data: ${JSON.stringify(sourcesChunk)}\n\n`);
        }
        
        // Send completion signal
        const doneChunk = { type: 'done' };
        res.write(`data: ${JSON.stringify(doneChunk)}\n\n`);
        
        // End the response
        res.end();
        
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
            
            // Send error as SSE if headers already sent, otherwise use JSON
            if (res.headersSent) {
                const errorChunk = {
                    type: 'content',
                    data: `⚠️ Rate limit exceeded. Please try again in ${retrySeconds} seconds.`
                };
                res.write(`data: ${JSON.stringify(errorChunk)}\n\n`);
                res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
                res.end();
            } else {
                res.setHeader('Retry-After', String(retrySeconds));
                return res.status(503).json({ error: 'Rate limit / quota exceeded', retry_after: retrySeconds });
            }
        } else {
            // Send generic error
            if (res.headersSent) {
                const errorChunk = {
                    type: 'content',
                    data: 'Error: Failed to get response. Please try again.'
                };
                res.write(`data: ${JSON.stringify(errorChunk)}\n\n`);
                res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
                res.end();
            } else {
                res.status(500).json({ error: 'AI Error' });
            }
        }
    }
});

export default router;
