import type { GroupDetail } from "@/domain/group";
import type { GroupMemberInfo } from "@/shared/apis";
import BaseLayout from "@/shared/layouts/base-layout";

type Props = { id: string };

const GroupDetailPage = ({ id }: Props) => {
  const data = mockData;
  const members: GroupMemberInfo[] = [
    {
      id: 0,
      role: "OWNER",
      name: "string",
      profile: "string",
    },
    {
      id: 1,
      role: "OWNER",
      name: "string",
      profile: "string",
    },
    {
      id: 2,
      role: "OWNER",
      name: "string",
      profile: "string",
    },
  ];
  return (
    <BaseLayout>
      {id}

      <div>
        <div className="string"></div>
        <div>
          <div>
            <img src={data.image} alt={`${data.name} 그룹의 이미지`} />
            <div>
              <span>{data.name}</span>
              <span>{data.description}</span>
              <div>카테고리자리</div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3>멤버</h3>+
        {members.map((member) => (
          <div key={member.id}>{member.name} 권한갖고있으면 표기</div>
        ))}
      </div>

      <div>
        <h3>카드셋 자리</h3>
      </div>
    </BaseLayout>
  );
};

const mockData: GroupDetail = {
  name: "React Study Group",
  description:
    "A group for learning and discussing React, Next.js, and modern web development.",
  requireApply: true,
  public: true,
  maxMember: 20,
  image: "https://picsum.photos/300/200?random=1",
  createdAt: new Date("2024-03-10T10:00:00Z"),
  modifiedAt: new Date("2024-03-10T10:00:00Z"),
};

export default GroupDetailPage;
