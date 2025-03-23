async function sendData(data) {
  chrome.runtime.sendMessage(data);
}

function extractPageData() {
  const url = window.location.href;
  const title = document.title;
  const text = document.body.innerText;
  const scrollDepth = window.scrollY / (document.body.scrollHeight - window.innerHeight);

  return {
    url,
    title,
    text,
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
