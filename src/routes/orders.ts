// Order management endpoints - Official Slant3D API format only
// POST /api/order, GET /api/order/, DELETE /api/order/{id}, GET /api/order/{id}/get-tracking

import { Hono } from 'hono'
import type { Context } from 'hono'
import type { 
	OrderTrackingResponse,
	OrdersListResponse,
	Order,
	OrderStatus,
	Address,
	SlantOrderItem,
	SlantCreateOrderRequest,
	SlantCreateOrderResponse,
	FilamentProfile,
	ValidationError
} from '@/types/index.js'
import { authMiddleware } from '@/middleware/index.js'
import { OrderStorage, RequestLogger } from '@/services/index.js'
import { 
	generateOrderId,
	generateOrderNumber,
	generateComplexityFactor,
	calculateShippingCost
} from '@/utils/generators.js'

const orders = new Hono()

// POST /api/order - Create a new order (Official Slant3D API format)
orders.post('/', authMiddleware, async (c: Context) => {
	const startTime = Date.now()
	const apiKey = c.get('apiKey')
	
	try {
		const body: SlantCreateOrderRequest = await c.req.json()
		
		// Validate the request format
		const validationError = validateSlantOrderItems(body)
		if (validationError) {
			const duration = Date.now() - startTime
			RequestLogger.log({
				method: 'POST',
				path: '/api/order',
				statusCode: 400,
				duration,
				apiKey,
				requestBody: body,
				responseBody: validationError
			})
			return c.json(validationError, 400)
		}

		// For now, process only the first order item (multi-item orders can be implemented later)
		const orderItem = body[0]!
		
		// Generate order identifiers
		const orderId = generateOrderId()
		
		// Calculate pricing
		const basePrice = 2.50
		const complexityMultiplier = generateComplexityFactor()
		const quantityInt = parseInt(orderItem.order_quantity, 10)
		const printingCost = Math.round((basePrice * complexityMultiplier * quantityInt) * 100) / 100
		const shippingCost = calculateShippingCost(orderItem.ship_to_zip, orderItem.ship_to_is_US_residential)
		const totalPrice = Math.round((printingCost + shippingCost) * 100) / 100
		
		// Create billing address from official format
		const billingAddress: Address = {
			firstName: orderItem.name.split(' ')[0] || '',
			lastName: orderItem.name.split(' ').slice(1).join(' ') || '',
			address1: orderItem.bill_to_street_1,
			city: orderItem.bill_to_city,
			state: orderItem.bill_to_state,
			zip: orderItem.bill_to_zip,
			country: orderItem.bill_to_country_as_iso,
			...(orderItem.bill_to_street_2 && { address2: orderItem.bill_to_street_2 }),
			...(orderItem.phone && { phone: orderItem.phone })
		}
		
		// Create shipping address from official format
		const shippingAddress: Address = {
			firstName: orderItem.ship_to_name.split(' ')[0] || '',
			lastName: orderItem.ship_to_name.split(' ').slice(1).join(' ') || '',
			address1: orderItem.ship_to_street_1,
			city: orderItem.ship_to_city,
			state: orderItem.ship_to_state,
			zip: orderItem.ship_to_zip,
			country: orderItem.ship_to_country_as_iso,
			...(orderItem.ship_to_street_2 && { address2: orderItem.ship_to_street_2 })
		}
		
		// Create order object
		const order: Order = {
			orderId,
			orderNumber: orderItem.orderNumber,
			status: 'pending' as OrderStatus,
			filename: orderItem.filename,
			fileURL: orderItem.fileURL,
			quantity: orderItem.order_quantity,
			color: orderItem.order_item_color,
			profile: (orderItem.profile || 'PLA') as FilamentProfile,
			totalPrice,
			shippingCost,
			printingCost,
			trackingNumbers: [],
			createdAt: new Date(),
			updatedAt: new Date(),
			billingAddress,
			shippingAddress,
			email: orderItem.email,
			residential: orderItem.ship_to_is_US_residential === 'true'
		}
		
		// Store the order
		OrderStorage.create(order)
		
		// Official API response format
		const response: SlantCreateOrderResponse = {
			orderId
		}
		
		// Log the request
		const duration = Date.now() - startTime
		RequestLogger.log({
			method: 'POST',
			path: '/api/order',
			statusCode: 200,
			duration,
			apiKey,
			requestBody: body,
			responseBody: response
		})
		
		return c.json(response)
	} catch (error) {
		const duration = Date.now() - startTime
		RequestLogger.log({
			method: 'POST',
			path: '/api/order',
			statusCode: 400,
			duration,
			apiKey,
			requestBody: null,
			responseBody: { error: 'Invalid JSON in request body' }
		})
		return c.json({ error: 'Invalid JSON in request body' }, 400)
	}
})

// GET /api/order/ - List all orders for the API key (Official API format - minimal response)
orders.get('/', authMiddleware, async (c: Context) => {
	const startTime = Date.now()
	const apiKey = c.get('apiKey')
	
	// Get all orders (in real app would filter by API key/user)
	const allOrders = OrderStorage.getAll()
	
	// Convert to official API format - minimal response with only orderId and orderTimestamp
	const ordersData = allOrders.map(order => {
		// Convert ISO date to Firebase timestamp format
		const createdDate = new Date(order.createdAt)
		const seconds = Math.floor(createdDate.getTime() / 1000)
		const nanoseconds = (createdDate.getTime() % 1000) * 1000000
		
		return {
			orderId: parseInt(order.orderId), // Convert string to number for official format
			orderTimestamp: {
				_seconds: seconds,
				_nanoseconds: nanoseconds
			}
		}
	})
	
	const response: OrdersListResponse = {
		ordersData
	}
	
	// Log the request
	const duration = Date.now() - startTime
	RequestLogger.log({
		method: 'GET',
		path: '/api/order',
		statusCode: 200,
		duration,
		apiKey,
		requestBody: null,
		responseBody: { orderCount: ordersData.length }
	})
	
	return c.json(response)
})

