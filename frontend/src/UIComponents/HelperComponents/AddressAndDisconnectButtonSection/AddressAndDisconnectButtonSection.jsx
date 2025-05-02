import React, { useState, useRef, useEffect } from "react";
import "./AddressAndDisconnectButtonSection.css";
import Button from "../Button/Button";

export default function AddressAndDisconnectButtonSection({
  account,
  disconnectWallet,
}) {
  const [showPopover, setShowPopover] = useState(false);
  const popoverRef = useRef();

  const togglePopover = () => {
    setShowPopover((prev) => !prev);
  };

  const shortenAddress = (addr) => {
    return addr.slice(0, 6) + "..." + addr.slice(-4);
  };

  // Hide popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setShowPopover(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!account) return null;

  return (
    <div className="wallet-connector" ref={popoverRef}>
      <button className="wallet-address-btn" onClick={togglePopover}>
        {shortenAddress(account)} <span className="arrow">⯆</span>
      </button>

      {showPopover && (
        <div className="wallet-popover">
          <div className="popover-address">
            {account}
            <button
              className="copy-btn"
              onClick={() => navigator.clipboard.writeText(account)}
            >
              📋
            </button>
          </div>
          <Button className="disconnect-btn" onClick={disconnectWallet}>
            Disconnect Wallet
          </Button>
        </div>
      )}
    </div>
  );
}
