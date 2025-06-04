// Dashboard API Routes
// Provides endpoints for the React dashboard to fetch real-time data

import { Hono } from 'hono'
import type { Context } from 'hono'
import { OrderStorage, WebhookStorage, RequestLogger, Storage } from '@/services/storage.js'
import type { DashboardStats } from '@/types/responses.js'

const dashboard = new Hono()

// GET /stats - Dashboard statistics
dashboard.get('/stats', async (c: Context) => {
	const storageStats = Storage.getStats()
	
	const stats: DashboardStats = {
		totalRequests: storageStats.requestLogs.total,
		activeOrders: storageStats.orders.byStatus.pending + storageStats.orders.byStatus.printing,
		registeredWebhooks: storageStats.webhooks.total,
		apiStatus: 'healthy', // Could be enhanced with actual health checks
		uptime: Math.floor(process.uptime())
	}
	
	return c.json(stats)
})

// GET /orders - All orders for dashboard
dashboard.get('/orders', async (c: Context) => {
	const orders = OrderStorage.getAll()
	return c.json({ orders, totalCount: orders.length })
})

// GET /webhooks - All webhooks for dashboard  
dashboard.get('/webhooks', async (c: Context) => {
	const webhooks = WebhookStorage.getAll()
	return c.json({ webhooks, totalCount: webhooks.length })
})

// GET /logs - Recent API request logs
dashboard.get('/logs', async (c: Context) => {
	const limit = parseInt(c.req.query('limit') || '50', 10)
	const logs = RequestLogger.getRecent(limit)
	return c.json({ logs, totalCount: logs.length })
})

// DELETE /webhooks/:endpoint - Remove webhook (for dashboard management)
dashboard.delete('/webhooks/:endpoint', async (c: Context) => {
	const endpoint = decodeURIComponent(c.req.param('endpoint'))
	const deleted = WebhookStorage.delete(endpoint)
	
	if (deleted) {
		return c.json({ message: 'Webhook removed successfully', endpoint })
	} else {
		return c.json({ error: 'Webhook not found' }, 404)
	}
})

// PUT /orders/:id/status - Update order status (for dashboard controls)
dashboard.put('/orders/:id/status', async (c: Context) => {
	const orderId = c.req.param('id')
	const body = await c.req.json()
	const { status } = body
	
	const order = OrderStorage.get(orderId)
	if (!order) {
		return c.json({ error: 'Order not found' }, 404)
	}
	
	const updatedOrder = OrderStorage.updateStatus(orderId, status)
	return c.json({ message: 'Order status updated', order: updatedOrder })
})

// POST /orders/:id/cancel - Cancel order (for dashboard controls)
dashboard.post('/orders/:id/cancel', async (c: Context) => {
	const orderId = c.req.param('id')
	
	const order = OrderStorage.get(orderId)
	if (!order) {
		return c.json({ error: 'Order not found' }, 404)
	}
	
	// Can only cancel pending or printing orders
	if (order.status === 'shipped' || order.status === 'cancelled') {
		return c.json({ error: 'Order cannot be cancelled in current status' }, 400)
	}
	
	const cancelled = OrderStorage.updateStatus(orderId, 'cancelled')
	if (cancelled) {
		return c.json({ message: 'Order cancelled successfully', orderId })
	} else {
		return c.json({ error: 'Failed to cancel order' }, 500)
	}
})

// GET /filaments - Get filaments data
dashboard.get('/filaments', async (c: Context) => {
	// Read from our confirmed filaments data
	const filaments = await Bun.file('./data/filaments.json').json()
	return c.json({ filaments })
})

export default dashboard 