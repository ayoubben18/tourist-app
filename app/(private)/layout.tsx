import { isUserAuthenticated } from "@/services/database";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function GuideLayout({ children }: { children: ReactNode }) {
    const isAuthenticated = await isUserAuthenticated(); 


    if(!isAuthenticated || !isAuthenticated.isAuthenticated ) redirect("/")
    
    return <>{children}</>;
}