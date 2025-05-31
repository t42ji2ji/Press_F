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
        "name": "buy",
        "inputs": [
            { "name": "token", "type": "address", "internalType": "address" },
            { "name": "amount", "type": "uint256", "internalType": "uint256" },
            { "name": "maxEthCost", "type": "uint256", "internalType": "uint256" }
        ],
        "outputs": [],
        "stateMutability": "payable"
    }
] as const;

const PUMPFUN_ADDRESS = "0xd570bf4598d3ccf214e288dd92222b8bd3134984";

export const TradeToken = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { address, isConnected } = useAccount();

    const tokenAddress = searchParams.get("token");
    const tokenName = searchParams.get("name");
    const tokenSymbol = searchParams.get("symbol");

    const [amount, setAmount] = useState("");
    const [ethCost, setEthCost] = useState<bigint | null>(null);
    const [maxEthCost, setMaxEthCost] = useState<bigint | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);

    // 獲取 bonding curve 數據
    const { data: bondingCurveData } = useReadContract({
        address: PUMPFUN_ADDRESS,
        abi: PUMPFUN_ABI,
        functionName: "bondingCurve",
        args: [tokenAddress as `0x${string}`],
        query: { enabled: !!tokenAddress }
    });

    // 計算 ETH 成本
    const { data: calculatedEthCost } = useReadContract({
        address: PUMPFUN_ADDRESS,
        abi: PUMPFUN_ABI,
        functionName: "calculateEthCost",
        args: [bondingCurveData as any, parseEther(amount || "0")],
        query: {
            enabled: !!bondingCurveData && !!amount && parseFloat(amount) > 0
        }
    });

    // 購買函數
    const { writeContract, isPending: isBuying } = useWriteContract();

    useEffect(() => {
        if (calculatedEthCost) {
            setEthCost(calculatedEthCost);
            // 設置 maxEthCost 為計算成本的 1.1 倍
            setMaxEthCost((calculatedEthCost * BigInt(110)) / BigInt(100));
        }
    }, [calculatedEthCost]);

    const handleBuy = async () => {
        if (!tokenAddress || !amount || !ethCost || !maxEthCost || !isConnected) {
            return;
        }

        try {
            writeContract({
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

                    {/* Amount Input */}
                    <div className="mb-8">
                        <label className="block text-gray-300 text-base font-medium mb-3">
                            Amount to Buy
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
                            />
                            <div className="absolute right-4 top-4 text-gray-400 text-base font-medium">
                                {tokenSymbol}
                            </div>
                        </div>
                    </div>

                    {/* Cost Display */}
                    {ethCost && (
                        <div className="mb-8 p-5 bg-gray-900/50 rounded-xl border border-gray-600">
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
                        </div>
                    )}

                    {/* Buy Button */}
                    <button
                        onClick={handleBuy}
                        disabled={!amount || !ethCost || isBuying || parseFloat(amount) <= 0}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/50 disabled:hover:scale-100 disabled:shadow-none"
                    >
                        {isBuying ? (
                            "🔄 Purchasing..."
                        ) : !amount || parseFloat(amount) <= 0 ? (
                            "Enter Amount"
                        ) : !ethCost ? (
                            "Calculating..."
                        ) : (
                            `🚀 Buy ${amount} ${tokenSymbol}`
                        )}
                    </button>


                </div>
            </div>
        </div>
    );
}; 