# Usage for Backend Integration

This guide explains how to import and use the AI Engine's `askAI` function in your Express backend.

## Prerequisites

Ensure your backend has the necessary environment variables set in its `.env` file:

```env
MONGODB_URI=your_mongodb_connection_string
GOOGLE_API_KEY=your_gemini_api_key
```

## Import

You can import the `askAI` function from the `ai-engine` package (assuming it's a local dependency or part of the monorepo workspace).

```typescript
import { askAI } from '../../ai-engine/src'; // Adjust path as needed
```

## Usage

The `askAI` function handles the entire RAG pipeline:
1.  Generates an embedding for the question.
2.  Searches MongoDB for relevant document chunks.
3.  Generates an answer using Gemini with the retrieved context.

### Example in an Express Route

```typescript
import express from 'express';
import { askAI } from '../../ai-engine/src';

const router = express.Router();

router.post('/chat', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const answer = await askAI(question);

    res.json({ answer });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ error: 'Failed to generate answer' });
  }
});

export default router;
```

## Notes

-   **Database Connection**: The `askAI` function assumes that a MongoDB connection is already established via Mongoose. If your backend connects to MongoDB globally (which it likely does), this will work out of the box.
-   **Error Handling**: Wrap calls in `try/catch` blocks to handle potential API or database errors.
