"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  type MouseEvent,
} from "react";

const destination = "/#now-showing";

export function WatchNextLink() {
  const pathname = usePathname();
  const router = useRouter();

  const scrollToMovies = useCallback(() => {
    const target = document.getElementById("now-showing");
    if (!target) {
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    target.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }, []);

  useEffect(() => {
    if (pathname === "/" && window.location.hash === "#now-showing") {
      scrollToMovies();
    }
  }, [pathname, scrollToMovies]);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    if (pathname === "/") {
      if (window.location.hash !== "#now-showing") {
        window.history.pushState(null, "", "#now-showing");
      }
      scrollToMovies();
      return;
    }

    router.push(destination);
  }

  return (
    <Link className="nav-link" href={destination} onClick={handleClick}>
      Your next watch
    </Link>
  );
}
