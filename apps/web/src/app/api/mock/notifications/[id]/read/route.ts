import { getSessionUserIdOrThrow } from "@/features/auth/session";
import { jsonError } from "@/features/shared/api-utils";
import { markNotificationRead } from "@/features/shared/mock-store";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserIdOrThrow(request);
    const { id } = await context.params;
    const notification = markNotificationRead(id, userId);
    if (!notification) throw new Error("NOT_FOUND");

    return Response.json({ notification }, { status: 200 });
  } catch (error) {
    return jsonError(error);
  }
}
