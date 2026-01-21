"use server";

// LOG DE DÉMARRAGE POUR VÉRIFIER LE RECHARGEMENT DU FICHIER
console.log(`[${new Date().toISOString()}] --- RECHARGEMENT DU FICHIER actions.ts ---`);

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import type { Project, TeamMember, Feature, Category } from '@/app/index';
import { z } from 'zod';

// --- DÉBOGAGE DES VARIABLES D'ENVIRONNEMENT ---
// Ce log apparaîtra dans le terminal où vous lancez "npm run dev".
console.log('--- [DEBUG] Vérification des variables d\'environnement Supabase ---');
console.log('NEXT_PUBLIC_SUPABASE_URL est chargée:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY (pour les actions admin) est chargée:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log('-----------------------------------------------------------------');

// Vérification des variables d'environnement pour le client admin Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("La variable d'environnement NEXT_PUBLIC_SUPABASE_URL est manquante. Assurez-vous que votre fichier .env.local est correctement configuré.");
}
if (!supabaseServiceKey) {
  // Cette erreur est la plus courante. On guide l'utilisateur.
  throw new Error("La variable d'environnement SUPABASE_SERVICE_ROLE_KEY est manquante. C'est une variable côté serveur, assurez-vous d'avoir redémarré votre serveur Next.js (npm run dev) après l'avoir ajoutée à .env.local.");
}

// Création d'un client Supabase "admin" qui peut contourner les politiques RLS.
// À n'utiliser que côté serveur pour les actions d'administration.
const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// --- HELPER: Extraire les détails d'une URL de stockage Supabase ---
const getStorageDetailsFromUrl = (url: string): { bucket: string; path: string } | null => {
  if (!url) return null;
  try {
    const urlObject = new URL(url);
    const pathParts = urlObject.pathname.split('/');
    const publicIndex = pathParts.indexOf('public');
    if (publicIndex > -1 && pathParts.length > publicIndex + 2) {
      const bucket = pathParts[publicIndex + 1];
      const path = decodeURIComponent(pathParts.slice(publicIndex + 2).join('/'));
      return { bucket, path };
    }
    return null;
  } catch (e) {
    console.error("URL de stockage invalide:", url, e);
    return null;
  }
};

// --- HELPER: Supprimer une liste d'images du stockage ---
const deleteImagesFromStorage = async (urls: (string | null | undefined)[]) => {
    const validUrls = urls.filter((url): url is string => !!url);
    if (validUrls.length === 0) return;

    const pathsByBucket: Record<string, string[]> = {};

    for (const url of validUrls) {
        const details = getStorageDetailsFromUrl(url);
        if (details) {
            if (!pathsByBucket[details.bucket]) {
                pathsByBucket[details.bucket] = [];
            }
            pathsByBucket[details.bucket].push(details.path);
        }
    }

    for (const bucket in pathsByBucket) {
        if (pathsByBucket[bucket].length > 0) {
            const { error: storageError } = await supabaseAdmin.storage.from(bucket).remove(pathsByBucket[bucket]);
            if (storageError) {
                console.warn(`Impossible de supprimer les images dans le bucket ${bucket}:`, storageError.message);
            }
        }
    }
};

// --- ACTION PORTE ADMIN ---
export async function verifyAdminCode(candidate: string) {
  if (candidate === process.env.ADMIN_GATE_CODE) {
    cookies().set("admin_gate_passed", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 10, // 10 minutes
      path: "/",
    });
    return { success: true };
  }
  return { success: false };
}

