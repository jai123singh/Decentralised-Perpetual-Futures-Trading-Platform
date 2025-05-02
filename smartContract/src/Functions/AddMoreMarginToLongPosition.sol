// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;
import "../StateVariables.sol";
import "./CalculateTriggerPriceForLongPosition.sol";
import "../Utility/MaxHeap.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract AddMoreMarginToLongPosition is
    StateVariables,
    CalculateTriggerPriceForLongPosition
{
    using MaxHeapLib for MaxHeap;

    // Following function is executed when a long position trader wants to add more margin from his deposit to his open long position(which he does by calling addMoreMarginToOpenPosition)
    // This function calls calculateTriggerPriceForLongPosition function
    function addMoreMarginToLongPosition(
        address traderAddress,
        int256 amountToBeAdded
    ) internal {
        // Margin will increase, trigger price will change
        require(
            amountToBeAdded > 0 &&
                amountToBeAdded <=
                traderDepositHashmap[traderAddress] -
                    marginOfLongPositionTraderHashmap[traderAddress],
            string(
                abi.encodePacked(
                    "Amount of extra margin that you want to add to your open long position must be greater than 0 and lesser than or equal to ",
                    Strings.toString(
                        uint256(
                            traderDepositHashmap[traderAddress] -
                                marginOfLongPositionTraderHashmap[traderAddress]
                        )
                    ),
                    ", but you are requesting to add amount: ",
                    Strings.toString(uint256(amountToBeAdded))
                )
            )
        );

        // Below is the logic to update margin
        marginOfLongPositionTraderHashmap[traderAddress] =
            marginOfLongPositionTraderHashmap[traderAddress] +
            amountToBeAdded;

        // Below is the logic to update trigger price
        int256 newTriggerPrice = calculateTriggerPriceForLongPosition(
            traderAddress
        );

        triggerPriceForLongPositionLiquidationHeap.push(
            traderAddress,
            newTriggerPrice
        );
    }
}
