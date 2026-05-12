import type { GroupMemberInfo } from "@/shared/apis";
import { ROLE_LABELS } from "@/domain/group/role";

type MemberCardProps = {
  member: GroupMemberInfo;
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
          {ROLE_LABELS[member.role]}
        </p>
      </div>
    </div>
  );
};
