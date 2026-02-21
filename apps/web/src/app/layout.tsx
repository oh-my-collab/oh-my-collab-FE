import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "oh-my-collab",
    template: "%s | oh-my-collab",
  },
  description: "팀 협업 실행 데이터와 관리자 평가 참고자료를 통합 관리하는 워크스페이스.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
