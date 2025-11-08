import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";
import { AiOutlineCloudUpload } from "react-icons/ai";

// ✅ Use environment variable
const API_BASE = import.meta.env.VITE_API_BASE || "https://pos-ff-1.onrender.com";

const AdminPanel = () => {
  const [foods, setFoods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [foodForm, setFoodForm] = useState({
    name: "",
    category: "",
    type: "",
    price: "",
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const socketRef = useRef(null);

  // ✅ Fetch All Data
  const getAllData = async () => {
    try {
      const [foodRes, orderRes] = await Promise.all([
        axios.get(`${API_BASE}/api/foods`),
        axios.get(`${API_BASE}/api/orders`),
      ]);
      setFoods(foodRes.data);
      setOrders(orderRes.data);
    } catch (err) {
      console.error("❌ Failed to fetch data:", err);
      toast.error("Failed to fetch data");
    }
  };

  // ✅ Initialize Socket.IO
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(API_BASE, { transports: ["websocket"], reconnection: true });
    }

    const socket = socketRef.current;
    getAllData();

    // Order events
    socket.on("newOrderPlaced", (newOrder) => {
      setOrders((prev) => [newOrder, ...prev]);
      toast.success(`🆕 New order for Table ${newOrder.tableNumber}`);
    });

    socket.on("orderStatusChanged", (updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) =>
          o._id === updatedOrder._id ? { ...o, status: updatedOrder.status } : o
        )
      );
    });

    // Food events
    socket.on("newFoodAdded", (food) => {
      setFoods((prev) => [...prev, food]);
      toast(`🍛 New food added: ${food.name}`, { position: "bottom-right" });
    });

    socket.on("foodDeleted", (id) => {
      setFoods((prev) => prev.filter((f) => f._id !== id));
      toast.error("❌ Food item deleted");
    });

    return () => {
      socket.off("newOrderPlaced");
      socket.off("orderStatusChanged");
      socket.off("newFoodAdded");
      socket.off("foodDeleted");
    };
  }, []);

  // ✅ Form Handlers
  const handleChange = (e) => setFoodForm({ ...foodForm, [e.target.name]: e.target.value });

  const handleImage = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  // ✅ Add Food
  const addFood = async () => {
    if (!foodForm.name || !foodForm.price)
      return toast.error("Please fill all fields.");

    try {
      const formData = new FormData();
      Object.entries(foodForm).forEach(([key, value]) => formData.append(key, value));
      if (image) formData.append("image", image);

      const res = await axios.post(`${API_BASE}/api/foods`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        },
      });

      const addedFood = res.data.food;
      setFoods((prev) => [...prev, addedFood]);
      socketRef.current.emit("newFoodAdded", addedFood);

      toast.success("✅ Food added successfully!");
      setFoodForm({ name: "", category: "", type: "", price: "" });
      setImage(null);
      setPreview(null);
      setUploadProgress(0);
    } catch (err) {
      console.error("❌ Error adding food:", err);
      toast.error("Failed to add food");
    }
  };

  // ✅ Delete Food
  const deleteFood = async (id) => {
    if (!window.confirm("Are you sure you want to delete this food?")) return;
    try {
      await axios.delete(`${API_BASE}/api/foods/${id}`);
      setFoods((prev) => prev.filter((f) => f._id !== id));
      socketRef.current.emit("foodDeleted", id);
      toast.success("🗑 Food deleted successfully");
    } catch (err) {
      console.error("❌ Delete food error:", err);
      toast.error("Failed to delete food");
    }
  };

  // ✅ Update Order Status
  const updateStatus = async (id, status) => {
    try {
      const res = await axios.put(`${API_BASE}/api/orders/${id}`, { status });
      const updatedOrder = res.data.order || res.data;
      setOrders((prev) =>
        prev.map((o) => (o._id === updatedOrder._id ? { ...o, status } : o))
      );
      socketRef.current.emit("orderUpdated", updatedOrder);
      toast.success(`✅ Order status updated to ${status}`);
    } catch (err) {
      console.error("❌ Update order error:", err);
      toast.error("Failed to update order");
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full">
      <Toaster />
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-red-700 text-center">
        🍴 Admin Dashboard
      </h2>

      {/* Add Food Section */}
      <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6 mb-10">
        <h3 className="font-semibold text-lg sm:text-xl mb-4 text-gray-800 text-center sm:text-left">
          ➕ Add New Food
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <input
            name="name"
            placeholder="Food Name"
            value={foodForm.name}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            name="category"
            placeholder="Category"
            value={foodForm.category}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            name="type"
            placeholder="Type (Veg/Non-Veg)"
            value={foodForm.type}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            name="price"
            placeholder="Price ₹"
            value={foodForm.price}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <label className="flex items-center justify-center border-2 border-dashed rounded-lg p-3 cursor-pointer hover:bg-gray-100">
            <AiOutlineCloudUpload className="text-2xl text-gray-500 mr-2" />
            <span className="text-sm">Upload Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="hidden"
            />
          </label>
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="w-32 h-24 object-cover rounded border"
            />
          )}
        </div>

        {uploadProgress > 0 && (
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        <button
          onClick={addFood}
          className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto px-6 py-2 mt-4 rounded-md font-medium transition-all"
        >
          Add Food
        </button>
      </div>

      {/* Foods */}
      <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6 mb-10">
        <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800 text-center sm:text-left">
          🍔 Menu Items
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {foods.map((food) => (
            <div key={food._id} className="border rounded-lg shadow p-3">
              <img
                src={food.image?.url || "https://placehold.co/200x150?text=No+Image"}
                alt={food.name}
                className="w-full h-40 object-cover rounded-md mb-2"
              />
              <h4 className="font-semibold text-gray-800">{food.name}</h4>
              <p className="text-gray-500 text-sm">
                {food.category} • {food.type}
              </p>
              <p className="text-red-600 font-bold mt-1">₹{food.price}</p>
              <button
                onClick={() => deleteFood(food._id)}
                className="bg-red-600 text-white px-4 py-1 mt-2 rounded text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Orders Section */}
      <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6">
        <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800 text-center sm:text-left">
          📦 Live Orders
        </h3>
        <div className="max-h-[65vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
          {orders.length === 0 ? (
            <p className="text-center text-gray-600">No Orders Yet</p>
          ) : (
            orders.map((order) => (
              <div
                key={order._id}
                className="border-b py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
              >
                <div className="text-sm">
                  <p className="font-semibold text-gray-800">
                    Table {order.tableNumber}: {order.foodName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {order.type} | Qty: {order.quantity}
                  </p>
                  <p className="text-sm">
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
                  onChange={(e) => updateStatus(order._id, e.target.value)}
                  value={order.status}
                  className="border rounded p-2 text-sm w-full sm:w-auto focus:ring-2 focus:ring-blue-400"
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
    </div>
  );
};

export default AdminPanel;
