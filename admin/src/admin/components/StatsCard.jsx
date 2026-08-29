import React from 'react';

const StatsCard = ({ icon: Icon, title, value, change, color }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-[#080C68]">{value}</p>
          {change && (
            <p className={`text-xs mt-1 ${change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
              {change} from last month
            </p>
          )}
        </div>
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: color || '#EEF9FF' }}
        >
          <Icon size={24} style={{ color: '#00A9E0' }} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;