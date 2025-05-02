import React from "react";
import { useState } from "react";
import "./TraderInteractionArea.css";
import ConnectWalletButton from "../ConnectWalletButton/ConnectWalletButton";
import ModalToConnectWallet from "../ModalToConnectWallet/ModalToConnectWallet";
import DepositUpdateSection from "../DepositUpdateSection/DepositUpdateSection";
import PerpTradeSection from "../PerpTradeSection/PerpTradeSection";
import AddressAndDisconnectButtonSection from "../../HelperComponents/AddressAndDisconnectButtonSection/AddressAndDisconnectButtonSection";
import { useAccount, useDisconnect } from "wagmi";

export default function TraderInteractionArea() {
  const { isConnected, address } = useAccount();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { disconnect } = useDisconnect();

  function changeStateForModalToTrue() {
    setIsModalOpen(true);
  }

  function changeStateForModalToFalse() {
    setIsModalOpen(false);
  }

  function onclickingDisconnectButton() {
    disconnect();
    changeStateForModalToFalse();
  }

  return (
    <div className="trading-interface">
      {(() => {
        if (!isConnected) {
          return (
            <>
              <ConnectWalletButton onClick={changeStateForModalToTrue} />

              <ModalToConnectWallet
                isOpen={isModalOpen}
                changeStateForModalToFalse={changeStateForModalToFalse}
              />
            </>
          );
        } else {
          return (
            <>
              <AddressAndDisconnectButtonSection
                account={address}
                disconnectWallet={onclickingDisconnectButton}
              />

              <DepositUpdateSection />

              <PerpTradeSection />
            </>
          );
        }
      })()}
    </div>
  );
}
