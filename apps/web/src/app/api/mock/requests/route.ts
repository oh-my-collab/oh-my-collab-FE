import { getSessionUserIdOrThrow } from "@/features/auth/session";
import { jsonError } from "@/features/shared/api-utils";
import { createRequestSchema } from "@/features/shared/schemas";
import {
  createRequest,
  getOrganizationById,
  listRequests,
  listUsers,
} from "@/features/shared/mock-store";

export async function GET(request: Request) {
  try {
    const userId = await getSessionUserIdOrThrow(request);
    const orgId = new URL(request.url).searchParams.get("orgId");
    if (!orgId) throw new Error("INVALID_INPUT");

    const org = getOrganizationById(orgId);
    if (!org || !org.memberIds.includes(userId)) throw new Error("FORBIDDEN");

    const requests = listRequests(orgId, userId);
    return Response.json({ requests, users: listUsers() }, { status: 200 });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getSessionUserIdOrThrow(request);
    const payload = createRequestSchema.parse(await request.json());

    if (payload.fromUserId !== userId) throw new Error("FORBIDDEN");

    const org = getOrganizationById(payload.orgId);
    if (!org || !org.memberIds.includes(userId)) throw new Error("FORBIDDEN");

    const collabRequest = createRequest(payload);
    return Response.json({ request: collabRequest }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
