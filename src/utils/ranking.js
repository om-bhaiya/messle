export const calculateMessScore = (mess) => {
  // Weights (adjust these based on what matters most)
  const RATING_WEIGHT = 0.4; // 40% - Quality matters most
  const POPULARITY_WEIGHT = 0.25; // 25% - Social proof
  const PRICE_WEIGHT = 0.15; // 15% - Affordability
  const RECENCY_WEIGHT = 0.2; // 20% - Active messes

  // 1. Rating Score (0-100)
  // Normalize rating (0-5) to (0-100), but penalize if few ratings
  const ratingScore = mess.rating * 20;
  const ratingConfidence = Math.min(mess.totalRatings / 50, 1); // Confidence maxes at 50 ratings
  const adjustedRating = ratingScore * (0.5 + 0.5 * ratingConfidence); // Min 50% weight if no ratings

  // 2. Popularity Score (0-100)
  // Based on number of ratings (more ratings = more popular)
  const popularityScore = Math.min((mess.totalRatings / 200) * 100, 100); // Max at 200 ratings

  // 3. Price Score (0-100)
  // Lower price = higher score
  const avgPrice = 3500; // Average mess price in Kota
  const priceScore = Math.max(
    0,
    100 - ((mess.monthlyPrice - avgPrice) / avgPrice) * 100
  );

  // 4. Recency Score (0-100)
  // Has today's menu been updated?
  const hasRecentMenu = mess.menuUpdatedToday ? 100 : 40; // 40 points baseline

  // Calculate weighted total
  const totalScore =
    adjustedRating * RATING_WEIGHT +
    popularityScore * POPULARITY_WEIGHT +
    priceScore * PRICE_WEIGHT +
    hasRecentMenu * RECENCY_WEIGHT;

  return totalScore;
};

export const sortMessesByScore = (messes) => {
  return [...messes].sort((a, b) => {
    const scoreA = calculateMessScore(a);
    const scoreB = calculateMessScore(b);
    return scoreB - scoreA; // Descending order (highest score first)
  });
};
