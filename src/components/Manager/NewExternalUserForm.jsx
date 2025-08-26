import React, { useState, useEffect } from "react";
import axios from "axios";
import { AlertCircle, Save, Loader2 } from "lucide-react";
import { buildApiUrl, API_ENDPOINTS } from "../../config/api";

const NewExternalUserForm = ({ onClose, onAddCustomer, initialData }) => {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    contactNumber: "",
    company: "",
    address: "",
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullname.trim()) newErrors.fullname = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.contactNumber.trim()) newErrors.contactNumber = "Contact number is required";
    if (!formData.company.trim()) newErrors.company = "Company is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Phone number validation (basic)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (formData.contactNumber && !phoneRegex.test(formData.contactNumber.replace(/\s/g, ''))) {
      newErrors.contactNumber = "Invalid contact number format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }

  // Add this defensive check
  if (typeof onAddCustomer !== 'function') {
    console.error('onAddCustomer is not a function:', onAddCustomer);
    setErrors({ submit: "Configuration error: onAddCustomer callback is missing" });
    return;
  }

  setIsLoading(true);
  setErrors({});

  try {
    const token = localStorage.getItem("token");

    if (initialData) {
        const response = await axios.put(
          buildApiUrl(API_ENDPOINTS.CUSTOMERS.UPDATE(initialData.id)),
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        onAddCustomer(response.data);
      } else {
        const response = await axios.post(
          buildApiUrl(API_ENDPOINTS.CUSTOMERS.LIST),
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        onAddCustomer(response.data);
      }

    onClose();
  } catch (error) {
    console.error("Error submitting customer form:", error);
    if (error.response?.data?.message) {
      setErrors({ submit: error.response.data.message });
    } else if (error.response?.status === 403) {
      setErrors({ submit: "You do not have permission to perform this action." });
    } else {
      setErrors({ submit: "An error occurred. Please try again." });
    }
  } finally {
    setIsLoading(false);
  }
};

  return (
   <form onSubmit={handleSubmit} className="space-y-4 p-6"> {/* Add padding here */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="sm:col-span-2">
          <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="fullname"
            name="fullname"
            value={formData.fullname}
            onChange={handleChange}
            placeholder="Enter customer's full name"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
              errors.fullname ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.fullname && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.fullname}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email address"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
              errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.email}
            </p>
          )}
        </div>

        {/* Contact Number */}
        <div>
          <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Contact Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="contactNumber"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            placeholder="Enter contact number"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
              errors.contactNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.contactNumber && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.contactNumber}
            </p>
          )}
        </div>

        {/* Company */}
        <div className="sm:col-span-2">
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
            Company <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="Enter company name"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
              errors.company ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.company && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.company}
            </p>
          )}
        </div>

        {/* Address */}
        <div className="sm:col-span-2">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
            Address <span className="text-red-500">*</span>
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter customer's address"
            rows={3}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none ${
              errors.address ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.address}
            </p>
          )}
        </div>
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

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {initialData ? "Updating..." : "Adding..."}
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              {initialData ? "Update Customer" : "Add Customer"}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default NewExternalUserForm;