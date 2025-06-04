// API Logs Component
// Displays API request logs with filtering and refresh functionality

import { useState, useEffect } from 'react'
import { dashboardAPI, type RequestLog } from '../api-client.js'
import { LoadingSpinner, ErrorMessage } from './shared.js'

export function ApiLogs() {
	const [logs, setLogs] = useState<RequestLog[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [logLimit, setLogLimit] = useState(50)

	useEffect(() => {
		fetchLogs()
	}, [logLimit])

	const fetchLogs = async () => {
		setLoading(true)
		setError(null)
		
		const result = await dashboardAPI.getLogs(logLimit)
		if (result.error) {
			setError(result.error)
		} else if (result.data) {
			setLogs(result.data.logs)
		}
		
		setLoading(false)
	}

	const formatTimestamp = (timestamp: Date) => {
		const date = new Date(timestamp)
		return date.toLocaleString()
	}

	const getMethodColor = (method: string) => {
		switch (method) {
			case 'GET': return '#10b981'
			case 'POST': return '#3b82f6'
			case 'PUT': return '#f59e0b'
			case 'DELETE': return '#ef4444'
			default: return '#6b7280'
		}
	}

	const getStatusColor = (statusCode: number) => {
		if (statusCode < 300) return '#10b981'
		if (statusCode < 400) return '#f59e0b'
		return '#ef4444'
	}

	if (loading) return <LoadingSpinner />
	if (error) return <ErrorMessage message={error} />

	return (
		<div style={{ padding: '2rem' }}>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
				<h2 style={{ fontSize: '2rem', margin: 0 }}>API Request Logs</h2>
				<div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
					<label style={{ fontSize: '0.875rem', color: '#6b7280' }}>
						Show last:
						<select 
							value={logLimit} 
							onChange={(e) => setLogLimit(parseInt(e.target.value))}
							style={{ 
								marginLeft: '0.5rem',
								padding: '0.25rem 0.5rem', 
								borderRadius: '0.25rem', 
								border: '1px solid #d1d5db' 
							}}
						>
							<option value={10}>10 requests</option>
							<option value={25}>25 requests</option>
							<option value={50}>50 requests</option>
							<option value={100}>100 requests</option>
						</select>
					</label>
					<button
						onClick={fetchLogs}
						style={{
							background: '#3b82f6',
							color: 'white',
							border: 'none',
							padding: '0.5rem 1rem',
							borderRadius: '0.375rem',
							cursor: 'pointer',
							fontSize: '0.875rem'
						}}
					>
						Refresh
					</button>
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
							<th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Timestamp</th>
							<th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Method</th>
							<th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Endpoint</th>
							<th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Status</th>
							<th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Response Time</th>
							<th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>API Key</th>
						</tr>
					</thead>
					<tbody>
						{logs.length > 0 ? logs.map(log => (
							<tr key={log.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
								<td style={{ padding: '1rem', fontSize: '0.875rem' }}>
									{formatTimestamp(log.timestamp)}
								</td>
								<td style={{ padding: '1rem' }}>
									<span style={{ 
										fontFamily: 'monospace',
										fontWeight: 'bold',
										color: getMethodColor(log.method)
									}}>
										{log.method}
									</span>
								</td>
								<td style={{ padding: '1rem', fontFamily: 'monospace' }}>{log.path}</td>
								<td style={{ padding: '1rem' }}>
									<span style={{
										color: getStatusColor(log.statusCode),
										fontWeight: 'bold'
									}}>
										{log.statusCode}
									</span>
								</td>
								<td style={{ padding: '1rem' }}>{log.duration}ms</td>
								<td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.75rem' }}>
									{log.apiKey ? `${log.apiKey.substring(0, 8)}...` : 'None'}
								</td>
							</tr>
						)) : (
							<tr>
								<td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
									No API logs found
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	)
} 