"use client";

import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';

interface ImageCompareSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export const ImageCompareSlider: React.FC<ImageCompareSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = "Avant",
  afterLabel = "Après"
}) => {
  if (!beforeImage || !afterImage) {
    return null; // Ne rien afficher si une des images manque
  }

  return (
    <ReactCompareSlider
      itemOne={<ReactCompareSliderImage src={beforeImage} alt={beforeLabel} />}
      itemTwo={<ReactCompareSliderImage src={afterImage} alt={afterLabel} />}
      className="rounded-dynamic border border-zinc-700 shadow-lg"
    />
  );
};