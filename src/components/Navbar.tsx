import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Button from "./ui/Button";

export default async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="navbar bg-primary text-primary-content">
      <div className="max-w-4xl mx-auto flex justify-between items-center w-full px-4">
        <div className="flex gap-2">
          <Link href="/" className="btn btn-ghost">
            Home
          </Link>
          <Link href="/prompts" className="btn btn-ghost">
            Prompts
          </Link>
          {user && (
            <Link href="/posts" className="btn btn-ghost">
              Posts
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2">
          {user && <span className="text-sm">Hello, {user.email}</span>}
          <form action="/auth/signout" method="post">
            <Button type="submit" variant="secondary" className="text-sm">
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </nav>
  );
}
