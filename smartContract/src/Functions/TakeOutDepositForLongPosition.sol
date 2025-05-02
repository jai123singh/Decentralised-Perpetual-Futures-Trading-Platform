// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;
import "../StateVariables.sol";
import "./CalculateTriggerPriceForLongPosition.sol";
import "../Utility/MaxHeap.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract TakeOutDepositForLongPosition is
    StateVariables,
    CalculateTriggerPriceForLongPosition
{
    using MaxHeapLib for MaxHeap;
    // takeOutDepositForLongPosition() function lets traders in long positions withdraw their deposits by calling takeOutDeposit function

    // this function calls calculateTriggerPriceForLongPosition function

    function takeOutDepositForLongPosition(
        address traderAddress,
        int256 amountToBeWithdrawn
    ) internal {
        // Following are the checks to validate the amountToBeWithdrawn
        require(
            amountToBeWithdrawn > 0,
            "Amount to be withdrawn must be greater than 0."
        );

        int256 maximumDepositThatCanBeWithdrawn = traderDepositHashmap[
            traderAddress
        ] - maintenanceMarginOfLongPositionTraderHashmap[traderAddress];

        if (
            currentPriceOfPerp < priceAtWhichPerpWasBoughtHashmap[traderAddress]
        ) {
            maximumDepositThatCanBeWithdrawn =
                maximumDepositThatCanBeWithdrawn -
                ((priceAtWhichPerpWasBoughtHashmap[traderAddress] -
                    currentPriceOfPerp) *
                    perpCountOfTraderWithLongPositionHashmap[traderAddress]);
        }

        require(
            amountToBeWithdrawn <= maximumDepositThatCanBeWithdrawn,
            string(
                abi.encodePacked(
                    "Currently, the maximum amount that can be withdrawn is ",
                    Strings.toString(uint256(maximumDepositThatCanBeWithdrawn)),
                    ", but you are requesting to withdraw: ",
                    Strings.toString(uint256(amountToBeWithdrawn))
                )
            )
        );
        // If amount to be withdrawn is greater than (deposit - margin), update margin and trigger price
        if (
            amountToBeWithdrawn >
            traderDepositHashmap[traderAddress] -
                marginOfLongPositionTraderHashmap[traderAddress]
        ) {
            marginOfLongPositionTraderHashmap[traderAddress] =
                traderDepositHashmap[traderAddress] -
                amountToBeWithdrawn;

            int256 newTriggerPrice = calculateTriggerPriceForLongPosition(
                traderAddress
            );

            triggerPriceForLongPositionLiquidationHeap.push(
                traderAddress,
                newTriggerPrice
            );
        }

        // Transfer the deposit and update numberOfWeiInWeiPool and traderDepositHashmap
        (bool success, ) = payable(traderAddress).call{
            value: uint256(amountToBeWithdrawn)
        }("");
        require(success, "Something went wrong while transferring the amount.");

        numberOfWeiInWeiPool = numberOfWeiInWeiPool - amountToBeWithdrawn;
        traderDepositHashmap[traderAddress] =
            traderDepositHashmap[traderAddress] -
            amountToBeWithdrawn;
    }
}
