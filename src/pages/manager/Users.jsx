import React, { useState, useEffect, useMemo } from "react";
import { Search, Edit, Trash2, X, User, Users as UsersIcon, Building2, UserPlus, Filter } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";
import NewUserForm from "../../components/Manager/NewUserForm";

const Users = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [userData, setUserData] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [activeTab, setActiveTab] = useState("internal"); // "internal" or "external"

  // Tab configuration
  const tabs = [
    {
      id: "internal",
      label: "Internal Users",
      icon: <UsersIcon className="w-5 h-5" />,
      description: "Managers, operators, and staff",
      color: "blue",
      count: userData.length
    },
    {
      id: "external",
      label: "External Users",
      icon: <Building2 className="w-5 h-5" />,
      description: "Customers and partners",
      color: "green",
      count: customerData.length
    }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch both internal users and customers
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refreshToken");
      
      // Fetch internal users
      const usersResponse = await axios.get("http://localhost:8080/api/manager/users", {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      });
      
      // Fetch customers (external users)
      const customersResponse = await axios.get("http://localhost:8080/api/customers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setUserData(usersResponse.data);
      setCustomerData(customersResponse.data);
      
      // Set initial filtered data based on active tab
      if (activeTab === "internal") {
        setFilteredData(usersResponse.data);
      } else {
        setFilteredData(customersResponse.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter data based on active tab and search term
  useEffect(() => {
    const currentData = activeTab === "internal" ? userData : customerData;
    
    if (searchTerm) {
      const filtered = currentData.filter((item) => {
        if (activeTab === "internal") {
          return (
            item.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.epfNo?.toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        } else {
          return (
            item.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.contactNumber?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
      });
      setFilteredData(filtered);
    } else {
      setFilteredData(currentData);
    }
  }, [searchTerm, userData, customerData, activeTab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchTerm(""); // Clear search when switching tabs
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleOpen = () => setModalOpen(true);
  const handleClose = () => setModalOpen(false);

  const handleAddUser = (newUser) => {
    setUserData((prevData) => [newUser, ...prevData]);
    if (activeTab === "internal") {
      setFilteredData((prevData) => [newUser, ...prevData]);
    }
  };

  const handleAddCustomer = (newCustomer) => {
    console.log('New customer added:', newCustomer);
    setCustomerData((prevData) => [newCustomer, ...prevData]);
    if (activeTab === "external") {
      setFilteredData((prevData) => [newCustomer, ...prevData]);
    }
  };

  const handleEditClick = (user) => {
    setEditUser(user);
    setEditModalOpen(true);
  };

  const handleEditClose = () => {
    setEditModalOpen(false);
    setEditUser(null);
  };

  const handleEditSubmit = async (updatedUser) => {
    try {
      const token = localStorage.getItem("token");
      
      if (activeTab === "internal") {
        const { firstname, lastname, fullname, email, role, epfNo } = updatedUser;
        const payload = { firstname, lastname, fullname, email, role, epfNo };

        const response = await axios.put(
          `http://localhost:8080/api/manager/update-user/${updatedUser.id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const updatedData = userData.map((user) =>
          user.id === updatedUser.id ? response.data : user
        );
        setUserData(updatedData);
        setFilteredData(updatedData);
      } else {
        // Handle customer update
        const response = await axios.put(
          `http://localhost:8080/api/customers/${updatedUser.id}`,
          updatedUser,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const updatedData = customerData.map((customer) =>
          customer.id === updatedUser.id ? response.data : customer
        );
        setCustomerData(updatedData);
        setFilteredData(updatedData);
      }
      
      setEditModalOpen(false);
      setEditUser(null);
    } catch (error) {
      console.error("Error updating:", error);
      if (error.response?.status === 403) {
        alert("You do not have permission to perform this action.");
      }
    }
  };

  const handleDeleteClick = async (id) => {
    const entityType = activeTab === "internal" ? "user" : "customer";
    const endpoint = activeTab === "internal" 
      ? `http://localhost:8080/api/manager/delete-user/${id}`
      : `http://localhost:8080/api/customers/${id}`;

    Swal.fire({
      title: "Are you sure?",
      text: `You will not be able to recover this ${entityType}!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          const refreshToken = localStorage.getItem("refreshToken");
          
          await axios.delete(endpoint, {
            headers: {
              Authorization: `Bearer ${activeTab === "internal" ? refreshToken : token}`,
            },
          });

          if (activeTab === "internal") {
            const updatedData = userData.filter((user) => user.id !== id);
            setUserData(updatedData);
            setFilteredData(updatedData);
          } else {
            const updatedData = customerData.filter((customer) => customer.id !== id);
            setCustomerData(updatedData);
            setFilteredData(updatedData);
          }
          
          Swal.fire("Deleted!", `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} has been deleted.`, "success");
        } catch (error) {
          console.error(`Error deleting ${entityType}:`, error);
          Swal.fire("Error", `Failed to delete the ${entityType}. Please try again.`, "error");
        }
      }
    });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "MANAGER":
        return "bg-green-100 text-green-800 border-green-200";
      case "MACHINE_OPERATOR_01":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "MACHINE_OPERATOR_02":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "MANAGER":
        return "Manager";
      case "MACHINE_OPERATOR_01":
        return "Machine Operator 1";
      case "MACHINE_OPERATOR_02":
        return "Machine Operator 2";
      default:
        return role;
    }
  };

  // Enhanced Modal Component
  const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
       <div className="fixed inset-0 z-50 overflow-auto flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
      />
        
       <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/30 animate-in fade-in zoom-in duration-300">
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-200 shadow-sm border border-gray-300 group"
          >
            <X className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors" />
          </button>
        </div>
        

          <div >
            {children}
          </div>
        </div>
      </div>
    );
  };

  // Get placeholder text based on active tab
  const getSearchPlaceholder = () => {
    return activeTab === "internal" 
      ? "Search by name, email, role, or EPF number..."
      : "Search by name, email, company, or contact number...";
  };

  // Get table headers based on active tab
  const getTableHeaders = () => {
    if (activeTab === "internal") {
      return ["Profile", "Name", "Email", "EPF No", "Role", "Actions"];
    } else {
      return ["Name", "Email", "Contact", "Company", "Address", "Actions"];
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Creative Tab Navigation */}
      <div className="mt-8 mb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Tab Headers with Glass Effect */}
          <div className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex-1 relative px-8 py-6 text-left transition-all duration-300 group ${
                    activeTab === tab.id
                      ? `bg-white shadow-lg transform -translate-y-1 border-t-4 ${
                          tab.color === 'blue' ? 'border-blue-500' : 'border-green-500'
                        }`
                      : 'hover:bg-white/60 hover:transform hover:-translate-y-0.5'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    {/* Icon with dynamic color */}
                    <div className={`p-3 rounded-xl transition-all duration-300 ${
                      activeTab === tab.id
                        ? tab.color === 'blue' 
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-200' 
                          : 'bg-green-500 text-white shadow-lg shadow-green-200'
                        : tab.color === 'blue'
                          ? 'bg-blue-100 text-blue-600 group-hover:bg-blue-200'
                          : 'bg-green-100 text-green-600 group-hover:bg-green-200'
                    }`}>
                      {tab.icon}
                    </div>
                    
                    {/* Text Content */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className={`text-lg font-semibold transition-colors ${
                          activeTab === tab.id 
                            ? tab.color === 'blue' ? 'text-blue-700' : 'text-green-700'
                            : 'text-gray-700 group-hover:text-gray-900'
                        }`}>
                          {tab.label}
                        </h3>
                        
                        {/* Count Badge */}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                          activeTab === tab.id
                            ? tab.color === 'blue'
                              ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-200'
                              : 'bg-green-100 text-green-700 ring-2 ring-green-200'
                            : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                        }`}>
                          {tab.count}
                        </span>
                      </div>
                      
                      <p className={`text-sm mt-1 transition-colors ${
                        activeTab === tab.id 
                          ? 'text-gray-600' 
                          : 'text-gray-500 group-hover:text-gray-600'
                      }`}>
                        {tab.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Active Tab Indicator */}
                  {activeTab === tab.id && (
                    <div className={`absolute bottom-0 left-0 right-0 h-1 ${
                      tab.color === 'blue' ? 'bg-gradient-to-r from-blue-400 to-blue-600' : 'bg-gradient-to-r from-green-400 to-green-600'
                    } rounded-t-full`} />
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {/* Tab Content Area */}
          <div className="p-6">
            {/* Search Bar */}
            <div className="flex justify-between items-center mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder={getSearchPlaceholder()}
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              
              {/* Add New Button */}
              <button
                onClick={handleOpen}
                className={`ml-4 px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center space-x-2 ${
                  activeTab === "internal"
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 focus:ring-blue-500'
                    : 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200 focus:ring-green-500'
                }`}
              >
                <UserPlus className="w-5 h-5" />
                <span>Add New {activeTab === "internal" ? "User" : "Customer"}</span>
              </button>
            </div>

            {/* Dynamic Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {isLoading ? (
                <div className="flex justify-center items-center h-96">
                  <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
                    activeTab === "internal" ? 'border-blue-600' : 'border-green-600'
                  }`}></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        {getTableHeaders().map((header) => (
                          <th key={header} className="px-4 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredData.map((item, index) => (
                        <tr key={item.id || index} className="hover:bg-gray-50 transition-colors">
                          {activeTab === "internal" ? (
                            // Internal User Row
                            <>
                              {/* Profile Image */}
                              <td className="px-4 py-4 border-b border-gray-100">
                                <div className="flex items-center">
                                  {item.profileImageUrl ? (
                                    <img
                                      src={item.profileImageUrl}
                                      alt={`${item.firstname} ${item.lastname}`}
                                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                      }}
                                    />
                                  ) : null}
                                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-slate-800 via-blue-700 to-indigo-700 flex items-center justify-center border-2 border-gray-200 ${item.profileImageUrl ? 'hidden' : ''}`}>
                                    <span className="text-xs font-bold text-white">
                                      {item.firstname?.charAt(0)?.toUpperCase() || ''}
                                      {item.lastname?.charAt(0)?.toUpperCase() || ''}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              
                              {/* Name */}
                              <td className="px-4 py-4 border-b border-gray-100">
                                <div className="text-sm">
                                  <div className="font-medium text-gray-900">
                                    {item.firstname} {item.lastname}
                                  </div>
                                  <div className="text-gray-500 text-xs">
                                    {item.fullname}
                                  </div>
                                </div>
                              </td>
                              
                              {/* Email */}
                              <td className="px-4 py-4 text-sm text-gray-900 border-b border-gray-100">
                                <div className="max-w-xs truncate" title={item.email}>
                                  {item.email}
                                </div>
                              </td>
                              
                              {/* EPF No */}
                              <td className="px-4 py-4 text-sm text-gray-900 border-b border-gray-100">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  {item.epfNo || 'N/A'}
                                </span>
                              </td>
                              
                              {/* Role */}
                              <td className="px-4 py-4 text-sm border-b border-gray-100">
                                <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${getRoleColor(item.role)}`}>
                                  {getRoleDisplayName(item.role)}
                                </span>
                              </td>
                            </>
                          ) : (
                            // External User (Customer) Row
                            <>
                              {/* Name */}
                              <td className="px-4 py-4 border-b border-gray-100">
                                <div className="text-sm">
                                  <div className="font-medium text-gray-900">
                                    {item.fullname}
                                  </div>
                                  <div className="text-gray-500 text-xs">
                                    Customer
                                  </div>
                                </div>
                              </td>
                              
                              {/* Email */}
                              <td className="px-4 py-4 text-sm text-gray-900 border-b border-gray-100">
                                <div className="max-w-xs truncate" title={item.email}>
                                  {item.email}
                                </div>
                              </td>
                              
                              {/* Contact */}
                              <td className="px-4 py-4 text-sm text-gray-900 border-b border-gray-100">
                                {item.contactNumber}
                              </td>
                              
                              {/* Company */}
                              <td className="px-4 py-4 text-sm text-gray-900 border-b border-gray-100">
                                <div className="max-w-xs truncate" title={item.company}>
                                  {item.company}
                                </div>
                              </td>
                              
                              {/* Address */}
                              <td className="px-4 py-4 text-sm text-gray-900 border-b border-gray-100">
                                <div className="max-w-xs truncate" title={item.address}>
                                  {item.address}
                                </div>
                              </td>
                            </>
                          )}
                          
                          {/* Actions */}
                          <td className="px-4 py-4 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditClick(item)}
                                className="text-orange-600 hover:text-orange-800 transition-colors p-1.5 rounded-full hover:bg-orange-50"
                                title={`Edit ${activeTab === "internal" ? "User" : "Customer"}`}
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(item.id)}
                                className="text-red-600 hover:text-red-800 transition-colors p-1.5 rounded-full hover:bg-red-50"
                                title={`Delete ${activeTab === "internal" ? "User" : "Customer"}`}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {/* Empty State */}
                  {filteredData.length === 0 && !isLoading && (
                    <div className="text-center py-12">
                      {activeTab === "internal" ? (
                        <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      ) : (
                        <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      )}
                      <p className="text-gray-500 text-lg">
                        No {activeTab === "internal" ? "users" : "customers"} found
                      </p>
                      <p className="text-gray-400 text-sm">
                        {searchTerm ? "Try adjusting your search criteria" : `Add your first ${activeTab === "internal" ? "user" : "customer"} to get started`}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add New Modal */}
      <Modal isOpen={modalOpen} onClose={handleClose}>
        <NewUserForm 
          onClose={handleClose} 
          onAddUser={handleAddUser}
          onAddCustomer={handleAddCustomer}
          userType={activeTab}
        />
      </Modal>

      {/* Edit Modal */}
      {editUser && (
        <Modal isOpen={editModalOpen} onClose={handleEditClose}>
          <NewUserForm
            onClose={handleEditClose}
            onAddUser={handleEditSubmit}
            onAddCustomer={handleEditSubmit}
            initialData={editUser}
          />
        </Modal>
      )}
    </div>
  );
};

export default Users;