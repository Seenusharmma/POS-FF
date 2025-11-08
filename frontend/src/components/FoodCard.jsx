import React from "react";

const FoodCard = ({ food }) => {
  const imageSrc =
    food.image && food.image.startsWith("http")
      ? food.image
      : "https://placehold.co/300x200?text=No+Image";

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 overflow-hidden border border-gray-100">
      <img
        src={imageSrc}
        alt={food.name}
        className="h-48 w-full object-cover"
        loading="lazy"
      />
      <div className="p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">{food.name}</h3>
          <span
            className={`text-sm font-semibold ${
              food.type === "Veg" ? "text-green-600" : "text-red-600"
            }`}
          >
            {food.type === "Veg" ? "🌿 Veg" : "🍗 Non-Veg"}
          </span>
        </div>
        <p className="text-gray-500 text-sm mt-1 capitalize">{food.category}</p>
        <p className="text-red-600 font-semibold mt-3 text-lg">₹{food.price}</p>
      </div>
    </div>
  );
};

export default FoodCard;
