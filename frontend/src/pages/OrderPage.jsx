import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";
import { AuthContext } from "../context/authContext";

const API_BASE = "https://pos-ff-1.onrender.com";

const TOTAL_TABLES = 40;

const OrderPage = () => {
  const { user } = useContext(AuthContext);
  const [foods, setFoods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tableNumber, setTableNumber] = useState("");
  const [bookedTables, setBookedTables] = useState([]);
  const [orderItems, setOrderItems] = useState([
    { foodName: "", category: "", type: "", quantity: 1, price: "" },
  ]);
  const socketRef = useRef(null);

  // ✅ Fetch all foods
  const fetchFoods = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/foods`);
      setFoods(res.data);
    } catch {
      toast.error("Couldn't load food menu.");
    }
  };

  // ✅ Fetch all orders (to check booked tables)
  const fetchAllOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/orders`);
      setOrders(res.data);
      updateBookedTables(res.data);
    } catch {
      toast.error("Couldn't load orders.");
    }
  };

  // ✅ Fetch only current user’s orders
  const fetchUserOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/orders`);
      const userOrders = res.data.filter((o) => o.userEmail === user?.email);
      setOrders(userOrders);
    } catch {
      toast.error("Couldn't load your orders.");
    }
  };

  // ✅ Update booked table numbers
  const updateBookedTables = (allOrders) => {
    const booked = allOrders
      .filter((order) => order.status !== "Completed")
      .map((order) => order.tableNumber);
    setBookedTables([...new Set(booked)]);
  };

  // ✅ Available tables (1–40 excluding booked)
  const availableTables = Array.from({ length: TOTAL_TABLES }, (_, i) => i + 1).filter(
    (num) => !bookedTables.includes(num)
  );

  // ✅ Delete completed order
  const deleteOrder = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this order?");
    if (!confirm) return;

    try {
      await axios.delete(`${API_BASE}/api/orders/${id}`);
      toast.success("🗑 Order deleted successfully!");
      setOrders((prev) => prev.filter((o) => o._id !== id));

      if (socketRef.current) socketRef.current.emit("orderDeleted", id);
      fetchAllOrders();
    } catch (err) {
      toast.error("Failed to delete order!");
    }
  };

  // ✅ Setup Socket.IO
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(API_BASE, {
        transports: ["websocket"],
        reconnection: true,
      });
    }

    const socket = socketRef.current;

    socket.on("newOrderPlaced", (newOrder) => {
      fetchAllOrders();
      toast.success(`🪑 Table ${newOrder.tableNumber} booked!`);
    });

    socket.on("orderStatusChanged", (updatedOrder) => {
      fetchAllOrders();
      if (user && updatedOrder.userEmail === user.email) {
        toast.success(`✅ "${updatedOrder.foodName}" is now ${updatedOrder.status}`);
      }
    });

    socket.on("orderDeleted", (deletedId) => {
      fetchAllOrders();
    });

    return () => {
      socket.off("newOrderPlaced");
      socket.off("orderStatusChanged");
      socket.off("orderDeleted");
    };
  }, [user]);

  useEffect(() => {
    fetchFoods();
    fetchAllOrders();
  }, []);

  useEffect(() => {
    if (user) fetchUserOrders();
  }, [user]);

  // ✅ Handle food selection
  const handleFoodSelect = (index, foodName) => {
    const selectedFood = foods.find(
      (f) => f.name.toLowerCase().trim() === foodName.toLowerCase().trim()
    );
    setOrderItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              foodName,
              category: selectedFood?.category || "",
              type: selectedFood?.type || "",
              price:
                selectedFood && item.quantity > 0
                  ? selectedFood.price * item.quantity
                  : "",
            }
          : item
      )
    );
  };

  const handleItemChange = (index, field, value) => {
    setOrderItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        if (field === "quantity") {
          const food = foods.find(
            (f) => f.name.toLowerCase().trim() === item.foodName.toLowerCase().trim()
          );
          const newPrice = food && value > 0 ? food.price * value : item.price;
          return { ...item, [field]: value, price: newPrice };
        }
        return { ...item, [field]: value };
      })
    );
  };

  const addFoodItem = () =>
    setOrderItems([
      ...orderItems,
      { foodName: "", category: "", type: "", quantity: 1, price: "" },
    ]);

  const removeFoodItem = (index) => {
    if (orderItems.length === 1)
      return toast.error("At least one food item required");
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const totalPrice = orderItems.reduce(
    (sum, item) => sum + (Number(item.price) || 0),
    0
  );

  // ✅ Submit Order
  const handleSubmit = async () => {
    if (!user) return toast.error("Please login first!");
    if (!tableNumber) return toast.error("Select an available table number!");
    const invalid = orderItems.find(
      (i) => !i.foodName || !i.quantity || Number(i.quantity) <= 0
    );
    if (invalid) return toast.error("Fill all fields properly!");

    try {
      const payload = orderItems.map((i) => ({
        ...i,
        tableNumber: Number(tableNumber),
        quantity: Number(i.quantity),
        price: Number(i.price),
        userEmail: user.email,
      }));

      await axios.post(`${API_BASE}/api/orders/create-multiple`, payload);
      toast.success(`✅ Table ${tableNumber} booked successfully!`);
      setOrderItems([{ foodName: "", category: "", type: "", quantity: 1, price: "" }]);
      setTableNumber("");
      fetchAllOrders();
      fetchUserOrders();
    } catch {
      toast.error("Failed to place order!");
    }
  };

  return (
    <div className="px-4 sm:px-6 md:px-10 py-8 max-w-7xl mx-auto bg-gradient-to-b from-yellow-50 to-white min-h-screen">
      <Toaster />
      <h2 className="text-2xl sm:text-3xl font-extrabold text-red-700 text-center mb-8">
        🍽️ Place Your Order (Real-Time)
      </h2>

      {/* 🪑 Table Selector */}
      <div className="bg-white shadow-xl rounded-xl p-4 sm:p-6 mb-8">
        <label className="block font-semibold mb-2 text-gray-700">
          Select Your Table (Available: {availableTables.length}/40)
        </label>
        <select
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
          className="border p-2 sm:p-3 rounded w-full sm:w-1/2 md:w-1/3 text-sm sm:text-base"
        >
          <option value="">-- Choose Available Table --</option>
          {availableTables.map((num) => (
            <option key={num} value={num}>
              Table {num}
            </option>
          ))}
        </select>
      </div>

      {/* 🍛 Order Form */}
      <div className="bg-white shadow-xl rounded-xl p-4 sm:p-6 mb-10">
        {orderItems.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 mb-3 border p-3 rounded-lg bg-gray-50"
          >
            <select
              value={item.foodName}
              onChange={(e) => handleFoodSelect(index, e.target.value)}
              className="border p-2 rounded text-sm sm:text-base"
            >
              <option value="">Select Food*</option>
              {foods.map((food) => (
                <option key={food._id} value={food.name}>
                  {food.name}
                </option>
              ))}
            </select>

            <input
              value={item.category}
              readOnly
              placeholder="Category"
              className="border p-2 rounded bg-gray-100 text-sm sm:text-base"
            />
            <input
              value={item.type}
              readOnly
              placeholder="Type"
              className="border p-2 rounded bg-gray-100 text-sm sm:text-base"
            />
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) =>
                handleItemChange(index, "quantity", Number(e.target.value))
              }
              placeholder="Qty"
              className="border p-2 rounded text-sm sm:text-base"
            />
            <input
              value={item.price}
              readOnly
              placeholder="Price ₹"
              className="border p-2 rounded bg-gray-100 text-sm sm:text-base"
            />
            <button
              onClick={() => removeFoodItem(index)}
              className="text-red-600 font-semibold hover:text-red-800"
            >
              ✖
            </button>
          </div>
        ))}

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
          <button
            onClick={addFoodItem}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded w-full sm:w-auto text-sm sm:text-base"
          >
            + Add More
          </button>
          <p className="text-lg sm:text-xl font-semibold">
            Total: <span className="text-red-600">₹{totalPrice}</span>
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!user}
          className="bg-red-600 hover:bg-red-700 text-white w-full py-2 sm:py-3 mt-5 rounded text-sm sm:text-base"
        >
          Submit Orders
        </button>
      </div>

      {/* 🧾 Orders Section */}
      <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800 text-center sm:text-left">
        🧾 Your Orders (Live)
      </h3>

      {!user ? (
        <p className="text-gray-600 text-center">Please login to view your orders.</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500 text-center">No orders yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="border rounded-lg shadow bg-white hover:shadow-lg p-4 transition-all"
            >
              <h4 className="font-semibold text-base sm:text-lg">{order.foodName}</h4>
              <p className="text-sm text-gray-500 capitalize">
                Table {order.tableNumber} | Qty: {order.quantity}
              </p>
              <p className="text-sm text-gray-500">
                {order.category} • {order.type}
              </p>
              <p className="text-sm text-gray-600">Price: ₹{order.price}</p>
              <p className="mt-2 text-sm sm:text-base">
                Status:{" "}
                <span
                  className={`font-semibold ${
                    order.status === "Pending"
                      ? "text-yellow-600"
                      : order.status === "Cooking"
                      ? "text-blue-600"
                      : order.status === "Ready"
                      ? "text-purple-600"
                      : order.status === "Served"
                      ? "text-green-600"
                      : order.status === "Completed"
                      ? "text-gray-500"
                      : ""
                  }`}
                >
                  {order.status}
                </span>
              </p>

              {order.status === "Completed" && (
                <button
                  onClick={() => deleteOrder(order._id)}
                  className="mt-3 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                >
                  🗑 Delete Order
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderPage;
