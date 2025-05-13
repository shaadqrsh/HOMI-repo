"use client";
import useRoutes from "@/hooks/useRoutes";
import { cn } from "@/lib/utils";
import { CircleUserRound } from "lucide-react";
import Link from "next/link";
import UserDropDown from "./dropdown/UserDropDown";

const Navbar = () => {
  const routes = useRoutes();

  return (
    <section className="flex p-[1.35rem] w-full items-center dark:bg-liberty-blue bg-Lavender">
      <div className="mr-auto ml-2">
        <a>
          <p className="xs:text-lg lg:text-xl 2xl:text-2xl font-light">HOMI</p>
        </a>
      </div>

      <nav>
        <ul className="flex mx-4 gap-x-14">
          {routes.map((header) => {
            return (
              <li
                key={header.label}
                className={cn(
                  "xs:text-lg lg:text-xl 2xl:text-2xl dark:hover:text-murex transition font-light hover:text-white",
                  header.active && "dark:text-murex font-semibold"
                )}
              >
                <Link href={header.href}>{header.label}</Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="ml-auto mr-2 cursor-pointer">
        <UserDropDown>
          <CircleUserRound size={35} />
        </UserDropDown>
      </div>
    </section>
  );
};

export default Navbar;
