import { useState } from "react";
import { ChevronDown } from "lucide-react";
import MessCard from "../components/MessCard";
import { mockMesses } from "../data/mockData";

const HomePage = () => {
  const [messes, setMesses] = useState(mockMesses);
  const [selectedArea, setSelectedArea] = useState("all");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");

  const areas = ["all", ...new Set(messes.map((m) => m.area))];

  const filteredMesses = messes.filter((mess) => {
    const areaMatch = selectedArea === "all" || mess.area === selectedArea;

    const priceMatch =
      selectedPrice === "all" ||
      (selectedPrice === "0-2000" && mess.monthlyPrice <= 2000) ||
      (selectedPrice === "2000-2500" &&
        mess.monthlyPrice > 2000 &&
        mess.monthlyPrice <= 2500) ||
      (selectedPrice === "2500-3000" &&
        mess.monthlyPrice > 2500 &&
        mess.monthlyPrice <= 3000) ||
      (selectedPrice === "3000+" && mess.monthlyPrice > 3000);

    const ratingMatch =
      selectedRating === "all" ||
      (selectedRating === "4+" && mess.rating >= 4) ||
      (selectedRating === "3-4" && mess.rating >= 3 && mess.rating < 4) ||
      (selectedRating === "3-" && mess.rating < 3);

    return areaMatch && priceMatch && ratingMatch;
  });

  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      {/* Header - Match reference design */}
      <div className="bg-darkBrown text-white px-4 pt-6 pb-12">
        <h1 className="text-2xl font-bold mb-1">Messes in Kota</h1>
        <p className="text-gray-300 text-sm">Prices, ratings, today's food</p>
      </div>

      {/* Filters - Styled like reference */}
      <div className="px-4 -mt-8 mb-4">
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="grid grid-cols-3 gap-2">
            {/* Area Filter */}
            <div className="relative">
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2.5 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-turmeric"
              >
                <option value="all">All Areas</option>
                {areas
                  .filter((a) => a !== "all")
                  .map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
              </select>
              <ChevronDown
                className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"
                size={16}
              />
            </div>

            {/* Price Filter */}
            <div className="relative">
              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2.5 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-turmeric"
              >
                <option value="all">Any Price</option>
                <option value="0-2000">Under ₹2000</option>
                <option value="2000-2500">₹2000-2500</option>
                <option value="2500-3000">₹2500-3000</option>
                <option value="3000+">₹3000+</option>
              </select>
              <ChevronDown
                className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"
                size={16}
              />
            </div>

            {/* Rating Filter */}
            <div className="relative">
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2.5 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-turmeric"
              >
                <option value="all">Any Rating</option>
                <option value="4+">4+ ⭐</option>
                <option value="3-4">3-4 ⭐</option>
                <option value="3-">Below 3 ⭐</option>
              </select>
              <ChevronDown
                className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"
                size={16}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mess List */}
      <div className="px-4 pb-20">
        {filteredMesses.length > 0 ? (
          filteredMesses.map((mess) => <MessCard key={mess.id} mess={mess} />)
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <p className="text-gray-500 mb-3">No messes found</p>
            <button
              onClick={() => {
                setSelectedArea("all");
                setSelectedPrice("all");
                setSelectedRating("all");
              }}
              className="text-turmeric font-semibold"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 text-center text-xs text-gray-500">
        Simple by design. Built for daily use.
      </div>
    </div>
  );
};

export default HomePage;
