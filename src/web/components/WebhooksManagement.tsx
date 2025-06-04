// Webhooks Management Component
// Displays and manages webhook registrations with testing functionality

import { useState, useEffect } from 'react'
import type { Webhook, Order } from '@/types/index.js'
import { dashboardAPI } from '../api-client.js'
import { LoadingSpinner, ErrorMessage } from './shared.js'

export function WebhooksManagement() {
	const [webhooks, setWebhooks] = useState<Webhook[]>([])
	const [orders, setOrders] = useState<Order[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [newWebhookUrl, setNewWebhookUrl] = useState('')
	const [testingWebhook, setTestingWebhook] = useState<string | null>(null)
	const [selectedOrderId, setSelectedOrderId] = useState<string>('1234567890')

	useEffect(() => {
		fetchWebhooks()
		fetchOrders()
	}, [])

	const fetchWebhooks = async () => {
		setLoading(true)
		setError(null)
		
		const result = await dashboardAPI.getWebhooks()
		if (result.error) {
			setError(result.error)
		} else if (result.data) {
			setWebhooks(result.data.webhooks)
		}
		
		setLoading(false)
	}

	const fetchOrders = async () => {
		const result = await dashboardAPI.getOrders()
		if (result.data?.orders) {
			setOrders(result.data.orders)
			// Set first order ID as default if available
			if (result.data.orders.length > 0 && selectedOrderId === '1234567890') {
				setSelectedOrderId(result.data.orders[0]?.orderId || '1234567890')
			}
		}
	}

	const addWebhook = async () => {
		if (!newWebhookUrl) return

		const result = await dashboardAPI.registerWebhook(newWebhookUrl)
		if (result.error) {
			alert(`Error registering webhook: ${result.error}`)
		} else {
			setNewWebhookUrl('')
			// Refresh webhooks list
			await fetchWebhooks()
		}
	}

	const removeWebhook = async (endPoint: string) => {
		if (!confirm('Are you sure you want to remove this webhook?')) return

		const result = await dashboardAPI.removeWebhook(endPoint)
		if (result.error) {
			alert(`Error removing webhook: ${result.error}`)
		} else {
			// Refresh webhooks list
			await fetchWebhooks()
		}
	}

	const testWebhook = async (endPoint: string) => {
		setTestingWebhook(endPoint)
		
		const result = await dashboardAPI.testWebhookWithOrder(endPoint, selectedOrderId)
		if (result.data) {
			const message = result.data.success 
				? `✅ ${result.data.message}\n\nPayload sent:\n${JSON.stringify(result.data.payload, null, 2)}` 
				: `❌ ${result.data.message}`
			alert(message)
		}
		
		setTestingWebhook(null)
	}

	if (loading) return <LoadingSpinner />
	if (error) return <ErrorMessage message={error} />

	return (
		<div style={{ padding: '2rem' }}>
			<h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Webhook Management</h2>
			
			<div style={{ 
				background: 'white', 
				borderRadius: '0.5rem', 
				padding: '1.5rem',
				marginBottom: '2rem',
				boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
			}}>
				<h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Register New Webhook</h3>
				<div style={{ display: 'flex', gap: '1rem' }}>
					<input
						type="url"
						placeholder="https://your-endpoint.com/webhook"
						value={newWebhookUrl}
						onChange={(e) => setNewWebhookUrl(e.target.value)}
						style={{ 
							flex: 1, 
							padding: '0.5rem', 
							borderRadius: '0.375rem', 
							border: '1px solid #d1d5db' 
						}}
					/>
					<button
						onClick={addWebhook}
						disabled={!newWebhookUrl}
						style={{
							background: newWebhookUrl ? '#3b82f6' : '#9ca3af',
							color: 'white',
							border: 'none',
							padding: '0.5rem 1rem',
							borderRadius: '0.375rem',
							cursor: newWebhookUrl ? 'pointer' : 'not-allowed'
						}}
					>
						Add Webhook
					</button>
				</div>
			</div>

			<div style={{ 
				background: 'white', 
				borderRadius: '0.5rem', 
				padding: '1.5rem',
				marginBottom: '2rem',
				boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
			}}>
				<h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Webhook Testing Configuration</h3>
				<div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
					<label style={{ fontSize: '0.875rem', color: '#6b7280', minWidth: 'fit-content' }}>
						Test with Order ID:
					</label>
					<select 
						value={selectedOrderId} 
						onChange={(e) => setSelectedOrderId(e.target.value)}
						style={{ 
							padding: '0.5rem', 
							borderRadius: '0.375rem', 
							border: '1px solid #d1d5db',
							minWidth: '200px'
						}}
					>
						<option value="1234567890">Default (1234567890)</option>
						{orders.map((order) => (
							<option key={order.orderId} value={order.orderId}>
								{order.orderId} - {order.filename}
							</option>
						))}
					</select>
					<div style={{ 
						fontSize: '0.75rem', 
						color: '#6b7280',
						padding: '0.5rem',
						background: '#f9fafb',
						borderRadius: '0.375rem',
						border: '1px solid #e5e7eb'
					}}>
						<strong>Test Payload:</strong><br/>
						Status: SHIPPED<br/>
						Tracking: ABCDEF123456<br/>
						Carrier: usps
					</div>
				</div>
			</div>

			<div style={{ 
				background: 'white', 
				borderRadius: '0.5rem', 
				overflow: 'hidden',
				boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
			}}>
				<table style={{ width: '100%', borderCollapse: 'collapse' }}>
					<thead style={{ background: '#f9fafb' }}>
						<tr>
							<th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Endpoint</th>
							<th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Registered</th>
							<th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Deliveries</th>
							<th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
						</tr>
					</thead>
					<tbody>
						{webhooks.length > 0 ? webhooks.map((webhook, index) => (
							<tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
								<td style={{ padding: '1rem', fontFamily: 'monospace' }}>{webhook.endPoint}</td>
								<td style={{ padding: '1rem' }}>{new Date(webhook.registeredAt).toLocaleDateString()}</td>
								<td style={{ padding: '1rem' }}>{webhook.deliveryAttempts.length}</td>
								<td style={{ padding: '1rem' }}>
									<div style={{ display: 'flex', gap: '0.5rem' }}>
										<button
											onClick={() => testWebhook(webhook.endPoint)}
											disabled={testingWebhook === webhook.endPoint}
											style={{
												background: '#10b981',
												color: 'white',
												border: 'none',
												padding: '0.25rem 0.5rem',
												borderRadius: '0.25rem',
												cursor: 'pointer',
												fontSize: '0.75rem'
											}}
										>
											{testingWebhook === webhook.endPoint ? 'Testing...' : 'Test'}
										</button>
										<button
											onClick={() => removeWebhook(webhook.endPoint)}
											style={{
												background: '#ef4444',
												color: 'white',
												border: 'none',
												padding: '0.25rem 0.5rem',
												borderRadius: '0.25rem',
												cursor: 'pointer',
												fontSize: '0.75rem'
											}}
										>
											Remove
										</button>
									</div>
								</td>
							</tr>
						)) : (
							<tr>
								<td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
									No webhooks registered yet
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	)
} 