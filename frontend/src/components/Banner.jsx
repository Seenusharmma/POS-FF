import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Apple from "../assets/Apple.png";
import Kiwi from "../assets/kiwi.png";
import Leaf from "../assets/leaf.png";
import Lemon from "../assets/lemon.png";
import Tomato from "../assets/tomato.png";

const Banner = () => {
  return (
    <div className="relative container py-20 overflow-hidden">
      {/* Heading */}
      <div className="text-center mb-12">
        <h1 className="tracking-wider text-3xl sm:text-4xl font-bold text-dark">
          Taste The Variety Difference
        </h1>
      </div>

      {/* Content Section */}
      <div className="space-y-16 relative z-10 px-4 sm:px-12 text-lg leading-relaxed text-gray-800 mt-10">
        {/* Section 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-justify">
              We understand that{" "}
              <span className="text-[#f9b12b] font-semibold">time</span> is the
              most precious ingredient in the modern world. That’s why{" "}
              <span className="text-[#f9b12b] font-semibold">Food Fantasy</span>{" "}
              offers healthy, chef-prepared meals — giving you the freedom to
              enjoy great food without the stress of shopping or cooking.
            </p>
          </div>
        </div>

        {/* Section 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
          <div className="hidden sm:block"></div>
          <div>
            <p className="text-justify mt-6">
              From sizzling appetizers to mouth-watering main courses and{" "}
              <span className="text-[#f9b12b] font-semibold">decadent</span>{" "}
              desserts, every dish is crafted using fresh, locally sourced
              ingredients. Whether you crave something classic or feel
              adventurous, our chefs have something truly{" "}
              <span className="text-[#f9b12b] font-semibold">special</span> for
              you.
            </p>
          </div>
        </div>
      </div>

      {/* Button Section */}
      <div className="flex items-center justify-center mt-16 relative z-10">
        <motion.div
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Link
            to="/menu"
            className="bg-black border border-yellow-200/70 opacity-90 h-[50px] px-8 py-2 
                       text-[#fabc49] text-lg font-bold rounded-lg 
                       shadow-md hover:shadow-yellow-400/40"
          >
            Find Your Appetite!
          </Link>
        </motion.div>
      </div>

      {/* Decorative Fruits */}
      {/* Leaf */}
      <img
        src={Leaf}
        alt="Leaf"
        className="absolute top-8 left-6 sm:top-10 sm:left-14 max-w-[120px] sm:max-w-[150px] opacity-90"
      />

      {/* Tomato */}
      <img
        src={Tomato}
        alt="Tomato"
        className="absolute bottom-20 left-6 sm:bottom-24 sm:left-14 max-w-[120px] sm:max-w-[150px] opacity-90"
      />

      {/* Lemon */}
      <img
        src={Lemon}
        alt="Lemon"
        className="absolute top-10 right-6 sm:top-12 sm:right-14 max-w-[120px] sm:max-w-[150px] opacity-90"
      />

      {/* Apple */}
      <img
        src={Apple}
        alt="Apple"
        className="absolute bottom-10 right-6 sm:bottom-14 sm:right-14 max-w-[120px] sm:max-w-[150px] opacity-90"
      />

      {/* Kiwi */}
      <img
        src={Kiwi}
        alt="Kiwi"
        className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 
                   max-w-[150px] sm:max-w-[180px] opacity-90"
      />
    </div>
  );
};

export default Banner;
