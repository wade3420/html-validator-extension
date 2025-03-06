import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

// Chrome API Mock
const mockChrome = {
  tabs: {
    query: vi.fn(),
  },
  runtime: {
    sendMessage: vi.fn(),
  },
};

// @ts-expect-error chrome is not defined
global.chrome = mockChrome;

describe('HTML Validator App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('초기 상태에서는 모든 통계가 0이어야 함', () => {
    render(<App />);

    expect(screen.getByText('전체').nextElementSibling).toHaveTextContent('0');
    expect(screen.getByText('오류').nextElementSibling).toHaveTextContent('0');
    expect(screen.getByText('경고').nextElementSibling).toHaveTextContent('0');
    expect(screen.getByText('정보').nextElementSibling).toHaveTextContent('0');
  });

  it('검사 버튼 클릭시 로딩 상태로 변경되어야 함', () => {
    render(<App />);
    const button = screen.getByRole('button');

    fireEvent.click(button);

    expect(button).toHaveTextContent('검사 중...');
    expect(button).toBeDisabled();
  });

  it('HTML 검사 성공시 결과가 표시되어야 함', async () => {
    const mockValidationResults = {
      success: true,
      validation: {
        messages: [
          { type: 'error', message: '테스트 에러' },
          { type: 'warning', message: '테스트 경고' },
          { type: 'info', message: '테스트 정보' },
        ],
      },
    };

    mockChrome.tabs.query.mockImplementation((_, callback) => {
      callback([{ url: 'https://example.com' }]);
    });
    mockChrome.runtime.sendMessage.mockResolvedValue(mockValidationResults);

    render(<App />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      // 결과 메시지들이 화면에 표시되는지 확인
      expect(screen.getByText('테스트 에러')).toBeInTheDocument();
      expect(screen.getByText('테스트 경고')).toBeInTheDocument();
      expect(screen.getByText('테스트 정보')).toBeInTheDocument();

      // 통계가 올바르게 업데이트되었는지 확인
      expect(screen.getByText('전체').nextElementSibling).toHaveTextContent(
        '3'
      );
      expect(screen.getByText('오류').nextElementSibling).toHaveTextContent(
        '1'
      );
      expect(screen.getByText('경고').nextElementSibling).toHaveTextContent(
        '1'
      );
      expect(screen.getByText('정보').nextElementSibling).toHaveTextContent(
        '1'
      );
    });
  });

  it('활성 탭이 없을 때 에러 메시지를 표시해야 함', async () => {
    mockChrome.tabs.query.mockImplementation((_, callback) => {
      callback([]); // 빈 배열 반환하여 활성 탭이 없음을 시뮬레이션
    });

    render(<App />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('활성화된 탭이 없습니다.')).toBeInTheDocument();
    });
  });

  it('서버 에러 발생시 에러 메시지를 표시해야 함', async () => {
    mockChrome.tabs.query.mockImplementation((_, callback) => {
      callback([{ url: 'https://example.com' }]);
    });
    mockChrome.runtime.sendMessage.mockRejectedValue(new Error('서버 에러'));

    render(<App />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(
        screen.getByText('서버에 접속할 수 없습니다. 포트 번호를 확인해주세요.')
      ).toBeInTheDocument();
    });
  });

  it('검증 결과가 타입별로 정렬되어야 함', async () => {
    const mockValidationResults = {
      success: true,
      validation: {
        messages: [
          { type: 'info', message: '정보 메시지' },
          { type: 'error', message: '에러 메시지' },
          { type: 'warning', message: '경고 메시지' },
        ],
      },
    };

    mockChrome.tabs.query.mockImplementation((_, callback) => {
      callback([{ url: 'https://example.com' }]);
    });
    mockChrome.runtime.sendMessage.mockResolvedValue(mockValidationResults);

    render(<App />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      const messages = screen.getAllByText(/메시지/);
      // error가 먼저, 그 다음 warning, 마지막으로 info가 표시되어야 함
      expect(messages[0]).toHaveTextContent('에러 메시지');
      expect(messages[1]).toHaveTextContent('경고 메시지');
      expect(messages[2]).toHaveTextContent('정보 메시지');
    });
  });
});
