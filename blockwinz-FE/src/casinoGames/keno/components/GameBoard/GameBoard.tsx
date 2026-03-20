import { Box, Flex, SimpleGrid } from '@chakra-ui/react';
import React, { useLayoutEffect } from 'react';
import { useSound } from '../../hooks/useSound';
import MultiplierBoxes from './MultiplierBoxes';
import { SelectNumbersToPlay } from './SelectNumberToPlay';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useKenoGameContext } from '../../context/KenoGameContext';
import { GameButton } from '../GameButtons';
import GameStatusModal, {
  GameStatusModalProps,
  modalConfig,
} from '@/components/Modal/GameStatusModal';
import useModal from '@/hooks/useModal';
import useWalletState from '@/hooks/useWalletState';
import { Currency } from '@blockwinz/shared';
import GoldCoinIcon from 'assets/icons/gold-coin-icon.svg';

const GameBoard: React.FC = () => {
  const {
    isBetting,
    isAutoBetting,
    selectedNumbers,
    selectNumber,
    betResponse,
    riskDropdownValue,
  } = useKenoGameContext();
  const { play } = useSound();
  const { openModal, closeModal } = useModal();
  const { selectedBalance } = useWalletState();

  const isMobile = useIsMobile();

  useLayoutEffect(() => {
    const props: GameStatusModalProps = {
      title: `x${betResponse.multiplier.toFixed(2)}`,
      winAmount: betResponse.totalWinAmount,
      currency: selectedBalance?.currency as Currency,
      rightText: `${betResponse.hits}`,
      rightIcon: GoldCoinIcon,
    };

    if (betResponse.result.length === 10 && betResponse.status === 'win') {
      play('score');
      openModal(<GameStatusModal {...props} />, undefined, modalConfig);
    } else {
      closeModal();
    }
  }, [betResponse.result, betResponse.status]);

  const renderGameButton = (number: number) => {
    const isSelected = selectedNumbers.includes(number);
    const isResult = betResponse.result.includes(number);
    const isDisabled =
      !isSelected && selectedNumbers.length === 10 && !isResult;
    const isInteractive = !isBetting && !isAutoBetting;

    let buttonType: 'default' | 'win' | 'loss' | undefined;
    let onClick: (() => void) | undefined = () => {
      if (!isBetting) selectNumber(number);
    };

    let cursorStyle: string | undefined = 'pointer';

    if (isDisabled || !isInteractive) {
      onClick = undefined;
      cursorStyle = 'default';
    }

    if (betResponse.result.length > 0) {
      if (isSelected && isResult) {
        buttonType = 'win';
      } else if (!isSelected && isResult) {
        buttonType = 'loss';
        onClick = undefined;
        cursorStyle = 'default';
      }
    }

    return (
      <GameButton
        key={number}
        number={number}
        isSelected={isSelected}
        isInteractive={isInteractive}
        buttonType={buttonType}
        onClick={onClick}
        disabled={isDisabled}
        style={{ cursor: cursorStyle }}
      />
    );
  };

  const renderGameButtonsGrid = () => (
    <Box width='100%' maxWidth='756px' height='100%'>
      <SimpleGrid
        columns={8}
        gap='12px'
        width='100%'
        aspectRatio='8/5'
        gapY={'18px'}>
        {Array.from({ length: 40 }, (_, i) => renderGameButton(i + 1))}
      </SimpleGrid>
    </Box>
  );

  const renderBottomContent = () => (
    <Flex
      py={{ base: '28px', md: '28px' }}
      px={{ md: '10px' }}
      justifyContent='center'>
      {selectedNumbers.length === 0 ? (
        <SelectNumbersToPlay />
      ) : (
        <MultiplierBoxes
          selectedNumbers={selectedNumbers.length}
          risk={riskDropdownValue}
        />
      )}
    </Flex>
  );

  // TODO: Add MaxPayoutModal
  // const renderMaxProfitModal = () => {
  //   if (showMaxProfitModal) {
  //     return (
  //       <MaxPayoutModal onClose={() => setShowMaxProfitModal(false)} isOpen={showMaxProfitModal} />
  //     )
  //   }
  // }

  return (
    <Box display='flex' flexDir='column'>
      <Box width='100%' p={isMobile ? '16px 16px 0px 16px' : '32px 16px 24px 16px'}>
        <Flex justifyContent='center' position='relative'>
          {renderGameButtonsGrid()}
        </Flex>
        {renderBottomContent()}
      </Box>
    </Box>
  );
};

export default GameBoard;
