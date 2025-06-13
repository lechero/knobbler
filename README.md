# Knobbler

A flexible, interactive circular knob component for React, built with Framer Motion and TypeScript. Perfect for selecting values via drag, touch, or keyboard, with configurable precision bands, tick steps, and styling.

[![npm version](https://img.shields.io/npm/v/@lechero/knobbler)](https://www.npmjs.com/package/@lechero/knobbler)
[![license](https://img.shields.io/npm/l/@lechero/knobbler)](LICENSE)

## Installation

Install the package and its peer dependencies:

```bash
pnpm add @lechero/knobbler react react-dom framer-motion
# or
npm install @lechero/knobbler react react-dom framer-motion
yarn add @lechero/knobbler react react-dom framer-motion
```

> **Note:** This library requires React 18+ and Framer Motion.

## Usage

Import the `Knobby` component and use it in your application:

```tsx
import React, { useState } from 'react';
import { Knobby } from '@lechero/knobbler';

function App() {
  const [value, setValue] = useState(6);

  return (
    <Knobby
      value={value}
      onChange={setValue}
      min={0}
      max={12}
      tickStep={1}
      precisionStep={0.1}
      precisionDistance={20}
      deadzone={10}
      startAngle={-90}
      arcLength={360}
      diameter={120}
    >
      <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>
        {value}
      </span>
    </Knobbler>
  );
}

export default App;
```

## Props

| Prop               | Type                                  | Default             | Description |
| ------------------ | ------------------------------------- | ------------------- | ----------- |
| `value`            | `number`                              | _required_          | Current knob value. |
| `onChange`         | `(value: number) => void`             | _required_          | Callback when the value changes. |
| `min`              | `number`                              | `0`                 | Minimum value. |
| `max`              | `number`                              | `12`                | Maximum value. |
| `tickStep`         | `number`                              | `1`                 | Step amount for full-range snapping. |
| `precisionStep`    | `number`                              | `0.1`               | Step amount for precision mode when within `precisionDistance`. |
| `precisionDistance`| `number` (pixels)                     | `30`                | Distance from center to switch into precision stepping. |
| `precisionSteps`   | `number[]`                            | `undefined`         | Custom stepping bands (outermost to innermost). |
| `deadzone`         | `number` (pixels)                     | `15`                | Center deadzone radius where value won’t change. |
| `startAngle`       | `number` (degrees)                    | `-90`               | Angle where the knob begins (–90 = 12 o’clock). |
| `arcLength`        | `number` (degrees)                    | `360`               | Total sweep of the arc. |
| `diameter`         | `number` (pixels)                     | `150`               | Outer diameter of the knob. |
| `trackColor`       | `string` (CSS color)                  | `#e5e7eb`           | Color of the base track and ticks. |
| `activeColor`      | `string` (CSS color)                  | `#4f46e5`           | Color of the filled arc and thumb border. |
| `thumbColor`       | `string` (CSS color)                  | `#ffffff`           | Fill color of the thumb. |
| `children`         | `React.ReactNode`                     | `undefined`         | Center content (e.g., value label). |

## Storybook Examples

This component comes with interactive Storybook stories demonstrating common configurations:

- **Default** knob with simple numeric display.
- **ClockStyle** showing hours with “o’clock” suffix.
- **Full360** for 0–360° ranges.
- **SemiCircle** for half-circle percentage controls.
- **CustomBands** using custom stepping bands.
- **SmallKnob** high-precision small range knob.

To view locally:

```bash
pnpm install
git clone <this-repo>
cd knobbler
pnpm run storybook
```

Then open <http://localhost:6006>.

## Development

1. Clone the repo and install dependencies:

   ```bash
   git clone <repo-url>
   cd knobbler
   pnpm install
   ```

2. Run the dev server:

   ```bash
   pnpm run dev    # Vite + React dev server
   pnpm run storybook  # Storybook on http://localhost:6006
   ```

3. Build for production:

   ```bash
   pnpm run build
   ```

4. Run tests (if any are added):

   ```bash
   pnpm test
   ```

## Publishing

1. Bump the version in `package.json`.
2. Ensure `CHANGELOG.md` is updated.
3. Run a final build: `pnpm run build`.
4. Publish to npm:

   ```bash
   pnpm publish --access public
   ```

> **Tip:** Use `pnpm pack` and a local test project to verify the distributed bundle before publishing.

## Contributing

Contributions are welcome! Please open issues for bugs or feature requests, and follow the existing code style when submitting PRs.

## License

[MIT](LICENSE) © Your Name

