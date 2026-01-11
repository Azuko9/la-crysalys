"use server";

import { cookies } from "next/headers"; // <--- Import important

export async function verifyAdminCode(candidate: string) {
  // 1. Vérification du code
  if (candidate === process.env.ADMIN_GATE_CODE) {
    
    // 2. Si c'est bon, on donne le "Badge d'accès" (Cookie)
    // Ce badge est valable 10 minutes (600 secondes)
    cookies().set("admin_gate_passed", "true", {
      httpOnly: true, // Invisible pour le JavaScript (sécurité max)
      secure: process.env.NODE_ENV === "production", // HTTPS
      maxAge: 60 * 10, // Expire dans 10 minutes
      path: "/",
    });

    return { success: true };
  }
  
  return { success: false };
}