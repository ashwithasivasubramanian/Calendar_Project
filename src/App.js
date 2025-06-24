// App.jsx
import React, { useEffect, useState } from 'react';
import Calendar from './components/Calendar';
import AddEventForm from './components/AddEventForm';

function App() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch('/events.json')
      .then(res => res.json())
      .then(staticEvents => {
        const localEvents = JSON.parse(localStorage.getItem('customEvents')) || [];
        // Mark static events to avoid saving them to localStorage later
        const markedStaticEvents = staticEvents.map(e => ({ ...e, fromStatic: true }));
        setEvents([...markedStaticEvents, ...localEvents]);
      });
  }, []);

  const handleAddEvent = newEvent => {
    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);
    const customEvents = updatedEvents.filter(e => !e.fromStatic);
    localStorage.setItem('customEvents', JSON.stringify(customEvents));
  };

  return (
    <div>
      <h1 className="calendar-title"><center>🗓️ My Calendar</center></h1>
      <AddEventForm onAddEvent={handleAddEvent} />
      <Calendar events={events} />
    </div>
  );
}

export default App;
