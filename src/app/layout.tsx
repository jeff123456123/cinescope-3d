import type { Metadata } from "next";
import { WatchlistProvider } from "@/context/watchlist-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "CineScope 3D | Your Next Obsession Starts Here",
  description:
    "Discover movies worth remembering and build a watchlist for every mood with CineScope 3D.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <WatchlistProvider>{children}</WatchlistProvider>
      </body>
    </html>
  );
}
