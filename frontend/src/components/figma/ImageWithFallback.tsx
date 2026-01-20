import React, { useState, CSSProperties, useEffect } from 'react';

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  style?: CSSProperties;
  className?: string;
}

/**
 * Renders an image and displays a built-in placeholder if the source fails to load.
 *
 * If the provided `src` fails to load, a light-gray placeholder containing an embedded SVG is rendered
 * instead; the placeholder image receives the original `src` in a `data-original-url` attribute and uses
 * the provided `alt` text. If `src` changes, the component clears the error state and attempts to render
 * the new image. All other standard <img> attributes passed via `...rest` are forwarded to the rendered image element.
 *
 * @param src - The image URL to display
 * @param alt - Alternate text for the image and placeholder
 * @param style - Inline styles applied to the outer element or image
 * @param className - CSS class applied to the outer element or image
 * @returns The rendered image element (either the original image or the fallback placeholder)
 */
export function ImageWithFallback({ src, alt, style, className, ...rest }: ImageWithFallbackProps) {
  const [didError, setDidError] = useState(false);

  const handleError = () => {
    setDidError(true);
  };

  // src 変更時にエラー状態をリセット
  useEffect(() => {
    setDidError(false);
  }, [src]);

  return didError ? (
    <div
      className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
      style={style}
    >
      <div className="flex items-center justify-center w-full h-full">
        <img src={ERROR_IMG_SRC} alt={alt} {...rest} data-original-url={src} />
      </div>
    </div>
  ) : (
    <img src={src} alt={alt} className={className} style={style} {...rest} onError={handleError} />
  );
}