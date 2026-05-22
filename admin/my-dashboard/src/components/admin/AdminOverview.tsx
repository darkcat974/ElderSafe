import React from 'react'
import { Users, Server, Bell, Activity, Loader2 } from 'lucide-react'
import { useUsers, useServers, useAlertes } from '../../hooks/useApi'

const StatusDot: React.FC<{ status: string }> = ({ status }) => {
  const colors: Record<string, string> = {
    ACTIVE: 'bg-green-500',
    INACTIVE: 'bg-gray-400',
    ERROR: 'bg-red-500',
    MAINTENANCE: 'bg-yellow-500',
  }
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${colors[status] ?? 'bg-gray-300'}`} />
}

const StatCard: React.FC<{
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
  color: string
}> = ({ icon, label, value, sub, color }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className={`p-3 rounded-full ${color}`}>{icon}</div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
    {sub && <p className="mt-3 text-sm text-gray-500">{sub}</p>}
  </div>
)

const AdminOverview: React.FC = () => {
  const { data: users, loading: loadU } = useUsers()
  const { data: servers, loading: loadS } = useServers()
  const { data: alertes, loading: loadA } = useAlertes()

  const activeServers  = servers?.filter(s => s.status === 'ACTIVE').length ?? 0
  const errorServers   = servers?.filter(s => s.status === 'ERROR').length ?? 0
  const unresolvedAlertes = alertes?.filter(a => !a.is_resolved).length ?? 0
  const criticalAlertes   = alertes?.filter(a => a.niveau_urgence === 'HIGH' && !a.is_resolved).length ?? 0

  const recentAlertes = [...(alertes ?? [])]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 5)

  if (loadU || loadS || loadA) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin mr-3" /> Chargement…
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="h-6 w-6 text-[#23a5e3]" />}
          label="Clients"
          value={users?.length ?? 0}
          color="bg-blue-100"
        />
        <StatCard
          icon={<Server className="h-6 w-6 text-green-600" />}
          label="Serveurs actifs"
          value={activeServers}
          sub={`${errorServers} en erreur`}
          color="bg-green-100"
        />
        <StatCard
          icon={<Bell className="h-6 w-6 text-yellow-600" />}
          label="Alertes non résolues"
          value={unresolvedAlertes}
          sub={`${criticalAlertes} critiques`}
          color="bg-yellow-100"
        />
        <StatCard
          icon={<Activity className="h-6 w-6 text-purple-600" />}
          label="Total serveurs"
          value={servers?.length ?? 0}
          color="bg-purple-100"
        />
      </div>

      {/* Server status breakdown */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">État des serveurs locaux</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {(servers ?? []).map(srv => {
            const owner = users?.find(u => u.id === srv.client_id)
            return (
              <div key={srv.id} className="px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StatusDot status={srv.status} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{srv.local_server_id}</p>
                    <p className="text-xs text-gray-500">
                      Client : {owner?.name ?? `#${srv.client_id}`} · Forfait : {srv.forfait}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{srv.status}</span>
              </div>
            )
          })}
          {(servers ?? []).length === 0 && (
            <p className="px-6 py-4 text-sm text-gray-500">Aucun serveur enregistré.</p>
          )}
        </div>
      </div>

      {/* Recent alerts */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Alertes récentes</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {recentAlertes.map(a => {
            const urgColor = a.niveau_urgence === 'HIGH'
              ? 'bg-red-100 text-red-700'
              : a.niveau_urgence === 'MEDIUM'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-blue-100 text-blue-700'
            return (
              <div key={a.id} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{a.etat_de_la_chute}</p>
                  <p className="text-xs text-gray-500">
                    Serveur #{a.local_server_id} · Temps au sol : {a.temps_au_sol}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${urgColor}`}>
                    {a.niveau_urgence}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${a.is_resolved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {a.is_resolved ? 'Résolu' : 'En cours'}
                  </span>
                  <span className="text-xs text-gray-400">{a.timestamp}</span>
                </div>
              </div>
            )
          })}
          {recentAlertes.length === 0 && (
            <p className="px-6 py-4 text-sm text-gray-500">Aucune alerte.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminOverview