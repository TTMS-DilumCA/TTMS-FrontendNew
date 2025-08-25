import React, { useState, useEffect, useCallback } from 'react';
import { 
  Wrench, 
  Search, 
  Clock, 
  User, 
  CheckCircle,
  AlertCircle,
  Check,
  Filter
} from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';


function ProfileToolsManager() {
  const [tools, setTools] = useState([]);
  const [filteredTools, setFilteredTools] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'completed' or 'acknowledged'
  const [acknowledgingTool, setAcknowledgingTool] = useState(null);

  // Fetch tools on component mount
  useEffect(() => {
    fetchTools();
  }, []);

  // Filter tools based on search term and active tab 
  useEffect(() => {
    let filtered = tools;

    // Filter by status based on active tab
    if (activeTab === 'completed') {
      filtered = tools.filter(tool => tool.status === 'completed');
    } else if (activeTab === 'acknowledged') {
      filtered = tools.filter(tool => tool.status === 'acknowledged');
    }
    // For 'all' tab, we don't filter by status

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(tool =>
        tool.toolNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.crafterFullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.crafterEpfNo.toString().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTools(filtered);
  }, [searchTerm, tools, activeTab]);

  const fetchTools = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }
      
      const response = await axios.get('http://localhost:8080/api/tools/with-crafter-details', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setTools(response.data);
    } catch (error) {
      console.error('Error fetching tools:', error);
      
      // If it's an authentication error, redirect to login
      if (error.message.includes('token') || error.message.includes('login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return;
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to fetch tools. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcknowledgeTool = async (toolId, toolNo) => {
    const result = await Swal.fire({
      title: 'Acknowledge Tool',
      text: `Are you sure you want to acknowledge tool "${toolNo}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Acknowledge',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      setAcknowledgingTool(toolId);
      try {
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:8080/api/tools/${toolId}/acknowledge`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Update the tool status in the state
        setTools(prev => prev.map(tool => 
          tool.id === toolId 
            ? { ...tool, status: 'acknowledged' }
            : tool
        ));
        
        Swal.fire({
          icon: 'success',
          title: 'Tool Acknowledged!',
          text: `Tool "${toolNo}" has been successfully acknowledged.`,
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error('Error acknowledging tool:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to acknowledge tool. Please try again.',
        });
      } finally {
        setAcknowledgingTool(null);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'acknowledged': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <Clock className="w-4 h-4" />;
      case 'acknowledged': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getCardHeaderColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-gradient-to-r from-blue-500 to-blue-600';
      case 'acknowledged': return 'bg-gradient-to-r from-green-500 to-green-600';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  const completedTools = tools.filter(tool => tool.status === 'completed');
  const acknowledgedTools = tools.filter(tool => tool.status === 'acknowledged');

  return (
    <>
      
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Tools Management</h1>
            <p className="text-gray-600">Monitor and acknowledge completed profile tools from crafters</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tools</p>
                  <p className="text-2xl font-bold text-gray-900">{tools.length}</p>
                </div>
                <div className="bg-gray-100 rounded-full p-3">
                  <Wrench className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Acknowledgment</p>
                  <p className="text-2xl font-bold text-blue-600">{completedTools.length}</p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Acknowledged</p>
                  <p className="text-2xl font-bold text-green-600">{acknowledgedTools.length}</p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search tools, crafters, or EPF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Tab Filters */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'all'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All ({tools.length})
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'completed'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Pending ({completedTools.length})
                </button>
                <button
                  onClick={() => setActiveTab('acknowledged')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'acknowledged'
                      ? 'bg-white text-green-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Acknowledged ({acknowledgedTools.length})
                </button>
              </div>
            </div>
          </div>

          {/* Tools Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredTools.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No tools found' : `No ${activeTab === 'all' ? '' : activeTab} tools`}
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? 'Try adjusting your search terms.' 
                  : activeTab === 'all' 
                    ? 'No tools have been created yet.'
                    : activeTab === 'completed' 
                      ? 'Completed tools will appear here for acknowledgment.'
                      : 'Acknowledged tools will appear here.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool) => (
                <div key={tool.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                  <div className={`px-6 py-4 ${getCardHeaderColor(tool.status)}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-5 h-5 text-white" />
                        <h3 className="text-lg font-semibold text-white">{tool.toolNo}</h3>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(tool.status)}`}>
                        {getStatusIcon(tool.status)}
                        {tool.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {/* Crafter Info */}
                    <div className="flex items-center gap-3 mb-4">
                      {tool.crafterProfileImageUrl ? (
                        <img
                          src={tool.crafterProfileImageUrl}
                          alt={tool.crafterFullName}
                          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-slate-800 via-blue-700 to-indigo-700 flex items-center justify-center border-2 border-gray-200 ${tool.crafterProfileImageUrl ? 'hidden' : ''}`}>
                        <span className="text-xs font-bold text-white">
                          {tool.crafterFullName.split(' ').map(name => name.charAt(0)).join('').toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{tool.crafterFullName}</p>
                        <p className="text-sm text-gray-500">EPF: {tool.crafterEpfNo}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Amount</p>
                        <p className="font-semibold text-gray-900">{tool.toolAmount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="font-semibold text-gray-900 capitalize">{tool.status}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Completed At</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(tool.timestamp)}</p>
                    </div>

                    {/* Action Button */}
                    {tool.status === 'completed' && (
                      <button
                        onClick={() => handleAcknowledgeTool(tool.id, tool.toolNo)}
                        disabled={acknowledgingTool === tool.id}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {acknowledgingTool === tool.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Acknowledging...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            Acknowledge Tool
                          </>
                        )}
                      </button>
                    )}

                    {tool.status === 'acknowledged' && (
                      <div className="w-full bg-green-100 text-green-800 font-medium py-2.5 px-4 rounded-lg text-center flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Tool Acknowledged
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    
    </>
  );
}

export default ProfileToolsManager;