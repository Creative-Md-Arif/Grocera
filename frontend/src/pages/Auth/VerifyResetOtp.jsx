import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useForgotPasswordMutation,
  useVerifyResetOtpMutation,
} from "../../redux/api/usersApiSlice";
import { Helmet } from "react-helmet-async";

const VerifyResetOtp = () => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [resendTimer, setResendTimer] = useState(120);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const inputRefs = useRef([]);

  const [verifyResetOtp, { isLoading }] = useVerifyResetOtpMutation();
  const [forgotPassword, { isLoading: isResending }] = useForgotPasswordMutation();

  useEffect(() => {
    if (!email) navigate("/forgot-password");
  }, [email, navigate]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((r) => r - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleChange = useCallback((element, index) => {
    const val = element.value;
    if (val && !/^[0-9]+$/.test(val)) return;

    setOtp((prevOtp) => {
      const newOtp = [...prevOtp];
      newOtp[index] = val;
      return newOtp;
    });

    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }, []);

  const handleKeyDown = useCallback((e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      setOtp((prevOtp) => {
        const newOtp = [...prevOtp];
        newOtp[index - 1] = "";
        return newOtp;
      });
      inputRefs.current[index - 1]?.focus();
    }
  }, [otp]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6)
      .split("");

    if (pastedData.length === 0) return;

    setOtp((prevOtp) => {
      const newOtp = [...prevOtp];
      pastedData.forEach((char, idx) => {
        if (idx < 6) newOtp[idx] = char;
      });
      return newOtp;
    });

    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  }, []);

  const handleResend = useCallback(async () => {
    try {
      await forgotPassword({ email }).unwrap();
      toast.success("New OTP sent!");
      setResendTimer(120);
      setOtp(new Array(6).fill(""));
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to resend");
    }
  }, [forgotPassword, email]);

  const submitHandler = useCallback(
    async (e) => {
      e.preventDefault();
      const finalOtp = otp.join("");

      if (finalOtp.length !== 6) {
        return toast.error("Please enter all 6 digits");
      }

      try {
        const res = await verifyResetOtp({ email, otp: finalOtp }).unwrap();
        toast.success("OTP Verified!");
        navigate("/reset-password", {
          state: { email, resetToken: res.resetToken },
        });
      } catch (err) {
        toast.error(err?.data?.message || "Invalid OTP");
        setOtp(new Array(6).fill(""));
        inputRefs.current[0]?.focus();
      }
    },
    [otp, email, verifyResetOtp, navigate]
  );

  return (
    <section
      className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 font-trebuchet"
      style={{ fontFamily: '"Trebuchet MS", sans-serif' }}
    >
      <Helmet>
        <title>Verify OTP | Veloura</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="w-full max-w-[460px] bg-white shadow-xl rounded-2xl p-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Verify OTP</h1>
        <p className="text-gray-500 mb-8">Sent to {email}</p>
        <form onSubmit={submitHandler}>
          <div className="flex justify-center gap-2 mb-8">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={data}
                ref={(el) => (inputRefs.current[index] = el)}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                aria-label={`OTP digit ${index + 1}`}
                className="w-12 h-14 text-center text-xl font-bold border-2 rounded-xl focus:border-[#007EFC] outline-none transition-all"
              />
            ))}
          </div>
          <button
            disabled={isLoading}
            className="w-full bg-[#007EFC] text-white font-bold py-4 rounded-xl hover:bg-[#006ee0] disabled:opacity-70 transition-all"
          >
            {isLoading ? "Verifying..." : "Verify Code"}
          </button>

          <div className="mt-4">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendTimer > 0 || isResending}
              className="text-sm text-[#007EFC] hover:underline disabled:text-gray-400 disabled:no-underline font-medium transition-colors"
            >
              {isResending
                ? "Sending..."
                : resendTimer > 0
                  ? `Resend in ${formatTime(resendTimer)}`
                  : "Resend OTP"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default VerifyResetOtp;
