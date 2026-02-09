# 🔍 OpsMind AI - Gap Analysis Report
**Date:** February 9, 2026  
**Auditor:** Lead AI Architect  
**Project:** OpsMind AI (Q4 Product Roadmap - Project 1)

---

## 📋 Executive Summary

**Build Status:** ❌ FAILING  
**Demo Status:** ❌ BROKEN  
**Spec Compliance:** 🟡 PARTIAL (60%)

**Critical Finding:** The application has a **fundamental client-server mismatch** causing the "Failed to get response" error. Client expects Server-Sent Events (SSE) streaming, but server returns plain JSON.

---

## 🚨 CRITICAL FAILURES (Must Fix for Working Demo)

### 1. ❌ **Client-Server Protocol Mismatch (BLOCKER)**
**Status:** BROKEN - Prevents entire app from working  
**Location:** `server/src/routes/chat.ts` ↔️ `client/src/Hooks/UseChatSSE.ts`

**Problem:**
- Client expects SSE streaming format: `data: {"type":"content","data":"..."}\n\n`
- Server sends plain JSON: `{ answer: "...", sources: [...] }`
- Client's SSE parser fails → shows "Failed to get response"

**Evidence:**
```typescript
// client/src/Hooks/UseChatSSE.ts (Line 52-80)
const response = await fetch('/api/chat', { method: 'POST' })
const reader = response.body?.getReader() // ❌ Expects SSE stream
while (true) {
  const chunk = decoder.decode(value)
  if (line.startsWith('data: ')) { // ❌ Server doesn't send this format
    const data = JSON.parse(line.slice(6))
  }
}

// server/src/routes/chat.ts (Line 24)
res.json({ answer: response.answer, sources: response.sources }); // ❌ Plain JSON
```

**Impact:** **100% of user queries fail**

---

### 2. ❌ **Missing Citations with Filename & Page Number**
**Status:** BROKEN - Spec requirement not met  
**Location:** `ai-engine/src/query.ts` (Line 76-79)

**Problem:**
- Sources only return `content` and `score`
- Metadata (sourceFile, pageNumber) is stored in DB but NOT included in query results
- Client expects `{ title, reference }` format for display

**Current Implementation:**
```typescript
// ai-engine/src/query.ts (Line 76-79)
const sources = results.map((doc: any) => ({
    content: doc.content,  // ✅ Has content
    score: doc.score,      // ✅ Has relevance score
    // ❌ MISSING: metadata.sourceFile
    // ❌ MISSING: metadata.pageNumber
}));
```

**Database Schema (CORRECT):**
```typescript
// ai-engine/src/models/DocumentChunk.ts (Line 6-8)
metadata: {
    sourceFile: string;   // ✅ Stored correctly
    pageNumber: number;   // ✅ Stored correctly
}
```

**Required Fix:** Add metadata to `$project` stage in aggregation pipeline

**Impact:** Citations shown in PR demo video will be fake/missing

---

### 3. ❌ **Empty ingestion/ and retrieval/ Folders**
**Status:** MISLEADING - Folders exist but contain no code  
**Location:** `ai-engine/src/ingestion/` and `ai-engine/src/retrieval/`

**Problem:**
- Workspace structure shows `ingestion/` and `retrieval/` folders
- Both folders are **completely empty**
- Actual code is in flat files: `ingest.ts`, `query.ts`
- Confusing for code reviewers and violates modular architecture

**Impact:** Low (cosmetic), but shows poor project organization

---

## 📝 MISSING SPEC FEATURES

### 4. ❌ **BullMQ Queue System (Required by Spec)**
**Status:** NOT IMPLEMENTED  
**Expected:** Queue-based PDF ingestion for async processing

**Spec Requirements:**
> "Tech Stack: MERN + BullMQ (Queues) + MongoDB Vector Search"

**Current Implementation:**
- Direct synchronous PDF ingestion in `ingest.ts`
- No queue management
- No job status tracking
- No retry mechanism for failed ingestions

**Evidence:**
```bash
# Searched entire codebase
$ grep -r "BullMQ\|bullmq" .
# Result: 0 matches (not installed or used)
```

**Impact:** 
- ❌ Cannot handle multiple PDFs concurrently
- ❌ Server blocks during 4-second rate-limit delays (Line 52: `setTimeout(4000)`)
- ❌ No way to show "PDF Processing: 45% Complete" UI

