import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useExtension } from "../../../hooks/useExtension";
import { InstallExtensionPresentational } from "./Presentationa";

export const InstallExtension = () => {
  const { hasExtensionInstalled } = useExtension();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (hasExtensionInstalled) {
      // 保留 URL 參數
      const token = searchParams.get("token");
      const tokenParam = token ? `?token=${token}` : "";
      void navigate(`/start-proving${tokenParam}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasExtensionInstalled, searchParams]);

  return <InstallExtensionPresentational />;
};
