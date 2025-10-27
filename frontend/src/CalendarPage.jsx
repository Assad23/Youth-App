import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';

function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get('http://localhost:4000/events');
        // Map strings to Date objects
        setEvents(res.data.map(e => ({
          ...e,
          start: new Date(e.startDate),
          end: new Date(e.endDate)
        })));
      } catch (err) {
        console.error('Failed to fetch events');
      }
    };
    fetchEvents();
  }, []);

  const eventsOnDate = date => {
    return events.filter(e => date >= e.start && date <= e.end);
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dailyEvents = eventsOnDate(date);
      if (dailyEvents.length > 0) {
        return (
          <div style={{ marginTop: 2, display: 'flex', justifyContent: 'center' }}>
            {/* Dot or line indicator */}
            {dailyEvents.length && <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--link-color)', display: 'inline-block' }}></span>}
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="container">
      <h2>Calendar</h2>
      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        tileContent={tileContent}
        tileClassName={({ date, view }) => {
          if (view === 'month') {
            const dailyEvents = eventsOnDate(date);
            if (dailyEvents.length > 0) {
              return 'event-day';
            }
          }
          return null;
        }}
      />
      <div style={{ marginTop: '1rem' }}>
        <h3>Events on {selectedDate.toDateString()}</h3>
        {eventsOnDate(selectedDate).length === 0 ? (
          <p>No events</p>
        ) : (
          eventsOnDate(selectedDate).map(e => (
            <div key={e.id} className="card">
              <p><strong>{e.title}</strong></p>
              <p>
                {new Date(e.startDate).toLocaleDateString()} - {new Date(e.endDate).toLocaleDateString()}
              </p>
              {e.speaker && <p>Speaker: {e.speaker}</p>}
              {e.type && <p>Type: {e.type}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CalendarPage;
