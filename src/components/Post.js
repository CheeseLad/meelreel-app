import React, { useState, useEffect } from "react";
import { auth, db, storage } from "../firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";

const Post = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [postName, setPostName] = useState("");
  const [postDescription, setPostDescription] = useState("");
  const [mealType, setMealType] = useState("");
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
  }, []);

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

      navigate("/");
    } catch (error) {
      console.error("Error creating post: ", error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <h2 className="text-2xl font-bold mb-4">Create a New Post</h2>
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
    </div>
  );
};

export default Post;