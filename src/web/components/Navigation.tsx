// Navigation Component
// Top navigation bar with tab switching for the dashboard

interface NavigationProps {
	activeTab: string
	setActiveTab: (tab: string) => void
}

export function Navigation({ activeTab, setActiveTab }: NavigationProps) {
	const tabs = [
		{ id: 'overview', label: 'Overview', icon: '📊' },
		{ id: 'orders', label: 'Orders', icon: '📦' },
		{ id: 'webhooks', label: 'Webhooks', icon: '🔗' },
		{ id: 'logs', label: 'API Logs', icon: '📝' },
		{ id: 'filaments', label: 'Filaments', icon: '🎨' }
	]

	return (
		<nav style={{ 
			background: 'white', 
			borderBottom: '1px solid #e5e7eb',
			padding: '0 2rem'
		}}>
			<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
				<div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
					<h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '1rem 0' }}>
						🎯 Mock Slant3D Dashboard
					</h1>
					<div style={{ display: 'flex', gap: '0.5rem' }}>
						{tabs.map(tab => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								style={{
									padding: '0.75rem 1.5rem',
									border: 'none',
									background: activeTab === tab.id ? '#3b82f6' : 'transparent',
									color: activeTab === tab.id ? 'white' : '#6b7280',
									borderRadius: '0.5rem',
									cursor: 'pointer',
									display: 'flex',
									alignItems: 'center',
									gap: '0.5rem',
									fontSize: '0.875rem',
									fontWeight: '500'
								}}
							>
								{tab.icon} {tab.label}
							</button>
						))}
					</div>
				</div>
			</div>
		</nav>
	)
} 