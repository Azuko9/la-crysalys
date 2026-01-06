export function getYouTubeID(url: string) {
  // Gère : watch?v=, tu.be/, embed/, et /shorts/
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}