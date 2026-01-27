"use client"; // Indique que ce fichier est un module client

import { supabase } from '@/lib/supabaseClient'; // Votre client Supabase pour le navigateur

/**
 * Uploade un fichier vers un bucket Supabase Storage et retourne son chemin.
 * @param file Le fichier à uploader.
 * @param bucketName Le nom du bucket de destination (ex: 'portfolio_images').
 * @param folderPath Le chemin du dossier dans le bucket (ex: 'projects/', 'team_members/').
 * @returns Le chemin du fichier uploadé (ex: 'projects/unique-id.jpg'), ou null en cas d'erreur.
 */
export async function uploadFileAndGetPath(file: File, bucketName: string, folderPath: string = ''): Promise<string | null> {
  if (!file) {
    console.error("Aucun fichier fourni pour l'upload.");
    return null;
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  const filePath = `${folderPath}${fileName}`; // Chemin complet dans le bucket

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false, // Ne pas écraser si le fichier existe déjà (le nom unique gère ça)
    });

  if (error) {
    console.error(`Erreur lors de l'upload du fichier vers ${bucketName}/${filePath}:`, error.message);
    return null;
  }

  return data.path; // Supabase retourne le chemin relatif dans le bucket
}