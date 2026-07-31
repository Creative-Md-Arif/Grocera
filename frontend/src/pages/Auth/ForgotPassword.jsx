import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useForgotPasswordMutation } from "../../redux/api/usersApiSlice";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";
import { Helmet } from "react-helmet-async";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({ email: "", server: "" });

  const navigate = useNavigate();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const submitHandler = useCallback(
    async (e) => {
      e.preventDefault();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(email)) {
        setErrors({ email: "Please enter a valid email", server: "" });
        return;
      } else {
        setErrors({ email: "", server: "" });
      }

      try {
        const res = await forgotPassword({ email }).unwrap();
        toast.success(res.message || "OTP sent to your email!");
        navigate("/verify-reset-otp", { state: { email } });
      } catch (err) {
        const errorMessage = err?.data?.message || "User not found";
        setErrors((prev) => ({ ...prev, server: errorMessage }));
      }
    },
    [email, forgotPassword, navigate]
  );

  return (
    <section
      className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] px-4 font-trebuchet"
      style={{ fontFamily: '"Trebuchet MS", sans-serif' }}
    >
      <Helmet>
        <title>Forgot Password | Veloura</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-5%] right-[-5%] w-[35%] h-[35%] rounded-full bg-blue-50 blur-[100px]" />
        <div className="absolute bottom-[5%] left-[-5%] w-[30%] h-[30%] rounded-full bg-indigo-50 blur-[100px]" />
      </div>

      <div className="w-full min-w-[280px] max-w-[320px] sm:max-w-[340px] max-h-full overflow-y-auto bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-xl font-bold text-center mb-1 text-gray-900">Forgot Password</h2>
        <p className="text-gray-500 text-center text-[12px] font-normal mb-4">
          Enter your email to receive OTP
        </p>

        <form onSubmit={submitHandler} className="space-y-3">
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 group-focus-within:text-[#007EFC] transition-colors">
              <FaEnvelope size={12} />
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
              }}
              placeholder="Enter your email"
              className={`w-full pl-9 pr-3 py-2.5 bg-gray-50 border ${
                errors.email ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-[#007EFC]"
              } rounded-lg text-gray-700 text-[13px] outline-none focus:bg-white transition-all`}
            />
          </div>

          {errors.email && (
            <p className="text-red-500 text-[12px] mt-1 ml-0.5 font-medium animate-in fade-in duration-200">
              {errors.email}
            </p>
          )}

          {errors.server && (
            <div className="bg-red-50 border border-red-100 rounded-lg p-2.5 text-red-600 text-[12px] font-medium animate-in fade-in duration-200">
              {errors.server}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full relative overflow-hidden bg-[#007EFC] text-white font-bold py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 group"
          >
            <span className="absolute inset-0 bg-gradient-to-b from-[#006ee0] to-[#005cb8] translate-y-[-100%] group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
            <span className="relative z-10 flex items-center justify-center gap-2 pointer-events-none text-[14px]">
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Send OTP"
              )}
            </span>
          </button>
        </form>

        <Link
          to="/login"
          className="mt-4 flex items-center justify-center gap-2 text-[#007EFC] text-[12px] font-bold hover:underline"
        >
          <FaArrowLeft size={11} /> Back to Login
        </Link>
      </div>
    </section>
  );
};

export default ForgotPassword;
