async function sendData(data) {
  try {
    // Check if the runtime is valid before sending
    if (chrome.runtime && chrome.runtime.id) {
      await chrome.runtime.sendMessage(data);
    }
  } catch (error) {
    // Ignore errors if the extension context is invalidated (e.g. after update)
    console.debug('Failed to send message:', error);
  }
}

function extractMainContentByArea() {
  if (!document.body) return '';
  const elements = Array.from(document.body.querySelectorAll('main, article, section, div'));
  let largest = null;
  let maxArea = 0;

  elements.forEach(el => {
    const rect = el.getBoundingClientRect();
    const area = rect.width * rect.height;
    // 文字量が十分あり、可視範囲の要素のみ対象
    if (area > maxArea && el.innerText.trim().length > 200 && rect.width > 0 && rect.height > 0) {
      maxArea = area;
      largest = el;
    }
  });

  return largest ? largest.innerText : document.body.innerText;
}

function extractPageData() {
  if (!document.body) return null;

  const url = window.location.href;
  const title = document.title;
  const mainText = extractMainContentByArea();

  const scrollHeight = document.body.scrollHeight;
  const innerHeight = window.innerHeight;
  let scrollDepth = 0;

  if (scrollHeight > innerHeight) {
    scrollDepth = window.scrollY / (scrollHeight - innerHeight);
  }

  return {
    url,
    title,
    text: mainText,
    scrollDepth
  };
}

let debounceTimer;
function handlePageChange() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const pageData = extractPageData();
    if (pageData) {
      sendData(pageData);
    }
  }, 2000);
}

function init() {
  if (!document.body) {
    document.addEventListener('DOMContentLoaded', init);
    return;
  }

  handlePageChange();

  const observer = new MutationObserver(handlePageChange);
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('scroll', handlePageChange);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
