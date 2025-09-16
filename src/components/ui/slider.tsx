import * as React from "react";

export function Slider({ value, onValueChange, max, step, ...props }: any) {
  return <input type="range" value={value[0]} max={max} step={step} onChange={(e) => onValueChange([parseFloat(e.target.value)])} {...props} />;
}
