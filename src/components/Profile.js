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
  arrayUnion,
  arrayRemove
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Link, useParams } from "react-router-dom";
import FooterNav from "./FooterNav";
import Modal from "./Modal"; // Ensure this path is correct

const Profile = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("followers"); // or "following"
  const [modalUsers, setModalUsers] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        const userId = querySnapshot.docs[0].id;
        setUser({ ...userData, uid: userId });

        setIsOwnProfile(auth.currentUser && auth.currentUser.uid === userId);

        const postsQuery = query(
          collection(db, "posts"),
          where("userId", "==", userId),
          orderBy("createdAt", "desc")
        );
        const postsSnapshot = await getDocs(postsQuery);
        const userPosts = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPosts(userPosts);
        setFilteredPosts(userPosts);

        if (auth.currentUser) {
          const currentUserDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
          const currentUserData = currentUserDoc.data();
          if (currentUserData.following?.includes(userId)) {
            setIsFollowing(true);
          } else {
            setIsFollowing(false);
          }
        }

        // Fetch followers and following counts
        const userDoc = await getDoc(doc(db, "users", userId));
        const userFollowers = userDoc.data().followers || [];
        const userFollowing = userDoc.data().following || [];

        setFollowersCount(userFollowers.length);
        setFollowingCount(userFollowing.length);
      } else {
        setUser(null);
      }
    };

    fetchUserData();
  }, [username]);

  const handleProfilePicChange = async (e) => {
    if (!isOwnProfile) return;

    const file = e.target.files[0];
    if (file) {
      const storageRef = ref(storage, `profilePics/${user.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      await updateDoc(doc(db, "users", user.uid), {
        profilePic: downloadURL,
      });

      setUser(prevUser => ({ ...prevUser, profilePic: downloadURL }));
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

  const handleFollowToggle = async () => {
    if (!auth.currentUser) return;

    const currentUserId = auth.currentUser.uid;
    const userRef = doc(db, "users", user.uid);
    const currentUserRef = doc(db, "users", currentUserId);

    if (isFollowing) {
      await updateDoc(currentUserRef, {
        following: arrayRemove(user.uid)
      });
      await updateDoc(userRef, {
        followers: arrayRemove(currentUserId)
      });
      setIsFollowing(false);
      setFollowersCount(prevCount => prevCount - 1);
      setFollowingCount(prevCount => prevCount - 1);
    } else {
      await updateDoc(currentUserRef, {
        following: arrayUnion(user.uid)
      });
      await updateDoc(userRef, {
        followers: arrayUnion(currentUserId)
      });
      setIsFollowing(true);
      setFollowersCount(prevCount => prevCount + 1);
      setFollowingCount(prevCount => prevCount + 1);
    }
  };

  const openModal = async (type) => {
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

    if (type === "followers") {
      const followers = userData.followers || [];
      const followersData = await Promise.all(followers.map(async (uid) => {
        const followerDoc = await getDoc(doc(db, "users", uid));
        return { ...followerDoc.data(), uid, isFollowing: followerDoc.data().following.includes(auth.currentUser.uid) };
      }));
      setModalUsers(followersData);
    } else {
      const following = userData.following || [];
      const followingData = await Promise.all(following.map(async (uid) => {
        const followingDoc = await getDoc(doc(db, "users", uid));
        return { ...followingDoc.data(), uid, isFollowing: followingDoc.data().following.includes(auth.currentUser.uid) };
      }));
      setModalUsers(followingData);
    }
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalUsers([]);
  };

  if (!user) {
    return <div>User not found</div>;
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
                src={user.profilePic || "https://via.placeholder.com/150"}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover"
              />
              {isOwnProfile && (
                <label className="absolute bottom-0 right-0 bg-white text-black p-1 rounded-full cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleProfilePicChange}
                    accept="image/*"
                  />
                  Edit
                </label>
              )}
            </div>
            <div className="ml-4">
              <h2 className="text-2xl font-bold">{user.username}</h2>
              <p className="text-gray-400">{user.email}</p>
              {!isOwnProfile && (
                <button
                  onClick={handleFollowToggle}
                  className={`mt-4 px-4 py-2 rounded ${
                    isFollowing ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="font-bold text-xl">{posts.length}</p>
              <p className="text-gray-400">Posts</p>
            </div>
            <div>
              <p
                onClick={() => openModal("followers")}
                className="font-bold text-xl cursor-pointer"
              >
                {followersCount}
              </p>
              <p className="text-gray-400">Followers</p>
            </div>
            <div>
              <p
                onClick={() => openModal("following")}
                className="font-bold text-xl cursor-pointer"
              >
                {followingCount}
              </p>
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
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        usersList={modalUsers}
        isFollowingList={modalType === "following"}
      />
    </div>
  );
};

export default Profile;
