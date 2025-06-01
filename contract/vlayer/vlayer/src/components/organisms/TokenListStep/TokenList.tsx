import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useReadContract } from "wagmi";
import { isMobile } from "../../../utils";

// TokenFactory ABI - 從之前看到的ABI文件中提取
const TOKEN_FACTORY_ABI = [
    {
        "type": "function",
        "name": "tokenCount",
        "inputs": [],
        "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "tokens",
        "inputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "outputs": [
            { "name": "tokenAddress", "type": "address", "internalType": "address" },
            { "name": "tokenName", "type": "string", "internalType": "string" },
            { "name": "tokenSymbol", "type": "string", "internalType": "string" },
            { "name": "totalSupply", "type": "uint256", "internalType": "uint256" },
            { "name": "xUrl", "type": "string", "internalType": "string" },
            { "name": "xUser", "type": "string", "internalType": "string" }
        ],
        "stateMutability": "view"
    }
] as const;

const TOKEN_FACTORY_ADDRESS = "0xe7D3930eabD922202B7f9C11084AB4D91444Ba2A";

interface Token {
    tokenAddress: string;
    tokenName: string;
    tokenSymbol: string;
    totalSupply: bigint;
    xUrl: string;
    xUser: string;
}

// 格式化大數字顯示 - 使用英文單位
const formatLargeNumber = (num: bigint): string => {
    const numValue = Number(num);

    if (numValue >= 1e18) {
        return (numValue / 1e18).toFixed(1) + 'Q'; // Quintillion
    } else if (numValue >= 1e15) {
        return (numValue / 1e15).toFixed(1) + 'P'; // Quadrillion  
    } else if (numValue >= 1e12) {
        return (numValue / 1e12).toFixed(1) + 'T'; // Trillion
    } else if (numValue >= 1e9) {
        return (numValue / 1e9).toFixed(1) + 'B'; // Billion
    } else if (numValue >= 1e6) {
        return (numValue / 1e6).toFixed(1) + 'M'; // Million
    } else if (numValue >= 1e3) {
        return (numValue / 1e3).toFixed(1) + 'K'; // Thousand
    } else {
        return numValue.toLocaleString();
    }
};

