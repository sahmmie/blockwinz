These instructions apply to the entire duration of this chat session.

Project standards for architecture and style: **[`.cursor/commands/mcp-template.md`](./mcp-template.md)**.

## COMMIT MESSAGE GENERATION COMMAND

When the user asks you to generate a commit message (e.g. "generate commit message", "create commit msg", "help me commit"), you MUST:

### 1. Analyze the staged changes

- Run **`git diff --staged`** (and **`git status`** if you need context on untracked or unstaged files).
- Summarize **what** changed: packages touched (`@blockwinz/api`, `@blockwinz/web`, `@blockwinz/admin`), file types, and behavioral intent inferred from the diff.
- If nothing is staged, say so and suggest staging files or offer to base the message on **unstaged** diff with user confirmation.

### 2. Understand the context

- Tie changes to **features or fixes** visible in the diff (new endpoints, UI components, config, deps).
- For cross-package changes, mention each area briefly in the body.

### 3. Generate a commit message

Follow this structure:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type (required)

Must be one of:

- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring (no functional changes)
- `chore`: Maintenance tasks (deps, config, etc.)
- `docs`: Documentation changes
- `style`: Code style/formatting changes
- `test`: Adding or updating tests
- `perf`: Performance improvements

### Scope (optional)

The module or package area, for example: `api`, `web`, `admin`, `repo`, or a feature name (`mines`, `wallet`).

### Subject (required)

- Short summary (about 50 characters)
- Imperative mood ("add" not "added" or "adds")
- No period at the end
- Lowercase after the colon

### Body (optional)

Detailed explanation of **what** and **why** (not how):

- Wrap at 72 characters per line
- Mention migrations, breaking behavior, or API contract changes if relevant
- Leave a blank line after the subject

### Footer (optional)

Breaking changes and issue references:

- `BREAKING CHANGE:` for breaking changes
- `Closes #123` or `Fixes #456` for issue references
- Leave a blank line after body

### 4. Align with BlockWinz

- For API DB changes, note Drizzle migrations or seed updates when applicable.
- For monorepo-wide edits, use scope `repo` or list packages in the body.

### 5. Present 2-3 commit message options

Provide the user with:

**Option 1 (Concise):** Subject line only

**Option 2 (Detailed):** Subject + body with full context

**Option 3 (Complete):** Subject + body + footer with issue references or breaking changes

---

## EXAMPLE OUTPUT

### Option 1 (Concise)

```
feat(api): add optional tx parameter to wallet withdrawal path
```

### Option 2 (Detailed)

```
feat(api): add optional tx parameter to wallet withdrawal path

Wallet repository methods now accept an optional Drizzle transaction
so callers can group withdrawals with other DB updates atomically.
```

### Option 3 (Complete)

```
feat(api): add optional tx parameter to wallet withdrawal path

Wallet repository methods now accept an optional Drizzle transaction
so callers can group withdrawals with other DB updates atomically.

Closes #234
```

---

### USAGE TRIGGERS

The user may trigger this command by saying:

- "generate commit message"
- "create commit msg"
- "help me commit"
- "write a commit message"
- "commit message for these changes"

When any of these phrases are detected, immediately begin the commit message generation process.
