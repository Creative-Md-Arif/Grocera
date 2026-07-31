/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useMemo, memo } from "react";
import {
  useGetQuestionsQuery,
  useAnswerQuestionMutation,
  useDeleteQuestionMutation,
} from "@redux/api/questionApiSlice";
import AdminMenu from "./AdminMenu";
import { toast } from "react-toastify";
import {
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaSortAmountDown,
  FaTrash,
  FaReply,
  FaTimes,
  FaQuestionCircle,
  FaCheckCircle,
} from "react-icons/fa";


// --- Skeletons ---
const TableSkeleton = () => (
  <div className="hidden md:block border border-gray-200 rounded-sm">
    <div className="bg-gray-50 border-b border-gray-200 p-4">
      <div className="flex gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>
        ))}
      </div>
    </div>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="p-4 border-b border-gray-100 flex gap-4 items-center">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        </div>
      </div>
    ))}
  </div>
);

const CardSkeleton = () => (
  <div className="md:hidden space-y-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="border border-gray-200 p-4 rounded-sm bg-white">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        </div>
      </div>
    ))}
  </div>
);

// --- Status Helper ---
const getStatusInfo = (isAnswered) => {
  if (isAnswered) return { label: "Answered", color: "green", dot: "bg-green-500", badge: "bg-green-50 border-green-500 text-green-600" };
  return { label: "Pending", color: "orange", dot: "bg-orange-500", badge: "bg-orange-50 border-orange-500 text-orange-600" };
};

// --- Desktop Row Component ---
const QuestionRow = memo(function QuestionRow({
  question,
  onOpenPopup,
  handleDelete,
  processingId,
}) {
  const statusInfo = getStatusInfo(question.isAnswered);

  return (
    <tr className="group hover:bg-gray-50 transition-colors align-top">
      <td className="px-4 py-3">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-black uppercase tracking-tight max-w-[300px] truncate font-['Playfair_Display']">
            {question.product?.name || "Unknown Product"}
          </span>
          <span className="text-sm text-gray-500 font-bold tracking-widest mt-1">
            Asked by: {question.user?.name || question.name || "Anonymous"}
          </span>
        </div>
      </td>

      <td className="px-4 py-3">
        <p className="text-sm text-gray-700 italic max-w-[400px]">
          {question.question}
        </p>
        {question.isAnswered && (
          <p className="text-xs text-blue-600 mt-2 max-w-[400px] truncate">
            <FaReply size={8} className="inline mr-1" /> {question.answer}
          </p>
        )}
      </td>

      <td className="px-4 py-3">
        <span className={`bg-white border text-xs font-bold uppercase tracking-widest px-2 py-1 rounded-sm inline-flex items-center gap-1 w-fit ${statusInfo.badge}`}>
          {question.isAnswered ? <FaCheckCircle size={10} /> : <FaQuestionCircle size={10} />}
          {statusInfo.label}
        </span>
      </td>

      <td className="px-4 py-3">
        <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">
          {new Date(question.createdAt).toLocaleDateString()}
        </span>
      </td>

      <td className="px-4 py-3 text-right">
        <div className="inline-flex gap-2 flex-wrap justify-end">
          <button
            onClick={() => onOpenPopup(question)}
            disabled={processingId === question._id}
            className="py-2 px-3 border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 text-sm font-bold uppercase tracking-widest transition-all rounded-sm inline-flex items-center gap-1 disabled:opacity-50"
          >
            {question.isAnswered ? "Edit" : "Reply"}
          </button>
          <button
            onClick={() => handleDelete(question._id)}
            disabled={processingId === question._id}
            className="py-2 px-3 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 text-sm font-bold uppercase tracking-widest transition-all rounded-sm inline-flex items-center gap-1 disabled:opacity-50"
          >
            {processingId === question._id ? (
              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <><FaTrash size={12} /></>
            )}
          </button>
        </div>
      </td>
    </tr>
  );
});

