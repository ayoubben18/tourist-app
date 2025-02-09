import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";

import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

type Props = {
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  totalCount: number;
};

const Pagination = ({ page, setPage, pageSize, totalCount }: Props) => {
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / pageSize)),
    [totalCount, pageSize]
  );

  const currentPage = useMemo(
    () => Math.min(Math.max(1, page), totalPages),
    [page, totalPages]
  );

  const getPreviousPage = () => {
    if (currentPage === 1) return;
    setPage(currentPage - 1);
  };

  const getNextPage = () => {
    if (currentPage >= totalPages) return;
    setPage(currentPage + 1);
  };

  const displayPages = useMemo(() => {
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1);

    if (currentPage <= 3) return [1, 2, 3, 4, 5];
    if (currentPage >= totalPages - 2)
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];

    return [
      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2,
    ];
  }, [currentPage, totalPages]);

  if (totalCount === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={getPreviousPage}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="h-4 w-4" /> Previous
      </Button>

      {displayPages[0] > 1 && (
        <>
          <Button size="icon" variant="outline" onClick={() => setPage(1)}>
            1
          </Button>
          <Button size="icon" variant="outline" disabled>
            ...
          </Button>
        </>
      )}

      {displayPages.map((item) => (
        <Button
          size="icon"
          variant="outline"
          key={item}
          onClick={() => setPage(item)}
          className={cn({ "bg-gray-200": item === currentPage })}
        >
          {item}
        </Button>
      ))}

      {displayPages[displayPages.length - 1] < totalPages && (
        <>
          <Button size="icon" variant="outline" disabled>
            ...
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => setPage(totalPages)}
          >
            {totalPages}
          </Button>
        </>
      )}

      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={getNextPage}
        disabled={currentPage >= totalPages}
      >
        Next <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default Pagination;
