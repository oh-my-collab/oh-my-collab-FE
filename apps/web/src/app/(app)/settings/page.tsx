"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useOrganizationsQuery } from "@/features/orgs/queries";
import { useSettingsQuery, useUpdateSettingsMutation } from "@/features/settings/queries";

const schema = z.object({
  defaultOrgId: z.string().min(1),
  emailNotifications: z.boolean(),
  mentionNotifications: z.boolean(),
  issueStatusNotifications: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export default function SettingsPage() {
  const orgQuery = useOrganizationsQuery();
  const settingsQuery = useSettingsQuery();
  const updateMutation = useUpdateSettingsMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      defaultOrgId: "",
      emailNotifications: true,
      mentionNotifications: true,
      issueStatusNotifications: true,
    },
  });

  useEffect(() => {
    if (!settingsQuery.data?.settings) return;

    form.reset({
      defaultOrgId: settingsQuery.data.settings.defaultOrgId,
      emailNotifications: settingsQuery.data.settings.emailNotifications,
      mentionNotifications: settingsQuery.data.settings.mentionNotifications,
      issueStatusNotifications: settingsQuery.data.settings.issueStatusNotifications,
    });
  }, [form, settingsQuery.data?.settings]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await updateMutation.mutateAsync(values);
      toast.success("설정을 저장했습니다.");
    } catch {
      toast.error("설정 저장에 실패했습니다.");
    }
  });

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">Settings</p>
        <h2 className="text-2xl font-bold">조직/알림 설정</h2>
        <p className="text-sm text-muted-foreground">기본 조직과 알림 정책을 관리합니다.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>기본 설정</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-1">
              <Label htmlFor="default-org">기본 조직</Label>
              <Select id="default-org" {...form.register("defaultOrgId")}>
                {(orgQuery.data?.organizations ?? []).map((org) => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-2 rounded-md border border-border p-3 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" {...form.register("emailNotifications")} /> 이메일 알림
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" {...form.register("mentionNotifications")} /> 멘션 알림
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" {...form.register("issueStatusNotifications")} /> 이슈 상태 변경 알림
              </label>
            </div>

            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "저장 중..." : "저장"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
