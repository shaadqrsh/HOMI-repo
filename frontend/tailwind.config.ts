import type { Config } from "tailwindcss";
import { withUt } from "uploadthing/tw";

export default withUt({
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "liberty-blue": "#0b081d",
        "spanish-roast": "#130f2b",
        "ceremonial-purple": "#312a5b",
        murex: "#8982b4",
        "cold-dark": "#163853",
        "astro-zinger": "#8078b4",
        "violet-mix": "#afa9cf",
        "majestic-purple": "#68628f",
        orchid: "#8766a4",
        harajuku: "#534e72",
        "chalk-violet": "#907ba4",
        "test-green": "#2bd45f",
        "perpetual-purple": "#534d76",
        "purple-noir": "#362f5b",
        minsk: "#362f62",
        "murex-200": "#8a82b4",
        Lavender: "#b990db",

        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      screens: {
        xs: "375px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("tailwindcss-motion")],
} satisfies Config);
