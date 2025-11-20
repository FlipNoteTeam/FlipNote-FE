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
import { IncomingInvitationList } from "@/features/group-invitation-management";
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
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">그룹 초대 관리</h2>
              <p className="text-gray-600">받은 그룹 초대를 확인하고 수락하거나 거절할 수 있습니다.</p>
            </div>
            <IncomingInvitationList />
          </div>
        );
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
