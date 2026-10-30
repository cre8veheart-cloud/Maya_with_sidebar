import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sidebar: {
          bg: "#1e1e2e",
          text: "#cdd6f4",
          hover: "#313244",
          accent: "#89b4fa",
          border: "#313244",
        },
        main: {
          bg: "#1a1a2e",
          text: "#e2e8f0",
        },
      },
      transitionProperty: {
        width: "width",
      },
    },
  },
  plugins: [],
};

export default config;
