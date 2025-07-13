import React, { useState } from "react";
import axios from "axios";

const NewProcessForm = ({ onClose, onAddProcess }) => {
  const [formData, setFormData] = useState({
    process: "",
    side: "",
    operator: "",
    cuttingToolAmount: "",
    mcounter: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:8080/api/process/shared",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (onAddProcess) onAddProcess(formData);
      if (onClose) onClose();
    } catch (error) {
      alert("Failed to add process!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-gradient-to-br from-blue-50 via-white to-yellow-50 rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        🚀 Start a New Process
      </h2>
      
      {/* Loading Progress Bar */}
      {loading && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse"></div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Process Name */}
          <div>
            <label htmlFor="process" className="block text-sm font-medium text-gray-700 mb-1">
              Process Name
            </label>
            <input
              type="text"
              id="process"
              name="process"
              value={formData.process}
              onChange={handleChange}
              required
              placeholder="e.g. Milling"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Side */}
          <div>
            <label htmlFor="side" className="block text-sm font-medium text-gray-700 mb-1">
              Side
            </label>
            <input
              type="text"
              id="side"
              name="side"
              value={formData.side}
              onChange={handleChange}
              required
              placeholder="e.g. Left"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Operator */}
          <div>
            <label htmlFor="operator" className="block text-sm font-medium text-gray-700 mb-1">
              Operator
            </label>
            <input
              type="text"
              id="operator"
              name="operator"
              value={formData.operator}
              onChange={handleChange}
              required
              placeholder="Operator Name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Cutting Tool Amount */}
          <div>
            <label htmlFor="cuttingToolAmount" className="block text-sm font-medium text-gray-700 mb-1">
              Cutting Tool Amount
            </label>
            <input
              type="number"
              id="cuttingToolAmount"
              name="cuttingToolAmount"
              value={formData.cuttingToolAmount}
              onChange={handleChange}
              required
              placeholder="e.g. 5"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Machine Counter */}
          <div className="sm:col-span-1">
            <label htmlFor="mcounter" className="block text-sm font-medium text-gray-700 mb-1">
              Machine Counter
            </label>
            <input
              type="number"
              id="mcounter"
              name="mcounter"
              value={formData.mcounter}
              onChange={handleChange}
              required
              placeholder="e.g. 100"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={3}
            placeholder="Describe the process in detail..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Submitting...</span>
              </div>
            ) : (
              "Submit"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewProcessForm;
