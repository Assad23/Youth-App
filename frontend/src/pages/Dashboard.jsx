import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVerse = async () => {
      try {
        const res = await axios.get('http://localhost:4000/verse');
        setVerse(res.data.verse);
      } catch (err) {
        setError('Failed to load verse');
      } finally {
        setLoading(false);
      }
    };
    fetchVerse();
  }, []);

  return (
    <div className="container">
      <h2>Home</h2>
      {loading && <p>Loading verse...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {verse && (
        <div className="card verse-card" style={{ animation: 'fadeIn 1s' }}>
          <p>
            <strong>Verse of the day (NKJV):</strong>
          </p>
          <p dangerouslySetInnerHTML={{ __html: verse.text }}></p>
          <p>
            {verse.book} {verse.chapter}:{verse.verse}
          </p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
