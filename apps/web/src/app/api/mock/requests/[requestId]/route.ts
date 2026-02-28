import { getSessionUserIdOrThrow } from "@/features/auth/session";
import { jsonError } from "@/features/shared/api-utils";
import { updateRequestSchema } from "@/features/shared/schemas";
import { updateRequest } from "@/features/shared/mock-store";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ requestId: string }> }
) {
  try {
    const userId = await getSessionUserIdOrThrow(request);
    const payload = updateRequestSchema.parse(await request.json());
    const { requestId } = await context.params;

    const next = updateRequest(requestId, userId, payload);
    if (!next) throw new Error("NOT_FOUND");

    return Response.json({ request: next }, { status: 200 });
  } catch (error) {
    return jsonError(error);
  }
}
