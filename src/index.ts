// Mock Slant3D API Server
// Built with Bun + Hono + TypeScript for development testing

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/bun'
import type { Context } from 'hono'
import type { HealthResponse } from '@/types/index.js'
import filaments from '@/routes/filaments.js'
import slicer from '@/routes/slicer.js'
import estimate from '@/routes/estimate.js'
import orders from '@/routes/orders.js'
import webhooks from '@/routes/webhooks.js'
import dashboard from '@/routes/dashboard.js'

const app = new Hono()

// Configure CORS for development
app.use('*', cors({
	origin: '*', // Allow all origins for development
	allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowHeaders: ['Content-Type', 'api-key', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}))

// Logging middleware
app.use('*', async (c: Context, next) => {
	const startTime = Date.now()
	console.log(`<-- ${c.req.method} ${c.req.path}`)
	
	await next()
	
	const endTime = Date.now()
	console.log(`--> ${c.req.method} ${c.req.path} ${c.res.status} ${endTime - startTime}ms`)
})

// Serve static assets for dashboard
app.use('/assets/*', serveStatic({ 
	root: './src/web/dist',
	rewriteRequestPath: (path) => path.replace(/^\/assets/, '/assets')
}))

// Mount API routes - specific routes first to avoid conflicts
app.route('/api/dashboard', dashboard)  // Dashboard API routes
app.route('/api/filament', filaments)
app.route('/api/slicer', slicer)
app.route('/api/order', orders)         // Order routes (handles /api/order, /api/order/, /api/order/{id}, etc.) - MUST come before estimate routes
app.route('/api', estimate)             // Estimate routes (handles /api/order/estimate and /api/order/estimateShipping)
app.route('/api', webhooks)             // Webhook routes (includes /customer/subscribeWebhook and /webhooks)

// Public endpoints (no auth required)
app.get('/', (c: Context) => {
	return c.text('Mock Slant3D API - Development Server')
})

app.get('/health', (c: Context) => {
	const response: HealthResponse = {
		status: 'healthy',
		timestamp: new Date(),
		uptime: Math.floor(process.uptime()),
		version: '1.0.0'
	}
	return c.json(response)
})

app.get('/api', (c: Context) => {
	return c.json({
		message: 'Mock Slant3D API - Official Format Only',
		version: '1.0.0',
		endpoints: [
			'GET /api/filament',
			'POST /api/slicer',
			'POST /api/order/estimate', 
			'POST /api/order/estimateShipping',
			'POST /api/order',
			'GET /api/order',
			'GET /api/order/{id}/get-tracking',
			'DELETE /api/order/{id}',
			'POST /api/customer/subscribeWebhook'
		],
		format: 'Official Slant3D API - snake_case fields, array-based requests'
	})
})

// Dashboard - serve React app
app.get('/dashboard', async (c: Context) => {
	try {
		const file = Bun.file('./src/web/dist/index.html')
		const html = await file.text()
		return c.html(html)
	} catch (error) {
		console.error('Error serving dashboard:', error)
		return c.html(`
			<!DOCTYPE html>
			<html>
			<head>
				<title>Mock Slant3D Dashboard</title>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width, initial-scale=1">
			</head>
			<body>
				<h1>🎯 Mock Slant3D Dashboard</h1>
				<p>Dashboard build not found. Please run: <code>cd src/web && bun run build</code></p>
				<p><a href="/api">View API endpoints</a></p>
			</body>
			</html>
		`)
	}
})

// 404 handler
app.notFound((c: Context) => {
	return c.json({ error: 'Endpoint not found' }, 404)
})

// Error handler
app.onError((err, c: Context) => {
	console.error('Server error:', err)
	return c.json({ error: 'Internal server error' }, 500)
})

// Start server
const port = parseInt(process.env['PORT'] || '4000', 10)

console.log(`🚀 Mock Slant3D API starting on port ${port}`)
console.log(`📍 Health check: http://localhost:${port}/health`)
console.log(`📋 Dashboard: http://localhost:${port}/dashboard`)
console.log(`🔗 API info: http://localhost:${port}/api`)

export default {
	port,
	fetch: app.fetch,
} 