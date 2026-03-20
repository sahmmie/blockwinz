import { Button } from '@/components/ui/button';
import { Box, Text } from '@chakra-ui/react';
import { FunctionComponent, useEffect, useState } from 'react';
import ListIcon from 'assets/icons/list-icon.svg';
import BetTable from '@/components/BetTable/BetTable';
import { AxiosResponse } from 'axios';
import { PaginatedDataI } from '@/shared/interfaces/pagination.interface';
import { BetHistoryT } from '@/pages/BetHistory/BetHistory.type';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

interface BetsProps {}

export enum BetTableType {
  MY_BETS = 'myBets',
  LATEST = 'latest',
  TOTAL_WIN_AMOUNT = 'totalWinAmount',
}

const Bets: FunctionComponent<BetsProps> = () => {
  const [activeTab, setActiveTab] = useState<BetTableType>(BetTableType.LATEST);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const tabs = [
    {
      title: 'Latest Bets',
      sortBy: BetTableType.LATEST,
      isActive: activeTab === BetTableType.LATEST,
    },
    {
      title: 'My Bets',
      sortBy: BetTableType.MY_BETS,
      isActive: activeTab === BetTableType.MY_BETS,
    },
    {
      title: 'High Rollers',
      sortBy: BetTableType.TOTAL_WIN_AMOUNT,
      isActive: activeTab === BetTableType.TOTAL_WIN_AMOUNT,
    },
  ];

  useEffect(() => {
    setActiveTab(BetTableType.LATEST);
  }, []);

  const betHistoryUrl =
    activeTab === BetTableType.MY_BETS ? '/bet-history' : '/bet-history/all';

  const getBetHistory = async (): Promise<
    AxiosResponse<PaginatedDataI<BetHistoryT>>
  > => {
    return await axiosInstance.get(
      `${betHistoryUrl}?page=${page}&limit=${limit}&sortyBy=${activeTab}`,
    );
  };

  const {
    data: betHistory,
  }: UseQueryResult<{ data: PaginatedDataI<BetHistoryT> }, Error> = useQuery(
    ['bet-history', activeTab, page],
    getBetHistory,
    {
      enabled: !!activeTab, // only run when activeTab is set
      retry: 3,
      refetchOnWindowFocus: false,
      refetchInterval: 20000, // <-- Poll every 20 seconds
    },
  );

  return (
    <>
      <Box
        mb={'24px'}
        display={'flex'}
        justifyContent={'space-between'}
        alignItems={'center'}>
        <Box
          display={{ base: 'none', md: 'flex' }}
          alignItems={'center'}
          gap={'12px'}
          ml={'14px'}>
          <img
            src={ListIcon}
            alt={'bets'}
            style={{ width: '24px', height: '24px' }}
          />
          <Text fontSize={'20px'} fontWeight={'500'}>
            {tabs.find(tab => tab.sortBy === activeTab)?.title}
          </Text>
        </Box>

        <Box
          display={'flex'}
          alignItems={'center'}
          gap={{ base: '0', md: '12px' }}
          p={{ base: '8px', md: '0px' }}
          bg={{ base: '#151832', md: 'inherit' }}
          borderRadius={{ base: '8px', md: '0px' }}
          w={{ base: '100%', md: 'auto' }}>
          {tabs.map((tab, index) => (
            <Box w={{ base: '100%', md: 'auto' }} key={`tab-${index}`}>
              <Button
                borderRadius={{ base: tab.isActive ? '8px' : '0px', md: '8px' }}
                w={{ base: '100%', md: 'auto' }}
                onClick={() => setActiveTab(tab.sortBy)}
                key={index}
                bg={tab.isActive ? '#00DD25' : '#000A27'}
                color={tab.isActive ? '#000A27' : '#ECF0F1'}>
                {tab.title}
              </Button>
            </Box>
          ))}
        </Box>
      </Box>

      <Box>
        <BetTable
          betTableType={activeTab}
          showPagination={false}
          items={betHistory?.data.result || []}
          page={page}
          pageSize={limit}
          totalCount={limit}
          setPage={setPage}
        />
      </Box>
    </>
  );
};

export default Bets;
