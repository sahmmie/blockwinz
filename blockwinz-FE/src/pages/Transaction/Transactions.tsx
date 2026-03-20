import { FunctionComponent, useEffect, useState } from 'react';
import { Box } from '@chakra-ui/react';
import { Button } from '@/components/ui/button';
import axiosInstance from '@/lib/axios';
import { AxiosResponse } from 'axios';
import { useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { PaginatedDataI } from '@/shared/interfaces/pagination.interface';
import { toaster } from '@/components/ui/toaster';
import TransactionsTable from './components/TransactionsTable';
import { TransactionHistoryT } from './TransactionHistory.type';

interface TransactionsProps {}

const Transactions: FunctionComponent<TransactionsProps> = () => {
  const buttons: string[] = ['Deposit', 'Withdraw', 'Tip'];
  const [selectedButton, setSelectedButton] = useState(buttons[0]);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalCount, setTotalCount] = useState(0);
  const queryClient = useQueryClient()

  const getTransactionHistory = async (): Promise<
    AxiosResponse<PaginatedDataI<TransactionHistoryT>>
  > => {
    return await axiosInstance.get(
      `/transaction/getTransactions?type=${selectedButton.toLowerCase()}&limit=${limit}&page=${page}`,
    );
  };

  const {
    data: transactionHistory,
    isLoading: loadingTransactionHistory,
    isError: errorLoadingTransactionHistory,
    refetch: refetchTransactionHisytory,
    isSuccess: successLoadingTransactionHistory,
  }: UseQueryResult<
    { data: PaginatedDataI<TransactionHistoryT> },
    Error
  > =  useQuery(
    ['transactionHistory', selectedButton, page, limit],
    () => getTransactionHistory(),
    {
      retry: 3,
      refetchOnWindowFocus: false,
      keepPreviousData: false,
    });

  useEffect(() => {
    // Reset page to 1 if selected button changes
    if (selectedButton) {
      setPage(1);
      queryClient.clear()
    }
    refetchTransactionHisytory();
  }, [page, queryClient, refetchTransactionHisytory, selectedButton]);

  useEffect(() => {
    if (errorLoadingTransactionHistory && !loadingTransactionHistory) {
      setTotalCount(0);
      toaster.create({
        description: 'Error loading Transaction History',
        type: 'error',
        title: 'Transaction History',
      });
    }
  }, [
    successLoadingTransactionHistory,
    errorLoadingTransactionHistory,
    loadingTransactionHistory,
  ]);

  return (
    <>
      <Box
        mt={'24px'}
        bg={'#151832'}
        w={'100%'}
        px={'10px'}
        borderTopRadius={'20px'}
        pt={'24px'}>
        <Box display={'flex'} alignItems={'center'} gap={'18px'} mb={'16px'}>
          {buttons.map((button, index) => (
            <Button
              key={index}
              bg={selectedButton === button ? '#00DD25' : '#151832'}
              color={selectedButton === button ? '#151832' : '#FFFFFF'}
              size={'lg'}
              onClick={() => setSelectedButton(button)}>
              {button}
            </Button>
          ))}
        </Box>
        <Box>
          <TransactionsTable
            items={transactionHistory?.data.result || []}
            page={page}
            pageSize={limit}
            totalCount={totalCount}
            setPage={setPage}
          />
        </Box>
      </Box>
    </>
  );
};

export default Transactions;
