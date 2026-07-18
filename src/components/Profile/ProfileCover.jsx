import React, { useState } from "react";
import {
  FiCamera,
  FiUser,
  FiImage,
  FiEdit2,
  FiCheck,
  FiX,
  FiUpload,
  FiTrash2,
} from "react-icons/fi";

import "../../styles/ProfileCover.css";

const ProfileCover = () => {
  const [coverImage, setCoverImage] = useState(null);

  const [profileImage, setProfileImage] = useState(null);

  const [showCoverMenu, setShowCoverMenu] = useState(false);

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  const [userData, setUserData] = useState({
    name: "Your Name",

    username: "@username",
  });

  const [editData, setEditData] = useState(userData);

  // Cover Upload

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    console.log(file);
    if (file) {
      setCoverImage(URL.createObjectURL(file));

      setShowCoverMenu(false);
    }
  };

  // Profile Upload

  const handleProfileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setProfileImage(URL.createObjectURL(file));

      setShowProfileMenu(false);
    }
  };

  const removeCover = () => {
    setCoverImage(null);

    setShowCoverMenu(false);
  };

  const removeProfile = () => {
    setProfileImage(null);

    setShowProfileMenu(false);
  };

  // Edit

  const editProfile = () => {
    setEditData(userData);

    setIsEditing(true);
  };

  const saveProfile = () => {
    setUserData(editData);

    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditData(userData);

    setIsEditing(false);
  };

  return (
    <div className="profile-cover-container">
      {/* COVER */}

      <div className="cover-container">
        {coverImage ? (
          <img src={coverImage} className="cover-image" alt="cover" />
        ) : (
          <div className="cover-placeholder">
            <FiImage />
          </div>
        )}

        <div className="cover-menu-wrapper">
          <button
            className="cover-upload-btn"
            onClick={() => setShowCoverMenu(!showCoverMenu)}
          >
            <FiCamera />
            Cover
          </button>

          {showCoverMenu && (
            <div className="image-dropdown">
              <label className="dropdown-item">
                <FiUpload />
                Upload Cover
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                />
              </label>

              {coverImage && (
                <button className="dropdown-item" onClick={removeCover}>
                  <FiTrash2 />
                  Remove Cover
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* PROFILE */}

      <div className="profile-info">
        <div className="profile-image-wrapper">
          {profileImage ? (
            <img src={profileImage} className="profile-image" alt="profile" />
          ) : (
            <div className="profile-placeholder">
              <FiUser />
            </div>
          )}

          <div className="profile-menu-wrapper">
            <button
              className="profile-upload-btn"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <FiCamera />
            </button>

            {showProfileMenu && (
              <div className="image-dropdown profile-dropdown">
                <label className="dropdown-item">
                  <FiUpload />
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileChange}
                  />
                </label>

                {profileImage && (
                  <button className="dropdown-item" onClick={removeProfile}>
                    <FiTrash2 />
                    Remove Image
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* USER DETAILS */}

        <div className="user-details">
          {isEditing ? (
            <>
              <input
                className="edit-input"
                value={editData.name}
                onChange={(e) =>
                  setEditData({
                    ...editData,

                    name: e.target.value,
                  })
                }
              />

              <input
                className="edit-input"
                value={editData.username}
                onChange={(e) =>
                  setEditData({
                    ...editData,

                    username: e.target.value,
                  })
                }
              />
            </>
          ) : (
            <>
              <h2 className="user-name">{userData.name}</h2>

              <p className="user-username">{userData.username}</p>
            </>
          )}
        </div>

        {/* RIGHT BUTTON */}

        <div className="profile-action">
          {!isEditing ? (
            <button className="edit-profile-btn" onClick={editProfile}>
              <FiEdit2 />
              Edit Profile
            </button>
          ) : (
            <>
              <button className="save-btn" onClick={saveProfile}>
                <FiCheck />
                Save
              </button>

              <button className="cancel-btn" onClick={cancelEdit}>
                <FiX />
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCover;
