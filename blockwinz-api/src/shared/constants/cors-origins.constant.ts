/**
 * Browser origins allowed for HTTP CORS and Socket.IO. Keep in sync across
 * {@link ../../main.ts}, {@link ../adaptors/redisAdapter.ts}, and WebSocket gateways.
 */
export const CORS_ORIGIN_WHITELIST: string[] = [
  'https://staging.blockwinz.com',
  'https://blockwinz.com',
  'http://localhost:5173',
  'https://bwzfunding.netlify.app',
];

export const SOCKET_IO_CORS = {
  origin: CORS_ORIGIN_WHITELIST,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] as string[],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'withdrawal-key',
  ],
};
