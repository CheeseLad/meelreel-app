import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import SearchComponent from "../components/SearchComponent";
import FooterNav from "./FooterNav";

const SearchPage = () => {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchPosts = () => {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const postsArray = [];
        querySnapshot.forEach((doc) => {
          postsArray.push({ id: doc.id, ...doc.data() });
        });
        setPosts(postsArray);
      });
      return unsubscribe;
    };

    const fetchUsers = () => {
      const q = query(collection(db, "users"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const usersArray = [];
        querySnapshot.forEach((doc) => {
          usersArray.push({ id: doc.id, ...doc.data() });
        });
        setUsers(usersArray);
      });
      return unsubscribe;
    };

    const unsubscribePosts = fetchPosts();
    const unsubscribeUsers = fetchUsers();

    return () => {
      unsubscribePosts();
      unsubscribeUsers();
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Search MealReel Posts and Profiles
        </h1>
      </header>
      <main className="container mx-auto p-4">
        <SearchComponent posts={posts} users={users} />
      </main>
      <FooterNav />
    </div>
  );
};

export default SearchPage;
