import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
        green: {
          100: "hsl(140, 60%, 95%)",
          500: "hsl(140, 60%, 50%)",
          600: "hsl(140, 60%, 45%)",
          800: "hsl(140, 60%, 30%)",
        },
        blue: {
          100: "hsl(210, 95%, 95%)",
          500: "hsl(210, 95%, 60%)",
          600: "hsl(210, 95%, 55%)",
          800: "hsl(210, 95%, 35%)",
        },
        purple: {
          100: "hsl(270, 95%, 95%)",
          500: "hsl(270, 95%, 70%)",
          600: "hsl(270, 95%, 65%)",
          800: "hsl(270, 95%, 40%)",
        },
        orange: {
          100: "hsl(25, 95%, 95%)",
          500: "hsl(25, 95%, 60%)",
          600: "hsl(25, 95%, 55%)",
          800: "hsl(25, 95%, 35%)",
        },
        pink: {
          100: "hsl(330, 85%, 95%)",
          500: "hsl(330, 85%, 65%)",
          600: "hsl(330, 85%, 60%)",
          800: "hsl(330, 85%, 40%)",
        },
        indigo: {
          100: "hsl(250, 85%, 95%)",
          500: "hsl(250, 85%, 70%)",
          600: "hsl(250, 85%, 65%)",
          800: "hsl(250, 85%, 40%)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        float: {
          "0%, 100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-10px)",
          },
        },
        "pulse-grow": {
          "0%, 100%": {
            transform: "scale(1)",
          },
          "50%": {
            transform: "scale(1.05)",
          },
        },
        "garden-grow": {
          "0%": {
            transform: "scale(0) rotate(0deg)",
            opacity: "0",
          },
          "50%": {
            transform: "scale(1.2) rotate(180deg)",
            opacity: "0.8",
          },
          "100%": {
            transform: "scale(1) rotate(360deg)",
            opacity: "1",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 3s ease-in-out infinite",
        "pulse-grow": "pulse-grow 2s ease-in-out infinite",
        "garden-grow": "garden-grow 0.8s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
