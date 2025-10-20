import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const Calendar = () => {
  const [date, setDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appointmentsRes, tasksRes] = await Promise.all([
        axios.get('/api/appointments'),
        axios.get('/api/tasks'),
      ]);
      setAppointments(appointmentsRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      toast.error('Failed to fetch calendar data');
    } finally {
      setLoading(false);
    }
  };

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    const dayAppointments = appointments.filter(apt => 
      apt.startTime.startsWith(dateStr)
    );

    const dayTasks = tasks.filter(task => 
      task.dueDate && task.dueDate.startsWith(dateStr)
    );

    return { appointments: dayAppointments, tasks: dayTasks };
  };

  const selectedDateEvents = getEventsForDate(date);

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const events = getEventsForDate(date);
      const hasEvents = events.appointments.length > 0 || events.tasks.length > 0;
      
      if (hasEvents) {
        return (
          <div className="flex gap-1 justify-center mt-1">
            {events.appointments.length > 0 && (
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
            )}
            {events.tasks.length > 0 && (
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            )}
          </div>
        );
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <p className="text-gray-600 mt-1">View all your tasks and appointments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 card p-6">
          <ReactCalendar
            onChange={setDate}
            value={date}
            tileContent={tileContent}
            className="w-full border-none"
          />
        </div>

        {/* Selected Date Events */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {date.toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h2>

          <div className="space-y-4">
            {/* Appointments */}
            {selectedDateEvents.appointments.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Appointments</h3>
                <div className="space-y-2">
                  {selectedDateEvents.appointments.map(apt => (
                    <div key={apt.id} className="p-3 bg-blue-50 rounded-lg">
                      <div className="font-medium text-sm text-gray-900">{apt.title}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {new Date(apt.startTime).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                        {apt.location && ` • ${apt.location}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tasks */}
            {selectedDateEvents.tasks.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Tasks Due</h3>
                <div className="space-y-2">
                  {selectedDateEvents.tasks.map(task => (
                    <div key={task.id} className="p-3 bg-green-50 rounded-lg">
                      <div className="font-medium text-sm text-gray-900">{task.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                        <span className={`badge badge-${task.status}`}>{task.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedDateEvents.appointments.length === 0 && selectedDateEvents.tasks.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">
                No events scheduled for this day
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="card p-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Legend</h3>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Appointments</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Tasks</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
