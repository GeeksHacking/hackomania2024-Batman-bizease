import { UserButton, auth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  const { userId } = auth();
  const isAuth = !!userId;

  return (
    <nav className="bg-white absolute z-50 w-screen text-lg p-6 flex items-center justify-between border-b-2 border-purple-100 border">
      <div className="flex items-center gap-6">
        <Image
          src="/logo_govtech_hort.gif"
          width={250}
          height={50}
          alt="Picture of the author"
        />
        <Link href="/">
          <h1 className="text-2xl font-bold">
            Everything You Need
          </h1>
        </Link>
      </div>
      {isAuth ?
        <div className="flex items-center gap-3">
          <h3>Account</h3>
          <UserButton afterSignOutUrl="/" />
        </div>
        :
        <></>
      }
    </nav>
  )
}