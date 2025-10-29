import useAuthStore from "@/stores/useAuthStore";
import MyUserProfilePage from "./my-profile";
import OtherUserProfilePage from "./other-profile";

type Props = {
  userId: string;
};

const UserInfoPage = ({ userId }: Props) => {
  const currentUser = useAuthStore((state) => state.user);
  const isOwner = currentUser?.userId === Number(userId);

  return isOwner ? <MyUserProfilePage /> : <OtherUserProfilePage userId={userId} />;
};

export default UserInfoPage;
