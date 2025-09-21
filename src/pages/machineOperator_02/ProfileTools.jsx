import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Wrench, 
  Search, 
  Trash2, 
  Clock, 
  User, 
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import AddToolForm from '../../components/Machine_operator02/AddToolForm';
import { buildApiUrl, API_ENDPOINTS } from '../../config/api';

function ProfileTools() {
  const [tools, setTools] = useState([]);
  const [filteredTools, setFilteredTools] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch tools on component mount
  useEffect(() => {
    fetchTools();
  }, []);

  // Filter tools based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = tools.filter(tool =>
        tool.toolNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTools(filtered);
    } else {
      setFilteredTools(tools);
    }
  }, [searchTerm, tools]);

  const fetchTools = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
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
   const response = await axios.get(buildApiUrl(API_ENDPOINTS.TOOLS.BY_CRAFTER(userId)), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
      setTools(response.data);
      setFilteredTools(response.data);
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

  const handleAddTool = async (formData) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
    const response = await axios.post(
      buildApiUrl(API_ENDPOINTS.TOOLS.CREATE),
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

      setTools(prev => [response.data, ...prev]);
      setShowAddModal(false);
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Tool added successfully',
        timer: 2000,
        showConfirmButton: false,
      });
      
      return true; // Success
    } catch (error) {
      console.error('Error adding tool:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to add tool. Please try again.',
      });
      return false; // Failure
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTool = async (toolId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this tool!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
      await axios.delete(buildApiUrl(API_ENDPOINTS.TOOLS.DELETE(toolId)), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

        setTools(prev => prev.filter(tool => tool.id !== toolId));
        
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Tool has been deleted.',
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error('Error deleting tool:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete tool. Please try again.',
        });
      }
    }
  };

  const closeModal = useCallback(() => {
    setShowAddModal(false);
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Modal Component
  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-auto flex items-center justify-center p-4">
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300"
          onClick={onClose}
        />
        
        <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full border border-white/30 animate-in fade-in zoom-in duration-300">
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={onClose}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-200 shadow-sm border border-gray-300 group"
            >
              <X className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors" />
            </button>
          </div>
          
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 rounded-t-2xl">
            <h2 className="text-xl font-bold flex items-center gap-3 pr-12">
              <Wrench className="w-6 h-6" />
              {title}
            </h2>
          </div>
          
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
   
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Tools Management</h1>
            <p className="text-gray-600">Manage your tool inventory and track tool usage</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tools</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredTools.length}</p>
                </div>
                <div className="bg-emerald-100 rounded-full p-3">
                  <Wrench className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {filteredTools.filter(tool => tool.status === 'completed').length}
                  </p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {filteredTools.reduce((sum, tool) => sum + tool.toolAmount, 0)}
                  </p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <User className="w-6 h-6 text-blue-600" />
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
                  placeholder="Search tools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              {/* Add Tool Button */}
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Tool
              </button>
            </div>
          </div>

          {/* Tools Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          ) : filteredTools.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tools found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first tool.'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  Add Your First Tool
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool) => (
                <div key={tool.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                  <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4">
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
                      <p className="text-sm text-gray-500">Created</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(tool.timestamp)}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span className="truncate">{tool.toolcrafterUsername}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeleteTool(tool.id)}
                          className="text-red-600 hover:text-red-800 transition-colors p-1.5 rounded-full hover:bg-red-50"
                          title="Delete Tool"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Tool Modal */}
          <Modal
            isOpen={showAddModal}
            onClose={closeModal}
            title="Add New Tool"
          >
            <AddToolForm
              onSubmit={handleAddTool}
              onClose={closeModal}
              isSubmitting={isSubmitting}
            />
          </Modal>
        </div>
      </div>
      
    </>
  );
}

export default ProfileTools;