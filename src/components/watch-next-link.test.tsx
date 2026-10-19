import { fireEvent, render, screen } from "@testing-library/react";
import { usePathname, useRouter } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WatchNextLink } from "@/components/watch-next-link";

const push = vi.fn();
const router = {
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  push,
  replace: vi.fn(),
  prefetch: vi.fn(),
  bfcacheId: "test",
} satisfies ReturnType<typeof useRouter>;

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(),
}));

describe("WatchNextLink", () => {
  let reducedMotion = false;

  beforeEach(() => {
    reducedMotion = false;
    vi.mocked(usePathname).mockReturnValue("/");
    vi.mocked(useRouter).mockReturnValue(router);
    push.mockReset();
    window.history.replaceState(null, "", "/");
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: (media: string) =>
        ({
          matches:
            media.includes("prefers-reduced-motion") && reducedMotion,
          media,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        }) satisfies MediaQueryList,
    });
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("scrolls on every same-route click and honors reduced motion", () => {
    const target = document.createElement("section");
    target.id = "now-showing";
    document.body.append(target);
    render(<WatchNextLink />);

    fireEvent.click(screen.getByRole("link", { name: "Your next watch" }));
    expect(window.location.hash).toBe("#now-showing");
    expect(target.scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    });

    reducedMotion = true;
    target.scrollIntoView = vi.fn();
    fireEvent.click(screen.getByRole("link", { name: "Your next watch" }));
    expect(target.scrollIntoView).toHaveBeenCalledWith({
      behavior: "auto",
      block: "start",
    });
    target.remove();
  });

  it("navigates home with the target hash from another route", () => {
    vi.mocked(usePathname).mockReturnValue("/watchlist");
    render(<WatchNextLink />);

    fireEvent.click(screen.getByRole("link", { name: "Your next watch" }));

    expect(push).toHaveBeenCalledWith("/#now-showing");
  });
});
