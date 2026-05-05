import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { token, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [tasksRes, overdueRes] = await Promise.all([
        axios.get('https://team-task-manager-production-d2fd.up.railway.app/api/tasks', { headers }),
        axios.get('https://team-task-manager-production-d2fd.up.railway.app/api/tasks/overdue', { headers }),
      ]);
      setTasks(tasksRes.data);
      setOverdueTasks(overdueRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const todoTasks = tasks.filter(t => t.status === 'TODO');
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS');
  const doneTasks = tasks.filter(t => t.status === 'DONE');

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Welcome, {user?.name}! 👋</h1>
      <p style={styles.subtitle}>Here's your task overview</p>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={{...styles.statCard, borderTop: '4px solid #4299e1'}}>
          <h3 style={styles.statNumber}>{tasks.length}</h3>
          <p style={styles.statLabel}>Total Tasks</p>
        </div>
        <div style={{...styles.statCard, borderTop: '4px solid #ed8936'}}>
          <h3 style={styles.statNumber}>{todoTasks.length}</h3>
          <p style={styles.statLabel}>To Do</p>
        </div>
        <div style={{...styles.statCard, borderTop: '4px solid #9f7aea'}}>
          <h3 style={styles.statNumber}>{inProgressTasks.length}</h3>
          <p style={styles.statLabel}>In Progress</p>
        </div>
        <div style={{...styles.statCard, borderTop: '4px solid #48bb78'}}>
          <h3 style={styles.statNumber}>{doneTasks.length}</h3>
          <p style={styles.statLabel}>Done</p>
        </div>
        <div style={{...styles.statCard, borderTop: '4px solid #fc8181'}}>
          <h3 style={styles.statNumber}>{overdueTasks.length}</h3>
          <p style={styles.statLabel}>Overdue</p>
        </div>
      </div>

      {/* Overdue Tasks */}
      {overdueTasks.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>⚠️ Overdue Tasks</h2>
          <div style={styles.taskList}>
            {overdueTasks.map(task => (
              <div key={task.id} style={styles.overdueCard}>
                <h4 style={styles.taskTitle}>{task.title}</h4>
                <p style={styles.taskMeta}>Project: {task.project?.name}</p>
                <p style={styles.taskMeta}>Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                <span style={styles.badgeRed}>{task.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Tasks */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>📋 My Tasks</h2>
        {tasks.length === 0 ? (
          <p style={styles.empty}>No tasks assigned yet!</p>
        ) : (
          <div style={styles.taskList}>
            {tasks.map(task => (
              <div key={task.id} style={styles.taskCard}>
                <h4 style={styles.taskTitle}>{task.title}</h4>
                <p style={styles.taskMeta}>Project: {task.project?.name}</p>
                {task.dueDate && (
                  <p style={styles.taskMeta}>Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                )}
                <span style={
                  task.status === 'DONE' ? styles.badgeGreen :
                  task.status === 'IN_PROGRESS' ? styles.badgePurple :
                  styles.badgeBlue
                }>{task.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '24px', maxWidth: '1200px', margin: '0 auto' },
  title: { fontSize: '28px', color: '#1a1a2e', margin: '0 0 8px' },
  subtitle: { color: '#718096', marginBottom: '24px' },
  loading: { textAlign: 'center', padding: '40px', fontSize: '18px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '32px' },
  statCard: { backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center' },
  statNumber: { fontSize: '32px', margin: '0 0 4px', color: '#1a1a2e' },
  statLabel: { color: '#718096', margin: 0, fontSize: '14px' },
  section: { marginBottom: '32px' },
  sectionTitle: { fontSize: '20px', color: '#1a1a2e', marginBottom: '16px' },
  taskList: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' },
  taskCard: { backgroundColor: 'white', padding: '16px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  overdueCard: { backgroundColor: '#fff5f5', padding: '16px', borderRadius: '10px', border: '1px solid #fed7d7' },
  taskTitle: { margin: '0 0 8px', color: '#1a1a2e', fontSize: '15px' },
  taskMeta: { margin: '0 0 4px', color: '#718096', fontSize: '13px' },
  empty: { color: '#718096', fontStyle: 'italic' },
  badgeBlue: { backgroundColor: '#ebf8ff', color: '#2b6cb0', padding: '3px 10px', borderRadius: '20px', fontSize: '12px' },
  badgePurple: { backgroundColor: '#faf5ff', color: '#6b46c1', padding: '3px 10px', borderRadius: '20px', fontSize: '12px' },
  badgeGreen: { backgroundColor: '#f0fff4', color: '#276749', padding: '3px 10px', borderRadius: '20px', fontSize: '12px' },
  badgeRed: { backgroundColor: '#fff5f5', color: '#c53030', padding: '3px 10px', borderRadius: '20px', fontSize: '12px' },
};

export default Dashboard;
