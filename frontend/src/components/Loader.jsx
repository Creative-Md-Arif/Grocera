const Loader = () => {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <div
        className="w-10 h-10 border-[3px] border-gray-200 border-t-gray-900 rounded-full"
        style={{ animation: "spin 0.7s linear infinite" }}
      />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Loader;