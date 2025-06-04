// API Client for Dashboard
// Provides functions to fetch real data from the Mock Slant3D API

import type { 
	DashboardStats, 
	Order, 
	Webhook, 
	ApiRequestLog,
	Filament 
} from '@/types/index.js'

// RequestLog type that matches the backend storage structure
export interface RequestLog {
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

const API_BASE_URL = 'http://localhost:4000/api'

// API response wrapper
interface ApiResponse<T> {
	data?: T
	error?: string
}

// Generic API fetch with error handling
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
	try {
		const response = await fetch(`${API_BASE_URL}${endpoint}`, {
			headers: {
				'Content-Type': 'application/json',
				...options?.headers,
			},
			...options,
		})

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
			return { error: errorData.error || `HTTP ${response.status}` }
		}

		const data = await response.json()
		return { data }
	} catch (error) {
		return { error: error instanceof Error ? error.message : 'Network error' }
	}
}

// Dashboard API functions
export const dashboardAPI = {
	// Get dashboard statistics
	async getStats(): Promise<ApiResponse<DashboardStats>> {
		return fetchAPI<DashboardStats>('/dashboard/stats')
	},

	// Get all orders
	async getOrders(): Promise<ApiResponse<{ orders: Order[]; totalCount: number }>> {
		return fetchAPI<{ orders: Order[]; totalCount: number }>('/dashboard/orders')
	},

	// Get all webhooks
	async getWebhooks(): Promise<ApiResponse<{ webhooks: Webhook[]; totalCount: number }>> {
		return fetchAPI<{ webhooks: Webhook[]; totalCount: number }>('/dashboard/webhooks')
	},

	// Get API request logs
	async getLogs(limit: number = 50): Promise<ApiResponse<{ logs: RequestLog[]; totalCount: number }>> {
		return fetchAPI<{ logs: RequestLog[]; totalCount: number }>(`/dashboard/logs?limit=${limit}`)
	},

	// Get filaments
	async getFilaments(): Promise<ApiResponse<{ filaments: Filament[] }>> {
		return fetchAPI<{ filaments: Filament[] }>('/dashboard/filaments')
	},

	// Update order status
	async updateOrderStatus(orderId: string, status: string): Promise<ApiResponse<{ message: string; order: Order }>> {
		return fetchAPI<{ message: string; order: Order }>(`/dashboard/orders/${orderId}/status`, {
			method: 'PUT',
			body: JSON.stringify({ status }),
		})
	},

	// Cancel order
	async cancelOrder(orderId: string): Promise<ApiResponse<{ message: string; orderId: string }>> {
		return fetchAPI<{ message: string; orderId: string }>(`/dashboard/orders/${orderId}/cancel`, {
			method: 'POST',
		})
	},

	// Remove webhook
	async removeWebhook(endpoint: string): Promise<ApiResponse<{ message: string; endpoint: string }>> {
		const encodedEndpoint = encodeURIComponent(endpoint)
		return fetchAPI<{ message: string; endpoint: string }>(`/dashboard/webhooks/${encodedEndpoint}`, {
			method: 'DELETE',
		})
	},

	// Register new webhook (uses correct webhook endpoint)
	async registerWebhook(endPoint: string, apiKey: string = 'dashboard-key'): Promise<ApiResponse<any>> {
		return fetchAPI<any>('/customer/subscribeWebhook', {
			method: 'POST',
			headers: {
				'api-key': apiKey,
			},
			body: JSON.stringify({ endPoint }),
		})
	},

	// Test webhook endpoint with specific order ID (using proxy to avoid CORS)
	async testWebhookWithOrder(endPoint: string, orderId: string): Promise<ApiResponse<any>> {
		return fetchAPI<any>('/webhooks/test', {
			method: 'POST',
			body: JSON.stringify({ 
				endPoint,
				orderId // Include order ID for potential customization
			}),
		})
	},

	// Test webhook endpoint (using proxy to avoid CORS)
	async testWebhook(endPoint: string): Promise<ApiResponse<any>> {
		return fetchAPI<any>('/webhooks/test', {
			method: 'POST',
			body: JSON.stringify({ endPoint }),
		})
	}
}

export default dashboardAPI 