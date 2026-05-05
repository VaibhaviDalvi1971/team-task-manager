 
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function Projects() {
  const { token, user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [memberIds, setMemberIds] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchProjects();
    if (user?.role === 'ADMIN') fetchUsers();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get('https://team-task-manager-production-d2fd.up.railway.app/api/projects', { headers });
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('https://team-task-manager-production-d2fd.up.railway.app/api/users', { headers });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('https://team-task-manager-production-d2fd.up.railway.app/api/projects',
        { name, description, memberIds: memberIds.map(Number) },
        { headers }
      );
      setName('');
      setDescription('');
      setMemberIds([]);
      setShowForm(false);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await axios.delete(`https://team-task-manager-production-d2fd.up.railway.app/api/projects/${id}`, { headers });
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Projects 📁</h1>
        {user?.role === 'ADMIN' && (
          <button onClick={() => setShowForm(!showForm)} style={styles.btnPrimary}>
            {showForm ? 'Cancel' : '+ New Project'}
          </button>
        )}
      </div>

      {/* Create Form */}
      {showForm && (
        <div style={styles.form}>
          <h3 style={styles.formTitle}>Create New Project</h3>
          {error && <div style={styles.error}>{error}</div>}
          <form onSubmit={handleCreate}>
            <div style={styles.field}>
              <label style={styles.label}>Project Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
                placeholder="Enter project name"
                required
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{...styles.input, height: '80px'}}
                placeholder="Enter description"
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Add Members</label>
              <select
                multiple
                value={memberIds}
                onChange={(e) => setMemberIds(Array.from(e.target.selectedOptions, o => o.value))}
                style={{...styles.input, height: '100px'}}
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
              <small style={styles.hint}>Hold Ctrl to select multiple</small>
            </div>
            <button type="submit" style={styles.btnPrimary}>Create Project</button>
          </form>
        </div>
      )}

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <p style={styles.empty}>No projects yet!</p>
      ) : (
        <div style={styles.grid}>
          {projects.map(project => (
            <div key={project.id} style={styles.card}>
              <h3 style={styles.cardTitle}>{project.name}</h3>
              <p style={styles.cardDesc}>{project.description || 'No description'}</p>
              <div style={styles.cardMeta}>
                <span>👥 {project.members?.length || 0} members</span>
                <span>📋 {project.tasks?.length || 0} tasks</span>
              </div>
              <div style={styles.cardActions}>
                <button
                  onClick={() => navigate(`/projects/${project.id}`)}
                  style={styles.btnSecondary}
                >
                  View
                </button>
                {user?.role === 'ADMIN' && (
                  <button
                    onClick={() => handleDelete(project.id)}
                    style={styles.btnDanger}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '24px', maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontSize: '28px', color: '#1a1a2e', margin: 0 },
  loading: { textAlign: 'center', padding: '40px', fontSize: '18px' },
  form: { backgroundColor: 'white', padding: '24px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '24px' },
  formTitle: { margin: '0 0 16px', color: '#1a1a2e' },
  error: { backgroundColor: '#fed7d7', color: '#c53030', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' },
  field: { marginBottom: '16px' },
  label: { display: 'block', marginBottom: '6px', color: '#4a5568', fontSize: '14px', fontWeight: '600' },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' },
  hint: { color: '#718096', fontSize: '12px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' },
  card: { backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  cardTitle: { margin: '0 0 8px', color: '#1a1a2e', fontSize: '18px' },
  cardDesc: { color: '#718096', fontSize: '14px', marginBottom: '12px' },
  cardMeta: { display: 'flex', gap: '16px', color: '#4a5568', fontSize: '13px', marginBottom: '16px' },
  cardActions: { display: 'flex', gap: '8px' },
  btnPrimary: { backgroundColor: '#1a1a2e', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  btnSecondary: { backgroundColor: '#ebf8ff', color: '#2b6cb0', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  btnDanger: { backgroundColor: '#fff5f5', color: '#c53030', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  empty: { color: '#718096', fontStyle: 'italic', textAlign: 'center', padding: '40px' },
};

export default Projects;
