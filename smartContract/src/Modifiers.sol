// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "./StateVariables.sol";
import "./Functions/FundingRateMechanism.sol";

contract Modifiers is StateVariables, FundingRateMechanism {
    // executeFundingRateIfNeeded modifier is applied on functions that are directly called by users ie takeOutDeposit, sell, deposit, closeOpenPosition, Buy, addMoreMarginToOpenPosition. This modifier checks if funding rate mechanism should be executed or not, and if it is to be executed, then it is executed
    modifier executeFundingRateIfNeeded() {
        _;
        if (int256(block.timestamp) >= nextFundingTime) {
            fundingRateMechanism();
        }
    }

    // onlyBackend modifier is applied on executeFundingRateMechanism function to make sure that only my Backend can call this function
    modifier onlyBackend() {
        require(
            msg.sender == backend,
            "You are not authorized to make this function call."
        );
        _;
    }

    modifier onlyBeneficiary() {
        require(
            msg.sender == beneficiary,
            "You are not authorized to make this function call."
        );
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action.");
        _;
    }

    // doBasicChecks modifier does the basic checks of buy and sell function
    modifier doBasicChecks(
        address addressOfTrader,
        int256 leverageUsedByTrader,
        int256 slippageToleranceOfTrader
    ) {
        // -leverage used by trader can only be 1x , 2x , 5x , 10x , 20x
        require(
            leverageUsedByTrader == 1 ||
                leverageUsedByTrader == 2 ||
                leverageUsedByTrader == 5 ||
                leverageUsedByTrader == 10 ||
                leverageUsedByTrader == 20,
            "Leverage must be 1x,2x,5x,10x or 20x only."
        );

        //- For slippage, we are going to give , in the frontend, user the option to choose any percent from 0.01 to 100.00.............Hence, in the backend , we have to manage it like that. So, from frontend we will get slippage *100 number..........so at backend , we should have a number between 1 to 10000. Hence wherever calculations regarding slippage tolerance are present , we have to divide that calcuatioj by 100 at last.
        require(
            slippageToleranceOfTrader >= 0 &&
                slippageToleranceOfTrader <= 10000,
            "Slippage tolerance percentage must be between 0 percent and 100 percent"
        );

        //below , we check if trader already has an open position or not

        require(
            marginOfLongPositionTraderHashmap[addressOfTrader] == 0 &&
                marginOfShortPositionTraderHashmap[addressOfTrader] == 0,
            " You can open a new position only if you do not already have an open position."
        );
        _;
    }

    // checkUserValidity modifier is used to check if the person who is trading is same as who is doing the transaction. It if used as a modifier for -takeOutDeposit, sell, deposit, closeOpenPosition, Buy, addMoreMarginToOpenPosition.
    modifier checkUserValidity(address addressOfTrader) {
        require(
            msg.sender == addressOfTrader,
            "You cannot trade or check information on behalf of someone else"
        );
        _;
    }
}
