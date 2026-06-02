"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type * as React from "react";

import { cn } from "../../lib/utils";

const TooltipProviderRoot = TooltipPrimitive.Provider as React.ElementType;
const TooltipRoot = TooltipPrimitive.Root as React.ElementType;
const TooltipTriggerRoot = TooltipPrimitive.Trigger as React.ElementType;
const TooltipPortal = TooltipPrimitive.Portal as React.ElementType;
const TooltipContentRoot = TooltipPrimitive.Content as React.ElementType;
const TooltipArrow = TooltipPrimitive.Arrow as React.ElementType;

type TooltipProviderProps = React.PropsWithChildren<{
	delayDuration?: number;
	skipDelayDuration?: number;
	disableHoverableContent?: boolean;
}>;

type TooltipProps = React.PropsWithChildren<{
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	delayDuration?: number;
	disableHoverableContent?: boolean;
}>;

type TooltipTriggerProps = React.PropsWithChildren<
	React.ButtonHTMLAttributes<HTMLButtonElement> & {
		asChild?: boolean;
	}
>;

type TooltipContentProps = React.PropsWithChildren<
	React.HTMLAttributes<HTMLDivElement> & {
		sideOffset?: number;
		side?: "top" | "right" | "bottom" | "left";
		align?: "start" | "center" | "end";
		alignOffset?: number;
		avoidCollisions?: boolean;
		collisionPadding?: number;
	}
>;

function TooltipProvider({ delayDuration = 0, ...props }: TooltipProviderProps) {
	return <TooltipProviderRoot data-slot="tooltip-provider" delayDuration={delayDuration} {...props} />;
}

function Tooltip({ ...props }: TooltipProps) {
	return <TooltipRoot data-slot="tooltip" {...props} />;
}

function TooltipTrigger({ ...props }: TooltipTriggerProps) {
	return <TooltipTriggerRoot data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
	className,
	sideOffset = 0,
	children,
	...props
}: TooltipContentProps) {
	return (
		<TooltipPortal>
			<TooltipContentRoot
				data-slot="tooltip-content"
				sideOffset={sideOffset}
				className={cn(
					"z-50 w-fit origin-(--radix-tooltip-content-transform-origin) animate-in rounded-md bg-foreground px-3 py-1.5 text-xs text-balance text-background fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
					className,
				)}
				{...props}
			>
				{children}
				<TooltipArrow className="z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px] bg-foreground fill-foreground" />
			</TooltipContentRoot>
		</TooltipPortal>
	);
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
