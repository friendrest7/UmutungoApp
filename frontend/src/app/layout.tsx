import type { Metadata } from "next";
import "@/styles/index.css";
import { TranslationProvider } from "@/components/translation-provider";
import { AuthProvider } from "@/components/auth-provider";

export const metadata: Metadata = {
  title: "InzuHub | Find a place to call home",
  description:
    "Rwanda's trusted rental marketplace for tenants, owners, and commissioners.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/*
        Inline script runs before React hydration to prevent theme/accent flash.
        Reads localStorage and applies data-theme + data-accent immediately.
      */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  try {
    var t = localStorage.getItem('inzuhub-theme') || 'system';
    var a = localStorage.getItem('inzuhub-accent') || 'green';
    document.documentElement.dataset.theme = t;
    if (a && a !== 'green') document.documentElement.dataset.accent = a;
  } catch(e) {}
})();
            `.trim(),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <TranslationProvider />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
