// React dashboard application
// Mock Slant3D API Dashboard with order management, webhook monitoring, and API analytics

import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Navigation } from './components/Navigation.js'
import { OverviewDashboard } from './components/OverviewDashboard.js'
import { OrdersManagement } from './components/OrdersManagement.js'
import { WebhooksManagement } from './components/WebhooksManagement.js'
import { ApiLogs } from './components/ApiLogs.js'
import { FilamentsDisplay } from './components/FilamentsDisplay.js'

// Main App Component
function App() {
	const [activeTab, setActiveTab] = useState('overview')

	const renderContent = () => {
		switch (activeTab) {
			case 'overview': return <OverviewDashboard />
			case 'orders': return <OrdersManagement />
			case 'webhooks': return <WebhooksManagement />
			case 'logs': return <ApiLogs />
			case 'filaments': return <FilamentsDisplay />
			default: return <OverviewDashboard />
		}
	}

	return (
		<div style={{ minHeight: '100vh', background: '#f8fafc' }}>
			<style>{`
				@keyframes spin {
					0% { transform: rotate(0deg); }
					100% { transform: rotate(360deg); }
				}
			`}</style>
			<Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
			{renderContent()}
		</div>
	)
}

// Initialize React app
const container = document.getElementById('root')
if (container) {
	const root = createRoot(container)
	root.render(<App />)
} 