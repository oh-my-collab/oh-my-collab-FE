import { getSessionUserIdOrThrow } from "@/features/auth/session";
import { jsonError } from "@/features/shared/api-utils";
import { updateSettingsSchema } from "@/features/shared/schemas";
import { getSettings, updateSettings } from "@/features/shared/mock-store";

export async function GET(request: Request) {
  try {
    await getSessionUserIdOrThrow(request);
    return Response.json({ settings: getSettings() }, { status: 200 });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    await getSessionUserIdOrThrow(request);
    const payload = updateSettingsSchema.parse(await request.json());
    const settings = updateSettings(payload);
    return Response.json({ settings }, { status: 200 });
  } catch (error) {
    return jsonError(error);
  }
}
