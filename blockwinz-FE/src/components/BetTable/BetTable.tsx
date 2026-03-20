import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from '@/components/ui/pagination';
import { currencyIconMap } from '@/shared/utils/gameMaps';
import { Box, HStack, Table, Text } from '@chakra-ui/react';
import { FunctionComponent, useEffect, useState } from 'react';
import { BetHistoryT } from '../../pages/BetHistory/BetHistory.type';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { originalGamesInfo } from '@/shared/constants/originalGamesInfo.constant';
import { useIsMobile } from '@/hooks/useIsMobile';
import { formatDate } from '@/shared/utils/common';
import useModal, { ModalProps } from '@/hooks/useModal';
import BetDetails from '../BetDetails/BetDetails';
import { BetTableType } from '@/casinoGames/bets/Bets';
import { UserI } from '@/shared/interfaces/account.interface';
import { useSeedPair } from '@/hooks/useSeedPair';
import useAuth from '@/hooks/useAuth';
import { DEFAULT_ROUNDING_DECIMALS } from '@/shared/constants/app.constant';
import useWalletState from '@/hooks/useWalletState';

interface BetTableProps {
  items: BetHistoryT[];
  pageSize: number;
  page: number;
  totalCount: number;
  setPage: (page: number) => void;
  showPagination?: boolean;
  betTableType?: BetTableType;
}

const BetTable: FunctionComponent<BetTableProps> = ({
  items,
  pageSize,
  page,
  totalCount,
  setPage,
  showPagination = true,
  betTableType = BetTableType.MY_BETS,
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeColumn, setActiveColumn] = useState<string[]>([]);
  const { getActiveSeedPair, activeSeedPair } = useSeedPair();
  const { openModal } = useModal();
  const { isAuthenticated } = useAuth();
  const { balances } = useWalletState();

  useEffect(() => {
    if (!activeSeedPair && isAuthenticated) {
      getActiveSeedPair();
    }
  }, [activeSeedPair]);

  useEffect(() => {
    if (isMobile) {
      setActiveColumn(['Game', 'Multiplier', 'Payout']);
    } else {
      if (betTableType === BetTableType.MY_BETS) {
        setActiveColumn([
          'Game',
          'Date & Time',
          'Bet Amount',
          'Multiplier',
          'Payout',
          'Bet ID',
        ]);
      } else {
        setActiveColumn([
          'Game',
          'Date & Time',
          'Bet Amount',
          'Multiplier',
          'Payout',
          'User',
        ]);
      }
    }
  }, [isMobile, betTableType]);

  const handleClick = (item: BetHistoryT) => {
    const modalConfig: ModalProps = {
      size: 'lg',
      hideCloseButton: false,
      hideHeader: true,
      width: { base: '90%', md: '700px' },
      backgroundColor: '#000A27',
      autoCloseAfter: 0,
      left: { base: '0', md: '20' },
      backdrop: true,
      scrollBehavior: 'inside',
    };

    openModal(<BetDetails betDetails={item} />, undefined, modalConfig);
  };

  const renderTable = () => {
    return items.map((item, index) => (
      <Table.Row
        onClick={() => handleClick(item)}
        lineHeight={'24px'}
        fontSize={'16px'}
        cursor={'pointer'}
        _hover={{ bg: '#545463' }}
        color={'#ECF0F1'}
        w={'100%'}
        key={item._id}
        bg={index % 2 === 0 ? '#000A27' : '#151832'}>
        <Table.Cell
          p={'12px'}
          display={'flex'}
          alignItems={'center'}
          gap={'8px'}>
          <img
            src={originalGamesInfo[item?.gameType]?.image}
            alt=''
            style={{ width: '24px', height: '24px' }}
          />
          {originalGamesInfo[item?.gameType]?.name}
        </Table.Cell>
        {!isMobile && (
          <Table.Cell p={'12px'}>{formatDate(item?.createdAt)}</Table.Cell>
        )}
        {!isMobile && (
          <Table.Cell
            p={'12px'}
            display={'flex'}
            alignItems={'center'}
            gap={'8px'}>
            <img
              src={currencyIconMap[item?.gameId?.currency]}
              alt=''
              style={{ width: '24px', height: '24px' }}
            />
            {item?.gameId?.betAmount.toFixed(
              balances.find(c => c.currency === item.gameId.currency)
                ?.decimals || DEFAULT_ROUNDING_DECIMALS,
            )}
          </Table.Cell>
        )}
        <Table.Cell p={'12px'} textAlign={{ md: 'left', base: 'center' }}>
          {item?.gameId?.multiplier}
        </Table.Cell>
        <Table.Cell
          p={'12px'}
          display={'flex'}
          alignItems={'center'}
          gap={'8px'}
          color={item?.gameId?.totalWinAmount > 0 ? '#00DD25' : '#939494'}>
          <img
            src={currencyIconMap[item?.gameId?.currency]}
            alt=''
            style={{ width: '24px', height: '24px' }}
          />
          {item?.gameId?.totalWinAmount?.toFixed(
            balances.find(c => c.currency === item.gameId.currency)?.decimals ||
              DEFAULT_ROUNDING_DECIMALS,
          )}
        </Table.Cell>
        {!isMobile && betTableType === BetTableType.MY_BETS && (
          <Table.Cell p={'12px'}>{item?._id}</Table.Cell>
        )}
        {!isMobile && (
          <Table.Cell p={'12px'}>{(item?.user as UserI)?.username}</Table.Cell>
        )}
      </Table.Row>
    ));
  };

  const renderNoData = () => {
    return (
      <>
        <Box
          mt={'140px'}
          display={'flex'}
          flexDir={'column'}
          alignItems={'center'}
          justifyContent={'center'}
          w={'100%'}
          height={'100%'}>
          <Box mb={'14px'}>
            <Text fontWeight={600} fontSize={{ md: '24px', base: '20px' }}>
              Bet History Is Empty
            </Text>
          </Box>
          <Box mb={'28px'}>
            <Text fontWeight={500} fontSize={{ md: '20px', base: '16px' }}>
              Check out toady’s action to make a bet.
            </Text>
          </Box>
          <Box pb={'180px'}>
            <Button
              bg={'#00DD25'}
              color={'#151832'}
              size={{ md: 'lg', base: 'md' }}
              onClick={() => navigate('/originals')}>
              View Popular Games
            </Button>
          </Box>
        </Box>
      </>
    );
  };

  return (
    <>
      <Table.Root
        interactive
        size='lg'
        showColumnBorder={false}
        unstyled
        w={'100%'}
        h={'100%'}
        bg={'#151832'}>
        <Table.Header borderBottom={'.4px solid #ECF0F1'}>
          <Table.Row
            textAlign={'left'}
            fontSize={'18px'}
            fontWeight={'400'}
            lineHeight={'24px'}>
            {activeColumn.map((column, index) => (
              <Table.ColumnHeader pb={'10px'} key={index} p={'12px'}>
                {column}
              </Table.ColumnHeader>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>{items.length > 0 && renderTable()}</Table.Body>
      </Table.Root>
      {items.length < 1 && renderNoData()}
      {items.length > 0 && showPagination && (
        <Box w={'100%'} py={'40px'} display={'flex'} justifyContent={'center'}>
          <PaginationRoot
            count={totalCount}
            pageSize={pageSize}
            page={page}
            onPageChange={e => setPage(e.page)}>
            <HStack wrap='wrap'>
              <PaginationPrevTrigger />
              <PaginationItems />
              <PaginationNextTrigger />
            </HStack>
          </PaginationRoot>
        </Box>
      )}
    </>
  );
};

export default BetTable;