---

### 5. 🟡 **Hallucination Guardrail (Partially Implemented)**
**Status:** WEAK - Basic refusal exists but not strict enough  
**Location:** `ai-engine/src/query.ts` (Line 81-96)

**Current Implementation:**
```typescript
if (!results || results.length === 0) {
    return {
        answer: "I couldn't find any relevant information in the uploaded documents.",
        sources: [],
    };
}
```

**Problems:**
- ✅ Refuses when **no documents found**
- ❌ Doesn't refuse when **no documents uploaded yet**
- ❌ Doesn't refuse when **low relevance score** (e.g., score < 0.3)
- ❌ AI can still hallucinate from low-quality matches

**Spec Requirement:**
> "The system must explicitly refuse to answer if the context is missing"

**Recommendation:** Add relevance threshold check (e.g., `if (doc.score < 0.4) return "Context not sufficient"`)

---

## 🔨 CI/CD BUILD FAILURES

### 6. ❌ **Docker Build Failure (Fixed but not verified)**
**Status:** RECENTLY FIXED - Needs CI validation  
**Last Commit:** `d382fda` - "fix: Update Docker build context"

**Problem (Resolved):**
- Server Dockerfile couldn't find `ai-engine` dependencies
- Build context was `./server` instead of `.` (project root)

**Current Status:** 
- ✅ Dockerfiles updated
- ✅ CI workflow updated
- ⏳ **Awaiting GitHub Actions to confirm green build**

---

### 7. ⚠️ **TypeScript Build Warnings**
**Status:** NON-BLOCKING but risky  
**Location:** `ai-engine/src/models/DocumentChunk.ts` (Line 1)

```typescript
// @ts-nocheck  // ❌ Disables TypeScript everywhere in file
```

**Problem:** 
- Silences all type errors instead of fixing them
- Could hide real bugs in production

**Impact:** Low priority, but should be fixed after critical issues

---

## ✅ WHAT'S WORKING CORRECTLY

✅ **RAG Pipeline Architecture**
- ✅ PDF parsing with PDFLoader
- ✅ 1000-char chunks with 200 overlap (spec: 1000 chars ✓)
- ✅ MongoDB vector storage
- ✅ Google Gemini embeddings (text-embedding-004)

✅ **Vector Search**
- ✅ MongoDB Atlas `$vectorSearch` pipeline
- ✅ Retrieves top 3 relevant chunks
- ✅ Returns relevance scores

✅ **Conversation History**
- ✅ Client sends history array
- ✅ AI Engine uses last 5 messages for context

✅ **Infrastructure**
- ✅ Docker Compose setup
- ✅ GitHub Actions CI/CD (5 jobs)
- ✅ CORS configured for cross-origin requests

---

## 🎯 IMMEDIATE ACTION PLAN (5 Critical Fixes)

### **Fix #1: Convert Server to SSE Streaming** ⏱️ 20 mins
**Priority:** 🔴 CRITICAL (Blocker for demo)  
**File:** `server/src/routes/chat.ts`

**Required Changes:**
```typescript
// Replace res.json() with SSE streaming
router.post('/chat', async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    const response = await askAgenticAI({ question, history });
    
    // Stream answer character by character
    for (const char of response.answer) {
        res.write(`data: ${JSON.stringify({ type: 'content', data: char })}\n\n`);
    }
    
    // Send sources
    res.write(`data: ${JSON.stringify({ type: 'sources', sources: formatSources(response.sources) })}\n\n`);
    
    // Send done signal
    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();
});
```

**Validation:** Run client → send message → should see streaming text

---

### **Fix #2: Add Citations with Filename & Page Number** ⏱️ 10 mins
**Priority:** 🔴 CRITICAL (Required by spec)  
**File:** `ai-engine/src/query.ts`

**Required Changes:**
```typescript
// Line 64-70: Update $project stage
{
    $project: {
        _id: 0,
        content: 1,
        score: { $meta: "vectorSearchScore" },
        metadata: 1,  // ⭐ ADD THIS LINE
    },
}

// Line 76-81: Update sources mapping
const sources = results.map((doc: any) => ({
    content: doc.content,
    score: doc.score,
    metadata: doc.metadata,  // ⭐ ADD THIS LINE
}));
```