// DELETE /api/order/{id} - Cancel an order (Official API format)
orders.delete('/:id', authMiddleware, async (c: Context) => {
	const startTime = Date.now()
	const apiKey = c.get('apiKey')
	const orderId = c.req.param('id')
	
	if (!orderId) {
		const duration = Date.now() - startTime
		RequestLogger.log({
			method: 'DELETE',
			path: `/api/order/${orderId}`,
			statusCode: 400,
			duration,
			apiKey,
			requestBody: null,
			responseBody: { error: 'Order ID is required' }
		})
		return c.json({ error: 'Order ID is required' }, 400)
	}
	
	// Check if order exists
	if (!OrderStorage.exists(orderId)) {
		const duration = Date.now() - startTime
		RequestLogger.log({
			method: 'DELETE',
			path: `/api/order/${orderId}`,
			statusCode: 404,
			duration,
			apiKey,
			requestBody: null,
			responseBody: { error: 'Order not found' }
		})
		return c.json({ error: 'Order not found' }, 404)
	}
	
	// Get current order to check status
	const order = OrderStorage.get(orderId)
	if (!order) {
		const duration = Date.now() - startTime
		RequestLogger.log({
			method: 'DELETE',
			path: `/api/order/${orderId}`,
			statusCode: 404,
			duration,
			apiKey,
			requestBody: null,
			responseBody: { error: 'Order not found' }
		})
		return c.json({ error: 'Order not found' }, 404)
	}
	
	// Check if order can be cancelled (not already shipped)
	if (order.status === 'shipped') {
		const duration = Date.now() - startTime
		RequestLogger.log({
			method: 'DELETE',
			path: `/api/order/${orderId}`,
			statusCode: 400,
			duration,
			apiKey,
			requestBody: null,
			responseBody: { error: 'Cannot cancel shipped order' }
		})
		return c.json({ error: 'Cannot cancel shipped order' }, 400)
	}
	
	if (order.status === 'cancelled') {
		const duration = Date.now() - startTime
		RequestLogger.log({
			method: 'DELETE',
			path: `/api/order/${orderId}`,
			statusCode: 400,
			duration,
			apiKey,
			requestBody: null,
			responseBody: { error: 'Order already cancelled' }
		})
		return c.json({ error: 'Order already cancelled' }, 400)
	}
	
	// Update order status to cancelled
	OrderStorage.updateStatus(orderId, 'cancelled')
	
	// Official API response format
	const response = {
		status: 'Order cancelled'
	}
	
	// Log the request
	const duration = Date.now() - startTime
	RequestLogger.log({
		method: 'DELETE',
		path: `/api/order/${orderId}`,
		statusCode: 200,
		duration,
		apiKey,
		requestBody: null,
		responseBody: response
	})
	
	return c.json(response)
})

// GET /api/order/{id}/get-tracking - Get order tracking information (Official API format)
orders.get('/:id/get-tracking', authMiddleware, async (c: Context) => {
	const startTime = Date.now()
	const apiKey = c.get('apiKey')
	const orderId = c.req.param('id')
	
	if (!orderId) {
		const duration = Date.now() - startTime
		RequestLogger.log({
			method: 'GET',
			path: `/api/order/${orderId}/get-tracking`,
			statusCode: 400,
			duration,
			apiKey,
			requestBody: null,
			responseBody: { error: 'Order ID is required' }
		})
		return c.json({ error: 'Order ID is required' }, 400)
	}
	
	// Check if order exists
	if (!OrderStorage.exists(orderId)) {
		const duration = Date.now() - startTime
		RequestLogger.log({
			method: 'GET',
			path: `/api/order/${orderId}/get-tracking`,
			statusCode: 404,
			duration,
			apiKey,
			requestBody: null,
			responseBody: { error: 'Order not found' }
		})
		return c.json({ error: 'Order not found' }, 404)
	}
	
	// Official API tracking response format
	const order = OrderStorage.get(orderId)
	const response: OrderTrackingResponse = {
		status: order?.status || 'unknown',
		trackingNumbers: order?.trackingNumbers || []
	}
	
	// Log the request
	const duration = Date.now() - startTime
	RequestLogger.log({
		method: 'GET',
		path: `/api/order/${orderId}/get-tracking`,
		statusCode: 200,
		duration,
		apiKey,
		requestBody: null,
		responseBody: response
	})
	
	return c.json(response)
})

// Validation function for official Slant3D API format
function validateSlantOrderItems(orderItems: SlantOrderItem[]): ValidationError | null {
	if (!Array.isArray(orderItems) || orderItems.length === 0) {
		return {
			error: 'Validation failed',
			details: [{
				field: 'order',
				message: 'Order must be a non-empty array of order items',
				code: 'INVALID_FORMAT'
			}]
		}
	}

	for (let i = 0; i < orderItems.length; i++) {
		const item = orderItems[i]!
		const prefix = `order[${i}]`

		// Required fields validation
		const requiredFields = [
			'email', 'phone', 'name', 'orderNumber', 'filename', 'fileURL',
			'bill_to_street_1', 'bill_to_city', 'bill_to_state', 'bill_to_zip', 'bill_to_country_as_iso',
			'ship_to_name', 'ship_to_street_1', 'ship_to_city', 'ship_to_state', 'ship_to_zip', 'ship_to_country_as_iso',
			'order_item_name', 'order_quantity', 'order_item_color'
		]

		for (const field of requiredFields) {
			if (!item[field as keyof SlantOrderItem]) {
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

export default orders 