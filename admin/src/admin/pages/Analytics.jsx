import React from 'react';
import { BarChart3, TrendingUp, Users, GraduationCap } from 'lucide-react';

const Analytics = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#080C68]">Analytics</h1>
        <p className="text-gray-500 mt-1">View institution analytics and insights</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-[#080C68]">$45,230</p>
            </div>
            <TrendingUp size={24} className="text-[#00A9E0]" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Users</p>
              <p className="text-2xl font-bold text-[#080C68]">1,284</p>
            </div>
            <Users size={24} className="text-[#00A9E0]" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completion Rate</p>
              <p className="text-2xl font-bold text-[#080C68]">78%</p>
            </div>
            <GraduationCap size={24} className="text-[#00A9E0]" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 text-center">
        <BarChart3 size={40} className="mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500">Analytics dashboard coming soon...</p>
      </div>
    </div>
  );
};

export default Analytics;