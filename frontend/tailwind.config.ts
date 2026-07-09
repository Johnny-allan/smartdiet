import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        forest: "rgb(var(--color-forest) / <alpha-value>)",
        sage: "rgb(var(--color-sage) / <alpha-value>)",
        terracotta: "rgb(var(--color-terracotta) / <alpha-value>)",
        petrol: "rgb(var(--color-petrol) / <alpha-value>)",
        background: "rgb(var(--color-background) / <alpha-value>)",
        graphite: "rgb(var(--color-graphite) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        mist: "rgb(var(--color-mist) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Inter", "Manrope", "Arial", "sans-serif"],
      },
      borderRadius: {
        smart: "8px",
      },
      boxShadow: {
        smart: "0 16px 40px rgb(var(--color-shadow) / 0.16)",
        subtle: "0 1px 3px rgb(var(--color-shadow) / 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
