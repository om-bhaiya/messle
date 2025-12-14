import { useState } from "react";
import { Filter } from "lucide-react";
import MessCard from "../components/MessCard";
import { mockMesses } from "../data/mockData";

const HomePage = () => {
  const [messes, setMesses] = useState(mockMesses);
  const [selectedArea, setSelectedArea] = useState("all");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");

  // Get unique areas from messes
  const areas = ["all", ...new Set(messes.map((m) => m.area))];

  // Filter messes based on selections
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-6 pb-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-1">Messes in Kota</h1>
          <p className="text-amber-50">Prices, ratings, today's food</p>
        </div>
      </div>

      {/* Container for centered content */}
      <div className="max-w-md mx-auto">
        {/* Filters */}
        <div className="bg-white shadow-sm p-4 -mt-4 mx-4 rounded-lg mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={18} className="text-gray-600" />
            <span className="font-medium text-gray-700">Filters</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {/* Area Filter */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Area</label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
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
            </div>

            {/* Price Filter */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Price Range
              </label>
              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">Any Price</option>
                <option value="0-2000">Under ₹2000</option>
                <option value="2000-2500">₹2000 - ₹2500</option>
                <option value="2500-3000">₹2500 - ₹3000</option>
                <option value="3000+">Above ₹3000</option>
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Rating</label>
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">Any Rating</option>
                <option value="4+">4+ Stars</option>
                <option value="3-4">3 - 4 Stars</option>
                <option value="3-">Below 3 Stars</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mess List */}
        <div className="px-4 pb-6">
          {filteredMesses.length > 0 ? (
            <>
              <p className="text-sm text-gray-600 mb-3">
                {filteredMesses.length} mess
                {filteredMesses.length !== 1 ? "es" : ""} found
              </p>
              {filteredMesses.map((mess) => (
                <MessCard key={mess.id} mess={mess} />
              ))}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No messes found with selected filters
              </p>
              <button
                onClick={() => {
                  setSelectedArea("all");
                  setSelectedPrice("all");
                  setSelectedRating("all");
                }}
                className="mt-4 text-amber-600 font-medium"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center py-6 text-gray-500 text-sm border-t">
          Simple by design. Built for daily use.
        </div>
      </div>
    </div>
  );
};

export default HomePage;
