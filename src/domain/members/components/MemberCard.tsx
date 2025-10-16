import type { GroupMemberInfo } from "@/shared/apis";
import { Card, CardContent } from "@/shared/components/card";

type MemberCardProps = {
  member: GroupMemberInfo;
};

const getRoleLabel = (
  role: "OWNER" | "HEAD_MANAGER" | "MANAGER" | "STAFF" | "MEMBER"
): string => {
  const roleMap = {
    OWNER: "소유자",
    HEAD_MANAGER: "총괄 관리자",
    MANAGER: "관리자",
    STAFF: "스태프",
    MEMBER: "멤버",
  };
  return roleMap[role];
};

export const MemberCard = ({ member }: MemberCardProps) => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 p-4">
        <div className="relative">
          <img
            src={
              member.profile ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`
            }
            alt={member.name}
            className="size-16 rounded-full object-cover"
          />
        </div>
        <div className="text-center">
          <p className="font-semibold">{member.name}</p>
          <p className="text-muted-foreground text-xs">
            {getRoleLabel(member.role)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
