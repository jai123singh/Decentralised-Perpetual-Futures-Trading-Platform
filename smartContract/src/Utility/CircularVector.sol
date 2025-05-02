// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

struct Data {
    int256 perpPrice;
    int256 correspondingTime;
}

struct CircularVector {
    Data[10] data;
    uint8 currentIndex;
}

library CircularVectorLib {
    function push(
        CircularVector storage self,
        int256 perpPrice,
        int256 correspondingTime
    ) internal {
        self.data[self.currentIndex] = Data(perpPrice, correspondingTime);
        if (self.currentIndex < 9) {
            self.currentIndex++;
        } else {
            self.currentIndex = 0;
        }
    }

    function getPerpPriceVectorAndTimeDurationVector(
        CircularVector storage self
    )
        internal
        view
        returns (
            int256[10] memory perpPriceVector,
            int256[10] memory timeDurationVector
        )
    {
        // following i is iterator variable for perpPriceVector and timeDurationVector
        uint256 i = 0;
        uint256 numberOfRounds = 0;
        // indexOfOldestElement is the index where the oldest perp price and its timestamp stays (among the latest 10 perp info)
        uint256 indexOfOldestElement = uint256(self.currentIndex);

        uint256 startingIndexOfLoop = indexOfOldestElement;

        while (numberOfRounds == 0) {
            uint256 currentElementIndex = startingIndexOfLoop;
            uint256 nextElementIndex = currentElementIndex + 1;
            if (nextElementIndex > 9) {
                nextElementIndex = 0;
            }

            int256 perpPriceRequired = 0;
            int256 timeDurationRequired = 0;

            if (self.data[currentElementIndex].perpPrice > 0) {
                int256 timestampOfCurrentPerpPrice = self
                    .data[currentElementIndex]
                    .correspondingTime;

                int256 timestampOfNextPerpPrice = 0;

                if (nextElementIndex == indexOfOldestElement) {
                    timestampOfNextPerpPrice = int256(block.timestamp);
                } else {
                    timestampOfNextPerpPrice = self
                        .data[nextElementIndex]
                        .correspondingTime;
                }

                if (timestampOfNextPerpPrice > timestampOfCurrentPerpPrice) {
                    timeDurationRequired = (timestampOfNextPerpPrice -
                        timestampOfCurrentPerpPrice);
                    perpPriceRequired = self
                        .data[currentElementIndex]
                        .perpPrice;
                }
            }

            perpPriceVector[i] = perpPriceRequired;
            timeDurationVector[i] = timeDurationRequired;
            // following actions increase the index to cover the whole vector
            startingIndexOfLoop = startingIndexOfLoop + 1;
            i++;
            if (startingIndexOfLoop > 9) {
                startingIndexOfLoop = 0;
            }
            // following condition checks and applies exit logic
            if (startingIndexOfLoop == indexOfOldestElement) {
                numberOfRounds++;
            }
        }

        return (perpPriceVector, timeDurationVector);
    }
}
