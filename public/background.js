chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'FETCH_HTML') {
    fetch(`http://localhost:${request.port}`)
      .then(response => response.text())
      .then(html => sendResponse({ success: true, data: html }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // 비동기 응답을 위해 true 반환
  }
}); 