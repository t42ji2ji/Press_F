import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAccount } from "wagmi";
import { useTwitterAccountProof } from "../../../hooks/useTwitterAccountProof";
import { ProveStepPresentational } from "./Presentational";

export const ProveStep = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { address } = useAccount();
  const [disabled, setDisabled] = useState(false);
  const modalRef = useRef<HTMLDialogElement>(null);

  const {
    requestWebProof,
    webProof,
    callProver,
    isPending,
    isCallProverIdle,
    result,
    error,
  } = useTwitterAccountProof();

  useEffect(() => {
    if (webProof && isCallProverIdle) {
      void callProver([webProof, address]);
    }
  }, [webProof, address, callProver, isCallProverIdle]);

  useEffect(() => {
    if (result) {
      const token = searchParams.get("token");
      const tokenParam = token ? `?token=${token}` : "";
      void navigate(`/mint${tokenParam}`);
    }
  }, [result, navigate, searchParams]);

  useEffect(() => {
    modalRef.current?.showModal();
  }, []);

  useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return (
    <ProveStepPresentational
      requestWebProof={requestWebProof}
      isPending={isPending}
      disabled={disabled}
      setDisabled={setDisabled}
    />
  );
};
