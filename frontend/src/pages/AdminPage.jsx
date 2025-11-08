import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_BASE || "https://pos-ff-1.onrender.com";
const socket = io(API_BASE, { transports: ["websocket"], reconnection: true });

const AdminPage = () => {
  const [foods, setFoods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [foodForm, setFoodForm] = useState({
    name: "",
    category: "",
    type: "",
    price: "",
    available: true,
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [highlightedOrder, setHighlightedOrder] = useState(null);
  const audioRef = useRef(null);

  // ✅ Fetch all foods and orders
  const getAllData = async () => {
    try {
      const [foodsRes, ordersRes] = await Promise.all([
        axios.get(`${API_BASE}/api/foods`),
        axios.get(`${API_BASE}/api/orders`),
      ]);
      setFoods(foodsRes.data);
      setOrders(ordersRes.data);
    } catch (error) {
      console.error("❌ Failed to load data:", error);
      toast.error("Failed to load data");
    }
  };

  // ✅ Initialize Socket.IO
  useEffect(() => {
    getAllData();

    socket.on("newOrderPlaced", (newOrder) => {
      toast.success(`🆕 New Order: ${newOrder.foodName} (Table ${newOrder.tableNumber})`);
      playSound();
      setOrders((prev) => [newOrder, ...prev]);
      setHighlightedOrder(newOrder._id);
      setTimeout(() => setHighlightedOrder(null), 3000);
    });

    socket.on("orderStatusChanged", (updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) =>
          o._id === updatedOrder._id ? { ...o, status: updatedOrder.status } : o
        )
      );
    });

    socket.on("newFoodAdded", (newFood) => {
      setFoods((prev) => [newFood, ...prev]);
      toast.success(`🍛 New Food Added: ${newFood.name}`);
    });

    socket.on("foodUpdated", (updatedFood) => {
      setFoods((prev) => prev.map((f) => (f._id === updatedFood._id ? updatedFood : f)));
      toast(`🔄 Updated: ${updatedFood.name}`, { icon: "🍽️" });
    });

    socket.on("foodDeleted", (id) => {
      setFoods((prev) => prev.filter((f) => f._id !== id));
      toast.error("❌ Food deleted");
    });

    return () => {
      socket.off("newOrderPlaced");
      socket.off("orderStatusChanged");
      socket.off("newFoodAdded");
      socket.off("foodUpdated");
      socket.off("foodDeleted");
    };
  }, []);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  const handleChange = (e) =>
    setFoodForm({ ...foodForm, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  // ✅ Save or update food (Cloudinary handled in backend)
  const saveFood = async () => {
    if (!foodForm.name || !foodForm.price) {
      toast.error("⚠️ Please fill out name and price fields");
      return;
    }
    if (isNaN(foodForm.price)) {
      toast.error("💰 Price must be a valid number!");
      return;
    }

    try {
      const formData = new FormData();
      Object.entries(foodForm).forEach(([key, val]) => formData.append(key, val));
      if (image) formData.append("image", image);

      setIsUploading(true);
      setUploadProgress(0);

      let res;
      if (editMode) {
        res = await axios.put(`${API_BASE}/api/foods/${editId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (e) => {
            const percent = Math.round((e.loaded * 100) / e.total);
            setUploadProgress(percent);
          },
        });
        toast.success("✅ Food updated successfully!");
      } else {
        res = await axios.post(`${API_BASE}/api/foods`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (e) => {
            const percent = Math.round((e.loaded * 100) / e.total);
            setUploadProgress(percent);
          },
        });
        toast.success("✅ Food added successfully!");
      }

      socket.emit("foodUpdated", res.data.food || res.data);
      resetForm();
      getAllData();
    } catch (error) {
      console.error("❌ Error saving food:", error);
      toast.error("Failed to save food");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setFoodForm({ name: "", category: "", type: "", price: "", available: true });
    setImage(null);
    setPreview(null);
    setEditMode(false);
    setEditId(null);
    setUploadProgress(0);
  };

  const editFood = (food) => {
    setFoodForm({
      name: food.name,
      category: food.category,
      type: food.type,
      price: food.price,
      available: food.available,
    });
    setPreview(food.image?.url || food.image || null);
    setEditMode(true);
    setEditId(food._id);
  };

  const deleteFood = async (id) => {
    if (!window.confirm("Delete this food item?")) return;
    try {
      await axios.delete(`${API_BASE}/api/foods/${id}`);
      socket.emit("foodDeleted", id);
      toast.success("🗑 Food deleted successfully!");
      getAllData();
    } catch {
      toast.error("Failed to delete food");
    }
  };

  const toggleAvailability = async (id, available) => {
    try {
      const res = await axios.put(`${API_BASE}/api/foods/${id}`, { available });
      setFoods((prev) =>
        prev.map((f) => (f._id === id ? { ...f, available: res.data.available } : f))
      );
      socket.emit("foodUpdated", res.data);
      toast.success(
        `${res.data.name} is now ${res.data.available ? "Available" : "Out of Stock"}`
      );
    } catch {
      toast.error("Failed to update availability");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await axios.put(`${API_BASE}/api/orders/${id}`, { status });
      socket.emit("orderUpdated", res.data);
      toast(`Order marked as "${status}"`, { icon: "✅" });
      getAllData();
    } catch {
      toast.error("Failed to update order");
    }
  };

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto w-full">
      <Toaster />
      <audio
        ref={audioRef}
        src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
        preload="auto"
      />

      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-red-700 text-center sm:text-left">
        👨‍🍳 Admin Dashboard
      </h2>

      {/* 🧾 Add/Edit Food Section */}
      <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6 mb-10">
        <h3 className="font-semibold text-lg sm:text-xl mb-4 text-gray-800">
          {editMode ? "✏️ Edit Food" : "➕ Add New Food"}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <input
            name="name"
            value={foodForm.name}
            onChange={handleChange}
            placeholder="Food Name"
            className="border p-2 rounded text-sm sm:text-base"
          />
          <input
            name="category"
            value={foodForm.category}
            onChange={handleChange}
            placeholder="Category"
            className="border p-2 rounded text-sm sm:text-base"
          />
          <input
            name="type"
            value={foodForm.type}
            onChange={handleChange}
            placeholder="Type (Veg/Non-Veg)"
            className="border p-2 rounded text-sm sm:text-base"
          />
          <input
            name="price"
            type="number"
            min="0"
            value={foodForm.price}
            onChange={handleChange}
            placeholder="Price ₹"
            className="border p-2 rounded text-sm sm:text-base"
          />
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Available:</label>
            <input
              type="checkbox"
              checked={foodForm.available}
              onChange={(e) =>
                setFoodForm({ ...foodForm, available: e.target.checked })
              }
            />
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="border p-2 rounded text-sm sm:text-base"
          />
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="mt-2 w-32 h-24 object-cover rounded-lg border"
            />
          )}
        </div>

        {/* ✅ Upload Progress Bar */}
        {isUploading && (
          <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
            <div
              className="bg-green-600 h-3 rounded-full transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={saveFood}
            disabled={isUploading}
            className={`${
              editMode ? "bg-blue-600" : "bg-green-600"
            } text-white px-5 py-2 rounded w-full sm:w-auto ${
              isUploading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {isUploading
              ? `Uploading... ${uploadProgress}%`
              : editMode
              ? "Update Food"
              : "Add Food"}
          </button>
          {editMode && (
            <button
              onClick={resetForm}
              className="bg-gray-500 text-white px-5 py-2 rounded w-full sm:w-auto"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* ✅ Food List */}
      <div className="mb-10">
        <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-800">
          🍔 All Foods
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {foods.map((food) => (
            <div
              key={food._id}
              className="border rounded-lg shadow bg-white hover:shadow-lg transition"
            >
              <img
                src={
                  food.image?.url ||
                  "https://placehold.co/300x200?text=No+Image"
                }
                alt={food.name}
                onError={(e) =>
                  (e.target.src = "https://placehold.co/300x200?text=No+Image")
                }
                className="h-40 w-full object-cover"
              />
              <div className="p-4 text-sm sm:text-base">
                <h4 className="font-bold text-gray-800">{food.name}</h4>
                <p className="text-gray-500">
                  {food.category} • {food.type}
                </p>
                <p className="text-red-600 font-bold mt-2">₹{food.price}</p>

                <div className="flex justify-between items-center mt-3">
                  <button
                    onClick={() =>
                      toggleAvailability(food._id, !food.available)
                    }
                    className={`${
                      food.available ? "bg-green-500" : "bg-gray-400"
                    } text-white px-3 py-1 rounded text-sm`}
                  >
                    {food.available ? "Available" : "Out of Stock"}
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editFood(food)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteFood(food._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ Orders Section */}
      <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6">
        <h3 className="font-semibold text-lg sm:text-xl mb-4 text-gray-800">
          🧾 Live Orders
        </h3>
        {orders.length === 0 ? (
          <p className="text-gray-500">No orders yet</p>
        ) : (
          orders.map((order) => (
            <div
              key={order._id}
              className={`border-b py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 transition-all ${
                highlightedOrder === order._id ? "bg-yellow-100" : ""
              }`}
            >
              <div className="text-sm sm:text-base">
                <p className="font-semibold">
                  Table {order.tableNumber}: {order.foodName} ({order.type})
                </p>
                <p className="text-gray-500">
                  Qty: {order.quantity} • {order.category}
                </p>
                <p>
                  Status:{" "}
                  <span
                    className={`font-semibold ${
                      order.status === "Pending"
                        ? "text-yellow-600"
                        : order.status === "Cooking"
                        ? "text-blue-600"
                        : order.status === "Ready"
                        ? "text-purple-600"
                        : "text-green-600"
                    }`}
                  >
                    {order.status}
                  </span>
                </p>
              </div>
              <select
                value={order.status}
                onChange={(e) => updateStatus(order._id, e.target.value)}
                className="border rounded p-2 text-sm sm:text-base w-full sm:w-auto"
              >
                <option>Pending</option>
                <option>Cooking</option>
                <option>Ready</option>
                <option>Served</option>
                <option>Completed</option>
              </select>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminPage;
