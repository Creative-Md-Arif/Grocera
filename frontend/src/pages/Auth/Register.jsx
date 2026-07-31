import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useRegisterMutation } from "@redux/api/usersApiSlice";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import { Helmet } from "react-helmet-async";

const Register = () => {
  const [username, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    server: "",
  });

  // ✅ ইউজারনেম সাজেশন স্টেট
  const [suggestions, setSuggestions] = useState([]);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [register, { isLoading }] = useRegisterMutation();

  // ✅ সাজেশন জেনারেট করার ফাংশন
  const generateSuggestions = (base) => {
    const cleanBase = (base || "user")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toLowerCase()
      .slice(0, 10);
    if (!cleanBase) return ["user123", "user_456", "user789"];
    return [
      `${cleanBase}${Math.floor(100 + Math.random() * 900)}`,
      `${cleanBase}_${Math.floor(10 + Math.random() * 90)}`,
      `${cleanBase}${Math.floor(1000 + Math.random() * 9000)}`,
    ];
  };

  const submitHandler = useCallback(
    async (e) => {
      e.preventDefault();
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

      let hasError = false;
      const newErrors = {
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        server: "",
      };

      if (!username.trim()) {
        newErrors.username = "Username is required";
        hasError = true;
      } else if (username.trim().length < 3) {
        newErrors.username = "Username must be at least 3 characters";
        hasError = true;
      }

      if (!email.trim()) {
        newErrors.email = "Email is required";
        hasError = true;
      } else if (!emailPattern.test(email)) {
        newErrors.email = "Enter a valid email";
        hasError = true;
      }

      if (password.length < 8) {
        newErrors.password = "Password must be 8+ characters";
        hasError = true;
      }

      if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
        hasError = true;
      }

      if (hasError) {
        setErrors(newErrors);
        return;
      }

      try {
        // সাবমিট করার আগে আগের সাজেশনগুলো মুছে ফেলা হলো
        setSuggestions([]);
        const res = await register({ username, email, password }).unwrap();

        if (res.token) {
  
          toast.success("Registration successful! Please login to continue.");
          navigate("/login");
        } else {
          toast.success(
            res.message || "Registration successful! Check email for OTP.",
          );
          navigate("/verify-otp", { state: { email } });
        }
      } catch (err) {
        const errorMessage =
          err?.data?.message || err?.error || "Registration failed";
        setErrors((prev) => ({ ...prev, server: errorMessage }));

        // ✅ যদি ইউজারনেম ডুপ্লিকেট হয়, তবে সাজেশন দেখানো হবে
        if (errorMessage.toLowerCase().includes("username")) {
          // ইমেইলের প্রথম অংশ বা ইউজারের দেওয়া নাম থেকে সাজেশন তৈরি করা হলো
          const baseName = email.split("@")[0] || username;
          setSuggestions(generateSuggestions(baseName));
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [username, email, password, confirmPassword, register, navigate, dispatch],
  );

  // ✅ সাজেশন ক্লিক করলে ইনপুটে বসানোর ফাংশন
  const handleSuggestionClick = (sug) => {
    setName(sug);
    setErrors((prev) => ({ ...prev, server: "", username: "" }));
    setSuggestions([]);
  };

  return (
    <section
      className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] px-4 font-trebuchet"
      style={{ fontFamily: '"Trebuchet MS", sans-serif' }}
    >
      <Helmet>
        <title>Register | Veloura</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-50 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-50 blur-[120px]" />
      </div>

      <div className="w-full min-w-[280px] max-w-[320px] sm:max-w-[420px] max-h-full overflow-y-auto animate-in fade-in zoom-in duration-500">
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="p-4 sm:p-5">
            <div className="text-center mb-4">
              <h1 className="text-xl font-bold text-gray-900 mb-1">
                Create Account
              </h1>
              <p className="text-gray-500 text-[12px] font-normal">
                Join our community and start shopping
              </p>
            </div>

            <form onSubmit={submitHandler} className="space-y-3">
              <div className="group">
                <label
                  htmlFor="reg-name"
                  className="block text-[12px] font-medium text-gray-600 mb-1 ml-0.5"
                >
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 group-focus-within:text-[#007EFC] transition-colors">
                    <FaUser size={12} />
                  </span>
                  <input
                    id="reg-name"
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.username)
                        setErrors((prev) => ({ ...prev, username: "" }));
                      if (suggestions.length) setSuggestions([]);
                    }}
                    placeholder="Username"
                    className={`w-full pl-9 pr-3 py-2.5 bg-gray-50 border ${errors.username ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-[#007EFC]"} rounded-lg text-gray-700 text-[13px] focus:bg-white outline-none transition-all duration-200`}
                  />
                </div>
                {errors.username && (
                  <p className="text-red-500 text-[12px] mt-1 ml-0.5 font-medium">
                    {errors.username}
                  </p>
                )}

                {/* ✅ সাজেশন UI এখানে দেখাবে */}
                {suggestions.length > 0 && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded-lg">
                    <p className="text-[11px] text-gray-600 font-medium mb-1.5 ml-0.5">
                      Username already taken! Try one of these:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestions.map((sug) => (
                        <button
                          type="button"
                          key={sug}
                          onClick={() => handleSuggestionClick(sug)}
                          className="px-2.5 py-1 bg-white border border-blue-200 text-[#007EFC] text-[11px] font-bold rounded-md hover:bg-[#007EFC] hover:text-white transition-colors"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="group">
                <label
                  htmlFor="reg-email"
                  className="block text-[12px] font-medium text-gray-600 mb-1 ml-0.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 group-focus-within:text-[#007EFC] transition-colors">
                    <FaEnvelope size={12} />
                  </span>
                  <input
                    id="reg-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email)
                        setErrors((prev) => ({ ...prev, email: "" }));
                    }}
                    placeholder="veloura@example.com"
                    className={`w-full pl-9 pr-3 py-2.5 bg-gray-50 border ${errors.email ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-[#007EFC]"} rounded-lg text-gray-700 text-[13px] focus:bg-white outline-none transition-all duration-200`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-[12px] mt-1 ml-0.5 font-medium">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="group">
                <label
                  htmlFor="reg-password"
                  className="block text-[12px] font-medium text-gray-600 mb-1 ml-0.5"
                >
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 group-focus-within:text-[#007EFC] transition-colors">
                    <FaLock size={12} />
                  </span>
                  <input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password)
                        setErrors((prev) => ({ ...prev, password: "" }));
                    }}
                    placeholder="••••••••"
                    className={`w-full pl-9 pr-10 py-2.5 bg-gray-50 border ${errors.password ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-[#007EFC]"} rounded-lg text-gray-700 text-[13px] focus:bg-white outline-none transition-all duration-200`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FaEyeSlash size={14} />
                    ) : (
                      <FaEye size={14} />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-[12px] mt-1 ml-0.5 font-medium">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="group">
                <label
                  htmlFor="reg-confirm-password"
                  className="block text-[12px] font-medium text-gray-600 mb-1 ml-0.5"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 group-focus-within:text-[#007EFC] transition-colors">
                    <FaLock size={12} />
                  </span>
                  <input
                    id="reg-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword)
                        setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                    }}
                    placeholder="••••••••"
                    className={`w-full pl-9 pr-10 py-2.5 bg-gray-50 border ${errors.confirmPassword ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-[#007EFC]"} rounded-lg text-gray-700 text-[13px] focus:bg-white outline-none transition-all duration-200`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash size={14} />
                    ) : (
                      <FaEye size={14} />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-[12px] mt-1 ml-0.5 font-medium">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {errors.server && !suggestions.length && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-2.5 text-red-600 text-[12px] font-medium">
                  {errors.server}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative overflow-hidden bg-[#007EFC] text-white font-bold py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-1 group"
              >
                <span className="absolute inset-0 bg-gradient-to-b from-[#006ee0] to-[#005cb8] translate-y-[-100%] group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
                <span className="relative z-10 flex items-center justify-center gap-2 pointer-events-none text-[14px]">
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Create Account"
                  )}
                </span>
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-gray-500 text-[12px] font-medium">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-[#007EFC] font-bold hover:underline underline-offset-4 ml-1"
                >
                  Log In
                </Link>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-400 text-[11px] mt-3 px-2">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </section>
  );
};

export default Register;
