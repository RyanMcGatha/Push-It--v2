import { redirect } from "next/navigation";
import { getAuthCookie } from "@/lib/cookies";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthCookie();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="h-screen">
      <main className="container mx-auto h-full py-4">{children}</main>
    </div>
  );
}
