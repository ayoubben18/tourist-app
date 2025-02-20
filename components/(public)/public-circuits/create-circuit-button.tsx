"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const CreateCircuitButton = () => {
  const router = useRouter();
  return (
    <Button onClick={() => router.push("/circuits/create")}>
      <Plus className="w-5 h-5" />
      Create Your Own
    </Button>
  );
};

export default CreateCircuitButton;
