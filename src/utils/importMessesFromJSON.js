import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "../services/firebase";

const messesData = [
  {
    messName: "Thali House",
    address: "11-B-2, Mahaveer Nagar 1 kota",
    area: "Mahaveer Nagar",
    type: "veg",
    monthlyCharges: 4200,
    perDietCharges: 120,
    services: [
      {
        name: "Lunch",
        startTime: "12:00 PM",
        endTime: "3:00 PM",
      },
      {
        name: "Dinner",
        startTime: "7:00 PM",
        endTime: "10:00 PM",
      },
    ],
    closeDate: "Dinner of every 15th of month, and Festivals",
    phoneNumber: "9462090881",
    location: {
      lat: 25.1330742,
      lng: 75.8463335,
      mapLink:
        "https://www.google.com/maps/search/?api=1&query=25.1330742,75.8463335",
    },
  },
  {
    messName: "Punjabi Mess",
    address: "MPB-69, Mahaveer Nagar-1",
    area: "Mahaveer Nagar",
    type: "veg",
    monthlyCharges: 4200,
    perDietCharges: 120,
    services: [
      {
        name: "Lunch",
        startTime: "11:30 AM",
        endTime: "3:00 PM",
      },
      {
        name: "Dinner",
        startTime: "7:30 PM",
        endTime: "10:00 PM",
      },
    ],
    closeDate: "Alternate Sundays, Festivals",
    phoneNumber: "9829136739",
    location: {
      lat: 25.133316,
      lng: 75.846533,
      mapLink:
        "https://www.google.com/maps/search/?api=1&query=25.133316,75.846533",
    },
  },
  {
    messName: "Punjabi Mess",
    address: "3-C-72, Mahaveer Nagar-3",
    area: "Mahaveer Nagar",
    type: "veg",
    monthlyCharges: 4200,
    perDietCharges: 120,
    services: [
      {
        name: "Lunch",
        startTime: "11:30 AM",
        endTime: "3:00 PM",
      },
      {
        name: "Dinner",
        startTime: "7:30 PM",
        endTime: "10:00 PM",
      },
    ],
    closeDate: "Alternate Sunday, Festivals",
    phoneNumber: "9829136739",
    location: {
      lat: 25.13472,
      lng: 75.843519,
      mapLink:
        "https://www.google.com/maps/search/?api=1&query=25.13472,75.843519",
    },
  },
  {
    messName: "Punjabi Mess",
    address: "A-8, Jawahar Nagar",
    area: "Jawahar Nagar",
    type: "veg",
    monthlyCharges: 4200,
    perDietCharges: 120,
    services: [
      {
        name: "Lunch",
        startTime: "11:30 AM",
        endTime: "3:00 PM",
      },
      {
        name: "Dinner",
        startTime: "7:30 PM",
        endTime: "10:00 PM",
      },
    ],
    closeDate: "Alternate Sunday, Festivals",
    phoneNumber: "9829136739",
    location: {
      lat: 25.150217,
      lng: 75.84196,
      mapLink:
        "https://www.google.com/maps/search/?api=1&query=25.150217,75.84196",
    },
  },
  {
    messName: "Punjabi Mess",
    address: "A698, Indra Vihar",
    area: "Indra Vihar",
    type: "veg",
    monthlyCharges: 4200,
    perDietCharges: 120,
    services: [
      {
        name: "Lunch",
        startTime: "11:30 AM",
        endTime: "3:00 PM",
      },
      {
        name: "Dinner",
        startTime: "7:30 PM",
        endTime: "10:00 PM",
      },
    ],
    closeDate: "Alternate Sunday, Festivals",
    phoneNumber: "9829136739",
    location: {
      lat: 25.14237,
      lng: 75.846096,
      mapLink:
        "https://www.google.com/maps/search/?api=1&query=25.14237,75.846096",
    },
  },
  {
    messName: "Punjabi Mess",
    address: "C-94, Talwandi",
    area: "Talwandi",
    type: "veg",
    monthlyCharges: 4200,
    perDietCharges: 120,
    services: [
      {
        name: "Lunch",
        startTime: "11:30 AM",
        endTime: "3:00 PM",
      },
      {
        name: "Dinner",
        startTime: "7:30 PM",
        endTime: "10:00 PM",
      },
    ],
    closeDate: "Alternate Sunday, Festivals",
    phoneNumber: "9829136739",
    location: {
      lat: 25.15378,
      lng: 75.838838,
      mapLink:
        "https://www.google.com/maps/search/?api=1&query=25.15378,75.838838",
    },
  },
  {
    messName: "Punjabi Mess",
    address: "C-72, Land Mark",
    area: "Land Mark",
    type: "veg",
    monthlyCharges: 4200,
    perDietCharges: 120,
    services: [
      {
        name: "Lunch",
        startTime: "11:30 AM",
        endTime: "3:00 PM",
      },
      {
        name: "Dinner",
        startTime: "7:30 PM",
        endTime: "10:00 PM",
      },
    ],
    closeDate: "Alternate Sunday, Festivals",
    phoneNumber: "9829136739",
    location: {
      lat: 25.201929,
      lng: 75.82988,
      mapLink:
        "https://www.google.com/maps/search/?api=1&query=25.201929,75.82988",
    },
  },
  {
    messName: "Punjabi Mess",
    address: "33, Rajeev Gandhi Nagar",
    area: "Rajeev Gandhi Nagar",
    type: "veg",
    monthlyCharges: 4200,
    perDietCharges: 120,
    services: [
      {
        name: "Lunch",
        startTime: "11:30 AM",
        endTime: "3:00 PM",
      },
      {
        name: "Dinner",
        startTime: "7:30 PM",
        endTime: "10:00 PM",
      },
    ],
    closeDate: "Alternate Sunday, Festivals",
    phoneNumber: "9829136739",
    location: {
      lat: 25.135278,
      lng: 75.851372,
      mapLink:
        "https://www.google.com/maps/search/?api=1&query=25.135278,75.851372",
    },
  },
  {
    messName: "Punjabi Mess",
    address: "A810, Indra Vihar",
    area: "Indra Vihar",
    type: "veg",
    monthlyCharges: 4200,
    perDietCharges: 120,
    services: [
      {
        name: "Lunch",
        startTime: "11:30 AM",
        endTime: "3:00 PM",
      },
      {
        name: "Dinner",
        startTime: "7:30 PM",
        endTime: "10:00 PM",
      },
    ],
    closeDate: "Alternate Sunday, Festivals",
    phoneNumber: "9829136739",
    location: {
      lat: 25.144246,
      lng: 75.84709,
      mapLink:
        "https://www.google.com/maps/search/?api=1&query=25.144246,75.84709",
    },
  },
];

