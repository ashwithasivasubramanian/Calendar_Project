// File: src/components/Calendar.jsx
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import "./Calendar.css";

const Calendar = ({ userEvents = [] }) => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [events, setEvents] = useState([]);
  const [manualKeys, setManualKeys] = useState(new Set());

  useEffect(() => {
    fetch("/events.json")
      .then((res) => res.json())
      .then((data) => {
        const savedEvents = JSON.parse(localStorage.getItem("customEvents")) || [];

        // Assign manual flag only to savedEvents and userEvents
        const manualSet = new Set();
        const manualEvents = [...savedEvents, ...userEvents].map((e) => {
          const key = `${e.title}-${e.date}-${e.time ?? ''}`.trim();
          manualSet.add(key);
          return { ...e, _manual: true };
        });

        const all = [...data, ...manualEvents];
        const uniqueMap = new Map();
        all.forEach((e) => {
          const key = `${e.title}-${e.date}-${e.time ?? ''}`.trim();
          if (!uniqueMap.has(key)) {
            uniqueMap.set(key, e);
          }
        });

        setManualKeys(manualSet);
        setEvents(Array.from(uniqueMap.values()));
      });
  }, [userEvents]);

  const startOfMonth = currentDate.startOf("month");
  const startDay = startOfMonth.day();
  const daysInMonth = currentDate.daysInMonth();
  const today = dayjs().format("YYYY-MM-DD");

  const prevMonth = () => setCurrentDate(currentDate.subtract(1, "month"));
  const nextMonth = () => setCurrentDate(currentDate.add(1, "month"));

  const getEventsForDate = (date) => {
    return events.filter((event) => dayjs(event.date).isSame(date, "day"));
  };

  const hasEvents = (date) => {
    return events.some((event) => dayjs(event.date).isSame(date, "day"));
  };

  const handleDeleteEvent = (title, date, time) => {
    const key = `${title}-${date}-${time || ''}`;
    if (!manualKeys.has(key)) return; // Prevent deleting static events

    const updatedEvents = events.filter(
      (e) => !(e.title === title && e.date === date && e.time === time)
    );
    setEvents(updatedEvents);

    const stored = JSON.parse(localStorage.getItem("customEvents")) || [];
    const updatedStored = stored.filter(
      (e) => !(e.title === title && e.date === date && e.time === time)
    );
    localStorage.setItem("customEvents", JSON.stringify(updatedStored));
  };

  const handleEditEvent = (oldEvent, newEvent) => {
    const key = `${oldEvent.title}-${oldEvent.date}-${oldEvent.time || ''}`;
    const isStatic = !(manualKeys.has(key) || oldEvent._manual);
    if (isStatic) return; // Prevent editing static events

    const updatedEvents = events.map((e) => {
      if (e.title === oldEvent.title && e.date === oldEvent.date && e.time === oldEvent.time) {
        return newEvent;
      }
      return e;
    });
    setEvents(updatedEvents);

    const stored = JSON.parse(localStorage.getItem("customEvents")) || [];
    const updatedStored = stored.map((e) => {
      if (e.title === oldEvent.title && e.date === oldEvent.date && e.time === oldEvent.time) {
        return newEvent;
      }
      return e;
    });
    localStorage.setItem("customEvents", JSON.stringify(updatedStored));
  };

  const generateCalendar = () => {
    const calendar = [];

    for (let i = 0; i < startDay; i++) {
      calendar.push(<div key={`empty-${i}`} className="day empty"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = currentDate.date(d);
      const isToday = date.format("YYYY-MM-DD") === today;
      const dayEvents = getEventsForDate(date);
      const highlightEventDay = hasEvents(date);

      calendar.push(
        <div
          key={d}
          className={`day ${isToday ? "today" : ""} ${highlightEventDay ? "has-event" : ""}`}
        >
          <div className="date">{d}</div>
          {dayEvents.map((e, idx) => {
            const isManual = e._manual;
            return (
              <div
                key={idx}
                className={`event event-${idx % 3}`}
                data-title={e.title}
                data-time={`${e.time} • ${e.duration}`}
              >
                <strong>{e.title}</strong>
                <small>{e.time}</small>
                {isManual && (
                  <>
                    <button
                      onClick={() => handleDeleteEvent(e.title, e.date, e.time)}
                      className="delete-btn"
                      style={{ fontSize: "18px", marginLeft: "8px", cursor: "pointer" }}
                      title="Delete Event"
                    >
                      ❌
                    </button>
                    <button
                      onClick={() => {
                        const newTitle = prompt("Edit title", e.title);
                        const newTime = prompt("Edit time", e.time);
                        const newDuration = prompt("Edit duration", e.duration);
                        if (newTitle && newTime && newDuration) {
                          handleEditEvent(e, { ...e, title: newTitle, time: newTime, duration: newDuration });
                        }
                      }}
                      className="edit-btn"
                      style={{ fontSize: "18px", marginLeft: "8px", cursor: "pointer" }}
                      title="Edit Event"
                    >
                      ✏️
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    return calendar;
  };

  return (
    <div className="calendar-page" style={{ backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
      <div className="calendar-container">
        <div className="calendar-header">
          <button onClick={prevMonth}>‹</button>
          <h2>{currentDate.format("MMMM YYYY")}</h2>
          <button onClick={nextMonth}>›</button>
        </div>

        <div className="calendar-grid">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div className="day-name" key={day}>
              {day}
            </div>
          ))}
          {generateCalendar()}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