**Then update server route to format sources:**
```typescript
function formatSources(sources: any[]) {
    return sources.map(s => ({
        title: s.metadata.sourceFile,
        reference: `Page ${s.metadata.pageNumber} (Relevance: ${(s.score * 100).toFixed(1)}%)`
    }));
}
```

**Validation:** Sources should show "HR_Policy.pdf - Page 5"

---

### **Fix #3: Add Hallucination Guardrail with Score Threshold** ⏱️ 5 mins
**Priority:** 🟡 MEDIUM (Spec compliance)  
**File:** `ai-engine/src/query.ts`

**Required Changes:**
```typescript
// Line 74: After getting results, add threshold check
const results = await DocumentChunkModel.aggregate(pipeline);

// ⭐ ADD THESE LINES
const RELEVANCE_THRESHOLD = 0.35; // Tune based on testing
const relevantResults = results.filter((doc: any) => doc.score >= RELEVANCE_THRESHOLD);

if (!relevantResults || relevantResults.length === 0) {
    return {
        answer: "I don't have enough relevant context to answer this question accurately. Please ensure you've uploaded the relevant documents or rephrase your question.",
        sources: [],
        // ... rest of response
    };
}

// Use relevantResults instead of results for the rest
```

**Validation:** Ask unrelated question → AI should refuse to answer

---

### **Fix #4: Remove @ts-nocheck from DocumentChunk.ts** ⏱️ 2 mins
**Priority:** 🟢 LOW (Code quality)  
**File:** `ai-engine/src/models/DocumentChunk.ts`

**Required Changes:**
```typescript
// Line 1: Remove this line
// @ts-nocheck  // ❌ DELETE THIS

// If TypeScript errors appear, fix them properly instead of suppressing
```

---

### **Fix #5: Organize Code into ingestion/ and retrieval/ Folders** ⏱️ 5 mins
**Priority:** 🟢 LOW (Organization)  
**Action:** Move files to proper folders

```bash
# Move ingestion code
mv ai-engine/src/ingest.ts ai-engine/src/ingestion/ingest.ts

# Move retrieval code  
mv ai-engine/src/query.ts ai-engine/src/retrieval/query.ts

# Update imports in server/src/routes/chat.ts
```

**Note:** This is cosmetic but improves maintainability

---

## 📊 Spec Compliance Scorecard

| Requirement | Status | Notes |
|------------|--------|-------|
| ✅ RAG Pipeline | PASS | 1000-char chunks with overlap |
| ❌ Precision Citations | **FAIL** | Metadata not returned in queries |
| 🟡 Hallucination Guardrail | PARTIAL | Basic refusal, needs score threshold |
| ❌ BullMQ Queues | **FAIL** | Not implemented |
| ✅ MERN Stack | PASS | MongoDB, Express, React, Node |
| ✅ MongoDB Vector Search | PASS | Using Atlas $vectorSearch |
| ❌ Working Demo | **FAIL** | Client-server protocol mismatch |

**Overall Score:** 4/7 (57%) 🔴

---

## 🎬 Demo Video Checklist

Before recording the demo video, ensure these work:

- [ ] User can type a question and see **streaming response**
- [ ] Sources appear below answer with **filename and page number**
- [ ] Ask unrelated question → AI **refuses to answer** (guardrail)
- [ ] Upload a new PDF → show **processing confirmation**
- [ ] Ask question about newly uploaded PDF → AI **answers correctly**
- [ ] Check conversation history → follow-up questions **use context**

---

## 🚀 Next Steps

1. **Immediate (Today):**
   - Fix #1: SSE Streaming (server/routes/chat.ts)
   - Fix #2: Citations (ai-engine/query.ts)
   - Test locally → Verify demo works

2. **Short-term (This Week):**
   - Fix #3: Hallucination guardrail
   - Add BullMQ for async PDF processing
   - Remove @ts-nocheck

3. **Before Submission:**
   - Record demo video showing all features
   - Verify all CI/CD jobs pass (green builds)
   - Update README with setup instructions

---

## 📞 Questions for Product Owner

1. **BullMQ:** Is async queue processing required for MVP, or can we defer to v2?
2. **Citations:** Should we show relevance score percentage to users?
3. **Streaming:** Character-by-character or token-by-token streaming?

---

**Report Generated:** February 9, 2026  
**Next Audit:** After critical fixes are implemented
