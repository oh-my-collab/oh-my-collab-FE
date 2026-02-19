type UserResult = {
  user: { id: string } | null;
};

export async function requireUser(getUser: () => Promise<UserResult>) {
  const { user } = await getUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  return user;
}
