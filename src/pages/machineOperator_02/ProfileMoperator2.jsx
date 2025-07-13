import React, { useEffect, useState } from "react";
import axios from "axios";
import ProfileEditor from "../../components/common/ProfileEditor";

function ProfileMoperator2() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8080/api/profile", {
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
      apiEndpoint="http://localhost:8080/api/profile"
      token={localStorage.getItem("token")}
      onProfileUpdate={setProfile}
    />
  );
}

export default ProfileMoperator2;