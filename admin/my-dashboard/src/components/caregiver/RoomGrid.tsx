import React from 'react'
import { useServers, useUsers, useAlertes } from '../../hooks/useApi'
import { Loader2, Wifi, WifiOff, AlertTriangle, Wrench, Server, Clock, CheckCircle } from 'lucide-react'

interface RoomGridProps {
  refreshKey?: number
  onResolve?: (id: number) => void
}

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; border: string; bg: string; label: string }> = {
  ACTIVE:      { icon: <Wifi className="h-5 w-5 text-green-500" />,      border: 'border-green-300',  bg: 'bg-green-50',   label: 'Actif' },
  INACTIVE:    { icon: <WifiOff className="h-5 w-5 text-gray-400" />,    border: 'border-gray-300',   bg: 'bg-gray-50',    label: 'Inactif' },
  ERROR:       { icon: <AlertTriangle className="h-5 w-5 text-red-500" />, border: 'border-red-300',  bg: 'bg-red-50',     label: 'Erreur' },
  MAINTENANCE: { icon: <Wrench className="h-5 w-5 text-yellow-500" />,   border: 'border-yellow-300', bg: 'bg-yellow-50',  label: 'Maintenance' },
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

  if (loadS || loadU || loadA) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin mr-3" /> Chargement…
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Serveurs locaux — vue en direct</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(servers ?? []).map(srv => {
          const cfg   = STATUS_CONFIG[srv.status] ?? STATUS_CONFIG.INACTIVE
          const owner = users?.find(u => u.id === srv.client_id)

          // Last unresolved alert for this server
          const srvAlertes = (alertes ?? [])
            .filter(a => a.local_server_id === srv.id && !a.is_resolved)
            .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
          const lastAlert = srvAlertes[0]

          return (
            <div
              key={srv.id}
              className={`border-2 rounded-xl p-5 ${cfg.border} ${cfg.bg} transition-all duration-200 hover:shadow-md`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-[#23a5e3]" />
                  <div>
                    <p className="text-base font-bold text-gray-900">{srv.local_server_id}</p>
                    <p className="text-xs text-gray-500">@{srv.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {cfg.icon}
                  <span className="text-xs font-semibold text-gray-600">{cfg.label}</span>
                </div>
              </div>

              {/* Client */}
              <div className="mb-3 text-sm text-gray-700">
                <span className="font-medium">Client :</span>{' '}
                {owner ? (
                  <span>{owner.name} <span className="text-xs text-gray-400">({owner.email})</span></span>
                ) : (
                  <span className="text-gray-400">#{srv.client_id}</span>
                )}
              </div>

              {/* Forfait */}
              <div className="mb-3">
                <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600 font-medium capitalize">
                  {srv.forfait}
                </span>
              </div>

              {/* Active alert */}
              {lastAlert ? (
                <div className="mt-3 border-t pt-3 border-gray-200 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Dernière alerte active</p>
                  <p className={`text-sm font-semibold ${URGENCE_COLOR[lastAlert.niveau_urgence] ?? 'text-gray-700'}`}>
                    {lastAlert.etat_de_la_chute}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    Temps au sol : {lastAlert.temps_au_sol}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    {lastAlert.timestamp}
                  </div>
                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onResolve) onResolve(lastAlert.id);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-green-50 text-green-700 border border-green-300 hover:bg-green-100 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <CheckCircle className="h-3 w-3" /> Résoudre
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 border-t pt-3 border-gray-200">
                  <p className="text-xs text-green-600 font-medium">✓ Aucune alerte active</p>
                </div>
              )}

              {/* Alert count */}
              {srvAlertes.length > 1 && (
                <p className="text-xs text-gray-400 mt-1">+{srvAlertes.length - 1} autre(s) alerte(s) non résolue(s)</p>
              )}
            </div>
          )
        })}

        {(servers ?? []).length === 0 && (
          <p className="col-span-3 text-center text-gray-400 py-12">Aucun serveur enregistré.</p>
        )}
      </div>
    </div>
  )
}

export default RoomGrid