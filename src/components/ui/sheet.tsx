import * as React from "react";

export const Sheet = ({ children, ...props }: any) => <div {...props}>{children}</div>;
export const SheetTrigger = ({ children, ...props }: any) => <div {...props}>{children}</div>;
export const SheetContent = ({ children, ...props }: any) => <div {...props}>{children}</div>;
export const SheetHeader = ({ children, ...props }: any) => <div {...props}>{children}</div>;
export const SheetTitle = ({ children, ...props }: any) => <h2 {...props}>{children}</h2>;
