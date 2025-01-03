import { notFound } from "next/navigation";
import { Profile } from "./Profile";

interface PublicProfilePageProps {
  params: {
    username: string;
  };
}

async function getProfile(username: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/profile/${username}`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      if (res.status === 404) {
        return null;
      }
      throw new Error("Failed to fetch profile");
    }

    return res.json();
  } catch (error) {
    console.error("[PROFILE_FETCH]", error);
    return null;
  }
}

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const username = params.username;
  const profile = await getProfile(username);

  if (!profile) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <div className="container max-w-6xl pt-4 pb-16">
        <Profile profile={profile} />
      </div>
    </main>
  );
}
