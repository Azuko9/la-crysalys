// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-color)",
        primary: "var(--primary-color)",
        card: "var(--card-bg)",
        foreground: "var(--text-color)",
      },
    },
  },
  plugins: [],
};
export default config;