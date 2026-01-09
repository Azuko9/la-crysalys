// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-color)",
        primary: "var(--primary-color)",
        card: "var(--card-bg)", // C'est ici que le lien se fait
      },
    },
  },
  plugins: [],
};
export default config;