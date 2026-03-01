# AI Usage Disclosure

> **Transparency Statement** — This document provides an honest and complete account of how artificial intelligence tools were used during the development of the **AI-Powered Maintenance Request Tracker**. It is submitted alongside the project to demonstrate professional integrity.

---

## 1. Objective

AI was used as a **productivity co-pilot** throughout the development process. The goal was not to replace engineering judgment, but to accelerate development speed, reduce time spent on repetitive boilerplate, and ensure the codebase follows modern standards and best practices across both Python and TypeScript ecosystems.

---

## 2. Areas of AI Assistance

### 2.1 Code Generation & Boilerplate

AI assisted with generating **initial scaffolding and boilerplate code**, including:

- **FastAPI** endpoint structure, Pydantic schema definitions, and SQLAlchemy model declarations.
- **Next.js** page layouts, React hook patterns, and Axios client configuration.
- **shadcn/ui** component integration — wiring up Card, Table, Badge, Tooltip, Skeleton, and form components with proper imports and props.

> These generated templates were reviewed, modified, and adapted to fit the project's specific data model and architecture before being committed.

### 2.2 Problem Solving & Debugging

AI was instrumental in diagnosing and resolving several complex integration issues:

- **Pydantic v2 validation errors** — migrating from Pydantic v1 patterns (e.g., `class Config`) to v2 conventions (`model_config = ConfigDict(from_attributes=True)`) required precise syntax changes that AI helped identify.
- **CORS configuration** — setting up cross-origin resource sharing for the Vercel (frontend) → FastAPI (serverless function) → Neon PostgreSQL pipeline required multiple iterations. AI helped debug `ERR_TOO_MANY_REDIRECTS` issues caused by trailing-slash conflicts between Vercel's routing and FastAPI's default `redirect_slashes` behavior.
- **Vercel monorepo deployment** — configuring the legacy `builds` array to serve both `@vercel/next` and `@vercel/python` from a single repository involved non-trivial routing rules that AI helped construct and debug.

### 2.3 Refinement & Polish

AI acted as a **pair programmer** during the UI refinement phase:

- **Tailwind CSS styling** — suggesting the slate/emerald professional color palette, semantic badge coloring for priority and status indicators, and responsive grid layouts.
- **Clean Code practices** — recommending descriptive variable names, consistent function signatures, and clear docstrings across the Python backend.
- **Prompt engineering** — refining the system prompts for the Groq AI categorization and summarization calls to produce reliable, database-compatible outputs.

---

## 3. Human Control & Oversight

While AI served as a valuable assistant, **all critical decisions were made by the developer**:

| Responsibility                                                                                                                       | Owner     |
| ------------------------------------------------------------------------------------------------------------------------------------ | --------- |
| **Architecture design** — choosing FastAPI, Neon PostgreSQL, Groq, and the Vercel monorepo pattern                                   | Developer |
| **Database schema** — defining the `MaintenanceRequest` model, its fields, enums, and relationships                                  | Developer |
| **AI prompt design** — crafting the categorization and summarization prompts with specific constraints                               | Developer |
| **Component integration** — manually wiring frontend hooks to backend endpoints and verifying end-to-end data flow                   | Developer |
| **Code review** — every AI-generated suggestion was read, understood, tested, and modified before inclusion                          | Developer |
| **Deployment & operations** — configuring environment variables, managing Neon database connections, and debugging production issues | Developer |
| **Testing strategy** — deciding what to test, writing meaningful assertions, and ensuring AI calls are properly mocked               | Developer |

---

## 4. Tools Used

| Tool                                       | Role                                                                                       |
| ------------------------------------------ | ------------------------------------------------------------------------------------------ |
| **GitHub Copilot (Claude Opus 4.6 Agent)** | In-editor AI agent for code generation, debugging, refactoring, and pair programming       |
| **Groq Cloud API**                         | Runtime AI inference for categorization and summarization (part of the application itself) |

---

## 5. Commitment

I affirm that:

- I **understand every line of code** in this repository and can explain its purpose.
- AI-generated code was never accepted blindly — it was **reviewed, tested, and adapted** to meet the project's specific requirements.
- All **architectural decisions**, **data modeling choices**, and **integration logic** reflect my own engineering judgment.
- This disclosure is provided voluntarily to maintain **transparency and academic integrity**.

---

_Prepared by the project developer as part of the submission materials._
