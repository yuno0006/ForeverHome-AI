import { redirect } from "next/navigation";

// This route used to duplicate /shelter/insights with the same demo data
// but no auth guard, and an inaccurate "LIVE DATA" badge. It isn't linked
// from anywhere in the app; redirect any stray links to the real,
// role-guarded shelter insights page instead of maintaining two copies.
export default function InsightsRedirect() {
  redirect("/shelter/insights");
}
