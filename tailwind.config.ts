import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				/* Executive Editorial design tokens (Stitch) */
				surface: '#07090e',
				'surface-dim': '#07090e',
				'surface-canvas': '#05060a',
				'surface-container-lowest': '#030407',
				'surface-container-low': '#0b0e16',
				'surface-container': '#0f131d',
				'surface-container-high': '#161b26',
				'surface-container-highest': '#1c2230',
				'surface-card': '#0c0f17',
				'surface-overlay': '#101624',
				'surface-bright': '#222a3d',
				'surface-variant': '#1a2130',
				'surface-lowest': '#030407',
				'surface-low': '#0b0e16',
				'surface-high': '#161b26',
				'surface-highest': '#1c2230',
				champagne: '#f3e8d2',
				'champagne-dim': '#c2b49c',
				platinum: '#e2e8f0',
				'metric-highlight': '#60A5FA',
				metric: '#60A5FA',
				'border-subtle': 'rgba(255, 255, 255, 0.07)',
				'border-active': '#60A5FA',
				'text-primary': '#F8FAFC',
				'text-muted': '#64748b',
				'on-surface': '#dae2fd',
				'on-surface-variant': '#9ba3b8',
				'brand-accent-glow': 'rgba(59, 130, 246, 0.12)',
				lavender: '#d0bcff',
				tertiary: {
					DEFAULT: '#34d399',
					container: '#00a572'
				},
				'tertiary-container': '#00a572',
				ink: {
					muted: '#64748b',
					soft: '#9ba3b8'
				}
			},
			borderColor: {
				subtle: 'rgba(255, 255, 255, 0.07)',
			},
			fontFamily: {
				sans: ['var(--font-inter)', 'sans-serif'],
				display: ['var(--font-jakarta)', 'sans-serif'],
				mono: ['var(--font-jetbrains-mono)', 'monospace'],
				'font-sans': ['var(--font-inter)', 'sans-serif'],
				'font-display': ['var(--font-jakarta)', 'sans-serif'],
				'font-mono': ['var(--font-jetbrains-mono)', 'monospace'],
				'headline-lg': ['Plus Jakarta Sans', 'Space Grotesk', 'sans-serif'],
				'headline-md': ['Plus Jakarta Sans', 'Space Grotesk', 'sans-serif'],
				'headline-sm': ['Plus Jakarta Sans', 'sans-serif'],
				'display-xl': ['Plus Jakarta Sans', 'Space Grotesk', 'sans-serif'],
				'body-lg': ['Inter', 'sans-serif'],
				'body-md': ['Inter', 'sans-serif'],
				'body-sm': ['Inter', 'sans-serif'],
				'label-code': ['JetBrains Mono', 'monospace'],
				'label-kpi': ['Plus Jakarta Sans', 'JetBrains Mono', 'sans-serif']
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-secondary': 'var(--gradient-secondary)',
				'gradient-accent': 'var(--gradient-accent)',
				'gradient-hero': 'var(--gradient-hero)',
			},
			boxShadow: {
				'soft': 'var(--shadow-soft)',
				'glow': 'var(--shadow-glow)',
				'card': 'var(--shadow-card)',
			},
			transitionTimingFunction: {
				'smooth': 'var(--transition-smooth)',
				'spring': 'var(--transition-spring)',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-up': {
					from: {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					to: {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'scale-in': {
					from: {
						opacity: '0',
						transform: 'scale(0.95)'
					},
					to: {
						opacity: '1',
						transform: 'scale(1)'
					}
				},
				'spin-slow': {
					from: { transform: 'rotate(0deg)' },
					to: { transform: 'rotate(360deg)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-up': 'fade-up 0.6s ease-out',
				'scale-in': 'scale-in 0.3s ease-out',
				'spin-slow': 'spin-slow 4s linear infinite'
			}
		}
	},
	plugins: [
		require("tailwindcss-animate"),
		plugin(({ addBase }) => {
			addBase({
				':root': {
					'--font-jetbrains-mono': 'var(--font-mono)',
				},
			});
		}),
	],
} satisfies Config;
