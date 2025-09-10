let extractedUrls = [];

document.getElementById('extract').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: extractImages
  }, (results) => {
    if (results && results[0]) {
      extractedUrls = results[0].result;
      displayResults(extractedUrls);
    }
  });
});

document.getElementById('copy').addEventListener('click', () => {
  navigator.clipboard.writeText(extractedUrls.join('\n'));
  document.getElementById('status').textContent = '✅ Copied to clipboard!';
});

function extractImages() {
  const selectors = [
    'img[src*="jpg"]', 'img[src*="jpeg"]', 'img[src*="png"]', 'img[src*="webp"]',
    '.chapter-image img', '.page-image img', '.manga-page img', '#chapter-images img',
    '.reader img', '.reading-content img', '[class*="page"] img'
  ];
  
  const images = [];
  selectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(img => {
      const src = img.src || img.getAttribute('data-src');
      if (src && src.includes('http') && img.naturalWidth > 200 && !images.includes(src)) {
        images.push(src);
      }
    });
  });
  
  return [...new Set(images)];
}

function displayResults(urls) {
  const status = document.getElementById('status');
  const results = document.getElementById('results');
  const copyBtn = document.getElementById('copy');
  
  if (urls.length > 0) {
    status.textContent = `Found ${urls.length} images`;
    results.innerHTML = urls.map((url, i) => `<div>${i+1}. ${url}</div>`).join('');
    copyBtn.disabled = false;
  } else {
    status.textContent = 'No images found';
    results.innerHTML = '';
  }
}