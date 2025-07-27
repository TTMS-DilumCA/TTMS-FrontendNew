import React, { useState, useEffect, useMemo } from "react";
import { Search, Edit, Trash2, X, User } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";
import NewUserForm from "../../components/Manager/NewUserForm";

const Users = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [userData, setUserData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);

  useEffect(() => {
    // Fetch data from the backend API
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const refreshToken = localStorage.getItem("refreshToken");
        const response = await axios.get("http://localhost:8080/api/manager/users", {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        });
        setUserData(response.data);
        setFilteredData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    // Filter data based on search term (including EPF number)
    const filtered = userData.filter((row) =>
      row.firstname.toLowerCase().includes(value.toLowerCase()) ||
      row.lastname.toLowerCase().includes(value.toLowerCase()) ||
      row.email.toLowerCase().includes(value.toLowerCase()) ||
      row.role.toLowerCase().includes(value.toLowerCase()) ||
      row.epfNo?.toString().toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const handleOpen = () => setModalOpen(true);
  const handleClose = () => setModalOpen(false);

  const handleAddUser = (newUser) => {
    setUserData((prevData) => [newUser, ...prevData]);
    setFilteredData((prevData) => [newUser, ...prevData]);
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
      console.log("Token being sent:", token);

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

      // Update the user in the data
      const updatedData = userData.map((user) =>
        user.id === updatedUser.id ? response.data : user
      );
      setUserData(updatedData);
      setFilteredData(updatedData);
      setEditModalOpen(false);
      setEditUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
      if (error.response) {
        console.error("Response Data:", error.response.data);
        console.error("Response Status:", error.response.status);
      }
      if (error.response && error.response.status === 403) {
        alert("You do not have permission to perform this action.");
      }
    }
  };

  const handleDeleteClick = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will not be able to recover this user!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const refreshToken = localStorage.getItem("refreshToken");
          await axios.delete(`http://localhost:8080/api/manager/delete-user/${id}`, {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          });
          // Remove the deleted user from the state
          const updatedData = userData.filter((user) => user.id !== id);
          setUserData(updatedData);
          setFilteredData(updatedData);
          Swal.fire("Deleted!", "User has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting user:", error);
          Swal.fire("Error", "Failed to delete the user. Please try again.", "error");
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

  // Enhanced Modal Component with Glass Morphism
  const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-auto flex items-center justify-center p-4">
        {/* Glass backdrop with blur effect */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300"
          onClick={onClose}
        />
        
        {/* Modal content with glass morphism effect */}
        <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/30 animate-in fade-in zoom-in duration-300">
          {/* Close button with enhanced styling */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={onClose}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-200 shadow-sm border border-gray-300 group"
            >
              <X className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors" />
            </button>
          </div>
          
          {/* Modal content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Search bar */}
      <div className="flex justify-center items-center mb-4 mt-14">
        <div className="relative w-full max-w-[600px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by name, email, role, or EPF number..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full h-10 pl-10 pr-4 rounded-2xl bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Add New User Button */}
      <div className="flex justify-center items-center mb-4">
        <button
          onClick={handleOpen}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add New User
        </button>
      </div>

      {/* Modal for Add User */}
      <Modal isOpen={modalOpen} onClose={handleClose}>
        <NewUserForm onClose={handleClose} onAddUser={handleAddUser} />
      </Modal>

      {/* Table */}
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        All Users
      </h2>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-900 border-b border-gray-200">
                    Profile
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-900 border-b border-gray-200">
                    Name
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-900 border-b border-gray-200">
                    Email
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-900 border-b border-gray-200">
                    EPF No
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-900 border-b border-gray-200">
                    Role
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-900 border-b border-gray-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.map((user, index) => (
                  <tr key={user.id || index} className="hover:bg-gray-50 transition-colors">
                    {/* Profile Image */}
                    <td className="px-3 py-3 border-b border-gray-100">
                      <div className="flex items-center">
                        {user.profileImageUrl ? (
                          <img
                            src={user.profileImageUrl}
                            alt={`${user.firstname} ${user.lastname}`}
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-slate-800 via-blue-700 to-indigo-700 flex items-center justify-center border-2 border-gray-200 ${user.profileImageUrl ? 'hidden' : ''}`}>
                          <span className="text-xs font-bold text-white">
                            {user.firstname?.charAt(0)?.toUpperCase() || ''}
                            {user.lastname?.charAt(0)?.toUpperCase() || ''}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Name */}
                    <td className="px-3 py-3 border-b border-gray-100">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {user.firstname} {user.lastname}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {user.fullname}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-3 py-3 text-xs text-gray-900 border-b border-gray-100">
                      <div className="max-w-xs truncate" title={user.email}>
                        {user.email}
                      </div>
                    </td>

                    {/* EPF No */}
                    <td className="px-3 py-3 text-xs text-gray-900 border-b border-gray-100">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {user.epfNo || 'N/A'}
                      </span>
                    </td>

                    {/* Role */}
                    <td className="px-3 py-3 text-xs border-b border-gray-100">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${getRoleColor(user.role)}`}>
                        {getRoleDisplayName(user.role)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditClick(user)}
                          className="text-orange-600 hover:text-orange-800 transition-colors p-1.5 rounded-full hover:bg-orange-50"
                          title="Edit User"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user.id)}
                          className="text-red-600 hover:text-red-800 transition-colors p-1.5 rounded-full hover:bg-red-50"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredData.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No users found</p>
                <p className="text-gray-400 text-sm">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editUser && (
        <Modal isOpen={editModalOpen} onClose={handleEditClose}>
          <NewUserForm
            onClose={handleEditClose}
            onAddUser={handleEditSubmit}
            initialData={editUser}
          />
        </Modal>
      )}
    </div>
  );
};

export default Users;