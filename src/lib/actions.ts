"use server";

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { Project, TeamMember, Feature, Category, PostProdDetail } from '@/types';
import { z } from 'zod';

// Vérification des variables d'environnement pour le client admin Supabase
const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey: string = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl) {
  throw new Error("La variable d'environnement NEXT_PUBLIC_SUPABASE_URL est manquante. Assurez-vous que votre fichier .env.local est correctement configuré.");
}
if (!supabaseServiceKey) {
  throw new Error("La variable d'environnement SUPABASE_SERVICE_ROLE_KEY est manquante. C'est une variable côté serveur, assurez-vous d'avoir redémarré votre serveur Next.js (npm run dev) après l'avoir ajoutée à .env.local.");
}
if (!supabaseAnonKey) {
  throw new Error("La variable d'environnement NEXT_PUBLIC_SUPABASE_ANON_KEY est manquante. Assurez-vous que votre fichier .env.local est correctement configuré.");
}

// Création d'un client Supabase "admin" qui peut contourner les politiques RLS.
// À n'utiliser que côté serveur pour les actions d'administration.
const supabaseAdmin = createClient(
  supabaseUrl!, // Assertion non-nulle
  supabaseServiceKey!, // Assertion non-nulle
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// --- HELPER: Authentification Admin ---
// Cette fonction vérifie si l'utilisateur est connecté et a le rôle 'admin'.
async function authenticateAdmin() {
  const cookieStore = cookies();
  const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch (error) {
          // The `set` method was called from a Server Component. This can be ignored if you have middleware refreshing user sessions.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch (error) {
          // The `delete` method was called from a Server Component. This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  });

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: "Accès non autorisé. Session invalide." };
  }

  // Vérification d'exécution pour la clé de service, au cas où le serveur n'a pas été redémarré.
  if (!supabaseServiceKey) {
    throw new Error("La clé de service Supabase (SUPABASE_SERVICE_ROLE_KEY) n'est pas disponible côté serveur. Avez-vous redémarré votre serveur de développement ?");
  }

  // *** AJOUT CRUCIAL DE SÉCURITÉ ***
  // On utilise le client ADMIN pour vérifier le rôle de l'utilisateur.
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (profileError || !profile) {
    console.error("Erreur de vérification de profil admin:", profileError?.message);
    return { success: false, error: "Accès non autorisé. Profil introuvable ou erreur de base de données." };
  }

  if (profile.role !== 'admin') {
    return { success: false, error: "Accès non autorisé. Droits insuffisants." };
  }

  return { success: true, user: session.user };
}

