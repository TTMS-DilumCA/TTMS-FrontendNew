import React, { useState, useEffect } from "react";
import axios from "axios";
import { Save, Loader2, AlertCircle, X, ChevronDown } from "lucide-react";
import { buildApiUrl, API_ENDPOINTS } from "../../config/api";

const NewMoldForm = ({ onClose, onAddMold, initialData }) => {
  const [formData, setFormData] = useState({
    item: "",
    moldNo: "",
    documentNo: "",
    customer: "",
    customerId: "", // Store the actual customer ID
    category: "",
    shrinkageFactor: "",
    plateSize: "",
    plateWeight: "",
    investmentNo: "",
    description: "",
    machine: "",
    targetedDeliveryDate: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  // Customer dropdown states
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Updated category options to match backend expectations
  const categoryOptions = [
    "New Mold",
    "Renovate Mold",
    "Modify Mold",
    "Shapeup Mold",
  ];

  const machineOptions = [
    "Machine 01",
    "Machine 02", 
    "Machine 03", 
    "Machine 04", 
    "Machine 05" 
  ];

  useEffect(() => {
    fetchCustomers();
    if (initialData) {
      // Format date for input field if it exists
      const formattedData = { ...initialData };
      if (formattedData.targetedDeliveryDate) {
        const date = new Date(formattedData.targetedDeliveryDate);
        formattedData.targetedDeliveryDate = date.toISOString().split('T')[0];
      }
      // Remove status from formData since we don't send it to backend
      const { status, completedDate, createdDate, lastModifiedDate, ...cleanData } = formattedData;
      setFormData(cleanData);
      setCustomerSearchTerm(formattedData.customer || "");
    }
  }, [initialData]);

  // Filter customers based on search term
  useEffect(() => {
    if (customerSearchTerm) {
      const filtered = customers.filter(customer =>
        customer.fullname?.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
        customer.company?.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(customerSearchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [customerSearchTerm, customers]);

  // Fetch customers from API
  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const token = localStorage.getItem("token");
    const response = await axios.get(buildApiUrl(API_ENDPOINTS.CUSTOMERS.LIST), {
      headers: { Authorization: `Bearer ${token}` },
    });
      
      setCustomers(response.data);
      setFilteredCustomers(response.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoadingCustomers(false);
    }
  };

  // Enhanced validation
  const validateField = (name, value) => {
    if (!value || !value.toString().trim()) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    }
    
    if (name === 'shrinkageFactor') {
      if (isNaN(value) || parseFloat(value) < 0 || parseFloat(value) > 1) {
        return 'Shrinkage factor must be between 0 and 1';
      }
    }
    
    if (name === 'plateWeight') {
      if (isNaN(value) || parseFloat(value) <= 0) {
        return 'Plate weight must be a positive number';
      }
    }

    if (name === 'targetedDeliveryDate') {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        return 'Targeted delivery date cannot be in the past';
      }
    }
    
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle customer search input
  const handleCustomerSearch = (e) => {
    const value = e.target.value;
    setCustomerSearchTerm(value);
    
    // Update customer field and clear customerId if user types manually
    setFormData(prev => ({ 
      ...prev, 
      customer: value,
      customerId: "" // Clear the customer ID when user types manually
    }));
    setShowCustomerDropdown(true);
    
    // Clear error when user starts typing
    if (errors.customer) {
      setErrors(prev => ({ ...prev, customer: '' }));
    }
  };

  // Handle customer selection from dropdown
  const handleCustomerSelect = (customer) => {
    setFormData(prev => ({ 
      ...prev, 
      customer: customer.fullname,     // Display name
      customerId: customer.id          // Store customer ID for backend
    }));
    setCustomerSearchTerm(customer.fullname);
    setShowCustomerDropdown(false);
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['item', 'moldNo', 'documentNo', 'customer', 'category', 'shrinkageFactor', 'plateSize', 'plateWeight', 'investmentNo', 'description', 'targetedDeliveryDate'];
    
    requiredFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    // Additional validation for customer selection
    if (formData.customer && !formData.customerId && customers.length > 0) {
      // Check if the entered customer name matches any existing customer
      const matchingCustomer = customers.find(c => 
        c.fullname.toLowerCase() === formData.customer.toLowerCase()
      );
      if (!matchingCustomer) {
        newErrors.customer = "Please select a valid customer from the dropdown";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const refreshToken = localStorage.getItem("refreshToken");
      
      // Prepare data for submission - exclude status and other auto-generated fields
      const { customerId, ...submitData } = formData;
      
      // Convert date string to Date object for backend
      if (submitData.targetedDeliveryDate) {
        submitData.targetedDeliveryDate = new Date(submitData.targetedDeliveryDate);
      }
      
      // Backend will set status automatically, so we don't send it updated: Use buildApiUrl with API_ENDPOINTS
  const url = initialData
      ? buildApiUrl(API_ENDPOINTS.MOLD.UPDATE(initialData.id))
      : buildApiUrl(API_ENDPOINTS.MOLD.SHARED);
    
      const method = initialData ? 'put' : 'post';
      
      const response = await axios[method](url, submitData, {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      setSuccessMessage(initialData ? 'Mold updated successfully!' : 'Mold added successfully!');
      onAddMold(response.data);
      
      // Close modal after successful submission
      onClose();
      
    } catch (error) {
      console.error("Error saving mold:", error);
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } else {
        setErrors({ submit: 'An error occurred while saving the mold. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl relative">
        <h2 className="text-2xl font-bold flex items-center gap-3 pr-12">
          <Save className="w-6 h-6" />
          {initialData ? "Edit Mold Details" : "Add New Mold"}
        </h2>
        <p className="text-blue-100 mt-1">
          {initialData ? "Update the mold information below" : "Fill in the details for the new mold"}
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="m-6 mb-0 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-2 text-green-800">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <span className="font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Item */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="item"
              value={formData.item}
              onChange={handleChange}
              placeholder="Enter item name"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.item ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.item && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.item}
              </p>
            )}
          </div>

          {/* Mold Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mold Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="moldNo"
              value={formData.moldNo}
              onChange={handleChange}
              placeholder="Enter mold number"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.moldNo ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.moldNo && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.moldNo}
              </p>
            )}
          </div>

          {/* Document Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="documentNo"
              value={formData.documentNo}
              onChange={handleChange}
              placeholder="Enter document number"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.documentNo ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.documentNo && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.documentNo}
              </p>
            )}
          </div>

          {/* Customer - Searchable Dropdown */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={customerSearchTerm}
                onChange={handleCustomerSearch}
                onFocus={() => setShowCustomerDropdown(true)}
                placeholder="Search and select customer..."
                className={`w-full px-4 py-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.customer ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
            
            {errors.customer && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.customer}
              </p>
            )}
            
            {/* Customer Dropdown */}
            {showCustomerDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {loadingCustomers ? (
                  <div className="p-3 text-center text-gray-500">Loading customers...</div>
                ) : filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={() => handleCustomerSelect(customer)}
                    >
                      <div className="font-medium text-gray-900">{customer.fullname}</div>
                      <div className="text-sm text-gray-500">{customer.company}</div>
                      <div className="text-xs text-gray-400">{customer.email}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-gray-500">
                    {customerSearchTerm ? 'No matching customers found' : 'No customers available'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.category ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            >
              <option value="">Select category...</option>
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.category}
              </p>
            )}
          </div>

          {/* Shrinkage Factor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shrinkage Factor <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="shrinkageFactor"
              value={formData.shrinkageFactor}
              onChange={handleChange}
              placeholder="0.02"
              step="0.001"
              min="0"
              max="1"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.shrinkageFactor ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.shrinkageFactor && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.shrinkageFactor}
              </p>
            )}
          </div>

          {/* Plate Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plate Size <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="plateSize"
              value={formData.plateSize}
              onChange={handleChange}
              placeholder="200x300mm"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.plateSize ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.plateSize && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.plateSize}
              </p>
            )}
          </div>

          {/* Plate Weight */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plate Weight (kg) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="plateWeight"
              value={formData.plateWeight}
              onChange={handleChange}
              placeholder="15.5"
              step="0.1"
              min="0"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.plateWeight ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.plateWeight && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.plateWeight}
              </p>
            )}
          </div>

          {/* Machine */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Machine
            </label>
            <select
              name="machine"
              value={formData.machine}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Select machine...</option>
              {machineOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Targeted Delivery Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Targeted Delivery Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="targetedDeliveryDate"
              value={formData.targetedDeliveryDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.targetedDeliveryDate ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.targetedDeliveryDate && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.targetedDeliveryDate}
              </p>
            )}
          </div>
        </div>

        {/* Investment Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Investment Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="investmentNo"
            value={formData.investmentNo}
            onChange={handleChange}
            placeholder="Enter investment number"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.investmentNo ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.investmentNo && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.investmentNo}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter detailed description of the mold..."
            rows={4}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
              errors.description ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.description}
            </p>
          )}
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{errors.submit}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" />
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {initialData ? "Updating..." : "Adding..."}
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {initialData ? "Update Mold" : "Add Mold"}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Click outside to close dropdown */}
      {showCustomerDropdown && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowCustomerDropdown(false)}
        />
      )}
    </>
  );
};

export default NewMoldForm;