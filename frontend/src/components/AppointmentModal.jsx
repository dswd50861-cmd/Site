import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { XMarkIcon } from '@heroicons/react/24/outline';

const AppointmentModal = ({ appointment, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    location: '',
    customerId: '',
    projectId: '',
    attendeeIds: [],
  });
  const [users, setUsers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
    if (appointment) {
      setFormData({
        title: appointment.title || '',
        description: appointment.description || '',
        startTime: appointment.startTime ? appointment.startTime.slice(0, 16) : '',
        endTime: appointment.endTime ? appointment.endTime.slice(0, 16) : '',
        location: appointment.location || '',
        customerId: appointment.customerId || '',
        projectId: appointment.projectId || '',
        attendeeIds: appointment.attendees ? appointment.attendees.map(a => a.userId) : [],
      });
    }
  }, [appointment]);

  const fetchData = async () => {
    try {
      const [usersRes, customersRes, projectsRes] = await Promise.all([
        axios.get('/api/users'),
        axios.get('/api/customers'),
        axios.get('/api/projects'),
      ]);
      setUsers(usersRes.data);
      setCustomers(customersRes.data);
      setProjects(projectsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (appointment) {
        await axios.put(`/api/appointments/${appointment.id}`, formData);
        toast.success('Appointment updated successfully');
      } else {
        await axios.post('/api/appointments', formData);
        toast.success('Appointment created successfully');
      }
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAttendeeToggle = (userId) => {
    setFormData({
      ...formData,
      attendeeIds: formData.attendeeIds.includes(userId)
        ? formData.attendeeIds.filter(id => id !== userId)
        : [...formData.attendeeIds, userId]
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {appointment ? 'Edit Appointment' : 'New Appointment'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Title *</label>
            <input
              type="text"
              name="title"
              required
              className="input"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              name="description"
              rows="3"
              className="input"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Time *</label>
              <input
                type="datetime-local"
                name="startTime"
                required
                className="input"
                value={formData.startTime}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="label">End Time *</label>
              <input
                type="datetime-local"
                name="endTime"
                required
                className="input"
                value={formData.endTime}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="label">Location</label>
            <input
              type="text"
              name="location"
              className="input"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="label">Customer</label>
            <select
              name="customerId"
              className="input"
              value={formData.customerId}
              onChange={handleChange}
            >
              <option value="">None</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.contactName} {customer.companyName && `(${customer.companyName})`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Project</label>
            <select
              name="projectId"
              className="input"
              value={formData.projectId}
              onChange={handleChange}
            >
              <option value="">None</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Attendees</label>
            <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-1">
              {users.map((user) => (
                <label key={user.id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.attendeeIds.includes(user.id)}
                    onChange={() => handleAttendeeToggle(user.id)}
                    className="mr-2"
                  />
                  <span className="text-sm">
                    {user.fullName} <span className="text-gray-500">({user.role})</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentModal;
