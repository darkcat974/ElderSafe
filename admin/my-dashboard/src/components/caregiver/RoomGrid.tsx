import React, { useState } from 'react'
import { useServers, useUsers, useAlertes, useContacts } from '../../hooks/useApi'
import { 
  Loader2, 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  Wrench, 
  Server, 
  Clock, 
  CheckCircle, 
  Users, 
  Phone, 
  Mail, 
  History, 
  X,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react'

interface RoomGridProps {
  refreshKey?: number
  onResolve?: (id: number) => void
}

const CLIENT_STATUS_CONFIG: Record<string, { icon: React.ReactNode; border: string; bg: string; badge: string; label: string }> = {
  ALERT: { 
    icon: <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" />, 
    border: 'border-red-300 shadow-red-50', 
    bg: 'bg-red-50/70', 
    badge: 'bg-red-100 text-red-800 border-red-200',
    label: 'Alerte active' 
  },
  ERROR: { 
    icon: <Wrench className="h-5 w-5 text-yellow-500" />, 
    border: 'border-yellow-300 shadow-yellow-50', 
    bg: 'bg-yellow-50/70', 
    badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    label: 'Problème capteur' 
  },
  ACTIVE: { 
    icon: <Wifi className="h-5 w-5 text-green-500" />, 
    border: 'border-green-300 shadow-green-50', 
    bg: 'bg-green-50/70', 
    badge: 'bg-green-100 text-green-800 border-green-200',
    label: 'Actif' 
  },
  INACTIVE: { 
    icon: <WifiOff className="h-5 w-5 text-gray-400" />, 
    border: 'border-gray-300 shadow-gray-50', 
    bg: 'bg-gray-50/70', 
    badge: 'bg-gray-100 text-gray-800 border-gray-200',
    label: 'Inactif' 
  },
}

const URGENCE_COLOR: Record<string, string> = {
  HIGH:   'text-red-600',
  MEDIUM: 'text-yellow-600',
  LOW:    'text-blue-500',
}

const RoomGrid: React.FC<RoomGridProps> = ({ refreshKey = 0, onResolve }) => {
  const { data: servers, loading: loadS } = useServers(refreshKey)
  const { data: users,   loading: loadU } = useUsers(refreshKey)
  const { data: alertes, loading: loadA } = useAlertes(refreshKey)
  const { data: contacts, loading: loadC } = useContacts(refreshKey)

  const [selectedClientId, setSelectedClientId] = useState<number | null>(null)

  if (loadS || loadU || loadA || loadC) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin mr-3" /> Chargement…
      </div>
    )
  }

  // Filter only active clients to be monitored by caregivers
  const monitoredClients = (users ?? []).filter(u => u.is_active !== false)

  const activeClient = users?.find(u => u.id === selectedClientId)
  const activeClientServers = activeClient ? (servers ?? []).filter(s => s.client_id === activeClient.id) : []
  const activeClientContacts = activeClient ? (contacts ?? []).filter(c => c.user_id === activeClient.id) : []
  const activeClientAlerts = activeClient 
    ? [...(alertes ?? [])]
        .filter(a => a.client_id === activeClient.id)
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    : []

  return (
    <div className="space-y-4">
      {/* Clients vignettes grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {monitoredClients.map(usr => {
          const userServers = (servers ?? []).filter(s => s.client_id === usr.id)
          const userAlerts = (alertes ?? []).filter(a => a.client_id === usr.id && !a.is_resolved)
          const hasAlert = userAlerts.length > 0
          const hasError = userServers.some(s => s.status === 'ERROR')
          const hasActiveServer = userServers.some(s => s.status === 'ACTIVE')

          // Determine overall status
          let overallStatus = 'INACTIVE'
          if (hasAlert) {
            overallStatus = 'ALERT'
          } else if (hasError) {
            overallStatus = 'ERROR'
          } else if (hasActiveServer) {
            overallStatus = 'ACTIVE'
          }

          const cfg = CLIENT_STATUS_CONFIG[overallStatus] ?? CLIENT_STATUS_CONFIG.INACTIVE
          const lastAlert = [...userAlerts].sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0]

          return (
            <div
              key={usr.id}
              onClick={() => setSelectedClientId(usr.id)}
              className={`border-2 rounded-xl p-5 ${cfg.border} ${cfg.bg} shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col justify-between h-full`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100/80 text-[#23a5e3] rounded-lg">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-gray-900">{usr.name}</p>
                      <p className="text-xs text-gray-500">{usr.email}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold ${cfg.badge}`}>
                    {cfg.icon}
                    <span>{cfg.label}</span>
                  </div>
                </div>

                {/* Servers snippet */}
                <div className="mt-3 flex flex-wrap gap-1.5 items-center">
                  <span className="text-xs font-semibold text-gray-500 mr-1">Appareils :</span>
                  {userServers.length === 0 ? (
                    <span className="text-xs text-gray-400 italic">Aucun serveur</span>
                  ) : (
                    userServers.map(s => (
                      <span 
                        key={s.id} 
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                          s.status === 'ACTIVE' 
                            ? 'bg-green-50 text-green-700 border-green-150' 
                            : s.status === 'ERROR'
                              ? 'bg-red-50 text-red-700 border-red-150 animate-pulse'
                              : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}
                      >
                        {s.local_server_id}
                      </span>
                    ))
                  )}
                </div>

                {/* Active alert details */}
                {lastAlert && (
                  <div className="mt-4 border-t border-gray-200/60 pt-3 space-y-2">
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-wide">Alerte Chute En Cours</p>
                    <p className={`text-sm font-semibold ${URGENCE_COLOR[lastAlert.niveau_urgence] ?? 'text-gray-700'}`}>
                      {lastAlert.etat_de_la_chute}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Clock className="h-3.5 w-3.5" />
                      Temps au sol : {lastAlert.temps_au_sol}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      Détectée à : {lastAlert.timestamp}
                    </div>
                  </div>
                )}
              </div>

              {/* Action resolve */}
              {lastAlert && (
                <div className="pt-3 mt-3 border-t border-gray-200/60 flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation() // Prevent opening modal
                      if (onResolve) onResolve(lastAlert.id)
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-green-50 text-green-700 border border-green-300 hover:bg-green-100 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <CheckCircle className="h-3.5 w-3.5" /> Résoudre
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {monitoredClients.length === 0 && (
          <p className="col-span-3 text-center text-gray-400 py-12">Aucun client sous surveillance.</p>
        )}
      </div>

      {/* Patient Detail & History Modal */}
      {selectedClientId && activeClient && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity" onClick={() => setSelectedClientId(null)}>
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-150 flex flex-col"
            onClick={e => e.stopPropagation()} // Prevent closing when clicking modal content
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 text-[#23a5e3] rounded-lg">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Détails du Patient : {activeClient.name}</h3>
                  <p className="text-xs text-gray-500">{activeClient.email}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedClientId(null)}
                className="p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
              
              {/* Emergency Contacts card list */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Contacts d&apos;urgence</h4>
                {activeClientContacts.length === 0 ? (
                  <p className="text-xs text-gray-500 italic bg-gray-50 p-4 rounded-lg">Aucun contact d&apos;urgence configuré.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeClientContacts.map(c => (
                      <div key={c.id} className="p-3.5 bg-gray-50 border border-gray-200 rounded-lg flex flex-col justify-between space-y-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{c.contact_name}</p>
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-1">
                            <Phone className="h-3.5 w-3.5 text-gray-400" />
                            <span>{c.num_tel}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-0.5">
                            <Mail className="h-3.5 w-3.5 text-gray-400" />
                            <span>{c.mail}</span>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-gray-200/60 flex items-center gap-1 text-xs font-semibold">
                          {c.pris_en_charge ? (
                            <span className="text-green-700 flex items-center gap-1"><ShieldCheck className="h-4 w-4 text-green-500" /> Pris en charge</span>
                          ) : (
                            <span className="text-red-700 flex items-center gap-1"><ShieldAlert className="h-4 w-4 text-red-500 animate-pulse" /> Non pris en charge</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* IoT Servers card list */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Appareils et Serveurs IoT</h4>
                {activeClientServers.length === 0 ? (
                  <p className="text-xs text-gray-500 italic bg-gray-50 p-4 rounded-lg">Aucun appareil configuré.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeClientServers.map(s => (
                      <div key={s.id} className="p-3.5 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Server className="h-5 w-5 text-[#23a5e3]" />
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{s.local_server_id}</p>
                            <p className="text-xs text-gray-500">Forfait : {s.forfait}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                          s.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-red-100 text-red-800 border-red-200 animate-pulse'
                        }`}>
                          {s.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Alert history */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <History className="h-4 w-4 text-gray-400" />
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Historique des Alertes</h4>
                </div>
                {activeClientAlerts.length === 0 ? (
                  <p className="text-xs text-gray-500 italic bg-gray-50 p-4 rounded-lg">Aucun historique d&apos;alerte.</p>
                ) : (
                  <div className="border border-gray-200 rounded-lg overflow-hidden bg-white max-h-60 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Alerte / Fall Type</th>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Urgence</th>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Temps au sol</th>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date/Heure</th>
                          <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-150">
                        {activeClientAlerts.map(a => (
                          <tr key={a.id} className={`hover:bg-gray-50/70 transition-colors ${!a.is_resolved ? 'bg-red-50/30' : ''}`}>
                            <td className="px-4 py-2.5 text-sm font-semibold text-gray-900">
                              {a.etat_de_la_chute}
                            </td>
                            <td className="px-4 py-2.5 text-xs">
                              <span className={`px-2 py-0.5 rounded-full font-bold border ${
                                a.niveau_urgence === 'HIGH'
                                  ? 'bg-red-100 text-red-800 border-red-200'
                                  : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              }`}>
                                {a.niveau_urgence}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-xs text-gray-600">
                              {a.temps_au_sol}
                            </td>
                            <td className="px-4 py-2.5 text-xs text-gray-500">
                              {a.timestamp}
                            </td>
                            <td className="px-4 py-2.5 text-right text-xs whitespace-nowrap">
                              {a.is_resolved ? (
                                <span className="text-green-700 font-bold flex items-center justify-end gap-1">
                                  <CheckCircle className="h-3.5 w-3.5 text-green-500" /> Résolu
                                </span>
                              ) : (
                                <button
                                  onClick={() => {
                                    if (onResolve) onResolve(a.id)
                                  }}
                                  className="px-2.5 py-1 rounded bg-green-50 text-green-700 border border-green-300 hover:bg-green-100 font-semibold cursor-pointer"
                                >
                                  Résoudre
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex justify-end shrink-0">
              <button 
                onClick={() => setSelectedClientId(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-xs font-semibold transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

export default RoomGrid