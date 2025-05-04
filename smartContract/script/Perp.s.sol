// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {Perp} from "../src/Perp.sol";

contract PerpScript is Script {
    Perp public perp;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        perp = new Perp(100000);

        vm.stopBroadcast();
    }
}
