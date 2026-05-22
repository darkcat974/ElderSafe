import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, LogOut, AlertTriangle, Clock, ChevronDown, ChevronUp, CheckCircle, Loader2, X } from 'lucide-react'
import { useUser } from '../context/UserContext'
import { useAlertes, useServers, resolveAlerte } from '../hooks/useApi'
import RoomGrid from '../components/caregiver/RoomGrid'

const URGENCE_STYLE: Record<string, string> = {
  HIGH:   'bg-red-100 border-red-400 text-red-800',
  MEDIUM: 'bg-yellow-100 border-yellow-400 text-yellow-800',
  LOW:    'bg-blue-100 border-blue-400 text-blue-700',
}

const URGENCE_DOT: Record<string, string> = {
  HIGH:   'bg-red-500',
  MEDIUM: 'bg-yellow-500',
  LOW:    'bg-blue-400',
}

const CaregiverDashboard: React.FC = () => {
  const [refreshKey, setRefreshKey]     = useState(0)
  const [resolveOpen, setResolveOpen]   = useState(false)   // banner panel
  const [bellOpen, setBellOpen]         = useState(false)   // bell dropdown
  const bellRef                         = useRef<HTMLDivElement>(null)
  const { logout } = useUser()
  const navigate   = useNavigate()

  const { data: alertes, loading: loadA } = useAlertes(refreshKey)
  const { data: servers }                 = useServers()

  const activeAlertes = (alertes ?? []).filter(a => !a.is_resolved)
  const activeCount   = activeAlertes.length

  // Last 10 alertes regardless of status, newest first
  const last10 = [...(alertes ?? [])]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 10)

  const handleLogout = () => { logout(); navigate('/login') }

  const handleResolve = async (id: number) => {
    try {
      await resolveAlerte(id)
      setRefreshKey(k => k + 1)
    } catch (e) {
      console.error('Resolve failed', e)
    }
  }

  // Close bell dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="flex flex-col h-screen bg-gray-50">

      {/* ── Header ── */}
      <header className="bg-white shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#23a5e3]">ElderSafe</h1>
            <p className="text-sm text-gray-600">Tableau de bord des aides-soignants</p>
          </div>

          <div className="flex items-center space-x-4">

            {/* ── Bell with dropdown ── */}
            <div className="relative" ref={bellRef}>
              <button
                className="relative p-1 rounded-full hover:bg-gray-100 transition-colors"
                onClick={() => setBellOpen(o => !o)}
                title="10 dernières alertes"
              >
                <Bell className={`h-6 w-6 ${activeCount > 0 ? 'text-red-500' : 'text-gray-500'}`} />
                {activeCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold leading-none">
                    {activeCount > 9 ? '9+' : activeCount}
                  </span>
                )}
              </button>

              {/* Dropdown */}
              {bellOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                  {/* Dropdown header */}
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-semibold text-gray-700">10 dernières alertes</span>
                    </div>
                    <button onClick={() => setBellOpen(false)} className="text-gray-400 hover:text-gray-600">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Alert list */}
                  {loadA ? (
                    <div className="flex items-center justify-center py-8 text-gray-400">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement…
                    </div>
                  ) : last10.length === 0 ? (
                    <p className="px-4 py-6 text-center text-sm text-gray-400">Aucune alerte enregistrée.</p>
                  ) : (
                    <div className="divide-y divide-gray-100 max-h-[420px] overflow-y-auto">
                      {last10.map(a => {
                        const srv = servers?.find(s => s.id === a.local_server_id)
                        return (
                          <div key={a.id} className={`px-4 py-3 flex items-start gap-3 ${!a.is_resolved ? 'bg-white' : 'bg-gray-50 opacity-75'}`}>
                            {/* Urgency dot */}
                            <span className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${URGENCE_DOT[a.niveau_urgence] ?? 'bg-gray-300'}`} />

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className={`text-xs px-1.5 py-0.5 rounded font-semibold border ${URGENCE_STYLE[a.niveau_urgence] ?? 'bg-gray-100 border-gray-300 text-gray-600'}`}>
                                  {a.niveau_urgence}
                                </span>
                                <span className="text-sm font-medium text-gray-900 truncate">{a.etat_de_la_chute}</span>
                              </div>
                              <div className="flex flex-wrap gap-x-2 text-xs text-gray-400">
                                <span>{srv?.local_server_id ?? `Serveur #${a.local_server_id}`}</span>
                                <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" />{a.temps_au_sol}</span>
                                <span>{a.timestamp}</span>
                              </div>
                            </div>

                            {/* Status / Resolve */}
                            {a.is_resolved ? (
                              <span className="shrink-0 text-xs text-green-600 font-medium flex items-center gap-0.5 mt-0.5">
                                <CheckCircle className="h-3.5 w-3.5" /> Résolu
                              </span>
                            ) : (
                              <button
                                onClick={() => handleResolve(a.id)}
                                className="shrink-0 flex items-center gap-1 px-2 py-1 rounded bg-green-50 text-green-700 border border-green-300 hover:bg-green-100 text-xs font-semibold transition-colors"
                              >
                                <CheckCircle className="h-3 w-3" /> Résoudre
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button onClick={handleLogout} className="flex items-center text-gray-700 hover:text-[#23a5e3]">
              <LogOut className="h-5 w-5 mr-1" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Active alerts banner (only if > 0) ── */}
      {!loadA && activeCount > 0 && (
        <div
          className="bg-red-100 border-l-4 border-red-500 p-4 mx-4 mt-4 rounded cursor-pointer select-none"
          onClick={() => setResolveOpen(o => !o)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-3 shrink-0" />
              <div>
                <p className="font-bold text-red-700">Attention !</p>
                <p className="text-sm text-red-700">
                  {activeCount} {activeCount === 1 ? 'alerte active nécessite' : 'alertes actives nécessitent'} votre attention.
                </p>
              </div>
            </div>
            {resolveOpen
              ? <ChevronUp className="h-5 w-5 text-red-500" />
              : <ChevronDown className="h-5 w-5 text-red-500" />
            }
          </div>
        </div>
      )}

      {/* ── Alert resolution panel (collapsible) ── */}
      {resolveOpen && activeCount > 0 && (
        <div className="mx-4 mt-2 bg-white rounded-lg shadow border border-red-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Alertes à traiter ({activeCount})</h3>
            {loadA && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
          </div>
          <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
            {[...activeAlertes]
              .sort((a, b) => {
                const order = { HIGH: 0, MEDIUM: 1, LOW: 2 }
                const diff = (order[a.niveau_urgence as keyof typeof order] ?? 3) - (order[b.niveau_urgence as keyof typeof order] ?? 3)
                return diff !== 0 ? diff : b.timestamp.localeCompare(a.timestamp)
              })
              .map(a => {
                const srv = servers?.find(s => s.id === a.local_server_id)
                return (
                  <div key={a.id} className="px-5 py-3 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${URGENCE_STYLE[a.niveau_urgence] ?? 'bg-gray-100 text-gray-600 border-gray-300'}`}>
                          {a.niveau_urgence}
                        </span>
                        <span className="text-sm font-medium text-gray-900 truncate">{a.etat_de_la_chute}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500">
                        <span>Serveur : <strong>{srv?.local_server_id ?? `#${a.local_server_id}`}</strong></span>
                        <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" />{a.temps_au_sol}</span>
                        <span>{a.timestamp}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleResolve(a.id)}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-50 text-green-700 border border-green-300 hover:bg-green-100 text-xs font-semibold transition-colors"
                    >
                      <CheckCircle className="h-3.5 w-3.5" /> Résoudre
                    </button>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <main className="flex-1 overflow-auto p-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Surveillance des serveurs</h2>
          <RoomGrid refreshKey={refreshKey} />
        </div>
      </main>
    </div>
  )
}

export default CaregiverDashboard