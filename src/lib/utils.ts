// Cette fonction prend une URL YouTube complète et renvoie juste l'ID
export const getYouTubeID = (url: string) => {
  if (!url) return null;
  
  // Expression régulière (Regex) pour trouver l'ID peu importe le format du lien
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  return (match && match[2].length === 11) ? match[2] : null;
};