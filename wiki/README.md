# RNT Mobile Wiki — Schema & Agent Instructions

This is the schema file for the RNT Mobile project wiki. It tells AI agents how the wiki is structured, what conventions to follow, and what workflows to use when ingesting sources, answering questions, or maintaining the wiki.

**Format**: OKF v0.2 inspired frontmatter + Karpathy LLM Wiki pattern.
**Storage**: Git repo of markdown files. Human-readable, agent-maintained.

---

## Three Layers

1. **Raw sources** (`wiki/sources/`) — immutable copies or references to original documents (README, API docs, design system, inventory, deploy guide, etc.). The LLM reads but never modifies these.
2. **The wiki** (`wiki/concepts/`) — LLM-generated markdown pages. Summaries, entity pages, concept pages, comparisons. The LLM owns this layer entirely.
3. **The schema** (this file) — configuration that makes the LLM a disciplined wiki maintainer.

---

## Wiki Structure

```
wiki/
  README.md              ← this file (schema)
  index.md               ← catalog of all wiki pages
  log.md                 ← chronological update log
  sources/               ← raw source documents (immutable)
    README.md
    API_DOCUMENTATION.md
    DESIGN_SYSTEM.md
    INVENTORY.md
    COMPONENT_USAGE.md
    DEPLOY.md
    ...
  concepts/              ← LLM-generated concept pages
    architecture.md
    event-lifecycle.md
    data-models.md
    api-layer.md
    component-system.md
    deployment-pipeline.md
    pwa-system.md
    analytics.md
    ...
```

---

## Frontmatter Conventions (OKF v0.2)

Every concept page uses YAML frontmatter:

```yaml
---
type: Concept              # REQUIRED. Concept values: Architecture, API, Component, Deployment, Feature, Data Model, Process, Design Token
title: Display name
description: One-line summary
tags: [tag1, tag2]
sources:                   # References to source documents
  - id: readme
    resource: /sources/README.md
    title: RNT Mobile README
generated: { by: agent/copilot, at: 2026-07-25T12:00:00Z }
verified: { by: human:daniel, at: 2026-07-25T12:00:00Z }   # optional
status: stable             # draft | stable | deprecated
stale_after: 2026-12-31    # optional
---
```

### Type Values

| Type | Use for |
|------|---------|
| `Architecture` | System-level structural decisions |
| `API` | External/internal API contracts |
| `Component` | UI component descriptions |
| `Deployment` | CI/CD, hosting, release processes |
| `Feature` | User-facing feature descriptions |
| `Data Model` | TypeScript interfaces, data shapes |
| `Process` | Workflows, ingestion pipelines |
| `Design Token` | CSS custom properties, theme values |

### Source Reference Convention

Each `sources` entry uses a stable `id` for per-claim attribution via markdown footnotes:

```yaml
sources:
  - id: inventory
    resource: /sources/INVENTORY.md
    title: RNT Mobile Project Inventory
```

In body text: `The event store caches by date filter.[^inventory]`

---

## Operations

### Ingest

When a new source document arrives:
1. Copy it into `wiki/sources/` (or reference it).
2. Read the source, extract key concepts.
3. Create/update concept pages in `wiki/concepts/`.
4. Update `wiki/index.md` with new entries.
5. Append an entry to `wiki/log.md`.
6. Cross-link related concepts.

### Query

When answering questions:
1. Read `wiki/index.md` to find relevant pages.
2. Drill into concept pages.
3. Synthesize an answer with citations (footnotes keyed to `sources[].id`).
4. If the answer is valuable, file it back as a new concept page.

### Lint

Periodically health-check the wiki:
- Contradictions between pages
- Stale claims newer sources have superseded
- Orphan pages with no inbound links
- Missing cross-references
- Concepts mentioned but lacking their own page

---

## Naming Conventions

- Concept pages: `kebab-case.md` matching the concept title
- Source files: preserve original filename, uppercase for project docs
- One concept per page (atomic)

---

## Cross-Linking

Use bundle-relative paths:
```markdown
See the [event lifecycle](/concepts/event-lifecycle.md) for fetch flow.
```

Every concept page should link to at least 2-3 other pages. Orphaned pages are a lint failure.

---

## Index File Format

`wiki/index.md` has no frontmatter. Structure:

```markdown
# RNT Mobile Wiki Index

## Architecture
- [Architecture Overview](/concepts/architecture.md) — System-level structural decisions

## API
- [API Layer](/concepts/api-layer.md) — WordPress REST API integration

...
```

---

## Log File Format

`wiki/log.md` — flat list, newest first:

```markdown
# Wiki Update Log

## 2026-07-25
* **Ingestion**: Added initial wiki from README, API_DOCUMENTATION, DESIGN_SYSTEM, INVENTORY, COMPONENT_USAGE, DEPLOY
* **Creation**: Created architecture, event-lifecycle, data-models, api-layer, component-system, deployment-pipeline, pwa-system, analytics concept pages
```

---

## Attribution

Per-claim attribution uses markdown footnotes keyed to `sources[].id`:

```markdown
The app fetches events from WordPress REST API.[^api-docs]

[^api-docs]: API_DOCUMENTATION.md
```

This survives reordering and makes provenance machine-readable.

---

## Conformance

- Every non-reserved `.md` file has parseable YAML frontmatter with non-empty `type`.
- `index.md` and `log.md` follow the formats above.
- Broken cross-links are tolerated (not-yet-written knowledge) but flagged in lint.
- Unknown `type` values are treated as generic concepts.
