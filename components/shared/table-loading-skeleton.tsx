import React from "react"

import { Skeleton } from "../ui/skeleton"
import { TableBody, TableCell, TableRow } from "../ui/table"

type Props = {
  size: number
  columns?: number
}

function TableLoadingSkeleton({ size, columns = 4 }: Props) {
  return (
    <TableBody>
      {Array.from({ length: size }).map((_, index) => (
        <TableRow key={index}>
          {Array.from({ length: columns }).map((_, cellIndex) => (
            <TableCell key={cellIndex}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  )
}

export default TableLoadingSkeleton
