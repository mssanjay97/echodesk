
1. System Overview


EchoDesk is an asynchronous, queue-based semantic search system over browser history using vector embeddings, designed for scalable ingestion, fast retrieval, and privacy-aware indexing.

It is a semantic browser history retrieval system that allows users to search previously visited web pages using natural language queries instead of URLs or titles.

Core idea:

Convert web pages → chunks → embeddings → vector search → semantic retrieval.


2. Key Design Goals


Functional Requirements:

Capture visited web pages automatically
Extract meaningful text from HTML
Store chunks as embeddings
Enable semantic search over history
Return top relevant pages



Non-Functional Requirements:

Low latency search (<500ms)
Async ingestion (non-blocking UX)
Horizontal scaling for workers & API
Deduplication of content
Privacy filtering of sensitive pages


3. High-Level Architecture


                    ┌────────────────────────┐
                    │   Chrome Extension     │
                    └──────────┬─────────────┘
                               │
                               ▼
                    ┌────────────────────────┐
                    │        NGINX           │
                    │   Load Balancer        │
                    └───────┬───────┬────────┘
                            │       │
        ┌───────────────────┘       └───────────────────┐
        ▼                                               ▼
┌──────────────────┐                         ┌──────────────────┐
│ Flask API Node 1 │                         │ Flask API Node 2 │
└─────────┬────────┘                         └─────────┬────────┘
          │                                           │
          └──────────────┬────────────────────────────┘
                         ▼
               ┌────────────────────┐
               │     Redis Queue    │
               └─────────┬──────────┘
                         ▼
        ┌──────────────┬──────────────┬──────────────┐
        ▼              ▼              ▼
  ┌──────────┐   ┌──────────┐   ┌──────────┐
  │ Worker 1 │   │ Worker 2 │   │ Worker 3 │
  └────┬─────┘   └────┬─────┘   └────┬─────┘
       │              │              │
       └──────────────┴──────────────┘
                      ▼
              ┌──────────────────┐
              │    ChromaDB      │
              └──────────────────┘



4. Data Flow (Step-by-Step)


1. Page Capture

Browser extension extracts:

document.documentElement.innerText

2. Sensitive Filtering

Blocks:

banking sites
email providers
healthcare portals
passwords, OTPs, keys

3. Send to Backend

POST /api/v1/content
{
  "url": "...",
  "htmlText": "...",
  "userId": "...",
  "timestamp": "..."
}

4. Queue Ingestion

Backend does NOT process immediately:

q.enqueue(ingestContent)

Why:

prevents request blocking, allows scaling workers, improves reliability

5. Worker Pipeline

HTML
 ↓
Clean text (BeautifulSoup)
 ↓
Chunking (500 tokens)
 ↓
Dedup (SHA256)
 ↓
Embedding (MiniLM)
 ↓
Store in ChromaDB

5. Storage Design

Each user has isolated collection:

history_<userId>

Benefits:

multi-tenant isolation
simplified query logic
no filtering overhead

6. Vector Search Design

Model:

all-MiniLM-L6-v2

Flow:

Query → embedding → nearest neighbors → top K chunks

7. Caching Layer

Redis cache:

Key: search:<userId>:<query_hash>
Value: top results
TTL: 1 hour

Reduces:

repeated vector DB hits
latency spikes

8. Scaling Strategy

Backend scaling
docker compose up --scale backend=3

NGINX distributes traffic.

Worker scaling
docker compose up --scale worker=5

Workers compete for Redis jobs.

9. Bottlenecks

Current bottleneck:
ChromaDB is single node
Impact:
limited throughput for large datasets

10. Improvements

Retrieval improvements:
hybrid search (keyword + vector)
reranking
recency boost
URL-level aggregation, query date wise, domain wise, URL wise.

Infra improvements:
Prometheus monitoring for metrics
health checks of containers
Redis cluster
distributed vector DB
Kubernetes for auto scaling 

Conceptual Improvements:
Refreshing a page quickly enables redundant processing as redis queue isnt searched for url

Architectural Improvements:
Add queue for embedding, separate from ingestion to parallelise embedding of multiple chunks of data for the same webpage
Incase of queue overflow, store request content in a separate file (simialr to cassandra) and retrive upon getting free

Security improvements:
rate limiting
giving option for user to opt out of storing, even domain level and for a specific url. 
option to delete stored history for user level, domain level, url level

11. Failure Handling

Component	Strategy
API	stateless, retry-safe
Worker,	retry via RQ
Redis,	queue persistence

12. Security Layer

domain blocking
sensitive pattern detection
private content filtering

