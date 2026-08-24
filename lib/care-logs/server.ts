import "server-only";

import { redirect } from "next/navigation";
import { getCurrentProfile, requireUser } from "@/lib/auth/guards";

export async function requireCareLogOwner() {
  await requireUser();
  const profile = await getCurrentProfile();
  if (!profile) redirect("/onboarding/nickname");
  return profile;
}
