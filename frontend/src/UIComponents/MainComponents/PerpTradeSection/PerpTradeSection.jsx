import React from "react";
import "./PerpTradeSection.css";
import { useState, useEffect } from "react";
import PerpTradeSectionPage1 from "../PerpTradeSectionPage1/PerpTradeSectionPage1";
import PerpTradeSectionPage2 from "../PerpTradeSectionPage2/PerpTradeSectionPage2";
import PerpTradeSectionPage3 from "../PerpTradeSectionPage3/PerpTradeSectionPage3";
import PerpTradeSectionPage4 from "../PerpTradeSectionPage4/PerpTradeSectionPage4";
import { useTrade } from "../Background/TradeContext";

export default function PerpTradeSection() {
  const [pageNumber, setPageNumber] = useState(5);
  let { position } = useTrade();
  useEffect(() => {
    if (position === 1n || position === -1n) {
      setPageNumber(2);
    } else if (position === 0n) {
      setPageNumber(1);
    }
  }, [position]);

  function goToPageOne() {
    setPageNumber(1);
  }
  function goToPageTwo() {
    setPageNumber(2);
  }
  function goToPageThree() {
    setPageNumber(3);
  }
  function goToPageFour() {
    setPageNumber(4);
  }

  return (
    <div className="perp-trade-section">
      {(() => {
        if (pageNumber === 1) {
          return <PerpTradeSectionPage1 goToPageTwo={goToPageTwo} />;
        } else if (pageNumber === 2) {
          return (
            <PerpTradeSectionPage2
              goToPageThree={goToPageThree}
              goToPageFour={goToPageFour}
            />
          );
        } else if (pageNumber === 3) {
          return (
            <PerpTradeSectionPage3
              goToPageTwo={goToPageTwo}
              goToPageOne={goToPageOne}
            />
          );
        } else if (pageNumber === 4) {
          return <PerpTradeSectionPage4 goToPageTwo={goToPageTwo} />;
        }
      })()}
    </div>
  );
}
