"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const heroImages = [
  { src: "/assets/reference1.jpg", alt: "Bright Kigali home exterior" },
  { src: "/assets/reference2.jpg", alt: "Modern home interior in Kigali" },
  { src: "/assets/reference3.jpg", alt: "Welcoming living room" },
  { src: "/assets/reference4.jpg", alt: "Contemporary apartment space" },
  { src: "/assets/reference5.jpg", alt: "Comfortable home with natural light" },
  { src: "/assets/reference6.jpg", alt: "Kigali neighbourhood home" },
];

export function HeroImageSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % heroImages.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <div
      className="hero-image hero-slider"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
      role="region"
      aria-label="Featured homes in Kigali"
    >
      {heroImages.map((image, index) => (
        <Image
          key={image.src}
          src={image.src}
          alt={image.alt}
          fill
          priority={index === 0}
          sizes="(max-width: 800px) 86vw, 390px"
          className={`hero-slide ${index === activeIndex ? "is-active" : ""}`}
        />
      ))}

      <div className="hero-slider-label">
        <span>Featured homes</span>
        <b>Kigali, Rwanda</b>
      </div>

      <div className="hero-slider-dots" aria-label="Choose featured home image">
        {heroImages.map((image, index) => (
          <button
            key={image.src}
            type="button"
            className={index === activeIndex ? "is-active" : ""}
            onClick={() => setActiveIndex(index)}
            aria-label={`Show image ${index + 1}`}
            aria-pressed={index === activeIndex}
          />
        ))}
      </div>
    </div>
  );
}
