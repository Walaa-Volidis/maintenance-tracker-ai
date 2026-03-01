# 🧠 Prompt Engineering Documentation

> This document details the AI prompts and design prompts used throughout the **Maintenance Request Tracker** project, including the reasoning behind each structure decision.

---

## Table of Contents

1. [Categorization Prompt](#1--categorization-prompt)
2. [Summarization Prompt](#2--summarization-prompt)
3. [UI Design Prompt](#3--ui-design-prompt)

---

## 1. 🏷️ Categorization Prompt

### Purpose

Automatically classify every incoming maintenance request into one of five fixed categories so the system can organize, filter, and generate analytics without any manual input.

### The Prompt

```
System Role:
  "You are an expert maintenance dispatcher.
   Your task is to categorize the user's request into EXACTLY one of these
   categories: [Plumbing, Electrical, HVAC, Furniture, General].

   Rules:
   - Output ONLY the category name.
   - Do not include any punctuation, explanations, or extra words.
   - If the request is ambiguous, default to General.
   - If the request is in Arabic, understand the meaning and output the
     English category name."

User Role:
  <the maintenance request description submitted by the user>
```

### Model Configuration

| Parameter | Value | Why |
|---|---|---|
| **Model** | `llama-3.3-70b-versatile` | Large enough for accurate classification, yet fast through Groq's LPU inference |
| **Temperature** | `0` | Eliminates randomness — the same description always gets the same category |
| **Max Tokens** | `20` | A single category word never exceeds ~3 tokens; set low to prevent runaway output |

### Strict Constraints — Why They Matter

| Constraint | Reasoning |
|---|---|
| **"Output ONLY the category name"** | The response is saved directly to a database `VARCHAR(100)` column. Any extra text (e.g., "The category is Plumbing") would break downstream filtering and analytics queries. |
| **"No punctuation, explanations, or extra words"** | Reinforces the first rule. LLMs tend to be "helpful" by adding context — this explicitly suppresses that behavior. |
| **"Default to General"** | Provides a deterministic fallback so the classifier never returns an invalid or empty category. The code also validates the response against the allowed list as a safety net. |
| **"Arabic → English"** | The project supports bilingual users. The AI must understand Arabic descriptions but always output the English category label for database consistency. |

### Why Use a System Role?

The **system role** sets the AI's identity and behavioral boundaries *before* it sees the user's message. This is more reliable than putting instructions in the user message because:

- LLMs treat system instructions with **higher priority** — they're less likely to be overridden by unusual user input.
- It separates **control logic** (how to respond) from **data** (the description), which prevents prompt injection where a malicious description could alter behavior.
- It establishes a **consistent persona** ("expert dispatcher") that anchors the model's decision-making throughout the conversation.

### Code-Level Safety Net

Even with a well-crafted prompt, the code in `ai_logic.py` performs a **server-side validation** step:

```python
for valid in VALID_CATEGORIES:
    if category.lower() == valid.lower():
        return valid
return DEFAULT_CATEGORY  # "General"
```

This ensures that if the AI returns anything unexpected (e.g., a typo, a hallucinated category), the system gracefully falls back to `"General"` instead of saving invalid data.

---

## 2. 📝 Summarization Prompt

### Purpose

Generate a concise, ≤10-word summary for each maintenance request so managers can triage issues at a glance from the dashboard table without reading the full description.

### The Prompt

```
System Role:
  "You are a concise maintenance report writer.
   Summarize the user's maintenance request into ONE short sentence
   of no more than 10 words.

   Rules:
   - Output ONLY the summary sentence.
   - Do not include any punctuation at the end, explanations, or extra words.
   - If the request is in Arabic, understand the meaning and output the
     English summary."

User Role:
  <the maintenance request description submitted by the user>
```

### Model Configuration

| Parameter | Value | Why |
|---|---|---|
| **Model** | `llama-3.3-70b-versatile` | Same model as categorization — avoids loading a second model |
| **Temperature** | `0` | Deterministic output for reproducibility |
| **Max Tokens** | `30` | A 10-word sentence fits within ~15 tokens; set to 30 for minor padding |

### Constraint Design Decisions

| Constraint | Reasoning |
|---|---|
| **"ONE short sentence of no more than 10 words"** | Without a strict word limit, LLMs generate verbose summaries. The 10-word cap forces extreme conciseness, which fits cleanly in the UI's tooltip and table cell. |
| **"No punctuation at the end"** | Prevents inconsistent periods/dots that would look messy when displayed alongside the Sparkles icon in the dashboard tooltip. |
| **"ONLY the summary sentence"** | Prevents the model from prefixing with "Summary:" or "Here is the summary:" which would need to be stripped out in code. |
| **"Arabic → English"** | Matches the categorization prompt for bilingual consistency. |

### Fallback Strategy

```python
DEFAULT_SUMMARY = "Maintenance issue reported"
```

If the API call fails or returns an empty response, the system displays a generic summary rather than leaving the field blank — ensuring the UI never shows an empty tooltip.

---

## 3. 🎨 UI Design Prompt

### Purpose

Guide the creation of a professional, accessible dashboard interface that presents maintenance data clearly and feels like a production-grade SaaS application.

### The Design Prompt (to the AI coding assistant)

```
"Apply a professional color palette to the dashboard using Tailwind CSS.
 Use slate tones for the base (backgrounds, text, borders) and emerald
 as the primary accent color. The design should feel clean, modern, and
 enterprise-grade.

 Specific requirements:
 - Background: bg-slate-50 for the page, bg-white for cards
 - Text: text-slate-900 for headings, text-slate-500 for descriptions
 - Borders: border-slate-200 with shadow-sm on cards
 - Primary actions: bg-emerald-600 with hover:bg-emerald-700
 - Priority badges: emerald (Low), amber (Medium), red (High)
 - Status badges: slate (Pending), indigo (In Progress), emerald (Completed)
 - Category badges: sky background with sky text
 - Use shadcn/ui components (Card, Table, Badge, Tooltip, Skeleton)
 - Ensure all interactive elements have visible focus states for accessibility"
```

### Why This Approach?

| Decision | Reasoning |
|---|---|
| **Slate + Emerald palette** | Slate provides a neutral, professional base. Emerald suggests "operational / go / healthy" — fitting for a maintenance management tool. This avoids the default black/white that looks like an unstyled prototype. |
| **Semantic badge coloring** | Colors map to meaning: 🟢 emerald = low risk/complete, 🟡 amber = caution/medium, 🔴 red = urgent/high. Users intuitively understand priority without reading the label. |
| **shadcn/ui as the component library** | Built on Radix UI primitives, which are **WAI-ARIA compliant** out of the box. This gives us keyboard navigation, screen reader support, and focus management without extra effort. |
| **Skeleton loading states** | The stats cards use `<Skeleton>` components while data loads, preventing layout shift and signaling to users that content is being fetched — a polished UX detail. |
| **Tooltip for AI summary** | Summaries are shown on hover via a Tooltip rather than taking up table column space. This keeps the table scannable while still exposing AI-generated insights on demand. |

### Accessibility Considerations

- **Color contrast**: All text/background combinations meet **WCAG AA** standards (slate-900 on white = 15.4:1 ratio, emerald-600 on white = 4.5:1+).
- **Focus indicators**: shadcn/ui components include visible `ring` styles on focus for keyboard users.
- **Semantic HTML**: Proper use of `<table>`, `<th>`, `<td>` for the requests list ensures screen readers can navigate the data grid.
- **Responsive layout**: The `lg:grid-cols-[380px_1fr]` grid collapses to a single column on mobile, keeping the form and table usable on all screen sizes.

---

## Summary

| Prompt | Model | Temperature | Key Principle |
|---|---|---|---|
| **Categorization** | Llama-3.3-70b | 0 | Strict single-word output for database compatibility |
| **Summarization** | Llama-3.3-70b | 0 | ≤10 word constraint for UI readability |
| **UI Design** | — | — | Semantic color mapping + accessibility-first component selection |

> All AI prompts follow a **"System Role + Constraints + Fallback"** pattern to ensure predictable, safe, and database-compatible outputs in production.
