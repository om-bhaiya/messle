import { Star, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MessCard = ({ mess }) => {
  const navigate = useNavigate();

  const getTypeBadge = () => {
    if (mess.type === "veg") {
      return (
        <span className="bg-green-600 text-white text-xs px-2.5 py-1 rounded-full font-medium">
          Veg
        </span>
      );
    } else if (mess.type === "non-veg") {
      return (
        <span className="bg-brick text-white text-xs px-2.5 py-1 rounded-full font-medium">
          Non-Veg
        </span>
      );
    } else {
      return (
        <span className="bg-brick text-white text-xs px-2.5 py-1 rounded-full font-medium">
          Veg + Non-Veg
        </span>
      );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-3">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-darkBrown">{mess.name}</h3>
          <div className="flex items-center text-gray-600 text-sm mt-0.5">
            <MapPin size={13} className="mr-1" />
            <span>{mess.area}</span>
          </div>
        </div>
        {getTypeBadge()}
      </div>

      {/* Rating */}
      <div className="flex items-center mb-3">
        <Star size={15} className="fill-turmeric text-turmeric mr-1" />
        <span className="font-bold text-darkBrown text-sm">{mess.rating}</span>
        <span className="text-gray-500 text-sm ml-1">
          ({mess.totalRatings})
        </span>
      </div>

      {/* Price */}
      <div className="mb-3">
        <p className="text-xl font-bold text-darkBrown">
          ₹{mess.monthlyPrice} / month
        </p>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => navigate(`/mess/${mess.id}`)}
          className="bg-turmeric text-darkBrown py-2.5 rounded-lg font-semibold hover:bg-yellow-500 transition-all active:scale-95"
        >
          View
        </button>
        <button
          onClick={() => (window.location.href = `tel:${mess.phone}`)}
          className="bg-gray-200 text-darkBrown py-2.5 rounded-lg font-semibold hover:bg-gray-300 transition-all active:scale-95"
        >
          Call
        </button>
      </div>
    </div>
  );
};

export default MessCard;
