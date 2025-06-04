// Webhook management endpoints
// POST /api/customer/subscribeWebhook, GET /api/webhooks, DELETE /api/webhooks/{id}

import { Hono } from 'hono'
import type { Context } from 'hono'
import type { 
	SubscribeWebhookRequest,
	SubscribeWebhookResponse,
	Webhook,
	ValidationError
} from '@/types/index.js'
import { authMiddleware } from '@/middleware/index.js'
import { WebhookStorage, RequestLogger } from '@/services/index.js'
import { isValidUrl } from '@/utils/validators.js'

const webhooks = new Hono()

// Validation error helper
function createValidationError(field: string, message: string, code: string = 'INVALID_FORMAT'): ValidationError {
	return {
		error: 'Validation failed',
		details: [{
			field,
			message,
			code
		}]
	}
}

// POST /api/customer/subscribeWebhook - Register webhook endpoint
webhooks.post('/customer/subscribeWebhook', authMiddleware, async (c: Context) => {
	const startTime = Date.now()
	const apiKey = c.get('apiKey')
	
	try {
		const body: SubscribeWebhookRequest = await c.req.json()
		
		// Validate required fields
		if (!body.endPoint) {
			const duration = Date.now() - startTime
			RequestLogger.log({
				method: 'POST',
				path: '/api/customer/subscribeWebhook',
				statusCode: 400,
				duration,
				apiKey,
				requestBody: body,
				responseBody: { error: 'endPoint is required' }
			})
			return c.json(createValidationError('endPoint', 'Endpoint URL is required', 'REQUIRED_FIELD'), 400)
		}
		
		// Validate URL format
		if (!isValidUrl(body.endPoint)) {
			const duration = Date.now() - startTime
			RequestLogger.log({
				method: 'POST',
				path: '/api/customer/subscribeWebhook',
				statusCode: 400,
				duration,
				apiKey,
				requestBody: body,
				responseBody: { error: 'Invalid URL format' }
			})
			return c.json(createValidationError('endPoint', 'Invalid URL format', 'INVALID_URL'), 400)
		}
		
		// Check if webhook already exists
		if (WebhookStorage.exists(body.endPoint)) {
			const duration = Date.now() - startTime
			RequestLogger.log({
				method: 'POST',
				path: '/api/customer/subscribeWebhook',
				statusCode: 400,
				duration,
				apiKey,
				requestBody: body,
				responseBody: { error: 'Webhook already exists' }
			})
			return c.json({ error: 'Webhook endpoint already registered' }, 400)
		}
		
		// Create webhook
		const webhook = WebhookStorage.create({
			endPoint: body.endPoint,
			apiKey: apiKey
		})
		
		const response: SubscribeWebhookResponse = {
			message: 'Endpoint Configured',
			endPoint: body.endPoint
		}
		
		// Log the request
		const duration = Date.now() - startTime
		RequestLogger.log({
			method: 'POST',
			path: '/api/customer/subscribeWebhook',
			statusCode: 200,
			duration,
			apiKey,
			requestBody: body,
			responseBody: response
		})
		
		// TODO: Send test payload to webhook endpoint (will be implemented in webhook delivery service)
		console.log(`📡 Webhook registered: ${body.endPoint}`)
		
		return c.json(response)
		
	} catch (error) {
		const duration = Date.now() - startTime
		RequestLogger.log({
			method: 'POST',
			path: '/api/customer/subscribeWebhook',
			statusCode: 400,
			duration,
			apiKey,
			requestBody: null,
			responseBody: { error: 'Invalid JSON' }
		})
		return c.json(createValidationError('body', 'Invalid JSON in request body', 'INVALID_JSON'), 400)
	}
})

// GET /api/webhooks - List all registered webhooks
webhooks.get('/webhooks', authMiddleware, async (c: Context) => {
	const startTime = Date.now()
	const apiKey = c.get('apiKey')
	
	// Get all webhooks (in real app would filter by API key/user)
	const allWebhooks = WebhookStorage.getAll()
	
	const response = {
		webhooks: allWebhooks,
		totalCount: allWebhooks.length
	}
	
	// Log the request
	const duration = Date.now() - startTime
	RequestLogger.log({
		method: 'GET',
		path: '/api/webhooks',
		statusCode: 200,
		duration,
		apiKey,
		requestBody: null,
		responseBody: { totalCount: allWebhooks.length }
	})
	
	return c.json(response)
})

