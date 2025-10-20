import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { XMarkIcon } from '@heroicons/react/24/outline';

const TaskModal = ({ task, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    dueDate: '',
    assignedTo: '',
    projectId: '',
    customerId: '',
  });
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'pending',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        assignedTo: task.assignedTo || '',
        projectId: task.projectId || '',
        customerId: task.customerId || '',
      });
    }
  }, [task]);

  const fetchData = async () => {
    try {
      const [usersRes, projectsRes, customersRes] = await Promise.all([
        axios.get('/api/users'),
        axios.get('/api/projects'),
        axios.get('/api/customers'),
      ]);
      setUsers(usersRes.data);
      setProjects(projectsRes.data);
      setCustomers(customersRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (task) {
        await axios.put(`/api/tasks/${task.id}`, formData);
        toast.success('Task updated successfully');
      } else {
        await axios.post('/api/tasks', formData);
        toast.success('Task created successfully');
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">{task ? 'Edit Task' : 'New Task'}</h2>
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
              <label className="label">Status</label>
              <select name="status" className="input" value={formData.status} onChange={handleChange}>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="label">Priority</label>
              <select name="priority" className="input" value={formData.priority} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Due Date</label>
            <input
              type="date"
              name="dueDate"
              className="input"
              value={formData.dueDate}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="label">Assign To</label>
            <select name="assignedTo" className="input" value={formData.assignedTo} onChange={handleChange}>
              <option value="">Unassigned</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullName} ({user.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Project</label>
            <select name="projectId" className="input" value={formData.projectId} onChange={handleChange}>
              <option value="">None</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Customer</label>
            <select name="customerId" className="input" value={formData.customerId} onChange={handleChange}>
              <option value="">None</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.contactName} {customer.companyName && `(${customer.companyName})`}
                </option>
              ))}
            </select>
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

export default TaskModal;
