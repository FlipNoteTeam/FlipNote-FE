import { GROUP_CATEGORY, type GroupBrief } from "@/domain/group";
import { Card, CardContent, CardDescription } from "@/shared/components/card";
import { Checkbox } from "@/shared/components/checkbox";
import { Input } from "@/shared/components/input";
import { Label } from "@/shared/components/label";
import BaseLayout from "@/shared/layouts/base-layout";
import { Link } from "@tanstack/react-router";

const GroupList = () => {
  /** 내가 참여한 그룹인지도  */

  return (
    <BaseLayout>
      <div className="grid grid-cols-4 gap-4 ">
        {/* 검색 영역 */}

        <Input value="검색해보세요" placeholder="검색해보세요" />
        <div>
          {GROUP_CATEGORY.map((category) => (
            <>
              <Label>{category}</Label>
              <Checkbox />
            </>
          ))}
        </div>
        {/* 리스트 영역 */}
        {mockData.map((group) => (
          <Link to="/" key={group.id}>
            <Card className="p-0 overflow-hidden">
              <div className="w-full h-28">
                <img src={group.image} alt={`${group.name}의 썸네일`} />
              </div>
              <CardContent className="p-4">
                {group.name}
                <CardDescription>{group.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </BaseLayout>
  );
};

const mockData: GroupBrief[] = [
  {
    id: 1,
    name: "프론트엔드 스터디",
    description:
      "React, TypeScript, Next.js를 함께 공부하는 스터디 그룹입니다.",
    image: "https://picsum.photos/300/200?random=1",
    createdAt: new Date("2024-01-15"),
    modifiedAt: new Date("2024-01-20"),
  },
  {
    id: 2,
    name: "백엔드 개발자 모임",
    description:
      "Spring Boot, Node.js, 데이터베이스 설계를 논의하는 모임입니다.",
    image: "https://picsum.photos/300/200?random=2",
    createdAt: new Date("2024-01-10"),
    modifiedAt: new Date("2024-01-18"),
  },
  {
    id: 3,
    name: "UI/UX 디자인 연구회",
    description: "사용자 경험과 인터페이스 디자인을 연구하는 그룹입니다.",
    image: "https://picsum.photos/300/200?random=3",
    createdAt: new Date("2024-01-05"),
    modifiedAt: new Date("2024-01-15"),
  },
  {
    id: 4,
    name: "알고리즘 코딩 테스트",
    description:
      "매주 알고리즘 문제를 풀고 코딩 테스트를 준비하는 스터디입니다.",
    image: "https://picsum.photos/300/200?random=4",
    createdAt: new Date("2024-01-12"),
    modifiedAt: new Date("2024-01-22"),
  },
  {
    id: 5,
    name: "데브옵스 실무 그룹",
    description:
      "CI/CD, Docker, Kubernetes 등 데브옵스 기술을 다루는 그룹입니다.",
    image: "https://picsum.photos/300/200?random=5",
    createdAt: new Date("2024-01-08"),
    modifiedAt: new Date("2024-01-19"),
  },
  {
    id: 6,
    name: "모바일 앱 개발",
    description: "React Native, Flutter를 이용한 모바일 앱 개발 스터디입니다.",
    image: "https://picsum.photos/300/200?random=6",
    createdAt: new Date("2024-01-03"),
    modifiedAt: new Date("2024-01-17"),
  },
];

export default GroupList;
