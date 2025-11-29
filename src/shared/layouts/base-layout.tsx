import GNB from "@/shared/layouts/gnb";

type Props = {
  children: React.ReactNode;
};
const BaseLayout = ({ children }: Props) => {
  return (
    <>
      <GNB />
      <main className="max-w-7xl min-h-dvh p-16 m-auto">{children}</main>
    </>
  );
};

export default BaseLayout;
