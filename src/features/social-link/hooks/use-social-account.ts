import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/shared/apis/auth";

export const useSocialAccountLink = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await authApi.getSocialLinks();
      // OAuth 리다이렉트 URL을 받아서 페이지 이동
      console.log(":::RESPONSE", response);
      if (response.request?.responseURL) {
        window.location.href = response.request.responseURL;
      }
      return response.data;
    },
  });
};

export const useSocialAccountUnlink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (socialLinkId: number) => {
      const response = await authApi.deleteSocialLink(socialLinkId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["socialLinks"] });
      alert("소셜 계정 연동이 해제되었습니다.");
    },
    meta: { errorFallback: "소셜 계정 연동 해제에 실패했습니다." },
  });
};
