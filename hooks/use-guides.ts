import { useQuery } from "@tanstack/react-query";
import { getGuides } from "@/services/database/guide";
import { useState } from "react";

type UseGuidesProps = {
  enabled?: boolean;
};

const useGuides = ({ enabled = true }: UseGuidesProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["guides", searchTerm],
    queryFn: () => getGuides({ searchTerm }),
    enabled,
  });

  return { data, isLoading, searchTerm, setSearchTerm };
};

export { useGuides };
