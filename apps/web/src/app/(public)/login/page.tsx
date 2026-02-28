"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useLoginMutation, useSessionQuery } from "@/features/auth/queries";
import { seedUsers } from "@/features/shared/mock-seed";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export default function LoginPage() {
  const router = useRouter();
  const { data } = useSessionQuery();
  const loginMutation = useLoginMutation();
  const [selectedUserId, setSelectedUserId] = useState(seedUsers[0]?.id ?? "");

  useEffect(() => {
    if (data?.user) {
      router.replace("/orgs");
    }
  }, [data?.user, router]);

  const onLogin = async () => {
    if (!selectedUserId) return;

    try {
      await loginMutation.mutateAsync(selectedUserId);
      toast.success("로그인되었습니다.");
      router.push("/orgs");
      router.refresh();
    } catch {
      toast.error("로그인에 실패했습니다.");
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-lg items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>로그인</CardTitle>
          <CardDescription>데모 계정으로 세션을 시작하세요.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="login-user">계정 선택</Label>
            <Select
              id="login-user"
              value={selectedUserId}
              onChange={(event) => setSelectedUserId(event.target.value)}
            >
              {seedUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </Select>
          </div>
          <Button className="w-full" onClick={onLogin} disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "로그인 중..." : "로그인"}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
