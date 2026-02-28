import { getSessionUser } from "@/features/auth/current-user";

export async function GET(request: Request) {
  const user = await getSessionUser(request);
  return Response.json({ user }, { status: 200 });
}
