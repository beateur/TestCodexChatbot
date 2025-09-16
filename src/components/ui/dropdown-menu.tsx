import * as React from "react";

export const DropdownMenu = ({ children, ...props }: any) => <div {...props}>{children}</div>;
export const DropdownMenuTrigger = ({ children, ...props }: any) => <div {...props}>{children}</div>;
export const DropdownMenuContent = ({ children, ...props }: any) => <div {...props}>{children}</div>;
export const DropdownMenuItem = ({ children, onClick, ...props }: any) => (
  <div onClick={onClick} {...props}>{children}</div>
);
export const DropdownMenuLabel = ({ children, ...props }: any) => <div {...props}>{children}</div>;
export const DropdownMenuSeparator = (props: any) => <hr {...props} />;
