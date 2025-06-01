// Layout.js
import { Outlet } from "react-router";
import { Modal } from "./Modal";
import {
  OverlayProvider,
  useOverlay,
  TweetModal,
} from "../organisms/TokenListStep/TokenList";

const LayoutInner = () => {
  const { overlay } = useOverlay();
  return (
    <Modal overlays={<TweetModal />}>
      <Outlet />
    </Modal>
  );
};

export const Layout = () => {
  return (
    <OverlayProvider>
      <LayoutInner />
    </OverlayProvider>
  );
};
