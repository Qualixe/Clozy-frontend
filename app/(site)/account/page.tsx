import { redirect } from "next/navigation";

// The account "hub" concept is replaced by the persistent Profile/Orders/
// Settings tabs (see components/account-tabs.tsx) — Profile is the natural
// default landing spot for the account section root.
export default function Page() {
  redirect("/profile");
}
