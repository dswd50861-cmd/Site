import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import CustomerModal from '../components/CustomerModal';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, [searchTerm]);

  const fetchCustomers = async () => {
    try {
      const params = searchTerm ? { search: searchTerm } : {};
      const response = await axios.get('/api/customers', { params });
      setCustomers(response.data);
    } catch (error) {
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;

    try {
      await axios.delete(`/api/customers/${id}`);
      toast.success('Customer deleted successfully');
      fetchCustomers();
    } catch (error) {
      toast.error('Failed to delete customer');
    }
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedCustomer(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
    fetchCustomers();
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">Manage your customer relationships</p>
        </div>
        <button onClick={handleCreate} className="btn btn-primary flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          New Customer
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search customers..."
          className="input pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No customers found
          </div>
        ) : (
          customers.map((customer) => (
            <div key={customer.id} className="card p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {customer.contactName}
                  </h3>
                  {customer.companyName && (
                    <p className="text-sm text-gray-600">{customer.companyName}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(customer)}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(customer.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <p className="text-gray-600">
                  <span className="font-medium">Email:</span> {customer.email}
                </p>
                {customer.phone && (
                  <p className="text-gray-600">
                    <span className="font-medium">Phone:</span> {customer.phone}
                  </p>
                )}
                {customer.city && customer.state && (
                  <p className="text-gray-600">
                    <span className="font-medium">Location:</span> {customer.city}, {customer.state}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-sm">
                <div>
                  <p className="text-gray-500">Total Spent</p>
                  <p className="font-semibold text-green-600">
                    ${customer.totalSpent.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Outstanding</p>
                  <p className="font-semibold text-red-600">
                    ${customer.outstandingBalance.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <CustomerModal
          customer={selectedCustomer}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default Customers;
