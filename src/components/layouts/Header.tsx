import { Icons } from "@/components/Icons";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const session = useSession();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 0;
      setIsScrolled(isScrolled);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      aria-label="header"
      className={twMerge(
        "fixed top-0 left-0 z-20 flex w-full items-center gap-4",
        isScrolled
          ? "bg-gradient-to-t from-gray-700/80 to-gray-800/80 backdrop-blur-sm backdrop-filter"
          : "bg-transparent"
      )}
    >
      <nav className="container mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link
          aria-label="navigate to home page"
          href="/"
          className="flex items-center gap-2 text-white transition-colors hover:text-gray-100"
        >
          <Icons.logo className="h-6 w-6" aria-hidden="true" />
          <span className="text-lg font-medium sm:text-xl">TweakPhotos</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            aria-label="sign in"
            href={
              session.status === "authenticated"
                ? "/dashboard"
                : "api/auth/signin"
            }
            className="rounded-md bg-blue-600 px-4 py-1.5 text-base transition-colors hover:bg-blue-700 active:scale-95 sm:text-base"
          >
            Dashboard
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
