"use server";

import { supabase } from "@/lib/supabaseClient";
import { revalidatePath } from "next/cache";
import type { Project } from "@/types";

export async function verifyAdminCode(code: string) {
  // This is a simplified example. In a real app, use a secure way to store and check the code.
  if (code === process.env.ADMIN_SECRET_CODE) {
    return { success: true };
  }
  return { success: false, error: "Invalid code" };
}

type SaveableProject = Omit<Project, "id" | "created_at">;

export async function saveProjectAction(
  payload: SaveableProject,
  projectId: string | null
) {
  try {
    const { error } = projectId
      ? await supabase.from("portfolio_items").update(payload).eq("id", projectId)
      : await supabase.from("portfolio_items").insert([payload]);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/realisations");
    revalidatePath("/postprod");
    revalidatePath("/realisations/[id]", "page");
    return { success: true, error: null, errors: null };
  } catch (e: any) {
    return { success: false, error: e.message, errors: null };
  }
}

export async function deleteProjectAction(projectId: string, imageUrls: string[]) {
    try {
        if (imageUrls.length > 0) {
            const fileNames = imageUrls.map(url => url.substring(url.lastIndexOf('/') + 1));
            // Important: Ensure bucket name is correct
            const { error: storageError } = await supabase.storage.from('postprod-images').remove(fileNames);
            if (storageError) {
                // Log the error but don't necessarily block DB deletion if files are already gone
                console.warn(`Storage deletion warning for project ${projectId}: ${storageError.message}`);
            }
        }

        const { error: dbError } = await supabase.from('portfolio_items').delete().eq('id', projectId);
        if (dbError) {
            throw new Error(`Erreur BDD: ${dbError.message}`);
        }

        revalidatePath('/realisations');
        revalidatePath('/postprod');
        return { success: true, error: null, errors: null };
    } catch (e: any) {
        return { success: false, error: e.message, errors: null };
    }
}

interface ContactFormData {
  nom: string;
  email: string;
  objet: string;
  message: string;
}

export async function sendContactMessageAction(formData: ContactFormData) {
  // SERVER-SIDE VALIDATION
  const validationErrors: Record<string, string> = {};

  const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/;
  if (!formData.nom.trim()) validationErrors.nom = "Le nom est obligatoire.";
  else if (!nameRegex.test(formData.nom)) validationErrors.nom = "Le nom contient des caractères invalides.";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.email.trim()) validationErrors.email = "L'email est obligatoire.";
  else if (!emailRegex.test(formData.email)) validationErrors.email = "Format d'email invalide.";

  if (!formData.message.trim()) validationErrors.message = "Le message ne peut pas être vide.";
  else if (formData.message.length < 10) validationErrors.message = "Le message est trop court (10 caractères min).";
  else if (formData.message.length > 2000) validationErrors.message = "Le message est trop long (2000 caractères max).";

  if (Object.keys(validationErrors).length > 0) {
    return { success: false, errors: validationErrors, error: "Validation failed" };
  }

  // If valid, insert into database
  try {
    const { error: dbError } = await supabase.from('messages').insert([{ ...formData }]);

    if (dbError) throw new Error(dbError.message);

    // Here you could also trigger an email notification
    // e.g., using Resend or another email service.

    return { success: true, errors: null, error: null };
  } catch (e: any) {
    return { success: false, errors: null, error: "Une erreur serveur est survenue. Veuillez réessayer." };
  }
}