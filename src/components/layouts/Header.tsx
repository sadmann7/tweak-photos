import { Icons } from "@/components/Icons";
import Link from "next/link";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

// const userLinks = [
//   { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
//   { name: "Sign out", href: "/api/auth/signout", icon: LogOut },
// ];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

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
        "fixed left-0 top-0 z-20 flex w-full items-center gap-4",
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
        <a
          aria-label="navigate to github repo"
          href="https://github.com/sadmann7/npm-picker"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-full bg-blue-600 px-2 py-2 text-base transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-900 active:scale-95 xxs:px-4"
        >
          <Icons.gitHub className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only text-xs text-gray-100 xxs:not-sr-only sm:text-sm">
            Star on Github
          </span>
        </a>
        {/* {session.status === "loading" ||
        session.status === "unauthenticated" ? (
          <Button
            aria-label="sign in"
            className="h-auto w-fit py-1.5"
            onClick={() => void signIn("google")}
            isLoading={session.status === "loading"}
            disabled={session.status === "loading"}
          >
            Sign up
          </Button>
        ) : (
          <Menu as="div" className="relative inline-block text-left">
            <div>
              <Menu.Button
                className={twMerge(
                  "w-full rounded-full transition-opacity hover:opacity-90 active:scale-95 disabled:pointer-events-none disabled:opacity-70",
                  "focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-900"
                )}
                disabled={!session.data}
              >
                {session.data?.user.image ? (
                  <Image
                    src={session.data.user.image}
                    alt="user avatar"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="grid h-10 w-10 place-items-center rounded-full border-2 border-gray-300">
                    <User
                      className="h-5 w-5 text-gray-100"
                      aria-hidden="true"
                    />
                  </div>
                )}
              </Menu.Button>
            </div>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-1 w-44 origin-top-right divide-y divide-gray-100 rounded-md bg-gray-700 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="px-1 py-1">
                  {userLinks.map((link) => (
                    <Menu.Item key={link.name}>
                      <Link
                        href={link.href}
                        className={twMerge(
                          "flex w-full items-center gap-2 rounded px-2 py-2 text-sm",
                          "ui-active:bg-gray-500/70 ui-active:text-gray-100 ui-not-active:text-gray-200"
                        )}
                      >
                        <link.icon className="h-4 w-4" aria-hidden="true" />
                        {link.name}
                      </Link>
                    </Menu.Item>
                  ))}
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        )} */}
      </nav>
    </header>
  );
};

export default Header;
