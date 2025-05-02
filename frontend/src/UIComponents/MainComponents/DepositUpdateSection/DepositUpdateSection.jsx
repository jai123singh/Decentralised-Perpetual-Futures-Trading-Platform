import React, { useEffect } from "react";
import { useState } from "react";
import "./DepositUpdateSection.css";
import DepositUpdateSectionPage1 from "../DepositUpdateSectionPage1/DepositUpdateSectionPage1";
import DepositUpdateSectionPage2 from "../DepositUpdateSectionPage2/DepositUpdateSectionPage2";
import DepositUpdateSectionPage3 from "../DepositUpdateSectionPage3/DepositUpdateSectionPage3";
import ConfirmationPage from "../../HelperComponents/ConfirmationPage/ConfirmationPage";
import { useTrade } from "../Background/TradeContext";
import BigNumber from "bignumber.js";

export default function DepositUpdateSection() {
  const [pageNumber, setPageNumber] = useState(4);
  let { deposit } = useTrade();

  useEffect(() => {
    if (deposit !== undefined && pageNumber === 4) {
      setPageNumber(1);
    }
  }, [deposit]);

  function goToPageOne() {
    setPageNumber(1);
  }

  function goToPageTwo() {
    setPageNumber(2);
  }

  function goToPageThree() {
    setPageNumber(3);
  }

  return (
    <div className="deposit-section">
      {(() => {
        if (pageNumber === 1) {
          return (
            <DepositUpdateSectionPage1
              goToPageTwo={goToPageTwo}
              goToPageThree={goToPageThree}
            />
          );
        } else if (pageNumber === 2) {
          return <DepositUpdateSectionPage2 goToPageOne={goToPageOne} />;
        } else if (pageNumber === 3) {
          return <DepositUpdateSectionPage3 goToPageOne={goToPageOne} />;
        }
      })()}
    </div>
  );
}
