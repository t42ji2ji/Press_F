import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  useAccount,
  useBalance,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import { useLocalStorage } from "usehooks-ts";

import pumpFunArtifact from "../../../../../artifacts/PumpFun.json";
import { ensureBalance } from "../../../utils/ethFaucet";
import { MintStepPresentational } from "./Presentational";

// 臨時合約地址 - 實際部署時需要從環境變量獲取
const PUMPFUN_ADDRESS = import.meta.env.VITE_PUMPFUN_ADDRESS || "0xD570bF4598D3ccF214E288dd92222b8Bd3134984";

export const MintStep = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const modalRef = useRef<HTMLDialogElement>(null);
  const [mintedHandle, setMintedHandle] = useState<string | null>(null);
  const [isCollecting, setIsCollecting] = useState(false);
  // Using collectingError state to throw error in useEffect because ErrorBoundary does not catch errors from async functions like handleCollect
  const [collectingError, setCollectingError] = useState<Error | null>(null);
  const [proverResult] = useLocalStorage("proverResult", "");

  // 從 URL 參數中獲取 tokenAddress
  const selectedTokenAddress = searchParams.get("token") || "";

  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const { writeContract, data: txHash, error } = useWriteContract();
  const { status } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    console.log("Component mounted with data:", {
      proverResult: proverResult ? `"${proverResult}"` : "empty",
      proverResultType: typeof proverResult,
      proverResultLength: proverResult?.length || 0,
      selectedTokenAddress,
      pumpFunAddress: PUMPFUN_ADDRESS,
    });



    if (proverResult) {
      try {
        // 檢查是否為空字符串或無效格式
        if (!proverResult.trim()) {
          throw new Error("Prover result is empty");
        }

        const result = JSON.parse(proverResult) as Parameters<
          typeof writeContract
        >[0]["args"];

        console.log("Parsed result:", result);

        // 增強檢查：確保 result 是有效數組且有足夠的元素
        if (!result || !Array.isArray(result) || result.length < 2 || typeof result[1] !== "string") {
          throw new Error(
            "Serialized prover result from local storage is invalid - expected array with at least 2 elements where element 1 is a string",
          );
        }
        setMintedHandle(result[1]);
      } catch (error) {
        console.error("Failed to parse prover result:", error);
        console.error("Raw prover result that failed to parse:", JSON.stringify(proverResult));
        throw new Error(`Failed to parse prover result: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    modalRef.current?.showModal();
  }, [proverResult, selectedTokenAddress]);

  const handleCollect = async () => {
    console.log("handleCollect started");
    setIsCollecting(true);

    console.log("Debug info:", {
      proverResult: proverResult ? `"${proverResult}"` : "empty",
      selectedTokenAddress,
      hasProverResult: !!proverResult,
      hasSelectedTokenAddress: !!selectedTokenAddress,
      urlTokenParam: searchParams.get("token"),
      pumpFunAddress: PUMPFUN_ADDRESS,
    });

    if (!proverResult || !selectedTokenAddress) {
      console.error("Missing required data:", {
        hasProverResult: !!proverResult,
        hasSelectedTokenAddress: !!selectedTokenAddress,
        urlTokenParam: searchParams.get("token")
      });
      setIsCollecting(false);
      return;
    }

    try {
      let proofData;
      try {
        proofData = JSON.parse(proverResult) as Parameters<
          typeof writeContract
        >[0]["args"];
      } catch (parseError) {
        throw new Error(`Failed to parse proof data: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
      }

      // 檢查 proofData 是否有效
      if (!proofData) {
        throw new Error("Invalid proof data: proof is null or undefined");
      }

      // 檢查 proof 是否有必要的結構（vlayer Proof 通常有 seal, callGuestId 等字段）
      if (typeof proofData !== 'object') {
        throw new Error("Invalid proof data: expected object structure");
      }

      console.log("proofData", proofData[0]);
      console.log("selectedTokenAddress", selectedTokenAddress);


      // collectFees(address token, Proof calldata proof)
      // 第一個參數是 token address，第二個參數是 proof
      const writeContractArgs: Parameters<typeof writeContract>[0] = {
        address: PUMPFUN_ADDRESS as `0x${string}`,
        abi: pumpFunArtifact.abi,
        functionName: "collectFees",
        args: [selectedTokenAddress, proofData[0]],
      };

      try {
        await ensureBalance(address as `0x${string}`, balance?.value ?? 0n);
      } catch (error) {
        setCollectingError(error as Error);
        return;
      }

      console.log("writeContractArgs", writeContractArgs);

      writeContract(writeContractArgs);
    } catch (error) {
      console.error("Failed to prepare contract call:", error);
      setCollectingError(new Error(`Failed to prepare contract call: ${error instanceof Error ? error.message : String(error)}`));
    }
  };

  useEffect(() => {
    if (status === "success") {
      setIsCollecting(false);
      void navigate(`/success?tx=${txHash}&handle=${mintedHandle}`);
    }
  }, [status, txHash, mintedHandle, navigate]);

  useEffect(() => {
    if (error) {
      setIsCollecting(false);
      const errorMessage = error.message || error.toString() || "Unknown error";

      if (errorMessage.includes("No fees to collect")) {
        throw new Error("No fees available to collect for this token.");
      } else if (errorMessage.includes("Not authorized")) {
        throw new Error("You are not authorized to collect fees for this token.");
      } else {
        throw new Error(errorMessage);
      }
    }
  }, [error]);

  useEffect(() => {
    if (collectingError) {
      setIsCollecting(false);
      throw collectingError;
    }
  }, [collectingError]);

  return (
    <MintStepPresentational
      handleMint={() => void handleCollect()}
      isMinting={isCollecting}
    />
  );
};
