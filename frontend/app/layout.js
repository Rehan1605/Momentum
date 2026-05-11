import "./globals.css";

export const metadata = {
  title: "Momentum",
  description: "Personal habit tracking dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className="dark h-full antialiased"
    >
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
