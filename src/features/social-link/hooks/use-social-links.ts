import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/shared/apis/auth";

export const useSocialLinks = () => {
  return useQuery({
    queryKey: ["socialLinks"],
    queryFn: async () => {
      const response = await authApi.getSocialLinks();
      return response.data.data;
    },
  });
};
