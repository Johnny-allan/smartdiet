import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        forest: "#168A5A",
        sage: "#9BE7BF",
        terracotta: "#F97316",
        petrol: "#2563EB",
        background: "#F3F4F6",
        graphite: "#3F4652",
        surface: "#FFFFFF",
        line: "#D6DAE1",
        mist: "#ECFDF3",
      },
      fontFamily: {
        sans: ["Inter", "Manrope", "Arial", "sans-serif"],
      },
      borderRadius: {
        smart: "8px",
      },
      boxShadow: {
        smart: "0 16px 40px rgba(63, 70, 82, 0.10)",
        subtle: "0 1px 3px rgba(63, 70, 82, 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
