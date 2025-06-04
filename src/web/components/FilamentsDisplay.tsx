// Filaments Display Component
// Shows available 3D printing materials and their properties

import { useState, useEffect } from 'react'
import type { Filament } from '@/types/index.js'
import { dashboardAPI } from '../api-client.js'
import { LoadingSpinner, ErrorMessage } from './shared.js'

export function FilamentsDisplay() {
	const [filaments, setFilaments] = useState<Filament[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const fetchFilaments = async () => {
			setLoading(true)
			setError(null)
			
			const result = await dashboardAPI.getFilaments()
			if (result.error) {
				setError(result.error)
			} else if (result.data) {
				setFilaments(result.data.filaments)
			}
			
			setLoading(false)
		}

		fetchFilaments()
	}, [])

	if (loading) return <LoadingSpinner />
	if (error) return <ErrorMessage message={error} />

	return (
		<div style={{ padding: '2rem' }}>
			<h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Available Filaments</h2>
			
			<div style={{ 
				display: 'grid', 
				gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
				gap: '1.5rem' 
			}}>
				{filaments.map((filament, index) => (
					<div key={index} style={{ 
						background: 'white', 
						borderRadius: '0.5rem', 
						padding: '1.5rem',
						boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
						border: '1px solid #e5e7eb'
					}}>
						<div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
							<div style={{
								width: '3rem',
								height: '3rem',
								background: `#${filament.hexColor}`,
								borderRadius: '50%',
								border: '2px solid #e5e7eb'
							}}></div>
							<div>
								<h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
									{filament.filament}
								</h3>
								<p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>
									{filament.profile} • #{filament.hexColor}
								</p>
							</div>
						</div>
						
						<div style={{ 
							background: '#f9fafb', 
							borderRadius: '0.375rem', 
							padding: '0.75rem',
							fontSize: '0.875rem'
						}}>
							<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
								<span style={{ color: '#6b7280' }}>Color Tag:</span>
								<span style={{ fontWeight: '500' }}>{filament.colorTag}</span>
							</div>
							<div style={{ display: 'flex', justifyContent: 'space-between' }}>
								<span style={{ color: '#6b7280' }}>Profile:</span>
								<span style={{ 
									fontWeight: '500',
									color: filament.profile === 'PLA' ? '#10b981' : '#3b82f6'
								}}>
									{filament.profile}
								</span>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	)
} 