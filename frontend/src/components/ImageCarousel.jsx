import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { motion } from "framer-motion";

import "swiper/css";
import "swiper/css/pagination";

const ImageCarousel = () => {
  const slides = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
      title: "Delicious Meals",
      desc: "Experience a world of flavor in every bite.",
      btn: "Order Now",
    },
    {
      id: 2,
      image:
        "https://plus.unsplash.com/premium_photo-1661883237884-263e8de8869b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1189",
      title: "Cozy Ambience",
      desc: "Dine in comfort and style with friends and family.",
      btn: "View Menu",
    },
    {
      id: 3,
      image:
        "https://media.istockphoto.com/id/1155240408/photo/table-filled-with-large-variety-of-food.jpg?s=612x612&w=0&k=20&c=uJEbKmR3wOxwdhQR_36as5WeP6_HDqfU-QmAq63OVEE=",
      title: "Fresh Ingredients",
      desc: "Only the freshest produce goes into every dish.",
      btn: "Order Now",
    },
    {
      id: 4,
      image:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
      title: "Perfect for Every Occasion",
      desc: "Celebrate life’s moments with our chef’s special menu.",
      btn: "View Menu",
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto mt-10 px-4 sm:px-6 md:px-10 bg-[#fff8eb] shadow-lg pb-5">
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={30}
        centeredSlides={true}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        loop={true}
        className="rounded-3xl overflow-hidden shadow-2xl"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative w-full h-[260px] sm:h-[420px] md:h-[520px] overflow-hidden">
              {/* Zoom animation for background image */}
              <motion.img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
                loading="lazy"
                initial={{ scale: 1 }}
                animate={{ scale: 1.08 }}
                transition={{
                  duration: 4,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />

              {/* Beautiful gradient overlay */}
              <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/40 to-transparent flex flex-col justify-center text-left px-6 sm:px-12">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-[#f8be52] drop-shadow-xl"
                >
                  {slide.title}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="text-sm sm:text-lg md:text-xl text-gray-100 mt-3 max-w-lg"
                >
                  {slide.desc}
                </motion.p>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-[2.5px] mt-5 w-30 sm:w-32 bg-[#fcc660] text-black font-semibold text-md sm:text-base py-1.5 rounded-full shadow-md hover:bg-[#fbcc76] transition-all text-center opacity-90"
                >
                  {slide.btn}
                </motion.button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ImageCarousel;
