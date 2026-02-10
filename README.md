<p align="center">
  <img src="https://img.shields.io/badge/OpsMind-AI-blue?style=for-the-badge&logo=openai&logoColor=white" alt="OpsMind AI"/>
</p>

<h1 align="center">🧠 OpsMind AI</h1>

<p align="center">
  <strong>Enterprise Retrieval-Augmented Generation (RAG) Platform</strong><br/>
  <em>Intelligent Knowledge Retrieval for Enterprise Documentation</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-v20+-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Google-Gemini-4285F4?style=flat-square&logo=google&logoColor=white" alt="Gemini"/>
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Production%20Ready-success?style=flat-square" alt="Status"/>
  <img src="https://img.shields.io/badge/License-Proprietary-red?style=flat-square" alt="License"/>
</p>

---

> **Project 1 submission for Infotact Solutions.**  
> Proprietary codebase – all rights reserved © 2026 Infotact Solutions.  
> This repository is private, non-collaborative, and not intended for public redistribution.

---

## 📖 Overview

**OpsMind AI** is a production-ready Enterprise RAG system designed to ingest, understand, and retrieve information from complex PDF documentation (SOPs, HR Policies, Technical Manuals) with high accuracy and full citation support.

Unlike standard chatbots, OpsMind leverages **MongoDB Atlas Vector Search** and **Google Gemini** to provide grounded, context-aware answers that minimize hallucinations by citing specific sources and page numbers.

---

## 🚀 Live Demo

