// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import {WebProofProver} from "./WebProofProver.sol";

import {Proof} from "vlayer-0.1.0/Proof.sol";
import {Verifier} from "vlayer-0.1.0/Verifier.sol";

interface IWebProofVerifier {
    function verify(
        Proof calldata,
        string memory /* username */,
        address /* account */
    ) external view;
}

contract WebProofVerifier is Verifier, IWebProofVerifier {
    address public prover;

    constructor(address _prover) {
        prover = _prover;
    }

    function verify(
        Proof calldata,
        string memory /* username */,
        address /* account */
    ) public view onlyVerified(prover, WebProofProver.main.selector) {
        return;
    }
}
