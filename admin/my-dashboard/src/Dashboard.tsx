import React, { useState, useEffect } from 'react';
import { User } from './types';
import { Local_servers } from './types';

const API_BASE = 'http://127.0.0.1:8000/';

const Dashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newForm, setNewForm] = useState({ email: '', name: '' });
  const [servers, setServers] = useState<Local_servers[]>([]);
  const [openUserId, setOpenUserId] = useState<number | null>(null);
  
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}users`);
      if (!res.ok) throw new Error();
      setUsers(await res.json());
    } catch {
      setError('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newForm),
      });
      if (!res.ok) throw new Error();
      setNewForm({ email: '', name: '' });
      fetchUsers();
    } catch {
      setError('Create failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this user?')) return;

    try {
      const res = await fetch(`${API_BASE}users/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error();
      fetchUsers();
    } catch {
      setError('Delete failed');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      const [usersRes, serversRes] = await Promise.all([
        fetch(`${API_BASE}users`),
        fetch(`${API_BASE}servers`)
      ]);

      if (!usersRes.ok || !serversRes.ok) throw new Error();

      setUsers(await usersRes.json());
      setServers(await serversRes.json());

    } catch {
      setError('Error loading data');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const getUserServers = (userId: number) => {
    return servers.filter(s => s.client_id === userId);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;



  return (
    <div style={{ padding: '20px' }}>
      <h1>Users Dashboard</h1>

      {/* Create */}
      <form onSubmit={handleCreate} style={{ marginBottom: '20px' }}>
        <input
          placeholder="Email"
          value={newForm.email}
          onChange={(e) => setNewForm({ ...newForm, email: e.target.value })}
          required
        />
        <input
          placeholder="Name"
          value={newForm.name}
          onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
          required
        />
        <button type="submit">Add</button>
      </form>

      {/* Table */}
      <table style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Name</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const userServers = getUserServers(u.id);

            return (
              <React.Fragment key={u.id}>
                <tr>
                  <td>{u.id}</td>
                  <td>{u.email}</td>
                  <td>{u.name}</td>
                  <td>
                    <button onClick={() => setOpenUserId(openUserId === u.id ? null : u.id)}>
                      {openUserId === u.id ? "Hide" : "Show"} servers ({userServers.length})
                    </button>
                  </td>
                </tr>

                {openUserId === u.id && (
                  <tr>
                    <td colSpan={4}>
                      {userServers.length === 0 ? (
                        <div>No servers</div>
                      ) : (
                        <ul>
                          {userServers.map(s => (
                            <li key={s.id}>
                              <b>{s.local_server_id}</b> — {s.forfait} — {s.status}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;