import Link from "next/link";
import React from "react";

type Props = {};

function Header({}: Props) {
  return (
    <div className="flex flex-row justify-center gap-4 items-center">
      <Link href="/tokens">Tokens</Link>
      <Link href="/stats">Stats</Link>
    </div>
  );
}

export default Header;
