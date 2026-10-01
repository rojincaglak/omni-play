import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Engelsiz Oyun Platformu",
  description: "Görme engelli ve gören bireylerin bir arada oynayabileceği erişilebilir kutu oyunları platformu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Set lang to 'tr' as requested for Turkish accessibility. Screen readers use this to pronounce words correctly.
    <html lang="tr">
      <body className="antialiased min-h-screen flex flex-col">
        {/* Skip to Content link for keyboard-only/screen-reader users */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md font-bold z-50"
        >
          Ana içeriğe geç
        </a>

        {/* Global Semantic Header */}
        <header className="border-b border-gray-200 dark:border-gray-800 p-4" role="banner">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">Engelsiz Oyun Platformu</h1>
            <nav aria-label="Ana Menü">
              <ul className="flex space-x-4 list-none p-0 m-0">
                <li>
                  <a href="/" className="hover:underline text-blue-600 dark:text-blue-400 font-semibold" aria-current="page">
                    Ana Sayfa
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main id="main-content" className="flex-1 max-w-6xl w-full mx-auto p-4" tabIndex={-1}>
          {children}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-gray-200 dark:border-gray-800 p-4 text-center text-sm text-gray-500" role="contentinfo">
          <p>© 2026 Engelsiz Oyun Platformu. Tüm hakları saklıdır.</p>
        </footer>
      </body>
    </html>
  );
}
