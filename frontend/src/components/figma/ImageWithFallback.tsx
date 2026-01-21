<<<<<<< HEAD
import React, { useState } from 'react';
=======
import React, { useState, CSSProperties, useEffect } from 'react';
>>>>>>> origin/main

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

<<<<<<< HEAD
export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
=======
interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  style?: CSSProperties;
  className?: string;
}

export function ImageWithFallback({ src, alt, style, className, ...rest }: ImageWithFallbackProps) {
>>>>>>> origin/main
  const [didError, setDidError] = useState(false);

  const handleError = () => {
    setDidError(true);
  };

<<<<<<< HEAD
  const { src, alt, style, className, ...rest } = props;
=======
  // src 変更時にエラー状態をリセット
  useEffect(() => {
    setDidError(false);
  }, [src]);
>>>>>>> origin/main

  return didError ? (
    <div
      className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
      style={style}
    >
      <div className="flex items-center justify-center w-full h-full">
<<<<<<< HEAD
        <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} data-original-url={src} />
=======
        <img src={ERROR_IMG_SRC} alt={alt} {...rest} data-original-url={src} />
>>>>>>> origin/main
      </div>
    </div>
  ) : (
    <img src={src} alt={alt} className={className} style={style} {...rest} onError={handleError} />
  );
}
