import React, { useState, useEffect } from "react";
import { Settings, Wrench, Clock, User, Loader, AlertCircle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import axios from "axios";
import { buildApiUrl } from "../../config/api";
import NavBarOperator2 from "./NavBarOperator2";

const HomeMO_02 = () => {
  const navigate = useNavigate();
  const { userInfo, getFullName } = useUser();

  // State for dashboard data
  const [dashboardData, setDashboardData] = useState({
    toolSummary: {
      totalTools: 0,
      acknowledgedTools: 0,
      completedTools: 0,
      totalToolAmount: 0,
      lastActivityDate: null
    },
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cardItems = [
    {
      title: "Profile Tools",
      description: "Manage and configure profile tools",
      icon: <Wrench className="w-8 h-8 text-white" />,
      onClick: () => navigate("/profile-tools"),
      gradient: "from-emerald-500 to-emerald-600",
      hoverGradient: "from-emerald-600 to-emerald-700",
    },
    {
      title: "Profile Settings",
      description: "Manage your profile and preferences",
      icon: <Settings className="w-8 h-8 text-white" />,
      onClick: () => navigate("/profile-operator2"),
      gradient: "from-indigo-500 to-indigo-600",
      hoverGradient: "from-indigo-600 to-indigo-700",
    },
  ];

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        if (!token) {
          throw new Error('Authentication token not found. Please login again.');
        }
        
        // Decode JWT to get user ID
        let userId;
        try {
          const decodedToken = JSON.parse(atob(token.split('.')[1]));
          userId = decodedToken._id;
        } catch (decodeError) {
          throw new Error('Invalid token format. Please login again.');
        }
        
        if (!userId) {
          throw new Error('User ID not found in token. Please login again.');
        }
        
        const response = await axios.get(buildApiUrl(`/api/dashboard/tool-crafter/${userId}`), {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Update dashboard data with API response
        setDashboardData(response.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboard();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    const date = new Date(dateString);
    const now = new Date();
    
    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    
    // If yesterday
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    
    // Otherwise show date
    return date.toLocaleDateString();
  };
  
  // Get status color classes
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'acknowledged':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <NavBarOperator2 />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Header Section */}
        <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-gradient-to-r from-emerald-600 to-blue-600 rounded-full p-3 shadow-lg">
                  <Clock className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Welcome back, {getFullName()}
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Tool Time Management System - Tool Crafter Dashboard
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
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Tools Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Acknowledged Tools</p>
                      {loading ? (
                        <div className="flex items-center mt-1">
                          <Loader className="w-4 h-4 text-emerald-500 animate-spin mr-2" />
                          <span className="text-gray-500">Loading...</span>
                        </div>
                      ) : (
                        <p className="text-2xl font-bold text-gray-900">
                          {dashboardData.toolSummary.acknowledgedTools}
                        </p>
                      )}
                    </div>
                    <div className="bg-emerald-100 rounded-full p-3">
                      <Wrench className="w-6 h-6 text-emerald-600" />
                    </div>
                  </div>
                  
                  {!loading && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        {dashboardData.toolSummary.completedTools} completed tools
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Tools</p>
                      {loading ? (
                        <div className="flex items-center mt-1">
                          <Loader className="w-4 h-4 text-blue-500 animate-spin mr-2" />
                          <span className="text-gray-500">Loading...</span>
                        </div>
                      ) : (
                        <p className="text-2xl font-bold text-gray-900">
                          {dashboardData.toolSummary.totalTools}
                        </p>
                      )}
                    </div>
                    <div className="bg-blue-100 rounded-full p-3">
                      <Wrench className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  
                  {!loading && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        Total amount: {dashboardData.toolSummary.totalToolAmount}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Last Activity</p>
                      {loading ? (
                        <div className="flex items-center mt-1">
                          <Loader className="w-4 h-4 text-purple-500 animate-spin mr-2" />
                          <span className="text-gray-500">Loading...</span>
                        </div>
                      ) : (
                        <p className="text-2xl font-bold text-gray-900">
                          {dashboardData.toolSummary.lastActivityDate ? 
                            formatDate(dashboardData.toolSummary.lastActivityDate) : 
                            "No activity"}
                        </p>
                      )}
                    </div>
                    <div className="bg-purple-100 rounded-full p-3">
                      <Clock className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  
                  {!loading && dashboardData.recentActivities.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        Last tool: {dashboardData.recentActivities[0].toolNo}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tools Distribution */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Tools Distribution</h2>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader className="w-8 h-8 text-blue-500 animate-spin mr-3" />
                    <span className="text-gray-600">Loading statistics...</span>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col md:flex-row md:items-center mb-6">
                      <div className="flex-1 mb-4 md:mb-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Tool Completion</h3>
                        <p className="text-sm text-gray-600">
                          {dashboardData.toolSummary.completedTools} out of {dashboardData.toolSummary.totalTools} tools are completed
                        </p>
                      </div>
                      <div className="w-40 h-40 relative rounded-full border-8 border-emerald-100 flex items-center justify-center">
                        <div 
                          className="absolute inset-0 rounded-full border-8 border-emerald-500"
                          style={{ 
                            clipPath: dashboardData.toolSummary.totalTools > 0 
                              ? `polygon(50% 50%, 50% 0%, ${
                                  50 + 50 * Math.sin(2 * Math.PI * dashboardData.toolSummary.completedTools / dashboardData.toolSummary.totalTools)
                                }% ${
                                  50 - 50 * Math.cos(2 * Math.PI * dashboardData.toolSummary.completedTools / dashboardData.toolSummary.totalTools)
                                }%, 100% 0%, 100% 100%, 0% 100%, 0% 0%)` 
                              : 'none'
                          }}
                        />
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">
                            {dashboardData.toolSummary.totalTools > 0 
                              ? Math.round((dashboardData.toolSummary.completedTools / dashboardData.toolSummary.totalTools) * 100) 
                              : 0}%
                          </p>
                          <p className="text-xs text-gray-500">Complete</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-600">Acknowledged Tools</p>
                        <p className="text-2xl font-bold text-blue-600">{dashboardData.toolSummary.acknowledgedTools}</p>
                      </div>
                      <div className="p-4 bg-emerald-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-600">Completed Tools</p>
                        <p className="text-2xl font-bold text-emerald-600">{dashboardData.toolSummary.completedTools}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Recent Activity Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Tool Activity</h2>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader className="w-8 h-8 text-blue-500 animate-spin mr-3" />
                    <span className="text-gray-600">Loading activities...</span>
                  </div>
                ) : error ? (
                  <div className="text-center text-red-500 py-8">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-lg font-medium">{error}</p>
                  </div>
                ) : dashboardData.recentActivities && dashboardData.recentActivities.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        <div className={`p-2 rounded-full flex-shrink-0 ${
                          activity.status?.toLowerCase() === 'completed' ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                          {activity.status?.toLowerCase() === 'completed' ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <Wrench className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between">
                            <p className="text-sm font-medium text-gray-900">Tool #{activity.toolNo}</p>
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(activity.status)}`}>
                              {activity.status?.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">
                            Amount: {activity.toolAmount || "N/A"}
                          </p>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-xs text-gray-500">{formatDate(activity.timestamp)}</p>
                            <p className="text-xs text-blue-500">{activity.toolCrafterEmail}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium">No recent activity</p>
                    <p className="text-sm">Your tool activities will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomeMO_02;