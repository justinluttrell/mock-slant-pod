// Health check endpoint
// Container health monitoring for Docker deployment

import { Hono } from 'hono'
import type { HealthResponse } from '@/types/index.js'

const health = new Hono()

// Server start time for uptime calculation
const startTime = Date.now()

// GET /health - Health check endpoint
health.get('/', (c) => {
	const uptime = Math.floor((Date.now() - startTime) / 1000)
	
	const healthResponse: HealthResponse = {
		status: 'healthy',
		timestamp: new Date(),
		uptime,
		version: '1.0.0'
	}
	
	return c.json(healthResponse)
})

export { health } 