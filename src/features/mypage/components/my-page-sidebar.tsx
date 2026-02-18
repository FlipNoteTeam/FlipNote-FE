import { SidebarTabLayout } from "@/shared/layouts/sidebar-tab-layout";

type TabMenu =
  | "profile"
  | "dashboard"
  | "group-management"
  | "alarm-management"
  | "study";

interface MyPageSidebarProps {
  activeTab: TabMenu;
  onTabChange: (tab: TabMenu) => void;
}

export const MyPageSidebar = ({
  activeTab,
  onTabChange,
}: MyPageSidebarProps) => {
  const handleClickTab = (name: TabMenu) => () => {
    onTabChange(name);
  };

  return (
    <SidebarTabLayout.Sidebar>
      <SidebarTabLayout.Tab
        active={activeTab === "profile"}
        onClick={handleClickTab("profile")}
      >
        프로필 관리
      </SidebarTabLayout.Tab>
      {/* 내 그룹[내가 생성한, 내가 그룹장인 그룹],  내 오답노트 이런거 있어야 함. */}
      <SidebarTabLayout.Tab
        active={activeTab === "dashboard"}
        onClick={handleClickTab("dashboard")}
      >
        대시보드
      </SidebarTabLayout.Tab>
      {/* 가입신청한거랑, 초대받은거 */}
      <SidebarTabLayout.Tab
        active={activeTab === "group-management"}
        onClick={handleClickTab("group-management")}
      >
        그룹 가입 관리
      </SidebarTabLayout.Tab>
      {/* 알림 목록 쫙 뿌려주기 */}
      <SidebarTabLayout.Tab
        active={activeTab === "alarm-management"}
        onClick={handleClickTab("alarm-management")}
      >
        알림
      </SidebarTabLayout.Tab>
      {/* 나의 학습페이지 */}
      <SidebarTabLayout.Tab
        active={activeTab === "study"}
        onClick={handleClickTab("study")}
      >
        나의 학습
      </SidebarTabLayout.Tab>
    </SidebarTabLayout.Sidebar>
  );
};

export type { TabMenu };
