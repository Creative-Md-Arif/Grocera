/* eslint-disable react/prop-types */
import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";

const Ratings = ({ value, text }) => {
  const fullStars = Math.floor(value);
  const halfStars = value - fullStars > 0.5 ? 1 : 0;
  const emptyStar = 5 - fullStars - halfStars;

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(fullStars)].map((_, index) => (
        <FaStar
          key={`full-${index}`}
          className="text-amber-500 text-xs sm:text-sm transition-transform transform hover:scale-110 duration-200"
        />
      ))}

      {halfStars === 1 && (
        <FaStarHalfAlt className="text-amber-500 text-xs sm:text-sm transition-transform transform hover:scale-110 duration-200" />
      )}

      {[...Array(emptyStar)].map((_, index) => (
        <FaRegStar
          key={`empty-${index}`}
          className="text-gray-300 text-xs sm:text-sm transition-transform transform hover:scale-105 duration-200"
        />
      ))}

      {text && (
        <span className="ml-1.5 text-xs font-semibold text-gray-800">
          {text}
        </span>
      )}
    </div>
  );
};

export default Ratings;