// DELETE /api/webhooks/{id} - Remove webhook subscription
webhooks.delete('/webhooks/:id', authMiddleware, async (c: Context) => {
	const startTime = Date.now()
	const apiKey = c.get('apiKey')
	const webhookId = c.req.param('id')
	
	if (!webhookId) {
		const duration = Date.now() - startTime
		RequestLogger.log({
			method: 'DELETE',
			path: `/api/webhooks/${webhookId}`,
			statusCode: 400,
			duration,
			apiKey,
			requestBody: null,
			responseBody: { error: 'Webhook ID is required' }
		})
		return c.json({ error: 'Webhook ID is required' }, 400)
	}
	
	// Note: For this mock API, we'll treat the webhook ID as the endpoint URL
	// In a real system, you'd have actual IDs
	const webhookExists = WebhookStorage.exists(webhookId)
	
	if (!webhookExists) {
		const duration = Date.now() - startTime
		RequestLogger.log({
			method: 'DELETE',
			path: `/api/webhooks/${webhookId}`,
			statusCode: 404,
			duration,
			apiKey,
			requestBody: null,
			responseBody: { error: 'Webhook not found' }
		})
		return c.json({ error: 'Webhook not found' }, 404)
	}
	
	// Delete the webhook
	const deleted = WebhookStorage.delete(webhookId)
	
	if (!deleted) {
		const duration = Date.now() - startTime
		RequestLogger.log({
			method: 'DELETE',
			path: `/api/webhooks/${webhookId}`,
			statusCode: 500,
			duration,
			apiKey,
			requestBody: null,
			responseBody: { error: 'Failed to delete webhook' }
		})
		return c.json({ error: 'Failed to delete webhook' }, 500)
	}
	
	const response = {
		message: 'Webhook deleted successfully',
		endPoint: webhookId
	}
	
	// Log the request
	const duration = Date.now() - startTime
	RequestLogger.log({
		method: 'DELETE',
		path: `/api/webhooks/${webhookId}`,
		statusCode: 200,
		duration,
		apiKey,
		requestBody: null,
		responseBody: response
	})
	
	console.log(`🗑️ Webhook deleted: ${webhookId}`)
	
	return c.json(response)
})

// POST /api/webhooks/test - Proxy endpoint for testing webhook delivery (Dashboard use)
webhooks.post('/webhooks/test', async (c: Context) => {
	const startTime = Date.now()
	
	try {
		const body = await c.req.json()
		
		if (!body.endPoint) {
			return c.json({ error: 'endPoint is required' }, 400)
		}
		
		if (!isValidUrl(body.endPoint)) {
			return c.json({ error: 'Invalid URL format' }, 400)
		}
		
		// Create test webhook payload (matching official API format)
		const testPayload = {
			orderId: "1234567890",
			status: "SHIPPED",
			trackingNumber: "ABCDEF123456",
			carrierCode: "usps"
		}
		
		console.log(`🧪 Testing webhook delivery to: ${body.endPoint}`)
		
		// Make the webhook test request from our server (no CORS issues)
		try {
			const webhookResponse = await fetch(body.endPoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'User-Agent': 'Slant3D-Mock-API/1.0'
				},
				body: JSON.stringify(testPayload)
			})
			
			const response = {
				success: true,
				statusCode: webhookResponse.status,
				message: `Test payload sent successfully`,
				payload: testPayload,
				endPoint: body.endPoint
			}
			
			console.log(`✅ Webhook test completed: ${webhookResponse.status}`)
			return c.json(response)
			
		} catch (fetchError) {
			console.log(`❌ Webhook test failed:`, fetchError)
			return c.json({
				success: false,
				error: 'Failed to deliver test payload',
				message: fetchError instanceof Error ? fetchError.message : 'Unknown error',
				endPoint: body.endPoint
			}, 500)
		}
		
	} catch (error) {
		return c.json({ error: 'Invalid JSON in request body' }, 400)
	}
})

export default webhooks 