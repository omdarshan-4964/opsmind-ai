# 🧠 OpsMind AI: Enterprise RAG System

> **An Intelligent Knowledge Retrieval Engine for Enterprise Documentation**
>
> **Project 1 submission for Infotact Solutions.** Proprietary codebase – all rights reserved © 2026 Infotact Solutions. This repository is private, non‑collaborative, and not intended for public redistribution.

OpsMind AI is an **Enterprise Retrieval-Augmented Generation (RAG)** platform designed to ingest, understand, and retrieve information from complex PDF documentation (SOPs, HR Policies, Technical Manuals) with high accuracy.

Unlike standard chatbots, OpsMind uses **vector search over MongoDB Atlas** and **Google Gemini (Gemini 1.5 Flash + `models/gemini-embedding-001`)** to provide grounded answers with citations, minimizing hallucinations.

---

## 🚀 Tech Stack (Final Submission)

* **Architecture:** Hybrid monorepo (TypeScript)
* **AI Core:** Google Gemini 1.5 Flash + `models/gemini-embedding-001`
* **Vector DB:** MongoDB Atlas with vector search index (`vector_index`, 3072‑dim cosine)
* **Backend:** Node.js + Express + TypeScript (server)
* **AI Engine:** Node.js + TypeScript (ai-engine) for ingestion + RAG
* **Frontend:** React + Vite + TypeScript (client)
* **Orchestration:** LangChain.js for PDF loading & chunking
* **Containerization:** Docker + docker‑compose (mongo, server, client)

---

## 📂 Project Structure

| Module | Path | Description |
| :--- | :--- | :--- |
| **AI Engine** | `/ai-engine` | Core RAG logic – PDF ingestion, chunking, Gemini embeddings (3072‑dim), and vector storage. |
| **Server** | `/server` | Express API for chat, health, and uploads. Bridges frontend ↔ AI Engine. |
| **Client** | `/client` | React + Vite chat UI with SSE streaming and source citations. |
| **Docs** | `/docs` | Source PDF policies used for ingestion (e.g., Leave & Holiday Policy). |
| **Docker** | `/docker-compose.yml` + `*/Dockerfile` | Multi‑service deployment: MongoDB, server, client. |

---

## ✨ Key Features (Final Build)

* **Smart Ingestion Pipeline (ai-engine/ingest.ts):**
    * Parses PDFs using LangChain `PDFLoader`.
    * Splits text into semantic chunks (1000 chars, 200 overlap).
    * Generates 3072‑dim embeddings via `models/gemini-embedding-001`.
    * Persists `content`, `metadata.sourceFile`, `metadata.pageNumber`, and `vectorEmbedding` to MongoDB.
* **Vector Search & RAG (ai-engine/query.ts):**
    * Uses MongoDB Atlas `$vectorSearch` against `vector_index` (cosine similarity).
    * Applies relevance thresholding and returns top chunks as sources.
    * Calls Gemini for final, grounded answer generation with fallback.
* **SSE Streaming Chat (server + client):**
    * `/chat` endpoint streams tokens via **Server‑Sent Events**.
    * React client (`UseChatSSE.ts`) renders live responses and source cards.
* **Resilience & Fallbacks:**
    * When Gemini quota is hit, system returns raw policy text with clear warning.
    * Health endpoints and Docker healthchecks for mongo, server, and client.

---

## 🛠️ Setup & Installation (Local Dev)

### 1. Prerequisites
* Node.js **v18+**
* MongoDB Atlas cluster (or local MongoDB)
* Google AI Studio API key (Gemini)

### 2. Clone & Install
```bash
git clone https://github.com/omdarshan-4964/opsmind-ai.git
cd opsmind-ai

# Install root dependencies (if any)
npm install  # optional; main workspaces install inside each folder

# Install per module
cd ai-engine && npm install
cd ../server && npm install
cd ../client && npm install
```

### 3. Environment Variables

Use `.env.example` as reference. For local dev we use the same values across server and ai-engine:

```ini
# ai-engine/.env and server/.env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/opsmind
GOOGLE_API_KEY=AIzaSy...
PORT=5000   # server only
```

> ℹ️ For Docker compose, `MONGODB_URI` inside the container is overridden to `mongodb://mongo:27017/opsmind`.

### 4. Ingest Policies (RAG Index Build)

```bash
cd ai-engine

# Ingest sample HR policy (docs/Leave-and-Holiday-Policy.pdf)
npx ts-node src/ingest.ts "../docs/Leave-and-Holiday-Policy.pdf"
```

This:

- Connects to MongoDB
- Splits the policy into ~12 chunks
- Generates 3072‑dim Gemini embeddings
- Stores vectors + metadata in `opsmind.documentchunks`

Ensure MongoDB Atlas has a **vector search index** named `vector_index` on `vectorEmbedding` with `numDimensions: 3072` and `similarity: "cosine"`.

### 5. Run Backend & Frontend (Dev)

```bash
# Terminal 1 – server
cd server
npm run dev

# Terminal 2 – client
cd client
npm run dev
```

- Server runs on `http://localhost:5000` (Express + SSE)
- Client runs on `http://localhost:5173` (Vite dev server)

You can now chat with the assistant and ask questions like:

> "What is the sick leave policy?"

The system will retrieve relevant chunks and answer with citations.

### 6. Dockerized Run (Optional)

To run the full stack with Docker (Mongo + server + client):

```bash
# From repo root
docker compose up --build
```

Services:

- `mongo` → MongoDB instance
- `server` → OpsMind backend on port **5000**
- `client` → Nginx‑served frontend on port **80**

Health checks are configured for all three services.

## 👥 The Team
* **Lead Architect & AI Core:** Omdarshan
* **Backend Engineering:** Sai
* **Frontend Engineering:** Harshawardhan
* **Data Strategy:** Santosh

---

## 🔒 Ownership & Usage

- This codebase is a **Project 1 submission for Infotact Solutions**.
- **All rights reserved © 2026 Infotact Solutions.**
- The repository is **private** and not intended for open‑source use or external collaboration.
- Any reuse, redistribution, or modification outside Infotact requires explicit written approval from Infotact Solutions.
