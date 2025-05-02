// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;
import "../StateVariables.sol";
import "./CalculateTriggerPriceForShortPosition.sol";
import "../Utility/MinHeap.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract AddMoreMarginToShortPosition is
    StateVariables,
    CalculateTriggerPriceForShortPosition
{
    // Following function is executed when a short position trader wants to add more margin from his deposit to his position (which he does by calling addMoreMarginToOpenPosition)
    // This function calls calculateTriggerPriceForShortPosition function
    using MinHeapLib for MinHeap;

    function addMoreMarginToShortPosition(
        address traderAddress,
        int256 amountToBeAdded
    ) internal {
        // Margin will increase, trigger price will change
        require(
            amountToBeAdded > 0 &&
                amountToBeAdded <=
                traderDepositHashmap[traderAddress] -
                    marginOfShortPositionTraderHashmap[traderAddress],
            string(
                abi.encodePacked(
                    "Amount of extra margin that you want to add to your open short position must be greater than 0 and lesser than or equal to ",
                    Strings.toString(
                        uint256(
                            traderDepositHashmap[traderAddress] -
                                marginOfShortPositionTraderHashmap[
                                    traderAddress
                                ]
                        )
                    ),
                    ", but you are requesting to add amount: ",
                    Strings.toString(uint256(amountToBeAdded))
                )
            )
        );
        // Below is the logic to update margin
        marginOfShortPositionTraderHashmap[traderAddress] =
            marginOfShortPositionTraderHashmap[traderAddress] +
            amountToBeAdded;

        // Below is the logic to update trigger price
        int256 newTriggerPrice = calculateTriggerPriceForShortPosition(
            traderAddress
        );

        triggerPriceForShortPositionLiquidationHeap.push(
            traderAddress,
            newTriggerPrice
        );
    }
}
