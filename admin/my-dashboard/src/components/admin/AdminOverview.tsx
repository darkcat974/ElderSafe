import React, { useState } from 'react'
import { 
  Users, 
  Server, 
  Bell, 
  Activity, 
  Loader2, 
  X, 
  Plus, 
  Trash2, 
  Phone, 
  Mail, 
  CheckCircle, 
  XCircle 
} from 'lucide-react'
import { 
  useUsers, 
  useServers, 
  useAlertes, 
  useContacts, 
  createContact, 
  updateContact, 
  deleteContact,
  createUser,
  updateUser,
  deactivateUser
} from '../../hooks/useApi'

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
  const [refreshKey, setRefreshKey] = useState(0)
  const { data: users, loading: loadU } = useUsers(refreshKey)
  const { data: servers, loading: loadS } = useServers(refreshKey)
  const { data: alertes, loading: loadA } = useAlertes(refreshKey)
  const { data: contacts, loading: loadC } = useContacts(refreshKey)

  // User Creation States
  const [isCreatingClient, setIsCreatingClient] = useState(false)
  const [newClientName, setNewClientName] = useState('')
  const [newClientEmail, setNewClientEmail] = useState('')
  const [clientFormError, setClientFormError] = useState<string | null>(null)
  const [isSubmittingClient, setIsSubmittingClient] = useState(false)

  // Modal and Form States
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null)
  const [contactName, setContactName] = useState('')
  const [numTel, setNumTel] = useState('')
  const [mail, setMail] = useState('')
  const [prisEnCharge, setPrisEnCharge] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // User Editing States (inside Modal)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editIsActive, setEditIsActive] = useState(true)
  const [editFormError, setEditFormError] = useState<string | null>(null)
  const [isUpdatingClient, setIsUpdatingClient] = useState(false)

  const activeServers  = servers?.filter(s => s.status === 'ACTIVE').length ?? 0
  const errorServers   = servers?.filter(s => s.status === 'ERROR').length ?? 0
  const unresolvedAlertes = alertes?.filter(a => !a.is_resolved).length ?? 0
  const criticalAlertes   = alertes?.filter(a => a.niveau_urgence === 'HIGH' && !a.is_resolved).length ?? 0

  const recentAlertes = [...(alertes ?? [])]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 5)

  const handleOpenClientModal = (userId: number) => {
    setSelectedClientId(userId)
    const client = users?.find(u => u.id === userId)
    if (client) {
      setEditName(client.name)
      setEditEmail(client.email)
      setEditIsActive(client.is_active)
    }
    setContactName('')
    setNumTel('')
    setMail('')
    setPrisEnCharge(false)
    setFormError(null)
    setEditFormError(null)
  }

  // Create User
  const handleCreateClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newClientName || !newClientEmail) {
      setClientFormError("Veuillez remplir tous les champs.")
      return
    }

    setIsSubmittingClient(true)
    setClientFormError(null)

    try {
      await createUser({
        name: newClientName,
        email: newClientEmail,
        is_active: true
      })
      setNewClientName('')
      setNewClientEmail('')
      setIsCreatingClient(false)
      setRefreshKey(k => k + 1)
    } catch (err: any) {
      setClientFormError("Erreur lors de la création du client (l'email est peut-être déjà utilisé).")
      console.error(err)
    } finally {
      setIsSubmittingClient(false)
    }
  }

  // Update User
  const handleUpdateClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClientId) return
    if (!editName || !editEmail) {
      setEditFormError("Veuillez remplir le nom et l'email.")
      return
    }

    setIsUpdatingClient(true)
    setEditFormError(null)

    try {
      await updateUser(selectedClientId, {
        name: editName,
        email: editEmail,
        is_active: editIsActive
      })
      setRefreshKey(k => k + 1)
    } catch (err: any) {
      setEditFormError("Erreur lors de la mise à jour.")
      console.error(err)
    } finally {
      setIsUpdatingClient(false)
    }
  }

  // Deactivate User ("au lieu de supprimer, juste les passer en inactif")
  const handleDeactivateClient = async () => {
    if (!selectedClientId) return
    if (!window.confirm("Êtes-vous sûr de vouloir désactiver ce client ?")) return
    try {
      await deactivateUser(selectedClientId)
      setEditIsActive(false)
      setRefreshKey(k => k + 1)
      setSelectedClientId(null) // Close modal
    } catch (err: any) {
      console.error("Erreur lors de la désactivation du client", err)
    }
  }

  const handleTogglePrisEnCharge = async (contact: any) => {
    try {
      await updateContact(contact.id, {
        contact_name: contact.contact_name,
        user_name: contact.user_name,
        user_id: contact.user_id,
        num_tel: contact.num_tel,
        mail: contact.mail,
        pris_en_charge: !contact.pris_en_charge
      })
      setRefreshKey(k => k + 1)
    } catch (e: any) {
      console.error("Erreur lors de la mise à jour du contact", e)
    }
  }

  const handleDeleteContact = async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce contact ?")) return
    try {
      await deleteContact(id)
      setRefreshKey(k => k + 1)
    } catch (e: any) {
      console.error("Erreur lors de la suppression du contact", e)
    }
  }

  const handleAddContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClientId) return
    const user = users?.find(u => u.id === selectedClientId)
    if (!user) return

    if (!contactName || !numTel || !mail) {
      setFormError("Veuillez remplir tous les champs obligatoires.")
      return
    }

    setIsSubmitting(true)
    setFormError(null)

    try {
      await createContact({
        contact_name: contactName,
        user_name: user.name,
        user_id: user.id,
        num_tel: numTel,
        mail: mail,
        pris_en_charge: prisEnCharge
      })
      // Clear form
      setContactName('')
      setNumTel('')
      setMail('')
      setPrisEnCharge(false)
      setRefreshKey(k => k + 1)
    } catch (e: any) {
      setFormError("Erreur lors de la création du contact.")
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loadU || loadS || loadA || loadC) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin mr-3" /> Chargement…
      </div>
    )
  }

  const activeClient = users?.find(u => u.id === selectedClientId)
  const activeClientServers = activeClient ? (servers ?? []).filter(s => s.client_id === activeClient.id) : []
  const activeClientContacts = activeClient ? (contacts ?? []).filter(c => c.user_id === activeClient.id) : []

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

      {/* Clients list */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Clients &amp; Patients</h3>
            <p className="text-xs text-gray-500 font-medium">Cliquez sur un client pour gérer ses informations, contacts, et serveurs</p>
          </div>
          <button
            onClick={() => {
              setIsCreatingClient(!isCreatingClient)
              setNewClientName('')
              setNewClientEmail('')
              setClientFormError(null)
            }}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-[#23a5e3] text-white hover:bg-[#1e8fc4] font-semibold transition-colors cursor-pointer"
          >
            {isCreatingClient ? "Annuler" : (
              <>
                <Plus className="h-3.5 w-3.5" /> Ajouter un client
              </>
            )}
          </button>
        </div>

        {/* Client Creation Form */}
        {isCreatingClient && (
          <form onSubmit={handleCreateClientSubmit} className="p-6 bg-gray-50 border-b border-gray-200 space-y-4">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Créer un nouveau client</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nom du client *</label>
                <input
                  type="text"
                  required
                  value={newClientName}
                  onChange={e => setNewClientName(e.target.value)}
                  placeholder="Ex: Alice Smith"
                  className="w-full text-sm border border-gray-300 rounded px-3 py-2 bg-white focus:ring-1 focus:ring-[#23a5e3] focus:border-[#23a5e3] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Adresse email *</label>
                <input
                  type="email"
                  required
                  value={newClientEmail}
                  onChange={e => setNewClientEmail(e.target.value)}
                  placeholder="Ex: alice@mail.com"
                  className="w-full text-sm border border-gray-300 rounded px-3 py-2 bg-white focus:ring-1 focus:ring-[#23a5e3] focus:border-[#23a5e3] focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreatingClient(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-xs font-semibold hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmittingClient}
                className="flex items-center gap-1 px-4 py-2 rounded-md bg-[#23a5e3] text-white hover:bg-[#1e8fc4] text-xs font-semibold disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isSubmittingClient ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                Créer le client
              </button>
            </div>
            {clientFormError && (
              <p className="text-xs text-red-600 font-medium">{clientFormError}</p>
            )}
          </form>
        )}

        <div className="divide-y divide-gray-200">
          {(users ?? []).map(usr => {
            const userServers = (servers ?? []).filter(s => s.client_id === usr.id)
            const userContacts = (contacts ?? []).filter(c => c.user_id === usr.id)
            return (
              <div 
                key={usr.id} 
                className={`px-6 py-4 flex items-center justify-between hover:bg-blue-50/50 transition-colors cursor-pointer group ${!usr.is_active ? 'opacity-60 bg-gray-50/50' : ''}`}
                onClick={() => handleOpenClientModal(usr.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg transition-colors ${
                    usr.is_active 
                      ? 'bg-blue-50 text-[#23a5e3] group-hover:bg-[#23a5e3] group-hover:text-white' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center">
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-[#23a5e3] transition-colors">{usr.name}</p>
                      {!usr.is_active && (
                        <span className="text-[10px] font-semibold bg-gray-100 text-gray-500 border border-gray-200 px-1.5 py-0.5 rounded ml-2 uppercase tracking-wide">
                          Inactif
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{usr.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Server className="h-3.5 w-3.5" /> {userServers.length} serveur(s)</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {userContacts.length} contact(s)</span>
                </div>
              </div>
            )
          })}
          {(users ?? []).length === 0 && (
            <p className="px-6 py-4 text-sm text-gray-500 italic text-center">Aucun client enregistré.</p>
          )}
        </div>
      </div>

      {/* <div className="bg-white rounded-lg shadow overflow-hidden">
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
                      Client :{' '}
                      {owner ? (
                        <span 
                          onClick={(e) => { e.stopPropagation(); handleOpenClientModal(owner.id); }}
                          className="font-semibold text-[#23a5e3] hover:underline cursor-pointer"
                        >
                          {owner.name}
                        </span>
                      ) : (
                        <span className="text-gray-400">#{srv.client_id}</span>
                      )}{' '}
                      · Forfait : {srv.forfait}
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
      </div> */}

      {/* Recent alerts */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Alertes récentes</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {recentAlertes.map(a => {
            const owner = users?.find(u => u.id === a.client_id)
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
                    Serveur #{a.local_server_id} · Patient :{' '}
                    {owner ? (
                      <span 
                        onClick={(e) => { e.stopPropagation(); handleOpenClientModal(owner.id); }}
                        className="font-semibold text-[#23a5e3] hover:underline cursor-pointer"
                      >
                        {owner.name}
                      </span>
                    ) : (
                      <span className="text-gray-400">#{a.client_id}</span>
                    )}{' '}
                    · Temps au sol : {a.temps_au_sol}
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

      {/* Client Detail Modal */}
      {selectedClientId && activeClient && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-150 flex flex-col">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 shrink-0">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${activeClient.is_active ? 'bg-blue-100 text-[#23a5e3]' : 'bg-gray-150 text-gray-400'}`}>
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Détails du Client : {activeClient.name}</h3>
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
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Client Edit Section */}
              <form onSubmit={handleUpdateClientSubmit} className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Modifier les informations du client</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Nom *</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#23a5e3] focus:border-[#23a5e3] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={editEmail}
                      onChange={e => setEditEmail(e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#23a5e3] focus:border-[#23a5e3] bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="edit-active-modal"
                      checked={editIsActive}
                      onChange={e => setEditIsActive(e.target.checked)}
                      className="h-4 w-4 text-[#23a5e3] border-gray-300 rounded focus:ring-[#23a5e3]"
                    />
                    <label htmlFor="edit-active-modal" className="text-xs font-medium text-gray-700 cursor-pointer select-none">
                      Le client est actif (les alertes sont traitées)
                    </label>
                  </div>

                  <div className="flex gap-2">
                    {editIsActive ? (
                      <button
                        type="button"
                        onClick={handleDeactivateClient}
                        className="px-3 py-1.5 text-xs font-semibold rounded text-red-700 border border-red-200 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                      >
                        Désactiver (Inactif)
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEditIsActive(true)}
                        className="px-3 py-1.5 text-xs font-semibold rounded text-green-700 border border-green-200 bg-green-50 hover:bg-green-100 transition-colors cursor-pointer"
                      >
                        Réactiver (Actif)
                      </button>
                    )}

                    <button
                      type="submit"
                      disabled={isUpdatingClient}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-[#23a5e3] text-white hover:bg-[#1e8fc4] text-xs font-semibold disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      {isUpdatingClient && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Enregistrer
                    </button>
                  </div>
                </div>

                {editFormError && (
                  <p className="text-xs text-red-600 font-medium">{editFormError}</p>
                )}
              </form>

              {/* Servers list */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">Serveurs IoT Attribués</h4>
                {activeClientServers.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">Aucun serveur attribué à ce client.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {activeClientServers.map(s => {
                      const badgeColors = {
                        ACTIVE: 'bg-green-100 text-green-800 border-green-200',
                        INACTIVE: 'bg-gray-100 text-gray-800 border-gray-200',
                        ERROR: 'bg-red-100 text-red-800 border-red-200',
                        MAINTENANCE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                      }
                      const statusColor = badgeColors[s.status] || badgeColors.INACTIVE
                      return (
                        <div key={s.id} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${statusColor} font-semibold`}>
                          <Server className="h-3.5 w-3.5" />
                          <span>{s.local_server_id}</span>
                          <span className="opacity-75 font-normal">({s.status.toLowerCase()})</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Contacts section */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contacts d&apos;urgence</h4>
                </div>

                {/* Form layout inline inside modal */}
                <form onSubmit={handleAddContactSubmit} className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
                  <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Ajouter un nouveau contact</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Nom *</label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={e => setContactName(e.target.value)}
                        placeholder="Ex: Jean Dupont"
                        className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#23a5e3] focus:border-[#23a5e3] bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Téléphone *</label>
                      <input
                        type="text"
                        required
                        value={numTel}
                        onChange={e => setNumTel(e.target.value)}
                        placeholder="Ex: 0612345678"
                        className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#23a5e3] focus:border-[#23a5e3] bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Email *</label>
                      <input
                        type="email"
                        required
                        value={mail}
                        onChange={e => setMail(e.target.value)}
                        placeholder="Ex: jean.dupont@mail.com"
                        className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#23a5e3] focus:border-[#23a5e3] bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="pris-charge-modal"
                        checked={prisEnCharge}
                        onChange={e => setPrisEnCharge(e.target.checked)}
                        className="h-4 w-4 text-[#23a5e3] border-gray-300 rounded focus:ring-[#23a5e3]"
                      />
                      <label htmlFor="pris-charge-modal" className="text-xs font-medium text-gray-700 cursor-pointer select-none">
                        Marquer immédiatement comme &quot;Pris en charge&quot;
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#23a5e3] text-white hover:bg-[#1e8fc4] text-xs font-semibold disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                      Ajouter le contact
                    </button>
                  </div>

                  {formError && (
                    <p className="text-xs text-red-600 mt-2 font-medium">{formError}</p>
                  )}
                </form>

                {/* Contacts List Table */}
                {activeClientContacts.length === 0 ? (
                  <p className="text-sm text-gray-400 italic bg-gray-50 p-4 rounded-lg text-center">
                    Aucun contact d&apos;urgence configuré pour ce client.
                  </p>
                ) : (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nom</th>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Téléphone</th>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut Prise en Charge</th>
                          <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-150">
                        {activeClientContacts.map(contact => (
                          <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                              {contact.contact_name}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                              <div className="flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5 text-gray-400" />
                                {contact.num_tel}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                              <div className="flex items-center gap-1.5">
                                <Mail className="h-3.5 w-3.5 text-gray-400" />
                                {contact.mail}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              <button
                                onClick={() => handleTogglePrisEnCharge(contact)}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                                  contact.pris_en_charge 
                                    ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                                    : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                }`}
                                title="Cliquer pour changer le statut"
                              >
                                {contact.pris_en_charge ? (
                                  <>
                                    <CheckCircle className="h-3 w-3" /> Pris en charge
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-3 w-3" /> Pas pris en charge
                                  </>
                                )}
                              </button>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                              <button
                                onClick={() => handleDeleteContact(contact.id)}
                                className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                                title="Supprimer ce contact"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
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

export default AdminOverview