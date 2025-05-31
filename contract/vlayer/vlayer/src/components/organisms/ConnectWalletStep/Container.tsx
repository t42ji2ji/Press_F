import { useAppKit } from "@reown/appkit/react";
import { useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAccount } from "wagmi";
import { useExtension } from "../../../hooks/useExtension";
import { useModal } from "../../../hooks/useModal";
import { ConnectWalletStepPresentational } from "./Presentational";

const useConnectWallet = () => {
  const { open: openWallet } = useAppKit();
  const { closeModal, showModal } = useModal();
  const { hasExtensionInstalled } = useExtension();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const account = useAccount();

  const isWalletConnected = account.isConnected;

  const next = useCallback(() => {
    const token = searchParams.get("token");
    const tokenParam = token ? `?token=${token}` : "";

    if (hasExtensionInstalled) {
      void navigate(`/start-proving${tokenParam}`);
    } else {
      void navigate(`/install-extension${tokenParam}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasExtensionInstalled, searchParams]);

  const connectWallet = async () => {
    await openWallet();
    closeModal();
  };

  useEffect(() => {
    showModal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWalletConnected]);

  return {
    next,
    connectWallet,
    isWalletConnected,
  };
};

export const ConnectWalletStep = () => {
  const { isWalletConnected, next, connectWallet } = useConnectWallet();
  return (
    <ConnectWalletStepPresentational
      isWalletConnected={isWalletConnected}
      next={next}
      connectWallet={() => void connectWallet()}
    />
  );
};
