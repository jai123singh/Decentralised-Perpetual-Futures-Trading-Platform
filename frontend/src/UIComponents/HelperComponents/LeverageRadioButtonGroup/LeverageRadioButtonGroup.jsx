import React, { useState } from "react";
import "./LeverageRadioButtonGroup.css";

export default function LeverageRadioButtonGroup({ onLeverageChange }) {
  const [selectedLeverage, setSelectedLeverage] = useState(null);

  const leverageOptions = [
    { value: 1, label: "1x" },
    { value: 2, label: "2x" },
    { value: 5, label: "5x" },
    { value: 10, label: "10x" },
    { value: 20, label: "20x" },
  ];

  function handleLeverageSelect(leverage) {
    setSelectedLeverage(leverage);

    if (onLeverageChange) {
      onLeverageChange(leverage);
    }
  }

  return (
    <div className="leverage-radio-button-container">
      <label className="leverage-radio-button-label">Leverage </label>

      {leverageOptions.map((option) => (
        <div
          key={option.value}
          onClick={() => handleLeverageSelect(option.value)}
          className={`leverage-radio-button-style ${
            selectedLeverage === option.value
              ? "leverage-radio-button-selected-button-color"
              : "leverage-radio-button-normal-button-color"
          }`}
        >
          {option.label}
        </div>
      ))}
    </div>
  );
}
