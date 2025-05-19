import { getUserInfo } from "@/services/database";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function GuideLayout({ children }: { children: ReactNode }) {
    const user = await getUserInfo();


    if (!user || user.role != "admin") redirect("/");

    return <>{children}</>;
}