/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        paper: "#FDFAF3",
        surface: "#FFFFFF",
        ink: "#2F2A25",
        muted: "#7B7167",
        line: "#E9DDC7",
        primary: "#2F8F6B",
        primaryDark: "#1F6F54",
        coral: "#E96C5F",
        sun: "#F5B84B",
        sky: "#7DB7D9",
        lavender: "#9A86C8"
      },
      fontFamily: {
        display: ["PatrickHand"],
        body: ["Nunito"]
      },
      borderRadius: {
        paper: "8px"
      }
    }
  },
  plugins: []
};
