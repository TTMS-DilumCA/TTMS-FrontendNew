import React, { useState, useEffect } from "react";
import axios from "axios";
import { AlertCircle, Save, Loader2 } from "lucide-react";
import { buildApiUrl, API_ENDPOINTS } from "../../config/api";

const NewInternalUserForm = ({ onClose, onAddUser, initialData }) => {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    fullname: "",
    email: "",
    password: "",
    role: "MANAGER",
    epfNo: "",
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

useEffect(() => {
  if (initialData) {
    // ✅ Ensure all fields are strings for form inputs
    setFormData({
      ...initialData,
      epfNo: initialData.epfNo?.toString() || "", // Convert number to string
      firstname: initialData.firstname || "",
      lastname: initialData.lastname || "", 
      fullname: initialData.fullname || "",
      email: initialData.email || "",
      role: initialData.role || "MANAGER"
    });
  }
}, [initialData]);

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData((prevData) => ({
    ...prevData,
    [name]: value, // This will always be a string from input
  }));

  // Clear error when user starts typing
  if (errors[name]) {
    setErrors(prev => ({ ...prev, [name]: '' }));
  }
};

const validateForm = () => {
  const newErrors = {};
  
  if (!formData.firstname?.trim()) newErrors.firstname = "First name is required";
  if (!formData.lastname?.trim()) newErrors.lastname = "Last name is required";
  if (!formData.fullname?.trim()) newErrors.fullname = "Full name is required";
  if (!formData.email?.trim()) newErrors.email = "Email is required";
  
  // ✅ Fix: Convert epfNo to string before calling trim()
  if (!formData.epfNo?.toString().trim()) newErrors.epfNo = "EPF number is required";
  
  // Password validation only for new users
  if (!initialData && !formData.password?.trim()) {
    newErrors.password = "Password is required";
  }
  
  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (formData.email && !emailRegex.test(formData.email)) {
    newErrors.email = "Invalid email format";
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
      const token = localStorage.getItem("token");
  
      // Extract only the required fields
      const { firstname, lastname, fullname, email, role, epfNo } = formData;
      const payload = { firstname, lastname, fullname, email, role, epfNo };
  
      if (initialData) {
        // Update user API call
       const response = await axios.put(
          buildApiUrl(API_ENDPOINTS.MANAGER.UPDATE_USER(initialData.id)),
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        onAddUser(response.data);
      } else {
        // Add user API call
              const response = await axios.post(
          buildApiUrl(API_ENDPOINTS.MANAGER.ADD_USER),
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        onAddUser(response.data);
      }
  
      onClose();
    } catch (error) {
      console.error("Error submitting user form:", error);
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* First Name */}
        <div>
          <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 mb-2">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="firstname"
            name="firstname"
            value={formData.firstname}
            onChange={handleChange}
            placeholder="Enter first name"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.firstname ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.firstname && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.firstname}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-2">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="lastname"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            placeholder="Enter last name"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.lastname ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.lastname && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.lastname}
            </p>
          )}
        </div>

        {/* Full Name */}
        <div>
          <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="fullname"
            name="fullname"
            value={formData.fullname}
            onChange={handleChange}
            placeholder="Enter full name"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
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
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
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

        {/* Password - Only show when adding new user */}
        {!initialData && (
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.password}
              </p>
            )}
          </div>
        )}

        {/* Role */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
            Role <span className="text-red-500">*</span>
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="MANAGER">Manager</option>
            <option value="MACHINE_OPERATOR_01">Machine Operator 01</option>
            <option value="MACHINE_OPERATOR_02">Tool Crafter</option>
          </select>
        </div>

        {/* EPF Number */}
        <div>
          <label htmlFor="epfNo" className="block text-sm font-medium text-gray-700 mb-2">
            EPF Number <span className="text-red-500">*</span>
          </label>
         
         <input
    type="text"
    id="epfNo"
    name="epfNo"
    value={formData.epfNo?.toString() || ""}
    onChange={handleChange}
    placeholder="Enter EPF number"
    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
      errors.epfNo ? 'border-red-500 bg-red-50' : 'border-gray-300'
    }`}
  />
          {errors.epfNo && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.epfNo}
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
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {initialData ? "Updating..." : "Adding..."}
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              {initialData ? "Update User" : "Add User"}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default NewInternalUserForm;