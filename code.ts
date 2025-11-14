// This plugin imports all components from the iOS 18 and iPadOS 18 Community file
// and places them as instances on the current page.
(globalThis as any).__html__ = "<style>\n  body {\n    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n    padding: 16px;\n    margin: 0;\n  }\n  h2 {\n    margin: 0 0 16px 0;\n    font-size: 16px;\n    font-weight: 600;\n  }\n  #status {\n    margin: 16px 0;\n    padding: 12px;\n    border-radius: 6px;\n    background: #f0f0f0;\n    font-size: 13px;\n    line-height: 1.4;\n    min-height: 40px;\n  }\n  #status.success {\n    background: #e6f7e6;\n    color: #1a7f1a;\n  }\n  #status.error {\n    background: #ffe6e6;\n    color: #cc0000;\n  }\n  button {\n    padding: 8px 16px;\n    border: none;\n    border-radius: 6px;\n    background: #18a0fb;\n    color: white;\n    font-size: 13px;\n    cursor: pointer;\n    margin-right: 8px;\n  }\n  button:hover {\n    background: #1592e6;\n  }\n  button:disabled {\n    background: #ccc;\n    cursor: not-allowed;\n  }\n</style>\n\n<h2>iOS 18 Component Importer</h2>\n<div id=\"status\">Initializing...</div>\n<div id=\"instructions\" style=\"display: none; margin: 16px 0; padding: 12px; background: #f0f0f0; border-radius: 6px; font-size: 12px; line-height: 1.6;\">\n  <strong>To use this plugin:</strong><br>\n  1. Go to <a href=\"https://www.figma.com/community/file/1385659531316001292\" target=\"_blank\" style=\"color: #18a0fb;\">the iOS 18 Community file</a><br>\n  2. Click \"Duplicate\" to add it to your drafts<br>\n  3. Open the duplicated file in Figma<br>\n  4. Run this plugin in the duplicated file first to extract component keys<br>\n  5. Then run it in your target file to import the components\n</div>\n<div id=\"file-key-section\" style=\"display: none; margin: 16px 0;\">\n  <label style=\"display: block; margin-bottom: 8px; font-size: 12px; font-weight: 500;\">\n    Or enter your duplicated file key:\n  </label>\n  <input \n    type=\"text\" \n    id=\"file-key-input\" \n    placeholder=\"File key from duplicated file URL\" \n    style=\"width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px; box-sizing: border-box;\"\n  />\n  <p style=\"font-size: 11px; color: #666; margin: 4px 0 0 0;\">\n    Get this from the duplicated file's URL: figma.com/file/[FILE_KEY]/...\n  </p>\n  <button id=\"use-file-key\" style=\"margin-top: 8px;\">Use This File Key</button>\n</div>\n<button id=\"extract-btn\">Extract Components from Current File</button>\n<button id=\"cancel\">Cancel</button>\n\n<script>\n  const COMMUNITY_FILE_KEY = '1385659531316001292';\n  const FIGMA_API_BASE = 'https://api.figma.com/v1';\n  \n  const statusDiv = document.getElementById('status');\n  const extractButton = document.getElementById('extract-btn');\n  const cancelButton = document.getElementById('cancel');\n  const instructions = document.getElementById('instructions');\n  const fileKeySection = document.getElementById('file-key-section');\n  const fileKeyInput = document.getElementById('file-key-input');\n  const useFileKeyButton = document.getElementById('use-file-key');\n\n  function updateStatus(message, type = '') {\n    statusDiv.textContent = message;\n    statusDiv.className = type;\n  }\n\n  // Recursively find all component keys in the API response\n  function findComponentKeys(node, components) {\n    if (node.type === 'COMPONENT' && node.id) {\n      components.push(node.id);\n    }\n    \n    if (node.children && Array.isArray(node.children)) {\n      for (const child of node.children) {\n        findComponentKeys(child, components);\n      }\n    }\n  }\n\n  // Since we can't use REST API due to CORS, we'll ask the plugin code\n  // to extract components from the current file (if it's the duplicated Community file)\n  function requestComponentsFromCurrentFile() {\n    updateStatus('Requesting components from current file...');\n    // Ask the plugin code to extract components from the current file\n    parent.postMessage({ \n      pluginMessage: { \n        type: 'extract-components-from-current-file'\n      } \n    }, '*');\n  }\n\n  // Listen for messages from the plugin code\n  window.onmessage = (event) => {\n    const msg = event.data.pluginMessage;\n    if (msg) {\n      if (msg.type === 'status') {\n        updateStatus(msg.message);\n        // Keep extract button disabled while processing\n        if (extractButton && msg.message.includes('Creating instances')) {\n          extractButton.disabled = true;\n        }\n      } else if (msg.type === 'success') {\n        updateStatus(msg.message, 'success');\n        // Re-enable extract button\n        if (extractButton) {\n          extractButton.disabled = false;\n        }\n      } else if (msg.type === 'error') {\n        updateStatus(msg.message, 'error');\n        // Re-enable extract button on error\n        if (extractButton) {\n          extractButton.disabled = false;\n        }\n        // Show file key input on error\n        if (fileKeySection) {\n          fileKeySection.style.display = 'block';\n        }\n      } else if (msg.type === 'components-extracted') {\n        if (msg.componentKeys && msg.componentKeys.length > 0) {\n          updateStatus('Found ' + msg.componentKeys.length + ' components!');\n          // Components were extracted, plugin will handle importing\n        } else {\n          updateStatus('No components found in current file. Make sure you\\'re running this in the duplicated Community file.', 'error');\n          if (fileKeySection) {\n            fileKeySection.style.display = 'block';\n          }\n        }\n      }\n    }\n  };\n\n  // Show instructions\n  updateStatus('Ready. Click the button below to extract components from the current file.');\n  if (instructions) {\n    instructions.style.display = 'block';\n  }\n  \n  // Set up extract button\n  if (extractButton) {\n    extractButton.onclick = () => {\n      extractButton.disabled = true;\n      requestComponentsFromCurrentFile();\n    };\n  }\n\n  // Handle file key input\n  if (useFileKeyButton && fileKeyInput) {\n    useFileKeyButton.onclick = () => {\n      const fileKey = fileKeyInput.value.trim();\n      if (fileKey) {\n        updateStatus('Using provided file key...');\n        parent.postMessage({ \n          pluginMessage: { \n            type: 'use-file-key',\n            fileKey: fileKey\n          } \n        }, '*');\n      }\n    };\n  }\n\n  cancelButton.onclick = () => {\n    parent.postMessage({ pluginMessage: { type: 'cancel' } }, '*');\n  };\n</script>\n";

