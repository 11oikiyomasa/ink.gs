<!-- ai-coding-ok: v4.1.0 -->
# ink.gs — Prompt Templates

Project context: ink.gs is a lightweight editorial publishing and long-form reading platform backed by Cloudflare Workers and D1. The frontend uses semantic HTML, CSS, and vanilla JavaScript; tests use Node's built-in test runner.

## Product/feature analysis
```text
Analyze this request for ink.gs: [request]
Describe the reader/editor need, acceptance criteria, edge cases, and the smallest implementation that fits the current architecture. Do not invent content, metrics, app links, or destinations. Identify any materially missing decision before implementation.
```

## Architecture/design review
```text
Review the proposed change: [change]
Read AGENTS.md and the project memory first. Explain affected modules, data flow, alternatives, risks, test coverage, and whether generated assets must be rebuilt. Prefer existing platform APIs and dependencies.
```

## Implementation
```text
Implement: [behavior]
Relevant paths: [paths]
Follow .github/agent/coding-standards.md. Preserve unrelated changes, add regression tests, run npm test, and run npm run build:assets for frontend source changes. Report any browser checks not exercised.
```

## Bug report
```text
Issue: [description]
Steps: [reproduction]
Expected: [expected]
Observed: [observed]
Environment: [environment]
Reproduce, add a regression test where practical, identify root cause, implement the smallest fix, and verify adjacent behavior.
```

## Code review
```text
Review [diff/files] for correctness, security, accessibility, responsive behavior, honest content, source/generated asset consistency, regression coverage, and scope. Report only actionable findings with file references and severity.
```

## Test plan
```text
For [change], propose tests using Node's built-in node:test runner and existing test helpers. Cover normal paths, empty/unavailable states, boundaries, errors, and relevant browser interactions. Do not claim checks that were not run.
```
