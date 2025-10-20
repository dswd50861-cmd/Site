import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import AppointmentModal from '../components/AppointmentModal';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('/api/appointments');
      setAppointments(response.data);
    } catch (error) {
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;

    try {
      await axios.delete(`/api/appointments/${id}`);
      toast.success('Appointment deleted successfully');
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to delete appointment');
    }
  };

  const handleEdit = (appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedAppointment(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
    fetchAppointments();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const upcomingAppointments = appointments.filter(
    (apt) => new Date(apt.startTime) >= new Date()
  );
  const pastAppointments = appointments.filter(
    (apt) => new Date(apt.startTime) < new Date()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-1">Schedule and manage meetings</p>
        </div>
        <button onClick={handleCreate} className="btn btn-primary flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          New Appointment
        </button>
      </div>

      {/* Upcoming Appointments */}
      <div className="card">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {upcomingAppointments.length === 0 ? (
            <p className="px-6 py-8 text-center text-gray-500">No upcoming appointments</p>
          ) : (
            upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-900">{appointment.title}</h3>
                    {appointment.description && (
                      <p className="text-sm text-gray-600 mt-1">{appointment.description}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                      <span>
                        📅 {new Date(appointment.startTime).toLocaleDateString()} at{' '}
                        {new Date(appointment.startTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {appointment.location && <span>📍 {appointment.location}</span>}
                      {appointment.customerName && <span>👤 {appointment.customerName}</span>}
                    </div>
                    {appointment.attendees && appointment.attendees.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {appointment.attendees.map((attendee) => (
                          <span
                            key={attendee.userId}
                            className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800"
                          >
                            {attendee.firstName} {attendee.lastName}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(appointment)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(appointment.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <div className="card">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Past Appointments</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {pastAppointments.map((appointment) => (
              <div key={appointment.id} className="px-6 py-4 hover:bg-gray-50 opacity-75">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-900">{appointment.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                      <span>
                        📅 {new Date(appointment.startTime).toLocaleDateString()} at{' '}
                        {new Date(appointment.startTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {appointment.customerName && <span>👤 {appointment.customerName}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isModalOpen && (
        <AppointmentModal
          appointment={selectedAppointment}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default Appointments;
