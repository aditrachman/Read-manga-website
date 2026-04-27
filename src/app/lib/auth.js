// /app/lib/auth.js
import { auth, firebaseReady } from "@/app/lib/firebase";
import {
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";

// Fungsi untuk logout
export const logoutUser = async () => {
  try {
    if (!firebaseReady || !auth) {
      return { success: false, error: "Firebase belum siap." };
    }
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false, error: error.message };
  }
};

// Fungsi untuk mendapatkan user yang login saat ini
export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    if (!firebaseReady || !auth) {
      resolve(null);
      return;
    }
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        resolve(user);
      },
      reject
    );
  });
};

// Fungsi untuk reset password
export const resetPassword = async (email) => {
  try {
    if (!firebaseReady || !auth) {
      return { success: false, error: "Firebase belum siap." };
    }
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error("Reset password error:", error);
    return { success: false, error: error.message };
  }
};
