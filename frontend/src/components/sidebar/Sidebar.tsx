"use client";
import { cn } from "@/lib/utils";
import useSidebarStore from "@/store/useSidebarStore";
import { motion } from "framer-motion";
import FoldersAndFiles from "./FoldersAndFiles";
import TopIcons from "./TopIcons";

const SideBar = () => {
  const { open } = useSidebarStore();

  return (
    <motion.nav
      layout
      className={cn(
        "fixed h-screen dark:bg-liberty-blue bg-Lavender px-3 pr-4 flex flex-col z-[10]",
        open ? "w-[17rem]" : "w-fit"
      )}
    >
      <TopIcons />

      {open && (
        <motion.div
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center mb-2 ml-3"
        >
          <h2 className="dark:text-white text-black">Chats</h2>
        </motion.div>
      )}

      {open && (
        <motion.div
          layout
          className="ml-3 h-full overflow-auto scrollbar-hide mb-4"
        >
          <FoldersAndFiles />
        </motion.div>
      )}
    </motion.nav>
  );
};

export default SideBar;
