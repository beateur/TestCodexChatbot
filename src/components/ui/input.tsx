import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, any>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn("border rounded px-2 py-1", className)} {...props} />
));
Input.displayName = "Input";