// --- HELPER: Supprimer une liste d'images du stockage ---
// Prend un tableau d'objets { bucket: string, path: string }
const deleteImagesFromStorage = async (images: { bucket: string; path: string }[]) => {
    if (images.length === 0) return;

    const pathsByBucket: { [key: string]: string[] } = {};

    for (const image of images) {
        if (!image.bucket || !image.path) {
            console.warn("Image invalide fournie pour suppression:", image);
            continue;
        }
        if (!pathsByBucket[image.bucket]) {
            pathsByBucket[image.bucket] = [];
        }
        pathsByBucket[image.bucket].push(image.path);
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

// --- ACTIONS PROJETS ---
export async function saveProjectAction(
  payload: Omit<Project, 'id' | 'created_at'>,
  projectId: string | null,
  imagesToDelete: { bucket: string; path: string }[]
) {
  // SÉCURITÉ : Vérifier la session utilisateur et les droits admin
  const authResult = await authenticateAdmin();
  if (!authResult.success) {
    return authResult;
  }
  // SÉCURITÉ : Vérifier la session utilisateur avant toute opération
  const PostProdDetailSchema = z.object({
    detail: z.string().min(1, "Le détail de la post-production est requis."),
    before_path: z.string().nullable().optional(),
    after_path: z.string().nullable().optional(),
  });

  const ProjectSchema = z.object({
    title: z.string().min(1, "Le titre est requis."),
    description: z.string().nullable(),
    youtube_url: z.string().min(1, "L'URL YouTube est requise.").url("L'URL YouTube est invalide."),
    project_date: z.string().refine((val) => !isNaN(Date.parse(val)), "Date de projet invalide."),
    category: z.string(), // category is not nullable in the type definition
    client_name: z.string().nullable(), // Ajouté
    client_website: z.string().nullable(), // Ajouté
    description_drone: z.string().nullable(),
    postprod_main_description: z.string().nullable(),
    client_logo_path: z.string().nullable(),
    postprod_before_path: z.string().nullable(),
    postprod_after_path: z.string().nullable(),
    description_postprod: z.array(PostProdDetailSchema).nullable(),
  });

  const validatedPayload = ProjectSchema.safeParse(payload);

  if (!validatedPayload.success) {
    return { success: false, error: "Les données du projet sont invalides.", details: validatedPayload.error.flatten() };
  }

  const dataToSave = { ...validatedPayload.data };

  try {
    let result;
    if (projectId) {
      result = await supabaseAdmin.from('portfolio_items').update(dataToSave).eq('id', projectId).select().single();
      
      // On supprime les anciennes images si la mise à jour a réussi
      if (!result.error && imagesToDelete.length > 0) {
        await deleteImagesFromStorage(imagesToDelete);
      }
    } else {
      result = await supabaseAdmin.from('portfolio_items').insert(dataToSave).select().single();
    }

    if (result.error) {
      console.error("Erreur Supabase lors de la sauvegarde du projet:", result.error.message);
      return { success: false, error: "Une erreur est survenue lors de la sauvegarde du projet." };
    }


    revalidatePath('/realisations');
    revalidatePath('/admin');
    revalidatePath('/expertise'); // Revalidation pour la page Expertise Drone
    revalidatePath('/postprod');  // Revalidation pour la page Post-Prod
    if (result.data?.id) {
      revalidatePath(`/realisations/${result.data.id}`);
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("Erreur inattendue lors de saveProjectAction:", (error as Error).message);
    return { success: false, error: "Une erreur inattendue est survenue lors de la sauvegarde du projet." };
  }
}

export async function deleteProjectAction(projectId: string, imagesToDelete: { bucket: string; path: string }[]) {
  try {
    // SÉCURITÉ : Vérifier la session utilisateur et les droits admin
    const authResult = await authenticateAdmin();
    if (!authResult.success) {
      return authResult;
    }
    if (!projectId) throw new Error('ID de projet manquant.');

    // Supprimer les images associées au projet
    if (imagesToDelete.length > 0) {
      await deleteImagesFromStorage(imagesToDelete);
    }

    const { error: dbError } = await supabaseAdmin.from('portfolio_items').delete().eq('id', projectId);
    if (dbError) {
      console.error("Erreur Supabase lors de la suppression du projet:", dbError.message);
      throw new Error("Une erreur est survenue lors de la suppression du projet.");
    }

    revalidatePath('/realisations');
    revalidatePath('/admin');
    revalidatePath(`/realisations/${projectId}`);

    return { success: true };
  } catch (error: any) {
    console.error("Erreur inattendue lors de deleteProjectAction:", (error as Error).message);
    return { success: false, error: "Une erreur inattendue est survenue lors de la suppression du projet." };
  }
}

// --- ACTIONS CATÉGORIES ---
const CategorySchema = z.object({
  name: z.string().trim().min(1, "Le nom de la catégorie ne peut pas être vide."),
});

export async function saveCategoryAction(
  payload: { name: string },
  categoryId: string | null
) {
  // SÉCURITÉ : Vérifier la session utilisateur et les droits admin
  const authResult = await authenticateAdmin();
  if (!authResult.success) {
    return authResult;
  }

  const validatedPayload = CategorySchema.safeParse(payload);
  if (!validatedPayload.success) {
    return { success: false, error: validatedPayload.error.flatten().fieldErrors.name?.[0] || "Données invalides." };
  }
  const newName = validatedPayload.data.name;

  try {
    if (categoryId) {
      // --- LOGIQUE DE MISE À JOUR ---

      // 1. Récupérer l'ancien nom de la catégorie pour la mise à jour en cascade
      const { data: oldCategory, error: fetchOldError } = await supabaseAdmin
        .from('categories')
        .select('name')
        .eq('id', categoryId)
        .single();

      if (fetchOldError) {
        console.error("Erreur Supabase lors de la récupération de l'ancienne catégorie:", fetchOldError.message);
        throw new Error("Impossible de trouver la catégorie à mettre à jour.");
      }
      
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
      if (updateError) { // Log détaillé, message générique
        console.error("Erreur Supabase lors de la mise à jour de la catégorie:", updateError.message);
        throw new Error("Une erreur est survenue lors de la mise à jour de la catégorie.");
      }

      // 3. Mettre à jour tous les projets qui utilisent l'ancien nom de catégorie
      const { data: projectsToUpdate, error: fetchProjectsError } = await supabaseAdmin
        .from('portfolio_items')
        .select('id, category')
        .like('category', `%${oldName}%`);

      if (fetchProjectsError) { // Log détaillé, message générique
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
    // SÉCURITÉ : Vérifier la session utilisateur avant toute opération
    const authResult = await authenticateAdmin();
    if (!authResult.success) {
      return authResult;
    }
    if (!categoryId) {
      return { success: false, error: 'ID de catégorie manquant.' };
    }
    // Étape 1: Récupérer les projets qui pourraient utiliser cette catégorie via une recherche approximative.
    const { data: potentialProjects, error: checkError } = await supabaseAdmin
      .from('portfolio_items')
      .select('id, category')
      .like('category', `%${categoryName}%`);

    if (checkError) { // Log détaillé, message générique
      console.error("Erreur Supabase lors de la vérification des projets liés à la catégorie:", checkError.message);
      throw new Error("Une erreur est survenue lors de la vérification des projets liés.");
    }

    // Étape 2: Filtrer avec précision pour trouver les projets qui utilisent réellement le tag.
    // Cela évite les faux positifs (ex: supprimer "Prod" alors qu'un projet a "Post-Prod").
    const projectsUsingCategory = potentialProjects?.filter(p => 
      p.category?.split(',').map((t: string) => t.trim()).includes(categoryName)
    );

    if (projectsUsingCategory && projectsUsingCategory.length > 0) {
      return { success: false, error: `Action impossible : ${projectsUsingCategory.length} projet(s) sont encore liés à la catégorie "${categoryName}".` }; // Message spécifique pour l'utilisateur
    }

    // Étape 3: Si aucun projet n'est lié, supprimer la catégorie.
    const { error: deleteError } = await supabaseAdmin.from('categories').delete().eq('id', categoryId);
    if (deleteError) {
      console.error("Erreur Supabase lors de la suppression de la catégorie:", deleteError.message);
      throw new Error("Une erreur est survenue lors de la suppression de la catégorie.");
    }
    revalidatePath('/admin');
    revalidatePath('/realisations');
    return { success: true };
  } catch (error: any) {
    console.error("Erreur inattendue lors de deleteCategoryAction:", (error as Error).message);
    return { success: false, error: "Une erreur inattendue est survenue lors de la suppression de la catégorie." };
  }
}

// --- ACTIONS FEATURES (EXPERTISE) ---
export async function saveFeatureAction(payload: Omit<Feature, 'id' | 'created_at'>, featureId: string | null) {
    try {
        // SÉCURITÉ : Vérifier la session utilisateur et les droits admin
        const authResult = await authenticateAdmin();
        if (!authResult.success) {
          return authResult;
        }

        const { data, error } = featureId 
            ? await supabaseAdmin.from('expertise_features').update(payload).eq('id', featureId).select().single()
            : await supabaseAdmin.from('expertise_features').insert(payload).select().single();
        if (error) throw new Error(error.message);
        revalidatePath('/expertise');
        revalidatePath('/postprod');
        return { success: true, data };
    } catch (error: any) {
        console.error("Erreur inattendue lors de saveFeatureAction:", error.message);
        return { success: false, error: "Une erreur inattendue est survenue lors de la sauvegarde de la fonctionnalité." };
    }
}

export async function deleteFeatureAction(featureId: string) {
    try {
        // SÉCURITÉ : Vérifier la session utilisateur et les droits admin
        const authResult = await authenticateAdmin();
        if (!authResult.success) {
          return authResult;
        }
        if (!featureId) {
          return { success: false, error: 'ID de fonctionnalité manquant.' };
        }
        const { error } = await supabaseAdmin.from('expertise_features').delete().eq('id', featureId);
        if (error) {
          console.error("Erreur Supabase lors de la suppression de la fonctionnalité:", error.message);
          throw new Error("Une erreur est survenue lors de la suppression de la fonctionnalité.");
        }
        revalidatePath('/expertise');
        revalidatePath('/postprod');
        return { success: true };
    } catch (error: any) {
        console.error("Erreur inattendue lors de deleteFeatureAction:", error.message); // Log détaillé
        return { success: false, error: "Une erreur inattendue est survenue lors de la suppression de la fonctionnalité." };
    }
}

// --- ACTIONS ÉQUIPE ---
export async function saveTeamMemberAction(
    payload: Omit<TeamMember, 'id' | 'created_at'>, 
    memberId: string | null,
    imageToDelete: { bucket: string; path: string } | null
) {
    const TeamMemberSchema = z.object({
      name: z.string().trim().min(1, "Le nom du membre est requis."),
      role: z.string().trim().min(1, "Le rôle du membre est requis."),
      bio: z.string().nullable(),
      photo_path: z.string().nullable(),
      instagram: z.string().nullable(),
      linkedin: z.string().url("URL LinkedIn invalide.").nullable(),
      member_type: z.enum(['team', 'partner']).nullable(),
      company: z.string().nullable(),
      email: z.string().email("Email invalide.").nullable(),
      website: z.string().url("URL de site web invalide.").nullable(),
    });

    // SÉCURITÉ : Vérifier la session utilisateur et les droits admin
    const authResult = await authenticateAdmin();
    if (!authResult.success) {
      return authResult;
    }

    const validatedPayload = TeamMemberSchema.safeParse(payload);
    if (!validatedPayload.success) {
      return { success: false, error: "Les données du membre de l'équipe sont invalides.", details: validatedPayload.error.flatten() };
    }

    try {
        const { data, error } = memberId 
            ? await supabaseAdmin.from('team_members').update(validatedPayload.data).eq('id', memberId).select().single()
            : await supabaseAdmin.from('team_members').insert(validatedPayload.data).select().single();
        
        if (!error && imageToDelete) {
            await deleteImagesFromStorage([imageToDelete]);
        }
        if (error) {
          console.error("Erreur Supabase lors de la sauvegarde du membre de l'équipe:", error.message);
          throw new Error("Une erreur est survenue lors de la sauvegarde du membre de l'équipe.");
        }
        revalidatePath('/equipe');
        revalidatePath('/admin');
        return { success: true, data };
    } catch (error: any) {
        console.error("Erreur inattendue lors de saveTeamMemberAction:", error.message);
        return { success: false, error: "Une erreur inattendue est survenue lors de la sauvegarde du membre de l'équipe." };
    }
}

export async function deleteTeamMemberAction(memberId: string) {
    try {
        // SÉCURITÉ : Vérifier la session utilisateur et les droits admin
        const authResult = await authenticateAdmin();
        if (!authResult.success) {
          return authResult;
        }
        if (!memberId) {
          return { success: false, error: 'ID de membre manquant.' };
        }

        const { data: member, error: fetchError } = await supabaseAdmin.from('team_members').select('photo_path').eq('id', memberId).single();
        if (fetchError) {
          console.error("Erreur Supabase lors de la récupération du membre à supprimer:", fetchError.message);
          throw new Error(`Impossible de récupérer le membre à supprimer.`);
        }
        if (member?.photo_path) {
            await deleteImagesFromStorage([{ bucket: 'team_images', path: member.photo_path }]);
        }
        const { error: dbError } = await supabaseAdmin.from('team_members').delete().eq('id', memberId);
        if (dbError) {
          console.error("Erreur Supabase lors de la suppression du membre de l'équipe:", dbError.message);
          throw new Error("Une erreur est survenue lors de la suppression du membre de l'équipe.");
        }
        revalidatePath('/equipe');
        revalidatePath('/admin');
        return { success: true };
    } catch (error: any) {
        console.error("Erreur inattendue lors de deleteTeamMemberAction:", error.message);
        return { success: false, error: "Une erreur inattendue est survenue lors de la suppression du membre de l'équipe." };
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
        const cookieStore = cookies();
        const publicSupabase = createServerClient(supabaseUrl!, supabaseAnonKey!, { // Assertion non-nulle
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value;
            },
            set(name: string, value: string, options: CookieOptions) {
              try {
                cookieStore.set({ name, value, ...options });
              } catch (error) {
                // The `set` method was called from a Server Component. This can be ignored if you have middleware refreshing user sessions.
              }
            },
            remove(name: string, options: CookieOptions) {
              try {
                cookieStore.set({ name, value: '', ...options });
              } catch (error) {
                // The `delete` method was called from a Server Component. This can be ignored if you have middleware refreshing user sessions.
              }
            },
          },
        });
    const { error } = await publicSupabase.from('messages').insert([{ ...validatedFields.data }]);
        if (error) {
          console.error("Erreur Supabase lors de l'envoi du message de contact:", error.message);
          throw new Error("Une erreur est survenue lors de l'envoi du message.");
        }
        return { success: true };
    } catch (error: any) {
        console.error("Erreur inattendue lors de l'envoi du message de contact:", (error as Error).message);
        return { success: false, error: "Impossible d'envoyer le message. Veuillez réessayer." };
    }
}

// --- NOUVELLES ACTIONS DE LECTURE (Bypass RLS) ---

export async function getSiteSettingsAction() {
  try {
    // Utilisation de supabaseAdmin pour contourner les RLS
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('key, value');
    
    if (error) throw error;
    
    // Transformation en objet simple { key: value } pour faciliter l'usage
    const settings = data?.reduce((acc: any, curr: { key: string; value: any }) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {}) || {};

    return { success: true, data: settings };
  } catch (error: any) {
    console.error("Erreur getSiteSettingsAction:", error.message);
    return { success: false, error: error.message };
  }
}

export async function getFeaturesAction(context: string) {
  try {
    // Utilisation de supabaseAdmin pour contourner les RLS
    const { data, error } = await supabaseAdmin
      .from('expertise_features')
      .select('*')
      .eq('page_context', context)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error("Erreur getFeaturesAction:", error.message);
    return { success: false, error: error.message };
  }
}