import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import NotificationManager from "@/components/NotificationManager";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TreandX | Real-time Social News",
  description: "Join the conversation on TreandX. Real-time news and social interactions.",
};

import { NotificationProvider } from "@/context/NotificationContext";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <SocketProvider>
            <NotificationProvider>
              <NotificationManager />
              <Toaster />
              <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-background overflow-hidden animate-in">
                <div className="w-full max-w-[420px] h-full flex flex-col">
                  {children}
                </div>
              </main>
            </NotificationProvider>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
