---
description: Search the BlockWinz repository and answer or plan work using local code and project standards.
---

1. **Explore the codebase**

   - Search for symbols, routes, and keywords with the editor’s search or ripgrep.
   - Open and read relevant files to confirm behavior (controllers, repositories, modules, React pages/components).
   - Trace data flow (HTTP → controller → repository → Drizzle, or React → hooks → API).

2. **Apply project standards**

   Read **[`.cursor/commands/mcp-template.md`](../../.cursor/commands/mcp-template.md)**. It defines BlockWinz monorepo layout, NestJS + Drizzle patterns, frontend stacks, commits/PRs, and how assistants should work here.

3. **Formulate the response**

   - **Explanations**: Describe how the feature works with references to specific files and symbols.
   - **Plans**: Propose steps that match existing module structure (e.g. `Controller` → `Repository` in `@blockwinz/api`, feature folders in `@blockwinz/web`), optional Drizzle transactions where sibling code uses `tx`, and shared enums/DTOs where applicable.

4. **Deliver**

   - Answer clearly or hand off an implementation plan that a developer can follow without contradicting `mcp-template.md`.
