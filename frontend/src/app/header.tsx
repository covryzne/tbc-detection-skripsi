import React from "react";
import Link from "next/link";
import LungLogo from "./components/icons/LungLogo";

type Props = {};

export default function Header({}: Props) {
  const content = {
    logo: {
      icon: (
        <Link href="/">
          <LungLogo className="w-9 h-9" />
        </Link>
      ),
      title: (
        <Link href="/">
          <span className="text-primary ml-2"> TB </span>
          <span className="text-primary"> DETECTION </span>
        </Link>
      ),
    },

    menus: [
      {
        title: "Home",
        link: "/",
        active: true,
      },
      {
        title: "About",
        link: "/about",
      },
      {
        title: "FAQ",
        link: "/faq",
      },
      {
        title: "TB News",
        link: "/tb-news",
      },
    ],
    button: "Login",
  };
  return (
    <header className="flex w-full py-6 border-b">
      <nav className="mx-auto flex w-full max-w-7xl flex-row items-center justify-between">
        {/* Logo */}
        <div className="flex cursor-pointer flex-row items-center space-x-2">
          <span className="text-yellow-600">{content?.logo?.icon}</span>
          <span className="text-2xl font-bold text-sky-800">
            {content?.logo?.title}
          </span>
        </div>
        {/* Menu Items */}
        <ul className="flex flex-row space-x-14">
          {content?.menus &&
            content?.menus.map((item, i) => (
              <Link href={item?.link} key={i}>
                <li
                  className={`${
                    item?.active ? "font-medium text-primary" : "text-primary"
                  } transition hover:text-sky-900`}
                >
                  {item?.title}
                </li>
              </Link>
            ))}
        </ul>

        {/* Buttons */}
        <button className="rounded-md bg-sky-900 px-6 py-3 font-semibold text-white transition hover:bg-sky-900/90 focus:outline-none">
          {content?.button}
        </button>
      </nav>
    </header>
  );
}
