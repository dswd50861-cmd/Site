import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { XMarkIcon } from '@heroicons/react/24/outline';

const ProjectModal = ({ project, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
    startDate: '',
    endDate: '',
    budget: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'active',
        startDate: project.startDate ? project.startDate.split('T')[0] : '',
        endDate: project.endDate ? project.endDate.split('T')[0] : '',
        budget: project.budget || '',
      });
    }
  }, [project]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (project) {
        await axios.put(`/api/projects/${project.id}`, formData);
        toast.success('Project updated successfully');
      } else {
        await axios.post('/api/projects', formData);
        toast.success('Project created successfully');
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
          <h2 className="text-xl font-semibold">{project ? 'Edit Project' : 'New Project'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Project Name *</label>
            <input
              type="text"
              name="name"
              required
              className="input"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              name="description"
              rows="4"
              className="input"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="label">Status</label>
            <select name="status" className="input" value={formData.status} onChange={handleChange}>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date</label>
              <input
                type="date"
                name="startDate"
                className="input"
                value={formData.startDate}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="label">End Date</label>
              <input
                type="date"
                name="endDate"
                className="input"
                value={formData.endDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="label">Budget ($)</label>
            <input
              type="number"
              step="0.01"
              name="budget"
              className="input"
              value={formData.budget}
              onChange={handleChange}
            />
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

export default ProjectModal;
