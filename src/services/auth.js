import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

// Initialize reCAPTCHA
export const initRecaptcha = () => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
        callback: () => {
          console.log("reCAPTCHA solved");
        },
      }
    );
  }
};

// Send OTP
export const sendOTP = async (phoneNumber) => {
  try {
    initRecaptcha();
    const appVerifier = window.recaptchaVerifier;

    // Phone number must include country code (e.g., +91 for India)
    const formattedPhone = phoneNumber.startsWith("+")
      ? phoneNumber
      : `+91${phoneNumber}`;

    const confirmationResult = await signInWithPhoneNumber(
      auth,
      formattedPhone,
      appVerifier
    );

    // Store confirmation result for verifying OTP
    window.confirmationResult = confirmationResult;

    return { success: true, message: "OTP sent successfully!" };
  } catch (error) {
    console.error("Error sending OTP:", error);

    // Reset reCAPTCHA on error
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }

    return { success: false, message: error.message };
  }
};

// Verify OTP
export const verifyOTP = async (otp) => {
  try {
    if (!window.confirmationResult) {
      return { success: false, message: "Please request OTP first" };
    }

    const result = await window.confirmationResult.confirm(otp);
    const user = result.user;

    return { success: true, user };
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return { success: false, message: "Invalid OTP. Please try again." };
  }
};

// Save user name after first login
export const saveUserProfile = async (userId, name, phone) => {
  try {
    await setDoc(doc(db, "users", userId), {
      name,
      phone,
      createdAt: new Date(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error saving user profile:", error);
    return { success: false, message: error.message };
  }
};

// Get user profile
export const getUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() };
    } else {
      return { success: false, data: null };
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
    return { success: false, data: null };
  }
};

// Sign out
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Error signing out:", error);
    return { success: false, message: error.message };
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};
