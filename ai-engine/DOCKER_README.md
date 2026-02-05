# 🐳 OpsMind AI Engine - Docker Setup Guide

## For the Team: Quick Start

This Docker setup ensures everyone can run the AI Engine with **zero Node version conflicts**.

### Prerequisites

- Docker Desktop installed ([Download here](https://www.docker.com/products/docker-desktop/))
- `.env` file with required variables (see below)

### 🚀 Quick Start (3 Steps)

1. **Clone the repo and navigate to project root:**
   ```bash
   cd opsmind-ai
   ```

2. **Create `.env` file in the root directory:**
   ```bash
   # Copy this template
   MONGODB_URI=mongodb+srv://your-connection-string
   GOOGLE_API_KEY=your-google-api-key
   ```

3. **Start the AI Engine:**
   ```bash
   docker-compose up -d ai-engine
   ```

   That's it! The AI Engine is now running in a container.

### 📝 Common Commands

```bash
# View logs
docker-compose logs -f ai-engine

# Stop the engine
docker-compose down

# Rebuild after code changes
docker-compose up -d --build ai-engine

# Run a test inside the container
docker-compose exec ai-engine npx ts-node src/test-rag.ts

# Access container shell
docker-compose exec ai-engine sh
```

### 🔧 Running Tests

```bash
# Test vector search
docker-compose exec ai-engine npx ts-node src/test-vector-only.ts

# Test RAG system
docker-compose exec ai-engine npx ts-node src/test-rag.ts

# Test connectivity
docker-compose exec ai-engine npx ts-node src/test-connectivity.ts
```

### 📦 Ingesting Documents

```bash
# Ingest a PDF document
docker-compose exec ai-engine npx ts-node src/ingest.ts "../docs/your-policy.pdf"
```

### 🛠️ Development Workflow

1. **Make changes to source code** (files in `ai-engine/src/`)
2. **Changes are auto-synced** to container (via volume mount)
3. **Restart container** if needed:
   ```bash
   docker-compose restart ai-engine
   ```

### 🔍 Troubleshooting

**Problem: Container won't start**
```bash
# Check logs
docker-compose logs ai-engine

# Rebuild from scratch
docker-compose down
docker-compose up -d --build ai-engine
```

**Problem: MongoDB connection fails**
- Ensure your MongoDB Atlas allows connections from `0.0.0.0/0` (Docker uses different IPs)
- Check if `MONGODB_URI` in `.env` is correct

**Problem: Node version issues**
- This is exactly why we use Docker! The container uses Node 20 LTS regardless of your local version.

### 📋 Environment Variables

Required in `.env` file:

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/` |
| `GOOGLE_API_KEY` | Google Gemini API key | `AIza...` |

### 🎯 For Backend Team Integration

The AI Engine exports these functions for your use:

```typescript
import { askAgenticAI, ChatMessage, AgentResponse } from '../ai-engine/src';

// Example usage
const response: AgentResponse = await askAgenticAI({
  question: "How many sick days do I have?",
  history: [
    { role: 'user', content: 'Hello', timestamp: '...' },
    { role: 'assistant', content: 'Hi there!', timestamp: '...' }
  ],
  userId: 'user123'
});

console.log(response.answer);
console.log(response.sources);
console.log(response.toolsCalled);
```

See `src/types.ts` for complete type definitions.

### 📚 Architecture

```
┌─────────────────────────────────────────┐
│         Docker Container (Node 20)       │
│  ┌────────────────────────────────────┐ │
│  │       AI Engine (TypeScript)       │ │
│  │  - Vector Search (text-embed-004)  │ │
│  │  - Agentic Logic with Memory       │ │
│  │  - Tool Calling (checkLeaveBalance)│ │
│  │  - Fallback on Quota Limit         │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
           ↓                    ↓
   MongoDB Atlas         Google Gemini API
   (Vector Search)       (Embeddings + Chat)
```

### 🔄 Updating Dependencies

```bash
# Update package.json, then rebuild
docker-compose down
docker-compose build --no-cache ai-engine
docker-compose up -d ai-engine
```

### 🎓 Next Steps

1. **Test the setup:** Run `docker-compose exec ai-engine npx ts-node src/test-vector-only.ts`
2. **Ingest your documents:** Use the ingest command above
3. **Integrate with backend:** Import types and functions from `ai-engine/src`

### 📞 Need Help?

Contact the Lead Architect or check the [AUDIT_REPORT.md](../AUDIT_REPORT.md) for system status.

---

Built with ❤️ by the OpsMind AI Team
