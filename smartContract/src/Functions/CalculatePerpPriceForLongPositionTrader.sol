// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;
import "../StateVariables.sol";

// Following function takes numberOfPerpBought as input and calculates the price at which these perps would be bought using constant product formula

// Following function must be an internal function, i.e., external users cannot call it, only the functions of this project can call it
contract CalculatePerpPriceForLongPositionTrader is StateVariables {
    function calculatePerpPriceForLongPositionTrader(
        int256 numberOfPerpBought
    ) internal view returns (int256) {
        int256 newNumberOfWeiInLiquidityPool = (numberOfPerpInLiquidityPool *
            numberOfWeiInLiquidityPool) /
            (numberOfPerpInLiquidityPool - numberOfPerpBought);

        int256 perpPriceForTheTrader = (newNumberOfWeiInLiquidityPool -
            numberOfWeiInLiquidityPool) / numberOfPerpBought;

        return perpPriceForTheTrader;
    }
}
