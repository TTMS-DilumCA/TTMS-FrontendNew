import React, { useEffect, useState } from "react";
import axios from "axios";
import ProfileEditor from "../../components/common/ProfileEditor";
import { buildApiUrl } from "../../config/api";

function ProfileMoperator1() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(buildApiUrl("/api/profile"), { //  Use buildApiUrl
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
      apiEndpoint="/api/profile" //  Just the path
      token={localStorage.getItem("token")}
      onProfileUpdate={setProfile}
    />
  );
}

export default ProfileMoperator1;