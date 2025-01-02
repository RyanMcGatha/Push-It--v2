import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth.config";
import MainNav from "./dashboard/components/MainNav";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="h-screen">
      <div className="grid h-full grid-cols-[80px_1fr] gap-0 bg-background/50">
        <MainNav />
        <main className="h-full py-4">{children}</main>
      </div>
    </div>
  );
}
