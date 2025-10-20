import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCircleIcon } from '@heroicons/react/24/outline';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-1">Manage your account settings</p>
      </div>

      <div className="card p-8">
        <div className="flex items-center space-x-6 mb-8">
          <div className="flex-shrink-0">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={`${user.firstName} ${user.lastName}`}
                className="h-24 w-24 rounded-full"
              />
            ) : (
              <UserCircleIcon className="h-24 w-24 text-gray-400" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-gray-600 capitalize">{user?.role}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">Email</label>
            <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
              {user?.email}
            </div>
          </div>

          <div>
            <label className="label">Phone</label>
            <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
              {user?.phone || 'Not provided'}
            </div>
          </div>

          <div>
            <label className="label">Role</label>
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="badge badge-in-progress capitalize">{user?.role}</span>
            </div>
          </div>

          <div>
            <label className="label">Member Since</label>
            <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              To update your profile information or change your password, please contact your system administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
