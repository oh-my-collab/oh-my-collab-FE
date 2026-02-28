import { NextResponse } from "next/server";

import { loginSchema } from "@/features/shared/schemas";
import { getUserById } from "@/features/shared/mock-store";
import { MOCK_SESSION_COOKIE } from "@/features/auth/session";
import { jsonError } from "@/features/shared/api-utils";

const maxAge = 60 * 60 * 24 * 30;

export async function POST(request: Request) {
  try {
    const payload = loginSchema.parse(await request.json());
    const user = getUserById(payload.userId);
    if (!user) throw new Error("NOT_FOUND");

    const response = NextResponse.json({ user }, { status: 200 });
    response.cookies.set(MOCK_SESSION_COOKIE, user.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge,
    });

    return response;
  } catch (error) {
    return jsonError(error);
  }
}
