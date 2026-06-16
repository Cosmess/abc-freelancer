import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PageLoader } from "@/components/ui/page-loader";

const appUrl = "https://www.abcfreelancer.com.br";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "ABC Freelancer",
  description:
    "Marketplace local para conectar estabelecimentos e freelancers no ABCD Paulista.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "ABC Freelancer",
    description:
      "Conecte estabelecimentos e freelancers no ABCD Paulista para vagas pontuais, diarias e turnos.",
    url: appUrl,
    siteName: "ABC Freelancer",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "ABC Freelancer - freelancers e estabelecimentos do ABCD Paulista",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ABC Freelancer",
    description:
      "Conecte estabelecimentos e freelancers no ABCD Paulista para vagas pontuais, diarias e turnos.",
    images: ["/og-image.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <PageLoader />
        {children}
      </body>
    </html>
  );
}
