import React, { useState, useEffect } from "react";
import axios from "axios";
import { buildApiUrl, API_ENDPOINTS } from "../../config/api";
import Swal from 'sweetalert2';

const NewProcessForm = ({ onClose, onAddProcess }) => {
  const [formData, setFormData] = useState({
    moldNo: "",
    mouldId: "", // This will store the actual backend ID (hidden)
    process: "",
    side: "",
    cuttingToolAmount: "",
    mCounter: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [molds, setMolds] = useState([]);
  const [filteredMolds, setFilteredMolds] = useState([]);
  const [moldSearchTerm, setMoldSearchTerm] = useState("");
  const [showMoldDropdown, setShowMoldDropdown] = useState(false);
  const [loadingMolds, setLoadingMolds] = useState(false);

  // Sample data for dropdowns
  const processOptions = [
    "Milling",
    "Drilling",
    "Turning",
    "Grinding",
    "Boring",
    "Reaming",
    "Tapping",
    "Cutting",
    "Finishing",
    "Polishing"
  ];

  const sideOptions = [
    "Left",
    "Right",
    "Front",
    "Back",
    "Top",
    "Bottom",
    "Center"
  ];

  // Fetch molds on component mount
  useEffect(() => {
    fetchMolds();
  }, []);

  // Filter molds based on search term
  useEffect(() => {
    if (moldSearchTerm) {
      const filtered = molds.filter(mold =>
        mold.moldNo.toLowerCase().includes(moldSearchTerm.toLowerCase()) ||
        mold.customer.toLowerCase().includes(moldSearchTerm.toLowerCase())
      );
      setFilteredMolds(filtered);
    } else {
      setFilteredMolds(molds);
    }
  }, [moldSearchTerm, molds]);

  const fetchMolds = async () => {
    try {
      setLoadingMolds(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        buildApiUrl(API_ENDPOINTS.MOLD.SHARED),
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Filter only ongoing molds
      const ongoingMolds = response.data.filter(mold => mold.status === 'ongoing');
      setMolds(ongoingMolds);
      setFilteredMolds(ongoingMolds);
    } catch (error) {
      console.error("Error fetching molds:", error);
    } finally {
      setLoadingMolds(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleMoldSearch = (e) => {
    const value = e.target.value;
    setMoldSearchTerm(value);
    
    // Update moldNo (what user sees) and clear mouldId (backend ID) if user types manually
    setFormData(prev => ({ 
      ...prev, 
      moldNo: value,
      mouldId: "" // Clear the backend ID when user types manually
    }));
    setShowMoldDropdown(true);
    
    // Clear error when user starts typing
    if (errors.moldNo) {
      setErrors(prev => ({ ...prev, moldNo: '' }));
    }
  };

  const handleMoldSelect = (mold) => {
    // Set moldNo (display value) and mouldId (backend ID)
    setFormData(prev => ({ 
      ...prev, 
      moldNo: mold.moldNo,     // User sees this (Mold Number)
      mouldId: mold.id         // Backend receives this (actual ID)
    }));
    setMoldSearchTerm(mold.moldNo);
    setShowMoldDropdown(false);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.process.trim()) newErrors.process = "Process name is required";
    if (!formData.side.trim()) newErrors.side = "Side is required";
    if (!formData.moldNo.trim()) newErrors.moldNo = "Mold Number is required";
    if (!formData.cuttingToolAmount.trim()) newErrors.cuttingToolAmount = "Cutting tool amount is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.mCounter.trim()) newErrors.mCounter = "Machine counter is required";
    
    // Validate if selected mold exists in ongoing molds and has a valid ID
    if (formData.moldNo && !formData.mouldId) {
      newErrors.moldNo = "Please select a valid ongoing mold from the dropdown";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Show confirmation dialog
    const result = await Swal.fire({
      title: 'Start New Process?',
      html: `
        <div class="text-left">
          <p class="mb-2"><strong>Process Details:</strong></p>
          <ul class="text-sm text-gray-600 space-y-1">
            <li><strong>Mold:</strong> ${formData.moldNo}</li>
            <li><strong>Process:</strong> ${formData.process}</li>
            <li><strong>Side:</strong> ${formData.side}</li>
            <li><strong>Cutting Tools:</strong> ${formData.cuttingToolAmount}</li>
            <li><strong>Machine Counter:</strong> ${formData.mCounter}</li>
            <li><strong>Description:</strong> ${formData.description}</li>
          </ul>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Start Process',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'swal2-popup-custom',
        htmlContainer: 'swal2-html-container-custom'
      }
    });

    if (!result.isConfirmed) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Prepare payload - mouldId contains the backend ID, moldNo contains the display value
      const payload = {
        ...formData,
        moldNo: formData.moldNo,    // Display value (e.g., "M002")
        mouldId: formData.mouldId   // Backend ID (e.g., "685cf9000067477d7e8f4aca")
      };
      
      console.log("Submitting payload:", payload); // For debugging
      
      const response = await axios.post(
        buildApiUrl(API_ENDPOINTS.PROCESS.SHARED),
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (onAddProcess) onAddProcess(response.data);
      if (onClose) onClose();
      
      // Show success message
      await Swal.fire({
        icon: 'success',
        title: 'Process Started Successfully!',
        text: `Process "${formData.process}" for mold "${formData.moldNo}" has been started.`,
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    } catch (error) {
      console.error("Error adding process:", error);
      
      // Show error message
      await Swal.fire({
        icon: 'error',
        title: 'Failed to Start Process',
        text: 'An error occurred while starting the process. Please try again.',
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mold Number - Searchable Dropdown */}
          <div className="relative md:col-span-2">
            <label htmlFor="moldNo" className="block text-sm font-medium text-gray-700 mb-2">
              Mold Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="moldNo"
              name="moldNo"
              value={moldSearchTerm}
              onChange={handleMoldSearch}
              onFocus={() => setShowMoldDropdown(true)}
              placeholder="Search and select ongoing mold..."
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.moldNo ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.moldNo && <p className="mt-1 text-sm text-red-600">{errors.moldNo}</p>}
            
            {/* Dropdown */}
            {showMoldDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {loadingMolds ? (
                  <div className="p-3 text-center text-gray-500">Loading molds...</div>
                ) : filteredMolds.length > 0 ? (
                  filteredMolds.map((mold) => (
                    <div
                      key={mold.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={() => handleMoldSelect(mold)}
                    >
                      <div className="font-medium text-gray-900">{mold.moldNo}</div>
                      <div className="text-sm text-gray-500">{mold.customer}</div>
                      <div className="text-xs text-gray-400">Status: {mold.status}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-gray-500">
                    {moldSearchTerm ? 'No matching ongoing molds found' : 'No ongoing molds available'}
                  </div>
                )}
              </div>
            )}
            
            {/* Hidden field for debugging - remove in production */}
            {formData.mouldId && (
              <div className="mt-1 text-xs text-gray-500">
                Selected Mold ID: {formData.mouldId}
              </div>
            )}
          </div>

          {/* Process Name - Dropdown */}
          <div>
            <label htmlFor="process" className="block text-sm font-medium text-gray-700 mb-2">
              Process Name <span className="text-red-500">*</span>
            </label>
            <select
              id="process"
              name="process"
              value={formData.process}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.process ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a process...</option>
              {processOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.process && <p className="mt-1 text-sm text-red-600">{errors.process}</p>}
          </div>

          {/* Side - Dropdown */}
          <div>
            <label htmlFor="side" className="block text-sm font-medium text-gray-700 mb-2">
              Side <span className="text-red-500">*</span>
            </label>
            <select
              id="side"
              name="side"
              value={formData.side}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.side ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a side...</option>
              {sideOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.side && <p className="mt-1 text-sm text-red-600">{errors.side}</p>}
          </div>

          {/* Cutting Tool Amount */}
          <div>
            <label htmlFor="cuttingToolAmount" className="block text-sm font-medium text-gray-700 mb-2">
              Cutting Tool Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="cuttingToolAmount"
              name="cuttingToolAmount"
              value={formData.cuttingToolAmount}
              onChange={handleChange}
              required
              placeholder="e.g. 5"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.cuttingToolAmount ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.cuttingToolAmount && <p className="mt-1 text-sm text-red-600">{errors.cuttingToolAmount}</p>}
          </div>

          {/* Machine Counter */}
          <div>
            <label htmlFor="mCounter" className="block text-sm font-medium text-gray-700 mb-2">
              Machine Counter <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="mCounter"
              name="mCounter"
              value={formData.mCounter}
              onChange={handleChange}
              required
              placeholder="e.g. 100"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.mCounter ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.mCounter && <p className="mt-1 text-sm text-red-600">{errors.mCounter}</p>}
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={3}
            placeholder="Describe the process in detail..."
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Starting...
              </>
            ) : (
              "Start Process"
            )}
          </button>
        </div>
      </form>
      
      {/* Click outside to close dropdown */}
      {showMoldDropdown && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowMoldDropdown(false)}
        />
      )}
    </div>
  );
};

export default NewProcessForm;