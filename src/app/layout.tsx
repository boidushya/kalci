import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kalc",
  description: "Playground for calculating Kamino Points",
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
      </head>
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
