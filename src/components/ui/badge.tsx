import * as React from "react";
import { cn } from "@/lib/utils";

export const Badge = ({ className, ...props }: any) => (
  <span className={cn("inline-flex items-center rounded px-2 py-0.5 text-xs", className)} {...props} />
);
