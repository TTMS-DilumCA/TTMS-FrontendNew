import React, { useState, useEffect } from 'react';
import { Plus, Clock, CheckCircle, Play, Square, AlertCircle, User, Calendar, Wrench, Search, X } from 'lucide-react';
import axios from 'axios';
import { buildApiUrl, API_ENDPOINTS } from '../../config/api';
import NewProcessForm from '../../components/Machine_operator01/NewProcessForm';
import NavBarOperator1 from './NavBarOperator1';
import Footer from '../../components/common/Footer';
import Swal from 'sweetalert2';

function ProcessManage() {
  const [processes, setProcesses] = useState([]);
  const [ongoingProcesses, setOngoingProcesses] = useState([]);
  const [completedProcesses, setCompletedProcesses] = useState([]);
  const [filteredOngoingProcesses, setFilteredOngoingProcesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewProcessForm, setShowNewProcessForm] = useState(false);
  const [isEndingProcess, setIsEndingProcess] = useState(null);
  const [ongoingSearchTerm, setOngoingSearchTerm] = useState('');

  // Fetch all processes
  const fetchProcesses = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(buildApiUrl(API_ENDPOINTS.PROCESS.SHARED), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const allProcesses = response.data;
      setProcesses(allProcesses);

      // Separate ongoing and completed processes - Sort newest first
      const ongoing = allProcesses
        .filter(process => process.status === 'ongoing')
        .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt)); // Changed to newest first

      const completed = allProcesses
        .filter(process => process.status === 'completed')
        .sort((a, b) => new Date(b.finishedAt) - new Date(a.finishedAt)); // Sort by finished time (newest first)

      setOngoingProcesses(ongoing);
      setFilteredOngoingProcesses(ongoing); // Initialize filtered list
      setCompletedProcesses(completed);
    } catch (error) {
      console.error('Error fetching processes:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load processes. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter ongoing processes based on search term
  useEffect(() => {
    if (ongoingSearchTerm.trim() === '') {
      setFilteredOngoingProcesses(ongoingProcesses);
    } else {
      const filtered = ongoingProcesses.filter(process =>
        process.process.toLowerCase().includes(ongoingSearchTerm.toLowerCase()) ||
        process.moldNo?.toLowerCase().includes(ongoingSearchTerm.toLowerCase()) ||
        process.side.toLowerCase().includes(ongoingSearchTerm.toLowerCase()) ||
        process.machine?.toLowerCase().includes(ongoingSearchTerm.toLowerCase()) ||
        process.description.toLowerCase().includes(ongoingSearchTerm.toLowerCase()) ||
        process.startedOperator?.toLowerCase().includes(ongoingSearchTerm.toLowerCase())
      );
      setFilteredOngoingProcesses(filtered);
    }
  }, [ongoingSearchTerm, ongoingProcesses]);

  // Handle search input change
  const handleOngoingSearch = (e) => {
    setOngoingSearchTerm(e.target.value);
  };

  // Clear search
  const clearOngoingSearch = () => {
    setOngoingSearchTerm('');
  };

// End process functionality
const handleEndProcess = async (processId) => {
  const result = await Swal.fire({
    title: 'End Process?',
    text: 'Are you sure you want to end this process? This action cannot be undone.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Yes, End Process',
    cancelButtonText: 'Cancel',
  });

  if (result.isConfirmed) {
    try {
      setIsEndingProcess(processId);
      const token = localStorage.getItem('token');
      
      // ✅ CORRECTED: Use the FINISH endpoint
      await axios.put(
        buildApiUrl(API_ENDPOINTS.PROCESS.FINISH(processId)),
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh processes after ending
      await fetchProcesses();
      
      Swal.fire({
        icon: 'success',
        title: 'Process Ended',
        text: 'The process has been successfully completed.',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Error ending process:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to end process. Please try again.',
      });
    } finally {
      setIsEndingProcess(null);
    }
  }
};

  // Handle new process added
  const handleProcessAdded = (newProcess) => {
    fetchProcesses(); // Refresh the list
    setShowNewProcessForm(false);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  // Calculate duration
  const calculateDuration = (startDate, endDate) => {
    if (!startDate) return 'N/A';
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffInMs = end - start;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMins = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffInHours}h ${diffInMins}m`;
  };

  useEffect(() => {
    fetchProcesses();
  }, []);

  if (isLoading) {
    return (
      <>
        <NavBarOperator1 />
        <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading processes...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBarOperator1 />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Process Management</h1>
            <p className="text-gray-600">Monitor and manage your machine processes</p>
          </div>

          {/* Add New Process Button */}
          <div className="mb-8 flex justify-end">
            <button
              onClick={() => setShowNewProcessForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Start New Process
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Processes</p>
                  <p className="text-2xl font-bold text-gray-900">{processes.length}</p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <Wrench className="w-6 h-6 text-blue-600" />
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
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-orange-600" />
                <h2 className="text-xl font-semibold text-gray-900">Ongoing Processes</h2>
                <span className="bg-orange-100 text-orange-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                  {filteredOngoingProcesses.length}
                </span>
              </div>
              
              {/* Search Bar for Ongoing Processes */}
              {ongoingProcesses.length > 0 && (
                <div className="relative max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search ongoing processes..."
                    value={ongoingSearchTerm}
                    onChange={handleOngoingSearch}
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  {ongoingSearchTerm && (
                    <button
                      onClick={clearOngoingSearch}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>

            {filteredOngoingProcesses.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                {ongoingSearchTerm ? (
                  <>
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No ongoing processes found</p>
                    <p className="text-gray-400 text-sm">Try adjusting your search criteria</p>
                    <button
                      onClick={clearOngoingSearch}
                      className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Clear search
                    </button>
                  </>
                ) : (
                  <>
                    <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No ongoing processes</p>
                    <p className="text-gray-400 text-sm">Start a new process to get started</p>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredOngoingProcesses.map((process) => (
                  <div key={process.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Play className="w-5 h-5 text-white" />
                          <h3 className="text-lg font-semibold text-white">{process.process}</h3>
                        </div>
                        <span className="bg-white/20 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                          ONGOING
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Mold No</p>
                          <p className="font-medium">{process.moldNo || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Side</p>
                          <p className="font-medium">{process.side}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Machine</p>
                          <p className="font-medium">{process.machine || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Cutting Tools</p>
                          <p className="font-medium">{process.cuttingToolAmount}</p>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-sm text-gray-500 mb-1">Description</p>
                        <p className="text-sm">{process.description}</p>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{process.startedOperator}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(process.startedAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{calculateDuration(process.startedAt)}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleEndProcess(process.id)}
                        disabled={isEndingProcess === process.id}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isEndingProcess === process.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Ending...
                          </>
                        ) : (
                          <>
                            <Square className="w-4 h-4" />
                            End Process
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Search Results Summary */}
            {ongoingSearchTerm && ongoingProcesses.length > 0 && (
              <div className="mt-4 text-center text-sm text-gray-600">
                Showing {filteredOngoingProcesses.length} of {ongoingProcesses.length} ongoing processes
              </div>
            )}
          </div>

          {/* Completed Processes Section */}
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
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Process
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mold No
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Side
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Finished At
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {completedProcesses.map((process) => (
                        <tr key={process.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{process.process}</div>
                                <div className="text-sm text-gray-500">{process.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {process.moldNo || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {process.side}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {calculateDuration(process.startedAt, process.finishedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(process.finishedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Completed
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

          {/* New Process Form Modal */}
        {showNewProcessForm && (
          <div className="fixed inset-0 z-50 overflow-auto flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50 transition-all duration-300"
              onClick={() => setShowNewProcessForm(false)}
            />
            
            {/* Modal content with solid white background */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300">
              {/* Close button */}
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => setShowNewProcessForm(false)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-200 shadow-sm border border-gray-300 group"
                >
                  <X className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors" />
                </button>
              </div>
              
              {/* Content area */}
              <div className="p-6">
                <div className="mb-6 pr-12">
                  <h2 className="text-2xl font-bold text-gray-900">Start New Process</h2>
                </div>
                <NewProcessForm
                  onClose={() => setShowNewProcessForm(false)}
                  onAddProcess={handleProcessAdded}
                />
              </div>
            </div>
          </div>
        )}

      
      </div>
    </>
  );
}

export default ProcessManage;