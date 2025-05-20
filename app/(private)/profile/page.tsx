import { GuideProfile } from "@/components/(private)/profile/guide-profile";
import { TouristProfile } from "@/components/(private)/profile/tourist-profile";
import { getUserRole } from "@/services/database";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function profilePge() {
  const role = await getUserRole();

  if (!role) redirect("/");
  if (role == "visitor") return <TouristProfile />;
  if (role == "guide") return <GuideProfile />;
}
