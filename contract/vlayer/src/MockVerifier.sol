// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./vlayer/WebProofVerifier.sol";
import {Proof} from "vlayer-0.1.0/Proof.sol";


contract MockWebProofVerifier is IWebProofVerifier {
    constructor() {}

    function verify(Proof calldata, string memory, address) public pure {
        // Mock verification - always passes
        return;
    }
}