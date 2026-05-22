import React from 'react'
import { useAlertes, useServers, useUsers } from '../../hooks/useApi'
import { Loader2 } from 'lucide-react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, LineElement, PointElement, LinearScale,
  CategoryScale, Title, Tooltip, Legend,
} from 'chart.js'

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend)

function groupByDay(timestamps: string[]): Record<string, number> {
  return timestamps.reduce<Record<string, number>>((acc, ts) => {
    const day = ts.split('T')[0] || ts.split(' ')[0] || ts.slice(0, 10)
    acc[day] = (acc[day] ?? 0) + 1
    return acc
  }, {})
}

const UsageStatistics: React.FC = () => {
  const { data: alertes, loading: loadA } = useAlertes()
  const { data: servers, loading: loadS } = useServers()
  const { data: users,   loading: loadU } = useUsers()

  if (loadA || loadS || loadU) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin mr-3" /> Chargement…
      </div>
    )
  }

  // Alertes per day
  const allTimestamps = (alertes ?? []).map(a => a.timestamp)
  const byDay = groupByDay(allTimestamps)
  const sortedDays = Object.keys(byDay).sort()

  const alertesChartData = {
    labels: sortedDays,
    datasets: [
      {
        label: 'Alertes / jour',
        data: sortedDays.map(d => byDay[d]),
        borderColor: 'rgba(35, 165, 227, 1)',
        backgroundColor: 'rgba(35, 165, 227, 0.1)',
        fill: true,
        tension: 0.3,
      },
    ],
  }

  // Status distribution
  const statusCounts = (servers ?? []).reduce<Record<string, number>>((acc, s) => {
    acc[s.status] = (acc[s.status] ?? 0) + 1
    return acc
  }, {})

  // Servers per client
  const clientServerCount = (users ?? []).map(u => ({
    name: u.name,
    count: (servers ?? []).filter(s => s.client_id === u.id).length,
  }))

  // Forfait distribution
  const forfaitCounts = (servers ?? []).reduce<Record<string, number>>((acc, s) => {
    acc[s.forfait] = (acc[s.forfait] ?? 0) + 1
    return acc
  }, {})

  const statusColor: Record<string, string> = {
    ACTIVE:      'bg-green-500',
    INACTIVE:    'bg-gray-400',
    ERROR:       'bg-red-500',
    MAINTENANCE: 'bg-yellow-500',
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Statistiques d'utilisation</h2>

      {/* Alertes over time */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Alertes par jour</h3>
        {sortedDays.length > 0 ? (
          <Line data={alertesChartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
        ) : (
          <p className="text-sm text-gray-400">Pas encore de données.</p>
        )}
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white shadow rounded-lg p-5">
          <p className="text-sm text-gray-500 mb-1">Total alertes</p>
          <p className="text-3xl font-bold text-gray-900">{alertes?.length ?? 0}</p>
          <p className="text-xs text-gray-400 mt-1">
            {(alertes ?? []).filter(a => !a.is_resolved).length} non résolues
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-5">
          <p className="text-sm text-gray-500 mb-1">Serveurs locaux</p>
          <p className="text-3xl font-bold text-gray-900">{servers?.length ?? 0}</p>
          <div className="mt-2 space-y-1">
            {Object.entries(statusCounts).map(([s, n]) => (
              <div key={s} className="flex items-center gap-2 text-xs text-gray-600">
                <span className={`h-2 w-2 rounded-full ${statusColor[s] ?? 'bg-gray-300'}`} />
                {s}: {n}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-5">
          <p className="text-sm text-gray-500 mb-1">Clients</p>
          <p className="text-3xl font-bold text-gray-900">{users?.length ?? 0}</p>
        </div>
      </div>

      {/* Servers per client */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Serveurs par client</h3>
        <div className="space-y-2">
          {clientServerCount.map(({ name, count }) => (
            <div key={name} className="flex items-center gap-3">
              <span className="w-32 text-sm text-gray-700 truncate">{name}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-3">
                <div
                  className="bg-[#23a5e3] h-3 rounded-full"
                  style={{ width: `${count === 0 ? 2 : (count / (servers?.length || 1)) * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-6 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Forfait breakdown */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Répartition des forfaits</h3>
        <div className="flex flex-wrap gap-4">
          {Object.entries(forfaitCounts).map(([f, n]) => (
            <div key={f} className="flex-1 min-w-[100px] bg-gray-50 border rounded-lg p-4 text-center">
              <p className="text-sm font-medium text-gray-600 capitalize">{f}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{n}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default UsageStatistics