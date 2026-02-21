import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import SetupPage from "./page";

describe("SetupPage", () => {
  it("renders required 5 onboarding steps", () => {
    render(<SetupPage />);

    expect(screen.getByText(/저장소 복제 및 기본 브랜치 준비/i)).toBeInTheDocument();
    expect(screen.getByText(/Vercel 프로젝트 연결/i)).toBeInTheDocument();
    expect(screen.getByText(/환경 변수 및 인증 설정/i)).toBeInTheDocument();
    expect(screen.getByText(/데이터베이스 마이그레이션 적용/i)).toBeInTheDocument();
    expect(
      screen.getByText(/워크스페이스 초기화 및 샘플 데이터 점검/i)
    ).toBeInTheDocument();
  });
});
