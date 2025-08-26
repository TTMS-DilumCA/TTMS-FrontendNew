import React, { useState, useCallback } from 'react';
import { AlertCircle, X, Save, Loader2 } from 'lucide-react';

const AddToolForm = ({ onSubmit, onClose, isSubmitting }) => {
  const [formData, setFormData] = useState({
    toolNo: '',
    toolAmount: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const validateForm = useCallback(() => {
    const errors = {};
    
    if (!formData.toolNo.trim()) {
      errors.toolNo = 'Tool number is required';
    }
    
    if (!formData.toolAmount || parseInt(formData.toolAmount) <= 0) {
      errors.toolAmount = 'Tool amount must be greater than 0';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData.toolNo, formData.toolAmount]);

  const resetForm = useCallback(() => {
    setFormData({
      toolNo: '',
      toolAmount: ''
    });
    setFormErrors({});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const success = await onSubmit(formData);
    if (success) {
      resetForm();
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Memoized input handlers to prevent re-creation on every render
  const handleToolNoChange = useCallback((e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      toolNo: value
    }));
    
    // Clear error when user starts typing
    if (formErrors.toolNo) {
      setFormErrors(prev => ({
        ...prev,
        toolNo: ''
      }));
    }
  }, [formErrors.toolNo]);

  const handleToolAmountChange = useCallback((e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      toolAmount: value
    }));
    
    // Clear error when user starts typing
    if (formErrors.toolAmount) {
      setFormErrors(prev => ({
        ...prev,
        toolAmount: ''
      }));
    }
  }, [formErrors.toolAmount]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tool Number <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.toolNo}
          onChange={handleToolNoChange}
          placeholder="Enter tool number"
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
            formErrors.toolNo ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
        />
        {formErrors.toolNo && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {formErrors.toolNo}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tool Amount <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min="1"
          value={formData.toolAmount}
          onChange={handleToolAmountChange}
          placeholder="Enter tool amount"
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
            formErrors.toolAmount ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
        />
        {formErrors.toolAmount && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {formErrors.toolAmount}
          </p>
        )}
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={handleClose}
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <X className="w-5 h-5" />
          Cancel
        </button>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Add Tool
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default AddToolForm;