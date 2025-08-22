export const dynamic = "force-dynamic"; // This disables SSG and ISR

import { redirect } from "next/navigation";
import { checkPostTableExists } from "../lib/db-utils";
import { sayHello } from "@repo/test";
import Hello from "../components/Hello";

export default async function Home() {
  // Check if the post table exists
  const tableExists = await checkPostTableExists();

  // If the post table doesn't exist, redirect to setup page
  if (!tableExists) {
    redirect("/setup");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-24 px-8">
      <div className="text-black">{sayHello()}</div>
      < Hello />
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl mb-8">
      </div>
    </div>
  );
}
