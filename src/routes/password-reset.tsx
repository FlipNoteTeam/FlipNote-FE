import z from "zod";
import BaseLayout from "@/shared/layouts/base-layout";
import { createFileRoute, useSearch } from "@tanstack/react-router";

import PasswordResetRequestForm from "@/features/password-reset/components/password-reset-request-form";
import PasswordResetForm from "@/features/password-reset/components/password-reset-form";
import { Button } from "@/shared/components/button";
import { useState } from "react";

export const Route = createFileRoute("/password-reset")({
  component: RouteComponent,
  validateSearch: z.object({
    token: z.string().optional(),
  }),
  head: () => ({
    meta: [
      { title: "비밀번호 재설정 | FlipNote" },
      {
        name: "description",
        content: "비밀번호를 재설정하세요",
      },
    ],
  }),
});

function RouteComponent() {
  const token = useSearch({
    select: (state) => state.token,
    from: "/password-reset",
  });

  const [step, setStep] = useState<"request" | "reset">(
    !token ? "request" : "reset",
  );

  return (
    <BaseLayout>
      <div className="space-y-4">
        {step === "request" ? (
          <>
            <PasswordResetRequestForm />
            <div className="container mx-auto px-4 max-w-md">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  이미 토큰을 받으셨나요?
                </p>
                <Button
                  variant="outline"
                  onClick={() => setStep("reset")}
                  className="w-full"
                >
                  토큰으로 비밀번호 재설정하기
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <PasswordResetForm token={token} />
            <div className="container mx-auto px-4 max-w-md">
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={() => setStep("request")}
                  className="w-full"
                >
                  토큰 재발급 받기
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </BaseLayout>
  );
}
