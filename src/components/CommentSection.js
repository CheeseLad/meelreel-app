// src/components/CommentSection.js
import React, { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import { Link } from "react-router-dom";

const CommentSection = ({ postId, username }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);

  useEffect(() => {
    const commentRef = collection(db, "posts", postId, "comments");
    const unsubscribe = onSnapshot(commentRef, (snapshot) => {
      const commentsArray = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComments(commentsArray);
    });

    return () => unsubscribe();
  }, [postId]);

  const handleCommentSubmit = async () => {
    if (newComment.trim() === "") return;

    const commentRef = collection(db, "posts", postId, "comments");

    try {
      await addDoc(commentRef, {
        text: newComment,
        username: username,
        timestamp: Timestamp.fromDate(new Date()),
      });
      setNewComment(""); // Clear the input field after submission
    } catch (error) {
      console.error("Error adding comment: ", error);
    }
  };

  return (
    <div className="mt-4">
      <h4 className="text-md font-semibold mb-2">Comments</h4>
      <div className="space-y-2">
        {/* Display comments */}
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-700 rounded-lg p-2">
            <p className="text-sm text-gray-300">
              <strong><Link
                  to={`/profile/${comment.username}`}
                  className="text-blue-500 hover:underline"
                >
                  {comment.username}
                </Link>:</strong> {comment.text}
            </p>
          </div>
        ))}
      </div>

      {/* Add comment */}
      {showCommentBox && (
        <div className="mt-4 flex">
          <input
            type="text"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-grow px-3 py-2 bg-gray-700 rounded-l"
          />
          <button
            onClick={handleCommentSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded-r"
          >
            Submit
          </button>
        </div>
      )}
      <button
        onClick={() => setShowCommentBox(!showCommentBox)}
        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
      >
        {showCommentBox ? 'Hide Comment Box' : 'Add Comment'}
      </button>
    </div>
  );
};

export default CommentSection;