| Service | URL |
|---------|-----|
| **Backend API** | [https://opsmind-backend-ooky.onrender.com/health](https://opsmind-backend-ooky.onrender.com/health) |
| **Frontend** | *Deployed on Vercel/Netlify* |

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| **📄 Smart PDF Ingestion** | Parses PDFs, splits into semantic chunks (1000 chars with 200 overlap), generates 3072-dimensional embeddings |
| **🔍 Vector Search** | MongoDB Atlas `$vectorSearch` for high-precision semantic retrieval |
| **🤖 Agentic AI** | Google Gemini 1.5 with conversation history and tool-calling capabilities |
| **⚡ Real-time Streaming** | Server-Sent Events (SSE) for instant character-by-character response delivery |
| **📚 Source Citations** | Every answer includes document name, page number, and relevance score |
| **🛡️ Hallucination Guard** | Relevance threshold filtering (0.35+) prevents low-quality responses |
| **📤 Async Processing** | BullMQ-powered queue system for background PDF ingestion |
| **🔐 Authentication** | Clerk integration for secure user management |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              USER BROWSER                                │
│                           (localhost / Web)                              │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         NGINX (Port 80)                                  │
│                     React SPA + API Proxy                                │
│                 /api/* → Express Backend                                 │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    EXPRESS SERVER (Port 5000)                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │   /chat (SSE)   │  │    /upload      │  │      /health            │  │
│  │  POST → Stream  │  │  POST → Queue   │  │   GET → Status          │  │
│  └────────┬────────┘  └────────┬────────┘  └─────────────────────────┘  │
└───────────┼────────────────────┼────────────────────────────────────────┘
            │                    │
            │                    ▼
            │         ┌─────────────────────┐
            │         │  BULLMQ + REDIS     │
            │         │  (PDF Processing)   │
            │         └──────────┬──────────┘
            │                    │
            ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           AI ENGINE                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │   query.ts      │  │   ingest.ts     │  │      tools.ts           │  │
│  │  Vector Search  │  │  PDF → Chunks   │  │   Agentic Functions     │  │
│  └────────┬────────┘  └────────┬────────┘  └─────────────────────────┘  │
└───────────┼────────────────────┼────────────────────────────────────────┘
            │                    │
            ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    MONGODB ATLAS                                         │
│           ┌────────────────────────────────────┐                         │
│           │      DocumentChunks Collection     │                         │
│           │  • content (text)                  │                         │
│           │  • vectorEmbedding (3072-dim)      │                         │
│           │  • metadata (sourceFile, page#)    │                         │
│           │  • vector_index (cosine)           │                         │
│           └────────────────────────────────────┘                         │
└─────────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        GOOGLE GEMINI API                                 │
│  ┌────────────────────────┐  ┌────────────────────────────────────────┐ │
│  │ gemini-embedding-001   │  │        gemini-2.0-flash                │ │
│  │   (3072-dim vectors)   │  │    (LLM Response Generation)           │ │
│  └────────────────────────┘  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Core Technologies

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18, Vite, TailwindCSS 4 | Modern reactive UI with utility-first styling |
| **Backend** | Node.js 20, Express, TypeScript | Type-safe REST API with SSE streaming |
| **AI Engine** | LangChain, Google Gemini | RAG orchestration and LLM integration |
| **Database** | MongoDB Atlas | Document storage with native vector search |
| **Queue** | BullMQ, Redis | Async job processing for PDF ingestion |
| **Auth** | Clerk | User authentication and session management |
| **DevOps** | Docker, GitHub Actions | Containerization and CI/CD pipeline |

### Dependencies Breakdown

<details>
<summary><strong>AI Engine</strong></summary>

```json
{
  "@google/generative-ai": "^0.24.1",
  "@langchain/google-genai": "^2.1.13",
  "@langchain/community": "^1.1.7",
  "@langchain/textsplitters": "^1.0.1",
  "mongoose": "^9.1.5",
  "pdf-parse": "^1.1.1"
}
```
</details>

<details>
<summary><strong>Server</strong></summary>

```json
{
  "express": "^4.18.2",
  "bullmq": "^5.67.3",
  "ioredis": "^5.9.2",
  "multer": "^1.4.4",
  "mongoose": "^9.1.6",
  "cors": "^2.8.6"
}
```
</details>

<details>
<summary><strong>Client</strong></summary>

```json
{
  "react": "^18.2.0",
  "@clerk/clerk-react": "^5.60.0",
  "react-markdown": "^10.1.0",
  "highlight.js": "^11.11.1",
  "tailwindcss": "^4.1.9",
  "lucide-react": "^0.454.0"
}
```
</details>

---

## 📂 Project Structure

```bash
opsmind-ai/
├── 📁 ai-engine/                    # Core RAG & AI Logic
│   ├── src/
│   │   ├── index.ts                 # Module exports
│   │   ├── ingest.ts                # PDF parsing & embedding generation
│   │   ├── query.ts                 # Vector search & LLM orchestration
│   │   ├── tools.ts                 # Agentic tool definitions
│   │   ├── types.ts                 # Shared TypeScript interfaces
│   │   └── models/
│   │       └── DocumentChunk.ts     # MongoDB schema
│   ├── mongo_vector_index.json      # Atlas vector index config
│   └── package.json
│
├── 📁 server/                       # Express REST API
│   ├── src/
│   │   ├── index.ts                 # Server entrypoint & middleware
│   │   ├── routes/
│   │   │   └── chat.ts              # SSE chat endpoint
│   │   └── queue/
│   │       └── ingestionQueue.ts    # BullMQ worker setup
│   ├── uploads/                     # PDF upload storage
│   ├── Dockerfile
│   └── package.json
│
├── 📁 client/                       # React Frontend
│   ├── src/
│   │   ├── App.tsx                  # Main chat interface
│   │   ├── main.tsx                 # React entrypoint
│   │   ├── Hooks/
│   │   │   ├── UseChatSSE.ts        # SSE streaming hook
│   │   │   └── UseHistory.ts        # Chat history management
│   │   ├── Types/
│   │   │   └── Chat.ts              # Message & Source types
│   │   ├── Context/
│   │   │   └── ThemeContext.tsx     # Dark/light theme
│   │   └── pages/
│   │       └── Login.tsx            # Clerk authentication
│   ├── nginx.conf                   # Production proxy config
│   ├── Dockerfile
│   └── package.json
│
├── 📁 docs/                         # Source PDFs for ingestion
├── 📁 internal-docs/                # Development documentation
│   ├── DEPLOYMENT.md
│   ├── QUICK_REFERENCE.md
│   └── GAP_ANALYSIS_REPORT.md
│
├── 📁 .github/
│   └── workflows/
│       └── ci.yml                   # CI/CD pipeline
│
├── docker-compose.yml               # Multi-container orchestration
├── .env.example                     # Environment template
├── package.json                     # Root workspace scripts
└── README.md
```

---

## ⚡ Getting Started

### Prerequisites

- **Node.js** v18+ (v20 recommended)
- **MongoDB Atlas** cluster with Vector Search enabled
- **Google AI Studio** API key ([Get one here](https://ai.google.dev/))
- **Redis** (optional, for queue system)
- **Docker** (optional, for containerized deployment)

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/omdarshan-4964/opsmind-ai.git
cd opsmind-ai

# 2. Install all dependencies
npm run install-all

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your credentials

# 4. Start development servers
npm run dev --prefix server    # Terminal 1: Backend (Port 5000)
npm run dev --prefix client    # Terminal 2: Frontend (Port 5173)
```

### Environment Configuration

Create a `.env` file in the root directory:

```ini
# ========================================
# Google AI API Key (REQUIRED)
# ========================================
GOOGLE_API_KEY=your_google_api_key_here

# ========================================
# MongoDB Configuration
# ========================================
# For Local Development
MONGODB_URI=mongodb://localhost:27017/opsmind

# For MongoDB Atlas (Production)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/opsmind

# ========================================
# Server Configuration
# ========================================
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# ========================================
# Redis Configuration (for BullMQ)
# ========================================
REDIS_HOST=localhost
REDIS_PORT=6379

# ========================================
# Client Configuration
# ========================================
VITE_API_URL=http://localhost:5000
```

### MongoDB Atlas Vector Index Setup

Create a vector search index in MongoDB Atlas with this configuration:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "vectorEmbedding",
      "numDimensions": 3072,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "metadata.sourceFile"
    }
  ]
}
```

**Index Name:** `vector_index`  
**Collection:** `documentchunks`

---

## 📄 Document Ingestion

### CLI Ingestion

```bash
# Navigate to AI engine
cd ai-engine

# Ingest a single PDF
npx ts-node src/ingest.ts "../docs/HR-Policy.pdf"

# Ingest from docs folder
npx ts-node src/ingest.ts "../docs/Company-Handbook.pdf"
```

### API Upload (with Queue)

```bash
# Upload PDF via API (processes in background)
curl -X POST http://localhost:5000/upload \
  -F "file=@./docs/Employee-Guide.pdf"

# Response:
# {
#   "status": "queued",
#   "message": "PDF processing started in background",
#   "originalName": "Employee-Guide.pdf"
# }
```

---

## 🐳 Docker Deployment

### Quick Deploy

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Services & Ports

| Service | Container | Port | URL |
|---------|-----------|------|-----|
| Frontend | opsmind-client | 80 | http://localhost |
| Backend | opsmind-server | 5000 | http://localhost:5000 |
| MongoDB | opsmind-mongo | 27017 | mongodb://localhost:27017 |
| API Proxy | nginx | 80 | http://localhost/api/* |

### Docker Commands Reference

```bash
# Rebuild specific service
docker-compose build server

# View container status
docker-compose ps

# Enter container shell
docker exec -it opsmind-server sh

# Clean slate restart
docker-compose down -v
docker-compose up --build
```

---

## 🔌 API Reference

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "db": "connected"
}
```

### Chat (SSE Streaming)

```http
POST /chat
Content-Type: application/json

{
  "message": "What is the company leave policy?",
  "history": []
}
```

**SSE Response Stream:**
```
data: {"type":"content","data":"T"}
data: {"type":"content","data":"h"}
data: {"type":"content","data":"e"}
...
data: {"type":"sources","sources":[{"title":"HR-Policy.pdf","reference":"Page 12 (Relevance: 87.3%)"}]}
data: {"type":"done"}
```

### Upload PDF

```http
POST /upload
Content-Type: multipart/form-data

file: [PDF File]
```

**Response:**
```json
{
  "status": "queued",
  "message": "PDF processing started in background",
  "originalName": "document.pdf",
  "fileName": "1707558000000-123456789.pdf"
}
```

---

## 🧪 Testing

### Manual API Testing

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test chat endpoint
curl -X POST http://localhost:5000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the leave policy?", "history": []}'

# Test through Nginx proxy (Docker)
curl -X POST http://localhost/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "history": []}'
```

### AI Engine Tests

```bash
cd ai-engine

# Test connectivity
npx ts-node src/test-connectivity.ts

# Test RAG pipeline
npx ts-node src/test-rag.ts

# Test vector search only
npx ts-node src/test-vector-only.ts

# Test agentic capabilities
npx ts-node src/test-agentic.ts
```

---

## 📚 Internal Documentation

| Document | Description |
|----------|-------------|
| [DEPLOYMENT.md](internal-docs/DEPLOYMENT.md) | Production deployment guide |
| [QUICK_REFERENCE.md](internal-docs/QUICK_REFERENCE.md) | Command cheat sheet |
| [DOCKER_README.md](internal-docs/DOCKER_README.md) | Docker-specific instructions |
| [GAP_ANALYSIS_REPORT.md](internal-docs/GAP_ANALYSIS_REPORT.md) | Technical audit & fixes |
| [TEST_SETUP.md](internal-docs/TEST_SETUP.md) | Testing environment setup |

---

## 🛡️ Security Considerations

- **API Keys:** Never commit `.env` files. Use environment variables in production.
- **CORS:** Configure `CLIENT_URL` to restrict origins in production.
- **File Uploads:** Only PDF files are accepted (50MB max).
- **Rate Limiting:** Gemini API has quota limits; ingestion includes delay safeguards.
- **Authentication:** Clerk handles user sessions securely.

---

## 🔧 Troubleshooting

<details>
<summary><strong>MongoDB Connection Failed</strong></summary>

```bash
# Check if MongoDB is running
docker-compose logs mongo

# Verify connection string
echo $MONGODB_URI

# Test direct connection
mongosh "mongodb://localhost:27017/opsmind"
```
</details>

<details>
<summary><strong>Vector Search Returns Empty</strong></summary>

1. Verify vector index exists in MongoDB Atlas
2. Check index name matches `vector_index`
3. Ensure documents have been ingested
4. Verify embedding dimensions (3072)
</details>

<details>
<summary><strong>Port Already in Use</strong></summary>

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <pid> /F

# Docker: Use different port
# Edit docker-compose.yml:
ports:
  - "8080:80"
```
</details>

<details>
<summary><strong>Rate Limit Errors</strong></summary>

The Gemini free tier limits to 15 requests/minute. Ingestion includes a 4-second delay between chunks. Consider upgrading to a paid tier for production use.
</details>

---

## 👥 The Team

| Role | Name |
|------|------|
| **Lead Architect & AI Core** | Omdarshan Shinde Patil |
| **Backend Engineering** | Sai |
| **Frontend Engineering** | Harshawardhan Reddy |
| **Data Strategy** | Santosh |

---

## 📜 License

**Proprietary & Confidential**

© 2026 Infotact Solutions. All rights reserved.

This software is the exclusive property of Infotact Solutions. Unauthorized copying, distribution, modification, or use of this software, via any medium, is strictly prohibited without prior written consent.

---

<p align="center">
  <strong>Built with ❤️ by Infotact Solutions</strong><br/>
  <em>Empowering Enterprises with Intelligent Knowledge Retrieval</em>
</p>
