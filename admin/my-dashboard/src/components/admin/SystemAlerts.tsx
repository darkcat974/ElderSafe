import React, { useState } from 'react'
import { useAlertes, useServers, useUsers, resolveAlerte } from '../../hooks/useApi'
import { AlertTriangle, CheckCircle, XCircle, Clock, Filter, Loader2 } from 'lucide-react'

const URGENCE_STYLE: Record<string, string> = {
  HIGH:   'bg-red-100 text-red-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  LOW:    'bg-blue-100 text-blue-700',
}

const SystemAlerts: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'unresolved' | 'resolved'>('all')
  const [refreshKey, setRefreshKey] = useState(0)
  const { data: alertes, loading } = useAlertes(refreshKey)
  const { data: servers } = useServers()
  const { data: users } = useUsers()

  const displayed = (alertes ?? []).filter(a => {
    if (filterStatus === 'unresolved') return !a.is_resolved
    if (filterStatus === 'resolved')   return a.is_resolved
    return true
  })

  const handleResolve = async (id: number) => {
    try {
      await resolveAlerte(id)
      setRefreshKey(k => k + 1)
    } catch (e) {
      console.error('Resolve failed', e)
    }
  }

  const totalUnresolved = (alertes ?? []).filter(a => !a.is_resolved).length
  const totalHigh       = (alertes ?? []).filter(a => a.niveau_urgence === 'HIGH' && !a.is_resolved).length
  const totalResolved   = (alertes ?? []).filter(a => a.is_resolved).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin mr-3" /> Chargement…
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 rounded-lg p-4 border border-red-200 flex items-center gap-4">
          <XCircle className="h-8 w-8 text-red-500 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">Non résolues</p>
            <p className="text-2xl font-semibold text-red-900">{totalUnresolved}</p>
          </div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 flex items-center gap-4">
          <AlertTriangle className="h-8 w-8 text-yellow-500 shrink-0" />
          <div>
            <p className="text-sm font-medium text-yellow-800">Urgence HIGH (non résolues)</p>
            <p className="text-2xl font-semibold text-yellow-900">{totalHigh}</p>
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200 flex items-center gap-4">
          <CheckCircle className="h-8 w-8 text-green-500 shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-800">Résolues</p>
            <p className="text-2xl font-semibold text-green-900">{totalResolved}</p>
          </div>
        </div>
      </div>

      {/* Table header + filter */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Alertes capteurs</h2>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
            >
              <option value="all">Toutes</option>
              <option value="unresolved">Non résolues</option>
              <option value="resolved">Résolues</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Serveur', 'Client', 'État chute', 'Temps au sol', 'Urgence', 'Horodatage', 'Statut', 'Action'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayed.map(a => {
                const srv   = servers?.find(s => s.id === a.local_server_id)
                const owner = users?.find(u => u.id === a.client_id)
                return (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-800">
                      {srv?.local_server_id ?? `#${a.local_server_id}`}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-700">
                      {owner?.name ?? `#${a.client_id}`}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {a.etat_de_la_chute}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        {a.temps_au_sol}
                      </div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${URGENCE_STYLE[a.niveau_urgence] ?? 'bg-gray-100 text-gray-600'}`}>
                        {a.niveau_urgence}
                      </span>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-xs text-gray-500">
                      {a.timestamp}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${a.is_resolved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {a.is_resolved ? 'Résolu' : 'En cours'}
                      </span>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-sm">
                      {!a.is_resolved && (
                        <button
                          className="text-[#23a5e3] hover:text-[#1e8fc4] font-medium"
                          onClick={() => handleResolve(a.id)}
                        >
                          Résoudre
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
              {displayed.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-400">
                    Aucune alerte.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default SystemAlerts