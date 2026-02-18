import { useQuery } from "@tanstack/react-query";
import { groupJoinApi } from "@/shared/apis/group-join";

// 내가 신청한 가입 신청 목록 조회
export const useMyGroupJoinList = () => {
  return useQuery({
    queryKey: ["groups", "joins", "me"],
    queryFn: async () => {
      const response = await groupJoinApi.getMyGroupJoinList();
      return response.data.data.groupJoins;
    },
  });
};
