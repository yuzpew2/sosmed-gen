import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="bg-gray-800 text-white">
      <div className="max-w-4xl mx-auto flex justify-between items-center p-4">
        <div className="flex space-x-4">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <Link href="/prompts" className="hover:underline">
            Prompts
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          {user && <span className="text-sm">Hello, {user.email}</span>}
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="text-sm bg-gray-600 hover:bg-gray-700 py-1 px-3 rounded"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
