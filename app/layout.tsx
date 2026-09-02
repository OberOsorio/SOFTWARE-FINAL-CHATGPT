import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = { title:"Campaña Ganadora AI", description:"Gestión electoral integral con inteligencia estratégica y operación territorial." };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="es"><body>{children}<Toaster richColors position="top-right"/></body></html>; }
