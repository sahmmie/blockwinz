import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from '@/components/ui/pagination';
import { currencyIconMap } from '@/shared/utils/gameMaps';
import { Box, HStack, Table, Text } from '@chakra-ui/react';
import { FunctionComponent, useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { formatDate } from '@/shared/utils/common';
import { TransactionHistoryT } from '../TransactionHistory.type';
import {
  DEFAULT_CURRENCY,
  DEFAULT_ROUNDING_DECIMALS,
} from '@/shared/constants/app.constant';
import useWalletState from '@/hooks/useWalletState';

interface TransactionsTableProps {
  items: TransactionHistoryT[];
  pageSize: number;
  page: number;
  totalCount: number;
  setPage: (page: number) => void;
  showPagination?: boolean;
}

const TransactionsTable: FunctionComponent<TransactionsTableProps> = ({
  items,
  pageSize,
  page,
  totalCount,
  setPage,
  showPagination = true,
}) => {
const { balances } = useWalletState();
  const isMobile = useIsMobile();
  const [activeColumn, setActiveColumn] = useState<string[]>([]);

  useEffect(() => {
    if (isMobile) {
      setActiveColumn(['Date & Time', 'Amount', 'Status']);
    } else {
      setActiveColumn(['Date & Time', 'Amount', 'Status']);
    }
  }, [isMobile]);

  const mapStatus = (status: string) => {
    switch (status) {
      case 'settled':
        return (
          <Table.Cell p={'12px'} color={'#00DD25'}>
            Successful
          </Table.Cell>
        );
      case 'failed':
        return (
          <Table.Cell p={'12px'} color={'#F43B51'}>
            Failed
          </Table.Cell>
        );
      case 'cancelled':
        return (
          <Table.Cell p={'12px'} color={'#939494'}>
            Cancelled
          </Table.Cell>
        );
      default:
        return <Table.Cell p={'12px'}>Pending</Table.Cell>;
    }
  };

  const renderTable = () => {
    return items.map((item, index) => (
      <Table.Row
        lineHeight={'24px'}
        fontSize={'16px'}
        cursor={'pointer'}
        _hover={{ bg: '#545463' }}
        color={'#ECF0F1'}
        w={'100%'}
        key={item._id}
        bg={index % 2 === 0 ? '#000A27' : '#151832'}>
        <Table.Cell p={'12px'}>
          {formatDate(new Date(item?.createdAt))}
        </Table.Cell>
        <Table.Cell
          p={'12px'}
          display={'flex'}
          alignItems={'center'}
          gap={'8px'}>
          <img
            src={
              currencyIconMap[item.currency as keyof typeof currencyIconMap] ||
              currencyIconMap[DEFAULT_CURRENCY]
            }
            alt=''
            style={{ width: '24px', height: '24px' }}
          />
          {item?.transactionAmount?.toFixed(
            balances.find(c => c.currency === item.currency)
              ?.decimals || DEFAULT_ROUNDING_DECIMALS,
          )}
        </Table.Cell>
        {mapStatus(item.status)}
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
            <Text fontWeight={600} fontSize={{ md: '20px', base: '16px' }}>
              Transaction History Is Empty
            </Text>
          </Box>
          <Box mb={'28px'} pb={'180px'}>
            <Text fontWeight={500} fontSize={{ md: '16px', base: '14px' }}>
              Make a deposit or withdrawal to see your transaction history.
            </Text>
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

export default TransactionsTable;
