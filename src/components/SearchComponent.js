import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";

const SearchComponent = ({ posts, users }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [followingUsers, setFollowingUsers] = useState({}); // To track follow/unfollow status

  useEffect(() => {
    const filterPosts = (query) => {
      const lowercasedQuery = query.toLowerCase();
      const filtered = posts.filter(
        (post) =>
          post.postName.toLowerCase().includes(lowercasedQuery) ||
          post.postDescription.toLowerCase().includes(lowercasedQuery) ||
          post.username.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredPosts(filtered);
    };

    const filterUsers = (query) => {
      const lowercasedQuery = query.toLowerCase();
      const filtered = users.filter(
        (user) =>
          user.username.toLowerCase().includes(lowercasedQuery) ||
          user.email.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredUsers(filtered);
    };

    filterPosts(searchQuery);
    filterUsers(searchQuery);
  }, [searchQuery, posts, users]);

  useEffect(() => {
    const fetchFollowingStatus = async () => {
      if (auth.currentUser) {
        const currentUserRef = doc(db, "users", auth.currentUser.uid);
        const currentUserDoc = await getDoc(currentUserRef);
        const currentUserData = currentUserDoc.data();

        if (currentUserData && currentUserData.following) {
          const followingMap = {};
          currentUserData.following.forEach((userId) => {
            followingMap[userId] = true;
          });
          setFollowingUsers(followingMap);
        }
      }
    };

    fetchFollowingStatus();
  }, [users]);

  const handleFollowToggle = async (userId) => {
    if (!auth.currentUser) return;

    const currentUserId = auth.currentUser.uid;
    const userRef = doc(db, "users", userId);
    const currentUserRef = doc(db, "users", currentUserId);

    try {
      if (followingUsers[userId]) {
        await updateDoc(currentUserRef, {
          following: arrayRemove(userId)
        });
        await updateDoc(userRef, {
          followers: arrayRemove(currentUserId)
        });
        setFollowingUsers(prev => ({ ...prev, [userId]: false }));
      } else {
        await updateDoc(currentUserRef, {
          following: arrayUnion(userId)
        });
        await updateDoc(userRef, {
          followers: arrayUnion(currentUserId)
        });
        setFollowingUsers(prev => ({ ...prev, [userId]: true }));
      }
    } catch (error) {
      console.error("Error updating follow status: ", error);
    }
  };

  return (
    <div>
      <div className="bg-gray-800 rounded-lg p-4 mb-8">
        <h2 className="text-xl font-semibold mb-2">Search</h2>
        <input
          type="text"
          placeholder="Search posts and profiles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 rounded"
        />
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Users</h3>
        <div className="flex flex-wrap gap-4">
          {filteredUsers.map((user) => (
            <div key={user.uid} className="bg-gray-800 rounded-lg p-4 w-64 flex items-center justify-between">
              <div className="flex items-center">
                <img
                  src={user.profilePic || "https://via.placeholder.com/50"}
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <p className="text-lg font-semibold">{user.username}</p>
              </div>
              <button
                onClick={() => handleFollowToggle(user.uid)}
                className={`px-4 py-2 rounded ${
                  followingUsers[user.uid] ? 'bg-red-500' : 'bg-blue-500'
                }`}
              >
                {followingUsers[user.uid] ? 'Unfollow' : 'Follow'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Posts</h3>
        <div className="space-y-8">
          {filteredPosts.map((post) => (
            <div key={post.id} className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">{post.postName}</h3>
              <p className="text-sm text-gray-400 mb-2">
                Posted by: {post.username}
              </p>
              <img
                src={post.imageUrl}
                alt={post.postName}
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
              <p className="mb-2">{post.postDescription}</p>
              <p className="text-sm text-gray-400">
                Meal Type: {post.mealType}
              </p>
              <p className="text-sm text-gray-400">
                Posted on:{" "}
                {post.createdAt
                  ? new Date(post.createdAt.seconds * 1000).toLocaleString()
                  : "Date unavailable"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchComponent;