// Transform JSON data to our database format
const transformMessData = (messData, index) => {
  // Create unique ID
  const messId = `mess_${String(index + 1).padStart(3, "0")}`;

  // Transform services array to our format
  const services = messData.services.map((s) => s.name.toLowerCase());

  const timings = {};
  messData.services.forEach((service) => {
    const serviceName = service.name.toLowerCase();
    timings[serviceName] = {
      start: service.startTime,
      end: service.endTime,
    };
  });

  return {
    id: messId,
    name: messData.messName.trim(),
    address: messData.address,
    city: "Kota",
    area: messData.area || "Kota",
    type: messData.type,
    monthlyPrice: messData.monthlyCharges,
    perMealPrice: messData.perDietCharges,
    rating: 0,
    totalRatings: 0,
    services: services,
    timings: timings,
    closedDays: messData.closeDate,
    phone: messData.phoneNumber,
    location: {
      lat: messData.location.lat,
      lng: messData.location.lng,
      mapLink: messData.location.mapLink,
    },
    photos: [],
    privateKey: `MESS${String(index + 1).padStart(3, "0")}`,
  };
};

// Import function
export const importMessesFromJSON = async () => {
  try {
    console.log("Starting import of", messesData.length, "messes...");

    for (let i = 0; i < messesData.length; i++) {
      const messData = transformMessData(messesData[i], i);
      await setDoc(doc(db, "messes", messData.id), messData);
      console.log(`✅ Imported: ${messData.name} (${messData.id})`);
    }

    console.log("✅ All messes imported successfully!");
    return { success: true, count: messesData.length };
  } catch (error) {
    console.error("❌ Error importing messes:", error);
    return { success: false, message: error.message };
  }
};
