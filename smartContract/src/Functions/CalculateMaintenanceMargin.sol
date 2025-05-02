// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

contract CalculateMaintenanceMargin {
    // calculateMaintenanceMargin function gives the maintenance margin required for the trade
    function calculateMaintenanceMargin(
        int256 numberOfPerp,
        int256 perpPriceForTrader
    ) internal pure returns (int256) {
        int256 totalSizeOfTrade = perpPriceForTrader * numberOfPerp;

        // You must divide by 100 wherever you use maintenanceMarginRate
        int256 maintenanceMarginRate = 2; // we are using 2 percent maintenance margin rate in our perp 

        int256 maintenanceMargin = (totalSizeOfTrade * maintenanceMarginRate) /
            100;

        return maintenanceMargin;
    }
}
