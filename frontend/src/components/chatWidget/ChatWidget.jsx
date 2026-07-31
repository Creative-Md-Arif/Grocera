/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import {
  useAccessChatMutation,
  useFetchMessagesQuery,
  useSendMessageMutation,
} from "@redux/api/chatApiSlice";
import { SOCKET_URL } from "../../redux/constants";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FaTimes, FaPaperPlane, FaCommentDots, FaImage } from "react-icons/fa";

const ChatWidget = ({ open, onClose }) => {
  const { userInfo } = useSelector((state) => state.auth);

  const [chatId, setChatId] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  const [accessChat, { isLoading: isAccessingChat, error: accessChatError }] =
    useAccessChatMutation();
    
  // 🆕 isSending স্টেট নেওয়া হয়েছে বাটনের লোডিং এর জন্য
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();

  const { data: messages, refetch: refetchMessages } = useFetchMessagesQuery(
    chatId,
    { skip: !chatId }
  );

  const chatIdRef = useRef(chatId);
  useEffect(() => {
    chatIdRef.current = chatId;
  }, [chatId]);

  useEffect(() => {
    if (!userInfo) return;

    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on("receiveMessage", () => {
      if (chatIdRef.current) refetchMessages();
    });

    return () => newSocket.close();
  }, [userInfo, refetchMessages]);

  useEffect(() => {
    if (socket && chatId) {
      socket.emit("joinChat", chatId);
    }
  }, [socket, chatId]);

  // চ্যাট প্যানেল open হলে এবং ইউজার লগইন করা থাকলে চ্যাট রুম init করা
  useEffect(() => {
    if (open && userInfo && !chatId && !userInfo.isAdmin) {
      accessChat()
        .unwrap()
        .then((res) => setChatId(res._id))
        .catch((err) => {
          console.error("Failed to init chat", err);
          toast.error(err?.data?.error || "Could not connect to chat server.");
        });
    }
  }, [open, userInfo, chatId, accessChat]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();

    if (!chatId) {
      toast.error("Please wait, connecting to chat...");
      return;
    }
    if (!messageText.trim() && !imageFile) return;

    const formData = new FormData();
    if (messageText.trim()) formData.append("content", messageText);
    if (imageFile) formData.append("image", imageFile);

    try {
      await sendMessage({ chatId, formData }).unwrap();
      setMessageText("");
      setImageFile(null);
      refetchMessages();
    } catch (error) {
      toast.error(error?.data?.error || "Failed to send message");
    }
  };

  if (userInfo?.isAdmin) return null;
  if (!open) return null;

  // 🆕 font-['Trebuchet_MS'] যুক্ত করা হয়েছে এবং রেস্পন্সিভ ক্লাস রাখা হয়েছে
  return (
    <div className="w-[calc(100vw-2rem)] sm:w-[340px] max-w-[340px] h-[70vh] max-h-[360px] bg-white rounded-xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden absolute bottom-20 right-0 animate-fade-in-up z-50 font-['Trebuchet_MS']">
      {/* Header */}
      <div className="bg-[#3749BB] text-white p-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <FaCommentDots size={16} />
          </div>
          <div>
            <h4 className="font-bold text-sm">Veloura Support</h4>
            <p className="text-[10px] text-green-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> Online
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
          <FaTimes size={16} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
        {!userInfo ? (
          <p className="text-center text-gray-500 text-xs mt-10 px-4">
            Please login to chat with our support team directly.
          </p>
        ) : (
          <>
            {isAccessingChat && (
              <p className="text-center text-gray-400 text-xs mt-10 flex items-center justify-center gap-2">
                <span className="w-3 h-3 border-2 border-gray-300 border-t-[#3749BB] rounded-full animate-spin"></span>
                Connecting to support...
              </p>
            )}
            {accessChatError && (
              <p className="text-center text-red-500 text-xs mt-10">
                {accessChatError?.data?.error || "Failed to load chat."}
              </p>
            )}
            {messages?.length === 0 && !isAccessingChat && !accessChatError && (
              <p className="text-center text-gray-400 text-xs mt-10">
                No messages yet. Say Hi!
              </p>
            )}
            {messages?.map((msg) => {
              const isMine = msg.sender?._id === userInfo?._id;
              return (
                <div
                  key={msg._id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] p-2.5 rounded-lg shadow-sm ${
                      isMine
                        ? "bg-[#3749BB] text-white rounded-br-none"
                        : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    {msg.imageUrl && (
                      <img
                        src={msg.imageUrl}
                        alt="Chat"
                        className="mb-1.5 rounded-md max-w-full max-h-[150px] w-auto h-auto object-cover"
                      />
                    )}
                    {msg.content && (
                      <p className="text-[13px] leading-snug break-words">{msg.content}</p>
                    )}
                    <span
                      className={`text-[9px] block mt-1 text-right ${
                        isMine ? "text-white/70" : "text-gray-400"
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      {userInfo && (
        <form
          onSubmit={handleSend}
          className="p-2.5 border-t border-gray-100 bg-white flex items-center gap-2 shrink-0"
        >
          <label
            className={`cursor-pointer p-2 ${
              !chatId || isSending
                ? "text-gray-300 pointer-events-none"
                : "text-gray-500 hover:text-[#3749BB]"
            }`}
          >
            <FaImage size={18} />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setImageFile(e.target.files[0])}
              disabled={!chatId || isSending}
            />
          </label>

          {imageFile && (
            <div className="relative shrink-0">
              <img
                src={URL.createObjectURL(imageFile)}
                alt="Preview"
                className="w-10 h-10 object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => setImageFile(null)}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px]"
              >
                ×
              </button>
            </div>
          )}

          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder={chatId ? "Type a message..." : "Connecting..."}
            disabled={!chatId || isSending}
            className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-[13px] focus:outline-none focus:border-[#3749BB] disabled:opacity-50"
          />
          
          {/* 🆕 কাস্টম স্পিনার সহ সেন্ড বাটন */}
          <button
            type="submit"
            disabled={!chatId || isSending}
            className="w-9 h-9 bg-[#3749BB] text-white rounded-full flex items-center justify-center hover:bg-[#2a379c] transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FaPaperPlane size={14} />
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default ChatWidget;