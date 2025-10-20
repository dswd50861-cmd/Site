import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [paymentAnalytics, setPaymentAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, deadlinesRes, analyticsRes] = await Promise.all([
        axios.get('/api/dashboard/stats'),
        axios.get('/api/dashboard/deadlines'),
        axios.get('/api/dashboard/payment-analytics?days=30'),
      ]);

      setStats(statsRes.data);
      setUpcomingDeadlines(deadlinesRes.data);
      setPaymentAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      name: 'Active Projects',
      value: stats?.activeProjects || 0,
      icon: DocumentTextIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Pending Tasks',
      value: stats?.tasks?.pending || 0,
      icon: ClockIcon,
      color: 'bg-yellow-500',
    },
    {
      name: 'Overdue Tasks',
      value: stats?.tasks?.overdue || 0,
      icon: ExclamationTriangleIcon,
      color: 'bg-red-500',
    },
    {
      name: 'Total Customers',
      value: stats?.totalCustomers || 0,
      icon: UserGroupIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Pending Amount',
      value: `$${(stats?.invoices?.pendingAmount || 0).toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'bg-purple-500',
    },
    {
      name: 'Completed Tasks',
      value: stats?.tasks?.completed || 0,
      icon: CheckCircleIcon,
      color: 'bg-teal-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <div key={stat.name} className="card p-5">
            <div className="flex items-center">
              <div className={`flex-shrink-0 rounded-lg ${stat.color} p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                  <dd className="text-2xl font-bold text-gray-900">{stat.value}</dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Analytics */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Flow (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={paymentAnalytics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="totalAmount" stroke="#3b82f6" name="Amount ($)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Task Overview */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { name: 'Pending', count: stats?.tasks?.pending || 0 },
                { name: 'In Progress', count: stats?.tasks?.inProgress || 0 },
                { name: 'Completed', count: stats?.tasks?.completed || 0 },
                { name: 'Overdue', count: stats?.tasks?.overdue || 0 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h2>
            <Link to="/tasks" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {upcomingDeadlines.length === 0 ? (
            <p className="px-6 py-8 text-center text-gray-500">No upcoming deadlines</p>
          ) : (
            upcomingDeadlines.map((task) => (
              <div key={task.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                      {task.projectName && <span>Project: {task.projectName}</span>}
                      {task.customerName && <span>Customer: {task.customerName}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge badge-${task.priority}`}>
                      {task.priority}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Invoice Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="text-sm font-medium text-gray-500">Pending Invoices</h3>
          <p className="mt-2 text-3xl font-bold text-yellow-600">
            {stats?.invoices?.pending || 0}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            ${(stats?.invoices?.pendingAmount || 0).toLocaleString()}
          </p>
        </div>

        <div className="card p-6">
          <h3 className="text-sm font-medium text-gray-500">Overdue Invoices</h3>
          <p className="mt-2 text-3xl font-bold text-red-600">
            {stats?.invoices?.overdue || 0}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            ${(stats?.invoices?.overdueAmount || 0).toLocaleString()}
          </p>
        </div>

        <div className="card p-6">
          <h3 className="text-sm font-medium text-gray-500">Paid This Month</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">
            ${(stats?.recentPayments || 0).toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-gray-600">Last 30 days</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
