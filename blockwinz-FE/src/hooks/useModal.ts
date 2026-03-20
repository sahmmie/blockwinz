import { ConditionalValue, DialogContentProps, DialogRootProps } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { create } from 'zustand';

export type ModalProps = Partial<DialogRootProps> & {
  hideCloseButton?: boolean;
  hideHeader?: boolean;
  width?: ConditionalValue<unknown>;
  autoCloseAfter?: number; // Timeout in seconds
  closeOnInteractInside?: boolean;
  backdrop?: boolean;
} & DialogContentProps;

interface ModalState {
  isOpen: boolean;
  title: ReactNode;
  content: ReactNode;
  openModal: (content: ReactNode, title?: string, props?: ModalProps) => void;
  closeModal: () => void;
  props?: ModalProps;
}

const useModal = create<ModalState>((set) => ({
  isOpen: false,
  title: '',
  content: '',
  props: undefined,
  openModal: (content: ReactNode, title?: string, props?: ModalProps) => {
    set({ isOpen: true, title, content, props });
  },
  closeModal: () => {
    set({ isOpen: false, title: '', content: '', props: undefined });
  },
}));

export default useModal;