const COMMUNITY_FILE_KEY = '1385659531316001292';
const SPACING = 64;

// Helper function to recursively find all components in a node tree
function findAllComponents(node: BaseNode): ComponentNode[] {
  const components: ComponentNode[] = [];

  if (node.type === 'COMPONENT') {
    components.push(node);
  }

  if ('children' in node) {
    for (const child of node.children) {
      components.push(...findAllComponents(child));
    }
  }

  return components;
}

// Extract all components from the current file
async function extractComponentsFromCurrentFile(): Promise<ComponentNode[]> {
  const allComponents: ComponentNode[] = [];

  // Load all pages first - this is required before accessing page.children
  await figma.loadAllPagesAsync();

  // Traverse all pages in the current file
  for (const page of figma.root.children) {
    if (page.type === 'PAGE') {
      const pageComponents = findAllComponents(page);
      allComponents.push(...pageComponents);
    }
  }

  return allComponents;
}

// Show UI - __html__ is injected by the build script
console.log('Plugin starting...');
console.log('__html__ defined:', typeof __html__ !== 'undefined');

try {
  if (typeof __html__ === 'undefined') {
    console.error('__html__ is not defined!');
    figma.notify('Plugin error: UI HTML not loaded. Please rebuild the plugin.', { error: true });
  } else {
    console.log('Calling figma.showUI...');
    figma.showUI(__html__, { width: 600, height: 800 });
    console.log('figma.showUI called successfully');
    
    // Send initial message to UI after a brief delay to ensure UI is ready
    setTimeout(() => {
      try {
        figma.ui.postMessage({ type: 'status', message: 'Ready. Click the button to extract components.' });
      } catch (error) {
        console.error('Error sending initial message:', error);
      }
    }, 100);
  }
} catch (error) {
  console.error('Error showing UI:', error);
  const errorMsg = error instanceof Error ? error.message : String(error);
  figma.notify('Plugin error: ' + errorMsg, { error: true });
}