// 縮短地址顯示
const shortenAddress = (address: string): string => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// 列表行組件
const TokenRow = ({ token, index }: { token: Token; index: number }) => {
    return (
        <div className="bg-gray-800/40 hover:bg-gray-700/60 border-b border-gray-700/50 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/10">
            <div className="grid grid-cols-12 gap-4 items-center py-4 px-6 text-sm">
                {/* Rank & Logo */}
                <div className="col-span-1 text-gray-400 font-mono">
                    #{index + 1}
                </div>

                {/* Token Name & Symbol */}
                <div className="col-span-2">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                            {token.tokenSymbol.charAt(0)}
                        </div>
                        <div>
                            <div className="text-white font-semibold truncate max-w-24" title={token.tokenName}>
                                {token.tokenName}
                            </div>
                            <div className="text-cyan-400 font-mono text-xs text-start">
                                {token.tokenSymbol}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Supply */}
                <div className="col-span-2">
                    <div className="text-green-400 font-mono font-semibold">
                        {formatLargeNumber(token.totalSupply)}
                    </div>
                    <div className="text-gray-500 text-xs">Total Supply</div>
                </div>

                {/* Creator */}
                <div className="col-span-2">
                    <div className="text-yellow-400 font-medium truncate" title={token.xUser}>
                        {token.xUser}
                    </div>
                    <div className="text-gray-500 text-xs">Creator</div>
                </div>

                {/* Contract Address */}
                <div className="col-span-2">
                    <div className="text-gray-300 font-mono text-xs" title={token.tokenAddress}>
                        {shortenAddress(token.tokenAddress)}
                    </div>
                    <div className="text-gray-500 text-xs">Contract</div>
                </div>

                {/* X Link */}
                <div className="col-span-1">
                    {token.xUrl ? (
                        <a
                            href={token.xUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 transition-colors relative group"
                            title="View on X.com"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                            {/* 簡單的 tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                {token.xUrl}
                            </div>
                        </a>
                    ) : (
                        <div className="text-gray-600">-</div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="col-span-2 flex gap-2">
                    <Link
                        to={`/connect-wallet?token=${token.tokenAddress}&index=${index}`}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs px-2 py-1 rounded-md font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/50 whitespace-nowrap"
                    >
                        Claim
                    </Link>
                    <Link
                        to={`/trade?token=${token.tokenAddress}&name=${encodeURIComponent(token.tokenName)}&symbol=${encodeURIComponent(token.tokenSymbol)}`}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-xs px-2 py-1 rounded-md font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/50 whitespace-nowrap"
                    >
                        Trade
                    </Link>
                </div>
            </div>
        </div>
    );
};

// 組件用於獲取單個token數據
const TokenFetcher = ({
    index,
    onTokenFetched
}: {
    index: number;
    onTokenFetched: (token: Token, index: number) => void;
}) => {
    const { data: tokenData } = useReadContract({
        address: TOKEN_FACTORY_ADDRESS,
        abi: TOKEN_FACTORY_ABI,
        functionName: "tokens",
        args: [BigInt(index)],
    });

    useEffect(() => {
        if (tokenData && Array.isArray(tokenData) && tokenData.length === 6) {
            const [tokenAddress, tokenName, tokenSymbol, totalSupply, xUrl, xUser] = tokenData;
            // 確保 xUrl 是有效的 Twitter/X 鏈接
            const validXUrl = (xUrl as string)?.startsWith('https://twitter.com/') || (xUrl as string)?.startsWith('https://x.com/') ? xUrl as string : '';

            const token: Token = {
                tokenAddress: tokenAddress as string,
                tokenName: tokenName as string,
                tokenSymbol: tokenSymbol as string,
                totalSupply: totalSupply as bigint,
                xUrl: validXUrl,
                xUser: xUser as string,
            };

            onTokenFetched(token, index);
        }
    }, [tokenData, index, onTokenFetched]);

    return null; // 這個組件不渲染任何內容
};

export const TokenList = () => {
    const [tokens, setTokens] = useState<Token[]>([]);
    const [fetchedIndices, setFetchedIndices] = useState<Set<number>>(new Set());

    // 獲取token數量
    const { data: tokenCount, isLoading: isLoadingCount } = useReadContract({
        address: TOKEN_FACTORY_ADDRESS,
        abi: TOKEN_FACTORY_ABI,
        functionName: "tokenCount",
    });

    const handleTokenFetched = (token: Token, index: number) => {
        if (!fetchedIndices.has(index)) {
            setTokens(prev => {
                const newTokens = [...prev];
                newTokens[index] = token;
                return newTokens;
            });
            setFetchedIndices(prev => new Set(prev).add(index));
        }
    };

    // 重置tokens當tokenCount改變
    useEffect(() => {
        if (tokenCount) {
            setTokens([]);
            setFetchedIndices(new Set());
        }
    }, [tokenCount]);

    if (isMobile) {
        return (
            <p className="text-red-400 w-full block mt-3">
                Mobile is not supported. <br /> Please use desktop browser.
            </p>
        );
    }

    if (isLoadingCount) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-white text-xl">🎮 Loading tokens...</div>
            </div>
        );
    }

    if (!tokenCount || Number(tokenCount) === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-6">
                <div className="text-center">
                    <div className="text-6xl mb-4">🎮</div>
                    <div className="text-white text-xl mb-2">No tokens available yet!</div>
                    <div className="text-gray-400">Be the first creator to mint a token</div>
                </div>
                <Link
                    to="welcome"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/50"
                >
                    🚀 Create First Token
                </Link>
            </div>
        );
    }

    const count = Number(tokenCount);

    return (
        <div className="w-full h-full flex flex-col">
            {/* 創建TokenFetcher組件來獲取每個token */}
            {Array.from({ length: count }, (_, index) => (
                <TokenFetcher
                    key={index}
                    index={index}
                    onTokenFetched={handleTokenFetched}
                />
            ))}
            {/* Table Header */}
            <div className="bg-gray-900/50 border-b border-gray-700/50">
                <div className="grid grid-cols-12 gap-4 items-center py-3 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <div className="col-span-1">#</div>
                    <div className="col-span-2">Token</div>
                    <div className="col-span-2">Supply</div>
                    <div className="col-span-2">Creator</div>
                    <div className="col-span-2">Contract</div>
                    <div className="col-span-1">Social</div>
                    <div className="col-span-2">Actions</div>
                </div>
            </div>

            {/* Loading state */}
            {tokens.length === 0 && !isLoadingCount && (
                <div className="flex justify-center items-center h-32">
                    <div className="text-gray-400 text-lg">⏳ Loading token details...</div>
                </div>
            )}

            {/* Token List */}
            <div className="flex-1 overflow-auto">
                {tokens.map((token, index) => (
                    token && <TokenRow key={index} token={token} index={index} />
                ))}
            </div>


        </div>
    );
}; 