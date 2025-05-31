// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/PumpFun.sol";
import "../src/TokenFactory.sol";
import "../src/vlayer/WebProofVerifier.sol";
import {Proof} from "vlayer-0.1.0/Proof.sol";

contract MockWebProofVerifier is IWebProofVerifier {
    constructor() {}

    function verify(Proof calldata, string memory, address) public pure {
        // Mock verification - always passes
        return;
    }
}

contract DeployScript is Script {
    function run() public {
        // Read private key from env
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Read deployment config from env
        bool useMockVerifier = vm.envBool("USE_MOCK_VERIFIER");
        address verifierAddress;

        // Constants
        uint256 CREATE_FEE = 0.0 ether;
        uint256 FEE_BASIS_POINTS = 100; // 1%

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy verifier if using mock
        if (useMockVerifier) {
            MockWebProofVerifier mockVerifier = new MockWebProofVerifier();
            verifierAddress = address(mockVerifier);
            console.log("MockVerifier deployed at:", verifierAddress);
        } else {
            verifierAddress = vm.envAddress("VERIFIER_ADDRESS");
            console.log("Using existing verifier at:", verifierAddress);
        }

        // Deploy PumpFun
        PumpFun pumpFun = new PumpFun(
            CREATE_FEE,
            FEE_BASIS_POINTS,
            verifierAddress
        );
        console.log("PumpFun deployed at:", address(pumpFun));

        // Deploy TokenFactory
        TokenFactory tokenFactory = new TokenFactory();
        console.log("TokenFactory deployed at:", address(tokenFactory));

        // Set PumpFun address in TokenFactory
        tokenFactory.setPoolAddress(address(pumpFun));
        console.log("TokenFactory pool address set to:", address(pumpFun));

        vm.stopBroadcast();

        // Log deployment info
        console.log("=== Deployment Info ===");
        console.log("Using Mock Verifier:", useMockVerifier);
        console.log("Verifier Address:", verifierAddress);
        console.log("Create Fee:", CREATE_FEE);
        console.log("Fee Basis Points:", FEE_BASIS_POINTS);
    }
}
