import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

/**
 * Detects whether the current viewport is considered mobile and updates as the viewport changes.
 *
 * The hook returns a boolean that reflects whether the window width is strictly less than MOBILE_BREAKPOINT.
 *
 * @returns `true` if the current window width is less than `MOBILE_BREAKPOINT`, `false` otherwise.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener('change', onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return !!isMobile;
}