import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import {
  FaHome,
  FaUtensils,
  FaShoppingBag,
  FaHistory,
  FaCrown,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const ADMIN_EMAIL = "roshansharma7250@gmail.com";
  const isAdmin = user?.email === ADMIN_EMAIL;

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  const menuItems = [
    { name: "Home", icon: <FaHome />, path: "/" },
    { name: "Menu", icon: <FaUtensils />, path: "/menu" },
    { name: "Order", icon: <FaShoppingBag />, path: "/order" },
    { name: "History", icon: <FaHistory />, path: "/history" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-lg shadow-lg border-b bg-black border-yellow-200/70 opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 flex justify-between items-center h-16">
        {/* 🍴 Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Link
            to="/"
            onClick={closeMenu}
            className="text-[#f8be52] text-2xl sm:text-3xl font-bold tracking-wide flex items-center gap-2"
          >
            .{" "}
            <span className="text-[#f8be52] hover:text-[#f2d988]">
              Food Fantasy
            </span>
          </Link>
        </motion.div>

        {/* 🌐 Desktop Menu */}
        <div className="hidden md:flex gap-8 items-center text-[#f8be52] font-medium">
          {menuItems.map((item, i) => (
            <Link
              key={i}
              to={item.path}
              className="relative group flex items-center gap-2 hover:text-[#f8be52] transition-all"
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.name}</span>
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-[#f8be52] group-hover:w-full transition-all duration-300"></span>
            </Link>
          ))}

          {/* 👑 Admin button only for admin */}
          {isAdmin && (
            <Link
              to="/admin"
              className="relative group flex items-center gap-2 text-yellow-200 font-semibold"
            >
              <FaCrown />
              Admin
              <span className="absolute left-0 -bottom-1 w-0 ht-[2px] bg-yellow-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
          )}

          {/* 👤 User Info */}
          {user ? (
            <div className="flex items-center gap-4 ml-6">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="bg-white/20 text-sm px-3 py-1 rounded-full text-yellow-100"
              >
                {user.email}
              </motion.div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={logout}
                className="text-black bg-[#f8be52] font-semibold px-4 py-1 rounded-full hover:bg-[#dabd70] transition"
              >
                Logout
              </motion.button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-black bg-[#f8be52] font-semibold px-4 py-1 rounded-full hover:bg-[#dabd70] transition"
            >
              Login
            </Link>
          )}
        </div>

        {/* 📱 Mobile Menu Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleMenu}
          className="md:hidden text-[#f8be52] text-3xl focus:outline-none"
        >
          {menuOpen ? <HiX /> : <HiMenuAlt3 />}
        </motion.button>
      </div>

      {/* 📱 Animated Mobile Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.3 }}
            className="md:hidden text-[#f8be52] flex flex-col items-center py-6 space-y-5 shadow-lg border-t border-orange-200/70"
          >
            {menuItems.map((item, i) => (
              <Link
                key={i}
                to={item.path}
                onClick={closeMenu}
                className="text-lg font-medium flex items-center gap-3 hover:text-yellow-300 transition"
              >
                {item.icon} {item.name}
              </Link>
            ))}

            {/* 👑 Admin */}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={closeMenu}
                className="text-lg font-semibold text-yellow-300 flex items-center gap-2 hover:text-yellow-400 transition"
              >
                <FaCrown /> Admin
              </Link>
            )}

            {user ? (
              <div className="flex flex-col items-center gap-3">
                <span className="text-sm bg-white/20 px-4 py-1 rounded-full">
                  {user.email}
                </span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                  className="text-black bg-[#f8be52] font-semibold px-5 py-1 rounded-full hover:bg-yellow-100 transition"
                >
                  Logout
                </motion.button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={closeMenu}
                className="text-black bg-[#f8be52] font-semibold px-5 py-1 rounded-full hover:bg-yellow-100 transition"
              >
                Login
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
