import React, { useEffect, useState } from "react";
import axios from "axios";
import ProfileEditor from "../../components/common/ProfileEditor";
import { buildApiUrl } from "../../config/api"; //  This is present


function ProfileManager() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(buildApiUrl("/api/profile"), { //  Use buildApiUrl here too
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  return (
      <ProfileEditor
      initialProfile={profile}
      loading={loading}
      apiEndpoint="/api/profile" //  Pass just the path, not full URL
      token={localStorage.getItem("token")}
      onProfileUpdate={setProfile}
    />
  );
}

export default ProfileManager;