// --- ACTIONS PROJETS ---
export async function saveProjectAction(
  payload: Omit<Project, 'id' | 'created_at' | 'thumbnail_url'>,
  projectId: string | null,
  imagesToDelete: string[]
) {
  try {
    let result;
    if (projectId) {
      result = await supabaseAdmin.from('portfolio_items').update(payload).eq('id', projectId).select().single();
      
      // On ne supprime les anciennes images que si la mise à jour a réussi
      if (!result.error && imagesToDelete.length > 0) {
        await deleteImagesFromStorage(imagesToDelete);
      }
    } else {
      result = await supabaseAdmin.from('portfolio_items').insert(payload).select().single();
    }

    if (result.error) throw new Error(result.error.message);

    revalidatePath('/realisations');
    revalidatePath('/admin');
    revalidatePath('/expertise'); // Revalidation pour la page Expertise Drone
    revalidatePath('/postprod');  // Revalidation pour la page Post-Prod
    if (result.data?.id) {
      revalidatePath(`/realisations/${result.data.id}`);
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteProjectAction(projectId: string, imageUrlsToDelete: string[]) {
  try {
    if (!projectId) throw new Error('ID de projet manquant.');

    await deleteImagesFromStorage(imageUrlsToDelete);

    const { error: dbError } = await supabaseAdmin.from('portfolio_items').delete().eq('id', projectId);
    if (dbError) throw new Error(dbError.message);

    revalidatePath('/realisations');
    revalidatePath('/admin');
    revalidatePath(`/realisations/${projectId}`);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- ACTIONS CATÉGORIES ---
export async function saveCategoryAction(
  payload: { name: string },
  categoryId: string | null
) {
  try {
    const newName = payload.name.trim();
    if (!newName) {
      return { success: false, error: "Le nom de la catégorie ne peut pas être vide." };
    }

    if (categoryId) {
      // --- LOGIQUE DE MISE À JOUR ---

      // 1. Récupérer l'ancien nom de la catégorie pour la mise à jour en cascade
      const { data: oldCategory, error: fetchOldError } = await supabaseAdmin
        .from('categories')
        .select('name')
        .eq('id', categoryId)
        .single();

      if (fetchOldError) throw new Error(`Impossible de trouver la catégorie à mettre à jour: ${fetchOldError.message}`);
      
      const oldName = oldCategory.name;

      // Si le nom n'a pas changé, on ne fait rien de plus
      if (oldName === newName) {
        return { success: true, data: { id: categoryId, name: newName } as Category };
      }

      // 2. Mettre à jour la catégorie dans la table 'categories'
      const { data: updatedCategory, error: updateError } = await supabaseAdmin
        .from('categories')
        .update({ name: newName })
        .eq('id', categoryId)
        .select()
        .single();

      if (updateError) throw updateError;

      // 3. Mettre à jour tous les projets qui utilisent l'ancien nom de catégorie
      const { data: projectsToUpdate, error: fetchProjectsError } = await supabaseAdmin
        .from('portfolio_items')
        .select('id, category')
        .like('category', `%${oldName}%`);

      if (fetchProjectsError) {
        console.warn(`Avertissement: La catégorie a été renommée, mais une erreur est survenue lors de la recherche des projets à mettre à jour: ${fetchProjectsError.message}`);
      } else if (projectsToUpdate && projectsToUpdate.length > 0) {
        const updates = projectsToUpdate
          .filter(p => p.category?.split(',').map((t: string) => t.trim()).includes(oldName))
          .map(project => {
            const newTags = project.category.split(',').map((t: string) => t.trim() === oldName ? newName : t.trim());
            return supabaseAdmin.from('portfolio_items').update({ category: newTags.join(', ') }).eq('id', project.id);
          });
        await Promise.all(updates);
      }
      
      revalidatePath('/admin');
      revalidatePath('/realisations');
      return { success: true, data: updatedCategory };

    } else {
      // --- LOGIQUE D'INSERTION (inchangée) ---
      const { data, error } = await supabaseAdmin.from('categories').insert({ name: newName }).select().single();
      if (error) throw error;
      revalidatePath('/admin');
      return { success: true, data };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCategoryAction(categoryId: string, categoryName: string) {
  try {
    // Étape 1: Récupérer les projets qui pourraient utiliser cette catégorie via une recherche approximative.
    const { data: potentialProjects, error: checkError } = await supabaseAdmin
      .from('portfolio_items')
      .select('id, category')
      .like('category', `%${categoryName}%`);

    if (checkError) throw checkError;

    // Étape 2: Filtrer avec précision pour trouver les projets qui utilisent réellement le tag.
    // Cela évite les faux positifs (ex: supprimer "Prod" alors qu'un projet a "Post-Prod").
    const projectsUsingCategory = potentialProjects?.filter(p => 
      p.category?.split(',').map((t: string) => t.trim()).includes(categoryName)
    );

    if (projectsUsingCategory && projectsUsingCategory.length > 0) {
      return { success: false, error: `Action impossible : ${projectsUsingCategory.length} projet(s) sont encore liés à la catégorie "${categoryName}".` };
    }

    // Étape 3: Si aucun projet n'est lié, supprimer la catégorie.
    const { error: deleteError } = await supabaseAdmin.from('categories').delete().eq('id', categoryId);
    if (deleteError) throw deleteError;
    revalidatePath('/admin');
    revalidatePath('/realisations');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- ACTIONS FEATURES (EXPERTISE) ---
export async function saveFeatureAction(payload: Omit<Feature, 'id' | 'created_at'>, featureId: string | null) {
    try {
        const { data, error } = featureId 
            ? await supabaseAdmin.from('expertise_features').update(payload).eq('id', featureId).select().single()
            : await supabaseAdmin.from('expertise_features').insert(payload).select().single();
        if (error) throw new Error(error.message);
        revalidatePath('/expertise');
        revalidatePath('/postprod');
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteFeatureAction(featureId: string) {
    try {
        const { error } = await supabaseAdmin.from('expertise_features').delete().eq('id', featureId);
        if (error) throw new Error(error.message);
        revalidatePath('/expertise');
        revalidatePath('/postprod');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- ACTIONS ÉQUIPE ---
export async function saveTeamMemberAction(
    payload: Omit<TeamMember, 'id' | 'created_at'>, 
    memberId: string | null,
    imageToDelete: string | null
) {
    try {
        const { data, error } = memberId 
            ? await supabaseAdmin.from('team_members').update(payload).eq('id', memberId).select().single()
            : await supabaseAdmin.from('team_members').insert(payload).select().single();
        if (!error && imageToDelete) {
            await deleteImagesFromStorage([imageToDelete]);
        }
        if (error) throw error;
        revalidatePath('/equipe');
        revalidatePath('/admin');
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteTeamMemberAction(memberId: string) {
    try {
        const { data: member, error: fetchError } = await supabaseAdmin.from('team_members').select('photo_url').eq('id', memberId).single();
        if (fetchError) throw new Error(`Impossible de récupérer le membre à supprimer: ${fetchError.message}`);
        if (member.photo_url) {
            await deleteImagesFromStorage([member.photo_url]);
        }
        const { error: dbError } = await supabaseAdmin.from('team_members').delete().eq('id', memberId);
        if (dbError) throw dbError;
        revalidatePath('/equipe');
        revalidatePath('/admin');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- ACTION FORMULAIRE DE CONTACT ---
const ContactFormSchema = z.object({
  nom: z.string().min(2, "Le nom est trop court.").max(50, "Le nom est trop long."),
  email: z.string().email("L'email est invalide."),
  objet: z.enum(['devis', 'info', 'autre']),
  message: z.string().min(10, "Le message est trop court.").max(2000, "Le message est trop long."),
});

export async function sendContactMessageAction(formData: { nom: string; email: string; objet: string; message: string; }) {
    const validatedFields = ContactFormSchema.safeParse(formData);
    if (!validatedFields.success) {
        return { success: false, errors: validatedFields.error.flatten().fieldErrors };
    }
    try {
        // Ici, vous intégreriez un service d'envoi d'e-mails comme Resend.
        // On utilise le client public `supabase` car cette action doit être accessible
        // par n'importe qui. Assurez-vous d'avoir une politique RLS qui autorise les insertions sur `contact_messages`.
    const { error } = await supabase.from('messages').insert([{ ...validatedFields.data }]);
        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error("Erreur lors de l'envoi du message de contact:", error);
        return { success: false, error: "Impossible d'envoyer le message. Veuillez réessayer." };
    }
}