// API key validation middleware
// Validates 'api-key' header for protected endpoints

import type { Context, Next } from 'hono'
import type { ApiKeyError } from '@/types/index.js'
import { isValidApiKey } from '@/utils/validators.js'

// Middleware to validate API key for protected endpoints
export async function authMiddleware(c: Context, next: Next) {
	// Get API key from header
	const apiKey = c.req.header('api-key')
	
	// Check if API key is provided and valid (non-empty)
	if (!apiKey || !isValidApiKey(apiKey)) {
		const errorResponse: ApiKeyError = {
			error: 'API key required'
		}
		
		return c.json(errorResponse, 401)
	}
	
	// Store the API key in context for potential use in routes
	c.set('apiKey', apiKey)
	
	// Continue to next middleware/route
	await next()
}

// Helper to create protected route group with auth middleware
export function createProtectedRoutes() {
	// This will be used in route files to apply auth middleware
	return authMiddleware
} 