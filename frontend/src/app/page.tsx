"use client";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const Home = () => {
  const refresh = Cookies.get("next-secure-id-homi");
  const access = Cookies.get("next-session-id-homi");
  const userId = Cookies.get("userIdHomi");
  const router = useRouter();

  if (refresh && access && userId) {
    router.push("/chat");
  }

  return (
    <div className="bg-[url('/chat.png')] bg-cover bg-center h-screen relative flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <div className="dark:bg-white p-10 px-14 rounded-3xl flex flex-col justify-center items-center gap-y-4">
          <h1 className="text-2xl dark:text-liberty-blue font-bold mt-4 text-center">
            Welcome!
          </h1>
          <p className="text-md dark:text-liberty-blue text-center font-medium">
            Login or sign up to start using HOMI <br />
          </p>
          <a
            href="log-in"
            className={`mt-2 dark:text-liberty-blue dark:bg-murex p-3 rounded-[30px] 
              w-full font-semibold text-center text-lg border-2 border-black boxShadow`}
          >
            Log in
          </a>
          <a
            href="sign-up"
            className={`dark:text-liberty-blue dark:bg-transparent p-3 rounded-[30px] mt-1
              w-full font-semibold text-center text-lg border-2 border-black boxShadow`}
          >
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
};

export default Home;
