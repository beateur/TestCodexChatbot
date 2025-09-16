import * as React from "react";
import { cn } from "@/lib/utils";

export const Button = React.forwardRef<HTMLButtonElement, any>(({ className, ...props }, ref) => (
  <button ref={ref} className={cn("px-3 py-1 rounded", className)} {...props} />
));
Button.displayName = "Button";
