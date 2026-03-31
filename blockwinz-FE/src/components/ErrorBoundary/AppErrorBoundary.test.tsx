import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AppErrorBoundary from './AppErrorBoundary';
import { Provider } from '@/themes/provider';

const reportClientError = vi.fn();

vi.mock('@/shared/utils/monitoring', () => ({
  reportClientError: (...args: unknown[]) => reportClientError(...args),
}));

function BrokenComponent(): never {
  throw new Error('boom');
}

describe('AppErrorBoundary', () => {
  const reloadMock = vi.fn();

  beforeEach(() => {
    reloadMock.mockReset();
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload: reloadMock },
      writable: true,
    });
  });

  it('renders fallback UI when a child throws', () => {
    render(
      <Provider>
        <AppErrorBoundary>
          <BrokenComponent />
        </AppErrorBoundary>
      </Provider>,
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(reportClientError).toHaveBeenCalled();
  });

  it('reloads the app from the fallback action', () => {
    render(
      <Provider>
        <AppErrorBoundary>
          <BrokenComponent />
        </AppErrorBoundary>
      </Provider>,
    );

    fireEvent.click(screen.getByText('Reload App'));
    expect(reloadMock).toHaveBeenCalled();
  });
});
