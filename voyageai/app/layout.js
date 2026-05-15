import "./globals.css";

export const metadata = {
  title: "VoyageAI – AI Utazástervező",
  description: "Teljes utazási tervek AI segítségével",
};

export default function RootLayout({ children }) {
  return (
    <html lang="hu">
      <body>{children}</body>
    </html>
  );
}
