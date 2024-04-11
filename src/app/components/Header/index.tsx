"use client";
import classNames from "classnames";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

type Props = {};

function Header({}: Props) {
  const location = usePathname();

  return (
    <div className="flex flex-row justify-center gap-4 items-center w-full border-b border-b-slate-300">
      <Link
        href="/tokens"
        className={classNames("p-3 rounded-lg hover:font-semibold", {
          "font-medium !text-blue-500 hover:!text-blue-700":
            location === "/tokens",
          "text-slate-700 hover:text-slate-950 ": location !== "/tokens",
        })}
      >
        Tokens
      </Link>
      <Link
        href="/stats"
        className={classNames("p-3 rounded-lg hover:font-semibold", {
          "font-medium !text-blue-500 hover:!text-blue-700":
            location === "/stats",
          "text-slate-700 hover:text-slate-950": location !== "/stats",
        })}
      >
        Stats
      </Link>
    </div>
  );
}

export default Header;
