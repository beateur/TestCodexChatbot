import * as React from "react";
import { cn } from "@/lib/utils";

export const Card = ({ className, ...props }: any) => (
  <div className={cn("rounded-lg border p-4", className)} {...props} />
);
export const CardHeader = ({ className, ...props }: any) => (
  <div className={cn("mb-2", className)} {...props} />
);
export const CardTitle = ({ className, ...props }: any) => (
  <h3 className={cn("font-semibold", className)} {...props} />
);
export const CardContent = ({ className, ...props }: any) => (
  <div className={cn("", className)} {...props} />
);
