import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#131A2B",        // near-black navy for text
        slate: {
          50: "#F6F7F9",
          100: "#EDEFF3",
        },
        navy: {
          DEFAULT: "#1B2A4A",
          700: "#22335A",
          800: "#182543",
          900: "#101A30",
        },
        amber: {
          DEFAULT: "#D98F3D",
          light: "#F3D8B3",
        },
        moss: {
          DEFAULT: "#3E6B57",
          light: "#DCE9E1",
        },
        brick: {
          DEFAULT: "#B4483A",
          light: "#F3DBD7",
        },
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "10px",
      },
    },
  },
  plugins: [],
};
export default config;
