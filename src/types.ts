export interface ValidationResponse {
  success: boolean;
  data?: string;
  validation?: { messages: Array<{ type: string; message: string }> };
  error?: string;
}

export interface ChromeMessage {
  type: string;
  url?: string;
}

export interface ChromeMessageSender {
  tab?: chrome.tabs.Tab;
}

export type MessageResponse = (response: ValidationResponse) => void;
