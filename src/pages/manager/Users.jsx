import React, { useState, useEffect, useMemo } from "react";
import { Search, Edit, Trash2, X } from "lucide-react";
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

    // Filter data based on search term
    const filtered = userData.filter((row) =>
      row.firstname.toLowerCase().includes(value.toLowerCase()) ||
      row.lastname.toLowerCase().includes(value.toLowerCase()) ||
      row.email.toLowerCase().includes(value.toLowerCase()) ||
      row.role.toLowerCase().includes(value.toLowerCase())
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
    return role === "MANAGER" 
      ? "bg-green-100 text-green-800 border-green-200" 
      : "bg-yellow-100 text-yellow-800 border-yellow-200";
  };

  // Modal Component
  const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
          >
            <X size={24} />
          </button>
          {children}
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
            placeholder="Search"
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
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-900 border-b border-gray-200">
                    First Name
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-900 border-b border-gray-200">
                    Last Name
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-900 border-b border-gray-200">
                    Email
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-900 border-b border-gray-200">
                    Role
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-900 border-b border-gray-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.map((user, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2 text-xs text-gray-900 border-b border-gray-100">
                      {user.firstname}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-900 border-b border-gray-100">
                      {user.lastname}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-900 border-b border-gray-100">
                      {user.email}
                    </td>
                    <td className="px-3 py-2 text-xs border-b border-gray-100">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-3 py-2 border-b border-gray-100">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleEditClick(user)}
                          className="text-orange-600 hover:text-orange-800 transition-colors p-1 rounded hover:bg-orange-50"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user.id)}
                          className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
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
                <p className="text-gray-500">No users found matching your search.</p>
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
