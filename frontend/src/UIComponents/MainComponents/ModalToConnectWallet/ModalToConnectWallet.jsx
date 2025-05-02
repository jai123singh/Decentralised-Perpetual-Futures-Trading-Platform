import React from "react";
import "./ModalToConnectWallet.css";
import ConnectWalletOptions from "../../HelperComponents/ConnectWalletOptions/ConnectWalletOptions";
import Button from "../../HelperComponents/Button/Button";

export default function ModalToConnectWallet({
  isOpen,
  changeStateForModalToFalse,
}) {
  if (isOpen === false) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-content-main-heading">Connect your wallet</div>

        <ConnectWalletOptions />
        <Button
          className="close-modal-button"
          onClick={changeStateForModalToFalse}
        >
          X
        </Button>
      </div>
    </div>
  );
}
