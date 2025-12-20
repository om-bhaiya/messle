// Get relative time (e.g., "2 hours ago", "30 minutes ago")
export const getRelativeTime = (date) => {
  if (!date) return null;

  // Handle Firestore Timestamp
  const dateObj = date.toDate ? date.toDate() : new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now - dateObj) / 1000);

  // Less than a minute
  if (diffInSeconds < 60) {
    return "Updated just now";
  }

  // Less than an hour
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `Updated ${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  }

  // Less than a day
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `Updated ${hours} hour${hours !== 1 ? "s" : ""} ago`;
  }

  // Less than a week
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `Updated ${days} day${days !== 1 ? "s" : ""} ago`;
  }

  // More than a week - show date
  const day = dateObj.getDate();
  const month = dateObj.toLocaleString("default", { month: "short" });
  return `Updated on ${day} ${month}`;
};

// Check if a date is today
export const isToday = (date) => {
  if (!date) return false;

  // Handle Firestore Timestamp
  const dateObj = date.toDate ? date.toDate() : new Date(date);
  const today = new Date();

  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
};

// Format time as "2:30 PM" (keep for other uses if needed)
export const formatTime = (date) => {
  if (!date) return "";

  // Handle Firestore Timestamp
  const dateObj = date.toDate ? date.toDate() : new Date(date);

  let hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12

  const minutesStr = minutes < 10 ? "0" + minutes : minutes;

  return `${hours}:${minutesStr} ${ampm}`;
};
