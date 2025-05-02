import React from "react";
import "./DepositUpdateSectionPage1.css";
import Button from "../../HelperComponents/Button/Button";
import { useTrade } from "../Background/TradeContext";
import BigNumber from "bignumber.js";
import Tooltip from "../../HelperComponents/Tooltip/Tooltip";
import { FiInfo } from "react-icons/fi";

export default function DepositUpdateSectionPage1({
  goToPageTwo,
  goToPageThree,
}) {
  let { deposit, maxWithdrawableDeposit } = useTrade();
  let WEI = new BigNumber("1e18");
  let depositInEthAsString = new BigNumber(deposit.toString())
    .dividedBy(WEI)
    .toString();
  let maxWithdrawableDepositInEthAsString = new BigNumber(
    maxWithdrawableDeposit.toString()
  )
    .dividedBy(WEI)
    .toString();

  return (
    <>
      <div className="deposit-update-section-page1-para">
        <div className="deposit-update-section-page1-para-left-section">
          Total Depsoit
        </div>
        <div className="deposit-update-section-page1-para-right-section">
          {depositInEthAsString} ETH
        </div>
      </div>
      <div className="deposit-update-section-page1-para">
        <div className="deposit-update-section-page1-para-left-section">
          Withdrawable Deposit
          <Tooltip
            text={`Withdrawable Deposit: The amount of your deposit that can be withdrawn at any given time.\n• If no position is open, the withdrawable deposit is equal to your total deposit.\n• If you have an open position, the withdrawable deposit is calculated as: Withdrawable Deposit = Total Deposit - Maintenance Margin - Unrealized Loss (if any).\n• This ensures that there is enough margin to cover the maintenance margin and any potential losses from your open position.`}
          >
            <FiInfo size={14} style={{ marginLeft: "6px" }} />
          </Tooltip>
        </div>
        <div className="deposit-update-section-page1-para-right-section">
          {maxWithdrawableDepositInEthAsString} ETH
        </div>
      </div>

      <div className="deposit-update-section-page1-bottom">
        <Button
          className="deposit-update-section-page1-button"
          onClick={goToPageTwo}
        >
          Deposit ETH
        </Button>
        <Button
          className="deposit-update-section-page1-button"
          onClick={goToPageThree}
        >
          Withdraw ETH
        </Button>
      </div>
    </>
  );
}
