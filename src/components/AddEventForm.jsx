// src/components/AddEventForm.jsx
import React, { useState } from 'react';

const AddEventForm = ({ onAddEvent }) => {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    duration: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title && formData.date) {
      onAddEvent(formData);
      setFormData({ title: '', date: '', time: '', duration: '' });
    } else {
      alert('Please fill in at least title and date');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-event-form">
      <input
        name="title"
        type="text"
        placeholder="Event Title"
        value={formData.title}
        onChange={handleChange}
        required
      />
      <input
        name="date"
        type="date"
        value={formData.date}
        onChange={handleChange}
        required
      />
      <input
        name="time"
        type="time"
        value={formData.time}
        onChange={handleChange}
      />
      <input
        name="duration"
        type="text"
        placeholder="Duration (e.g. 1h, 30m)"
        value={formData.duration}
        onChange={handleChange}
      />
      <button type="submit">Add Event</button>
    </form>
  );
};

export default AddEventForm;
