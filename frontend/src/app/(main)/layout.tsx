import Navbar from "@/components/Navbar";

interface MainProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainProps) {
  return (
    <div className="flex flex-col w-full h-screen">
      <Navbar />
      {children}
    </div>
  );
}
