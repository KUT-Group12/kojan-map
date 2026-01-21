import React, { useState } from 'react';

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  // 1. まず最初に props から必要な値を取り出す
  const { src, alt, style, className, ...rest } = props;

  // 2. 取り出した src を使って state を初期化する
  const [didError, setDidError] = useState(false);
  const [prevSrc, setPrevSrc] = useState(src);

  // 3. src が変更された場合の検知 (レンダリング中の更新)
  if (src !== prevSrc) {
    setPrevSrc(src);
    setDidError(false);
  }

  const handleError = () => {
    setDidError(true);
  };

  if (didError) {
    return (
      <div
        className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
        style={style}
      >
        <div className="flex items-center justify-center w-full h-full">
          <img
            src={ERROR_IMG_SRC}
            alt={alt ?? 'Error loading image'}
            {...rest}
            // data-original-url は ...rest の後に書かないと上書きされる可能性があるため注意
            data-original-url={src}
          />
        </div>
      </div>
    );
  }

  return (
    <img src={src} alt={alt} className={className} style={style} {...rest} onError={handleError} />
  );
}
