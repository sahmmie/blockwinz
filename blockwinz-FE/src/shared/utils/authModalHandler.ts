import { ModalProps } from "@/hooks/useModal";
import Authentication from "@/pages/Auth/Authentication";
import React from "react";

let showLoginModalFn: (() => void) | null = null;

export function registerLoginModalOpener(opener: (content: React.ReactNode, title?: string, props?: ModalProps) => void) {
  showLoginModalFn = () => {
    const modalConfig: ModalProps = {
      size: 'xl',
      hideCloseButton: false,
      hideHeader: true,
      width: { base: '90%', md: 'full' },
      backgroundColor: '#000A27',
      height: '840px',
      autoCloseAfter: 0,
      backdrop: true,
      scrollBehavior: 'inside',
    };
    opener(React.createElement(Authentication), undefined, modalConfig);
  };
}

export function showLoginModal() {
  if (showLoginModalFn) {
    showLoginModalFn();
  } else {
   throw new Error("Login modal opener not registered");
  }
} 