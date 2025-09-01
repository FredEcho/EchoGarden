import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./client/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        error: {
          DEFAULT: "hsl(var(--error))",
          foreground: "hsl(var(--error-foreground))",
        },
        garden: {
          DEFAULT: "hsl(var(--garden))",
          foreground: "hsl(var(--garden-foreground))",
        },
        seed: {
          DEFAULT: "hsl(var(--seed))",
          foreground: "hsl(var(--seed-foreground))",
        },
        sprout: {
          DEFAULT: "hsl(var(--sprout))",
          foreground: "hsl(var(--sprout-foreground))",
        },
        flower: {
          DEFAULT: "hsl(var(--flower))",
          foreground: "hsl(var(--flower-foreground))",
        },
        tree: {
          DEFAULT: "hsl(var(--tree))",
          foreground: "hsl(var(--tree-foreground))",
        },
        nature: {
          50: "hsl(120, 60%, 95%)",
          100: "hsl(120, 60%, 90%)",
          200: "hsl(120, 60%, 80%)",
          300: "hsl(120, 60%, 70%)",
          400: "hsl(120, 60%, 60%)",
          500: "hsl(120, 60%, 50%)",
          600: "hsl(120, 60%, 40%)",
          700: "hsl(120, 60%, 30%)",
          800: "hsl(120, 60%, 20%)",
          900: "hsl(120, 60%, 10%)",
        },
        earth: {
          50: "hsl(30, 60%, 95%)",
          100: "hsl(30, 60%, 90%)",
          200: "hsl(30, 60%, 80%)",
          300: "hsl(30, 60%, 70%)",
          400: "hsl(30, 60%, 60%)",
          500: "hsl(30, 60%, 50%)",
          600: "hsl(30, 60%, 40%)",
          700: "hsl(30, 60%, 30%)",
          800: "hsl(30, 60%, 20%)",
          900: "hsl(30, 60%, 10%)",
        },
        sky: {
          50: "hsl(200, 60%, 95%)",
          100: "hsl(200, 60%, 90%)",
          200: "hsl(200, 60%, 80%)",
          300: "hsl(200, 60%, 70%)",
          400: "hsl(200, 60%, 60%)",
          500: "hsl(200, 60%, 50%)",
          600: "hsl(200, 60%, 40%)",
          700: "hsl(200, 60%, 30%)",
          800: "hsl(200, 60%, 20%)",
          900: "hsl(200, 60%, 10%)",
        },
        sunset: {
          50: "hsl(15, 60%, 95%)",
          100: "hsl(15, 60%, 90%)",
          200: "hsl(15, 60%, 80%)",
          300: "hsl(15, 60%, 70%)",
          400: "hsl(15, 60%, 60%)",
          500: "hsl(15, 60%, 50%)",
          600: "hsl(15, 60%, 40%)",
          700: "hsl(15, 60%, 30%)",
          800: "hsl(15, 60%, 20%)",
          900: "hsl(15, 60%, 10%)",
        },
        lavender: {
          50: "hsl(250, 85%, 95%)",
          100: "hsl(250, 85%, 90%)",
          200: "hsl(250, 85%, 80%)",
          300: "hsl(250, 85%, 70%)",
          400: "hsl(250, 85%, 60%)",
          500: "hsl(250, 85%, 50%)",
          600: "hsl(250, 85%, 65%)",
          800: "hsl(250, 85%, 40%)",
        },
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "slide-in-from-top": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "slide-in-from-bottom": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "slide-in-from-left": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-in-from-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "floating": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "gradient-x": {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
        "gradient-y": {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "center top",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "center bottom",
          },
        },
        "gradient-xy": {
          "0%, 100%": {
            "background-size": "400% 400%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "fade-out": "fade-out 0.5s ease-out",
        "slide-in-from-top": "slide-in-from-top 0.3s ease-out",
        "slide-in-from-bottom": "slide-in-from-bottom 0.3s ease-out",
        "slide-in-from-left": "slide-in-from-left 0.3s ease-out",
        "slide-in-from-right": "slide-in-from-right 0.3s ease-out",
        "floating": "floating 3s ease-in-out infinite",
        "gradient-x": "gradient-x 15s ease infinite",
        "gradient-y": "gradient-y 15s ease infinite",
        "gradient-xy": "gradient-xy 15s ease infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
  future: {
    hoverOnlyWhenSupported: true,
  },
} satisfies Config;






