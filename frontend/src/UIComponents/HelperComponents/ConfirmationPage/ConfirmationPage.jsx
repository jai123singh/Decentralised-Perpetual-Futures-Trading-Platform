import React, { useState, useEffect } from "react";
import "./ConfirmationPage.css";

export default function ConfirmationPage({ textToBeShown }) {
  const [dotCount, setDotCount] = useState(0);

  // console.log(result);
  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((prevCount) => (prevCount + 1) % 7);
    }, 150);

    return () => clearInterval(interval);
  }, []);

  function renderDots() {
    return ". ".repeat(dotCount);
  }

  return (
    <div className="confirmation-page">
      {textToBeShown} {renderDots()}
    </div>
  );
}
