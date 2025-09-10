"use client";
import { useState, useRef, useEffect } from "react";

export default function LazyImage({ 
  src, 
  alt, 
  className, 
  width, 
  height, 
  fallback = "https://via.placeholder.com/240x320/333/fff?text=Loading..." 
}) {
  const [imageSrc, setImageSrc] = useState(fallback);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isInView && src) {
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
      };
      img.onerror = () => {
        setImageSrc("https://via.placeholder.com/240x320/333/fff?text=Error");
        setIsLoaded(true);
      };
      img.src = src;
    }
  }, [isInView, src]);

  return (
    <div ref={imgRef} className="relative">
      <img
        src={imageSrc}
        alt={alt}
        className={`${className} ${!isLoaded ? 'blur-sm' : ''} transition-all duration-300`}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
      />
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-700 animate-pulse rounded"></div>
      )}
    </div>
  );
}