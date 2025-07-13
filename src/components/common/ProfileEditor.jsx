import React, { useState, useEffect, useRef } from "react";
import { Edit, CheckCircle, X, Camera, User } from "lucide-react";
import axios from "axios";
import { storage } from "../../firebase";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";

const ProfileEditor = ({
  initialProfile,
  loading,
  apiEndpoint,
  token,
  onProfileUpdate,
}) => {
  const [profile, setProfile] = useState(initialProfile);
  const [editField, setEditField] = useState("");
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  const handleChange = (e) => {
    setProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFieldSave = async (field) => {
    setAlert({ type: "", message: "" });
    try {
      const payload = { [field]: profile[field] };
      const res = await axios.put(
        apiEndpoint,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(res.data);
      setEditField("");
      setAlert({ type: "success", message: "Profile updated successfully!" });
      if (onProfileUpdate) onProfileUpdate(res.data);
    } catch {
      setAlert({ type: "danger", message: "Failed to update profile." });
    }
  };

  const handleFieldCancel = () => {
    setEditField("");
    setAlert({ type: "", message: "" });
    // Optionally, reload profile from backend to discard changes
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      setAlert({ type: "danger", message: "Only JPG, PNG, or GIF images allowed" });
      return;
    }

    if (file.size > maxSize) {
      setAlert({ type: "danger", message: "Image size exceeds 10MB limit" });
      return;
    }

    setUploading(true);
    setAlert({ type: "", message: "" });

    try {
      // 1. Delete previous image if path is available
      if (profile.profileImagePath) {
        const oldImageRef = ref(storage, profile.profileImagePath);
        try {
          await deleteObject(oldImageRef);
        } catch (err) {
          // It's okay if the old image doesn't exist
          console.warn("Old image could not be deleted:", err.message);
        }
      }

      // 2. Upload new image
      const userId = profile.id;
      const imagePath = `users/${userId}/profile/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, imagePath);

      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type,
        customMetadata: {
          uploadedBy: userId,
          originalName: file.name
        }
      });

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setAlert({ type: "info", message: `Uploading: ${progress}%` });
        },
        (error) => {
          setAlert({ type: "danger", message: `Upload failed: ${error.message}` });
          setUploading(false);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);

          // 3. Save both the download URL and the storage path to backend
          const res = await axios.put(
            apiEndpoint,
            { profileImageUrl: url, profileImagePath: imagePath },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          setProfile((prev) => ({
            ...prev,
            profileImageUrl: url,
            profileImagePath: imagePath
          }));

          setAlert({ type: "success", message: "Profile image updated successfully!" });
          setUploading(false);
          if (onProfileUpdate) onProfileUpdate(res.data);
        }
      );
    } catch (error) {
      setAlert({ type: "danger", message: `Upload failed: ${error.message}` });
      setUploading(false);
    }
  };

  // Alert Component
  const Alert = ({ type, message }) => {
    const getAlertStyles = () => {
      switch (type) {
        case "success":
          return "bg-green-50 border-green-200 text-green-800";
        case "danger":
          return "bg-red-50 border-red-200 text-red-800";
        case "info":
          return "bg-blue-50 border-blue-200 text-blue-800";
        default:
          return "bg-gray-50 border-gray-200 text-gray-800";
      }
    };

    return (
      <div className={`border rounded-md p-3 mb-4 ${getAlertStyles()}`}>
        {message}
      </div>
    );
  };

  if (loading || !profile) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-6 p-6 rounded-2xl shadow-lg bg-gradient-to-br from-blue-50 via-white to-yellow-50 transition-shadow duration-300">
      <h3 className="text-2xl font-bold text-center mb-4 text-gray-800">
        Profile
      </h3>
      
      {alert.message && (
        <Alert type={alert.type} message={alert.message} />
      )}

      {/* Profile Image Section */}
      <div className="flex flex-col items-center mb-6 relative">
        <div className="relative">
          {profile.profileImageUrl ? (
            <img
              src={profile.profileImageUrl}
              alt={profile.fullname || "Profile"}
              className="w-28 h-28 rounded-full border-4 border-blue-600 object-cover transition-all duration-300"
            />
          ) : (
            <div className="w-28 h-28 rounded-full border-4 border-blue-600 bg-blue-100 flex items-center justify-center">
              <User className="w-12 h-12 text-blue-600" />
            </div>
          )}
          
          <button
            onClick={() => fileInputRef.current.click()}
            disabled={uploading}
            className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            <Camera className="w-4 h-4 text-blue-600" />
          </button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          disabled={uploading}
        />
        
        {uploading && (
          <p className="text-blue-600 text-sm mt-2">Uploading...</p>
        )}
        
        <p className="text-gray-600 text-sm mt-2">
          {profile.profileImageUrl ? "Profile Image" : "No Image"}
        </p>
      </div>

      {/* Divider */}
      <div className="flex items-center mb-4">
        <div className="flex-1 h-px bg-gray-300"></div>
        <span className="px-3 text-gray-500 text-sm">Account Details</span>
        <div className="flex-1 h-px bg-gray-300"></div>
      </div>

      {/* Form Fields */}
      <form className="space-y-4">
        {/* First Name */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name
          </label>
          <input
            type="text"
            name="firstname"
            value={profile.firstname || ""}
            onChange={handleChange}
            disabled={editField !== "firstname"}
            required
            className={`w-full px-3 py-2 pr-20 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
              editField === "firstname" ? "bg-blue-50" : ""
            }`}
          />
          {editField === "firstname" ? (
            <div className="absolute right-2 top-8 flex space-x-1">
              <button
                type="button"
                onClick={() => handleFieldSave("firstname")}
                className="p-1 text-green-600 hover:text-green-800 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleFieldCancel}
                className="p-1 text-red-600 hover:text-red-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditField("firstname")}
              className="absolute right-2 top-8 p-1 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Last Name */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <input
            type="text"
            name="lastname"
            value={profile.lastname || ""}
            onChange={handleChange}
            disabled={editField !== "lastname"}
            required
            className={`w-full px-3 py-2 pr-20 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
              editField === "lastname" ? "bg-blue-50" : ""
            }`}
          />
          {editField === "lastname" ? (
            <div className="absolute right-2 top-8 flex space-x-1">
              <button
                type="button"
                onClick={() => handleFieldSave("lastname")}
                className="p-1 text-green-600 hover:text-green-800 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleFieldCancel}
                className="p-1 text-red-600 hover:text-red-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditField("lastname")}
              className="absolute right-2 top-8 p-1 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Full Name */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            name="fullname"
            value={profile.fullname || ""}
            onChange={handleChange}
            disabled={editField !== "fullname"}
            required
            className={`w-full px-3 py-2 pr-20 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
              editField === "fullname" ? "bg-blue-50" : ""
            }`}
          />
          {editField === "fullname" ? (
            <div className="absolute right-2 top-8 flex space-x-1">
              <button
                type="button"
                onClick={() => handleFieldSave("fullname")}
                className="p-1 text-green-600 hover:text-green-800 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleFieldCancel}
                className="p-1 text-red-600 hover:text-red-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditField("fullname")}
              className="absolute right-2 top-8 p-1 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Email (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={profile.email || ""}
            disabled
            className="w-full px-3 py-2 border rounded-md bg-gray-50 cursor-not-allowed"
          />
        </div>

        {/* EPF No (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            EPF No
          </label>
          <input
            type="text"
            value={profile.epfNo || ""}
            disabled
            className="w-full px-3 py-2 border rounded-md bg-gray-50 cursor-not-allowed"
          />
        </div>
      </form>
    </div>
  );
};

export default ProfileEditor;
