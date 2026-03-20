import { FunctionComponent, useEffect, useState } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { Button } from '@/components/ui/button';
import BetHistoryIcon from 'assets/icons/my-bets-icon.svg';
import axiosInstance from '@/lib/axios';
import { AxiosResponse } from 'axios';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { PaginatedDataI } from '@/shared/interfaces/pagination.interface';
import { BetHistoryT } from './BetHistory.type';
import { toaster } from '@/components/ui/toaster';
import BetTable from '@/components/BetTable/BetTable';
import usePageData from '@/hooks/usePageData';
import { GameCategoryEnum } from '@/shared/enums/gameType.enum';

interface BetHistoryProps {}

const BetHistory: FunctionComponent<BetHistoryProps> = () => {
  const { selectedSegment } = usePageData();
  const [activeTab, setActiveTab] = useState(selectedSegment);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const tabs = [
    {
      label: 'Originals',
      value: GameCategoryEnum.ORIGINALS,
    },
    {
      label: 'Multiplayer',
      value: GameCategoryEnum.MULTIPLAYER,
    },
  ];

  useEffect(() => {
    setActiveTab(selectedSegment);
  }, [selectedSegment]);

  const getBetHistory = async (): Promise<
    AxiosResponse<PaginatedDataI<BetHistoryT>>
  > => {
    return await axiosInstance.get(`/bet-history?page=${page}&limit=${limit}`);
  };

  const {
    data: betHistory,
    isLoading: loadingBetHistory,
    isError: errorLoadingBetHistory,
    refetch: refetchBetHisytory,
    isSuccess: successLoadingBetHistory,
  }: UseQueryResult<{ data: PaginatedDataI<BetHistoryT> }, Error> = useQuery(
    ['activeGame'],
    () => getBetHistory(),
    {
      retry: 3,
      refetchOnWindowFocus: false,
    },
  );

  useEffect(() => {
    refetchBetHisytory();
  }, [page]);

  useEffect(() => {
    if (successLoadingBetHistory) {
      setTotalCount(betHistory?.data.total);
    }
    if (errorLoadingBetHistory && !loadingBetHistory) {
      setTotalCount(0);
      toaster.create({
        description: 'Error loading bet history',
        type: 'error',
        title: 'Bet History',
      });
    }
  }, [successLoadingBetHistory, errorLoadingBetHistory, loadingBetHistory]);

  return (
    <>
      <Box
        mt={'24px'}
        bg={'#151832'}
        w={'100%'}
        px={'10px'}
        borderTopRadius={'20px'}>
        <Box display={'flex'} alignItems={'center'} py={'24px'} ml={'4px'}>
          <img
            src={BetHistoryIcon}
            alt='Bet History Icon'
            style={{ width: '22px', height: '22px' }}
          />
          <Text
            fontWeight={'500'}
            fontSize={'18px'}
            lineHeight={'24px'}
            ml={'8px'}>
            Bet History
          </Text>
        </Box>
        <Box display={'flex'} alignItems={'center'} gap={'18px'} mb={'16px'}>
          {tabs.map((tab, index) => (
            <Button
              onClick={() => setActiveTab(tab.value)}
              key={`${tab.value}-${index}`}
              bg={activeTab === tab.value ? '#00DD25' : '#4A445A99'}
              color={activeTab === tab.value ? '#151832' : '#FFFFFF'}
              size={'lg'}>
              {tab.label}
            </Button>
          ))}
        </Box>
        <Box>
          <BetTable
            items={betHistory?.data.result || []}
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

export default BetHistory;
