/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0b0f14",
        card: "#0f1520",
        text: "#e6eef8",
        muted: "#a6b0bf",
        brand: "#7c8cff",
        "brand-2": "#9be5ff",
        ring: "#5aa9e6",
        accent: "#1c2533",
        danger: "#ff6b6b",
      },
      blur: {
        60: "60px",
      },
      keyframes: {
        "float-a": {
          "0%, 100%": { transform: "translate(0, 0)" },
          "50%": { transform: "translate(6px, -10px)" },
        },
        "float-b": {
          "0%, 100%": { transform: "translate(0, 0)" },
          "50%": { transform: "translate(-8px, 10px)" },
        },
        "float-c": {
          "0%, 100%": { transform: "translateX(-50%) translateY(0)" },
          "50%": { transform: "translateX(-50%) translateY(-10px)" },
        },
      },
      animation: {
        "float-a": "float-a 11s ease-in-out infinite",
        "float-b": "float-b 14s ease-in-out infinite",
        "float-c": "float-c 18s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
