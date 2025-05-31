import { useNotification } from "@blockscout/app-sdk";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { formatEther, parseEther } from "viem";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { isMobile } from "../../../utils";

// PumpFun ABI - 從 PumpFun.json 提取關鍵函數
const PUMPFUN_ABI = [
    {
        "type": "function",
        "name": "bondingCurve",
        "inputs": [{ "name": "", "type": "address", "internalType": "address" }],
        "outputs": [
            { "name": "tokenMint", "type": "address", "internalType": "address" },
            { "name": "virtualTokenReserves", "type": "uint256", "internalType": "uint256" },
            { "name": "virtualEthReserves", "type": "uint256", "internalType": "uint256" },
            { "name": "realTokenReserves", "type": "uint256", "internalType": "uint256" },
            { "name": "realEthReserves", "type": "uint256", "internalType": "uint256" },
            { "name": "tokenTotalSupply", "type": "uint256", "internalType": "uint256" },
            { "name": "mcapLimit", "type": "uint256", "internalType": "uint256" },
            { "name": "complete", "type": "bool", "internalType": "bool" },
            { "name": "xUser", "type": "string", "internalType": "string" },
            { "name": "collectedFees", "type": "uint256", "internalType": "uint256" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "calculateEthCost",
        "inputs": [
            {
                "name": "token",
                "type": "tuple",
                "internalType": "struct PumpFun.Token",
                "components": [
                    { "name": "tokenMint", "type": "address", "internalType": "address" },
                    { "name": "virtualTokenReserves", "type": "uint256", "internalType": "uint256" },
                    { "name": "virtualEthReserves", "type": "uint256", "internalType": "uint256" },
                    { "name": "realTokenReserves", "type": "uint256", "internalType": "uint256" },
                    { "name": "realEthReserves", "type": "uint256", "internalType": "uint256" },
                    { "name": "tokenTotalSupply", "type": "uint256", "internalType": "uint256" },
                    { "name": "mcapLimit", "type": "uint256", "internalType": "uint256" },
                    { "name": "complete", "type": "bool", "internalType": "bool" },
                    { "name": "xUser", "type": "string", "internalType": "string" },
                    { "name": "collectedFees", "type": "uint256", "internalType": "uint256" }
                ]
            },
            { "name": "tokenAmount", "type": "uint256", "internalType": "uint256" }
        ],
        "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "pure"
    },
    {
        "type": "function",
        "name": "calculateSellEthOutput",
        "inputs": [
            {
                "name": "token",
                "type": "tuple",
                "internalType": "struct PumpFun.Token",
                "components": [
                    { "name": "tokenMint", "type": "address", "internalType": "address" },
                    { "name": "virtualTokenReserves", "type": "uint256", "internalType": "uint256" },
                    { "name": "virtualEthReserves", "type": "uint256", "internalType": "uint256" },
                    { "name": "realTokenReserves", "type": "uint256", "internalType": "uint256" },
                    { "name": "realEthReserves", "type": "uint256", "internalType": "uint256" },
                    { "name": "tokenTotalSupply", "type": "uint256", "internalType": "uint256" },
                    { "name": "mcapLimit", "type": "uint256", "internalType": "uint256" },
                    { "name": "complete", "type": "bool", "internalType": "bool" },
                    { "name": "xUser", "type": "string", "internalType": "string" },
                    { "name": "collectedFees", "type": "uint256", "internalType": "uint256" }
                ]
            },
            { "name": "tokenAmount", "type": "uint256", "internalType": "uint256" }
        ],
        "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "pure"
    },
    {
        "type": "function",
        "name": "buy",
        "inputs": [
            { "name": "token", "type": "address", "internalType": "address" },
            { "name": "amount", "type": "uint256", "internalType": "uint256" },
            { "name": "maxEthCost", "type": "uint256", "internalType": "uint256" }
        ],
        "outputs": [],
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "sell",
        "inputs": [
            { "name": "token", "type": "address", "internalType": "address" },
            { "name": "amount", "type": "uint256", "internalType": "uint256" },
            { "name": "minEthOutput", "type": "uint256", "internalType": "uint256" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    }
] as const;

// ERC20 ABI - 用於檢查代幣餘額
const ERC20_ABI = [
    {
        "type": "function",
        "name": "balanceOf",
        "inputs": [{ "name": "account", "type": "address", "internalType": "address" }],
        "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "allowance",
        "inputs": [
            { "name": "owner", "type": "address", "internalType": "address" },
            { "name": "spender", "type": "address", "internalType": "address" }
        ],
        "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "approve",
        "inputs": [
            { "name": "spender", "type": "address", "internalType": "address" },
            { "name": "amount", "type": "uint256", "internalType": "uint256" }
        ],
        "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
        "stateMutability": "nonpayable"
    }
] as const;

const PUMPFUN_ADDRESS = "0xd570bf4598d3ccf214e288dd92222b8bd3134984";

export const TradeToken = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { address, isConnected, chain } = useAccount();
    const { openTxToast } = useNotification();

    const tokenAddress = searchParams.get("token");
    const tokenName = searchParams.get("name");
    const tokenSymbol = searchParams.get("symbol");

    const [amount, setAmount] = useState("");
    const [isBuyMode, setIsBuyMode] = useState(true);
    const [ethCost, setEthCost] = useState<bigint | null>(null);
    const [ethOutput, setEthOutput] = useState<bigint | null>(null);
    const [maxEthCost, setMaxEthCost] = useState<bigint | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [isApproving, setIsApproving] = useState(false);

    // 獲取 bonding curve 數據
    const { data: bondingCurveData } = useReadContract({
        address: PUMPFUN_ADDRESS,
        abi: PUMPFUN_ABI,
        functionName: "bondingCurve",
        args: [tokenAddress as `0x${string}`],
        query: { enabled: !!tokenAddress }
    });

    // 獲取用戶代幣餘額
    const { data: tokenBalance, refetch: refetchTokenBalance } = useReadContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [address as `0x${string}`],
        query: { enabled: !!tokenAddress && !!address && isConnected }
    });

    // 獲取 PUMPFUN_ADDRESS 的代幣授權額度
    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [address as `0x${string}`, PUMPFUN_ADDRESS],
        query: { enabled: !!tokenAddress && !!address && isConnected && !isBuyMode }
    });

    // 計算 ETH 成本 (買入)
    const { data: calculatedEthCost } = useReadContract({
        address: PUMPFUN_ADDRESS,
        abi: PUMPFUN_ABI,
        functionName: "calculateEthCost",
        args: [bondingCurveData as any, parseEther(amount || "0")],
        query: {
            enabled: !!bondingCurveData && !!amount && parseFloat(amount) > 0 && isBuyMode
        }
    });

    // 計算 ETH 輸出 (賣出)
    const { data: calculatedEthOutput } = useReadContract({
        address: PUMPFUN_ADDRESS,
        abi: PUMPFUN_ABI,
        functionName: "calculateSellEthOutput",
        args: [bondingCurveData as any, parseEther(amount || "0")],
        query: {
            enabled: !!bondingCurveData && !!amount && parseFloat(amount) > 0 && !isBuyMode
        }
    });

    // 購買函數
    const { writeContract: writeBuyContract, isPending: isBuying } = useWriteContract({
        mutation: {
            onSuccess: async (txHash) => {
                if (chain?.id && txHash) {
                    try {
                        await openTxToast(chain.id.toString(), txHash);
                        console.log(`Buy transaction submitted: ${txHash}`);
                        refetchTokenBalance();
                    } catch (error) {
                        console.error("Failed to show transaction toast:", error);
                    }
                }
            },
            onError: (error) => {
                console.error("Buy transaction failed:", error);
            }
        }
    });

    // 賣出函數
    const { writeContract: writeSellContract, isPending: isSelling } = useWriteContract({
        mutation: {
            onSuccess: async (txHash) => {
                if (chain?.id && txHash) {
                    try {
                        await openTxToast(chain.id.toString(), txHash);
                        console.log(`Sell transaction submitted: ${txHash}`);
                        refetchTokenBalance();
                        refetchAllowance();
                    } catch (error) {
                        console.error("Failed to show transaction toast:", error);
                    }
                }
            },
            onError: (error) => {
                console.error("Sell transaction failed:", error);
            }
        }
    });

    // Approve 函數
    const { writeContract: writeApproveContract, isPending: isApprovingToken } = useWriteContract({
        mutation: {
            onSuccess: async (txHash) => {
                if (chain?.id && txHash) {
                    try {
                        await openTxToast(chain.id.toString(), txHash);
                        console.log(`Approve transaction submitted: ${txHash}`);
                        // 批准成功後，重新獲取授權額度
                        await refetchAllowance();
                        // 重新觸發賣出操作
                        await handleSell(true);
                    } catch (error) {
                        console.error("Failed to show transaction toast or refetch allowance:", error);
                    } finally {
                        setIsApproving(false);
                    }
                }
            },
            onError: (error) => {
                console.error("Approve transaction failed:", error);
                setIsApproving(false);
            }
        }
    });

    useEffect(() => {
        if (isBuyMode && calculatedEthCost) {
            setEthCost(calculatedEthCost);
            setEthOutput(null);
            // 設置 maxEthCost 為計算成本的 1.1 倍
            setMaxEthCost((calculatedEthCost * BigInt(110)) / BigInt(100));
        } else if (!isBuyMode && calculatedEthOutput) {
            setEthOutput(calculatedEthOutput);
            setEthCost(null);
            setMaxEthCost(null);
        }
    }, [calculatedEthCost, calculatedEthOutput, isBuyMode]);

    const handleBuy = async () => {
        if (!tokenAddress || !amount || !ethCost || !maxEthCost || !isConnected) {
            return;
        }

        try {
            writeBuyContract({
                address: PUMPFUN_ADDRESS,
                abi: PUMPFUN_ABI,
                functionName: "buy",
                args: [
                    tokenAddress as `0x${string}`,
                    parseEther(amount),
                    maxEthCost
                ],
                value: maxEthCost
            });
        } catch (error) {
            console.error("Purchase failed:", error);
        }
    };

    const handleSell = async (isRetry = false) => {
        if (!tokenAddress || !amount || !isConnected) {
            return;
        }

        const sellAmount = parseEther(amount);

        if (!isRetry && allowance !== undefined && allowance < sellAmount) {
            setIsApproving(true);
            try {
                writeApproveContract({
                    address: tokenAddress as `0x${string}`,
                    abi: ERC20_ABI,
                    functionName: "approve",
                    args: [PUMPFUN_ADDRESS, sellAmount]
                });
            } catch (error) {
                console.error("Approval failed:", error);
                setIsApproving(false);
            }
            return; // 等待 approve 完成後，會通過 onSuccess 回調再次觸發 handleSell
        }

        try {
            writeSellContract({
                address: PUMPFUN_ADDRESS,
                abi: PUMPFUN_ABI,
                functionName: "sell",
                args: [
                    tokenAddress as `0x${string}`,
                    parseEther(amount),
                    BigInt(0) // minEthOutput 設為 0
                ]
            });
        } catch (error) {
            console.error("Sell failed:", error);
        }
    };

    const handleTrade = () => {
        if (isBuyMode) {
            handleBuy();
        } else {
            handleSell();
        }
    };

    const maxAmount = tokenBalance ? formatEther(tokenBalance) : "0";
    const isProcessing = isBuying || isSelling || isApprovingToken;

    const setMaxTokenAmount = () => {
        if (tokenBalance && !isBuyMode) {
            setAmount(formatEther(tokenBalance));
        }
    };

    // 檢查是否餘額不足
    const isInsufficientBalance = !isBuyMode &&
        tokenBalance &&
        amount &&
        amount.trim() !== "" &&
        parseFloat(amount) > 0 &&
        parseEther(amount) > tokenBalance;

    // 檢查按鈕是否應該禁用
    const isButtonDisabled = !amount ||
        parseFloat(amount) <= 0 ||
        isProcessing ||
        (isBuyMode && !ethCost) ||
        (!isBuyMode && !ethOutput && !isApprovingToken) ||
        Boolean(isInsufficientBalance);

    if (isMobile) {
        return (
            <p className="text-red-400 w-full block mt-3">
                Mobile is not supported. <br /> Please use desktop browser.
            </p>
        );
    }

    if (!tokenAddress) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-6">
                <div className="text-red-400 text-xl">❌ Invalid token address</div>
                <Link
                    to="/"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/50"
                >
                    ← Back to Token List
                </Link>
            </div>
        );
    }

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-6">
                <div className="text-yellow-400 text-xl">🔌 Please connect your wallet first</div>
                <Link
                    to="/connect-wallet"
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/50"
                >
                    Connect Wallet
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col">
            {/* Header */}
            <div className=" border-b">
                <div className="flex items-center gap-4 mb-4">
                    <Link
                        to="/"
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        ← Back
                    </Link>

                    <h2 className="text-white text-md font-bold">
                        Trade {tokenName || "Unknown Token"}
                    </h2>

                </div>
            </div>

            {/* Trading Interface */}
            <div className="flex-1 p-6 flex items-center justify-center">
                <div className="w-full max-w-lg bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-2xl">

                    {/* Buy/Sell Toggle */}
                    <div className="mb-6">
                        <div className="flex rounded-lg bg-gray-900/50 border border-gray-600 p-1">
                            <button
                                onClick={() => setIsBuyMode(true)}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${isBuyMode
                                    ? "bg-green-600 text-white shadow-lg"
                                    : "text-gray-400 hover:text-white"
                                    }`}
                            >
                                🚀 Buy
                            </button>
                            <button
                                onClick={() => setIsBuyMode(false)}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${!isBuyMode
                                    ? "bg-red-600 text-white shadow-lg"
                                    : "text-gray-400 hover:text-white"
                                    }`}
                            >
                                💰 Sell
                            </button>
                        </div>
                    </div>

                    {/* Token Balance (for selling) */}
                    {!isBuyMode && (
                        <div className="mb-6 p-4 bg-gray-900/50 rounded-xl border border-gray-600">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300 text-sm">Your Balance:</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-yellow-400 font-mono font-semibold">
                                        {maxAmount} {tokenSymbol}
                                    </span>
                                    <button
                                        onClick={setMaxTokenAmount}
                                        className="text-xs bg-yellow-600 hover:bg-yellow-500 text-white px-2 py-1 rounded transition-colors"
                                    >
                                        MAX
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Amount Input */}
                    <div className="mb-8">
                        <label className="block text-gray-300 text-base font-medium mb-3">
                            Amount to {isBuyMode ? "Buy" : "Sell"}
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.0"
                                className="w-full bg-gray-900/50 border border-gray-600 rounded-xl px-5 py-4 text-white text-lg placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                                min="0"
                                step="0.000001"
                                max={!isBuyMode ? maxAmount : undefined}
                            />
                            <div className="absolute right-4 top-4 text-gray-400 text-base font-medium">
                                {tokenSymbol}
                            </div>
                        </div>
                    </div>

                    {/* Cost/Output Display */}
                    {(ethCost || ethOutput) && (
                        <div className="mb-8 p-5 bg-gray-900/50 rounded-xl border border-gray-600">
                            {isBuyMode && ethCost && (
                                <>
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-gray-300 text-base">Cost:</span>
                                        <span className="text-green-400 font-mono font-semibold text-lg">
                                            {formatEther(ethCost)} ETH
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 text-sm">Max Cost (+ 10%):</span>
                                        <span className="text-yellow-400 font-mono text-base">
                                            {maxEthCost ? formatEther(maxEthCost) : "0"} ETH
                                        </span>
                                    </div>
                                </>
                            )}
                            {!isBuyMode && ethOutput && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300 text-base">You'll receive:</span>
                                    <span className="text-green-400 font-mono font-semibold text-lg">
                                        {formatEther(ethOutput)} ETH
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Trade Button */}
                    <button
                        onClick={handleTrade}
                        disabled={isButtonDisabled}
                        className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg disabled:hover:scale-100 disabled:shadow-none disabled:cursor-not-allowed ${isBuyMode
                            ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 hover:shadow-green-500/50"
                            : "bg-gradient-to-r from-red-600 to-red-600 hover:from-red-500 hover:to-red-500 disabled:from-gray-600 disabled:to-gray-700 hover:shadow-red-500/50"
                            } text-white`}
                    >
                        {isProcessing ? (
                            isBuyMode ? "🔄 Purchasing..." : "🔄 Selling..."
                        ) : !amount || parseFloat(amount) <= 0 ? (
                            "Enter Amount"
                        ) : isBuyMode && !ethCost ? (
                            "Calculating..."
                        ) : !isBuyMode && !ethOutput ? (
                            isApprovingToken ? "🔄 Approving..." : "Calculating..."
                        ) : isInsufficientBalance ? (
                            "Insufficient Balance"
                        ) : (
                            isBuyMode
                                ? `🚀 Buy ${amount} ${tokenSymbol}`
                                : `💰 Sell ${amount} ${tokenSymbol}`
                        )}
                    </button>

                </div>
            </div>
        </div>
    );
}; 