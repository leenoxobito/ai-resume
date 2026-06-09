// module.exports = {
//   darkMode: 'class',
//   content: ["./src/**/*.{js,jsx}"],
//   theme: {
//     extend:{
//       keyframes:{ 
//         shimmer: {
//           "100%": { transform: "translateX(100%)" }
//         },
//       },
//     },
//   },
//   plugins: [],
// }

module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        base: '#0c0c10',
        surface: '#13131a',
        card: '#17171f',
        border: '#22222e',
        accent: '#6c63ff',
        'accent-dim': '#6c63ff22',
        muted: '#6b6b80',
      },
      keyframes: {
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite',
        fadeUp: 'fadeUp 0.4s ease forwards',
      },
    },
  },
  plugins: [],
}
