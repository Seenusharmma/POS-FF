import React from "react";
import { motion } from "framer-motion";
import ImageCarousel from "../components/ImageCarousel";
import Hero from "../assets/hero.png";
import Button from "../components/Button";
import Banner from "../components/Banner";

const Home = () => {
  return (
    <>
      {" "}
      <div className="relative bg-amber-100 overflow-hidden">
        {/* Background Carousel */}
        <div className="w-full pt-10">
          <ImageCarousel />
        </div>

        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 place-items-center min-h-[600px]">
            {/* Text Content Section */}
            <motion.div
              className="space-y-7 text-dark order-2 sm:order-1"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <h1 className="text-5xl ml-12">
                Welcome To <br />{" "}
                <span className="font-semibold text-6xl text-[#f9b12b] font-serif">
                  Food Fantasy
                </span>
              </h1>
              <p className="ml-12 text-xl font-light">
                Enjoy the best cuisines in town — choose your table, explore our
                diverse menu, and order your favorite dishes in just a few
                clicks.
              </p>
              <div className="ml-12">
                <Button />
              </div>
            </motion.div>

            {/* Image Section */}
            <motion.div
              className="order-1 sm:order-2"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <img src={Hero} alt="Hero" />
            </motion.div>
          </div>
        </div>
      </div>{" "}
      <Banner />
    </>
  );
};

export default Home;
