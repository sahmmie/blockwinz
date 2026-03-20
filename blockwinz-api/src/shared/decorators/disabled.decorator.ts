import { applyDecorators, UseGuards, SetMetadata } from '@nestjs/common';
import { DisabledGuard } from '../guards/disabled.guard';

export const DISABLED_MESSAGE_KEY = 'disabledMessage';
export const DISABLED_STATUS_KEY = 'disabledStatus';

/**
 * Decorator to disable a route or controller
 * Throws a FORBIDDEN exception when the decorated route is accessed
 *
 * @param message - Custom error message (optional)
 * @param statusCode - Custom HTTP status code (optional, defaults to 403)
 *
 * @example
 * @Disabled()
 * @Get('maintenance')
 * getMaintenanceInfo() {
 *   return { message: 'This should not be accessible' };
 * }
 *
 * @example
 * @Disabled('Feature temporarily unavailable', 503)
 * @Get('beta-feature')
 * getBetaFeature() {
 *   return { message: 'Beta feature disabled' };
 * }
 */
export const Disabled = (message?: string, statusCode?: number) =>
  applyDecorators(
    SetMetadata(DISABLED_MESSAGE_KEY, message),
    SetMetadata(DISABLED_STATUS_KEY, statusCode),
    UseGuards(DisabledGuard),
  );
