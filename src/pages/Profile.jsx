import React from "react";
import Header from "../components/Profile/Header";
import ProfileCover from "../components/Profile/ProfileCover";
import ProfileSetting from "../components/Profile/ProfileSetting";

function Profile() {
  return (
    <div>
      <Header />
      <ProfileCover />
      <ProfileSetting />
    </div>
  );
}

export default Profile;
