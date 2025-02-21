import { useQuery } from "@tanstack/react-query";
import { getGuides } from "@/services/database/guide";
import { useState } from "react";

type UseGuidesProps = {
  city?: string;
  startTime?: Date;
  duration?: number;
  enabled?: boolean;
};

const useGuides = ({
  enabled = true,
  city,
  startTime,
  duration,
}: UseGuidesProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["guides", searchTerm, city, startTime, duration],
    queryFn: () => getGuides({ searchTerm, city, startTime, duration }),
    enabled,
  });

  return { data, isLoading, searchTerm, setSearchTerm };
};

export { useGuides };
