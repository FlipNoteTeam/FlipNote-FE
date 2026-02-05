import GNB from "@/shared/layouts/gnb";

type Props = {
  children: React.ReactNode;
};
const BaseLayout = ({ children }: Props) => {
  return (
    <>
      <GNB />
      <main className="max-w-7xl min-h-dvh px-4 py-6 sm:px-6 lg:px-16 lg:py-16 m-auto">{children}</main>
    </>
  );
};

export default BaseLayout;
