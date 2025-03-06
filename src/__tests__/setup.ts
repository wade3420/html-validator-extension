import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// 각 테스트 후 cleanup 실행
afterEach(() => {
  cleanup();
});
