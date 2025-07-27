import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Clock, 
  User, 
  Settings, 
  CheckCircle, 
  Play, 
  Calendar, 
  Eye,
  X,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import axios from 'axios';

function ProcessDetailsbyProcess() {
  const [processData, setProcessData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [processDetails, setProcessDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Fetch all processes
  useEffect(() => {
    fetchProcesses();
  }, []);

  const fetchProcesses = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/process/shared', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProcessData(response.data);
      setFilteredData(response.data);
    } catch (error) {
      console.error('Error fetching processes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter processes based on search term and status
  useEffect(() => {
    let filtered = processData;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(process =>
        process.process.toLowerCase().includes(searchTerm.toLowerCase()) ||
        process.moldNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        process.startedOperator.toLowerCase().includes(searchTerm.toLowerCase()) ||
        process.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        process.machine.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(process => process.status === statusFilter);
    }

    setFilteredData(filtered);
  }, [searchTerm, statusFilter, processData]);

  // Fetch detailed process information
  const fetchProcessDetails = async (processId) => {
    try {
      setLoadingDetails(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/api/process/details/${processId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProcessDetails(response.data);
    } catch (error) {
      console.error('Error fetching process details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Handle "See More" button click
  const handleSeeMore = async (process) => {
    setSelectedProcess(process);
    setShowModal(true);
    await fetchProcessDetails(process.id);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProcess(null);
    setProcessDetails(null);
  };

  // Helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'ongoing': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'ongoing': return <Play className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const calculateDuration = (startDate, endDate) => {
    if (!startDate) return 'N/A';
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffInMs = end - start;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMins = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffInHours}h ${diffInMins}m`;
  };

  // Separate ongoing and completed processes
  const ongoingProcesses = filteredData.filter(process => process.status === 'ongoing');
  const completedProcesses = filteredData.filter(process => process.status === 'completed');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Process Details</h1>
        <p className="text-gray-600">Comprehensive view of all process information</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search processes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {['all', 'ongoing', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Processes</p>
              <p className="text-2xl font-bold text-gray-900">{filteredData.length}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ongoing</p>
              <p className="text-2xl font-bold text-orange-600">{ongoingProcesses.length}</p>
            </div>
            <div className="bg-orange-100 rounded-full p-3">
              <Play className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{completedProcesses.length}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Ongoing Processes Section */}
      {(statusFilter === 'all' || statusFilter === 'ongoing') && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Play className="w-5 h-5 text-orange-600" />
            <h2 className="text-xl font-semibold text-gray-900">Ongoing Processes</h2>
            <span className="bg-orange-100 text-orange-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
              {ongoingProcesses.length}
            </span>
          </div>

          {ongoingProcesses.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No ongoing processes</p>
              <p className="text-gray-400 text-sm">All processes are completed</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {ongoingProcesses.map((process) => (
                <div key={process.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Play className="w-5 h-5 text-white" />
                        <h3 className="text-lg font-semibold text-white">{process.process}</h3>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(process.status)}`}>
                        {getStatusIcon(process.status)}
                        {process.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Mold Number</p>
                        <p className="font-semibold text-gray-900">{process.moldNo}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Side</p>
                        <p className="font-semibold text-gray-900">{process.side}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Machine</p>
                        <p className="font-semibold text-gray-900">{process.machine}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Cutting Tools</p>
                        <p className="font-semibold text-gray-900">{process.cuttingToolAmount}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-500 mb-1">Description</p>
                      <p className="text-sm">{process.description}</p>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{process.startedOperator}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(process.startedAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>Duration: {calculateDuration(process.startedAt)}</span>
                      </div>
                      <button
                        onClick={() => handleSeeMore(process)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        See More
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Completed Processes Section */}
      {(statusFilter === 'all' || statusFilter === 'completed') && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Completed Processes</h2>
            <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
              {completedProcesses.length}
            </span>
          </div>

          {completedProcesses.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No completed processes</p>
              <p className="text-gray-400 text-sm">Completed processes will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {completedProcesses.map((process) => (
                <div key={process.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-white" />
                        <h3 className="text-lg font-semibold text-white">{process.process}</h3>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(process.status)}`}>
                        {getStatusIcon(process.status)}
                        {process.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Mold Number</p>
                        <p className="font-semibold text-gray-900">{process.moldNo}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Side</p>
                        <p className="font-semibold text-gray-900">{process.side}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Machine</p>
                        <p className="font-semibold text-gray-900">{process.machine}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Cutting Tools</p>
                        <p className="font-semibold text-gray-900">{process.cuttingToolAmount}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-500 mb-1">Description</p>
                      <p className="text-sm">{process.description}</p>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{process.startedOperator}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(process.finishedAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>Duration: {calculateDuration(process.startedAt, process.finishedAt)}</span>
                      </div>
                      <button
                        onClick={() => handleSeeMore(process)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        See More
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {filteredData.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No processes found</p>
          <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Detailed Process Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-auto flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 transition-all duration-300"
            onClick={handleCloseModal}
          />
          
          {/* Modal content */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={handleCloseModal}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-200 shadow-sm border border-gray-300 group"
              >
                <X className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors" />
              </button>
            </div>
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold text-white">Process Details</h2>
              <p className="text-blue-100 mt-1">Comprehensive information about the selected process</p>
            </div>
            
            {/* Modal Content */}
            <div className="p-8">
              {loadingDetails ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : processDetails ? (
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Process Name</p>
                          <p className="font-semibold text-gray-900">{processDetails.process}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Mold Number</p>
                          <p className="font-semibold text-gray-900">{processDetails.moldNo}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Side</p>
                          <p className="font-semibold text-gray-900">{processDetails.side}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Machine</p>
                          <p className="font-semibold text-gray-900">{processDetails.machine}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(processDetails.status)}`}>
                            {getStatusIcon(processDetails.status)}
                            {processDetails.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Process Metrics</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Cutting Tool Amount</p>
                          <p className="font-semibold text-gray-900">{processDetails.cuttingToolAmount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Machine Counter</p>
                          <p className="font-semibold text-gray-900">{processDetails.mcounter}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Duration</p>
                          <p className="font-semibold text-gray-900">{processDetails.duration}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Duration (Minutes)</p>
                          <p className="font-semibold text-gray-900">{processDetails.durationInMinutes} minutes</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Operator Information */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Operator Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Started By */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Started By</h4>
                        <div className="flex items-center gap-3">
                          {processDetails.startedOperator?.profileImageUrl ? (
                            <img 
                              src={processDetails.startedOperator.profileImageUrl} 
                              alt="Profile" 
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{processDetails.startedOperator?.fullname || 'N/A'}</p>
                            <p className="text-sm text-gray-500">{processDetails.startedOperator?.email || 'N/A'}</p>
                            <p className="text-xs text-gray-400">EPF: {processDetails.startedOperator?.epfNo || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Finished By */}
                      {processDetails.finishedOperator && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Finished By</h4>
                          <div className="flex items-center gap-3">
                            {processDetails.finishedOperator?.profileImageUrl ? (
                              <img 
                                src={processDetails.finishedOperator.profileImageUrl} 
                                alt="Profile" 
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-green-600" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{processDetails.finishedOperator?.fullname || 'N/A'}</p>
                              <p className="text-sm text-gray-500">{processDetails.finishedOperator?.email || 'N/A'}</p>
                              <p className="text-xs text-gray-400">EPF: {processDetails.finishedOperator?.epfNo || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Play className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Process Started</p>
                          <p className="text-sm text-gray-500">{formatDate(processDetails.startedAt)}</p>
                        </div>
                      </div>
                      {processDetails.finishedAt && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Process Completed</p>
                            <p className="text-sm text-gray-500">{formatDate(processDetails.finishedAt)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                    <p className="text-gray-700">{processDetails.description}</p>
                  </div>

                  {/* Mold Information */}
                  {processDetails.mold && (
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Mold Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Customer</p>
                          <p className="font-medium text-gray-900">{processDetails.mold.customer}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <p className="font-medium text-gray-900">{processDetails.mold.status}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">Failed to load process details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProcessDetailsbyProcess;