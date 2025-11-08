import React, { useState, useEffect, useContext } from "react";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // 👑 Replace this with your real admin email
  const ADMIN_EMAIL = "roshansharma7250@gmail.com";

  // 🚫 Prevent logged-in users from accessing login page again
  useEffect(() => {
    if (user) {
      if (user.email === ADMIN_EMAIL) navigate("/admin");
      else navigate("/order");
    }
  }, [user, navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const toggleMode = () => setIsLogin(!isLogin);

  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleAuth = async () => {
    const email = form.email.trim();
    const password = form.password.trim();

    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }
    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("✅ Logged in successfully!");
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success("🎉 Account created successfully!");
      }

      // Redirect user after successful auth
      if (email === ADMIN_EMAIL) navigate("/admin");
      else navigate("/order");
    } catch (err) {
      const code = err.code || "";
      if (code === "auth/invalid-email") toast.error("Invalid email format.");
      else if (code === "auth/user-not-found") toast.error("User not found.");
      else if (code === "auth/wrong-password") toast.error("Incorrect password.");
      else if (code === "auth/email-already-in-use")
        toast.error("Email already registered.");
      else toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;
      toast.success("✅ Google Sign-In successful!");

      // Role-based redirect
      if (email === ADMIN_EMAIL) navigate("/admin");
      else navigate("/order");
    } catch (err) {
      console.error(err);
      toast.error("Google Sign-In failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-yellow-50 via-white to-red-100 px-4 sm:px-6">
      <Toaster />

      <div className="bg-white shadow-xl rounded-xl w-full max-w-sm sm:max-w-md p-6 sm:p-8 border border-gray-100 transition-all">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-red-700 mb-6">
          {isLogin ? "Welcome Back 👋" : "Create an Account 🎉"}
        </h2>

        {/* Email Field */}
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Enter your email"
          className="border p-2 sm:p-3 rounded w-full mb-3 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm sm:text-base"
          autoComplete="email"
          required
        />

        {/* Password Field */}
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Enter your password"
          className="border p-2 sm:p-3 rounded w-full mb-4 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm sm:text-base"
          autoComplete={isLogin ? "current-password" : "new-password"}
          required
        />

        {/* Submit Button */}
        <button
          onClick={handleAuth}
          disabled={loading}
          className={`${
            loading ? "opacity-70 cursor-not-allowed" : "hover:bg-red-700"
          } bg-red-600 text-white w-full py-2 sm:py-3 rounded font-medium transition text-sm sm:text-base`}
        >
          {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
        </button>

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="px-3 text-gray-500 text-sm">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Google Login */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="border border-gray-400 text-gray-700 w-full py-2 sm:py-3 rounded hover:bg-gray-50 transition text-sm sm:text-base flex justify-center items-center gap-2"
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/0/09/IOS_Google_icon.png"
            alt="Google"
            className="w-5 h-5"
          />
          Sign in with Google
        </button>

        {/* Switch Mode */}
        <p className="text-center text-sm sm:text-base text-gray-500 mt-5">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <span
            onClick={toggleMode}
            className="text-red-600 cursor-pointer font-semibold hover:underline"
          >
            {isLogin ? "Register here" : "Login here"}
          </span>
        </p>
      </div>

      <p className="text-xs sm:text-sm text-gray-400 mt-6">
        © {new Date().getFullYear()} TasteBite Restaurant. All Rights Reserved.
      </p>
    </div>
  );
};

export default LoginPage;
