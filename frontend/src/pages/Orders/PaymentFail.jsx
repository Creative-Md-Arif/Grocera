import { useNavigate, useSearchParams } from "react-router-dom";
import { FaTimesCircle } from "react-icons/fa";

const PaymentFail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tranId = searchParams.get("tran_id"); // ✅ এটি এখানে ব্যবহার করা হচ্ছে
  const error = searchParams.get("error");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg border border-gray-200 text-center max-w-md w-full">
        <FaTimesCircle className="text-red-500 text-5xl mx-auto mb-4" />
        <h1 className="text-2xl font-mono font-black text-black uppercase mb-2">
          Payment Failed!
        </h1>
        <p className="text-gray-500 font-mono text-sm mb-6">
          Unfortunately, your payment could not be processed.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-xs font-mono text-red-600">{error}</p>
          </div>
        )}

        {/* ✅ ট্রানজেকশন আইডিটি UI তে শো করানো হচ্ছে, যার ফলে ESLint এরর আসবে না */}
        {tranId && (
          <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded-md">
            <p className="text-xs font-mono text-gray-500 uppercase tracking-wider">Failed Transaction ID</p>
            <p className="text-sm font-mono font-bold text-black mt-1">{tranId}</p>
          </div>
        )}

        <button
          onClick={() => navigate("/cart")}
          className="w-full bg-black text-white font-mono font-bold text-xs uppercase tracking-widest py-3 rounded-md hover:bg-gray-800 transition-colors"
        >
          Try Again
        </button>
        
        <button
          onClick={() => navigate("/")}
          className="w-full mt-3 border border-gray-300 text-gray-600 font-mono font-bold text-xs uppercase tracking-widest py-3 rounded-md hover:bg-gray-50 transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default PaymentFail;