import { useLayoutEffect } from "react";


let lockCount = 0;
let originalOverflow = "";
let originalPaddingRight = "";

function applyLock() {
  if (lockCount === 0) {
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    originalOverflow = document.body.style.overflow;
    originalPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    const headerEl = document.getElementById("main-header-nav");
    if (headerEl) headerEl.style.paddingRight = `${scrollbarWidth}px`;
  }
  lockCount += 1;
}

function releaseLock() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.overflow = originalOverflow;
    document.body.style.paddingRight = originalPaddingRight;

    const headerEl = document.getElementById("main-header-nav");
    if (headerEl) headerEl.style.paddingRight = "0px";
  }
}


export default function useBodyScrollLock(isLocked) {
  useLayoutEffect(() => {
    if (!isLocked) return;

    applyLock();
    return () => releaseLock();
  }, [isLocked]);
}
