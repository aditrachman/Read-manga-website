// Bookmarklet untuk extract manga images
// Copy code ini dan buat bookmark dengan URL: javascript:(function(){...})();

javascript:(function(){
  const images = [];
  const selectors = ['img[src*="jpg"]', 'img[src*="jpeg"]', 'img[src*="png"]', 'img[src*="webp"]', '.chapter-image img', '.page-image img', '.manga-page img', '#chapter-images img', '.reader img'];
  
  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(img => {
      const src = img.src || img.getAttribute('data-src');
      if (src && src.includes('http') && img.naturalWidth > 200 && !images.includes(src)) {
        images.push(src);
      }
    });
  });
  
  if (images.length > 0) {
    navigator.clipboard.writeText(images.join('\n'));
    alert(`✅ ${images.length} image URLs copied to clipboard!`);
  } else {
    alert('❌ No images found on this page');
  }
})();