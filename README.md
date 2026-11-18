
#  NumLab 

  An interactive digital arithmetic workbench featuring multi-base calculations and step-by-step Booth's multiplication analysis.

## ✨ Overview

**NumLab** is a Computer Organization and Architecture (COA) project designed to simplify digital arithmetic through interactive visualisation.

It combines a multi-base arithmetic calculator with a Booth's multiplication analyser, allowing users to perform calculations and explore the underlying computational process.

## 🚀 Features

###  Multiplier

- Perform addition, subtraction, and multiplication.
- Enter operands in **Binary, Octal, Decimal, or Hexadecimal**.
- Support for mixed-base calculations.
- View results simultaneously in all four number systems.
- Decimal equivalents for easy verification.
- One-click copy functionality and sample inputs.

###  Booth's Algorithm Analyser

- Perform signed binary multiplication.
- Configurable bit width from 2 to 32 bits.
- Visualise registers **M, A, Q and Q-1**.
- Step-by-step execution with highlighted iterations.
- Next, Previous, Play/Pause and Reset controls.
- Detailed explanation of every iteration.
- Automatic result cross-checking.

---

## 🖥️ Screenshots & Demo

Explore the interface and see NumLab in action.

### 🏠 Dashboard

<p align="center">
  <img src="https://github.com/user-attachments/assets/52735b56-f5a4-4c1f-b458-14dd077197ab" width="90%" alt="NumLab Dashboard" />
</p>

### 🧮 Multiplier

<p align="center">
<img width="1855" height="902" alt="image" src="https://github.com/user-attachments/assets/00537684-1857-44c4-8652-02189732e1c3" />
</p>

### ⚙️ Booth's Algorithm Analyser

<p align="center">
<img width="1873" height="902" alt="image" src="https://github.com/user-attachments/assets/2d7f656c-7c7f-4493-a056-95ef36fd60b1" />
</p>

<p align="center">
  🌐 <a href="https://num-lab-virid.vercel.app/"><b>Try NumLab Live →</b></a>
</p>

---

## 🛠️ Tech Stack

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
</p>

---

## 📂 Project Structure

```text
numlab/
│
├── index.html
├── package.json
├── vite.config.js
│
├── tests/
│   └── numlab.test.js
│
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    │
    ├── utils/
    │   ├── numberSystems.js
    │   ├── arithmetic.js
    │   ├── booth.js
    │   ├── history.js
    │   └── format.js
    │
    ├── components/
    │   ├── Sidebar
    │   ├── NumberField
    │   ├── ResultGrid
    │   ├── Bits
    │   └── ui/
    │
    ├── pages/
    │   ├── Dashboard
    │   ├── Multiplier
    │   ├── BoothAnalyser
    │   ├── History
    │   └── About
    │
    ├── hooks/
    │   └── useHistory.js
    │
    └── data/
        └── examples.js
```

---

## ⚡ Getting Started

### Prerequisites

- Node.js 18 or newer
- npm

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/yuss-raa/NumLab.git
```

**2. Navigate to the project directory**

```bash
cd numlab
```

**3. Install dependencies**

```bash
npm install
```

**4. Start the development server**

```bash
npm run dev
```


## 👩‍💻 Project Information

- **Project:** NumLab | Digital Arithmetic Workbench
- **Subject:** Computer Organization and Architecture
- **Project Type:** Academic Project
- **Domain:** Digital Arithmetic & Computer Architecture

<p align="center">
  Made with ❤️ and ☕
</p>
