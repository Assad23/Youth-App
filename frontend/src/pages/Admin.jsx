import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Admin() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [eventForm, setEventForm] = useState({ title: '', startDate: '', endDate: '', speaker: '', type: '' });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const fetchPendingUsers = async () => {
    try {
      const res = await axios.get('http://localhost:4000/users/pending');
      setPendingUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch pending users');
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const approveUser = async id => {
    try {
      await axios.post('http://localhost:4000/approve-user', { userId: id });
      setPendingUsers(pendingUsers.filter(u => u.id !== id));
    } catch (err) {
      console.error('Failed to approve user');
    }
  };

  const handleEventSubmit = async e => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      await axios.post('http://localhost:4000/events', {
        title: eventForm.title,
        startDate: eventForm.startDate,
        endDate: eventForm.endDate,
        speaker: eventForm.speaker,
        type: eventForm.type
      });
      setMessage('Event created');
      setEventForm({ title: '', startDate: '', endDate: '', speaker: '', type: '' });
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Failed to create event');
    }
  };

  return (
    <div className="container">
      <h2>Admin Panel</h2>
      <div className="card">
        <h3>Pending Users</h3>
        {pendingUsers.length === 0 ? (
          <p>No pending users</p>
        ) : (
          pendingUsers.map(u => (
            <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span>{u.username}</span>
              <button onClick={() => approveUser(u.id)}>Approve</button>
            </div>
          ))
        )}
      </div>
      <div className="card">
        <h3>Create Event</h3>
        <form onSubmit={handleEventSubmit}>
          <input
            type="text"
            placeholder="Title"
            value={eventForm.title}
            onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
          />
          <input
            type="date"
            placeholder="Start Date"
            value={eventForm.startDate}
            onChange={e => setEventForm({ ...eventForm, startDate: e.target.value })}
          />
          <input
            type="date"
            placeholder="End Date"
            value={eventForm.endDate}
            onChange={e => setEventForm({ ...eventForm, endDate: e.target.value })}
          />
          <input
            type="text"
            placeholder="Speaker (optional)"
            value={eventForm.speaker}
            onChange={e => setEventForm({ ...eventForm, speaker: e.target.value })}
          />
          <input
            type="text"
            placeholder="Type (optional)"
            value={eventForm.type}
            onChange={e => setEventForm({ ...eventForm, type: e.target.value })}
          />
          <button type="submit">Create Event</button>
        </form>
        {message && <p>{message}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </div>
  );
}

export default Admin;
