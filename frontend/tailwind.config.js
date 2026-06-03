module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend:{
      keyframes:{ 
        shimmer: {
          "100%": { transform: "translateX(100%)" }
        },
      },
    },
  },
  plugins: [],
}

