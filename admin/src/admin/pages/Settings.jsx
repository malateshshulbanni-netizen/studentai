import React from 'react';
import { Settings as SettingsIcon, Shield, Bell, User, Lock } from 'lucide-react';

const Settings = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#080C68]">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your institution settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#EEF9FF] flex items-center justify-center">
              <User size={20} className="text-[#00A9E0]" />
            </div>
            <h3 className="font-semibold text-[#080C68]">Profile Settings</h3>
          </div>
          <p className="text-sm text-gray-500">Update your profile information</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#EEF9FF] flex items-center justify-center">
              <Lock size={20} className="text-[#00A9E0]" />
            </div>
            <h3 className="font-semibold text-[#080C68]">Security</h3>
          </div>
          <p className="text-sm text-gray-500">Manage password and security settings</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#EEF9FF] flex items-center justify-center">
              <Bell size={20} className="text-[#00A9E0]" />
            </div>
            <h3 className="font-semibold text-[#080C68]">Notifications</h3>
          </div>
          <p className="text-sm text-gray-500">Configure notification preferences</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#EEF9FF] flex items-center justify-center">
              <Shield size={20} className="text-[#00A9E0]" />
            </div>
            <h3 className="font-semibold text-[#080C68]">Privacy</h3>
          </div>
          <p className="text-sm text-gray-500">Manage privacy and data settings</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;