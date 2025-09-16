import * as React from "react";

interface SelectCtx {
  value: string;
  onValueChange: (v: string) => void;
  options: React.ReactNode;
  setOptions: (o: React.ReactNode) => void;
}
const SelectContext = React.createContext<SelectCtx | null>(null);

export function Select({ value, onValueChange, children, ...props }: any) {
  const [options, setOptions] = React.useState<React.ReactNode>(null);
  return (
    <SelectContext.Provider value={{ value, onValueChange, options, setOptions }} {...props}>
      {children}
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ children, ...props }: any) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) return null;
  return (
    <select value={ctx.value} onChange={(e) => ctx.onValueChange(e.target.value)} {...props}>
      {ctx.options}
    </select>
  );
}

export const SelectValue = ({ children, ...props }: any) => <>{children}</>;

export function SelectContent({ children, ...props }: any) {
  const ctx = React.useContext(SelectContext);
  React.useEffect(() => {
    ctx?.setOptions(children);
  }, [children]);
  return null;
}

export function SelectItem({ value, children, ...props }: any) {
  return <option value={value} {...props}>{children}</option>;
}
