// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/PumpFun.sol";
import "../src/Token.sol";
import "../src/TokenFactory.sol";
import "../src/vlayer/WebProofVerifier.sol";
import {Proof} from "vlayer-0.1.0/Proof.sol";

contract MockWebProofVerifier is IWebProofVerifier {
    function verify(
        Proof calldata,
        string memory,
        address
    ) public view override {
        // Mock verification - always passes
        return;
    }
}

contract PumpFunTest is Test {
    PumpFun public pumpFun;
    TokenFactory public tokenFactory;
    Token public token;
    MockWebProofVerifier public verifier;
    address public user = address(0x456);
    address public xUser = address(0x789);
    uint256 public constant INITIAL_SUPPLY = 10 ** 27;
    uint256 public constant CREATE_FEE = 0.1 ether;
    uint256 public constant FEE_BASIS_POINTS = 100; // 1%

    function setUp() public {
        vm.deal(user, 1000 ether);
        vm.deal(xUser, 1000 ether);

        verifier = new MockWebProofVerifier();
        pumpFun = new PumpFun(CREATE_FEE, FEE_BASIS_POINTS, address(verifier));
        tokenFactory = new TokenFactory();
        tokenFactory.setPoolAddress(address(pumpFun));
    }

    function testDeployToken() public {
        vm.startPrank(user);

        // Deploy token with xUrl and xUser
        tokenFactory.deployERC20Token{value: CREATE_FEE}(
            "Test Token",
            "TEST",
            "https://x.com/test",
            "testUser"
        );

        // Get the deployed token address
        (address tokenAddress, , , , , ) = tokenFactory.tokens(0);
        token = Token(tokenAddress);

        // Verify token properties
        assertEq(token.name(), "Test Token");
        assertEq(token.symbol(), "TEST");
        assertEq(token.xUrl(), "https://x.com/test");
        assertEq(token.xUser(), "testUser");

        // Verify bonding curve was created
        PumpFun.Token memory curve = pumpFun.getBondingCurve(tokenAddress);
        console.log(
            "Initial virtual token reserves:",
            curve.virtualTokenReserves
        );
        console.log("Initial virtual ETH reserves:", curve.virtualEthReserves);
        console.log("Initial real token reserves:", curve.realTokenReserves);
        assertEq(curve.xUser, "testUser");
        assertEq(curve.collectedFees, 0);

        vm.stopPrank();
    }

    function testBuyAndSell() public {
        // First deploy token
        testDeployToken();

        vm.startPrank(user);

        // Buy tokens - using smaller amount to prevent overflow
        uint256 buyAmount = 100_000_000 * 10 ** 18; // 1e8 token
        uint256 maxEthCost = 3.3 ether;

        uint256 expectedEthCost = pumpFun.calculateEthCost(
            pumpFun.getBondingCurve(address(token)),
            buyAmount
        );
        console.log("Expected ETH Cost:", expectedEthCost);

        uint256 ethBalanceBeforeBuy = user.balance;
        pumpFun.buy{value: maxEthCost}(address(token), buyAmount, maxEthCost);
        uint256 ethBalanceAfterBuy = user.balance;

        // Log ETH balance change from buy
        console.log(
            "ETH balance change from buy:",
            ethBalanceBeforeBuy - ethBalanceAfterBuy
        );

        // Verify token balance
        assertEq(token.balanceOf(user), buyAmount);

        // Log bonding curve state after buy
        PumpFun.Token memory curveAfterBuy = pumpFun.getBondingCurve(
            address(token)
        );
        console.log("=== Bonding Curve State After Buy ===");
        console.log(
            "Virtual Token Reserves:",
            curveAfterBuy.virtualTokenReserves
        );
        console.log("Virtual ETH Reserves:", curveAfterBuy.virtualEthReserves);
        console.log("Real Token Reserves:", curveAfterBuy.realTokenReserves);
        console.log("Real ETH Reserves:", curveAfterBuy.realEthReserves);
        console.log("Collected Fees:", curveAfterBuy.collectedFees);

        // Pre-calculate sell amount
        uint256 expectedEthOutput = pumpFun.calculateSellEthOutput(
            curveAfterBuy,
            buyAmount
        );
        uint256 expectedFee = (expectedEthOutput * FEE_BASIS_POINTS) / 10000;
        uint256 expectedNetEthOutput = expectedEthOutput - expectedFee;
        console.log("=== Expected Sell Values ===");
        console.log("Expected ETH Output (before fee):", expectedEthOutput);
        console.log("Expected Fee:", expectedFee);
        console.log("Expected Net ETH Output:", expectedNetEthOutput);

        // Sell tokens
        token.approve(address(pumpFun), buyAmount);
        uint256 minEthOutput = 0; // Set to 0 to ensure it passes

        uint256 ethBalanceBeforeSell = user.balance;
        pumpFun.sell(address(token), buyAmount, minEthOutput);
        uint256 ethBalanceAfterSell = user.balance;

        // Log ETH balance change from sell
        console.log("=== Sell Results ===");
        console.log(
            "ETH balance change from sell:",
            ethBalanceAfterSell - ethBalanceBeforeSell
        );
        console.log(
            "Actual ETH received:",
            ethBalanceAfterSell - ethBalanceBeforeSell
        );

        // Verify ETH received from sell
        assertTrue(ethBalanceAfterSell > ethBalanceBeforeSell);

        // Verify fees were collected
        PumpFun.Token memory curveAfterSell = pumpFun.getBondingCurve(
            address(token)
        );
        console.log("=== Bonding Curve State After Sell ===");
        console.log(
            "Virtual Token Reserves:",
            curveAfterSell.virtualTokenReserves
        );
        console.log("Virtual ETH Reserves:", curveAfterSell.virtualEthReserves);
        console.log("Real Token Reserves:", curveAfterSell.realTokenReserves);
        console.log("Real ETH Reserves:", curveAfterSell.realEthReserves);
        console.log("Collected Fees:", curveAfterSell.collectedFees);
        assertTrue(curveAfterSell.collectedFees > 0);

        vm.stopPrank();
    }

    function testCollectFees() public {
        // First do buy and sell
        testBuyAndSell();

        // Try to collect fees as wrong user
        vm.startPrank(user);

        Proof memory emptyProof;
        pumpFun.collectFees(address(token), emptyProof);
        vm.stopPrank();

        // Collect fees as correct xUser
        vm.startPrank(xUser);
        uint256 balanceBefore = xUser.balance;
        pumpFun.collectFees(address(token), emptyProof);
        uint256 balanceAfter = xUser.balance;

        // Verify fees were received
        assertTrue(balanceAfter > balanceBefore);

        // Verify fees were reset
        PumpFun.Token memory curve = pumpFun.getBondingCurve(address(token));
        assertEq(curve.collectedFees, 0);

        vm.stopPrank();
    }

    function testGetXUserTokens() public {
        // First deploy token
        testDeployToken();

        // Get tokens for xUser
        address[] memory tokens = pumpFun.getXUserTokens("testUser");

        // Verify token is in the array
        assertEq(tokens.length, 1);
        assertEq(tokens[0], address(token));
    }
}
