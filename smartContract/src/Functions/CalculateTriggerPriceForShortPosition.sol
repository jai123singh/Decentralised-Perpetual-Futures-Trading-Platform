// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;
import "../StateVariables.sol";

contract CalculateTriggerPriceForShortPosition is StateVariables {
    function calculateTriggerPriceForShortPosition(
        address addressOfTrader
    ) internal view returns (int256) {
        int256 triggerPrice = ((priceAtWhichPerpWasSoldHashmap[
            addressOfTrader
        ] * perpCountOfTraderWithShortPositionHashmap[addressOfTrader]) +
            (marginOfShortPositionTraderHashmap[addressOfTrader] -
                maintenanceMarginOfShortPositionTraderHashmap[
                    addressOfTrader
                ])) /
            perpCountOfTraderWithShortPositionHashmap[addressOfTrader];

        return triggerPrice;
    }
}
