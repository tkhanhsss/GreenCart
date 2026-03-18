import React from "react";
import { useAppContext } from "../context/AppContext.jsx";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import toast from "react-hot-toast";
import { assets } from "../assets/assets.js";

function Login() {
  const { setShowUserLogin, axios, navigate, fetchUser } = useAppContext();

  const [state, setState] = React.useState("login");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      const { data } = await axios.post(`/api/user/${state}`, { name, email, password });
      if (data.success) {
        navigate('/');
        await fetchUser();
        setShowUserLogin(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div onClick={() => setShowUserLogin(false)}
      className="fixed inset-0 z-[60] flex items-center justify-center text-sm text-gray-600 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <form onSubmit={onSubmitHandler} onClick={(e) => e.stopPropagation()}
        className="relative flex flex-col gap-5 m-auto items-start w-80 sm:w-[380px] text-gray-500 rounded-2xl shadow-2xl bg-white overflow-hidden animate-fadeInUp">

        {/* Green top strip */}
        <div className="w-full h-1.5 bg-gradient-to-r from-primary to-primary-dark" />

        <div className="px-8 pb-8 pt-2 w-full flex flex-col gap-5">
          {/* Logo + Title */}
          <div className="flex flex-col items-center mb-1">
            <img src={assets.logo} alt="logo" className="h-10 mb-3" />
            <p className="text-2xl font-semibold text-gray-800">
              {state === "login" ? "Welcome Back" : "Create Account"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {state === "login" ? "Sign in to your account" : "Join GreenCart today"}
            </p>
          </div>

          {/* Name field (register only) */}
          {state === "register" && (
            <div className="w-full">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Full Name</label>
              <div className="relative mt-1">
                <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary/60 text-sm" />
                <input onChange={(e) => setName(e.target.value)} value={name} placeholder="John Doe"
                  className="border border-gray-200 bg-gray-50 focus:bg-white rounded-xl w-full pl-10 pr-3 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  type="text" required />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="w-full">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email Address</label>
            <div className="relative mt-1">
              <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary/60 text-sm" />
              <input onChange={(e) => setEmail(e.target.value)} value={email} placeholder="you@example.com"
                className="border border-gray-200 bg-gray-50 focus:bg-white rounded-xl w-full pl-10 pr-3 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                type="email" required />
            </div>
          </div>

          {/* Password */}
          <div className="w-full">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Password</label>
            <div className="relative mt-1">
              <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary/60 text-sm" />
              <input onChange={(e) => setPassword(e.target.value)} value={password} placeholder="••••••••"
                className="border border-gray-200 bg-gray-50 focus:bg-white rounded-xl w-full pl-10 pr-3 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                type="password" required />
            </div>
          </div>

          {/* Toggle */}
          <p className="text-xs text-gray-400 text-center">
            {state === "register" ? "Already have an account? " : "Don't have an account? "}
            <span onClick={() => setState(state === "register" ? "login" : "register")}
              className="text-primary font-medium cursor-pointer hover:underline">
              {state === "register" ? "Sign in" : "Sign up"}
            </span>
          </p>

          {/* Submit */}
          <button className="bg-primary hover:bg-primary-dull transition-all duration-200 text-white font-semibold w-full py-3 rounded-xl cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5">
            {state === "register" ? "Create Account" : "Sign In"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;