import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { X } from "lucide-react";
import NewMoldForm from "../../components/Manager/NewMoldForm";
import MoldListTable from "../../components/Manager/MoldListTable";
import NavBarManager from "./NavBarManager";
import Footer from "../../components/common/Footer";

const MoldDetails = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [mouldData, setMouldData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [open, setOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editMold, setEditMold] = useState(null);

  useEffect(() => {
    // Fetch data from the backend API
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const refreshToken = localStorage.getItem("refreshToken");
        const response = await axios.get("http://localhost:8080/api/mold/shared", {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        });
        setMouldData(response.data);
        setFilteredData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
  
    // Filter data based on search term
    const filtered = mouldData.filter((row) =>
      row.moldNo.toLowerCase().includes(value.toLowerCase()) ||
      row.customer.toLowerCase().includes(value.toLowerCase()) ||
      row.status.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleAddMold = (newMold) => {
    setMouldData((prevData) => [newMold, ...prevData]);
    setFilteredData((prevData) => [newMold, ...prevData]);
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
      await axios.put(`http://localhost:8080/api/mold/shared/${updatedMold.id}`, updatedMold, {
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
          await axios.delete(`http://localhost:8080/api/mold/shared/${id}`, {
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
  // Modal component with glass morphism effect
  const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-auto flex items-center justify-center p-4">
        {/* Glass backdrop with blur */}
        <div 
          className="absolute inset-0 backdrop-blur-md bg-white/20 transition-all duration-300"
          onClick={onClose}
        />
        
        {/* Modal content with glass effect */}
        <div className="relative glass bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/30 animate-in fade-in zoom-in duration-300">
          {/* Close button with glass effect */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={onClose}
              className="p-2 bg-white/80 backdrop-blur-sm hover:bg-white/90 rounded-full transition-all duration-200 shadow-lg border border-white/50 group"
            >
              <X className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors" />
            </button>
          </div>
          
          {/* Content area */}
          <div className="p-6">
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
          <MoldListTable
            data={filteredData}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
            searchTerm={searchTerm}
            onSearchChange={handleSearch}
            isLoading={filteredData.length === 0}
            onAddClick={handleOpen}
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

        <Footer />
      </div>
    </>
  );
};

export default MoldDetails;
