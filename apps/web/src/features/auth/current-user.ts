import type { User } from "@/features/shared/types";
import { getUserById } from "@/features/shared/mock-store";
import { getOptionalSessionUserId, getSessionUserIdOrThrow } from "@/features/auth/session";

export async function getSessionUser(request?: Request): Promise<User | null> {
  const userId = await getOptionalSessionUserId(request);
  if (!userId) return null;
  return getUserById(userId);
}

export async function requireSessionUser(request?: Request): Promise<User> {
  const userId = await getSessionUserIdOrThrow(request);
  const user = getUserById(userId);
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}
