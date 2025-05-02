// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "./CheckAndLiquidateLongPositions.sol";
import "./CheckAndLiquidateShortPositions.sol";
import "../Modifiers.sol";

contract CloseOpenPosition is
    CheckAndLiquidateLongPositions,
    CheckAndLiquidateShortPositions,
    Modifiers
{
    // this function is called by the user when he wants to close his open position
    function closeOpenPosition(
        address traderAddress
    ) external executeFundingRateIfNeeded checkUserValidity(traderAddress) {
        require(
            marginOfLongPositionTraderHashmap[traderAddress] != 0 ||
                marginOfShortPositionTraderHashmap[traderAddress] != 0,
            "You have no open position"
        );
        if (marginOfLongPositionTraderHashmap[traderAddress] != 0) {
            closeLongPosition(traderAddress);
        } else {
            closeShortPosition(traderAddress);
        }
    }
}
