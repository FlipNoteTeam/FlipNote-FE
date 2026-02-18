import BaseLayout from "@/shared/layouts/base-layout";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import PasswordResetRequestForm from "@/features/password-reset/components/password-reset-request-form";
import PasswordResetForm from "@/features/password-reset/components/password-reset-form";
import { Button } from "@/shared/components/button";

export const Route = createFileRoute("/reset-password")({
  component: RouteComponent,
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
  const [step, setStep] = useState<"request" | "reset">("request");

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
            <PasswordResetForm />
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
