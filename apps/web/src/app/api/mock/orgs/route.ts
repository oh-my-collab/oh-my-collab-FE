import { getSessionUserIdOrThrow } from "@/features/auth/session";
import { jsonError } from "@/features/shared/api-utils";
import { createOrgSchema } from "@/features/shared/schemas";
import {
  createOrganization,
  getSettings,
  listOrganizationsForUser,
} from "@/features/shared/mock-store";

export async function GET(request: Request) {
  try {
    const userId = await getSessionUserIdOrThrow(request);
    const orgs = listOrganizationsForUser(userId);
    const settings = getSettings();
    return Response.json(
      {
        organizations: orgs,
        defaultOrgId: settings.defaultOrgId,
      },
      { status: 200 }
    );
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getSessionUserIdOrThrow(request);
    const payload = createOrgSchema.parse(await request.json());
    const org = createOrganization(userId, payload.name);
    return Response.json({ organization: org }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
