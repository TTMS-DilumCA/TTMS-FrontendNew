import React from 'react';
import { useUser } from '../../contexts/UserContext';

const UserProfileDebug = () => {
  const { userInfo, isInitialized } = useUser();

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 text-xs border max-w-xs">
      <div className="font-bold text-gray-800 mb-2">User Profile Cache Status</div>
      <div className="space-y-1">
        <div>Initialized: {isInitialized ? '✅' : '❌'}</div>
        <div>Loading: {userInfo.loading ? '⏳' : '✅'}</div>
        <div>Has Profile Image: {userInfo.profileImageUrl ? '✅' : '❌'}</div>
        <div>Full Name: {userInfo.fullname || 'N/A'}</div>
        <div>Email: {userInfo.email || 'N/A'}</div>
        <div>Cache Timestamp: {localStorage.getItem('userProfile') ? new Date(JSON.parse(localStorage.getItem('userProfile')).timestamp).toLocaleTimeString() : 'N/A'}</div>
      </div>
    </div>
  );
};

export default UserProfileDebug;
