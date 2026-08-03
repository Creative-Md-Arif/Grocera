import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "@redux/api/usersApiSlice";
import { setCredentials } from "../../redux/features/auth/authSlice";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from "react-icons/fa";
import { Helmet } from "react-helmet-async";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "", server: "" });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const isCheckoutRedirect = redirect === "/shipping";

  const [login, { isLoading }] = useLoginMutation();

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const submitHandler = useCallback(async (e) => {
    e.preventDefault();
    let hasError = false;
    const newErrors = { email: "", password: "", server: "" };

    if (!email.trim()) {
      newErrors.email = "Email is required";
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Enter a valid email";
      hasError = true;
    }

    if (!password) {
      newErrors.password = "Password is required";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    try {
      const res = await login({ email, password }).unwrap();
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
      dispatch(setCredentials({ ...res }));
      toast.success("Welcome back! Login successful.");
      navigate(redirect);
    } catch (err) {
      const errorMessage = err?.data?.message || err?.error || "Login failed";
      
      // ✅ যদি ভেরিফাইড না হয়, তবে OTP পেজে পাঠানো হলো
      if (errorMessage.toLowerCase().includes("not verified")) {
        toast.info("Please verify your account first.");
        navigate(`/verify-otp`, { state: { email } });
      } else {
        setErrors((prev) => ({ ...prev, server: errorMessage }));
      }
    }
  }, [email, password, rememberMe, login, dispatch, navigate, redirect]);

  return (
    <section
      className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] px-4 font-trebuchet"
      style={{ fontFamily: '"Trebuchet MS", sans-serif' }}
    >
      <Helmet>
        <title>Login | Grocera</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-5%] right-[-5%] w-[35%] h-[35%] rounded-full bg-blue-50 blur-[100px]" />
        <div className="absolute bottom-[5%] left-[-5%] w-[30%] h-[30%] rounded-full bg-indigo-50 blur-[100px]" />
      </div>

      <div className="w-full min-w-[280px] max-w-[320px] sm:max-w-[420px] max-h-full overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="p-4 sm:p-5">
            <div className="text-center mb-4">
              <h1 className="text-xl font-bold text-gray-900 mb-1">Welcome Back</h1>
              <p className="text-gray-500 text-[12px] font-normal">
                Please enter your details to sign in
              </p>
            </div>

            {isCheckoutRedirect && (
              <div className="mb-4 bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-2">
                <span className="text-[#007EFC] mt-0.5 flex-shrink-0">
                  <FaLock size={12} />
                </span>
                <p className="text-[12px] text-gray-600 leading-relaxed">
                  Please sign in to continue to checkout.{" "}
                  <span className="font-semibold text-gray-800">
                    Your cart items are safe
                  </span>{" "}
                  and will be here after you log in.
                </p>
              </div>
            )}

            <form onSubmit={submitHandler} className="space-y-3">
              <div className="group">
                <label htmlFor="login-email" className="block text-[12px] font-medium text-gray-600 mb-1 ml-0.5">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 group-focus-within:text-[#007EFC] transition-colors">
                    <FaEnvelope size={12} />
                  </span>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                    }}
                    placeholder="example@gmail.com"
                    className={`w-full pl-9 pr-3 py-2.5 bg-gray-50 border ${
                      errors.email ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-[#007EFC]"
                    } rounded-lg text-gray-700 text-[13px] focus:bg-white outline-none transition-all duration-200`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-[12px] mt-1 ml-0.5 font-medium animate-in fade-in duration-200">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="group">
                <div className="flex justify-between items-center mb-1 ml-0.5">
                  <label htmlFor="login-password" className="block text-[12px] font-medium text-gray-600">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-[12px] font-medium text-[#007EFC] hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 group-focus-within:text-[#007EFC] transition-colors">
                    <FaLock size={12} />
                  </span>
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                    }}
                    placeholder="••••••••"
                    className={`w-full pl-9 pr-10 py-2.5 bg-gray-50 border ${
                      errors.password ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-[#007EFC]"
                    } rounded-lg text-gray-700 text-[13px] focus:bg-white outline-none transition-all duration-200`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-[12px] mt-1 ml-0.5 font-medium animate-in fade-in duration-200">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 px-0.5 py-0.5">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 text-[#007EFC] border-gray-300 rounded focus:ring-0 cursor-pointer"
                />
                <label htmlFor="remember" className="text-[12px] font-medium text-gray-500 cursor-pointer select-none">
                  Keep me signed in
                </label>
              </div>

              {errors.server && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-2.5 text-red-600 text-[12px] font-medium animate-in fade-in duration-200">
                  {errors.server}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative overflow-hidden bg-[#007EFC] text-white font-bold py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 mt-1 disabled:opacity-70 group"
              >
                <span className="absolute inset-0 bg-gradient-to-b from-[#006ee0] to-[#005cb8] translate-y-[-100%] group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
                <span className="relative z-10 flex items-center justify-center gap-2 pointer-events-none text-[14px]">
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Sign In"
                  )}
                </span>
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-gray-500 text-[12px] font-medium">
                Don&apos;t have an account?{" "}
                <Link to="/register" className="text-[#007EFC] font-bold hover:underline underline-offset-4 ml-1">
                  Register Now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;