import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // from globals css
        background: "var(--background)",
        foreground: "var(--foreground)",
        secondary: "var(--secondary)",
        lighter: "var(--lighter)",
        lighter2: "var(--lighter2)",
      },
    },
  },
  plugins: [  ],
} satisfies Config;
