# Claude Instructions

Follow `AGENTS.md` for this project. The most important rule: when adding or refactoring UI in this Expo/React Native app, check whether a ReActicX component from https://www.reacticx.com/ fits before hand-building custom animated UI.

Use ReActicX for suitable screens, tabs, sheets, dialogs, toasts, forms, inputs, pickers, search, chat controls, empty states, badges, avatars, loaders, progress, carousels, cards, animated text, and gesture-heavy interactions.

Do not force ReActicX for simple layout, plain text, business logic, one-off styling, or existing local components that already solve the need.

Generated ReActicX components belong in `src/components/ui` via:

```bash
bunx --bun reacticx list
bunx --bun reacticx add <component-key>
```

Validate with:

```bash
bun run lint
bunx tsc --noEmit
```
