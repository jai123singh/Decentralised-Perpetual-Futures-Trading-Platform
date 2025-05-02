// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "../Utility/MaxHeap.sol";
import "../Utility/MinHeap.sol";
import "../Modifiers.sol";
import "./PlatformFeeCalculationFunctions.sol";
import "./SNXPriceInWei.sol";

contract GetterFunctions is
    PlatformFeeCalculationFunctions,
    SNXPriceInWei,
    Modifiers
{
    using MaxHeapLib for MaxHeap;
    using MinHeapLib for MinHeap;

    // following function gives totalPlatformFeeCollected. It can only be called by beneficiary.
    function getTotalPlatformFeeCollected()
        external
        view
        onlyBeneficiary
        returns (int256)
    {
        return totalPlatformFeeCollected;
    }

    // following function can only be owner. It gives the total wei in wei pool. It useful incase of extreme situtations. If uder extreme situtals wei in wei pool number becomes lesser than 0, so in order for the contract to function properly , owner would send some wei to the contract.
    function getAmountOfWeiInWeiPool()
        external
        view
        onlyOwner
        returns (int256)
    {
        return numberOfWeiInWeiPool;
    }

    // following function gives the price of underlying asset using oracle
    function getOraclePrice() external view returns (int256) {
        int256 oraclePriceOfSNXInWei = getSNXPriceInWei();
        return oraclePriceOfSNXInWei;
    }

    // Following function gives the maximum number of perps that can be sold or bought
    function getMaxNumberOfTradablePerp() external view returns (int256) {
        return (numberOfPerpInLiquidityPool - 1);
    }

    // following function is used to know the position of trader
    // if this function returns 1--> trader is in long position
    // if this function returns -1--> trader is in short position
    // if this function returns 0 -->trader has no open position
    function getPositionOfTrader(
        address traderAddress
    ) external view returns (int256) {
        int256 result = 0;
        if (marginOfLongPositionTraderHashmap[traderAddress] != 0) {
            result = 1;
            return result;
        } else if (marginOfShortPositionTraderHashmap[traderAddress] != 0) {
            result = -1;
            return result;
        } else {
            return result;
        }
    }

    // following function returns , how much deposit is present of a trader in the perp contract
    function getAmountOfDepositOfTrader(
        address traderAddress
    ) external view returns (int256) {
        return traderDepositHashmap[traderAddress];
    }

    // following function returns the total withdrawable deposit of a trader
    function getAmountOfWithdrawableDepositOfTrader(
        address traderAddress
    ) external view returns (int256) {
        int256 totalWithdrawableDepositOfTrader = 0;

        if (traderDepositHashmap[traderAddress] <= 0) {
            return totalWithdrawableDepositOfTrader;
        }
        totalWithdrawableDepositOfTrader = traderDepositHashmap[traderAddress];

        if (marginOfLongPositionTraderHashmap[traderAddress] != 0) {
            totalWithdrawableDepositOfTrader -= maintenanceMarginOfLongPositionTraderHashmap[
                traderAddress
            ];

            if (
                currentPriceOfPerp <
                priceAtWhichPerpWasBoughtHashmap[traderAddress]
            ) {
                totalWithdrawableDepositOfTrader -=
                    (priceAtWhichPerpWasBoughtHashmap[traderAddress] -
                        currentPriceOfPerp) *
                    perpCountOfTraderWithLongPositionHashmap[traderAddress];
            }
        } else if (marginOfShortPositionTraderHashmap[traderAddress] != 0) {
            totalWithdrawableDepositOfTrader -= maintenanceMarginOfShortPositionTraderHashmap[
                traderAddress
            ];

            if (
                currentPriceOfPerp >
                priceAtWhichPerpWasSoldHashmap[traderAddress]
            ) {
                totalWithdrawableDepositOfTrader -=
                    (currentPriceOfPerp -
                        priceAtWhichPerpWasSoldHashmap[traderAddress]) *
                    perpCountOfTraderWithShortPositionHashmap[traderAddress];
            }
        }
        return totalWithdrawableDepositOfTrader;
    }

    // following function returns the leverage that trader used to open the current position
    function getLeverageUsedByTrader(
        address traderAddress
    ) external view returns (int256) {
        require(
            marginOfLongPositionTraderHashmap[traderAddress] != 0 ||
                marginOfShortPositionTraderHashmap[traderAddress] != 0,
            "You do not have any open position."
        );
        return leverageUsedByTraderHashMap[traderAddress];
    }

    // Following function gives the number of perp in short or long position of a specific trader
    function getNumberOfPerpInOpenPositionOfTrader(
        address traderAddress
    ) external view returns (int256) {
        require(
            marginOfLongPositionTraderHashmap[traderAddress] != 0 ||
                marginOfShortPositionTraderHashmap[traderAddress] != 0,
            "You do not have any open position."
        );
        if (marginOfLongPositionTraderHashmap[traderAddress] != 0) {
            return perpCountOfTraderWithLongPositionHashmap[traderAddress];
        } else {
            return perpCountOfTraderWithShortPositionHashmap[traderAddress];
        }
    }

    // Following function gives the perp Price at which a trader entered a trade
    function getPerpPriceAtWhichTraderEnteredTheTrade(
        address traderAddress
    ) external view returns (int256) {
        require(
            marginOfLongPositionTraderHashmap[traderAddress] != 0 ||
                marginOfShortPositionTraderHashmap[traderAddress] != 0,
            "You do not have any open position."
        );
        if (marginOfLongPositionTraderHashmap[traderAddress] != 0) {
            return priceAtWhichPerpWasBoughtHashmap[traderAddress];
        } else {
            return priceAtWhichPerpWasSoldHashmap[traderAddress];
        }
    }

    // Following function gives the margin of the trader
    function getMarginOfTrader(
        address traderAddress
    ) external view returns (int256) {
        require(
            marginOfLongPositionTraderHashmap[traderAddress] != 0 ||
                marginOfShortPositionTraderHashmap[traderAddress] != 0,
            "You do not have any open position."
        );
        if (marginOfLongPositionTraderHashmap[traderAddress] != 0) {
            return marginOfLongPositionTraderHashmap[traderAddress];
        } else {
            return marginOfShortPositionTraderHashmap[traderAddress];
        }
    }

    // Following function gives the maintenance margin of the trader
    function getMaintenanceMarginOfTrader(
        address traderAddress
    ) external view returns (int256) {
        require(
            marginOfLongPositionTraderHashmap[traderAddress] != 0 ||
                marginOfShortPositionTraderHashmap[traderAddress] != 0,
            "You do not have any open position."
        );
        if (marginOfLongPositionTraderHashmap[traderAddress] != 0) {
            return maintenanceMarginOfLongPositionTraderHashmap[traderAddress];
        } else {
            return maintenanceMarginOfShortPositionTraderHashmap[traderAddress];
        }
    }

    // Following function gives effective margin of the trader ie margin-current loss. If effective margin becomes less than maintenance margin, the position of trader is liquidated.
    // Effective margin is only available for traders in open position.
    function getEffectiveMargin(
        address traderAddress
    ) external view returns (int256) {
        int256 effectiveMargin = 0;
        require(
            marginOfLongPositionTraderHashmap[traderAddress] != 0 ||
                marginOfShortPositionTraderHashmap[traderAddress] != 0,
            "You do not have any open position."
        );

        if (marginOfLongPositionTraderHashmap[traderAddress] != 0) {
            effectiveMargin = marginOfLongPositionTraderHashmap[traderAddress];
            if (
                currentPriceOfPerp <
                priceAtWhichPerpWasBoughtHashmap[traderAddress]
            ) {
                effectiveMargin =
                    effectiveMargin -
                    ((priceAtWhichPerpWasBoughtHashmap[traderAddress] -
                        currentPriceOfPerp) *
                        perpCountOfTraderWithLongPositionHashmap[
                            traderAddress
                        ]);
            }
        } else {
            effectiveMargin = marginOfShortPositionTraderHashmap[traderAddress];
            if (
                currentPriceOfPerp >
                priceAtWhichPerpWasSoldHashmap[traderAddress]
            ) {
                effectiveMargin =
                    effectiveMargin -
                    ((currentPriceOfPerp -
                        priceAtWhichPerpWasSoldHashmap[traderAddress]) *
                        perpCountOfTraderWithShortPositionHashmap[
                            traderAddress
                        ]);
            }
        }
        return effectiveMargin;
    }

    // following function gives the maximum extra margin that can be added to current open position based on your deposit
    function getMaximumAmountThatCanBeAddedToMargin(
        address traderAddress
    ) external view returns (int256) {
        int256 maximumAmountThatCanBeAddedToMargin = 0;
        require(
            marginOfLongPositionTraderHashmap[traderAddress] != 0 ||
                marginOfShortPositionTraderHashmap[traderAddress] != 0,
            "You do not have any open position."
        );

        if (marginOfLongPositionTraderHashmap[traderAddress] != 0) {
            maximumAmountThatCanBeAddedToMargin =
                traderDepositHashmap[traderAddress] -
                marginOfLongPositionTraderHashmap[traderAddress];
        } else {
            maximumAmountThatCanBeAddedToMargin =
                traderDepositHashmap[traderAddress] -
                marginOfShortPositionTraderHashmap[traderAddress];
        }
        return maximumAmountThatCanBeAddedToMargin;
    }

    // Following function gives the trigger price of liquidation for open position traders
    function getTriggerPriceOfTrader(
        address traderAddress
    ) external view returns (int256) {
        require(
            marginOfLongPositionTraderHashmap[traderAddress] != 0 ||
                marginOfShortPositionTraderHashmap[traderAddress] != 0,
            "You do not have any open position."
        );
        if (marginOfLongPositionTraderHashmap[traderAddress] != 0) {
            int256 index = triggerPriceForLongPositionLiquidationHeap.indexMap[
                traderAddress
            ] - 1;
            return
                triggerPriceForLongPositionLiquidationHeap
                    .heap[uint256(index)]
                    .triggerPrice;
        } else {
            int256 index = triggerPriceForShortPositionLiquidationHeap.indexMap[
                traderAddress
            ] - 1;
            return
                triggerPriceForShortPositionLiquidationHeap
                    .heap[uint256(index)]
                    .triggerPrice;
        }
    }

    // Following function gives the expected pnl of trader who is in open position
    // positive return value means profit
    // negative return value means loss
    function getPnLOfTrader(
        address traderAddress
    ) external view returns (int256) {
        int256 pnl = 0;
        require(
            marginOfLongPositionTraderHashmap[traderAddress] != 0 ||
                marginOfShortPositionTraderHashmap[traderAddress] != 0,
            "You do not have any open position."
        );
        if (marginOfLongPositionTraderHashmap[traderAddress] != 0) {
            pnl =
                (currentPriceOfPerp -
                    priceAtWhichPerpWasBoughtHashmap[traderAddress]) *
                perpCountOfTraderWithLongPositionHashmap[traderAddress];
        } else {
            pnl =
                (priceAtWhichPerpWasSoldHashmap[traderAddress] -
                    currentPriceOfPerp) *
                perpCountOfTraderWithShortPositionHashmap[traderAddress];
        }
        return pnl;
    }

    // Following function returns the platform that was collected from the user to open a his latest position
    function getPlatformFeeCollectedToOpenThePosition(
        address traderAddress
    ) external view returns (int256) {
        int256 platformFeeCollectedToOpenThePosition = 0;
        int256 positionSize = 0;

        require(
            marginOfLongPositionTraderHashmap[traderAddress] != 0 ||
                marginOfShortPositionTraderHashmap[traderAddress] != 0,
            "You do not have any open position."
        );

        if (marginOfLongPositionTraderHashmap[traderAddress] != 0) {
            positionSize =
                perpCountOfTraderWithLongPositionHashmap[traderAddress] *
                priceAtWhichPerpWasBoughtHashmap[traderAddress];
        } else {
            positionSize =
                perpCountOfTraderWithShortPositionHashmap[traderAddress] *
                priceAtWhichPerpWasSoldHashmap[traderAddress];
        }
        platformFeeCollectedToOpenThePosition = calculateOpeningANewPositionFee(
            positionSize
        );
        return platformFeeCollectedToOpenThePosition;
    }
}
