import { useState, memo, useMemo, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client"; // 🆕 ইম্পোর্ট করা হয়েছে
import { SOCKET_URL } from "../../../redux/constants"; // 🆕 আপনার constants ফাইলের সঠিক লোকেশন দিন
import AdminMenu from "../AdminMenu"; // 🆕 আপনার ফোল্ডার স্ট্রাকচার অনুযায়ী পাথ ঠিক করুন
import {
  useFetchChatsQuery,
  useFetchMessagesQuery,
  useSendMessageMutation,
} from "@redux/api/chatApiSlice";
import { toast } from "react-toastify";
import {
  FaComments,
  FaEye,
  FaTimes,
  FaPaperPlane,
  FaClock,
  FaUserCircle,
} from "react-icons/fa";

// --- Skeleton Loaders ---
const StatsSkeleton = () => (
  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="bg-white border border-gray-200 p-4 rounded-sm h-24 animate-pulse"></div>
    ))}
  </div>
);

const TableSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="h-14 border-b border-gray-100 last:border-0 animate-pulse bg-gray-50"></div>
    ))}
  </div>
);

// --- Memoized Row ---
const ChatRow = memo(function ChatRow({ chat, index, openChatModal }) {
  const participant =
    chat.participants?.find((p) => p.isAdmin !== true) ||
    chat.participants?.[0];

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.02 }}
      className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200">
            <FaUserCircle size={20} />
          </div>
          <div>
            <span className="text-sm font-bold text-black block">
              {participant?.username || "Unknown User"}
            </span>
            <span className="text-xs text-gray-400">
              {participant?.email || "No email"}
            </span>
          </div>
        </div>
      </td>

      <td className="px-4 py-3 hidden md:table-cell">
        <p className="text-sm text-gray-600 italic truncate max-w-[300px]">
          {chat.lastMessage || "No messages yet"}
        </p>
      </td>

      <td className="px-4 py-3 text-sm text-gray-500 uppercase tracking-wider hidden lg:table-cell">
        {new Date(chat.updatedAt).toLocaleString("en-GB", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </td>

      <td className="px-4 py-3 text-right">
        <button
          onClick={() => openChatModal(chat)}
          className="py-2 px-3 border border-black bg-black text-white hover:bg-gray-800 text-sm font-bold uppercase tracking-widest transition-all rounded-sm inline-flex items-center gap-1"
        >
          <FaEye size={12} /> View Chat
        </button>
      </td>
    </motion.tr>
  );
});

ChatRow.propTypes = {
  chat: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  openChatModal: PropTypes.func.isRequired,
};

