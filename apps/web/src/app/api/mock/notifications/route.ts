import { getSessionUserIdOrThrow } from "@/features/auth/session";
import { jsonError } from "@/features/shared/api-utils";
import { listNotifications } from "@/features/shared/mock-store";

export async function GET(request: Request) {
  try {
    const userId = await getSessionUserIdOrThrow(request);
    return Response.json({ notifications: listNotifications(userId) }, { status: 200 });
  } catch (error) {
    return jsonError(error);
  }
}
