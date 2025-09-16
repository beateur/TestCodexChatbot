import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, any>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn("border rounded px-2 py-1", className)} {...props} />
));
Textarea.displayName = "Textarea";
