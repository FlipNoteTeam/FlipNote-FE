import { GROUP_CATEGORY, type GroupBrief } from "@/domain/group";
import { Button } from "@/shared/components/button";
import { Card, CardContent, CardDescription } from "@/shared/components/card";
import { Checkbox } from "@/shared/components/checkbox";
import { Input } from "@/shared/components/input";
import { Label } from "@/shared/components/label";
import BaseLayout from "@/shared/layouts/base-layout";
import { Link } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";

const GroupList = () => {
  return (
    <BaseLayout>
      {/* 검색 영역 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="스터디 그룹을 검색해보세요"
          className="pl-10 bg-white"
        />
      </div>

      {/* 필터 영역 */}
      <div className="bg-gray-50 rounded-lg p-4 mt-2">
        <h3 className="text-sm font-medium text-gray-700 mb-3">카테고리</h3>
        <div className="flex flex-wrap gap-4">
          {GROUP_CATEGORY.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox id={category} />
              <Label
                htmlFor={category}
                className="text-sm font-normal cursor-pointer"
              >
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* 생성 버튼 */}
      <div className="flex justify-end mt-2">
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          그룹 생성
        </Button>
      </div>

      {/* 그룹 리스트 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
        {mockData.map((group) => (
          <Link to="/" key={group.id}>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer">
              <div className="w-full h-40 bg-gray-100">
                <img
                  src={group.image}
                  alt={`${group.name}의 썸네일`}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                  {group.name}
                </h3>
                <CardDescription className="line-clamp-2 text-sm">
                  {group.description}
                </CardDescription>
                <div className="mt-3 text-xs text-gray-500">
                  {group.createdAt.toLocaleDateString()}
                </div>
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
