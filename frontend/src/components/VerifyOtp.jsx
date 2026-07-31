import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useVerifyEmailMutation, useResendOtpMutation } from "@redux/api/usersApiSlice";
import { FaShieldAlt } from "react-icons/fa";
import { Helmet } from "react-helmet-async";

const VerifyOtp = () => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);
  const { state } = useLocation();
  const navigate = useNavigate();
  const email = state?.email || "your email";

  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

  useEffect(() => {
    if (!state?.email) {
      navigate("/register");
      return;
    }

    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [state, navigate, timer]);

  const handleChange = useCallback((element, index) => {
    if (isNaN(element.value)) return false;

    setOtp((prevOtp) => {
      const newOtp = [...prevOtp];
      newOtp[index] = element.value;
      return newOtp;
    });

    if (element.value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  }, []);

  const handleKeyDown = useCallback((e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  }, [otp]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const finalOtp = otp.join("");
      if (finalOtp.length < 6) return toast.error("Please enter 6-digit OTP");

      try {
        await verifyEmail({ email, otp: finalOtp }).unwrap();
        toast.success("Email verified! Welcome to AriX GeaR.");
        navigate("/login");
      } catch (err) {
        toast.error(err?.data?.message || "Invalid or expired OTP");
      }
    },
    [otp, email, verifyEmail, navigate]
  );

  const handleResend = useCallback(async () => {
    try {
      await resendOtp({ email }).unwrap();
      toast.success("A new OTP has been sent to your email.");
      setTimer(60);
      setCanResend(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to resend OTP");
    }
  }, [resendOtp, email]);

  return (
    <section className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] p-4 font-figtree overflow-x-hidden">
      <Helmet>
        <title>Verify Email | AriX Co</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] rounded-full bg-blue-50/60 blur-[100px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] rounded-full bg-indigo-50/60 blur-[100px]" />
      </div>

      <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="bg-white border border-gray-100 shadow-[0_15px_50px_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <div className="relative w-20 h-20 bg-gradient-to-tr from-[#007EFC] to-blue-400 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-200">
                  <FaShieldAlt size={36} />
                </div>
              </div>
            </div>

            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3">Verify Email</h2>
              <p className="text-gray-500 text-[15px] leading-relaxed">
                Enter the 6-digit code we sent to <br />
                <span className="text-[#007EFC] font-bold decoration-2 underline-offset-4">{email}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="grid grid-cols-6 gap-2 sm:gap-3">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    ref={(el) => (inputRefs.current[index] = el)}
                    value={data}
                    onChange={(e) => handleChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    aria-label={`OTP digit ${index + 1}`}
                    className="w-full aspect-square text-center text-2xl font-bold text-gray-800 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#007EFC] focus:bg-white focus:ring-4 focus:ring-blue-100/50 outline-none transition-all duration-300 shadow-sm"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#007EFC] text-white font-bold py-3 rounded-2xl shadow-[0_8px_25px_rgba(0,126,252,0.25)] hover:bg-[#006ee0] hover:shadow-blue-300 active:scale-[0.97] transition-all duration-300 flex items-center justify-center gap-3 text-lg disabled:opacity-70"
              >
                {isLoading ? "Verifying..." : "Verify & Proceed"}
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-gray-500 text-sm font-medium">
                Didn&apos;t receive any code?{" "}
                {canResend ? (
                  <button
                    onClick={handleResend}
                    disabled={isResending}
                    type="button"
                    className="text-[#007EFC] font-extrabold hover:text-blue-700 transition-colors ml-1 underline underline-offset-4"
                  >
                    {isResending ? "Sending..." : "Resend OTP"}
                  </button>
                ) : (
                  <span className="text-gray-400 ml-1">
                    Resend in <span className="font-bold text-gray-600">{timer}s</span>
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VerifyOtp;
