import React from "react";
import { Settings, Network, Clock, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import Footer from "../../components/common/Footer";

const HomeMO_01 = () => {
  const navigate = useNavigate();
  const { userInfo, getFullName } = useUser();

  const cardItems = [
    {
      title: "Machine Processes",
      description: "Log and monitor machine process status",
      icon: <Network className="w-8 h-8 text-white" />,
      onClick: () => navigate("/process-manage"),
      gradient: "from-blue-500 to-blue-600",
      hoverGradient: "from-blue-600 to-blue-700",
    },
    {
      title: "Profile Settings",
      description: "Manage your profile and preferences",
      icon: <Settings className="w-8 h-8 text-white" />,
      onClick: () => navigate("/profile-operator1"),
      gradient: "from-indigo-500 to-indigo-600",
      hoverGradient: "from-indigo-600 to-indigo-700",
    },
  ];

  return (
     <>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full p-3 shadow-lg">
                <Clock className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Welcome back, {getFullName()}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tool Time Management System - Machine Operator Dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Quick Actions Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {cardItems.map((item, index) => (
                <div
                  key={index}
                  className={`bg-gradient-to-r ${item.gradient} hover:${item.hoverGradient} rounded-xl shadow-lg border border-gray-200/50 p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer group`}
                  onClick={item.onClick}
                >
                  <div className="flex items-center space-x-4">
                    {/* Icon Section */}
                    <div className="flex-shrink-0">
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 group-hover:bg-white/30 transition-colors duration-300">
                        {item.icon}
                      </div>
                    </div>
                    
                    {/* Content Section */}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-1">
                        {item.title}
                      </h3>
                      <p className="text-blue-100 text-sm leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Overview Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Status Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Processes</p>
                    <p className="text-2xl font-bold text-gray-900">--</p>
                  </div>
                  <div className="bg-green-100 rounded-full p-3">
                    <Network className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Profile Status</p>
                    <p className="text-2xl font-bold text-gray-900">Active</p>
                  </div>
                  <div className="bg-blue-100 rounded-full p-3">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Last Activity</p>
                    <p className="text-2xl font-bold text-gray-900">Today</p>
                  </div>
                  <div className="bg-purple-100 rounded-full p-3">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-center text-gray-500 py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium">No recent activity</p>
                <p className="text-sm">Your recent actions will appear here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
   
    </div>
   </>
  );
};

export default HomeMO_01;
