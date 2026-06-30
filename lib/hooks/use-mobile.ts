"use client";

import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 768;

/** true en viewport < md (768px). undefined hasta el primer render en cliente. */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const sync = () => setIsMobile(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return isMobile;
}
