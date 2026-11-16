import "./globals.css";

export const metadata = {
  title: "CyberHelp API",
  description: "Next.js API backend for the CyberHelp academic project."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
