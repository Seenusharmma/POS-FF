import React from "react";

const FoodCard = ({ food }) => {
  // ✅ Safely handle Cloudinary image structure
  const imageSrc =
    food.image?.url && food.image.url.startsWith("http")
      ? food.image.url
      : "https://placehold.co/300x200?text=No+Image";

  return (
    <div
      className={`relative bg-white rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 overflow-hidden border border-gray-100 ${
        !food.available ? "opacity-70" : ""
      }`}
    >
      {/* ✅ Food Image */}
      <img
        src={imageSrc}
        alt={food.name}
        className="h-48 w-full object-cover transition-transform duration-300 hover:scale-105"
        loading="lazy"
        onError={(e) =>
          (e.target.src = "https://placehold.co/300x200?text=No+Image")
        }
      />

      {/* ❌ Overlay when unavailable */}
      {!food.available && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-semibold text-lg">
          Out of Stock
        </div>
      )}

      {/* ✅ Content */}
      <div className="p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800 truncate">
            {food.name}
          </h3>
          <span
            className={`text-sm font-semibold ${
              food.type?.toLowerCase() === "veg"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {food.type?.toLowerCase() === "veg" ? "🌿 Veg" : "🍗 Non-Veg"}
          </span>
        </div>

        <p className="text-gray-500 text-sm mt-1 capitalize truncate">
          {food.category || "Uncategorized"}
        </p>

        <div className="flex justify-between items-center mt-3">
          <p className="text-red-600 font-semibold text-lg">₹{food.price}</p>

          {/* Small visual indicator for availability */}
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              food.available ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
            }`}
          >
            {food.available ? "Available" : "Out of Stock"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
