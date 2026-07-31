import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useProfileMutation } from "../../redux/api/usersApiSlice";
import { setCredentials } from "../../redux/features/auth/authSlice";
import { Link, useNavigate,  } from "react-router-dom";

import Swal from "sweetalert2";
import { BsPersonCircle, BsShieldLock } from "react-icons/bs";
import { FaHome } from "react-icons/fa";
import { HiChevronRight } from "react-icons/hi";

const Profile = () => {
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { userInfo } = useSelector((state) => state.auth);
  const [updateProfile, { isLoading: loadingUpdateProfile }] =
    useProfileMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (userInfo) {
      setUserName(userInfo.username || "");
      setEmail(userInfo.pendingEmail || userInfo.email || "");
    }
  }, [userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!username.trim() || !email.trim()) {
      return toast.error("Name and Email are required");
    }

    const isNameChanging = username.trim() !== userInfo?.username;
    const initialEmail = userInfo?.pendingEmail || userInfo?.email || "";
    const isEmailChanging =
      email.toLowerCase().trim() !== initialEmail.toLowerCase().trim();
    const isPasswordChanging =
      newPassword.length > 0 || confirmPassword.length > 0;

    if (
      !isNameChanging &&
      !isEmailChanging &&
      !isPasswordChanging &&
      !currentPassword
    ) {
      return toast.info("No changes were made to update.");
    }

    if (currentPassword && !isPasswordChanging && !isEmailChanging) {
      return toast.error(
        "Please enter a new password if you want to change your password.",
      );
    }

    if (isPasswordChanging) {
      if (!currentPassword) {
        return toast.error(
          "Current password is required to set a new password.",
        );
      }
      if (newPassword.length < 8) {
        return toast.error("New password must be at least 8 characters.");
      }
      if (newPassword !== confirmPassword) {
        return toast.error("New and Confirm passwords do not match.");
      }
    }

    if (isEmailChanging && !currentPassword) {
      return toast.error(
        "Current password is required to update your email address.",
      );
    }

    const result = await Swal.fire({
      title: "Confirm Update?",
      text: isEmailChanging
        ? "Changing your email requires OTP verification. Proceed?"
        : "Are you sure you want to change your profile details?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#1D4ED8",
      cancelButtonColor: "#EF4444",
      confirmButtonText: "Yes, Save Changes",
    });

    if (result.isConfirmed) {
      try {
        const updateData = {
          _id: userInfo?._id,
          username,
          email,
        };

        if (isPasswordChanging) {
          updateData.currentPassword = currentPassword;
          updateData.newPassword = newPassword;
        }

        if (isEmailChanging) {
          updateData.currentPassword = currentPassword;
        }

        const res = await updateProfile(updateData).unwrap();
        dispatch(setCredentials({ ...res }));

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        if (res.message && res.message.includes("OTP")) {
          toast.info(res.message);
          navigate("/verify-email", { state: { email: email } });
        } else {
          toast.success("Profile updated successfully");
        }
      } catch (err) {
        toast.error(err?.data?.message || err.error || "An error occurred");
      }
    }
  };

  return (
    <div className="bg-[#F9FAFB] min-h-screen">
      {/* ✅ Unified Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-screen-2xl mx-auto px-4">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-[14px] font-playfair font-medium flex-wrap py-4 bg-white"
          >
            {/* Home Link with FaHome Icon */}
            <Link
              to="/"
              className="flex items-center gap-1.5 text-black hover:underline text-[14px] font-medium"
            >
              <FaHome className="text-[14px]" />
              <span>Home</span>
            </Link>

            {/* Profile Link with HiChevronRight Icon */}
            <span className="contents">
              <HiChevronRight className="text-[14px] text-black flex-shrink-0" />
              <Link
                to="/profile"
                className="text-black hover:underline text-[14px] font-medium"
              >
                Profile
              </Link>
            </span>

            {/* Current Page: Settings */}
            <span className="contents">
              <HiChevronRight className="text-[14px] text-black flex-shrink-0" />
              <span className="text-black font-black text-[14px]">
                Settings
              </span>
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10">
        {/* ✅ Unified Tab Navigation */}
     

        {/* ✅ Unified Container Width (max-w-5xl) */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 hover:border-gray-300 transition-all duration-300 overflow-hidden">
            <div className="p-5 md:p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50/30 to-transparent">
              <h2 className="text-xl md:text-2xl font-mono font-black text-gray-900 uppercase tracking-tighter flex items-center gap-3">
                <BsPersonCircle className="text-blue-600" />
                Account <span className="text-blue-600">Settings</span>
              </h2>
              <p className="text-gray-500 text-xs font-mono mt-1 uppercase tracking-wider">
                Update your personal information and security
              </p>
            </div>

            <form
              onSubmit={submitHandler}
              className="p-5 md:p-8 space-y-6 md:space-y-8"
            >
              <div className="space-y-5 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-mono font-black text-gray-600 uppercase tracking-wider ml-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all outline-none font-mono text-sm md:text-base text-gray-900 placeholder-gray-400"
                      value={username}
                      onChange={(e) => setUserName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono font-black text-gray-600 uppercase tracking-wider ml-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="email@example.com"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all outline-none font-mono text-sm md:text-base text-gray-900 placeholder-gray-400"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    {userInfo?.pendingEmail && (
                      <p className="text-xs text-orange-500 font-mono font-bold">
                        ⚠️ This email is pending verification.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              <div className="space-y-5 md:space-y-6">
                <h3 className="text-sm font-mono font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <BsShieldLock /> Password Security
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-mono font-black text-gray-600 uppercase tracking-wider ml-1">
                      Current Password *
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all outline-none font-mono text-base text-gray-900 placeholder-gray-400"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 font-mono">
                      Required for email or password changes
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono font-black text-gray-600 uppercase tracking-wider ml-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all outline-none font-mono text-base text-gray-900 placeholder-gray-400"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-mono font-black text-gray-600 uppercase tracking-wider ml-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all outline-none font-mono text-base text-gray-900 placeholder-gray-400"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-5 flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-xs text-gray-500 font-mono italic text-center md:text-left">
                  * Current password required for email/password changes. Leave
                  new password blank to keep current.
                </p>

                <button
                  disabled={loadingUpdateProfile}
                  type="submit"
                  className="w-full md:w-auto bg-gray-900 text-white px-4 py-3 md:py-3.5 rounded-xl text-sm font-mono font-black uppercase tracking-widest hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-50"
                >
                  {loadingUpdateProfile ? "Processing..." : "Update Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
