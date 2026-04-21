"use client";

import React from "react";

type Props = {
  videoId: string;
  title: string;
};

export default function YouTubePlayer({ videoId, title }: Props) {
  return (
    <iframe
      src={`https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&modestbranding=1&rel=0`}
      title={title}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      loading="lazy"
      className="w-full h-full border-0"
    ></iframe>
  );
}