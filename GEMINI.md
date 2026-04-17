# Gemini Instructions

Follow `AGENTS.md` for this project. The key UI policy is:

When coding in this Expo/React Native app, check ReActicX at https://www.reacticx.com/ before custom-building UI that involves screens, navigation chrome, forms, chat controls, loaders, empty states, sheets, tabs, toasts, carousels, search, pickers, progress, or animated interactions.

Use ReActicX only when it meaningfully reduces custom UI work or improves the mobile interaction. Skip it for simple layout, plain text, business logic, one-off styling, or existing local components.

Generated ReActicX components should go to `src/components/ui`. Use:

```bash
bunx --bun reacticx list
bunx --bun reacticx add <component-key>
```

Validate with:

```bash
bun run lint
bunx tsc --noEmit
```
