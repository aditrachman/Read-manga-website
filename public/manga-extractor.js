// Manga Chapter Image Extractor
// Paste this script in browser console on manga reading page

(function() {
  'use strict';
  
  // Common selectors for manga reading sites
  const imageSelectors = [
    'img[src*="jpg"]',
    'img[src*="jpeg"]', 
    'img[src*="png"]',
    'img[src*="webp"]',
    '.chapter-image img',
    '.page-image img',
    '.manga-page img',
    '#chapter-images img',
    '.reader img',
    '.reading-content img',
    '[class*="page"] img',
    '[id*="page"] img'
  ];
  
  function extractChapterImages() {
    const images = [];
    
    // Try each selector
    imageSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(img => {
        const src = img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy');
        if (src && src.includes('http') && !images.includes(src)) {
          // Filter out small images (likely UI elements)
          if (img.naturalWidth > 200 && img.naturalHeight > 200) {
            images.push(src);
          }
        }
      });
    });
    
    // Remove duplicates and sort
    const uniqueImages = [...new Set(images)];
    
    return uniqueImages;
  }
  
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      console.log('✅ URLs copied to clipboard!');
    });
  }
  
  function displayResults(images) {
    console.log(`🎯 Found ${images.length} chapter images:`);
    
    // Format for easy copy-paste
    const formattedUrls = images.map((url, index) => `${index + 1}. ${url}`).join('\n');
    
    console.log('\n📋 Copy these URLs:');
    console.log(formattedUrls);
    
    // Auto copy to clipboard
    copyToClipboard(images.join('\n'));
    
    // Create floating UI
    createFloatingUI(images);
  }
  
  function createFloatingUI(images) {
    // Remove existing UI
    const existing = document.getElementById('manga-extractor-ui');
    if (existing) existing.remove();
    
    // Create floating panel
    const panel = document.createElement('div');
    panel.id = 'manga-extractor-ui';
    panel.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 300px;
      max-height: 400px;
      background: #1f2937;
      color: white;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      z-index: 10000;
      font-family: monospace;
      font-size: 12px;
      overflow-y: auto;
    `;
    
    panel.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h3 style="margin: 0; color: #60a5fa;">📸 Chapter Images (${images.length})</h3>
        <button onclick="this.parentElement.parentElement.remove()" style="background: #ef4444; color: white; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer;">✕</button>
      </div>
      
      <div style="margin-bottom: 12px;">
        <button id="copy-all-btn" style="background: #10b981; color: white; border: none; border-radius: 4px; padding: 6px 12px; cursor: pointer; margin-right: 8px;">📋 Copy All</button>
        <button id="download-json-btn" style="background: #3b82f6; color: white; border: none; border-radius: 4px; padding: 6px 12px; cursor: pointer;">💾 JSON</button>
      </div>
      
      <div style="max-height: 250px; overflow-y: auto; background: #374151; padding: 8px; border-radius: 4px;">
        ${images.map((url, i) => `
          <div style="margin-bottom: 4px; padding: 4px; background: #4b5563; border-radius: 2px;">
            <span style="color: #fbbf24;">${i + 1}.</span> 
            <span style="word-break: break-all; font-size: 10px;">${url}</span>
          </div>
        `).join('')}
      </div>
    `;
    
    document.body.appendChild(panel);
    
    // Add event listeners
    document.getElementById('copy-all-btn').onclick = () => {
      copyToClipboard(images.join('\n'));
      alert('✅ All URLs copied!');
    };
    
    document.getElementById('download-json-btn').onclick = () => {
      const data = {
        title: document.title,
        url: window.location.href,
        images: images,
        extractedAt: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chapter-images-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    };
  }
  
  // Main execution
  console.log('🚀 Starting Manga Chapter Image Extraction...');
  
  // Wait for images to load
  setTimeout(() => {
    const images = extractChapterImages();
    
    if (images.length > 0) {
      displayResults(images);
    } else {
      console.log('❌ No chapter images found. Try scrolling down or waiting for images to load.');
      
      // Try again after scroll
      window.scrollTo(0, document.body.scrollHeight);
      setTimeout(() => {
        const retryImages = extractChapterImages();
        if (retryImages.length > 0) {
          displayResults(retryImages);
        } else {
          console.log('❌ Still no images found. This site might use a different structure.');
        }
      }, 2000);
    }
  }, 1000);
  
})();

console.log('📖 Manga Image Extractor loaded! The script will run automatically.');