"use client";

import Navbar from "@/components/Navbar";
import SideBar from "@/components/sidebar/Sidebar";

interface ChatProps {
  children: React.ReactNode;
}

export default function ChatLayout({ children }: ChatProps) {
  return (
    <section className="flex h-screen w-screen">
      <SideBar />
      <div className="flex flex-col w-full ml-[76px]">
        <Navbar />
        {children}
      </div>
    </section>
  );
}
