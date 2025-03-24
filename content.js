async function sendData(data) {
  chrome.runtime.sendMessage(data);
}

function extractMainContentByArea() {
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
  const url = window.location.href;
  const title = document.title;
  const mainText = extractMainContentByArea();
  const scrollDepth = window.scrollY / (document.body.scrollHeight - window.innerHeight);

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
    sendData(pageData);
  }, 2000);
}

handlePageChange();
const observer = new MutationObserver(handlePageChange);
observer.observe(document.body, { childList: true, subtree: true });
window.addEventListener('scroll', handlePageChange);


