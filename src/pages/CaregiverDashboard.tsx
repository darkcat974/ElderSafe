import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, LogOut, AlertTriangle } from 'lucide-react'
import { useUser } from '../context/UserContext'
import RoomGrid from '../components/caregiver/RoomGrid'

const CaregiverDashboard: React.FC = () => {
  const [activeAlerts, setActiveAlerts] = useState(2)
  const { logout } = useUser()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#23a5e3]">ElderSafe</h1>
            <p className="text-sm text-gray-600">Tableau de bord des aides-soignants</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Bell className="h-6 w-6 text-gray-600 cursor-pointer" />
              {activeAlerts > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {activeAlerts}
                </span>
              )}
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center text-gray-700 hover:text-[#23a5e3]"
            >
              <LogOut className="h-5 w-5 mr-1" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      {/* Active alerts banner */}
      {activeAlerts > 0 && (
        <div className="bg-red-100 border-l-4 border-red-500 p-4 m-4 rounded">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
            <div>
              <p className="font-bold text-red-700">Attention!</p>
              <p className="text-sm text-red-700">
                {activeAlerts} {activeAlerts === 1 ? 'alerte active' : 'alertes actives'} nécessitant votre attention.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto p-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Surveillance des chambres</h2>
          <RoomGrid />
        </div>
      </main>
    </div>
  )
}

export default CaregiverDashboard