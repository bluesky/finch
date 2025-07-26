/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./index.html",
	"./src/**/*.json",
    "./src/**/*.{js,ts,jsx,tsx, mdx}",
  ],
  theme: {
  	extend: {
  		boxShadow: {
  			right: '4px 0 6px -1px rgba(0, 0, 0, 0.1), 6px 0 10px -1px rgba(0, 0, 0, 0.1)'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {},
		keyframes: {
			flash: {
				'0%, 100%': { backgroundColor: 'transparent' },
				'50%': { backgroundColor: '#fef08a' }, // Yellow flash
			},
		},
		animation: {
			flash1: 'flash 0.5s ease-in-out', // 1-second flash animation
			flash2: 'flash 0.5s ease-in-out', // 1-second flash animation
		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
}

