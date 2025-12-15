import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "../services/firebase";

const messesData = [
  {
    id: "mess_001",
    name: "Sharma Ji Mess",
    city: "Kota",
    area: "Talwandi",
    type: "veg",
    monthlyPrice: 2600,
    perMealPrice: 90,
    rating: 4.4,
    totalRatings: 128,
    services: ["breakfast", "lunch", "dinner"],
    timings: {
      breakfast: { start: "7:30 AM", end: "9:00 AM" },
      lunch: { start: "12:30 PM", end: "2:30 PM" },
      dinner: { start: "7:30 PM", end: "9:30 PM" },
    },
    closedDays: "Sunday",
    phone: "+919876543210",
    location: {
      lat: 25.1812,
      lng: 75.8362,
      mapLink: "https://maps.google.com/?q=25.1812,75.8362",
    },
    photos: [],
    privateKey: "SHARMA123",
  },
  {
    id: "mess_002",
    name: "Annapurna Tiffin",
    city: "Kota",
    area: "Mahaveer Nagar",
    type: "both",
    monthlyPrice: 2800,
    perMealPrice: 95,
    rating: 4.1,
    totalRatings: 96,
    services: ["breakfast", "lunch", "dinner"],
    timings: {
      breakfast: { start: "7:00 AM", end: "9:30 AM" },
      lunch: { start: "12:00 PM", end: "2:30 PM" },
      dinner: { start: "7:00 PM", end: "9:30 PM" },
    },
    closedDays: "No weekly off",
    phone: "+919876543211",
    location: {
      lat: 25.1772,
      lng: 75.8355,
      mapLink: "https://maps.google.com/?q=25.1772,75.8355",
    },
    photos: [],
    privateKey: "ANNA123",
  },
  {
    id: "mess_003",
    name: "Student Choice Mess",
    city: "Kota",
    area: "Jawahar Nagar",
    type: "veg",
    monthlyPrice: 2300,
    perMealPrice: 80,
    rating: 3.8,
    totalRatings: 54,
    services: ["lunch", "dinner"],
    timings: {
      lunch: { start: "12:30 PM", end: "2:00 PM" },
      dinner: { start: "7:30 PM", end: "9:00 PM" },
    },
    closedDays: "Sunday",
    phone: "+919876543212",
    location: {
      lat: 25.165,
      lng: 75.845,
      mapLink: "https://maps.google.com/?q=25.1650,75.8450",
    },
    photos: [],
    privateKey: "STUDENT123",
  },
];

const menusData = [
  {
    id: "menu_mess_001_2025-12-15",
    messId: "mess_001",
    date: "2025-12-15",
    breakfast: "Poha, Tea",
    lunch: "Dal, Rice, Aloo Sabzi, Roti",
    dinner: "Paneer Butter Masala, Roti",
    updatedAt: new Date(),
  },
  {
    id: "menu_mess_002_2025-12-15",
    messId: "mess_002",
    date: "2025-12-15",
    breakfast: "Upma, Coffee",
    lunch: "Rajma, Rice, Roti, Salad",
    dinner: "Chicken Curry, Roti, Rice",
    updatedAt: new Date(),
  },
  {
    id: "menu_mess_003_2025-12-15",
    messId: "mess_003",
    date: "2025-12-15",
    lunch: "Dal Fry, Rice, Mixed Veg, Roti",
    dinner: "Chole, Roti, Rice",
    updatedAt: new Date(),
  },
];

export const importMesses = async () => {
  try {
    console.log("Starting import...");

    // Import messes
    for (const mess of messesData) {
      await setDoc(doc(db, "messes", mess.id), mess);
      console.log(`✅ Imported: ${mess.name}`);
    }

    console.log("✅ All messes imported successfully!");
    return { success: true, message: "Import completed!" };
  } catch (error) {
    console.error("❌ Error importing data:", error);
    return { success: false, message: error.message };
  }
};

export const importMenus = async () => {
  try {
    console.log("Starting menu import...");

    // Import menus
    for (const menu of menusData) {
      await setDoc(doc(db, "menus", menu.id), menu);
      console.log(`✅ Imported menu for: ${menu.messId}`);
    }

    console.log("✅ All menus imported successfully!");
    return { success: true, message: "Menu import completed!" };
  } catch (error) {
    console.error("❌ Error importing menus:", error);
    return { success: false, message: error.message };
  }
};
