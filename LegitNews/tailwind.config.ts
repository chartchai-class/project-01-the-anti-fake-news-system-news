import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue}", // adjust to your project
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;
