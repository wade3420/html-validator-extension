import type { ChromeMessage, ValidationResponse } from '../src/types';

const setupMessageListener = () => {
  chrome.runtime.onMessage.addListener(
    (request: ChromeMessage, _sender, sendResponse) => {
      if (request.type === 'FETCH_HTML') {
        const fetchOption = {
          method: 'GET',
        };

        fetch(request.url!, fetchOption)
          .then((response) => response.text())
          .then((html) => {
            return fetch('https://validator.w3.org/nu/?out=json', {
              method: 'POST',
              headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'User-Agent': 'Mozilla/5.0 (compatible; Chrome Extension)',
              },
              body: html,
            })
              .then((validatorResponse) => validatorResponse.json())
              .then((validationResult) => {
                sendResponse({
                  success: true,
                  data: html,
                  validation: validationResult,
                } as ValidationResponse);
              });
          })
          .catch((error) => {
            sendResponse({
              success: false,
              error: error.message,
            } as ValidationResponse);
          });
        return true;
      }
    }
  );
};

export const setupSidePanel = () => {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));
};

// 초기 설정 실행
setupSidePanel();
setupMessageListener();