const ChatManage = () => {
  const { data: chats, isLoading, refetch } = useFetchChatsQuery();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [socket, setSocket] = useState(null);

  const {
    data: messages,
    isLoading: msgLoading,
    refetch: refetchMessages,
  } = useFetchMessagesQuery(selectedChat?._id, {
    skip: !selectedChat?._id,
  });

  const [sendMessage] = useSendMessageMutation();
  const messagesEndRef = useRef(null);

  // selectedChat/refetchMessages-এর সর্বশেষ মান ref-এ রাখা হচ্ছে, যাতে
  // socket listener কখনো stale (পুরনো) মান না ধরে
  const selectedChatRef = useRef(selectedChat);
  const refetchMessagesRef = useRef(refetchMessages);
  useEffect(() => {
    selectedChatRef.current = selectedChat;
    refetchMessagesRef.current = refetchMessages;
  }, [selectedChat, refetchMessages]);

  // 🆕 Socket.io সংযোগ — একবারই (mount-এ) তৈরি হয়, selectedChat বদলালে
  // আর disconnect/reconnect হবে না
  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on("receiveMessage", (newMessage) => {
      // যদি মেসেজটি বর্তমানে ওপেন থাকা চ্যাটের হয়, তবে রিফ্রেশ করবে
      if (selectedChatRef.current && newMessage.chatId === selectedChatRef.current._id) {
        refetchMessagesRef.current();
      }
      refetch();
    });

    return () => {
      newSocket.disconnect();
    };
  }, [refetch]);

  // 🆕 selectedChat বদলালে (বা socket রেডি হলে) সেই room-এ join করা —
  // openChatModal-এর ভেতর থেকে সরিয়ে এখানে আনা হলো, যাতে race condition না হয়
  useEffect(() => {
    if (socket && selectedChat?._id) {
      socket.emit("joinChat", selectedChat._id);
    }
  }, [socket, selectedChat]);

  // অটো স্ক্রল টু বটম
  useEffect(() => {
    if (messages && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const chatList = useMemo(() => chats || [], [chats]);

  const stats = useMemo(() => {
    const total = chatList.length;
    const active = chatList.filter(
      (c) => new Date() - new Date(c.updatedAt) < 86400000,
    ).length;
    return { total, active };
  }, [chatList]);

  const openChatModal = (chat) => {
    setSelectedChat(chat);
    setIsModalOpen(true);
    // room join এখন উপরের useEffect([socket, selectedChat]) নিজেই করবে
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedChat) return;

    try {
      const formData = new FormData();
      formData.append("content", messageText);

      await sendMessage({ chatId: selectedChat._id, formData }).unwrap();
      setMessageText("");
      refetchMessages();
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to send message");
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-['Trebuchet_MS'] pb-16">
      <AdminMenu />

      <main className="pt-24 px-4 lg:pl-[260px] transition-all duration-300">
        <div className="max-w-[1500px] mx-auto">
          <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between">
            <div>
              <h2 className="text-base font-['Playfair_Display'] font-bold text-gray-700 uppercase tracking-wider mb-6 border-b border-gray-100 pb-3 flex items-center gap-2">
                Manage Customer Chats
              </h2>
            </div>
            <button
              onClick={refetch}
              className="inline-flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-sm text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
            >
              Refresh Chats
            </button>
          </header>

          {isLoading ? (
            <StatsSkeleton />
          ) : (
            <section className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <div className="bg-white border border-gray-200 p-4 rounded-sm hover:border-black transition-colors flex items-center gap-3">
                <FaComments className="text-xl text-gray-400" />
                <div>
                  <p className="text-sm uppercase tracking-widest text-gray-500 font-bold">
                    Total Chats
                  </p>
                  <p className="text-xl font-black text-black font-['Playfair_Display']">
                    {stats.total}
                  </p>
                </div>
              </div>
              <div className="bg-white border border-gray-200 p-4 rounded-sm hover:border-black transition-colors flex items-center gap-3">
                <FaClock className="text-xl text-green-500" />
                <div>
                  <p className="text-sm uppercase tracking-widest text-gray-500 font-bold">
                    Active (24h)
                  </p>
                  <p className="text-xl font-black text-black font-['Playfair_Display']">
                    {stats.active}
                  </p>
                </div>
              </div>
            </section>
          )}

          {isLoading ? (
            <TableSkeleton />
          ) : chatList.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-gray-200 rounded-sm bg-white">
              <FaComments className="text-5xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">
                No chats found.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-sm overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-widest text-gray-500">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-widest text-gray-500 hidden md:table-cell">
                      Last Message
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-widest text-gray-500 hidden lg:table-cell">
                      Time
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-bold uppercase tracking-widest text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {chatList.map((chat, index) => (
                    <ChatRow
                      key={chat._id}
                      chat={chat}
                      index={index}
                      openChatModal={openChatModal}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {isModalOpen && selectedChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-sm w-full max-w-2xl h-[80vh] flex flex-col shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-4 border-b">
                <div>
                  <h3 className="text-lg font-bold uppercase tracking-wider">
                    Chat with{" "}
                    {selectedChat.participants?.find((p) => p.isAdmin !== true)
                      ?.username || "User"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-black"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {msgLoading ? (
                  <p className="text-center text-gray-400">
                    Loading messages...
                  </p>
                ) : (
                  messages?.length > 0 && messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`flex ${msg.sender?.isAdmin ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg shadow-sm ${
                          msg.sender?.isAdmin
                            ? "bg-black text-white rounded-br-none"
                            : "bg-white border border-gray-200 rounded-bl-none"
                        }`}
                      >
                        {msg.imageUrl && (
                          <img
                            src={msg.imageUrl}
                            alt="Chat"
                            className="mb-2 rounded max-w-full h-auto"
                          />
                        )}
                        {msg.content && <p className="text-sm">{msg.content}</p>}
                        <span
                          className={`text-[10px] block mt-1 ${msg.sender?.isAdmin ? "text-gray-300" : "text-gray-400"}`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t bg-white flex gap-2"
              >
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your reply..."
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-sm focus:outline-none focus:border-black text-sm"
                />
                <button
                  type="submit"
                  className="bg-black text-white px-4 py-2 rounded-sm hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm font-bold uppercase tracking-wider"
                >
                  <FaPaperPlane size={14} /> Send
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatManage;