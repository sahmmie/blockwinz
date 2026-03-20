BlockWinz coding standards and patterns: **[`.cursor/commands/mcp-template.md`](./mcp-template.md)**.

Based on the changes made, generate a PR description with **instructions for testing**, including files changed / added / removed.

Include only **relevant** information—omit minor noise that does not help reviewers (e.g. if an enum was introduced earlier in the branch, do not re-list every follow-up enum value unless it matters for the review).

Create the output as **`PR.md` in the repository root** so it can be copied into GitHub.

**Ticket in title**: If the branch name contains a ticket id (e.g. `feature/BWZ-123-short-description` or `fix/JIRA-456-foo`), use that id in `# [ticket-number]: ...`. Replace the prefix with whatever your team uses (`BWZ`, `JIRA`, etc.).

The structure should be roughly:

# [ticket-number]: Short description

## Summary

Brief summary

## Key Features

### Feature 1

Brief summary

### Feature 2

Brief summary

...etc

## Usage

Brief usage summary

## Testing Instructions

### Prerequisites

Anything required to setup

### Test Cases

List test scenarios

---

## Changed Files (total number)

| File | Description |
| ---- | ----------- |

## Added Files (total number)

| File | Description |
| ---- | ----------- |

## Removed Files (total number)

| File | Description |
| ---- | ----------- |

---

## Notes

Additional notes
