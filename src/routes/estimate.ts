// Estimate endpoints for order and shipping cost calculation - Official Slant3D API format only
// POST /api/order/estimate, POST /api/order/estimateShipping

import { Hono } from 'hono'
import type { Context } from 'hono'
import type { 
	OrderEstimateResponse,
	ShippingEstimateResponse,
	SlantOrderEstimateRequest,
	SlantShippingEstimateRequest,
	ValidationError
} from '@/types/index.js'
import { authMiddleware } from '@/middleware/index.js'
import { RequestLogger } from '@/services/index.js'
import { 
	generateComplexityFactor,
	calculateShippingCost
} from '@/utils/generators.js'

const estimate = new Hono()

// POST /api/order/estimate - Calculate order pricing estimate (Official Slant3D API format)
estimate.post('/order/estimate', authMiddleware, async (c: Context) => {
	const startTime = Date.now()
	const apiKey = c.get('apiKey')
	
	try {
		const body: SlantOrderEstimateRequest = await c.req.json()
		
		// Validate the request format (same validation as order creation)
		const validationError = validateSlantOrderItems(body)
		if (validationError) {
			const duration = Date.now() - startTime
			RequestLogger.log({
				method: 'POST',
				path: '/api/order/estimate',
				statusCode: 400,
				duration,
				apiKey,
				requestBody: body,
				responseBody: validationError
			})
			return c.json(validationError, 400)
		}

		// For now, process only the first order item (multi-item estimates can be implemented later)
		const orderItem = body[0]!
		
		// Calculate pricing using same logic as order creation
		const basePrice = 2.50
		const complexityMultiplier = generateComplexityFactor()
		const quantityInt = parseInt(orderItem.order_quantity, 10)
		const printingCost = Math.round((basePrice * complexityMultiplier * quantityInt) * 100) / 100
		
		// Calculate shipping cost
		const shippingCost = calculateShippingCost(orderItem.ship_to_zip, orderItem.ship_to_is_US_residential)
		const totalPrice = Math.round((printingCost + shippingCost) * 100) / 100
		
		const response: OrderEstimateResponse = {
			totalPrice,
			shippingCost,
			printingCost
		}
		
		// Log the request
		const duration = Date.now() - startTime
		RequestLogger.log({
			method: 'POST',
			path: '/api/order/estimate',
			statusCode: 200,
			duration,
			apiKey,
			requestBody: {
				fileURL: orderItem.fileURL,
				quantity: orderItem.order_quantity,
				color: orderItem.order_item_color,
				profile: orderItem.profile,
				residential: orderItem.ship_to_is_US_residential,
				shipZip: orderItem.ship_to_zip
			},
			responseBody: response
		})
		
		return c.json(response)
	} catch (error) {
		const duration = Date.now() - startTime
		RequestLogger.log({
			method: 'POST',
			path: '/api/order/estimate',
			statusCode: 400,
			duration,
			apiKey,
			requestBody: null,
			responseBody: { error: 'Invalid JSON in request body' }
		})
		return c.json({ error: 'Invalid JSON in request body' }, 400)
	}
})

// POST /api/order/estimateShipping - Calculate shipping cost estimate (Official Slant3D API format)
estimate.post('/order/estimateShipping', authMiddleware, async (c: Context) => {
	const startTime = Date.now()
	const apiKey = c.get('apiKey')
	
	try {
		const body: SlantShippingEstimateRequest = await c.req.json()
		
		// Validate the request format (same validation as order creation)
		const validationError = validateSlantOrderItems(body)
		if (validationError) {
			const duration = Date.now() - startTime
			RequestLogger.log({
				method: 'POST',
				path: '/api/order/estimateShipping',
				statusCode: 400,
				duration,
				apiKey,
				requestBody: body,
				responseBody: validationError
			})
			return c.json(validationError, 400)
		}

		// For now, process only the first order item (multi-item shipping estimates can be implemented later)
		const orderItem = body[0]!
		
		// Calculate shipping cost
		const shippingCost = calculateShippingCost(orderItem.ship_to_zip, orderItem.ship_to_is_US_residential)
		
		const response: ShippingEstimateResponse = {
			shippingCost,
			currencyCode: 'usd'
		}
		
		// Log the request
		const duration = Date.now() - startTime
		RequestLogger.log({
			method: 'POST',
			path: '/api/order/estimateShipping',
			statusCode: 200,
			duration,
			apiKey,
			requestBody: {
				residential: orderItem.ship_to_is_US_residential,
				shipZip: orderItem.ship_to_zip,
				quantity: orderItem.order_quantity
			},
			responseBody: response
		})
		
		return c.json(response)
	} catch (error) {
		const duration = Date.now() - startTime
		RequestLogger.log({
			method: 'POST',
			path: '/api/order/estimateShipping',
			statusCode: 400,
			duration,
			apiKey,
			requestBody: null,
			responseBody: { error: 'Invalid JSON in request body' }
		})
		return c.json({ error: 'Invalid JSON in request body' }, 400)
	}
})

// Validation function for official Slant3D API format (shared with orders.ts)
function validateSlantOrderItems(orderItems: any[]): ValidationError | null {
	if (!Array.isArray(orderItems) || orderItems.length === 0) {
		return {
			error: 'Validation failed',
			details: [{
				field: 'order',
				message: 'Request must be a non-empty array of order items',
				code: 'INVALID_FORMAT'
			}]
		}
	}

	for (let i = 0; i < orderItems.length; i++) {
		const item = orderItems[i]!
		const prefix = `order[${i}]`

		// Required fields validation for estimates
		const requiredFields = [
			'email', 'phone', 'name', 'orderNumber', 'filename', 'fileURL',
			'bill_to_street_1', 'bill_to_city', 'bill_to_state', 'bill_to_zip', 'bill_to_country_as_iso',
			'ship_to_name', 'ship_to_street_1', 'ship_to_city', 'ship_to_state', 'ship_to_zip', 'ship_to_country_as_iso',
			'order_item_name', 'order_quantity', 'order_item_color'
		]

		for (const field of requiredFields) {
			if (!item[field]) {
				return {
					error: 'Validation failed',
					details: [{
						field: `${prefix}.${field}`,
						message: `${field} is required`,
						code: 'REQUIRED_FIELD'
					}]
				}
			}
		}

		// Format validations
		if (!/^\d+$/.test(item.order_quantity)) {
			return {
				error: 'Validation failed',
				details: [{
					field: `${prefix}.order_quantity`,
					message: 'Quantity must be a positive integer string',
					code: 'INVALID_QUANTITY'
				}]
			}
		}
	}

	return null
}

export default estimate 