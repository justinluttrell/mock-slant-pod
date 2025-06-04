// In-Memory Storage Service
// Provides persistent data storage during server runtime

import type { Order, OrderStatus } from '@/types/orders.js'
import type { Webhook } from '@/types/responses.js'

// Request logging interface
interface RequestLog {
	id: string
	timestamp: Date
	method: string
	path: string
	statusCode: number
	duration: number
	apiKey?: string
	requestBody?: any
	responseBody?: any
}

// Storage state interface
interface StorageState {
	orders: Map<string, Order>
	webhooks: Map<string, Webhook>
	requestLogs: RequestLog[]
	nextOrderId: number
	nextWebhookId: number
}

// Initialize storage state
const storage: StorageState = {
	orders: new Map(),
	webhooks: new Map(),
	requestLogs: [],
	nextOrderId: 1000000, // Start with 7-digit order IDs
	nextWebhookId: 1
}

// Order Management Functions
export class OrderStorage {
	// Create a new order
	static create(orderData: Omit<Order, 'createdAt' | 'updatedAt' | 'status' | 'trackingNumbers'> | Order): Order {
		// Use provided orderId if available, otherwise generate sequential one
		const orderId = 'orderId' in orderData && orderData.orderId 
			? orderData.orderId 
			: storage.nextOrderId.toString()
			
		const orderNumber = 'orderNumber' in orderData && orderData.orderNumber
			? orderData.orderNumber
			: `ORD-${orderId}`
		
		// Only increment if we generated the ID
		if (!('orderId' in orderData && orderData.orderId)) {
			storage.nextOrderId++
		}
		
		const order: Order = {
			...orderData,
			orderId,
			orderNumber,
			createdAt: new Date(),
			updatedAt: new Date(),
			status: ('status' in orderData && orderData.status) ? orderData.status : 'pending' as OrderStatus,
			trackingNumbers: ('trackingNumbers' in orderData && orderData.trackingNumbers) ? orderData.trackingNumbers : []
		}
		
		storage.orders.set(orderId, order)
		return order
	}
	
	// Get order by ID
	static get(orderId: string): Order | undefined {
		return storage.orders.get(orderId)
	}
	
	// Get all orders
	static getAll(): Order[] {
		return Array.from(storage.orders.values())
	}
	
	// Update order status
	static updateStatus(orderId: string, status: OrderStatus): boolean {
		const order = storage.orders.get(orderId)
		if (!order) return false
		
		order.status = status
		order.updatedAt = new Date()
		storage.orders.set(orderId, order)
		return true
	}
	
	// Update order data
	static update(orderId: string, updates: Partial<Order>): boolean {
		const order = storage.orders.get(orderId)
		if (!order) return false
		
		const updatedOrder = { ...order, ...updates, updatedAt: new Date() }
		storage.orders.set(orderId, updatedOrder)
		return true
	}
	
	// Delete order
	static delete(orderId: string): boolean {
		return storage.orders.delete(orderId)
	}
	
	// Get orders by status
	static getByStatus(status: OrderStatus): Order[] {
		return Array.from(storage.orders.values()).filter(order => order.status === status)
	}
	
	// Check if order exists
	static exists(orderId: string): boolean {
		return storage.orders.has(orderId)
	}
}

// Webhook Management Functions
export class WebhookStorage {
	// Create a new webhook
	static create(webhookData: Omit<Webhook, 'registeredAt' | 'deliveryAttempts'>): Webhook {
		const webhook: Webhook = {
			...webhookData,
			registeredAt: new Date(),
			deliveryAttempts: []
		}
		
		// Use endPoint as the key since webhooks are identified by URL
		storage.webhooks.set(webhook.endPoint, webhook)
		return webhook
	}
	
	// Get webhook by endpoint
	static get(endPoint: string): Webhook | undefined {
		return storage.webhooks.get(endPoint)
	}
	
	// Get all webhooks
	static getAll(): Webhook[] {
		return Array.from(storage.webhooks.values())
	}
	
	// Delete webhook
	static delete(endPoint: string): boolean {
		return storage.webhooks.delete(endPoint)
	}
	
	// Check if webhook exists
	static exists(endPoint: string): boolean {
		return storage.webhooks.has(endPoint)
	}
	
	// Get webhooks by URL (same as get since endPoint is the key)
	static getByUrl(url: string): Webhook[] {
		const webhook = storage.webhooks.get(url)
		return webhook ? [webhook] : []
	}
}

// Request Logging Functions
export class RequestLogger {
	// Log a request
	static log(logData: Omit<RequestLog, 'id' | 'timestamp'>): void {
		const log: RequestLog = {
			...logData,
			id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			timestamp: new Date()
		}
		
		storage.requestLogs.push(log)
		
		// Keep only last 1000 logs to prevent memory issues
		if (storage.requestLogs.length > 1000) {
			storage.requestLogs.shift()
		}
	}
	
	// Get all request logs
	static getAll(): RequestLog[] {
		return [...storage.requestLogs]
	}
	
	// Get recent logs (last N)
	static getRecent(count: number = 100): RequestLog[] {
		return storage.requestLogs.slice(-count)
	}
	
	// Get logs by status code
	static getByStatus(statusCode: number): RequestLog[] {
		return storage.requestLogs.filter(log => log.statusCode === statusCode)
	}
	
	// Get logs by path
	static getByPath(path: string): RequestLog[] {
		return storage.requestLogs.filter(log => log.path === path)
	}
	
	// Clear all logs
	static clear(): void {
		storage.requestLogs.length = 0
	}
}

// General Storage Functions
export class Storage {
	// Get storage statistics
	static getStats() {
		return {
			orders: {
				total: storage.orders.size,
				byStatus: {
					pending: Array.from(storage.orders.values()).filter(o => o.status === 'pending').length,
					printing: Array.from(storage.orders.values()).filter(o => o.status === 'printing').length,
					printed: Array.from(storage.orders.values()).filter(o => o.status === 'printed').length,
					shipped: Array.from(storage.orders.values()).filter(o => o.status === 'shipped').length,
					cancelled: Array.from(storage.orders.values()).filter(o => o.status === 'cancelled').length
				}
			},
			webhooks: {
				total: storage.webhooks.size
			},
			requestLogs: {
				total: storage.requestLogs.length
			},
			nextOrderId: storage.nextOrderId
		}
	}
	
	// Clear all data (for testing)
	static clearAll(): void {
		storage.orders.clear()
		storage.webhooks.clear()
		storage.requestLogs.length = 0
		storage.nextOrderId = 1000000
		storage.nextWebhookId = 1
	}
	
	// Get raw storage state (for debugging)
	static getRawState() {
		return {
			orders: Object.fromEntries(storage.orders),
			webhooks: Object.fromEntries(storage.webhooks),
			requestLogs: [...storage.requestLogs],
			nextOrderId: storage.nextOrderId,
			nextWebhookId: storage.nextWebhookId
		}
	}
} 