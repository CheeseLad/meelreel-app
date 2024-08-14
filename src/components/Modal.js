// Default export
import React, { useState } from "react";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { auth, db } from "../firebase";

const Modal = ({ isOpen, onClose, usersList, isFollowingList }) => {
  const handleFollowToggle = async (userId) => {
    if (!auth.currentUser) return;

    const currentUserId = auth.currentUser.uid;
    const userRef = doc(db, "users", userId);
    const currentUserRef = doc(db, "users", currentUserId);

    if (isFollowingList) {
      await updateDoc(currentUserRef, {
        following: arrayRemove(userId)
      });
      await updateDoc(userRef, {
        followers: arrayRemove(currentUserId)
      });
    } else {
      await updateDoc(currentUserRef, {
        following: arrayUnion(userId)
      });
      await updateDoc(userRef, {
        followers: arrayUnion(currentUserId)
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 text-white p-4 rounded-lg max-w-md w-full relative">
        <button
          onClick={onClose}
          className="text-red-500 hover:text-red-700 absolute top-2 right-2"
        >
          &times;
        </button>
        <h2 className="text-2xl mb-4">{isFollowingList ? "Following" : "Followers"}</h2>
        <div className="space-y-4">
          {usersList.map(user => (
            <div key={user.uid} className="flex items-center justify-between">
              <div className="flex items-center">
                <img
                  src={user.profilePic || "https://via.placeholder.com/50"}
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="ml-4">
                  <p className="font-bold">{user.username}</p>
                  <p className="text-gray-400">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => handleFollowToggle(user.uid)}
                className={`px-4 py-2 rounded ${
                  user.isFollowing ? 'bg-red-500' : 'bg-blue-500'
                }`}
              >
                {user.isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Modal;
