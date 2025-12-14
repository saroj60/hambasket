import React from "react";

const Profile = () => {
  const user = { name: "Saroj Kumar", email: "saroj@example.com" };

  return (
    <div className="profile">
      <h2>User Profile</h2>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
      <button>Edit Profile</button>
    </div>
  );
};

export default Profile;
