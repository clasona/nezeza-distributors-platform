'use client';

import React, { useState, useEffect } from 'react';
import { getSupportDashboard, SupportDashboard } from '@/utils/admin/getSupportDashboard';

const AdminSupportDashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<SupportDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await getSupportDashboard();
      setDashboard(response.dashboard);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="text-center p-4">
        <p className="text-red-600">{error || 'Failed to load dashboard'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Support Dashboard</h2>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900">Total Tickets</h3>
          <p className="text-3xl font-bold text-blue-600">{dashboard.overview.totalTickets}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900">Open Tickets</h3>
          <p className="text-3xl font-bold text-orange-600">{dashboard.overview.openTickets}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900">Resolved</h3>
          <p className="text-3xl font-bold text-green-600">{dashboard.overview.resolvedTickets}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900">Recent (7 days)</h3>
          <p className="text-3xl font-bold text-purple-600">{dashboard.overview.recentTickets}</p>
        </div>
      </div>

      {/* Priority Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Priority Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {dashboard.priorityBreakdown.map((item) => (
            <div key={item._id} className="text-center">
              <p className="text-2xl font-bold text-gray-900">{item.count}</p>
              <p className="text-sm text-gray-600 capitalize">{item._id}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Top Categories (Last 30 Days)</h3>
        <div className="space-y-2">
          {dashboard.categoryBreakdown.map((item) => (
            <div key={item._id} className="flex justify-between items-center">
              <span className="text-sm text-gray-600 capitalize">
                {item._id.replace('_', ' ')}
              </span>
              <span className="text-sm font-semibold">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Resolution Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900">Avg Resolution Time</h3>
          <p className="text-2xl font-bold text-blue-600">
            {Math.round(dashboard.resolutionMetrics.avgResolutionTime)}h
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900">Min Resolution Time</h3>
          <p className="text-2xl font-bold text-green-600">
            {Math.round(dashboard.resolutionMetrics.minResolutionTime)}h
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900">Max Resolution Time</h3>
          <p className="text-2xl font-bold text-red-600">
            {Math.round(dashboard.resolutionMetrics.maxResolutionTime)}h
          </p>
        </div>
      </div>

      {/* Satisfaction Rating */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Customer Satisfaction</h3>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-600">
              {dashboard.satisfaction.avgRating.toFixed(1)}/5
            </p>
            <p className="text-sm text-gray-600">
              Average Rating
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {dashboard.satisfaction.totalRatings}
            </p>
            <p className="text-sm text-gray-600">
              Total Ratings
            </p>
          </div>
        </div>
      </div>

      {/* User Role Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Tickets by User Role (Last 30 Days)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {dashboard.roleDistribution.map((item) => (
            <div key={item._id} className="text-center">
              <p className="text-2xl font-bold text-gray-900">{item.count}</p>
              <p className="text-sm text-gray-600 capitalize">{item._id}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminSupportDashboard; 