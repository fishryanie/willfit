# Copilot Instructions

This is a Bun + Expo Router React Native project.

For UI work, check whether a ReActicX component from https://www.reacticx.com/ fits before building custom UI for screens, navigation chrome, forms, chat controls, loaders, empty states, sheets, tabs, toasts, carousels, search, pickers, progress, or animated interactions.

Use ReActicX when it reduces custom UI work or provides a better animated mobile interaction. Do not force it for simple layout, plain text, business logic, one-off styling, or an existing local component that already solves the feature.

Generated ReActicX components belong in `src/components/ui`. The project has `component.config.json`:

```json
{
  "outDir": "src/components/ui"
}
```

Use:

```bash
bunx --bun reacticx list
bunx --bun reacticx add <component-key>
```

Validate UI changes with:

```bash
bun run lint
bunx tsc --noEmit
```
