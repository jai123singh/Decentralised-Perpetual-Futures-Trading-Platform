// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

contract CalculateMarginRequired {
    // calculateMarginRequired function gives the margin required for the trade
    function calculateMarginRequired(
        int256 numberOfPerp,
        int256 leverageUsedByTrader,
        int256 perpPriceForTrader
    ) internal pure returns (int256) {
        int256 totalSizeOfTrade = perpPriceForTrader * numberOfPerp;
        int256 marginRequiredForTrade = totalSizeOfTrade / leverageUsedByTrader;

        return marginRequiredForTrade;
    }
}
