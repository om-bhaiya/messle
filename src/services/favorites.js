// Get user's favorite messes
export const getFavorites = () => {
  const favorites = localStorage.getItem("favoriteMesses");
  return favorites ? JSON.parse(favorites) : [];
};

// Check if a mess is favorited
export const isFavorite = (messId) => {
  const favorites = getFavorites();
  return favorites.includes(messId);
};

// Toggle favorite status
export const toggleFavorite = (messId) => {
  let favorites = getFavorites();

  if (favorites.includes(messId)) {
    // Remove from favorites
    favorites = favorites.filter((id) => id !== messId);
  } else {
    // Add to favorites
    favorites.push(messId);
  }

  localStorage.setItem("favoriteMesses", JSON.stringify(favorites));
  return favorites.includes(messId); // Return new status
};

// Get count of favorites
export const getFavoritesCount = () => {
  return getFavorites().length;
};
