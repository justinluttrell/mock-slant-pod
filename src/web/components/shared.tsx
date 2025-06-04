// Shared UI components used across the dashboard

// Loading state component
export function LoadingSpinner() {
	return (
		<div style={{ 
			display: 'flex', 
			justifyContent: 'center', 
			alignItems: 'center', 
			padding: '2rem' 
		}}>
			<div style={{ 
				border: '3px solid #f3f3f3',
				borderTop: '3px solid #3498db',
				borderRadius: '50%',
				width: '30px',
				height: '30px',
				animation: 'spin 1s linear infinite'
			}}></div>
		</div>
	)
}

// Error message component
export function ErrorMessage({ message }: { message: string }) {
	return (
		<div style={{ 
			color: '#dc2626', 
			background: '#fef2f2', 
			border: '1px solid #fecaca',
			borderRadius: '0.5rem',
			padding: '1rem',
			margin: '1rem 0'
		}}>
			Error: {message}
		</div>
	)
}

// Stat Card Component
export function StatCard({ title, value, icon, color }: { 
	title: string
	value: string | number
	icon: string
	color: string 
}) {
	return (
		<div style={{ 
			background: 'white', 
			borderRadius: '0.5rem', 
			padding: '1.5rem',
			boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
			borderLeft: `4px solid ${color}`
		}}>
			<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
				<div>
					<h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', margin: '0 0 0.5rem 0' }}>
						{title}
					</h3>
					<p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
						{value}
					</p>
				</div>
				<div style={{ fontSize: '2rem' }}>{icon}</div>
			</div>
		</div>
	)
} 