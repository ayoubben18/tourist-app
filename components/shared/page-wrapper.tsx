import { cn } from "@/lib/utils";
import React from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
};

const PageWrapper = ({ children, className }: Props) => {
  return (
    <div className={cn("mx-auto flex flex-col", className)}>{children}</div>
  );
};

export default PageWrapper;
