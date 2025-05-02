// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;
import "../StateVariables.sol";

contract CalculateTriggerPriceForLongPosition is StateVariables {
    // calculateTriggerPriceForLongPosition function gives the perp price for the long position trader, below which his position his position would be automatically liquidated bcoz of low margins ie margin< maintenance margin
    function calculateTriggerPriceForLongPosition(
        address addressOfTrader
    ) internal view returns (int256) {
        int256 triggerPrice = ((priceAtWhichPerpWasBoughtHashmap[
            addressOfTrader
        ] * perpCountOfTraderWithLongPositionHashmap[addressOfTrader]) -
            (marginOfLongPositionTraderHashmap[addressOfTrader] -
                maintenanceMarginOfLongPositionTraderHashmap[
                    addressOfTrader
                ])) / perpCountOfTraderWithLongPositionHashmap[addressOfTrader];

        return triggerPrice;
    }
}
