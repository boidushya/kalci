import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://kalc.vercel.app"),
  title: "Kalc",
  description: "Playground for calculating Kamino Points",
  openGraph: {
    title: "Kalc",
    description: "Playground for calculating Kamino Points",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="https://api.fontshare.com/v2/css?f[]=general-sans@1&display=swap"
          as="style"
        />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=general-sans@1&display=swap"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
      </head>
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
