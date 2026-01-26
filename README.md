# 🧠 OpsMind AI: Enterprise RAG System

> **An Intelligent Knowledge Retrieval Engine for Enterprise Documentation**

OpsMind AI is an **Enterprise Retrieval-Augmented Generation (RAG)** platform designed to ingest, understand, and retrieve information from complex PDF documentation (SOPs, HR Policies, Technical Manuals) with high accuracy.

Unlike standard chatbots, OpsMind uses **Vector Search** and **Gemini 1.5 Flash** to provide grounded answers with citations, eliminating hallucinations.

---

## 🚀 Tech Stack

* **Architecture:** Hybrid Monorepo (TypeScript)
* **AI Core:** Google Gemini 1.5 Flash (Embeddings + Generation)
* **Database:** MongoDB Atlas (Vector Search + Metadata Storage)
* **Backend:** Node.js + Express
* **Frontend:** React + Vite
* **Orchestration:** LangChain.js

---

## 📂 Project Structure

| Module | Path | Description |
| :--- | :--- | :--- |
| **AI Engine** | `/ai-engine` | **(Core)** Handles PDF ingestion, chunking, embedding generation, and vector storage. |
| **Server** | `/server` | REST API for frontend communication and file uploads. |
| **Client** | `/client` | React-based chat interface with streaming responses. |
| **Docs** | `/docs` | Storage for raw PDF documents used for training/ingestion. |

---

## ✨ Key Features (Phase 1)

* **Smart Ingestion Pipeline:**
    * Parses raw PDFs using `pdf-parse` (v1.1.1).
    * Splits text into context-aware chunks (1000 chars, 200 overlap).
* **Robust Vector Storage:**
    * Generates 768-dimension vectors using `embedding-001`.
    * Stores vectors + metadata in MongoDB.
* **Enterprise Reliability:**
    * **Auto-Retry Logic:** Automatically handles API Rate Limits (HTTP 429) with exponential backoff.
    * **Type Safety:** Strict TypeScript interfaces for data consistency.

---

## 🛠️ Setup & Installation

### 1. Prerequisites
* Node.js (v18+)
* MongoDB Atlas Cluster
* Google AI Studio API Key

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/omdarshan-4964/opsmind-ai.git

# Navigate to AI Engine
cd opsmind-ai/ai-engine

# Install dependencies
npm install
```

### 3. Environment Variables
Create a `.env` file in `/ai-engine`:

```ini
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/opsmind
GOOGLE_API_KEY=AIzaSy...
```

## 🧠 How to Run (Ingestion Engine)
We currently support command-line ingestion for testing the pipeline.

```bash
# Run the ingestion script on a target PDF
npx ts-node src/ingest.ts "../docs/Leave-and-Holiday-Policy.pdf"
```

Expected Output:

```text
🔌 Connecting to MongoDB Atlas...
✅ Connected.
📂 Loading PDF: ../docs/Leave-and-Holiday-Policy.pdf
✂️ Splitting text into chunks...
🧩 Created 12 chunks.
🧠 Generating Embeddings...
✅✅✅✅ (Progress)
🎉 Success! Ingested 12 vectors into MongoDB.
```

## 👥 The Team
* **Lead Architect & AI Core:** Omdarshan
* **Backend Engineering:** Sai
* **Frontend Engineering:** Harshawardhan
* **Data Strategy:** Santosh
