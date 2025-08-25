import React, { useState, useMemo } from "react";
import { 
  Search, 
  Edit, 
  Trash2, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  CheckCircle,
  Eye,
  X,
  Calendar,
  User,
  Package,
  FileText,
  Settings,
  Weight,
  Ruler,
  DollarSign
} from "lucide-react";
import Swal from "sweetalert2";
import axios from "axios";

const MoldListTable = ({
  data = [],
  onEditClick,
  onDeleteClick,
  searchTerm = "",
  onSearchChange,
  isLoading = false,
  onAddClick,
  onMoldUpdate,
}) => {
  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [completingMolds, setCompletingMolds] = useState(new Set());
  const [selectedMold, setSelectedMold] = useState(null); // For details modal
  const [showDetailsModal, setShowDetailsModal] = useState(false); // Modal state

  // Filter and sort data
// Update the filteredData useMemo to sort by creation date by default
const filteredData = useMemo(() => {
  let filtered = data.filter(item => {
    const matchesSearch = Object.values(item).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesStatus = statusFilter === "all" || item.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  if (sortColumn) {
    // User has selected a specific column to sort by
    filtered.sort((a, b) => {
      if (a[sortColumn] < b[sortColumn]) return sortDirection === "asc" ? -1 : 1;
      if (a[sortColumn] > b[sortColumn]) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  } else {
    // Default sorting: most recently created first
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdDate || 0);
      const dateB = new Date(b.createdDate || 0);
      return dateB - dateA; // Newest first
    });
  }
  
  return filtered;
}, [data, searchTerm, statusFilter, sortColumn, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (column) => {
    if (sortColumn !== column) return <ArrowUpDown className="w-4 h-4" />;
    return sortDirection === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  const StatusBadge = ({ status }) => {
    const statusColors = {
      completed: "bg-green-100 text-green-800 border-green-200",
      ongoing: "bg-blue-100 text-blue-800 border-blue-200",
      active: "bg-blue-100 text-blue-800 border-blue-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      inactive: "bg-gray-100 text-gray-800 border-gray-200",
    };

    const normalizedStatus = status?.toLowerCase() || 'inactive';
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[normalizedStatus] || statusColors.inactive}`}>
        {status || 'Unknown'}
      </span>
    );
  };

  // Handle view details
  const handleViewDetails = (mold) => {
    setSelectedMold(mold);
    setShowDetailsModal(true);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Handle mold completion
  const handleCompleteMold = async (moldId, moldNo) => {
    const result = await Swal.fire({
      title: 'Complete Mold?',
      html: `
        <div class="text-left">
          <p class="mb-3 text-gray-700">Are you sure you want to mark this mold as <strong>Completed</strong>?</p>
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
            <p class="text-sm text-yellow-800"><strong>⚠️ Warning:</strong> This action cannot be undone!</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-3">
            <p class="text-sm text-gray-600"><strong>Mold:</strong> ${moldNo}</p>
            <p class="text-sm text-gray-600"><strong>Action:</strong> Change status to "Completed"</p>
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Complete Mold',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'swal2-popup-custom',
        confirmButton: 'swal2-confirm-custom',
        cancelButton: 'swal2-cancel-custom'
      }
    });

    if (!result.isConfirmed) {
      return;
    }

    // Add mold to completing set to show loading state
    setCompletingMolds(prev => new Set([...prev, moldId]));

    try {
      const refreshToken = localStorage.getItem("refreshToken");
      
      const response = await axios.put(
        `http://localhost:8080/api/mold/${moldId}/complete`,
        {},
        {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        }
      );

      // Show success message
      await Swal.fire({
        icon: 'success',
        title: 'Mold Completed Successfully!',
        text: `Mold "${moldNo}" has been marked as completed.`,
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });

      // Notify parent component about the update
      if (onMoldUpdate) {
        onMoldUpdate(response.data);
      }

    } catch (error) {
      console.error("Error completing mold:", error);
      
      // Show error message
      await Swal.fire({
        icon: 'error',
        title: 'Failed to Complete Mold',
        text: error.response?.data?.message || 'An error occurred while completing the mold. Please try again.',
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'OK'
      });
    } finally {
      // Remove mold from completing set
      setCompletingMolds(prev => {
        const newSet = new Set(prev);
        newSet.delete(moldId);
        return newSet;
      });
    }
  };

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  // Details Modal Component
  const DetailsModal = ({ isOpen, onClose, mold }) => {
    if (!isOpen || !mold) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-auto flex items-center justify-center p-4">
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300"
          onClick={onClose}
        />
        
        <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/30 animate-in fade-in zoom-in duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">{mold.moldNo}</h2>
                <p className="text-blue-100">{mold.item}</p>
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-2">
              <StatusBadge status={mold.status} />
              <span className="text-blue-100 text-sm">Created: {formatDate(mold.createdDate)}</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Basic Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Document No:</span>
                    <span className="text-sm font-medium text-gray-900">{mold.documentNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Category:</span>
                    <span className="text-sm font-medium text-gray-900">{mold.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Investment No:</span>
                    <span className="text-sm font-medium text-gray-900">{mold.investmentNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Machine:</span>
                    <span className="text-sm font-medium text-gray-900">{mold.machine || 'Not assigned'}</span>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-green-600" />
                  Customer Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Customer Name:</span>
                    <span className="text-sm font-medium text-gray-900">{mold.customer}</span>
                  </div>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-600" />
                  Technical Specifications
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Shrinkage Factor:</span>
                    <span className="text-sm font-medium text-gray-900">{mold.shrinkageFactor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Plate Size:</span>
                    <span className="text-sm font-medium text-gray-900">{mold.plateSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Plate Weight:</span>
                    <span className="text-sm font-medium text-gray-900">{mold.plateWeight} kg</span>
                  </div>
                </div>
              </div>

              {/* Timeline Information */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  Timeline
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Created Date:</span>
                    <span className="text-sm font-medium text-gray-900">{formatDate(mold.createdDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Modified:</span>
                    <span className="text-sm font-medium text-gray-900">{formatDate(mold.lastModifiedDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Target Delivery:</span>
                    <span className="text-sm font-medium text-gray-900">{formatDate(mold.targetedDeliveryDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Completed Date:</span>
                    <span className="text-sm font-medium text-gray-900">{formatDate(mold.completedDate)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6 bg-gray-50 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Description
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {mold.description || 'No description provided'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onClose();
                  onEditClick(mold);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Mold
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
     <div className="p-6 border-b border-gray-200">
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Mold List</h2>
      <p className="text-sm text-gray-500 mt-1">Manage and track all mold information</p>
    </div>
    
    <button
      onClick={onAddClick}
      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-sm"
    >
      <Plus className="w-4 h-4 mr-2" />
      Add New Mold
    </button>
  </div>
</div>

      {/* Search and Filters */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search molds..."
              value={searchTerm}
              onChange={onSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
            
            {showFilters && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="ongoing">Ongoing</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  {
                    key: 'moldNo',
                    label: 'Mold No'
                  },
                  {
                    key: 'customer',
                    label: 'Customer'
                  },
                  {
                    key: 'shrinkageFactor',
                    label: 'Shrinkage Factor'
                  },
                  {
                    key: 'plateSize',
                    label: 'Plate Size'
                  },
                {
    key: 'category', // Changed from 'plateWeight' to 'category'
    label: 'Category' // Changed from 'Plate Weight' to 'Category'
  },
                  {
                    key: 'investmentNo',
                    label: 'Investment No'
                  },
                  {
                    key: 'status',
                    label: 'Status'
                  },
                  {
                    key: 'actions',
                    label: 'Actions'
                  }
                ].map((column) => (
                  <th
                    key={column.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.key !== 'actions' && column.key !== 'status' ? (
                      <button
                        onClick={() => handleSort(column.key)}
                        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                      >
                        <span>{column.label}</span>
                        {getSortIcon(column.key)}
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((item, index) => (
                <tr key={item.id || index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.moldNo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.shrinkageFactor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.plateSize}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.investmentNo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {/* View Details Button */}
                      <button
                        onClick={() => handleViewDetails(item)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors p-1 rounded hover:bg-indigo-50"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => onEditClick(item)}
                        className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-50"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      {/* Complete Mold Button - Only show for Ongoing molds */}
                      {item.status?.toLowerCase() === 'ongoing' && (
                        <button
                          onClick={() => handleCompleteMold(item.id, item.moldNo)}
                          disabled={completingMolds.has(item.id)}
                          className="text-green-600 hover:text-green-900 transition-colors p-1 rounded hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Complete Mold"
                        >
                          {completingMolds.has(item.id) ? (
                            <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      
                      <button
                        onClick={() => onDeleteClick(item.id)}
                        className="text-red-600 hover:text-red-900 transition-colors p-1 rounded hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      <DetailsModal 
        isOpen={showDetailsModal} 
        onClose={() => setShowDetailsModal(false)} 
        mold={selectedMold} 
      />
    </div>
  );
};

export default MoldListTable;