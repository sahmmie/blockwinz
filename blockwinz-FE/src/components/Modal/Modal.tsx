import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@/components/ui/dialog';
import useModal from '@/hooks/useModal';
import { FunctionComponent, useEffect } from 'react';

interface ModalProps {}

const Modal: FunctionComponent<ModalProps> = () => {
  const { isOpen, closeModal, title, content, props } = useModal();

  // Auto-close the modal if autoCloseAfter is passed (value in seconds)
  useEffect(() => {
    if (isOpen && props?.autoCloseAfter) {
      const timer = setTimeout(() => {
        closeModal();
      }, props.autoCloseAfter * 1000);

      // Cleanup to prevent memory leaks
      return () => clearTimeout(timer);
    }
  }, [isOpen, props?.autoCloseAfter, closeModal]);

  const closeOnClickInside = () => {
    if (props?.closeOnInteractInside) {
      closeModal();
    }
  };

  return (
    <DialogRoot
      motionPreset={'slide-in-top'}
      placement='center'
      lazyMount
      size={props?.size || 'lg'}
      open={isOpen}
      scrollBehavior={props?.scrollBehavior || 'inside'}
      closeOnInteractOutside={props?.closeOnInteractOutside}
      closeOnEscape={props?.closeOnEscape}
      unmountOnExit>
      <DialogContent
        cursor={props?.closeOnInteractInside ? 'pointer' : 'auto'}
        backdrop={props?.backdrop}
        w={props?.width}
        backgroundColor={props?.backgroundColor}
        top={props?.top}
        left={props?.left}
        right={props?.right}
        bottom={props?.bottom}
        h={props?.height}
        onClick={closeOnClickInside}>
        {props?.hideCloseButton ? null : (
          <DialogCloseTrigger onClick={() => closeModal()} />
        )}
        {props?.hideHeader ? null : (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        )}
        <DialogBody padding='0px'>{content}</DialogBody>
      </DialogContent>
    </DialogRoot>
  );
};

export default Modal;
