import React, { useState, useRef, useEffect } from "react";
import "./Tooltip.css";

export default function Tooltip({ children, text, position = "bottom" }) {
  const [visible, setVisible] = useState(false);
  const [style, setStyle] = useState({});
  const wrapperRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!visible) return;

    const wrapperRect = wrapperRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const gap = 8;

    let top;
    if (position === "top") {
      top = wrapperRect.top - tooltipRect.height - gap;
    } else {
      top = wrapperRect.bottom + gap;
    }

    const left =
      wrapperRect.left + wrapperRect.width / 2 - tooltipRect.width / 2;

    setStyle({
      top: `${top}px`,
      left: `${left}px`,
      position: "fixed",
    });
  }, [visible, position]);

  return (
    <>
      <span
        ref={wrapperRef}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        style={{ cursor: "help" }}
      >
        {children}
      </span>

      {visible && (
        <div ref={tooltipRef} className="custom-tooltip" style={style}>
          {text}
        </div>
      )}
    </>
  );
}
