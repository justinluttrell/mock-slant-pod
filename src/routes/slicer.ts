// Slicer endpoint  
// POST /api/slicer - Mock file processing with pricing calculation

import { Hono } from 'hono'
import type { Context } from 'hono'
import type { SliceResponse } from '@/types/index.js'
import { authMiddleware } from '@/middleware/index.js'
import { RequestLogger } from '@/services/index.js'
import { generateComplexityFactor } from '@/utils/generators.js'

const slicer = new Hono()

// Validation middleware for slicer request
async function validateSlicerRequest(c: Context, next: Function) {
	try {
		const body = await c.req.json()
		
		if (!body.fileURL) {
			return c.json({ error: 'fileURL is required' }, 400)
		}
		
		if (typeof body.fileURL !== 'string') {
			return c.json({ error: 'fileURL must be a string' }, 400)
		}
		
		await next()
	} catch (error) {
		return c.json({ error: 'Invalid JSON in request body' }, 400)
	}
}

// POST /api/slicer - Process STL file for slicing
slicer.post('/', authMiddleware, validateSlicerRequest, async (c: Context) => {
	const startTime = Date.now()
	const apiKey = c.get('apiKey')
	const body = await c.req.json()
	
	// Mock processing delay (2-5 seconds as specified)
	const processingDelay = Math.floor(Math.random() * 3000) + 2000 // 2000-5000ms
	await new Promise(resolve => setTimeout(resolve, processingDelay))
	
	// Calculate mock pricing - simplified for slicer endpoint
	const basePrice = 2.50 // Base price from task specification
	const complexityMultiplier = generateComplexityFactor() // 0.8 to 2.5x multiplier
	
	// Calculate final price (no quantity for slicer - that's in order creation)
	const totalPrice = Math.round((basePrice * complexityMultiplier) * 100) / 100
	
	// Create response with price as string with dollar sign (matching official API)
	const response: SliceResponse = {
		message: 'Slicing successful',
		data: {
			price: `$${totalPrice.toFixed(2)}`
		}
	}
	
	// Log the request
	const duration = Date.now() - startTime
	RequestLogger.log({
		method: 'POST',
		path: '/api/slicer',
		statusCode: 200,
		duration,
		apiKey,
		requestBody: {
			fileURL: body.fileURL
		},
		responseBody: response
	})
	
	return c.json(response)
})

export default slicer 