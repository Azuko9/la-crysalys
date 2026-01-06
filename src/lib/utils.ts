// utils.ts

/**
 * Cette fonction extrait l'ID unique d'une vidéo YouTube (11 caractères)
 * supporte les formats : classiques, raccourcis, embed et SHORTS.
 */
export const getYouTubeID = (url: string) => {
  if (!url) return null;
  
  // Ajout de "shorts\/" dans la liste des patterns reconnus
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  // Un ID YouTube fait toujours exactement 11 caractères
  return (match && match[2].length === 11) ? match[2] : null;
};