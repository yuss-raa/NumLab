# NumLab: Digital Arithmetic Workbench

A Computer Organization and Architecture (COA) project. NumLab converts and calculates across number systems and shows Booth's multiplication algorithm one register at a time.

## Run it

Requires Node.js 18 or newer.

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # 18 tests for conversions, arithmetic and Booth's algorithm
npm run build    # production build in dist/
```

## Modules

| Page | What it does |
| --- | --- |
| Dashboard | Welcome, the two module cards, quick examples, recent history, number-system overview |
| Multiplier | Add, subtract or multiply two operands, each in its own base (binary, octal, decimal, hex). Shows decimal equivalents, the result in all four bases, copy buttons, samples |
| Booth Analyser | Signed multiplication with a configurable bit width (2 to 32). Next, previous, play/pause, reset, a highlighted iteration table, and an explanation for every step |
| History | Saved in localStorage, survives a refresh, can be cleared |
| About Project | Objective, number systems, operations, Booth's algorithm, technologies, learning outcomes |

## Folder structure

```
numlab/
  index.html
  package.json
  vite.config.js
  tests/
    numlab.test.js          Node test runner, no extra dependencies
  src/
    main.jsx  App.jsx  index.css
    utils/
      numberSystems.js      validation, base conversion, two's complement (BigInt)
      arithmetic.js         add / subtract / multiply, mixed-base evaluation
      booth.js              Booth's algorithm (add, subtract, arithmetic shift)
      history.js            localStorage history
      format.js             display helpers
    components/             Sidebar, NumberField, ResultGrid, Bits, ui
    pages/                  Dashboard, Multiplier, BoothAnalyser, History, About
    hooks/useHistory.js
    data/examples.js
```

## How Booth's algorithm is implemented

`src/utils/booth.js` keeps the registers M, A, Q and Q-1 and loops once per bit. Each iteration reads (Q0, Q-1), adds or subtracts M when the rule says so, then does an arithmetic right shift of A, Q and Q-1. The product is read from the final [A | Q]. JavaScript's `*` is not used to build any step or the product. The page shows a "cross-check" badge that compares the result with a direct multiplication afterwards, and the tests do the same for every operand pair from 2 to 8 bits.

When the multiplicand is the most negative value (for example -8 in 4 bits), A plus or minus M needs one extra bit. Hardware keeps that carry for the shift, and so does this code. Those steps are marked "Extra sign bit kept" in the table.

## Design

Light pastel palette from the brief plus a matching dark theme. Both are defined as CSS variables in `src/index.css` (Tailwind CSS v4), and the utilities are `bg-nl-bg`, `text-nl-ink`, `border-nl-border`, `bg-nl-softblue`, and so on. The sidebar and the mobile bar have a Sun/Moon toggle. The first visit follows the system setting, and an explicit choice is remembered in localStorage (`useTheme.js`).