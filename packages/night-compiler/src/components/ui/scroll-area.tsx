import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import type * as React from "react";

import { cn } from "../../lib/utils";

const ScrollAreaRoot = ScrollAreaPrimitive.Root as React.ElementType;
const ScrollAreaViewport = ScrollAreaPrimitive.Viewport as React.ElementType;
const ScrollAreaScrollbar = ScrollAreaPrimitive.ScrollAreaScrollbar as React.ElementType;
const ScrollAreaThumb = ScrollAreaPrimitive.ScrollAreaThumb as React.ElementType;
const ScrollAreaCorner = ScrollAreaPrimitive.Corner as React.ElementType;

type ScrollAreaProps = React.PropsWithChildren<
	React.HTMLAttributes<HTMLDivElement> & {
		type?: "auto" | "always" | "scroll" | "hover";
		dir?: "ltr" | "rtl";
		scrollHideDelay?: number;
	}
>;

type ScrollBarProps = React.HTMLAttributes<HTMLDivElement> & {
	orientation?: "vertical" | "horizontal";
	forceMount?: true;
};

function ScrollArea({ className, children, ...props }: ScrollAreaProps) {
	return (
		<ScrollAreaRoot data-slot="scroll-area" className={cn("relative", className)} {...props}>
			<ScrollAreaViewport
				data-slot="scroll-area-viewport"
				className="size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1"
			>
				{children}
			</ScrollAreaViewport>
			<ScrollBar />
			<ScrollAreaCorner />
		</ScrollAreaRoot>
	);
}

function ScrollBar({
	className,
	orientation = "vertical",
	...props
}: ScrollBarProps) {
	return (
		<ScrollAreaScrollbar
			data-slot="scroll-area-scrollbar"
			orientation={orientation}
			className={cn(
				"flex touch-none p-px transition-colors select-none",
				orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent",
				orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent",
				className,
			)}
			{...props}
		>
			<ScrollAreaThumb data-slot="scroll-area-thumb" className="relative flex-1 rounded-full bg-border" />
		</ScrollAreaScrollbar>
	);
}

export { ScrollArea, ScrollBar };
