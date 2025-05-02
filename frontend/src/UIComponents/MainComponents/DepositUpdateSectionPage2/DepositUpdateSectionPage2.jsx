import React from "react";
import { useState, useEffect } from "react";
import "./DepositUpdateSectionPage2.css";
import Button from "../../HelperComponents/Button/Button";
import NumberInput from "../../HelperComponents/NumberInput/NumberInput";
import ReturnToPreviousPageButton from "../../HelperComponents/ReturnToPreviousPageButton/ReturnToPreviousPageButton";
import {
  useWaitForTransactionReceipt,
  useWriteContract,
  useAccount,
} from "wagmi";
import { contractABI } from "../../../contractABI";
import BigNumber from "bignumber.js";
import { parseEther } from "viem";
import ConfirmationPage from "../../HelperComponents/ConfirmationPage/ConfirmationPage";
import { toast } from "sonner";
import { useTrade } from "../Background/TradeContext";

function extractMainError(error) {
  if (!error) return null;

  // following msg appears incase , the user rejects the transaction via his wallet
  if (error.message?.includes("User rejected the request")) {
    return "Transaction rejected by user.";
  }

  // Fallback
  return "Transaction failed.";
  // Note-> no other custom reverts of smart contract are being tested here, bcoz, in deposit function on smart contract , there are only two require statements. One checks if the user who is sending the transaction and user address in the argument are same. Second thing that it checks is that the amount mentioned in the argument and amount sent are same. These both cases are handled in the frontend only (ie frontend would never send transactions with such error), hence no need to show custom error msgs of smart contract.
}

export default function DepositUpdateSectionPage2({ goToPageOne }) {
  const [valueInNumberInputBox, setValueInNumberInputBox] = useState("");
  const [page, setPage] = useState("deposit");
  const [text, setText] = useState("");
  const [isDisabled, setIsDisabled] = useState(true);
  const { address } = useAccount();
  const { getLatestData } = useTrade();

  const {
    data: hash,
    error: writeError,
    isPending,
    writeContract,
    reset,
  } = useWriteContract();
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: waitError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
  // below , we are doing stuff related to input box
  const placeholder = "Amount of ETH";

  function isValid(value) {
    if (value === "") return true;

    let num = new BigNumber(value);
    if (num.isNaN() || num.isLessThanOrEqualTo(new BigNumber(0))) return false;

    let parts = value.split(".");
    if (parts.length === 2 && parts[1].length > 18) return false;

    return true;
  }

  function findError(value) {
    let error = "";

    let num = new BigNumber(value);
    if (num.isNaN()) {
      error = "Amount must be a valid number.";
    } else if (num.isLessThanOrEqualTo(new BigNumber(0))) {
      error = "Amount must be greater than 0 ETH.";
    } else {
      let parts = value.split(".");
      if (parts.length === 2 && parts[1].length > 18) {
        error = "ETH amount cannot have more than 18 decimal places.";
      }
    }
    return error;
  }

  function onCorrectInput(value) {
    setValueInNumberInputBox(value);
    if (value !== "") {
      setIsDisabled(false);
    } else if (value === "") {
      setIsDisabled(true);
    }
  }

  function onIncorrectInput() {
    setValueInNumberInputBox("");
    setIsDisabled(true);
  }

  // here the handling of number input area is over.

  // below we handle the clicking of Deposit button

  async function handleClick() {
    let value = valueInNumberInputBox;
    let WEI = new BigNumber("1e18");
    let valueInWei = new BigNumber(value).multipliedBy(WEI);
    let valueInWeiAsBigInt = BigInt(valueInWei.toString());

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: contractABI,
      functionName: "deposit",
      args: [address, valueInWeiAsBigInt],
      value: parseEther(value),
    });
  }
  // action of clicking the Deposit button ends here

  // below we are reacting on changes happening to various variables give by useWriteContract and useWaitForTransactionReceipt

  useEffect(() => {
    if (isPending) {
      setPage("confirmationPage");
      setText("Please sign the transaction");
      setValueInNumberInputBox("");
      setIsDisabled(true);
    }
  }, [isPending]);

  useEffect(() => {
    if (isConfirming) {
      setPage("confirmationPage");
      setText("Confirming the transaction");
      setValueInNumberInputBox("");
      setIsDisabled(true);
    }
  }, [isConfirming]);

  useEffect(() => {
    if (isConfirmed) {
      toast.success("Deposit successful!");
      setValueInNumberInputBox("");
      setIsDisabled(true);
      reset();
      goToPageOne();
      getLatestData();
    }
  }, [isConfirmed]);

  useEffect(() => {
    if (writeError) {
      const mainError = extractMainError(writeError);
      if (mainError) {
        toast.error(mainError);
      }
      reset();
      setPage("deposit");
      setValueInNumberInputBox("");
      setIsDisabled(true);
    }
    if (waitError) {
      const mainError = extractMainError(waitError);
      if (mainError) {
        toast.error(mainError);
      }
      reset();
      setPage("deposit");
      setValueInNumberInputBox("");
      setIsDisabled(true);
    }
  }, [writeError, waitError]);

  // console.log(hash, err, isPending, isConfirming, isConfirmed);

  // hash is transaction hash--> it is undefined, until user signs the transaction and sends it to rpc node
  // err is the error that occurs
  // isPending describes - if transaction has been made, has user confirmed the transaction using his wallet. It is true, when u click trade and have not signed using ur wallet. As soon as u sign it, it becomes false
  // isConfirming describes - if the transaction has been sent and we are waiting for it to be included in the blockchain. it will become true, once u sign the transaction using wallet and send it. It becomes false, if blockchain drops or reverts or includes the transaction in the block.
  //  isConfirmed is true when transaction has been included in the blockchain.

  return (
    <div className="deposit-update-section-page2">
      {(() => {
        if (page == "deposit") {
          return (
            <>
              <ReturnToPreviousPageButton
                onClick={goToPageOne}
              ></ReturnToPreviousPageButton>
              <div className="deposit-update-section-page2-number-input-section">
                <NumberInput
                  placeholder={placeholder}
                  isValid={isValid}
                  findError={findError}
                  onCorrectInput={onCorrectInput}
                  onIncorrectInput={onIncorrectInput}
                />
              </div>
              <div className="deposit-update-section-page2-bottom">
                <Button
                  className={`deposit-update-section-page2-button ${
                    isDisabled ? "deposit-eth-disable-style" : ""
                  }`}
                  disabled={isDisabled}
                  onClick={handleClick}
                >
                  Deposit ETH
                </Button>
              </div>
            </>
          );
        } else if (page == "confirmationPage") {
          return <ConfirmationPage textToBeShown={text}></ConfirmationPage>;
        }
      })()}
    </div>
  );
}
