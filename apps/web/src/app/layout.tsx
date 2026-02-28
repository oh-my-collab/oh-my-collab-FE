import type { Metadata } from "next";

import "./globals.css";
import { AppProviders } from "@/lib/providers";

export const metadata: Metadata = {
  title: {
    default: "협업툴",
    template: "%s | 협업툴",
  },
  description: "기여도 추적 + AI 난이도 판별 리포트 협업 플랫폼",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
