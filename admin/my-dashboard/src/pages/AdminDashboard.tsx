import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  Bell, 
  CreditCard, 
  BarChart2, 
  Settings, 
  LogOut 
} from 'lucide-react'
import { useUser } from '../context/UserContext'
import AdminOverview from '../components/admin/AdminOverview'
import SubscriptionManagement from '../components/admin/SubscriptionManagement'
import SystemAlerts from '../components/admin/SystemAlerts'
import UsageStatistics from '../components/admin/UsageStatistics'

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const { logout } = useUser()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    navigate(`/admin/${tab === 'overview' ? '' : tab}`)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-[#23a5e3]">ElderSafe</h1>
          <p className="text-sm text-gray-600">Administration</p>
        </div>
        <nav className="mt-6">
          <div 
            className={`flex items-center px-6 py-3 cursor-pointer ${activeTab === 'overview' ? 'bg-[#23a5e3] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            onClick={() => handleTabChange('overview')}
          >
            <LayoutDashboard className="h-5 w-5 mr-3" />
            <span>Vue d&apos;ensemble</span>
          </div>
          <div 
            className={`flex items-center px-6 py-3 cursor-pointer ${activeTab === 'subscriptions' ? 'bg-[#23a5e3] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            onClick={() => handleTabChange('subscriptions')}
          >
            <CreditCard className="h-5 w-5 mr-3" />
            <span>Abonnements</span>
          </div>
          <div 
            className={`flex items-center px-6 py-3 cursor-pointer ${activeTab === 'statistics' ? 'bg-[#23a5e3] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            onClick={() => handleTabChange('statistics')}
          >
            <BarChart2 className="h-5 w-5 mr-3" />
            <span>Statistiques</span>
          </div>
          <div 
            className={`flex items-center px-6 py-3 cursor-pointer ${activeTab === 'alerts' ? 'bg-[#23a5e3] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            onClick={() => handleTabChange('alerts')}
          >
            <Bell className="h-5 w-5 mr-3" />
            <span>Alertes système</span>
          </div>
        </nav>
        <div className="absolute bottom-0 w-64 border-t border-gray-200">
          <div 
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 cursor-pointer"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span>Déconnexion</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <h1 className="text-lg font-semibold text-gray-900">
              {activeTab === 'overview' && "Vue d'ensemble"}
              {activeTab === 'subscriptions' && 'Gestion des abonnements'}
              {activeTab === 'statistics' && "Statistiques d'utilisation"}
              {activeTab === 'alerts' && 'Alertes système'}
            </h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<AdminOverview />} />
            <Route path="/subscriptions" element={<SubscriptionManagement />} />
            <Route path="/statistics" element={<UsageStatistics />} />
            <Route path="/alerts" element={<SystemAlerts />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}


export default AdminDashboard