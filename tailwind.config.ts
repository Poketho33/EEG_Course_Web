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
        background: "var(--background)",
        foreground: "var(--foreground)",
        lighter: "var(--lighter)",
        lighter2: "var(--lighter2)",
        lighter_3: "var(--lighter-3)",
        
        pastel_1: "var(--pastel-1)",
        pastel_2: "var(--pastel-2)",
        pastel_3: "var(--pastel-3)",
        pastel_4: "var(--pastel-4)",
        pastel_5: "var(--pastel-5)",
      },
    },
  },
  plugins: [  ],
} satisfies Config;
