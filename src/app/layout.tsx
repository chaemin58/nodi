import type { Metadata } from "next";
import "./globals.css";
import { AddMeetingProvider } from "@/providers/AddMeetingProvider";
import { Toaster } from "@/components/Toast/Toaster";

export const metadata: Metadata = {
  title: "Nodi — 약속 장소, 같이 정하기",
  description:
    "친구들과 약속 장소를 함께 정하는 보드. 장소를 모아 투표로 정하고 카톡으로 공유하세요.",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        {/* Pretendard (동적 서브셋 CDN) */}
        <link
          rel="stylesheet"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <AddMeetingProvider>{children}</AddMeetingProvider>
        <Toaster />
      </body>
    </html>
  );
}
