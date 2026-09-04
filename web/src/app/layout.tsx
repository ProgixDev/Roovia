import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { THEME_VARIANTS, VARIANT_STORAGE_KEY } from "@/contexts/theme-variants";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

const VALID_VARIANT_IDS = THEME_VARIANTS.map((v) => v.id);

// Sets `data-theme` on <html> synchronously, before the browser's first
// paint — the same reason next-themes' own `.dark` class never flashes.
// VariantProvider's mount effect can't run until the JS bundle hydrates,
// which is well after that first paint, so without this the page always
// renders the default palette first and flips to the stored one a moment
// later.
const SET_VARIANT_SCRIPT = `(function() {
  try {
    var stored = localStorage.getItem(${JSON.stringify(VARIANT_STORAGE_KEY)});
    if (stored && ${JSON.stringify(VALID_VARIANT_IDS)}.indexOf(stored) > -1) {
      document.documentElement.setAttribute("data-theme", stored);
    }
  } catch (e) {}
})();`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Needed to resolve og:image/twitter:image into absolute URLs — without
  // it Next falls back to localhost even in production. Set
  // NEXT_PUBLIC_SITE_URL once this is actually deployed somewhere.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "App",
  description: "App",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      // next-themes sets the .dark class client-side, before hydration
      // finishes, so the class it applies never matches the server-rendered
      // markup — that mismatch is expected here, not a real bug.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: SET_VARIANT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
