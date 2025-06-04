// Overview Dashboard Component
// Displays system statistics and recent API activity

import { useState, useEffect } from 'react'
import type { DashboardStats } from '@/types/index.js'
import { dashboardAPI, type RequestLog } from '../api-client.js'
import { LoadingSpinner, ErrorMessage, StatCard } from './shared.js'

export function OverviewDashboard() {
	const [stats, setStats] = useState<DashboardStats | null>(null)
	const [logs, setLogs] = useState<RequestLog[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true)
			setError(null)

			const [statsResult, logsResult] = await Promise.all([
				dashboardAPI.getStats(),
				dashboardAPI.getLogs(10)
			])

			if (statsResult.error) {
				setError(statsResult.error)
			} else if (statsResult.data) {
				setStats(statsResult.data)
			}

			if (logsResult.data) {
				setLogs(logsResult.data.logs)
			}

			setLoading(false)
		}

		fetchData()
		
		// Refresh data every 30 seconds
		const interval = setInterval(fetchData, 30000)
		return () => clearInterval(interval)
	}, [])

	if (loading) return <LoadingSpinner />
	if (error) return <ErrorMessage message={error} />
	if (!stats) return <ErrorMessage message="No data available" />

	return (
		<div style={{ padding: '2rem' }}>
			<h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Dashboard Overview</h2>
			
			<div style={{ 
				display: 'grid', 
				gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
				gap: '1.5rem',
				marginBottom: '2rem'
			}}>
				<StatCard 
					title="Total API Requests" 
					value={stats.totalRequests} 
					icon="📊"
					color="#3b82f6"
				/>
				<StatCard 
					title="Active Orders" 
					value={stats.activeOrders} 
					icon="📦"
					color="#10b981"
				/>
				<StatCard 
					title="Registered Webhooks" 
					value={stats.registeredWebhooks} 
					icon="🔗"
					color="#f59e0b"
				/>
				<StatCard 
					title="System Uptime" 
					value={`${Math.floor(stats.uptime / 3600)}h ${Math.floor((stats.uptime % 3600) / 60)}m`} 
					icon="⏱️"
					color="#8b5cf6"
				/>
			</div>

			<div style={{ 
				background: 'white', 
				borderRadius: '0.5rem', 
				padding: '1.5rem',
				boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
			}}>
				<h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Recent API Activity</h3>
				{logs.length > 0 ? (
					<div style={{ color: '#6b7280' }}>
						{logs.map((log, index) => (
							<p key={index} style={{ margin: '0.5rem 0' }}>
								• {log.method} {log.path} - {log.statusCode} ({log.duration}ms)
							</p>
						))}
					</div>
				) : (
					<p style={{ color: '#9ca3af' }}>No recent activity</p>
				)}
			</div>
		</div>
	)
} 