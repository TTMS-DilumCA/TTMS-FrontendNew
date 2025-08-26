import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { X, Calendar } from "lucide-react";
import NewMoldForm from "../../components/Manager/NewMoldForm";
import MoldListTable from "../../components/Manager/MoldListTable";
import NavBarManager from "./NavBarManager";
import Footer from "../../components/common/Footer";
import { buildApiUrl, API_ENDPOINTS } from "../../config/api";

const MoldDetails = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [mouldData, setMouldData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [open, setOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editMold, setEditMold] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Default to current year (2025)
  const [isLoadingMolds, setIsLoadingMolds] = useState(false);

  // Generate year options (from 2020 to current year + 2)
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = 2020; year <= currentYear + 2; year++) {
      years.push(year);
    }
    return years.reverse(); // Show newest years first
  };

  useEffect(() => {
    fetchMoldsByYear(selectedYear);
  }, [selectedYear]);

  // Fetch molds by year
  const fetchMoldsByYear = async (year) => {
    setIsLoadingMolds(true);
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      const response = await axios.get(buildApiUrl(API_ENDPOINTS.MOLD.BY_YEAR(year)), {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      });
      setMouldData(response.data);
      setFilteredData(response.data);
    } catch (error) {
      console.error(`Error fetching molds for year ${year}:`, error);
      Swal.fire({
        icon: 'error',
        title: 'Error Loading Molds',
        text: `Failed to load molds for year ${year}. Please try again.`,
        confirmButtonColor: '#dc2626'
      });
    } finally {
      setIsLoadingMolds(false);
    }
  };

  const handleYearChange = (event) => {
    const year = parseInt(event.target.value);
    setSelectedYear(year);
    setSearchTerm(""); // Clear search when changing year
  };

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
  
    // Filter data based on search term
    const filtered = mouldData.filter((row) =>
      row.moldNo.toLowerCase().includes(value.toLowerCase()) ||
      row.customer.toLowerCase().includes(value.toLowerCase()) ||
      row.status.toLowerCase().includes(value.toLowerCase()) ||
      row.category.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleAddMold = (newMold) => {
    // Add new mold to current data
    setMouldData((prevData) => [newMold, ...prevData]);
    setFilteredData((prevData) => [newMold, ...prevData]);
    
    // If the new mold's year doesn't match selected year, refresh the data
    const moldYear = new Date(newMold.createdDate).getFullYear();
    if (moldYear !== selectedYear) {
      setSelectedYear(moldYear); // This will trigger fetchMoldsByYear
    }
  };

  const handleEditClick = (mold) => {
    setEditMold(mold);
    setEditModalOpen(true);
  };

  const handleEditClose = () => {
    setEditModalOpen(false);
    setEditMold(null);
  };

  const handleEditSubmit = async (updatedMold) => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
       await axios.put(buildApiUrl(API_ENDPOINTS.MOLD.UPDATE(updatedMold.id)), updatedMold, {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      });
      // Update the mold in the data
      const updatedData = mouldData.map((mold) =>
        mold.id === updatedMold.id ? updatedMold : mold
      );
      setMouldData(updatedData);
      setFilteredData(updatedData);
      setEditModalOpen(false);
      setEditMold(null);
    } catch (error) {
      console.error("Error updating mold:", error);
    }
  };

  const handleDeleteClick = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will not be able to recover this mold!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const refreshToken = localStorage.getItem("refreshToken");
          await axios.delete(buildApiUrl(API_ENDPOINTS.MOLD.DELETE(id)), {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          });
          // Remove the deleted mold from the state
          const updatedData = mouldData.filter((mold) => mold.id !== id);
          setMouldData(updatedData);
          setFilteredData(updatedData);
          Swal.fire("Deleted!", "Mold has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting mold:", error);
          Swal.fire("Error", "Failed to delete the mold. Please try again.", "error");
        }
      }
    });
  };

  const handleMoldUpdate = (updatedMold) => {
    // Update the mold in the data arrays
    const updatedData = mouldData.map((mold) =>
      mold.id === updatedMold.id ? updatedMold : mold
    );
    setMouldData(updatedData);
    setFilteredData(updatedData);
  };

  // ✅ Updated Modal Component - Same style as Users.jsx
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
          
          {/* ✅ Remove padding here - let child component handle it */}
          <div>
            {children}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <NavBarManager />
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Year Filter Header */}
          <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mold Management</h1>
                <p className="text-gray-600 mt-1">
                  Showing molds created in {selectedYear} 
                  <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {filteredData.length} molds found
                  </span>
                </p>
              </div>
              
              {/* Year Selector */}
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <select
                  value={selectedYear}
                  onChange={handleYearChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white min-w-[100px]"
                >
                  {generateYearOptions().map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <MoldListTable
            data={filteredData}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
            searchTerm={searchTerm}
            onSearchChange={handleSearch}
            isLoading={isLoadingMolds}
            onAddClick={handleOpen}
            onMoldUpdate={handleMoldUpdate}
          />
        </div>

        {/* Add New Mold Modal */}
        <Modal isOpen={open} onClose={handleClose}>
          <NewMoldForm onClose={handleClose} onAddMold={handleAddMold} />
        </Modal>

        {/* Edit Mold Modal */}
        <Modal isOpen={editModalOpen} onClose={handleEditClose}>
          <NewMoldForm
            onClose={handleEditClose}
            onAddMold={handleEditSubmit}
            initialData={editMold}
          />
        </Modal>
      </div>
    </>
  );
};

export default MoldDetails;