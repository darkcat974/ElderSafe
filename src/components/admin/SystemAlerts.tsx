import React, { useState } from 'react'
import { AlertTriangle, CheckCircle, XCircle, Clock, Filter } from 'lucide-react'

interface Alert {
  id: string
  type: 'error' | 'warning' | 'info'
  message: string
  source: string
  timestamp: string
  status: 'new' | 'acknowledged' | 'resolved'
}

const SystemAlerts: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'new' | 'acknowledged' | 'resolved'>('all')
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'error',
      message: 'Erreur de connexion à la base de données',
      source: 'Serveur principal',
      timestamp: '2025-02-15 08:32:15',
      status: 'new'
    },
    {
      id: '2',
      type: 'warning',
      message: 'Utilisation CPU élevée (85%)',
      source: 'Serveur d\'application',
      timestamp: '2025-02-15 09:45:22',
      status: 'acknowledged'
    },
    {
      id: '3',
      type: 'info',
      message: 'Mise à jour système planifiée',
      source: 'Système',
      timestamp: '2025-02-15 10:12:05',
      status: 'resolved'
    },
    {
      id: '4',
      type: 'error',
      message: 'Échec de la sauvegarde automatique',
      source: 'Système de sauvegarde',
      timestamp: '2025-02-15 11:30:18',
      status: 'new'
    },
    {
      id: '5',
      type: 'warning',
      message: 'Espace disque faible (15% restant)',
      source: 'Serveur de stockage',
      timestamp: '2025-02-15 12:05:33',
      status: 'new'
    }
  ])

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'info':
        return <CheckCircle className="h-5 w-5 text-blue-500" />
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Nouveau</span>
      case 'acknowledged':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Reconnu</span>
      case 'resolved':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Résolu</span>
      default:
        return null
    }
  }

  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.status === filter)

  const acknowledgeAlert = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, status: 'acknowledged' } : alert
    ))
  }

  const resolveAlert = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, status: 'resolved' } : alert
    ))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Alertes système</h2>
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <select 
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
          >
            <option value="all">Toutes les alertes</option>
            <option value="new">Nouvelles</option>
            <option value="acknowledged">Reconnues</option>
            <option value="resolved">Résolues</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horodatage
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAlerts.map((alert) => (
                <tr key={alert.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getAlertIcon(alert.type)}
                      <span className="ml-2 text-sm text-gray-900 capitalize">{alert.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{alert.message}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{alert.source}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {alert.timestamp}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(alert.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {alert.status === 'new' && (
                        <button 
                          className="text-[#23a5e3] hover:text-[#1e8fc4]"
                          onClick={() => acknowledgeAlert(alert.id)}
                        >
                          Acquiter
                        </button>
                      )}
                      {(alert.status === 'new' || alert.status === 'acknowledged') && (
                        <button 
                          className="text-green-600 hover:text-green-900"
                          onClick={() => resolveAlert(alert.id)}
                        >
                          Résoudre
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Résumé des alertes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-red-800">Erreurs</p>
                <p className="text-2xl font-semibold text-red-900">
                  {alerts.filter(a => a.type === 'error').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-yellow-800">Avertissements</p>
                <p className="text-2xl font-semibold text-yellow-900">
                  {alerts.filter(a => a.type === 'warning').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-800">Informations</p>
                <p className="text-2xl font-semibold text-blue-900">
                  {alerts.filter(a => a.type === 'info').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemAlerts