import useWindowDimensions from "@/utils/hooks";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { width, height } = useWindowDimensions();
  return (
    <div
      className={`${
        width > height ? "flex-row" : "flex-col"
      } bg-[#282c34] min-h-screen w-full flex text-white`}
    >
      {children}
    </div>
  );
};

export default Layout;
