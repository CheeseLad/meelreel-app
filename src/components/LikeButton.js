// src/components/LikeButton.js
import React, { useState, useEffect } from "react";
import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase";
import { HeartIcon, HeartIcon as HeartIconOutline } from "@heroicons/react/24/outline";

const LikeButton = ({ postId }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    const postRef = doc(db, "posts", postId);
    const unsubscribe = onSnapshot(postRef, (doc) => {
      const postData = doc.data();
      if (postData) {
        setLikesCount(postData.likes ? postData.likes.length : 0);
        if (auth.currentUser) {
          setLiked(postData.likes?.includes(auth.currentUser.uid));
        }
      }
    });

    return () => unsubscribe();
  }, [postId]);

  const handleLikeToggle = async () => {
    if (!auth.currentUser) return;

    const postRef = doc(db, "posts", postId);

    try {
      if (liked) {
        await updateDoc(postRef, {
          likes: arrayRemove(auth.currentUser.uid),
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(auth.currentUser.uid),
        });
      }
      setLiked(!liked);
    } catch (error) {
      console.error("Error updating like: ", error);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleLikeToggle}
        className={`p-2 rounded-full ${liked ? 'text-red-500' : 'text-gray-400'}`}
      >
        {liked ? <HeartIcon className="h-6 w-6" /> : <HeartIconOutline className="h-6 w-6" />}
      </button>
      <span className="text-sm text-gray-400">{likesCount} Likes</span>
    </div>
  );
};

export default LikeButton;
