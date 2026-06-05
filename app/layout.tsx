import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "./providers";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
    variable: "--font-jetbrains-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Financer — Finance Manager",
    description: "High-density financial terminal for accounts, budgets, and cash-flow intelligence.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={`${inter.variable} ${jetBrainsMono.variable} h-full antialiased`}
        >

            <body className="min-h-full flex flex-col">
                <ClerkProvider>
                    <Providers>
                        <main className="flex-1">
                            {children}
                        </main>
                    </Providers>
                </ClerkProvider>
            </body>
        </html>
    );
}
