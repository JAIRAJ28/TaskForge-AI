import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>

        {/* ✅ Inline SVG logo — TaskForge AI */}
        <svg
          width="220"
          height="70"
          viewBox="0 0 220 70"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background Glow */}
          <circle cx="35" cy="35" r="28" fill="url(#gradGlow)" opacity="0.18" />

          {/* Forge / T-symbol */}
          <path
            d="M35 18 L35 52 M22 28 L48 28"
            stroke="#00FFC6"
            strokeWidth="4"
            strokeLinecap="round"
            filter="drop-shadow(0px 0px 4px rgba(0,255,198,0.5))"
          />

          {/* Text */}
          <text
            x="70"
            y="42"
            fill="#EAFBF7"
            fontFamily="Poppins, Inter, system-ui, sans-serif"
            fontSize="26"
            fontWeight="600"
            letterSpacing="0.5"
          >
            TaskForge
          </text>
          <text
            x="185"
            y="42"
            fill="url(#gradText)"
            fontFamily="Poppins, Inter, system-ui, sans-serif"
            fontSize="24"
            fontWeight="700"
          >
            AI
          </text>

          {/* Gradient definitions */}
          <defs>
            {/* Text gradient */}
            <linearGradient id="gradText" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#00FFC6" />
              <stop offset="100%" stopColor="#6D83F2" />
            </linearGradient>

            {/* Background glow gradient */}
            <radialGradient id="gradGlow" cx="0.5" cy="0.5" r="0.6">
              <stop offset="0%" stopColor="#00FFC6" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.1" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((c) => c + 1)}>count is {count}</button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
