# PR Review — Reference

## Report Template

```markdown
# Code Review: <PR_TITLE or branch name>

**Verdict: <EMOJI> <VERDICT>**
**PR**: #<NUMBER> (if available)
**Branch**: `<HEAD>` → `<BASE>`
**Files reviewed**: <COUNT>

---

## Executive Summary

<2-4 sentences summarizing changes and overall quality>

---

## Findings

### 🔴 Critical

<List findings or "None">

### 🟠 Important

<List findings or "None">

### 🟡 Suggestions

<List findings or "None">

---

## Detail by Area

### 🔒 Security
### 🏗️ Architecture
### 🔁 Duplication
### 🧪 Testing
### ⚡ Performance
### 📖 Readability
### ♿ Accessibility
```

## Finding Format

```markdown
- **🔴|🟠|🟡 <Title>** — `<file_path>:<line>`
  <Description and why it matters>
  **Suggestion**: <How to fix it>
```

## Agent Prompt Composition

Each agent receives a composed prompt with this structure:

```
<Agent prompt from agents/<name>.md>

## Project Context
<PROJECT_CONTEXT summary>

## Changed Files
<LIST_OF_FILES>

## Diff
<FULL_DIFF>
```

## Agent Output Format

All agents return findings as JSON arrays:

```json
[
  {
    "severity": "critical|important|suggestion",
    "title": "Short descriptive title",
    "file": "path/to/file.ts",
    "line": 42,
    "description": "What the issue is and why it matters",
    "suggestion": "How to fix it"
  }
]
```

Empty result: `[]`

Some agents include extra fields (`existing_location`, `test_file`, `estimated_impact`, `current`, `proposed`). Include them in the report when present.
