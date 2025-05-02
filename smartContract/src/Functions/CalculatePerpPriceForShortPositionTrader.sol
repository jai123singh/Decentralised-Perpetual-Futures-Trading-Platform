// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;
import "../StateVariables.sol";

// Following function takes numberOfPerpSold as input and calculates the price at which these perps would be sold using constant product formula

contract CalculatePerpPriceForShortPositionTrader is StateVariables {
    function calculatePerpPriceForShortPositionTrader(
        int256 numberOfPerpSold
    ) internal view returns (int256) {
        int256 newNumberOfWeiInLiquidityPool = (numberOfPerpInLiquidityPool *
            numberOfWeiInLiquidityPool) /
            (numberOfPerpInLiquidityPool + numberOfPerpSold);

        int256 perpPriceForTheTrader = (numberOfWeiInLiquidityPool -
            newNumberOfWeiInLiquidityPool) / numberOfPerpSold;

        return perpPriceForTheTrader;
    }
}
