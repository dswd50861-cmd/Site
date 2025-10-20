import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { XMarkIcon } from '@heroicons/react/24/outline';

const InvoiceModal = ({ invoice, onClose }) => {
  const [formData, setFormData] = useState({
    customerId: '',
    projectId: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    amount: '',
    tax: '0',
    notes: '',
  });
  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
    if (invoice) {
      setFormData({
        customerId: invoice.customerId || '',
        projectId: invoice.projectId || '',
        issueDate: invoice.issueDate ? invoice.issueDate.split('T')[0] : '',
        dueDate: invoice.dueDate ? invoice.dueDate.split('T')[0] : '',
        amount: invoice.amount || '',
        tax: invoice.tax || '0',
        notes: invoice.notes || '',
      });
    }
  }, [invoice]);

  const fetchData = async () => {
    try {
      const [customersRes, projectsRes] = await Promise.all([
        axios.get('/api/customers'),
        axios.get('/api/projects'),
      ]);
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
      if (invoice) {
        await axios.put(`/api/invoices/${invoice.id}`, formData);
        toast.success('Invoice updated successfully');
      } else {
        await axios.post('/api/invoices', formData);
        toast.success('Invoice created successfully');
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

  const totalAmount = (parseFloat(formData.amount) || 0) + (parseFloat(formData.tax) || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">{invoice ? 'Edit Invoice' : 'New Invoice'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Customer *</label>
            <select
              name="customerId"
              required
              className="input"
              value={formData.customerId}
              onChange={handleChange}
            >
              <option value="">Select customer</option>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Issue Date *</label>
              <input
                type="date"
                name="issueDate"
                required
                className="input"
                value={formData.issueDate}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="label">Due Date *</label>
              <input
                type="date"
                name="dueDate"
                required
                className="input"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Amount *</label>
              <input
                type="number"
                step="0.01"
                name="amount"
                required
                className="input"
                value={formData.amount}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="label">Tax</label>
              <input
                type="number"
                step="0.01"
                name="tax"
                className="input"
                value={formData.tax}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Amount:</span>
              <span className="text-2xl font-bold text-primary-600">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea
              name="notes"
              rows="3"
              className="input"
              value={formData.notes}
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

export default InvoiceModal;
