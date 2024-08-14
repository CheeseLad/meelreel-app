import React, { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc
} from "firebase/firestore";
import { UserCircleIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import FooterNav from "./FooterNav";
import CommentSection from "./CommentSection";
import LikeButton from "./LikeButton";

const Home = () => {
  const navigate = useNavigate();
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

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">MealReel</h1>
        <div className="flex items-center">
          <Link to="/search" className="mr-4">
            <MagnifyingGlassIcon className="h-8 w-8 text-white cursor-pointer" />
          </Link>
          <Link to={`/profile/${username}`} className="mr-4">
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
        <div className="space-y-8">
          {posts.map((post) => (
            <div key={post.id} className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">{post.postName}</h3>
              <p className="text-sm text-gray-400 mb-2">
                Posted by:{" "}
                <Link
                  to={`/profile/${post.username}`}
                  className="text-blue-500 hover:underline"
                >
                  {post.username}
                </Link>
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

              <LikeButton postId={post.id} />
              <CommentSection postId={post.id} username={username} />
            </div>
          ))}
        </div>
      </main>
      <FooterNav />
    </div>
  );
};

export default Home;
