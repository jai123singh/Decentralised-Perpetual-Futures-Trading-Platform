// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

library Events {
    event PerpPriceUpdated(int256 newPrice, int256 timestamp);
    event PositionLiquidated(
        address traderAddress,
        int256 timestamp,
        int256 platformFee
    );
    event FundingRateSettlement(int256 fundingRate, int256 timestamp);
}
