---
description: Use ReActicX components for WillFit UI when appropriate
globs:
  - "src/**/*.tsx"
  - "src/**/*.ts"
alwaysApply: true
---

# ReActicX UI Rule

When adding or refactoring UI in this Expo/React Native project, check whether a ReActicX component from https://www.reacticx.com/ fits before hand-building custom animated UI.

Use ReActicX for suitable screens, navigation chrome, forms, chat controls, loaders, empty states, sheets, tabs, toasts, carousels, search, pickers, progress, animated text, and gesture-heavy interactions.

Skip ReActicX for simple layout, plain text, business logic, one-off styling, or existing local components that already solve the feature.

Generated ReActicX components belong in `src/components/ui`. Use:

```bash
bunx --bun reacticx list
bunx --bun reacticx add <component-key>
```

Validate with:

```bash
bun run lint
bunx tsc --noEmit
```
