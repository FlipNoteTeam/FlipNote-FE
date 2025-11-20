import useAuthStore from "@/stores/useAuthStore";
import MyUserProfilePage from "./my-profile";
import OtherUserProfilePage from "./other-profile";
import Dashboard from "@/pages/dashboard";
import BaseLayout from "@/shared/layouts/base-layout";
import { SidebarTabLayout } from "@/shared/layouts/sidebar-tab-layout";
import {
  MyPageSidebar,
  type TabMenu,
} from "@/features/mypage/components/MyPageSidebar";
import { useState } from "react";

type Props = {
  userId: string;
};

const UserInfoPage = ({ userId }: Props) => {
  const [activeTab, setActiveTab] = useState<TabMenu>("profile");
  const currentUser = useAuthStore((state) => state.user);
  const isOwner = currentUser?.userId === Number(userId);

  const renderContent = () => {
    if (!isOwner) {
      return <OtherUserProfilePage userId={userId} />;
    }

    switch (activeTab) {
      case "profile":
        return <MyUserProfilePage />;
      case "dashboard":
        return <Dashboard />;
      case "group-management":
        return <div className="p-6">그룹 가입 관리 (준비 중)</div>;
      case "alarm-management":
        return <div className="p-6">알림 (준비 중)</div>;
      case "study":
        return <div className="p-6">나의 학습 (준비 중)</div>;
      default:
        return <MyUserProfilePage />;
    }
  };

  return (
    <BaseLayout>
      <SidebarTabLayout>
        <MyPageSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <SidebarTabLayout.Content>
          {renderContent()}
        </SidebarTabLayout.Content>
      </SidebarTabLayout>
    </BaseLayout>
  );
};

export default UserInfoPage;