// --- Mobile Card Component ---
const QuestionCard = memo(function QuestionCard({
  question,
  onOpenPopup,
  handleDelete,
  processingId,
}) {
  const statusInfo = getStatusInfo(question.isAnswered);

  return (
    <div className="border border-gray-200 p-4 rounded-sm bg-white hover:border-black transition-colors">
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-bold text-black uppercase tracking-tight truncate font-['Playfair_Display']">
          {question.product?.name || "Unknown Product"}
        </h3>
        <p className="text-sm text-gray-500 font-bold tracking-widest mt-1">
          By: {question.user?.name || "Anonymous"}
        </p>
      </div>

      <div className="mt-4 border-t border-gray-100 pt-4">
        <p className="text-sm text-gray-700 italic mb-3">{question.question}</p>
        {question.isAnswered && (
          <p className="text-xs text-blue-600 mb-3 bg-blue-50 p-2 rounded-sm border-l-2 border-blue-600">
            <strong>Reply:</strong> {question.answer}
          </p>
        )}
        
        <div className="flex items-center justify-between mt-4">
          <span className={`bg-white border text-xs font-bold uppercase tracking-widest px-2 py-1 rounded-sm inline-flex items-center gap-1 ${statusInfo.badge}`}>
            {statusInfo.label}
          </span>
          
          <div className="flex gap-2">
            <button
              onClick={() => onOpenPopup(question)}
              disabled={processingId === question._id}
              className="flex-1 py-2 px-3 border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white text-xs font-bold uppercase tracking-widest transition-all rounded-sm inline-flex items-center justify-center gap-1 disabled:opacity-50"
            >
              <FaReply size={10} /> {question.isAnswered ? "Edit" : "Reply"}
            </button>
            <button
              onClick={() => handleDelete(question._id)}
              disabled={processingId === question._id}
              className="flex-1 py-2 px-3 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white text-xs font-bold uppercase tracking-widest transition-all rounded-sm inline-flex items-center justify-center gap-1 disabled:opacity-50"
            >
              {processingId === question._id ? (
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <FaTrash size={10} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

const QuestionManager = () => {
  const { data: questions, isLoading, isError } = useGetQuestionsQuery();
  const [answerQuestion] = useAnswerQuestionMutation();
  const [deleteQuestion] = useDeleteQuestionMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [processingId, setProcessingId] = useState(null);
  
  const [popupData, setPopupData] = useState(null);

  const handleOpenPopup = (question) => {
    setPopupData({ question, answer: question.answer || "" });
  };

  const handleClosePopup = () => {
    setPopupData(null);
  };

  const handleSaveAnswer = async () => {
    if (!popupData) return;
    const { question, answer } = popupData;
    if (!answer.trim()) {
      toast.error("Answer cannot be empty");
      return;
    }

    setProcessingId(question._id);
    try {
      await answerQuestion({ questionId: question._id, answer }).unwrap();
      toast.success("Reply saved successfully");
      handleClosePopup();
    } catch (err) {
      toast.error("Failed to save reply");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (questionId) => {
    setProcessingId(questionId);
    try {
      await deleteQuestion(questionId).unwrap();
      toast.success("Question deleted");
    } catch (err) {
      toast.error("Failed to delete question");
    } finally {
      setProcessingId(null);
    }
  };

  // Filtering and sorting
  const sortedQuestions = useMemo(() => {
    if (!questions) return [];
    const filtered = questions.filter((q) =>
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return [...filtered].sort((a, b) => {
      if (sortConfig.key === "isAnswered") {
        if (a.isAnswered === b.isAnswered) return 0;
        return sortConfig.direction === "asc" ? (a.isAnswered ? 1 : -1) : (a.isAnswered ? -1 : 1);
      }
      if (sortConfig.key === "product") {
        const valA = a.product?.name || "";
        const valB = b.product?.name || "";
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      }
      if (sortConfig.key === "createdAt") {
         return sortConfig.direction === "asc" 
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });
  }, [questions, searchTerm, sortConfig]);

  const totalPages = Math.ceil(sortedQuestions.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentQuestions = sortedQuestions.slice(indexOfFirstItem, indexOfLastItem);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  if (isError) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600 font-['Trebuchet_MS'] font-bold italic text-lg">
        ERROR: FAILED_TO_LOAD_QUESTIONS
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-['Trebuchet_MS'] pb-16">
      <AdminMenu />

      {/* ===== Answer Popup Modal ===== */}
      {popupData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white p-6 rounded-sm shadow-xl w-full max-w-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-black uppercase tracking-widest text-sm">
                Reply to Question
              </h3>
              <button onClick={handleClosePopup} className="text-gray-400 hover:text-black transition-colors">
                <FaTimes size={16} />
              </button>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-sm border border-gray-200 mb-4">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">Question:</p>
              <p className="text-sm text-gray-700 italic">{popupData.question.question}</p>
            </div>

            <div className="flex flex-col gap-2 mb-4">
              <label className="text-xs text-gray-500 uppercase font-bold">Your Reply:</label>
              <textarea
                rows="4"
                value={popupData.answer}
                onChange={(e) => setPopupData({ ...popupData, answer: e.target.value })}
                className="w-full p-3 bg-white border border-gray-200 rounded-sm outline-none text-sm resize-none text-gray-800 focus:ring-1 focus:ring-black"
                autoFocus
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleClosePopup}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-100 text-sm font-bold uppercase tracking-widest transition-all rounded-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAnswer}
                disabled={processingId === popupData.question._id}
                className="flex-1 py-2.5 bg-black text-white hover:bg-red-600 text-sm font-bold uppercase tracking-widest transition-all rounded-sm flex items-center justify-center disabled:opacity-50"
              >
                {processingId === popupData.question._id ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Save Reply"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="pt-24 px-4 lg:pl-[260px] transition-all duration-300">
        <div className="max-w-[1500px] mx-auto">
          <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between">
            <div>
              <p className="text-sm text-gray-500 font-bold tracking-widest uppercase mt-2">
                Total Questions: {sortedQuestions.length}
              </p>
            </div>

            <div className="relative group w-full md:w-96">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors text-sm" />
              <input
                type="text"
                placeholder="SEARCH QUESTIONS..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white border border-gray-200 rounded-sm py-3 pl-10 pr-4 text-sm font-bold text-black focus:ring-1 focus:ring-black focus:border-black outline-none transition-all placeholder:text-gray-400 placeholder:font-normal"
              />
            </div>
          </header>

          <section className="bg-black text-white p-4 mb-6 flex flex-wrap items-center justify-between gap-4 rounded-sm border border-gray-800">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Page Size:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-transparent border border-gray-700 text-sm font-bold px-3 py-1.5 focus:outline-none focus:border-red-600 cursor-pointer rounded-sm"
                >
                  {[5, 10, 20, 50].map((val) => (
                    <option key={val} value={val} className="text-black">{val}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="hidden md:block text-sm font-bold tracking-widest text-gray-500 italic">
              STATUS: SECURE_ACCESS
            </div>
          </section>

          {isLoading ? (
            <>
              <CardSkeleton />
              <TableSkeleton />
            </>
          ) : (
            <>
              {/* MOBILE VIEW */}
              <div className="md:hidden space-y-4">
                {currentQuestions.length > 0 ? (
                  currentQuestions.map((q) => (
                    <QuestionCard
                      key={q._id}
                      question={q}
                      onOpenPopup={handleOpenPopup}
                      handleDelete={handleDelete}
                      processingId={processingId}
                    />
                  ))
                ) : (
                  <div className="text-center py-16 text-gray-400 font-bold uppercase tracking-widest text-sm">
                    No Questions Found
                  </div>
                )}
              </div>

              {/* DESKTOP VIEW */}
              <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-sm bg-white">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {[
                        { label: "Product & User", key: "product" },
                        { label: "Question", key: null },
                        { label: "Status", key: "isAnswered" },
                        { label: "Date", key: "createdAt" },
                        { label: "Action", key: null },
                      ].map((col, i) => (
                        <th
                          key={i}
                          onClick={() => col.key && handleSort(col.key)}
                          className={`px-4 py-3 text-sm font-bold uppercase tracking-widest text-gray-500 ${col.key ? "cursor-pointer hover:text-black" : ""} transition-colors`}
                        >
                          <div className="flex items-center gap-1.5">
                            {col.label}
                            {col.key && (
                              <FaSortAmountDown
                                size={12}
                                className={sortConfig.key === col.key ? "text-black" : "text-gray-300"}
                              />
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentQuestions.length > 0 ? (
                      currentQuestions.map((q) => (
                        <QuestionRow
                          key={q._id}
                          question={q}
                          onOpenPopup={handleOpenPopup}
                          handleDelete={handleDelete}
                          processingId={processingId}
                        />
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-16 text-gray-400 font-bold uppercase tracking-widest text-sm">
                          No Questions Found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Navigation */}
              {currentQuestions.length > 0 && (
                <nav className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 pt-6">
                  <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                    Showing{" "}
                    <span className="text-black font-black">
                      {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, sortedQuestions.length)}
                    </span>{" "}
                    of <span className="text-red-600 font-black">{sortedQuestions.length}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-3 border border-gray-200 text-black hover:border-black disabled:opacity-20 disabled:cursor-not-allowed transition-all rounded-sm"
                      aria-label="Previous Page"
                    >
                      <FaChevronLeft size={14} />
                    </button>

                    <div className="flex gap-1">
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-10 h-10 text-sm font-bold transition-all rounded-sm ${currentPage === i + 1 ? "bg-black text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-black hover:text-black"}`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-3 border border-gray-200 text-black hover:border-black disabled:opacity-20 disabled:cursor-not-allowed transition-all rounded-sm"
                      aria-label="Next Page"
                    >
                      <FaChevronRight size={14} />
                    </button>
                  </div>
                </nav>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default QuestionManager;