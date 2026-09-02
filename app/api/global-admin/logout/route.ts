import { cookies } from "next/headers";
export async function POST(){const cookieStore=await cookies();cookieStore.set("cg_owner_demo","",{httpOnly:true,sameSite:"strict",secure:process.env.NODE_ENV==="production",path:"/global-admin",maxAge:0});return Response.json({ok:true})}
