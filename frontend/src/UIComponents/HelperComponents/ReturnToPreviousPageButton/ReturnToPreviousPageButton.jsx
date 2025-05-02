import React from "react";
import "./ReturnToPreviousPageButton.css";
import Button from "../Button/Button";
import { FaArrowLeft } from "react-icons/fa";

export default function ReturnToPreviousPageButton({ onClick }) {
  return (
    <div className="back-button" onClick={onClick}>
      <FaArrowLeft size={14} />
    </div>
  );
}
