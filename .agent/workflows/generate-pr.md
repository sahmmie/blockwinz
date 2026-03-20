---
description: Generate PR.md at repo root for GitHub; same content rules as the Cursor gen-pr command.
---

Use the same instructions, structure, and quality bar as **[`.cursor/commands/gen-pr.md`](../../.cursor/commands/gen-pr.md)**.

**Project standards** (architecture, packages, testing expectations): **[`.cursor/commands/mcp-template.md`](../../.cursor/commands/mcp-template.md)**.

**Steps (summary)**

1. Branch name: `git branch --show-current` (extract ticket id if present, e.g. `BWZ-123`).
2. Scope: `git status`, `git diff --name-status`, and read `git diff` as needed.
3. Write **`PR.md`** at the repository root following the template in `gen-pr.md`.
