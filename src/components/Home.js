import React, { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth, db, storage } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { UserCircleIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import FooterNav from "./FooterNav";

const Home = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [file, setFile] = useState(null);
  const [postName, setPostName] = useState("");
  const [postDescription, setPostDescription] = useState("");
  const [mealType, setMealType] = useState("");
  const [posts, setPosts] = useState([]);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchUsername = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          setUsername(userDoc.data().username);
        }
      }
    };
    fetchUsername();

    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsArray = [];
      querySnapshot.forEach((doc) => {
        postsArray.push({ id: doc.id, ...doc.data() });
      });
      setPosts(postsArray);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    try {
      const storageRef = ref(
        storage,
        `berealImages/${Date.now()}_${file.name}`
      );
      await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(storageRef);

      await addDoc(collection(db, "posts"), {
        userId: auth.currentUser.uid,
        username: username,
        postName,
        postDescription,
        mealType,
        imageUrl,
        createdAt: serverTimestamp(),
      });

      setFile(null);
      setPostName("");
      setPostDescription("");
      setMealType("");
      setShowForm(false);
    } catch (error) {
      console.error("Error creating post: ", error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">MealReel</h1>
        <div className="flex items-center">
          <Link to="/search" className="mr-4">
            <MagnifyingGlassIcon className="h-8 w-8 text-white cursor-pointer" />
          </Link>
          <Link to="/profile" className="mr-4">
            <UserCircleIcon className="h-8 w-8 text-white" />
          </Link>
          <button
            onClick={handleLogout}
            className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="container mx-auto p-4">
        <div className="bg-gray-800 rounded-lg p-4 mb-8">
          <h2 className="text-xl font-semibold mb-2">Your MealReel</h2>
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200"
            >
              Take MealReel
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full"
              />
              <input
                type="text"
                placeholder="Post Name"
                value={postName}
                onChange={(e) => setPostName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded"
              />
              <textarea
                placeholder="Post Description"
                value={postDescription}
                onChange={(e) => setPostDescription(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded"
              />
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded"
              >
                <option value="">Select Meal Type</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
              <button
                type="submit"
                className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200"
              >
                Create Post
              </button>
            </form>
          )}
        </div>

        <div className="space-y-8">
          {posts.map((post) => (
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
      </main>
      <FooterNav />
    </div>
  );
};

export default Home;
