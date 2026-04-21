import { z } from 'zod';

export const PostProdDetailSchema = z.object({
  detail: z.string().min(1, "Le détail de la post-production est requis."),
  before_path: z.string().nullable().optional(),
  after_path: z.string().nullable().optional(),
});

export const ProjectSchema = z.object({
  title: z.string().min(1, "Le titre est requis."),
  description: z.string().nullable(),
  youtube_url: z.string().min(1, "L'URL YouTube est requise.").url("L'URL YouTube est invalide."),
  project_date: z.string().refine((val) => !isNaN(Date.parse(val)), "Date de projet invalide."),
  category: z.string(),
  client_name: z.string().nullable(),
  client_website: z.string().nullable(),
  description_drone: z.string().nullable(),
  postprod_main_description: z.string().nullable(),
  client_logo_path: z.string().nullable(),
  postprod_before_path: z.string().nullable(),
  postprod_after_path: z.string().nullable(),
  description_postprod: z.array(PostProdDetailSchema).nullable(),
});

export const ContactFormSchema = z.object({
  nom: z.string().min(2, "Le nom est trop court.").max(50, "Le nom est trop long."),
  email: z.string().email("L'email est invalide."),
  objet: z.enum(['devis', 'info', 'autre']),
  message: z.string().min(10, "Le message est trop court.").max(2000, "Le message est trop long."),
});