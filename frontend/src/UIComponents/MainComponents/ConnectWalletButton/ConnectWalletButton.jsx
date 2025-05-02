import React from "react";
import "./ConnectWalletButton.css";
import Button from "../../HelperComponents/Button/Button";

export default function ConnectWalletButton({ onClick }) {
  return (
    <Button onClick={onClick} className="connect-wallet-button">
      Connect Wallet
    </Button>
  );
}
