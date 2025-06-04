// Orders Management Component
// Displays and manages all orders with status updates and cancellation

import { useState, useEffect } from 'react'
import type { Order, OrderStatus } from '@/types/index.js'
import { dashboardAPI } from '../api-client.js'
import { LoadingSpinner, ErrorMessage } from './shared.js'

// Order Row Component
function OrderRow({ order, onStatusChange, onCancel }: {
	order: Order
	onStatusChange: (orderId: string, status: OrderStatus) => void
	onCancel: (orderId: string) => void
}) {
	const getStatusColor = (status: OrderStatus) => {
		const colors = {
			pending: '#f59e0b',
			printing: '#3b82f6', 
			printed: '#8b5cf6',
			shipped: '#10b981',
			cancelled: '#ef4444'
		}
		return colors[status]
	}

	return (
		<tr style={{ borderBottom: '1px solid #f3f4f6' }}>
			<td style={{ padding: '1rem', fontFamily: 'monospace' }}>{order.orderId}</td>
			<td style={{ padding: '1rem' }}>
				<span style={{
					background: getStatusColor(order.status),
					color: 'white',
					padding: '0.25rem 0.5rem',
					borderRadius: '0.25rem',
					fontSize: '0.75rem',
					fontWeight: 'bold'
				}}>
					{order.status.toUpperCase()}
				</span>
			</td>
			<td style={{ padding: '1rem' }}>{order.filename}</td>
			<td style={{ padding: '1rem' }}>${order.totalPrice.toFixed(2)}</td>
			<td style={{ padding: '1rem' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
			<td style={{ padding: '1rem' }}>
				<div style={{ display: 'flex', gap: '0.5rem' }}>
					<select
						value={order.status}
						onChange={(e) => onStatusChange(order.orderId, e.target.value as OrderStatus)}
						style={{ 
							padding: '0.25rem 0.5rem', 
							fontSize: '0.75rem',
							borderRadius: '0.25rem',
							border: '1px solid #d1d5db'
						}}
					>
						<option value="pending">Pending</option>
						<option value="printing">Printing</option>
						<option value="printed">Printed</option>
						<option value="shipped">Shipped</option>
						<option value="cancelled">Cancelled</option>
					</select>
					{order.status !== 'cancelled' && order.status !== 'shipped' && (
						<button
							onClick={() => onCancel(order.orderId)}
							style={{
								padding: '0.25rem 0.5rem',
								fontSize: '0.75rem',
								background: '#ef4444',
								color: 'white',
								border: 'none',
								borderRadius: '0.25rem',
								cursor: 'pointer'
							}}
						>
							Cancel
						</button>
					)}
				</div>
			</td>
		</tr>
	)
}

// Orders Management Component
export function OrdersManagement() {
	const [orders, setOrders] = useState<Order[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [statusFilter, setStatusFilter] = useState<string>('all')

	useEffect(() => {
		const fetchOrders = async () => {
			setLoading(true)
			setError(null)
			
			const result = await dashboardAPI.getOrders()
			if (result.error) {
				setError(result.error)
			} else if (result.data?.orders) {
				setOrders(result.data.orders)
			}
			
			setLoading(false)
		}

		fetchOrders()
		
		// Refresh every 30 seconds
		const interval = setInterval(fetchOrders, 30000)
		return () => clearInterval(interval)
	}, [])

	const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
		const result = await dashboardAPI.updateOrderStatus(orderId, newStatus)
		if (result.error) {
			alert(`Error updating status: ${result.error}`)
		} else {
			// Refresh orders
			const ordersResult = await dashboardAPI.getOrders()
			if (ordersResult.data) {
				setOrders(ordersResult.data.orders)
			}
		}
	}

	const handleCancelOrder = async (orderId: string) => {
		if (!confirm('Are you sure you want to cancel this order?')) return
		
		const result = await dashboardAPI.cancelOrder(orderId)
		if (result.error) {
			alert(`Error cancelling order: ${result.error}`)
		} else {
			// Refresh orders
			const ordersResult = await dashboardAPI.getOrders()
			if (ordersResult.data) {
				setOrders(ordersResult.data.orders)
			}
		}
	}

	const filteredOrders = statusFilter === 'all' 
		? orders 
		: orders.filter(order => order.status === statusFilter)

	if (loading) return <LoadingSpinner />
	if (error) return <ErrorMessage message={error} />

	return (
		<div style={{ padding: '2rem' }}>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
				<h2 style={{ fontSize: '2rem', margin: 0 }}>Orders Management</h2>
				<select 
					value={statusFilter} 
					onChange={(e) => setStatusFilter(e.target.value)}
					style={{ 
						padding: '0.5rem 1rem', 
						borderRadius: '0.5rem', 
						border: '1px solid #d1d5db' 
					}}
				>
					<option value="all">All Orders</option>
					<option value="pending">Pending</option>
					<option value="printing">Printing</option>
					<option value="printed">Printed</option>
					<option value="shipped">Shipped</option>
					<option value="cancelled">Cancelled</option>
				</select>
			</div>

			{filteredOrders.length === 0 ? (
				<div style={{ 
					background: 'white', 
					borderRadius: '0.5rem', 
					padding: '3rem',
					textAlign: 'center',
					boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
				}}>
					<p style={{ color: '#9ca3af', fontSize: '1.125rem' }}>
						{statusFilter === 'all' ? 'No orders found' : `No ${statusFilter} orders`}
					</p>
				</div>
			) : (
				<div style={{ 
					background: 'white', 
					borderRadius: '0.5rem', 
					boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
					overflow: 'hidden'
				}}>
					<table style={{ width: '100%', borderCollapse: 'collapse' }}>
						<thead style={{ background: '#f9fafb' }}>
							<tr>
								<th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Order ID</th>
								<th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Status</th>
								<th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Filename</th>
								<th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Total</th>
								<th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Created</th>
								<th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Actions</th>
							</tr>
						</thead>
						<tbody>
							{filteredOrders.map((order) => (
								<OrderRow 
									key={order.orderId} 
									order={order} 
									onStatusChange={handleStatusChange}
									onCancel={handleCancelOrder}
								/>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	)
} 