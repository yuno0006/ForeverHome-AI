import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-2xl border border-sunny/20 bg-sunny-light p-4">
        <Icon className="size-8 text-sunny" />
      </div>

      <h3 className="mb-1 text-lg font-semibold text-cat-dark">{title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>

      {actionLabel && actionHref && (
        <Button className="mt-6" variant="default" render={<Link href={actionHref} />}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}