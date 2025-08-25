import React, { useState } from "react";
import { Users, Building2, UserPlus, X } from "lucide-react";
import NewInternalUserForm from "./NewInternalUserForm";
import NewExternalUserForm from "./NewExternalUserForm";

const NewUserForm = ({ onClose, onAddUser, onAddCustomer, initialData, userType = "internal" }) => {
  const [activeTab, setActiveTab] = useState(initialData ? (initialData.role ? "internal" : "external") : userType);

  const tabs = [
    {
      id: "internal",
      label: "Internal Users",
      icon: <Users className="w-4 h-4" />,
      description: "Managers, operators, and staff"
    },
    {
      id: "external",
      label: "External Users",
      icon: <Building2 className="w-4 h-4" />,
      description: "Customers and partners"
    }
  ];

  return (
    <>
      {/* Header */}
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
      >
        <X className="w-6 h-6" />
      </button>
      
      <h2 className="text-2xl font-bold flex items-center gap-3 pr-12">
        <UserPlus className="w-6 h-6" />
        {initialData 
          ? `Edit ${activeTab === 'internal' ? 'Internal User' : 'Customer'}` 
          : `Add New ${activeTab === 'internal' ? 'Internal User' : 'Customer'}`
        }
      </h2>
      <p className="text-blue-100 mt-1">
        {initialData 
          ? `Update the ${activeTab === 'internal' ? 'user' : 'customer'} information below`
          : `Add a new ${activeTab === 'internal' ? 'internal user' : 'customer'} to the system`
        }
      </p>
    </div>

      {/* Tabs */}
      {!initialData && (
      <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {tab.icon}
                  <span className="font-semibold">{tab.label}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {tab.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Form Content */}
      <div className="p-6">
        {activeTab === "internal" ? (
          <NewInternalUserForm
            onClose={onClose}
            onAddUser={onAddUser}
            initialData={initialData?.role ? initialData : null}
          />
        ) : (
          <NewExternalUserForm
            onClose={onClose}
            onAddCustomer={onAddCustomer}
            initialData={!initialData?.role ? initialData : null}
          />
        )}
      </div>
    </>
  );
};

export default NewUserForm;