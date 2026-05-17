import React, { useState, useEffect, useMemo } from 'react';
import { User, Local_servers, Alerte } from './types';
import { encryptJson, decryptJson } from './crypto';
import './Dashboard.css';

const API_BASE = 'http://127.0.0.1:8000/';

const Dashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [servers, setServers] = useState<Local_servers[]>([]);
  const [alertes, setAlertes] = useState<Alerte[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeUserId, setActiveUserId] = useState<number | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  
  const [newClient, setnewClient] = useState({ email: '', name: '' });
  const [newServer, setnewServer] = useState({ local_server_id: '', forfait: '' });

  const fetchEncrypted = async (url: string, options: any = {}) => {
    const headers = { ...options.headers, 'X-Encrypted': 'true' };
    let body = options.body;
    
    if (body && typeof body === 'string') {
      body = encryptJson(JSON.parse(body));
      headers['Content-Type'] = 'text/plain';
    }
    
    const response = await fetch(url, { ...options, headers, body });
    if (!response.ok) throw new Error("Erreur HTTP " + response.status);
    
    const text = await response.text();
    if (text) {
      try {
        return decryptJson(text);
      } catch (e) {
        return JSON.parse(text); // Fallback pour les erreurs serveur en clair
      }
    }
    return null;
  };

  const fetchData = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const [usersData, serversData, alertesData] = await Promise.all([
        fetchEncrypted(`${API_BASE}users`),
        fetchEncrypted(`${API_BASE}servers`),
        fetchEncrypted(`${API_BASE}alertes`)
      ]);
      setUsers(usersData);
      setServers(serversData);
      setAlertes(alertesData);
    } catch (e) {
      console.error(e);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
    
    // Auto-refresh toutes les 3 secondes (Short Polling)
    const intervalId = setInterval(() => {
      fetchData(true);
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);

  // Compute users list sorted by alert priority
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      const unresolvedA = alertes.filter(al => al.client_id === a.id && !al.is_resolved).length;
      const unresolvedB = alertes.filter(al => al.client_id === b.id && !al.is_resolved).length;
      if (unresolvedA > unresolvedB) return -1;
      if (unresolvedA < unresolvedB) return 1;
      return 0;
    });
  }, [users, alertes]);

  // Set first user as active by default if none selected
  useEffect(() => {
    if (!activeUserId && sortedUsers.length > 0) {
      setActiveUserId(sortedUsers[0].id);
    }
  }, [sortedUsers, activeUserId]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchEncrypted(`${API_BASE}users`, {
      method: 'POST',
      body: JSON.stringify(newClient),
    });
    setnewClient({ email: '', name: '' });
    setShowAddUser(false);
    fetchData();
  };

  const handleCreateServer = async (e: React.FormEvent, clientId: number) => {
    e.preventDefault();
    await fetchEncrypted(`${API_BASE}servers`, {
      method: 'POST',
      body: JSON.stringify({ ...newServer, client_id: clientId, username: 'auto' }),
    });
    setnewServer({ local_server_id: '', forfait: '' });
    fetchData();
  };

  const handleResolveAlert = async (alertId: number) => {
    try {
      await fetchEncrypted(`${API_BASE}api/v1/alertes/${alertId}/resolve`, {
        method: 'PUT',
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const activeUser = users.find(u => u.id === activeUserId);
  const activeUserAlerts = alertes.filter(a => a.client_id === activeUserId).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const activeUserServers = servers.filter(s => s.client_id === activeUserId);

  if (loading) return <div style={{padding: '2rem', color: 'white'}}>Chargement...</div>;

  return (
    <div className="dashboard-layout">
      {/* LEFT SIDEBAR: USERS LIST */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>Patients / Clients</h1>
          <button className="add-user-btn" onClick={() => setShowAddUser(true)}>+</button>
        </div>
        <div className="user-list">
          {sortedUsers.map(u => {
            const userAlerts = alertes.filter(a => a.client_id === u.id);
            const unresolvedCount = userAlerts.filter(a => !a.is_resolved).length;
            return (
              <div 
                key={u.id} 
                className={`user-list-item ${activeUserId === u.id ? 'active' : ''} ${unresolvedCount > 0 ? 'has-alert' : ''}`}
                onClick={() => setActiveUserId(u.id)}
              >
                <div className="user-list-item-info">
                  <h3>{u.name}</h3>
                  <p>{u.email}</p>
                </div>
                {unresolvedCount > 0 && (
                  <span className="alert-badge">🚨 {unresolvedCount}</span>
                )}
              </div>
            )
          })}
        </div>
      </aside>

      {/* MAIN CONTENT: DETAILS & BACKLOG */}
      <main className="main-content">
        {activeUser ? (
          <>
            <header className="main-header">
              <h2>{activeUser.name}</h2>
              <p>ID: {activeUser.id} | Email: {activeUser.email}</p>
            </header>
            
            <div className="content-grid">
              {/* BACKLOG D'ALERTES (HUGE) */}
              <section className="backlog-section">
                <h3 className="section-title">🚨 Backlog d'Alertes ({activeUserAlerts.length})</h3>
                
                {activeUserAlerts.length === 0 ? (
                  <div style={{color: '#64748b', textAlign: 'center', padding: '3rem'}}>
                    Aucune alerte enregistrée pour ce patient. Tout va bien.
                  </div>
                ) : (
                  activeUserAlerts.map(a => {
                    const serv = servers.find(s => s.id === a.local_server_id);
                    const isHaute = a.niveau_urgence.toUpperCase().includes('HAUT');

                    if (a.is_resolved) {
                      return (
                        <div key={a.id} className="huge-alert-card resolved">
                          <div className="huge-alert-main">
                            <h4 className="huge-alert-title" style={{color: '#94a3b8'}}>
                              ✓ {a.etat_de_la_chute.replace(/_/g, ' ')}
                            </h4>
                            <p className="huge-alert-meta" style={{color: '#64748b'}}>
                              Temps au sol : <b>{a.temps_au_sol}</b> | Serveur: {serv ? serv.local_server_id : a.local_server_id}
                            </p>
                            <span className="huge-alert-time">{new Date(a.timestamp).toLocaleString()}</span>
                          </div>
                          <div className="huge-alert-urgency" style={{color: '#64748b', fontSize: '1rem'}}>
                            Traitée
                          </div>
                        </div>
                      )
                    }

                    return (
                      <div key={a.id} className={`huge-alert-card ${isHaute ? 'haute' : ''}`}>
                        <div className="huge-alert-main">
                          <h4 className="huge-alert-title">
                            ⚠️ {a.etat_de_la_chute.replace(/_/g, ' ')}
                          </h4>
                          <p className="huge-alert-meta">
                            Temps au sol : <b>{a.temps_au_sol}</b> | Serveur: {serv ? serv.local_server_id : a.local_server_id}
                          </p>
                          <span className="huge-alert-time">{new Date(a.timestamp).toLocaleString()}</span>
                        </div>
                        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem'}}>
                          <div className="huge-alert-urgency">
                            {a.niveau_urgence}
                          </div>
                          <button className="resolve-btn" onClick={() => handleResolveAlert(a.id)}>
                            Marquer comme traitée ✓
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </section>

              {/* SERVEURS */}
              <section className="servers-section">
                <h3 className="section-title">Serveurs Liés</h3>
                
                {activeUserServers.map(s => (
                  <div key={s.id} className="server-mini-card">
                    <div>
                      <h4>{s.local_server_id}</h4>
                      <div style={{fontSize: '0.8rem', color: '#94a3b8'}}>{s.forfait}</div>
                    </div>
                    <span className={`badge ${s.status}`}>{s.status}</span>
                  </div>
                ))}

                <div style={{marginTop: '2rem'}}>
                  <h4 style={{marginBottom: '1rem'}}>Ajouter un Capteur/Serveur</h4>
                  <form onSubmit={(e) => handleCreateServer(e, activeUser.id)}>
                    <input
                      placeholder="ID Serveur (ex: chambre_1)"
                      value={newServer.local_server_id}
                      onChange={(e) => setnewServer({ ...newServer, local_server_id: e.target.value })}
                      required
                    />
                    <input
                      placeholder="Forfait / Emplacement"
                      value={newServer.forfait}
                      onChange={(e) => setnewServer({ ...newServer, forfait: e.target.value })}
                      required
                    />
                    <button type="submit" className="primary">Ajouter au patient</button>
                  </form>
                </div>
              </section>
            </div>
          </>
        ) : (
          <div style={{padding: '3rem'}}>Sélectionnez un client dans la barre latérale.</div>
        )}
      </main>

      {/* MODAL ADD USER */}
      {showAddUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{marginTop: 0, color: 'white'}}>Nouveau Patient</h2>
            <form onSubmit={handleCreateUser}>
              <input
                placeholder="Nom"
                value={newClient.name}
                onChange={(e) => setnewClient({ ...newClient, name: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={newClient.email}
                onChange={(e) => setnewClient({ ...newClient, email: e.target.value })}
                required
              />
              <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                <button type="button" className="primary" style={{background: '#475569'}} onClick={() => setShowAddUser(false)}>Annuler</button>
                <button type="submit" className="primary">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;