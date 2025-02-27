chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'FETCH_HTML') {
    fetch(request.url)
      .then(response => response.text())
      .then(html => {
        // W3C HTML Validator API 사용
        return fetch('https://validator.w3.org/nu/?out=json', {
          method: 'POST',
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'User-Agent': 'Mozilla/5.0 (compatible; Chrome Extension)'
          },
          body: html
        })
        .then(validatorResponse => validatorResponse.json())
        .then(validationResult => {
          sendResponse({
            success: true,
            data: html,
            validation: validationResult
          });
        });
      })
      .catch(error => sendResponse({ 
        success: false, 
        error: error.message 
      }));
    return true; // 비동기 응답을 위해 true 반환
  }
}); 