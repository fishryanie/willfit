# AI Agent Instructions

## ReActicX UI Rule

When coding in this Expo/React Native project, check whether a ReActicX component from https://www.reacticx.com/ fits before building custom UI for:

- screens, navigation chrome, tabs, sheets, dialogs, toasts
- forms, inputs, pickers, search, sliders, switches, steppers
- chat controls, empty states, badges, avatars, loaders, progress
- carousels, cards, animated text, gesture-heavy or polished interactions

Use ReActicX only when it reduces custom UI work or provides a better animated mobile interaction. Do not force it for simple layout, plain text, one-off styling, business logic, or existing local components that already solve the feature cleanly.

## Project Setup

This project uses Bun and Expo Router. Keep reusable UI in `src/components`, screens/routes in `src/app`, and generated ReActicX components in `src/components/ui`.

The ReActicX CLI is configured by `component.config.json`:

```json
{
  "outDir": "src/components/ui"
}
```

Before adding a component, check whether it already exists:

```bash
find src/components -maxdepth 4 -type f | sort
```

Confirm the current ReActicX catalog and component key:

```bash
bunx --bun reacticx list
```

Add components through the CLI:

```bash
bunx --bun reacticx add <component-key>
```

Avoid `--overwrite` unless intentionally replacing generated component files after checking local edits.

## Dependency Rules

Prefer components that work with dependencies already present in `package.json`: `react-native-reanimated`, `react-native-gesture-handler`, `react-native-worklets`, `react-native-safe-area-context`, `expo-haptics`, `expo-symbols`, and `@expo/vector-icons`.

Add extra native/visual dependencies only when the feature justifies them. Common ReActicX dependencies include `react-native-svg`, `expo-blur`, `expo-linear-gradient`, `@shopify/react-native-skia`, `@react-native-masked-view/masked-view`, `react-native-qrcode-styled`, and `react-native-easing-gradient`.

If ReActicX docs mention `react-native-blur`, install the GitHub fork:

```bash
bun add sbaiahmed1/react-native-blur
```

After adding native dependencies, note that the native target may need a rebuild.

## Validation

After integrating ReActicX or touching UI code, run:

```bash
bun run lint
bunx tsc --noEmit
```

For visual or interaction-heavy changes, also run the app and exercise the affected screen:

```bash
bun expo start
```
