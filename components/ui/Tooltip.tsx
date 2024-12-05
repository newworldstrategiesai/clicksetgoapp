// components/ui/Tooltip.tsx
import { ReactNode } from "react";
import { useState } from "react";
import { usePopper } from "react-popper";

interface TooltipProps {
  content: string;
  children: ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "top",
  });

  return (
    <div
      className="relative flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <div ref={setReferenceElement}>{children}</div>
      {visible && (
        <div
          ref={setPopperElement}
          style={styles.popper}
          {...attributes.popper}
          className="bg-black dark:text-white text-xs rounded py-1 px-2 z-10"
        >
          {content}
        </div>
      )}
    </div>
  );
}
