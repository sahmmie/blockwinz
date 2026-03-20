import { rpc } from '@cityofzion/neon-core';

const TESTNET_URLS = [
  'https://testnet1.neo.coz.io/',
  'https://testnet2.neo.coz.io/',
  'https://rpc.t5.n3.nspcc.ru:20331/',
  'http://seed1t5.neo.org:20332/',
  'http://seed2t5.neo.org:20332/',
  'http://seed3t5.neo.org:20332/',
  'http://seed4t5.neo.org:20332/',
  'http://seed5t5.neo.org:20332/',
];

const MAINNET_URLS = [
  'https://mainnet1.neo.coz.io/',
  'https://mainnet2.neo.coz.io/',
  'http://seed1.neo.org:10332/',
  'http://seed2.neo.org:10332/',
  'http://seed3.neo.org:10332/',
  'http://seed4.neo.org:10332/',
  'http://seed5.neo.org:10332/',
  'https://rpc10.n3.nspcc.ru:10331/',
];

export const getUrls = (net: string): string[] => {
  if (net === 'TestNet') {
    return TESTNET_URLS;
  } else if (net === 'MainNet') {
    return MAINNET_URLS;
  } else {
    throw new Error('Expected MainNet or TestNet');
  }
};

function cutArray<T>(arr: T[]): T[] {
  const randomStartIndex = Math.floor(Math.random() * arr.length);
  return arr.slice(randomStartIndex).concat(arr.slice(0, randomStartIndex));
}
export const getUrl = async (net: string): Promise<string> => {
  const orderedUrls = getUrls(net);

  const slicedUrls = cutArray(orderedUrls);
  let previousBlockCount = 0;
  for (let i = 0; i < slicedUrls.length; i++) {
    try {
      const dispatcher = new rpc.RpcDispatcher(slicedUrls[i]);
      const currentBlockCount = await dispatcher.execute<number>(
        rpc.Query.getBlockCount(),
        {
          timeout: 2000,
        },
      );
      if (currentBlockCount - previousBlockCount <= 5) {
        return slicedUrls[i];
      }
      previousBlockCount = Math.max(currentBlockCount, previousBlockCount);
    } catch (e) {
      continue;
    }
  }
  throw new Error('Exhausted all urls but found no available RPC');
};
