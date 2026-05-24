// Central fetch hook — reads VITE_API_URL from env (default: localhost:8000)
import { useState, useEffect } from 'react'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export interface User {
  id: number
  email: string
  name: string
}

export interface LocalServer {
  id: number
  local_server_id: string
  client_id: number
  forfait: string
  username: string
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR' | 'MAINTENANCE'
}

export interface Alerte {
  id: number
  local_server_id: number
  client_id: number
  etat_de_la_chute: string
  temps_au_sol: string
  niveau_urgence: string
  timestamp: string
  is_resolved: boolean
}

function useFetch<T>(path: string, refreshKey = 0) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (data === null) {
      setLoading(true)
    }
    fetch(`${BASE}${path}`)
      .then(r => { if (!r.ok) throw new Error(r.statusText); return r.json() })
      .then(d => { setData(d); setError(null) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [path, refreshKey])

  return { data, loading, error }
}

export function useUsers(refreshKey = 0) {
  return useFetch<User[]>('/users', refreshKey)
}

export function useServers(refreshKey = 0) {
  return useFetch<LocalServer[]>('/servers', refreshKey)
}

export function useAlertes(refreshKey = 0) {
  return useFetch<Alerte[]>('/alertes', refreshKey)
}

export async function resolveAlerte(id: number): Promise<void> {
  const r = await fetch(`${BASE}/api/v1/alertes/${id}/resolve`, { method: 'PUT' })
  if (!r.ok) throw new Error(r.statusText)
}
