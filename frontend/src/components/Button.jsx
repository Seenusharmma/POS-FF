import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Button = () => {
  return (
    <div className="flex items-center justify-start">
      <motion.div
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Link
          to="/menu"
          className="bg-black border border-yellow-200/70 opacity-90 h-[50px] px-6 py-2 
                     text-[#fabc49] text-lg font-bold rounded-lg 
                     shadow-md"
        >
          View Menu
        </Link>
      </motion.div>
    </div>
  );
};

export default Button;
