import { ServiceUnavailableException } from '@nestjs/common';
import { AppController } from './app.controller';

describe('AppController', () => {
  it('live returns an ok heartbeat', () => {
    const controller = new AppController(
      {} as never,
      {} as never,
    );

    expect(controller.live()).toEqual(
      expect.objectContaining({
        status: 'ok',
        timestamp: expect.any(String),
      }),
    );
  });

  it('ready confirms database and redis checks', async () => {
    const controller = new AppController(
      { execute: jest.fn().mockResolvedValue([{ '?column?': 1 }]) } as never,
      { ping: jest.fn().mockResolvedValue('PONG') } as never,
    );

    await expect(controller.ready()).resolves.toEqual(
      expect.objectContaining({
        status: 'ok',
        checks: {
          database: 'ok',
          redis: 'ok',
        },
      }),
    );
  });

  it('ready fails when a dependency check fails', async () => {
    const controller = new AppController(
      { execute: jest.fn().mockRejectedValue(new Error('db down')) } as never,
      { ping: jest.fn().mockResolvedValue('PONG') } as never,
    );

    await expect(controller.ready()).rejects.toThrow(ServiceUnavailableException);
  });
});
