import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useResetPasswordMutation } from "../../redux/api/usersApiSlice";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { Helmet } from "react-helmet-async";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const resetToken = location.state?.resetToken;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  useEffect(() => {
    if (!email || !resetToken) navigate("/forgot-password");
  }, [email, resetToken, navigate]);

  const submitHandler = useCallback(
    async (e) => {
      e.preventDefault();
      if (password.length < 8) {
        return toast.error("Password must be at least 8 characters");
      }

      if (password !== confirmPassword) {
        return toast.error("Passwords do not match!");
      }

      try {
        await resetPassword({ email, password, resetToken }).unwrap();
        toast.success("Password reset done! Now login.");
        navigate("/login");
      } catch (err) {
        toast.error(err?.data?.message || "Something went wrong");
      }
    },
    [password, confirmPassword, resetPassword, email, resetToken, navigate]
  );

  return (
    <section
      className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 font-trebuchet"
      style={{ fontFamily: '"Trebuchet MS", sans-serif' }}
    >
      <Helmet>
        <title>Reset Password | Veloura</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="w-full max-w-[440px] bg-white shadow-xl rounded-2xl p-10">
        <h2 className="text-2xl font-bold text-center mb-8">New Password</h2>
        <form onSubmit={submitHandler} className="space-y-5">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
              <FaLock size={14} />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New password"
              className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#007EFC] transition-all"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
            </button>
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
              <FaLock size={14} />
            </span>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm password"
              className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#007EFC] transition-all"
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
            </button>
          </div>

          <button
            disabled={isLoading}
            className="w-full bg-[#007EFC] text-white font-bold py-4 rounded-xl hover:bg-[#006ee0] disabled:opacity-70 transition-all"
          >
            {isLoading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default ResetPassword;
