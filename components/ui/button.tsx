"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "danger" | "outline";
};

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  const variantClass =
    variant === "danger"
      ? "bg-red-600 hover:bg-red-500"
      : variant === "outline"
        ? "border border-zinc-700 bg-transparent hover:bg-zinc-900"
        : "bg-blue-600 hover:bg-blue-500";
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white transition",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variantClass,
        className,
      )}
      {...props}
    />
  );
}
