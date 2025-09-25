import GNB from "@/shared/layouts/gnb";

type Props = {
  children: React.ReactNode;
};
const BaseLayout = ({ children }: Props) => {
  return (
    <>
      <GNB />
      <div className="min-h-dvh bg-gradient-to-br from-indigo-50 to-white p-16">
        <main className="max-w-7xl m-auto">{children}</main>
      </div>
    </>
  );
};

export default BaseLayout;
