import { Star, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MessCard = ({ mess }) => {
  const navigate = useNavigate();

  const getTypeBadge = () => {
    if (mess.type === "veg") {
      return (
        <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full font-medium">
          Veg
        </span>
      );
    } else if (mess.type === "non-veg") {
      return (
        <span className="bg-red-600 text-white text-xs px-3 py-1 rounded-full font-medium">
          Non-Veg
        </span>
      );
    } else {
      return (
        <span className="bg-amber-600 text-white text-xs px-3 py-1 rounded-full font-medium">
          Veg + Non-Veg
        </span>
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{mess.name}</h3>
          <div className="flex items-center text-gray-600 text-sm mt-1">
            <MapPin size={14} className="mr-1 flex-shrink-0" />
            <span>{mess.area}</span>
          </div>
        </div>
        <div className="ml-3 flex-shrink-0">{getTypeBadge()}</div>
      </div>

      {/* Rating */}
      <div className="flex items-center mb-3">
        <Star size={16} className="fill-amber-500 text-amber-500 mr-1" />
        <span className="font-semibold text-gray-900">{mess.rating}</span>
        <span className="text-gray-600 text-sm ml-1">
          ({mess.totalRatings})
        </span>
      </div>

      {/* Price */}
      <div className="mb-4">
        <p className="text-xl font-bold text-gray-900">
          ₹{mess.monthlyPrice} / month
        </p>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate(`/mess/${mess.id}`)}
          className="bg-primary text-white py-2.5 px-4 rounded-lg font-medium hover:bg-amber-600 transition-colors"
        >
          View
        </button>
        <button
          onClick={() => window.open(`tel:${mess.phone}`)}
          className="bg-gray-200 text-gray-800 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Call
        </button>
      </div>
    </div>
  );
};

export default MessCard;
