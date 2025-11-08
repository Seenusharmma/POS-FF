import React, { useEffect, useState } from "react";
import axios from "axios";
import FoodCard from "../components/FoodCard";
import { motion } from "framer-motion";
import { IoSearch } from "react-icons/io5";

// ✅ Use Vite environment variable (no quotes!)
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

const Menu = () => {
  const [foods, setFoods] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [suggestions, setSuggestions] = useState([]);

  // ✅ Fetch all foods from backend
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/foods`);
        setFoods(res.data);
        setFilteredFoods(res.data);
      } catch (err) {
        console.error("❌ Error fetching menu:", err);
      }
    };
    fetchFoods();
  }, []);

  // ✅ Extract categories dynamically
  const categories = ["All", ...new Set(foods.map((f) => f.category))];

  // ✅ Handle filter change
  const handleFilterChange = (type, value) => {
    if (type === "type") setTypeFilter(value);
    if (type === "category") setCategoryFilter(value);
  };

  // ✅ Apply filters & search
  useEffect(() => {
    let updatedFoods = [...foods];

    // Filter by type
    if (typeFilter !== "All") {
      updatedFoods = updatedFoods.filter(
        (f) => f.type.toLowerCase() === typeFilter.toLowerCase()
      );
    }

    // Filter by category
    if (categoryFilter !== "All") {
      updatedFoods = updatedFoods.filter(
        (f) => f.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      updatedFoods = updatedFoods.filter((f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredFoods(updatedFoods);
  }, [typeFilter, categoryFilter, searchQuery, foods]);

  // ✅ Live search suggestions
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim()) {
      const matched = foods
        .filter((f) =>
          f.name.toLowerCase().includes(query.toLowerCase().trim())
        )
        .slice(0, 5);
      setSuggestions(matched);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (name) => {
    setSearchQuery(name);
    setSuggestions([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff8f3] to-white">
      {/* 🔥 Hero Section */}
      <div className="relative text-center py-16 sm:py-24 overflow-hidden bg-gradient-to-r from-red-100 via-yellow-50 to-red-100 shadow-sm">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-red-700 drop-shadow-sm"
        >
          🍕 Discover Delicious Flavors
        </motion.h1>
        <p className="text-gray-600 mt-3 text-lg sm:text-xl">
          Explore our curated menu crafted with love ❤️
        </p>

        {/* 🔍 Search Bar */}
        <div className="relative w-11/12 sm:w-2/3 md:w-1/2 mx-auto mt-8">
          <div className="flex items-center bg-white shadow-md rounded-full px-4 py-2">
            <IoSearch className="text-gray-500 text-xl mr-2" />
            <input
              type="text"
              placeholder="Search for your favorite food..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="flex-1 p-2 outline-none text-gray-700 text-base bg-transparent"
            />
          </div>

          {/* Live Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <ul className="absolute w-full bg-white border border-gray-200 rounded-lg mt-2 shadow-lg z-20 max-h-60 overflow-y-auto">
              {suggestions.map((s) => (
                <li
                  key={s._id}
                  className="px-4 py-2 hover:bg-red-50 cursor-pointer text-gray-700"
                  onClick={() => handleSuggestionClick(s.name)}
                >
                  {s.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 🎛 Filters Section */}
      <div className="flex flex-col gap-6 py-10 px-4 sm:px-10">
        {/* Type Filter */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          {["All", "Veg", "Non-Veg"].map((type) => (
            <motion.button
              whileTap={{ scale: 0.9 }}
              key={type}
              onClick={() => handleFilterChange("type", type)}
              className={`px-5 sm:px-7 py-2 sm:py-3 rounded-full font-semibold border text-sm sm:text-base transition-all shadow-sm ${
                typeFilter === type
                  ? "bg-red-600 text-white border-red-600"
                  : "border-gray-300 text-gray-700 hover:bg-red-50"
              }`}
            >
              {type === "Veg" ? "🌿 Veg" : type === "Non-Veg" ? "🍗 Non-Veg" : "🍴 All"}
            </motion.button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          {categories.map((cat) => (
            <motion.button
              whileTap={{ scale: 0.9 }}
              key={cat}
              onClick={() => handleFilterChange("category", cat)}
              className={`px-5 sm:px-7 py-2 sm:py-3 rounded-full font-semibold border text-sm sm:text-base transition-all shadow-sm ${
                categoryFilter === cat
                  ? "bg-yellow-500 text-white border-yellow-500"
                  : "border-gray-300 text-gray-700 hover:bg-yellow-50"
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </div>

      {/* 🍔 Food Grid Section */}
      <div className="px-4 sm:px-10 pb-16">
        {filteredFoods.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-600 mt-12 text-base sm:text-lg"
          >
            No foods match your selection 🍴
          </motion.p>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8"
          >
            {filteredFoods.map((food) => (
              <motion.div
                key={food._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <FoodCard food={food} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Menu;
