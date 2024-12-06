import React, { PropsWithChildren } from "react";
import { Label } from "../ui/label";

export function BaseFilter({
  label,
  children,
}: PropsWithChildren<{ label?: React.ReactNode }>) {
  return (
    <div className="flex flex-col gap-2">
      {label && <Label>{label}</Label>}
      {children}
    </div>
  );
}
