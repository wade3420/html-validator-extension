import { describe, it, expect, vi, beforeEach } from 'vitest';
import type {
  ChromeMessage,
  ChromeMessageSender,
  MessageResponse,
} from '../types';

// Chrome API Mock
const mockChrome = {
  sidePanel: {
    setPanelBehavior: vi.fn().mockResolvedValue(undefined),
  },
  runtime: {
    onMessage: {
      addListener: vi.fn(),
    },
  },
};

// Fetch Mock
const mockFetch = vi.fn();
global.fetch = mockFetch;

// @ts-expect-error chrome is not defined
global.chrome = mockChrome;

describe('Background Script', () => {
  let messageListener: (
    request: ChromeMessage,
    sender: ChromeMessageSender,
    sendResponse: MessageResponse
  ) => boolean;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { setupMessageListener, setupSidePanel } = await import(
      '../../public/background.ts'
    );

    // 리스너 설정
    setupSidePanel();
    setupMessageListener();

    // messageListener 가져오기
    messageListener = mockChrome.runtime.onMessage.addListener.mock.calls[0][0];
  });

  it('사이드 패널이 올바르게 설정되어야 함', () => {
    expect(mockChrome.sidePanel.setPanelBehavior).toHaveBeenCalledWith({
      openPanelOnActionClick: true,
    });
  });

  it('HTML을 가져오고 검증해야 함', async () => {
    const mockHtml = '<html><body>Test</body></html>';
    const mockValidationResult = {
      messages: [{ type: 'error', message: '테스트 에러' }],
    };

    mockFetch
      .mockResolvedValueOnce({
        text: () => Promise.resolve(mockHtml),
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve(mockValidationResult),
      });

    const sendResponse = vi.fn();
    const request: ChromeMessage = {
      type: 'FETCH_HTML',
      url: 'https://example.com',
    };

    const result = messageListener(request, {}, sendResponse);
    expect(result).toBe(true);

    await new Promise(process.nextTick);

    expect(sendResponse).toHaveBeenCalledWith({
      success: true,
      data: mockHtml,
      validation: mockValidationResult,
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenNthCalledWith(1, 'https://example.com');
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      'https://validator.w3.org/nu/?out=json',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'User-Agent': 'Mozilla/5.0 (compatible; Chrome Extension)',
        },
        body: mockHtml,
      }
    );
  });

  it('HTML 가져오기 실패를 처리해야 함', async () => {
    const errorMessage = '네트워크 오류';
    mockFetch.mockRejectedValueOnce(new Error(errorMessage));

    const sendResponse = vi.fn();
    const request: ChromeMessage = {
      type: 'FETCH_HTML',
      url: 'https://example.com',
    };

    messageListener(request, {}, sendResponse);
    await new Promise(process.nextTick);

    expect(sendResponse).toHaveBeenCalledWith({
      success: false,
      error: errorMessage,
    });
  });

  it('W3C Validator API 호출 실패를 처리해야 함', async () => {
    const mockHtml = '<html><body>Test</body></html>';
    const errorMessage = 'Validator API 오류';

    mockFetch
      .mockResolvedValueOnce({
        text: () => Promise.resolve(mockHtml),
      })
      .mockRejectedValueOnce(new Error(errorMessage));

    const sendResponse = vi.fn();
    const request: ChromeMessage = {
      type: 'FETCH_HTML',
      url: 'https://example.com',
    };

    messageListener(request, {}, sendResponse);
    await new Promise(process.nextTick);

    expect(sendResponse).toHaveBeenCalledWith({
      success: false,
      error: errorMessage,
    });
  });

  it('알 수 없는 메시지 타입은 무시해야 함', () => {
    const sendResponse = vi.fn();
    const request: ChromeMessage = {
      type: 'UNKNOWN_TYPE',
    };

    const result = messageListener(request, {}, sendResponse);

    expect(result).toBeUndefined();
    expect(sendResponse).not.toHaveBeenCalled();
  });
});
