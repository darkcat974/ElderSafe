import React, { useState } from 'react'
import { 
  useUsers, 
  useServers, 
  createUser, 
  updateUser, 
  deactivateUser 
} from '../../hooks/useApi'
import { 
  CreditCard, 
  Check, 
  X, 
  Loader2, 
  Server, 
  User, 
  Plus, 
  Edit2, 
  Power, 
  PowerOff 
} from 'lucide-react'

const SubscriptionManagement: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0)
  const { data: users, loading: loadU } = useUsers(refreshKey)
  const { data: servers, loading: loadS } = useServers(refreshKey)

  // Creation Modal States
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [createError, setCreateError] = useState<string | null>(null)
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false)

  // Edition Modal States
  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editIsActive, setEditIsActive] = useState(true)
  const [editError, setEditError] = useState<string | null>(null)
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false)

  if (loadU || loadS) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin mr-3" /> Chargement…
      </div>
    )
  }

  // Map users to their dynamic subscription state based on their assigned servers
  const clientSubscriptions = (users ?? []).map(usr => {
    const userServers = (servers ?? []).filter(s => s.client_id === usr.id)
    
    // Determine highest tier forfait
    let type: 'Basic' | 'Standard' | 'Premium' | 'Aucun' = 'Aucun'
    let amount = 0

    userServers.forEach(srv => {
      if (srv.forfait === 'enterprise') {
        type = 'Premium'
        amount += 49
      } else if (srv.forfait === 'pro') {
        if (type !== 'Premium') type = 'Standard'
        amount += 29
      } else {
        if (type !== 'Premium' && type !== 'Standard') type = 'Basic'
        amount += 19
      }
    })

    const status: 'Active' | 'Expired' = usr.is_active !== false ? 'Active' : 'Expired'

    return {
      id: usr.id,
      name: usr.name,
      email: usr.email,
      isActive: usr.is_active !== false,
      type,
      status,
      startDate: '2025-01-15',
      endDate: '2026-01-15',
      amount,
      deviceCount: userServers.length
    }
  })

  // Create User Handler
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName || !newEmail) {
      setCreateError("Veuillez remplir tous les champs.")
      return
    }

    setIsSubmittingCreate(true)
    setCreateError(null)

    try {
      await createUser({
        name: newName,
        email: newEmail,
        is_active: true
      })
      setNewName('')
      setNewEmail('')
      setIsCreating(false)
      setRefreshKey(k => k + 1)
    } catch (err: any) {
      setCreateError("Erreur lors de la création du client (l'email est peut-être déjà utilisé).")
      console.error(err)
    } finally {
      setIsSubmittingCreate(false)
    }
  }

  // Open Edit Modal
  const handleOpenEdit = (sub: any) => {
    setEditingUserId(sub.id)
    setEditName(sub.name)
    setEditEmail(sub.email)
    setEditIsActive(sub.isActive)
    setEditError(null)
  }

  // Update User Handler
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUserId) return
    if (!editName || !editEmail) {
      setEditError("Veuillez remplir le nom et l'email.")
      return
    }

    setIsSubmittingEdit(true)
    setEditError(null)

    try {
      await updateUser(editingUserId, {
        name: editName,
        email: editEmail,
        is_active: editIsActive
      })
      setEditingUserId(null)
      setRefreshKey(k => k + 1)
    } catch (err: any) {
      setEditError("Erreur lors de la mise à jour (l'email est peut-être déjà utilisé).")
      console.error(err)
    } finally {
      setIsSubmittingEdit(false)
    }
  }

  // Toggle User Activation (deactivateUser or updateUser to active)
  const handleToggleActivation = async (sub: any) => {
    const actionWord = sub.isActive ? "désactiver" : "activer"
    if (!window.confirm(`Êtes-vous sûr de vouloir ${actionWord} cet abonnement / client ?`)) return

    try {
      if (sub.isActive) {
        await deactivateUser(sub.id)
      } else {
        await updateUser(sub.id, {
          name: sub.name,
          email: sub.email,
          is_active: true
        })
      }
      setRefreshKey(k => k + 1)
    } catch (err: any) {
      console.error("Erreur lors du changement de statut", err)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-150 text-green-800 border-green-200'
      case 'Expired': return 'bg-red-150 text-red-800 border-red-200'
      default: return 'bg-gray-150 text-gray-800 border-gray-200'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Basic': return 'bg-blue-100 text-blue-800'
      case 'Standard': return 'bg-purple-100 text-purple-800'
      case 'Premium': return 'bg-[#e1f3fb] text-[#23a5e3]'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Gestion des abonnements particuliers</h2>
          <p className="text-sm text-gray-500">Gérez les clients, leurs informations et surveillez la facturation de leurs appareils IoT.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-[#23a5e3] hover:bg-[#1e8fc4] text-white rounded-md flex items-center text-xs font-semibold cursor-pointer transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Client
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type forfait</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date de début</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date de fin</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Montant total</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Appareils IoT</th>
                <th scope="col" className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clientSubscriptions.map((sub) => (
                <tr key={sub.id} className={`hover:bg-gray-50/70 transition-colors ${!sub.isActive ? 'opacity-65 bg-gray-50/30' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-gray-100 rounded-full text-gray-500">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{sub.name}</div>
                        <div className="text-xs text-gray-400">{sub.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full border ${getTypeColor(sub.type)}`}>
                      {sub.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full border ${getStatusColor(sub.status)}`}>
                      {sub.isActive ? 'Actif' : 'Inactif / Suspendu'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sub.startDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sub.endDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {sub.amount} € / an
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Server className="h-4 w-4 text-gray-400" />
                      <span>{sub.deviceCount} appareil(s)</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-semibold">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleOpenEdit(sub)}
                        className="p-1.5 bg-blue-50 text-blue-600 rounded border border-blue-200 hover:bg-blue-100 cursor-pointer flex items-center gap-1 text-[11px]"
                      >
                        <Edit2 className="h-3 w-3" /> Modifier
                      </button>
                      <button 
                        onClick={() => handleToggleActivation(sub)}
                        className={`p-1.5 rounded border cursor-pointer flex items-center gap-1 text-[11px] ${
                          sub.isActive
                            ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                            : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                        }`}
                      >
                        {sub.isActive ? (
                          <>
                            <PowerOff className="h-3 w-3" /> Suspendre
                          </>
                        ) : (
                          <>
                            <Power className="h-3 w-3" /> Réactiver
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {clientSubscriptions.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400 italic">
                    Aucun client enregistré pour les abonnements.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creation Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-gray-150 overflow-hidden text-left">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">Nouveau Client & Abonnement</h3>
              <button 
                onClick={() => setIsCreating(false)}
                className="p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="p-6 space-y-4">
                {createError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
                    {createError}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">NOM COMPLET</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Mme Alice Durand"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#23a5e3]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ADRESSE EMAIL</label>
                  <input
                    type="email"
                    required
                    placeholder="Ex: alice@mail.com"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#23a5e3]"
                  />
                </div>
              </div>
              <div className="px-6 py-3.5 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold rounded-md cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCreate}
                  className="px-4 py-2 bg-[#23a5e3] hover:bg-[#1e8fc4] text-white text-xs font-semibold rounded-md flex items-center cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingCreate && <Loader2 className="h-3 w-3 animate-spin mr-2" />}
                  Créer le Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edition Modal */}
      {editingUserId !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-gray-150 overflow-hidden text-left">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">Modifier le Client / Abonnement</h3>
              <button 
                onClick={() => setEditingUserId(null)}
                className="p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="p-6 space-y-4">
                {editError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
                    {editError}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">NOM COMPLET</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#23a5e3]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ADRESSE EMAIL</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#23a5e3]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">STATUT DE L&apos;ABONNEMENT</label>
                  <select
                    value={editIsActive ? 'true' : 'false'}
                    onChange={e => setEditIsActive(e.target.value === 'true')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#23a5e3] bg-white"
                  >
                    <option value="true">Actif (Abonnement En Cours)</option>
                    <option value="false">Inactif / Suspendu</option>
                  </select>
                </div>
              </div>
              <div className="px-6 py-3.5 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUserId(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold rounded-md cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-4 py-2 bg-[#23a5e3] hover:bg-[#1e8fc4] text-white text-xs font-semibold rounded-md flex items-center cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingEdit && <Loader2 className="h-3 w-3 animate-spin mr-2" />}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Forfaits disponibles section */}
      {/* <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Grille des forfaits particuliers (par appareil)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border rounded-xl p-5 bg-gray-50/50">
            <h4 className="text-base font-bold text-gray-900">Basic</h4>
            <p className="text-2xl font-black mt-2 text-gray-900">19 €<span className="text-xs font-normal text-gray-500"> / an / appareil</span></p>
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /><span className="text-gray-600">Surveillance chute basique</span></div>
              <div className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /><span className="text-gray-600">Alerte SMS soignants</span></div>
              <div className="flex items-center"><X className="h-4 w-4 text-red-500 mr-2" /><span className="text-gray-400">Rapports d&apos;activité</span></div>
            </div>
          </div>

          <div className="border rounded-xl p-5 border-[#23a5e3] bg-blue-50/10 shadow-sm">
            <div className="bg-[#23a5e3] text-white text-[9px] font-bold uppercase py-0.5 px-2 rounded-full inline-block mb-2">Recommandé</div>
            <h4 className="text-base font-bold text-gray-900">Standard</h4>
            <p className="text-2xl font-black mt-2 text-gray-900">29 €<span className="text-xs font-normal text-gray-500"> / an / appareil</span></p>
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /><span className="text-gray-600">Surveillance chute avancée</span></div>
              <div className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /><span className="text-gray-600">Appel d&apos;urgence automatique</span></div>
              <div className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /><span className="text-gray-600">Rapports d&apos;activité</span></div>
            </div>
          </div>

          <div className="border rounded-xl p-5 bg-gray-50/50">
            <h4 className="text-base font-bold text-gray-900">Premium</h4>
            <p className="text-2xl font-black mt-2 text-gray-900">49 €<span className="text-xs font-normal text-gray-500"> / an / appareil</span></p>
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /><span className="text-gray-600">Détection de chutes lourdes et légères</span></div>
              <div className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /><span className="text-gray-600">Support prioritaire 24h/7</span></div>
              <div className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /><span className="text-gray-600">Analyses de santé avancées</span></div>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  )
}

export default SubscriptionManagement