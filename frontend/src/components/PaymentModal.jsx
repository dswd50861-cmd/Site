import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { XMarkIcon } from '@heroicons/react/24/outline';

const PaymentModal = ({ invoice, onClose }) => {
  const [formData, setFormData] = useState({
    amount: invoice.totalAmount.toString(),
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'bank_transfer',
    referenceNumber: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`/api/invoices/${invoice.id}/payments`, formData);
      toast.success('Payment recorded successfully');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to record payment');
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
      <div className="bg-white rounded-lg max-w-lg w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Record Payment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Invoice:</span>
              <span className="font-medium">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Customer:</span>
              <span className="font-medium">{invoice.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Amount:</span>
              <span className="font-bold text-lg">${invoice.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="label">Payment Amount *</label>
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
            <label className="label">Payment Date *</label>
            <input
              type="date"
              name="paymentDate"
              required
              className="input"
              value={formData.paymentDate}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="label">Payment Method *</label>
            <select
              name="paymentMethod"
              required
              className="input"
              value={formData.paymentMethod}
              onChange={handleChange}
            >
              <option value="cash">Cash</option>
              <option value="check">Check</option>
              <option value="credit_card">Credit Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="label">Reference Number</label>
            <input
              type="text"
              name="referenceNumber"
              className="input"
              placeholder="Transaction ID, Check #, etc."
              value={formData.referenceNumber}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea
              name="notes"
              rows="2"
              className="input"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-success">
              {loading ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
