// Response schema definitions  
// Specific response schemas for each API endpoint

import type { 
	Filament, 
	Order, 
	OrderEstimateResponse, 
	ShippingEstimateResponse,
	CreateOrderResponse,
	OrderTrackingResponse,
	OrdersListResponse
} from './orders.js'
import type { SliceResponse, ApiKeyError, ValidationError } from './api.js'

// GET /api/filament response (confirmed from API testing)
export interface FilamentListResponse {
	filaments: Filament[]  // Array of 13 confirmed filaments
}

// POST /api/slicer response (confirmed format)
export type SlicerResponse = SliceResponse

// POST /api/order/estimate response (confirmed format)
export type EstimateOrderResponse = OrderEstimateResponse

// POST /api/order/estimateShipping response (confirmed format)
export type EstimateShippingResponse = ShippingEstimateResponse

// POST /api/order response (order creation)
export type CreateOrderApiResponse = CreateOrderResponse

// GET /api/order/{orderId}/get-tracking response (confirmed discrepancy)
export type GetTrackingResponse = OrderTrackingResponse

// GET /api/order/ response (list all orders)
export type ListOrdersResponse = OrdersListResponse

// DELETE /api/order/{orderId} response
export interface CancelOrderResponse {
	orderId: string
	status: 'cancelled'
	message: string
}

// Webhook management interfaces
export interface Webhook {
	endPoint: string
	apiKey: string
	registeredAt: Date
	deliveryAttempts: WebhookDelivery[]
}

export interface WebhookDelivery {
	id: string
	timestamp: Date
	success: boolean
	responseCode?: number
	error?: string
	retryCount: number
}

// POST /api/customer/subscribeWebhook request
export interface SubscribeWebhookRequest {
	endPoint: string
}

// POST /api/customer/subscribeWebhook response
export interface SubscribeWebhookResponse {
	message: string
	endPoint: string
}

// Webhook payload sent to subscribed endpoints
export interface WebhookPayload {
	orderId: string
	orderNumber: string
	status: string
	timestamp: Date
	trackingNumbers?: string[]
}

// Dashboard-specific response types
export interface DashboardStats {
	totalRequests: number
	activeOrders: number
	registeredWebhooks: number
	apiStatus: 'healthy' | 'degraded' | 'down'
	uptime: number
}

export interface ApiRequestLog {
	id: string
	timestamp: Date
	method: string
	endpoint: string
	apiKey: string
	statusCode: number
	responseTime: number
	userAgent?: string
}

// Health check response
export interface HealthResponse {
	status: 'healthy'
	timestamp: Date
	uptime: number
	version: string
}

// Error response types
export type ErrorResponse = ApiKeyError | ValidationError

// Union type for all possible API responses
export type AnyApiResponse = 
	| FilamentListResponse
	| SlicerResponse
	| EstimateOrderResponse
	| EstimateShippingResponse
	| CreateOrderApiResponse
	| GetTrackingResponse
	| ListOrdersResponse
	| CancelOrderResponse
	| SubscribeWebhookResponse
	| HealthResponse
	| ErrorResponse

// Configuration types for mock behavior
export interface MockConfig {
	enableDelays: boolean
	sliceDelayMs: [number, number]  // [min, max] delay range
	enableWebhooks: boolean
	autoTransitionOrders: boolean
	transitionDelayMs: [number, number]  // [min, max] delay range
	logLevel: 'debug' | 'info' | 'warn' | 'error'
}

// Internal storage types for the mock service
export interface MockStorage {
	orders: Map<string, Order>
	webhooks: Map<string, Webhook>
	requestLogs: ApiRequestLog[]
	config: MockConfig
} 