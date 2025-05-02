// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

struct MinHeapAddressPricePair {
    address userAddress;
    int256 triggerPrice;
}

struct MinHeap {
    MinHeapAddressPricePair[] heap;
    mapping(address => int256) indexMap; // This map stores at which position (1-based indexing) an element is present in heap
}

// Functions available - push, top, pop, deleteUser
library MinHeapLib {
    function push(MinHeap storage self, address user, int256 price) internal {
        // Check if user already exists, first delete then insert
        if (self.indexMap[user] != 0) {
            deleteUser(self, user);
        }

        self.heap.push(MinHeapAddressPricePair(user, price));
        self.indexMap[user] = int256(self.heap.length);
        heapifyUp(self, int256(self.heap.length - 1));
    }

    function heapifyUp(MinHeap storage self, int256 index) internal {
        while (index > 0) {
            int256 parentIndex = (index - 1) / 2;
            if (
                self.heap[uint256(index)].triggerPrice >=
                self.heap[uint256(parentIndex)].triggerPrice
            ) {
                break;
            } else {
                swap(self, index, parentIndex);
                index = parentIndex;
            }
        }
    }

    function swap(MinHeap storage self, int256 index1, int256 index2) internal {
        MinHeapAddressPricePair memory temp = self.heap[uint256(index1)];
        self.heap[uint256(index1)] = self.heap[uint256(index2)];
        self.heap[uint256(index2)] = temp;
        self.indexMap[self.heap[uint256(index1)].userAddress] = index1 + 1;
        self.indexMap[self.heap[uint256(index2)].userAddress] = index2 + 1;
    }

    function top(MinHeap storage self) internal view returns (address, int256) {
        require(self.heap.length > 0, "Heap is empty");
        return (self.heap[0].userAddress, self.heap[0].triggerPrice);
    }

    function pop(MinHeap storage self) internal {
        require(self.heap.length > 0, "Heap is empty");
        swap(self, 0, int256(self.heap.length - 1));
        delete self.indexMap[self.heap[self.heap.length - 1].userAddress];
        self.heap.pop();
        if (self.heap.length > 0) {
            heapifyDown(self, 0);
        }
    }

    function heapifyDown(MinHeap storage self, int256 index) internal {
        int256 left;
        int256 right;
        int256 smallest;
        while (true) {
            unchecked {
                left = index * 2 + 1;
                right = index * 2 + 2;
                smallest = index;
            }

            if (
                left < int256(self.heap.length) &&
                self.heap[uint256(left)].triggerPrice <
                self.heap[uint256(smallest)].triggerPrice
            ) {
                smallest = left;
            }
            if (
                right < int256(self.heap.length) &&
                self.heap[uint256(right)].triggerPrice <
                self.heap[uint256(smallest)].triggerPrice
            ) {
                smallest = right;
            }
            if (smallest == index) {
                break;
            }
            swap(self, index, smallest);
            index = smallest;
        }
    }

    function deleteUser(MinHeap storage self, address user) internal {
        if (self.indexMap[user] == 0) {
            return;
        }

        int256 index = self.indexMap[user] - 1;

        if (index == int256(self.heap.length - 1)) {
            self.heap.pop();
            delete self.indexMap[user];
        } else {
            swap(self, index, int256(self.heap.length - 1));
            self.heap.pop();
            delete self.indexMap[user];
            if (self.heap.length > 1) {
                heapifyUp(self, index);
                heapifyDown(self, index);
            }
        }
    }
}
