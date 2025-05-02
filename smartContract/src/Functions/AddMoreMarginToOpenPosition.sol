// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "./AddMoreMarginToLongPosition.sol";
import "./AddMoreMarginToShortPosition.sol";
import "../Modifiers.sol";

contract AddMoreMarginToOpenPosition is
    AddMoreMarginToLongPosition,
    AddMoreMarginToShortPosition,
    Modifiers
{
    // this function is called by user , when he wants to add more margin from his deposit to his open position
    function addMoreMarginToOpenPosition(
        address traderAddress,
        int256 amountToBeAdded
    ) external executeFundingRateIfNeeded checkUserValidity(traderAddress) {
        require(
            marginOfLongPositionTraderHashmap[traderAddress] != 0 ||
                marginOfShortPositionTraderHashmap[traderAddress] != 0,
            "You do not have any open position"
        );
        if (marginOfLongPositionTraderHashmap[traderAddress] != 0) {
            addMoreMarginToLongPosition(traderAddress, amountToBeAdded);
        } else {
            addMoreMarginToShortPosition(traderAddress, amountToBeAdded);
        }
    }
}
