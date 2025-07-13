import React, { useState, useEffect } from "react";
import axios from "axios";
import { Save, Loader2, AlertCircle, X } from "lucide-react";

const NewMoldForm = ({ onClose, onAddMold, initialData }) => {
  const [formData, setFormData] = useState({
    moldNo: "",
    documentNo: "",
    customer: "",
    shrinkageFactor: "",
    plateSize: "",
    plateWeight: "",
    investmentNo: "",
    description: "",
    status: "completed",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);
  // Simple validation
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

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['moldNo', 'documentNo', 'customer', 'shrinkageFactor', 'plateSize', 'plateWeight', 'investmentNo', 'description'];
    
    requiredFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });
    
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
      
      const url = initialData 
        ? `http://localhost:8080/api/mold/shared/${initialData.id}`
        : "http://localhost:8080/api/mold/shared";
      
      const method = initialData ? 'put' : 'post';
      
      const response = await axios[method](url, formData, {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      setSuccessMessage(initialData ? 'Mold updated successfully!' : 'Mold added successfully!');
      onAddMold(response.data);
      
      // Close modal after a brief delay
      setTimeout(() => {
        onClose();
      }, 1500);
      
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
  };  return (
    <div className="bg-white rounded-2xl shadow-xl max-w-4xl mx-auto">
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

          {/* Customer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="customer"
              value={formData.customer}
              onChange={handleChange}
              placeholder="Enter customer name"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.customer ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.customer && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.customer}
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

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="completed">Completed</option>
            <option value="ongoing">Ongoing</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
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
    </div>
  );
};

export default NewMoldForm;
