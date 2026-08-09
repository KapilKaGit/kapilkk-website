import type { Config } from 'tailwindcss';
const config: Config = { content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'], theme: { extend: { colors: { archive: { bg: '#f5efe3', paper: '#fffaf0', ink: '#221b14', muted: '#776b5f', line: '#e5d9c8', accent: '#9a5f2c' } }, boxShadow: { soft: '0 20px 60px rgba(73, 48, 24, 0.10)' } } }, plugins: [] };
export default config;
