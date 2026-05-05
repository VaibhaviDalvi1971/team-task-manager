 import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function ProjectDetail() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const [project, setProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [error, setError] = useState('');

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchProject();
    if (user?.role === 'ADMIN') fetchUsers();
  }, []);

  const fetchProject = async () => {
    try {
      const res = await axios.get(`https://team-task-manager-production-d2fd.up.railway.app/api/projects/${id}`, { headers });
      setProject(res.data);
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

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('https://team-task-manager-production-d2fd.up.railway.app/api/tasks',
        {
          title,
          description,
          dueDate: dueDate || null,
          projectId: id,
          assigneeId: assigneeId || null,
        },
        { headers }
      );
      setTitle('');
      setDescription('');
      setDueDate('');
      setAssigneeId('');
      setShowForm(false);
      fetchProject();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await axios.put(`https://team-task-manager-production-d2fd.up.railway.app/api/tasks/${taskId}`,
        { status },
        { headers }
      );
      fetchProject();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await axios.delete(`https://team-task-manager-production-d2fd.up.railway.app/api/tasks/${taskId}`, { headers });
      fetchProject();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;
  if (!project) return <div style={styles.loading}>Project not found!</div>;

  const todoTasks = project.tasks?.filter(t => t.status === 'TODO') || [];
  const inProgressTasks = project.tasks?.filter(t => t.status === 'IN_PROGRESS') || [];
  const doneTasks = project.tasks?.filter(t => t.status === 'DONE') || [];

  return (
    <div style={styles.container}>
      {/* Project Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>{project.name}</h1>
          <p style={styles.desc}>{project.description || 'No description'}</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button onClick={() => setShowForm(!showForm)} style={styles.btnPrimary}>
            {showForm ? 'Cancel' : '+ Add Task'}
          </button>
        )}
      </div>

      {/* Members */}
      <div style={styles.membersBox}>
        <h3 style={styles.membersTitle}>👥 Team Members</h3>
        <div style={styles.membersList}>
          {project.members?.map(m => (
            <span key={m.id} style={styles.memberBadge}>
              {m.user?.name} ({m.user?.role})
            </span>
          ))}
          {project.members?.length === 0 && <span style={styles.empty}>No members yet</span>}
        </div>
      </div>

      {/* Create Task Form */}
      {showForm && (
        <div style={styles.form}>
          <h3 style={styles.formTitle}>Create New Task</h3>
          {error && <div style={styles.error}>{error}</div>}
          <form onSubmit={handleCreateTask}>
            <div style={styles.field}>
              <label style={styles.label}>Task Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={styles.input}
                placeholder="Enter task title"
                required
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{...styles.input, height: '70px'}}
                placeholder="Enter description"
              />
            </div>
            <div style={styles.formRow}>
              <div style={{...styles.field, flex: 1}}>
                <label style={styles.label}>Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  style={styles.input}
                />
              </div>
              <div style={{...styles.field, flex: 1}}>
                <label style={styles.label}>Assign To</label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  style={styles.input}
                >
                  <option value="">Unassigned</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" style={styles.btnPrimary}>Create Task</button>
          </form>
        </div>
      )}

      {/* Task Board */}
      <div style={styles.board}>
        {/* TODO Column */}
        <div style={styles.column}>
          <h3 style={{...styles.columnTitle, color: '#2b6cb0'}}>📋 To Do ({todoTasks.length})</h3>
          {todoTasks.map(task => (
            <TaskCard key={task.id} task={task} user={user} onStatusChange={handleStatusChange} onDelete={handleDeleteTask} />
          ))}
        </div>

        {/* IN PROGRESS Column */}
        <div style={styles.column}>
          <h3 style={{...styles.columnTitle, color: '#6b46c1'}}>⚡ In Progress ({inProgressTasks.length})</h3>
          {inProgressTasks.map(task => (
            <TaskCard key={task.id} task={task} user={user} onStatusChange={handleStatusChange} onDelete={handleDeleteTask} />
          ))}
        </div>

        {/* DONE Column */}
        <div style={styles.column}>
          <h3 style={{...styles.columnTitle, color: '#276749'}}>✅ Done ({doneTasks.length})</h3>
          {doneTasks.map(task => (
            <TaskCard key={task.id} task={task} user={user} onStatusChange={handleStatusChange} onDelete={handleDeleteTask} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task, user, onStatusChange, onDelete }) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';
  return (
    <div style={{...styles.taskCard, border: isOverdue ? '1px solid #fc8181' : '1px solid #e2e8f0'}}>
      <h4 style={styles.taskTitle}>{task.title}</h4>
      {task.description && <p style={styles.taskDesc}>{task.description}</p>}
      {task.assignee && <p style={styles.taskMeta}>👤 {task.assignee.name}</p>}
      {task.dueDate && (
        <p style={{...styles.taskMeta, color: isOverdue ? '#c53030' : '#718096'}}>
          📅 {new Date(task.dueDate).toLocaleDateString()} {isOverdue && '⚠️ Overdue'}
        </p>
      )}
      <select
        value={task.status}
        onChange={(e) => onStatusChange(task.id, e.target.value)}
        style={styles.select}
      >
        <option value="TODO">To Do</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="DONE">Done</option>
      </select>
      {user?.role === 'ADMIN' && (
        <button onClick={() => onDelete(task.id)} style={styles.deleteBtn}>🗑️</button>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '24px', maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
  title: { fontSize: '28px', color: '#1a1a2e', margin: '0 0 4px' },
  desc: { color: '#718096', margin: 0 },
  loading: { textAlign: 'center', padding: '40px', fontSize: '18px' },
  membersBox: { backgroundColor: 'white', padding: '16px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '20px' },
  membersTitle: { margin: '0 0 12px', color: '#1a1a2e', fontSize: '16px' },
  membersList: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  memberBadge: { backgroundColor: '#ebf8ff', color: '#2b6cb0', padding: '4px 12px', borderRadius: '20px', fontSize: '13px' },
  form: { backgroundColor: 'white', padding: '24px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '24px' },
  formTitle: { margin: '0 0 16px', color: '#1a1a2e' },
  formRow: { display: 'flex', gap: '16px' },
  error: { backgroundColor: '#fed7d7', color: '#c53030', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' },
  field: { marginBottom: '16px' },
  label: { display: 'block', marginBottom: '6px', color: '#4a5568', fontSize: '14px', fontWeight: '600' },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' },
  board: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
  column: { backgroundColor: '#f7fafc', padding: '16px', borderRadius: '10px', minHeight: '300px' },
  columnTitle: { margin: '0 0 16px', fontSize: '16px' },
  taskCard: { backgroundColor: 'white', padding: '14px', borderRadius: '8px', marginBottom: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  taskTitle: { margin: '0 0 6px', color: '#1a1a2e', fontSize: '14px', fontWeight: '600' },
  taskDesc: { margin: '0 0 6px', color: '#718096', fontSize: '13px' },
  taskMeta: { margin: '0 0 6px', color: '#718096', fontSize: '12px' },
  select: { width: '100%', padding: '6px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', marginTop: '8px', cursor: 'pointer' },
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', float: 'right', fontSize: '14px', marginTop: '4px' },
  btnPrimary: { backgroundColor: '#1a1a2e', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  empty: { color: '#718096', fontSize: '13px' },
};

export default ProjectDetail;
