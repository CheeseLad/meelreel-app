import React, { useState, useEffect } from "react";
import { auth, db, storage } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Link } from "react-router-dom";
import FooterNav from "./FooterNav";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [profilePic, setProfilePic] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data());
          setProfilePic(userDoc.data().profilePic);
        }

        const q = query(
          collection(db, "posts"),
          where("userId", "==", auth.currentUser.uid),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const userPosts = [];
        querySnapshot.forEach((doc) => {
          userPosts.push({ id: doc.id, ...doc.data() });
        });
        setPosts(userPosts);
        setFilteredPosts(userPosts);
      }
    };

    fetchUserData();
  }, []);

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const storageRef = ref(storage, `profilePics/${auth.currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        profilePic: downloadURL,
      });

      setProfilePic(downloadURL);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    if (newFilter === "all") {
      setFilteredPosts(posts);
    } else {
      setFilteredPosts(posts.filter((post) => post.mealType === newFilter));
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="p-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          MealReel
        </Link>
      </header>
      <main className="container mx-auto p-4">
        <div className="bg-gray-800 rounded-lg p-8 mb-8">
          <div className="flex items-center mb-4">
            <div className="relative">
              <img
                src={profilePic || "https://via.placeholder.com/150"}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover"
              />
              <label className="absolute bottom-0 right-0 bg-white text-black p-1 rounded-full cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  onChange={handleProfilePicChange}
                  accept="image/*"
                />
                Edit
              </label>
            </div>
            <div className="ml-4">
              <h2 className="text-2xl font-bold">{user.username}</h2>
              <p className="text-gray-400">{user.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="font-bold text-xl">{posts.length}</p>
              <p className="text-gray-400">Posts</p>
            </div>
            <div>
              <p className="font-bold text-xl">0</p>
              <p className="text-gray-400">Followers</p>
            </div>
            <div>
              <p className="font-bold text-xl">0</p>
              <p className="text-gray-400">Following</p>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <select
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="bg-gray-800 text-white p-2 rounded"
          >
            <option value="all">All Posts</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {filteredPosts.map((post) => (
            <div key={post.id} className="aspect-w-1 aspect-h-1">
              <img
                src={post.imageUrl}
                alt={post.postName}
                className="object-cover w-full h-full rounded"
              />
            </div>
          ))}
        </div>
      </main>
      <FooterNav />
    </div>
  );
};

export default Profile;
