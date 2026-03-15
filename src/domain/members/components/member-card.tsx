import type { GroupMemberInfo, ROLE } from "@/shared/apis";

type MemberCardProps = {
  member: GroupMemberInfo;
};

const getRoleLabel = (role: ROLE): string => {
  const roleMap: { [key in ROLE]: string } = {
    OWNER: "소유자",
    HEAD_MANAGER: "총괄 관리자",
    MANAGER: "관리자",
    MEMBER: "멤버",
  };
  return roleMap[role];
};

export const MemberCard = ({ member }: MemberCardProps) => {
  return (
    <div className="rounded-md border border-gray-200 flex flex-col items-center gap-3 p-4">
      <div className="relative">
        <img
          src={member.profileImage}
          alt={member.nickname}
          className="size-16 rounded-full object-cover"
        />
      </div>
      <div className="text-center">
        <p className="font-semibold">{member.nickname}</p>
        <p className="text-muted-foreground text-xs">
          {getRoleLabel(member.role)}
        </p>
      </div>
    </div>
  );
};