// Handle messages from UI
figma.ui.onmessage = (msg: {
  type: string;
  componentKeys?: string[];
  error?: string;
  fileKey?: string;
}) => {
  console.log('Received message from UI:', JSON.stringify(msg));
  try {
    if (msg.type === 'extract-components-from-current-file') {
      // Extract components from the current file and create instances directly
      console.log('Extracting components from current file...');
      figma.ui.postMessage({ type: 'status', message: 'Extracting components from current file...' });

      // Use async/await to handle the async function
      (async () => {
        try {
          const components = await extractComponentsFromCurrentFile();
          console.log('Found components:', components.length);

          if (components.length === 0) {
            figma.ui.postMessage({
              type: 'error',
              message: 'No components found in current file. Make sure you\'re running this in the duplicated iOS 18 Community file.'
            });
            return;
          }

          figma.ui.postMessage({
            type: 'status',
            message: `Found ${components.length} components. Creating instances...`
          });

          // Create instances directly from the components
          const instances: InstanceNode[] = [];
          let currentX = 0;
          let currentY = 0;
          let maxHeight = 0;
          let successCount = 0;
          const instancesPerRow = 5; // Number of instances per row

          for (let i = 0; i < components.length; i++) {
            const component = components[i];

            try {
              // Create an instance of the component
              const instance = component.createInstance();

              // Position the instance
              instance.x = currentX;
              instance.y = currentY;

              // Track max height for this row
              if (instance.height > maxHeight) {
                maxHeight = instance.height;
              }

              // Add to current page
              figma.currentPage.appendChild(instance);
              instances.push(instance);
              successCount++;

              // Calculate next position
              currentX += instance.width + SPACING;
              
              // Move to next row if we've placed enough in this row
              if ((i + 1) % instancesPerRow === 0) {
                currentX = 0;
                currentY += maxHeight + SPACING;
                maxHeight = 0;
              }

              // Update progress
              if ((i + 1) % 10 === 0 || i === components.length - 1) {
                figma.ui.postMessage({
                  type: 'status',
                  message: `Created ${i + 1}/${components.length} instances...`
                });
              }
            } catch (error) {
              console.error(`Error creating instance ${i}:`, error);
              // Continue with next component
            }
          }

          // Select all instances and zoom to fit
          if (instances.length > 0) {
            figma.currentPage.selection = instances;
            figma.viewport.scrollAndZoomIntoView(instances);

            figma.ui.postMessage({
              type: 'success',
              message: `Successfully created ${successCount} component instances!`
            });

            // Close plugin after a short delay
            setTimeout(() => {
              figma.closePlugin();
            }, 2000);
          } else {
            figma.ui.postMessage({
              type: 'error',
              message: 'No instances were created. Check console for errors.'
            });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error during extraction';
          console.error('Error extracting components:', error);
          figma.ui.postMessage({
            type: 'error',
            message: `Error: ${errorMessage}`
          });
        }
      })();

    } else if (msg.type === 'use-file-key') {
      figma.ui.postMessage({
        type: 'error',
        message: 'File key provided, but we need to extract components from the file. Please open the duplicated file and run the plugin there.'
      });
    } else if (msg.type === 'cancel') {
      figma.closePlugin();
    } else {
      console.log('Unknown message type:', msg.type);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error in message handler:', error);
    figma.ui.postMessage({
      type: 'error',
      message: `Plugin error: ${errorMessage}`
    });
  }
};
