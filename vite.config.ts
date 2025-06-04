import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	root: 'src/web',
	build: {
		outDir: '../../dist/web',
		emptyOutDir: true,
		sourcemap: true
	},
	resolve: {
		alias: {
			'@': resolve(__dirname, './src'),
			'@/types': resolve(__dirname, './src/types'),
			'@/services': resolve(__dirname, './src/services'),
			'@/utils': resolve(__dirname, './src/utils'),
			'@/data': resolve(__dirname, './data')
		}
	},
	server: {
		port: 5173,
		proxy: {
			'/api': {
				target: 'http://localhost:3000',
				changeOrigin: true
			},
			'/health': {
				target: 'http://localhost:3000',
				changeOrigin: true
			}
		}
	}
}) 