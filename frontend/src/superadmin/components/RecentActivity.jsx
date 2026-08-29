import React from 'react';
import { 
  Building2, 
  UserPlus, 
  Brain, 
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const RecentActivity = () => {
  const activities = [
    { icon: Building2, action: 'New institution added', detail: 'Springfield University', time: '2 hours ago', color: '#00A9E0' },
    { icon: UserPlus, action: 'User role updated', detail: 'Jane Smith → Admin', time: '4 hours ago', color: '#080C68' },
    { icon: Brain, action: 'ML Model deployed', detail: 'v3.2 - Risk Predictor', time: '6 hours ago', color: '#00A9E0' },
    { icon: AlertCircle, action: 'Institution deactivated', detail: 'Oakwood College', time: '1 day ago', color: '#080C68' },
    { icon: CheckCircle, action: 'System backup completed', detail: 'All data backed up', time: '1 day ago', color: '#00A9E0' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-[#080C68] mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#EEF9FF' }}
            >
              <activity.icon size={16} style={{ color: activity.color }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#080C68]">{activity.action}</p>
              <p className="text-xs text-gray-500">{activity.detail}</p>
            </div>
            <span className="text-xs text-gray-400 flex-shrink-0">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;