import React, { useState, useEffect } from 'react';
import { User } from './types';

const API_BASE = 'http://127.0.0.1:8000/';

const Dashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ mac_address: '', nb_room: 0, name: '' });
  const [newForm, setNewForm] = useState({ mac_address: '', nb_room: 0, name: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}users`, { mode: 'cors' });
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newForm),
      });
      if (!res.ok) throw new Error('Create failed');
      setNewForm({ mac_address: '', nb_room: 0, name: '' });
      fetchUsers();  // Refresh list
    } catch (err) {
      setError('Create failed');
    }
  };

  const handleUpdate = async (user: User) => {
    try {
      const res = await fetch(`${API_BASE}users/${user.mac_address}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mac_address: user.mac_address, nb_room: user.nb_room, name: user.name }),
      });
      if (!res.ok) throw new Error('Update failed');
      setEditingId(null);
      fetchUsers();
    } catch (err) {
      setError('Update failed');
    }
  };

  const handleDelete = async (id: number) => {
  if (!confirm('Delete this user?')) return;
  
  try {
    const res = await fetch(`${API_BASE}users/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Delete failed');
    fetchUsers();
  } catch (err) {
    setError('Delete failed');
  }
};

  const startEdit = (user: User) => {
    setEditingId(user.id);
    setEditForm(user);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Users Dashboard</h1>

      {/* Create Form */}
      <form onSubmit={handleCreate} style={{ marginBottom: '20px' }}>
        <input
          placeholder="MAC Address"
          value={newForm.mac_address}
          onChange={(e) => setNewForm({ ...newForm, mac_address: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Nb Rooms"
          value={newForm.nb_room}
          onChange={(e) => setNewForm({ ...newForm, nb_room: Number(e.target.value) })}
        />
        <input
          placeholder="Name"
          value={newForm.name}
          onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
        />
        <button type="submit">Add User</button>
      </form>

      {/* Users Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>ID</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>MAC Address</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Nb Rooms</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.id}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {editingId === user.id ? (
                  <input
                    value={editForm.mac_address}
                    onChange={(e) => setEditForm({ ...editForm, mac_address: e.target.value })}
                  />
                ) : (
                  user.mac_address
                )}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {editingId === user.id ? (
                  <input
                    type="number"
                    value={editForm.nb_room}
                    onChange={(e) => setEditForm({ ...editForm, nb_room: Number(e.target.value) })}
                  />
                ) : (
                  user.nb_room
                )}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {editingId === user.id ? (
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                ) : (
                  user.name
                )}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {editingId === user.id ? (
                  <button onClick={() => handleUpdate(editForm as User)}>Save</button>
                ) : (
                  <button onClick={() => startEdit(user)}>Edit</button>
                )}
                <button onClick={() => handleDelete(user.id)} style={{ marginLeft: '5px' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={fetchUsers} style={{ marginTop: '10px' }}>Refresh</button>
    </div>
  );
};

export default Dashboard;