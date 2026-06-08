import { redirect } from "next/navigation";

import { getRoleHomePath } from "@/lib/auth/paths";
import { requireUser } from "@/server/guards/auth";

export default async function AppIndexPage() {
  const user = await requireUser();
  redirect(getRoleHomePath(user.role));
}
