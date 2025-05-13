import { useParams, usePathname } from "next/navigation";
import { useMemo } from "react";

const useRoutes = () => {
  const pathname = usePathname();
  const params = useParams();

  const routes = useMemo(
    () => [
      {
        label: "Chat",
        href: "/chat",
        active: pathname.match("/chat"),
      },
      {
        label: "Attendance",
        href: "/attendance",
        active: pathname === "/attendance",
      },
      {
        label: "Assignments",
        href: "/assignments",
        active: pathname === "/assignments",
      },
      {
        label: "Test",
        href: "/test",
        active: pathname.match("/test"),
      },
      ...(process.env.NODE_ENV === "development"
        ? [
            {
              label: "Contributions",
              href: "/contributions",
              active: pathname.match("/contributions"),
            },
          ]
        : []),

    ],
    [params.chatId, pathname]
  );
  return routes;
};

export default useRoutes;
