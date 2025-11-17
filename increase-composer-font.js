// Script to increase Cursor Composer font size
// Run this in the browser console (Cmd+Option+I) when Cursor is open
// To use: Copy and paste this entire script into the console

(function() {
  const style = document.createElement('style');
  style.textContent = `
    .aislash-editor-input {
      font-size: 24px !important;
      line-height: 1.8 !important;
    }
    .aislash-editor-input[contenteditable="true"] {
      font-size: 24px !important;
      line-height: 1.8 !important;
    }
    [data-lexical-editor="true"].aislash-editor-input {
      font-size: 24px !important;
      line-height: 1.8 !important;
    }
  `;
  document.head.appendChild(style);
  console.log('✅ Composer font size increased to 24px');
})();

