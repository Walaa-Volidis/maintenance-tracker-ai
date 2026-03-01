# Architecture Decision Records (ADR)

> This document captures the key technical decisions made during the design and development of the **AI-Powered Maintenance Request Tracker**, along with the context and rationale behind each choice.

---

## Table of Contents

1. [ADR-001: FastAPI as the Backend Framework](#adr-001-fastapi-as-the-backend-framework)
2. [ADR-002: Migration from SQLite to Neon PostgreSQL](#adr-002-migration-from-sqlite-to-neon-postgresql)
3. [ADR-003: Groq Cloud (Llama 3.3 70B) as the AI Provider](#adr-003-groq-cloud-llama-33-70b-as-the-ai-provider)
4. [ADR-004: Unified Monorepo Deployment on Vercel](#adr-004-unified-monorepo-deployment-on-vercel)

---

## ADR-001: FastAPI as the Backend Framework

**Status:** Accepted  
**Date:** 2025-02

### Context

The backend must serve a REST API consumed by a Next.js frontend, handle request validation, integrate with an external AI provider, and interact with a relational database. Candidates considered: **Flask**, **Django REST Framework**, and **FastAPI**.

### Decision

We selected **FastAPI** as the backend framework.

### Rationale

| Criterion | FastAPI Advantage |
|---|---|
| **Performance** | Built on Starlette and Uvicorn (ASGI), FastAPI delivers one of the highest request throughput rates among Python web frameworks — critical when each request triggers two sequential AI inference calls before responding. |
| **Type Safety & Validation** | Native integration with **Pydantic v2** means request bodies, response schemas, and environment configuration are all validated at runtime with Python type annotations. This eliminates an entire class of bugs where malformed data reaches the database or the AI prompt. |
| **Automatic API Documentation** | FastAPI generates interactive **Swagger UI** (`/docs`) and **ReDoc** (`/redoc`) documentation from the code itself — no manual upkeep required. This accelerated development and provides evaluators with instant API exploration. |
| **Dependency Injection** | The built-in `Depends()` system cleanly separates database session management from business logic, making the codebase testable (the test suite overrides `get_db` with an in-memory SQLite session). |
| **Modern Python Idioms** | FastAPI embraces `Mapped` type annotations, `enum.Enum` integration, and `async`-ready patterns that align with SQLAlchemy 2.x and Pydantic v2 conventions. |

### Alternatives Rejected

- **Flask**: Lacks built-in validation, dependency injection, and auto-generated docs. Would have required Flask-RESTful, Marshmallow, and Flask-Swagger as additional dependencies to reach feature parity.
- **Django REST Framework**: Powerful but opinionated — its ORM, migration system, and admin panel add significant overhead for a focused API service that only needs a handful of endpoints.

---

## ADR-002: Migration from SQLite to Neon PostgreSQL

**Status:** Accepted  
**Date:** 2025-02

### Context

The application was initially developed with **SQLite** for fast local iteration. However, deploying to **Vercel** (serverless functions) introduced a critical limitation: serverless environments use **ephemeral file systems** — any SQLite database file is destroyed after each function invocation. Data written by one request would not be visible to the next.

### Decision

Migrate the database layer from SQLite to **Neon PostgreSQL**, a serverless-native managed PostgreSQL service.

### Rationale

| Criterion | Neon PostgreSQL Advantage |
|---|---|
| **Serverless Compatibility** | Neon is accessed over a network connection (`postgresql://...`), not a local file. This makes it fully compatible with Vercel's stateless function model — every cold start connects to the same persistent database. |
| **Data Persistence** | All maintenance requests, AI-generated categories, and summaries survive deployments, function restarts, and scaling events. |
| **Scalability** | Neon scales compute and storage independently with automatic suspend-on-idle. The free tier supports up to 0.5 GB of storage, sufficient for this project while remaining cost-free. |
| **PostgreSQL Ecosystem** | Full access to PostgreSQL features (ENUM types, advanced aggregations, full-text search) and compatibility with SQLAlchemy 2.x without dialect-specific workarounds that SQLite often requires. |
| **Connection Pooling** | Neon's pooler endpoint (`-pooler` suffix) handles connection management, preventing the "too many connections" problem common in serverless architectures where each invocation opens a new connection. |

### Implementation Details

- The `database.py` module connects via `psycopg2-binary` with `sslmode=require`.
- `pool_pre_ping=True` and `pool_recycle=300` guard against stale connections after Neon's auto-suspend.
- A `SELECT 1` healthcheck on startup verifies connectivity before the application serves traffic.

### Trade-off Acknowledged

Local development now requires either a Neon account or a local PostgreSQL instance — the zero-config convenience of SQLite is lost. This is mitigated by the `.env.example` file documenting the required `DATABASE_URL` variable.

---

## ADR-003: Groq Cloud (Llama 3.3 70B) as the AI Provider

**Status:** Accepted  
**Date:** 2025-02

### Context

The application requires two AI capabilities per request:
1. **Classification** — categorize a free-text description into one of five maintenance categories.
2. **Summarization** — distill the description into a ≤10-word summary.

These operations execute synchronously in the request path, so **inference latency directly impacts user-perceived response time**. Providers evaluated: **OpenAI (GPT-4)**, **Google Gemini**, and **Groq Cloud**.

### Decision

Use **Groq Cloud** running the **Llama-3.3-70b-versatile** model.

### Rationale

| Criterion | Groq Advantage |
|---|---|
| **Inference Speed** | Groq's custom **LPU (Language Processing Unit)** hardware delivers tokens at ~280 tok/s for Llama 3.3 70B — roughly 5–10× faster than GPU-based providers for the same model size. This keeps the two sequential AI calls under 500ms combined. |
| **Model Quality** | Llama 3.3 70B is a state-of-the-art open model that handles the classification task with near-perfect accuracy, including multilingual (Arabic) input. Its instruction-following capability ensures reliable single-word category output. |
| **Developer-Friendly Free Tier** | Groq offers a generous free tier (thousands of requests/day) suitable for development, testing, and demonstration without incurring costs. |
| **OpenAI-Compatible SDK** | The `groq` Python SDK mirrors the OpenAI client interface (`client.chat.completions.create`), minimizing the learning curve and ensuring the codebase could switch providers with a single client swap. |
| **Deterministic Output** | Setting `temperature=0` produces fully reproducible classifications — the same description always maps to the same category, which is essential for consistent database analytics. |

### Migration Path

The project began with **OpenAI**, moved to **Google Gemini** for cost reasons, and settled on **Groq** for the combination of speed, quality, and free-tier availability. The provider-agnostic design of `ai_logic.py` (a thin wrapper returning a string) means future provider changes require modifying only one module.

### Risk Mitigation

- **Fallback defaults**: If the Groq API is unreachable or returns an unexpected value, the system falls back to `"General"` (category) and `"Maintenance issue reported"` (summary) rather than failing the request.
- **Server-side validation**: The AI response is validated against the allowed category list before being saved, preventing hallucinated categories from entering the database.

---

## ADR-004: Unified Monorepo Deployment on Vercel

**Status:** Accepted  
**Date:** 2025-02

### Context

The application consists of two distinct runtimes:
- A **Next.js 16** frontend (Node.js)
- A **FastAPI** backend (Python)

Deployment options considered:
1. **Separate services** — frontend on Vercel, backend on Railway/Render.
2. **Unified monorepo** — both deployed from a single Vercel project.

### Decision

Deploy both frontend and backend from a **single Vercel monorepo** using the legacy `builds` configuration.

### Rationale

| Criterion | Monorepo Advantage |
|---|---|
| **Simplified CI/CD** | A single `git push` triggers both frontend and backend builds. No cross-service deployment orchestration, no webhook chains, no version synchronization between separate repositories. |
| **Unified Environment Variables** | All secrets (`GROQ_API_KEY`, `DATABASE_URL`, `FRONTEND_URL`) are managed in one Vercel project dashboard. No risk of misconfigured or out-of-sync variables across services. |
| **Same-Origin API Calls** | The frontend calls `/api/requests` on the same domain — no CORS complexity in production, no `NEXT_PUBLIC_API_URL` needed. The Axios client falls back to an empty `baseURL`, and Vercel's routing handles the rest. |
| **Cost Efficiency** | A single Vercel project on the free tier hosts both runtimes. Splitting into two services would require a second hosting provider with its own free-tier limits. |
| **Atomic Rollbacks** | If a deployment breaks, rolling back on Vercel reverts both frontend and backend together, preventing the incompatible-versions state that plagues split deployments. |

### Implementation Details

The `vercel.json` configuration uses the **legacy builds array** rather than the newer framework-auto-detection approach, because Vercel's auto-detection does not natively support a Python backend alongside Next.js:

```json
{
  "builds": [
    { "src": "frontend/package.json", "use": "@vercel/next" },
    { "src": "api/index.py",          "use": "@vercel/python" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/index.py" },
    { "src": "/(.*)",     "dest": "/frontend/$1" }
  ]
}
```

- All `/api/*` requests route to the FastAPI serverless function.
- All other requests route to the Next.js frontend.
- The `api/index.py` entry point patches `sys.path` to import the `backend/` package.

### Trade-off Acknowledged

- **Cold starts**: The Python serverless function has a ~1–2s cold start. Mitigated by Neon's connection pooler and `pool_pre_ping`.
- **Build complexity**: The legacy `builds` config is less documented than the standard framework setup. This is offset by the `vercel.json` being fully checked into source control with clear routing rules.
- **Trailing-slash redirects**: Vercel's default redirect behavior conflicted with FastAPI's routing, causing infinite redirect loops. Resolved by setting `redirect_slashes=False` on the FastAPI app and using empty-string endpoint paths (`""` instead of `"/"`).

---

## Decision Summary

| Decision | Choice | Primary Driver |
|---|---|---|
| Backend Framework | FastAPI | Type safety, auto-docs, performance |
| Database | Neon PostgreSQL | Serverless persistence, scalability |
| AI Provider | Groq (Llama 3.3 70B) | Inference speed, free tier, accuracy |
| Deployment | Vercel Monorepo | Simplified CI/CD, same-origin routing |

> Each decision was evaluated against the project's core constraints: **serverless deployment**, **real-time AI inference**, and **production-grade reliability** — with a preference for tools that minimize operational complexity while maximizing developer productivity.
