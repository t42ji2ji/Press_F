// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IToken {
    function xUser() external view returns (string memory);
}

interface IUniswapV2Factory {
    function createPair(
        address tokenA,
        address tokenB
    ) external returns (address pair);
}

interface IUniswapV2Router02 {
    function swapExactTokensForETHSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external;

    function factory() external pure returns (address);

    function WETH() external pure returns (address);

    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    )
        external
        payable
        returns (uint amountToken, uint amountETH, uint liquidity);
}

contract PumpFun is ReentrancyGuard {
    receive() external payable {}

    address private owner;
    uint256 private initialVirtualTokenReserves;
    uint256 private initialVirtualEthReserves;

    uint256 private tokenTotalSupply;
    uint256 private mcapLimit;
    uint256 private feeBasisPoint;
    uint256 private createFee;

    IUniswapV2Router02 private uniswapV2Router;

    struct Profile {
        address user;
        Token[] tokens;
    }

    struct Token {
        address tokenMint;
        uint256 virtualTokenReserves;
        uint256 virtualEthReserves;
        uint256 realTokenReserves;
        uint256 realEthReserves;
        uint256 tokenTotalSupply;
        uint256 mcapLimit;
        bool complete;
        string xUser;
        uint256 collectedFees;
    }

    mapping(address => Token) public bondingCurve;
    mapping(string => address[]) public xUserTokens;

    event CreatePool(address indexed mint, address indexed user);
    event Complete(
        address indexed user,
        address indexed mint,
        uint256 timestamp
    );
    event Trade(
        address indexed mint,
        uint256 ethAmount,
        uint256 tokenAmount,
        bool isBuy,
        address indexed user,
        uint256 timestamp,
        uint256 virtualEthReserves,
        uint256 virtualTokenReserves
    );
    event FeesCollected(string xUser, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not Owner");
        _;
    }

    constructor(uint256 feeAmt, uint256 basisFee) {
        owner = msg.sender;
        createFee = feeAmt;
        feeBasisPoint = basisFee;
        initialVirtualTokenReserves = 1_073_000_191 * 10 ** 18; // 1,073,000,191 tokens
        initialVirtualEthReserves = 30 * 10 ** 18; // 30 ETH
        tokenTotalSupply = 1_000_000_000 * 10 ** 18; // 1 billion tokens
        mcapLimit = 85 * 10 ** 18; // 85 ETH market cap limit (approximately $69,000)
    }

    function createPool(address token, uint256 amount) public payable {
        require(amount > 0, "CreatePool: Larger than Zero");
        require(msg.value >= createFee, "CreatePool: Value Amount");

        IERC20(token).transferFrom(msg.sender, address(this), amount);

        string memory xUser = IToken(token).xUser();

        Token memory newToken = Token({
            tokenMint: token,
            virtualTokenReserves: initialVirtualTokenReserves,
            virtualEthReserves: initialVirtualEthReserves,
            realTokenReserves: amount,
            realEthReserves: 0,
            tokenTotalSupply: tokenTotalSupply,
            mcapLimit: mcapLimit,
            complete: false,
            xUser: xUser,
            collectedFees: 0
        });

        bondingCurve[token] = newToken;
        xUserTokens[xUser].push(token);

        emit CreatePool(token, msg.sender);
    }

    function buy(
        address token,
        uint256 amount,
        uint256 maxEthCost
    ) public payable {
        Token storage tokenCurve = bondingCurve[token];
        require(amount > 0, "Should Larger than zero");
        require(tokenCurve.complete == false, "Should Not Completed");

        // Calculate ETH cost using the new formula
        uint256 ethCost = calculateEthCost(tokenCurve, amount);

        // Calculate fee (1%)
        uint256 txFee = (feeBasisPoint * ethCost) / 10000;
        uint256 totalEthCost = ethCost + txFee;
        require(totalEthCost <= maxEthCost, "Max Eth Cost");
        require(msg.value >= totalEthCost, "Exceed ETH Cost");

        // Update collected fees
        tokenCurve.collectedFees += txFee;

        // Transfer tokens to buyer
        IERC20(token).transfer(msg.sender, amount);

        // Update reserves
        tokenCurve.realTokenReserves -= amount;
        tokenCurve.virtualTokenReserves -= amount;
        tokenCurve.virtualEthReserves += ethCost;
        tokenCurve.realEthReserves += ethCost;

        // Check if bonding curve is complete
        uint256 mcap = (tokenCurve.virtualEthReserves * tokenTotalSupply) /
            tokenCurve.virtualTokenReserves;
        uint256 percentage = (tokenCurve.realTokenReserves * 100) /
            tokenTotalSupply;

        if (mcap > tokenCurve.mcapLimit || percentage < 20) {
            tokenCurve.complete = true;
            emit Complete(msg.sender, token, block.timestamp);
        }

        emit Trade(
            token,
            ethCost,
            amount,
            true,
            msg.sender,
            block.timestamp,
            tokenCurve.virtualEthReserves,
            tokenCurve.virtualTokenReserves
        );
    }

    function calculateEthCost(
        Token memory token,
        uint256 tokenAmount
    ) public pure returns (uint256) {
        // Calculate k constant
        uint256 k = token.virtualEthReserves * token.virtualTokenReserves;

        // For buy: Calculate new virtual token reserves
        require(
            tokenAmount < token.virtualTokenReserves,
            "Token amount too large"
        );
        uint256 newVirtualTokenReserves = token.virtualTokenReserves -
            tokenAmount;
        require(newVirtualTokenReserves > 0, "Zero token reserves");

        uint256 newVirtualEthReserves = k / newVirtualTokenReserves + 1;
        require(
            newVirtualEthReserves > token.virtualEthReserves,
            "Invalid ETH reserves"
        );

        uint256 ethCost = newVirtualEthReserves - token.virtualEthReserves;
        require(ethCost > 0, "Zero ETH cost");

        return ethCost;
    }

    function calculateSellEthOutput(
        Token memory token,
        uint256 tokenAmount
    ) public pure returns (uint256) {
        // Calculate k constant
        uint256 k = token.virtualEthReserves * token.virtualTokenReserves;

        // For sell: Calculate new virtual token reserves (increasing)
        uint256 newVirtualTokenReserves = token.virtualTokenReserves +
            tokenAmount;
        require(
            newVirtualTokenReserves > token.virtualTokenReserves,
            "Token amount too large"
        );

        uint256 newVirtualEthReserves = k / newVirtualTokenReserves + 1;
        require(
            newVirtualEthReserves < token.virtualEthReserves,
            "Invalid ETH reserves"
        );

        uint256 ethOutput = token.virtualEthReserves - newVirtualEthReserves;
        require(ethOutput > 0, "Zero ETH output");

        return ethOutput;
    }

    function sell(address token, uint256 amount, uint256 minEthOutput) public {
        Token storage tokenCurve = bondingCurve[token];
        require(tokenCurve.complete == false, "Should Not Completed");
        require(amount > 0, "Should Larger than zero");

        // Calculate ETH output using the new sell formula
        uint256 ethOutput = calculateSellEthOutput(tokenCurve, amount);
        require(ethOutput >= minEthOutput, "Should Be Larger than Min");

        // Calculate fee (1%)
        uint256 txFee = (feeBasisPoint * ethOutput) / 10000;
        uint256 netEthOutput = ethOutput - txFee;

        // Update collected fees
        tokenCurve.collectedFees += txFee;

        // Transfer ETH to seller
        payable(msg.sender).transfer(netEthOutput);

        // Transfer tokens from seller
        IERC20(token).transferFrom(msg.sender, address(this), amount);

        // Update reserves
        tokenCurve.realTokenReserves += amount;
        tokenCurve.virtualTokenReserves += amount;
        tokenCurve.virtualEthReserves -= ethOutput;
        tokenCurve.realEthReserves -= ethOutput;

        emit Trade(
            token,
            ethOutput,
            amount,
            false,
            msg.sender,
            block.timestamp,
            tokenCurve.virtualEthReserves,
            tokenCurve.virtualTokenReserves
        );
    }

    function collectFees(address token) public {
        Token storage tokenCurve = bondingCurve[token];
        string memory xUser = IToken(token).xUser();
        require(
            keccak256(bytes(tokenCurve.xUser)) == keccak256(bytes(xUser)),
            "Not authorized"
        );
        require(tokenCurve.collectedFees > 0, "No fees to collect");

        uint256 amount = tokenCurve.collectedFees;
        tokenCurve.collectedFees = 0;
        payable(msg.sender).transfer(amount);

        emit FeesCollected(xUser, amount);
    }

    function getXUserTokens(
        string memory xUser
    ) public view returns (address[] memory) {
        return xUserTokens[xUser];
    }

    function withdraw(address token) public onlyOwner {
        Token storage tokenCurve = bondingCurve[token];

        require(tokenCurve.complete == true, "Should Be Completed");

        payable(owner).transfer(tokenCurve.realEthReserves);

        IERC20(token).transfer(owner, tokenCurve.realTokenReserves);
    }

    function calculateTokenAmount(
        Token memory token,
        uint256 ethAmount
    ) public pure returns (uint256) {
        // Calculate k constant
        uint256 k = token.virtualEthReserves * token.virtualTokenReserves;

        // For sell: Calculate new virtual eth reserves
        uint256 newVirtualEthReserves = token.virtualEthReserves + ethAmount;
        uint256 newVirtualTokenReserves = k / newVirtualEthReserves;
        uint256 tokenAmount = token.virtualTokenReserves -
            newVirtualTokenReserves;

        return tokenAmount;
    }

    function setOwner(address newAddr) external onlyOwner {
        require(newAddr != address(0), "Non zero Address");
        owner = newAddr;
    }

    function setInitialVirtualReserves(
        uint256 initToken,
        uint256 initEth
    ) external onlyOwner {
        require(initEth > 0 && initToken > 0, "Should Larger than zero");
        initialVirtualTokenReserves = initToken;
        initialVirtualEthReserves = initEth;
    }

    function setTotalSupply(uint256 newSupply) external onlyOwner {
        require(newSupply > 0, "Should Larger than zero");
        tokenTotalSupply = newSupply;
    }

    function setMcapLimit(uint256 newLimit) external onlyOwner {
        require(newLimit > 0, "Should Larger than zero");
        mcapLimit = newLimit;
    }

    function setFeeAmount(
        uint256 newBasisPoint,
        uint256 newCreateFee
    ) external onlyOwner {
        require(
            newBasisPoint > 0 && newCreateFee > 0,
            "Should Larger than zero"
        );
        feeBasisPoint = newBasisPoint;
        createFee = newCreateFee;
    }

    function getCreateFee() external view returns (uint256) {
        return createFee;
    }

    function getBondingCurve(
        address mint
    ) external view returns (Token memory) {
        return bondingCurve[mint];
    }
}
