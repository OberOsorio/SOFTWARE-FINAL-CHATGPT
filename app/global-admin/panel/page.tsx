import { redirect } from "next/navigation";
import GlobalAdmin from "@/components/GlobalAdmin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export default async function GlobalAdminPanelPage() {
  const supabase=await createServerSupabaseClient();
  if(!supabase)redirect("/global-admin");
  const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/global-admin");
  const {data:admin}=await supabase.from("platform_admins").select("role,active").eq("user_id",user.id).single();if(!admin?.active||admin.role!=="owner")redirect("/global-admin");
  return <GlobalAdmin ownerEmail={user.email??"Propietario"}/>;
}
