import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SelectableCardProps {
  selected?: boolean;
  onClick?: () => void;
  title: string;
  description?: string;
  image?: string;
  header?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const SelectableCard = ({
  selected,
  onClick,
  title,
  description,
  image,
  header,
  children,
  className,
}: SelectableCardProps) => {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-colors",
        selected && "border-primary bg-primary/5",
        className
      )}
      onClick={onClick}
    >
      {image && (
        <div className="relative h-48 w-full">
          <img src={image} alt={title} className="object-cover w-full h-full" />
        </div>
      )}
      <CardHeader
        className={cn("p-4", header && "flex flex-row items-center gap-4")}
      >
        {header}
        {!header && (
          <>
            <CardTitle className="text-base">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </>
        )}
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  );
};
