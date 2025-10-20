import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { XMarkIcon } from '@heroicons/react/24/outline';

const CustomerModal = ({ customer, onClose }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      setFormData({
        companyName: customer.companyName || '',
        contactName: customer.contactName || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        zipCode: customer.zipCode || '',
        country: customer.country || 'USA',
        notes: customer.notes || '',
      });
    }
  }, [customer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (customer) {
        await axios.put(`/api/customers/${customer.id}`, formData);
        toast.success('Customer updated successfully');
      } else {
        await axios.post('/api/customers', formData);
        toast.success('Customer created successfully');
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
          <h2 className="text-xl font-semibold">{customer ? 'Edit Customer' : 'New Customer'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Contact Name *</label>
              <input
                type="text"
                name="contactName"
                required
                className="input"
                value={formData.contactName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="label">Company Name</label>
              <input
                type="text"
                name="companyName"
                className="input"
                value={formData.companyName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Email *</label>
              <input
                type="email"
                name="email"
                required
                className="input"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="label">Phone</label>
              <input
                type="tel"
                name="phone"
                className="input"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="label">Address</label>
            <input
              type="text"
              name="address"
              className="input"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">City</label>
              <input
                type="text"
                name="city"
                className="input"
                value={formData.city}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="label">State</label>
              <input
                type="text"
                name="state"
                className="input"
                value={formData.state}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="label">Zip Code</label>
              <input
                type="text"
                name="zipCode"
                className="input"
                value={formData.zipCode}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="label">Country</label>
            <input
              type="text"
              name="country"
              className="input"
              value={formData.country}
              onChange={handleChange}
            />
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

export default CustomerModal;
