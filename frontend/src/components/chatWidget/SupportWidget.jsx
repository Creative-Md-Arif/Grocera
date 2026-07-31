import { useState } from "react";
import { FaTimes, FaCommentDots } from "react-icons/fa";
import ChatWidget from "./ChatWidget";
import QuickConnect from "./QuickConnect";

const SupportWidget = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleMainClick = () => {
    if (isChatOpen) {
      setIsChatOpen(false);
      return;
    }
    setIsExpanded((prev) => !prev);
  };

  const handleLiveChatClick = () => {
    setIsChatOpen(true);
    setIsExpanded(false);
  };

  const isMainOpen = isExpanded || isChatOpen;

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Chat প্যানেল */}
      <ChatWidget open={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Expand হওয়া আইকনগুলো */}
      {isExpanded && !isChatOpen && (
        <div className="absolute bottom-20 right-0 flex flex-col items-end gap-3 animate-fade-in-up">
          <QuickConnect />

          {/* Live Chat বাটন */}
          <div className="group relative">
            <span className="absolute right-full top-1/2 -translate-y-1/2 mr-3 whitespace-nowrap bg-gray-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-md opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 pointer-events-none shadow-lg">
              Live Chat
              <span className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></span>
            </span>
            <button
              onClick={handleLiveChatClick}
              className="w-12 h-12 rounded-full bg-[#3749BB] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            >
              <FaCommentDots size={20} />
            </button>
          </div>
        </div>
      )}

      {/* মূল Floating Action Button */}
      <div className="group relative">
        {!isMainOpen && (
          <span className="absolute right-full top-1/2 -translate-y-1/2 mr-3 whitespace-nowrap bg-gray-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-md opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 pointer-events-none shadow-lg">
            Chat with us
            <span className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></span>
          </span>
        )}
        <button
          onClick={handleMainClick}
          className="w-14 h-14 bg-[#3749BB] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform relative"
        >
          {isMainOpen ? <FaTimes size={22} /> : <FaCommentDots size={24} />}
          {!isMainOpen && (
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
          )}
        </button>
      </div>
    </div>
  );
};

export default SupportWidget;