import React from "react";
import { Link } from "react-router-dom";
import {
  HomeIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  BookOpenIcon,
  UserCircleIcon,
} from "@heroicons/react/24/solid";

const FooterNav = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 flex justify-between items-center border-t border-gray-700">
      <Link to="/" className="flex flex-col items-center">
        <HomeIcon className="h-6 w-6" />
        <span className="text-xs mt-1">Home</span>
      </Link>
      <Link to="/search" className="flex flex-col items-center">
        <MagnifyingGlassIcon className="h-6 w-6" />
        <span className="text-xs mt-1">Search</span>
      </Link>
      <Link to="/post" className="flex flex-col items-center">
        <PlusIcon className="h-6 w-6" />
        <span className="text-xs mt-1">Post</span>
      </Link>
      <Link to="/recipes" className="flex flex-col items-center">
        <BookOpenIcon className="h-6 w-6" />
        <span className="text-xs mt-1">Recipes</span>
      </Link>
      <Link to="/profile" className="flex flex-col items-center">
        <UserCircleIcon className="h-6 w-6" />
        <span className="text-xs mt-1">Profile</span>
      </Link>
    </footer>
  );
};

export default FooterNav;
