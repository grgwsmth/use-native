// This plugin imports all components from the iOS 18 and iPadOS 18 Community file
// and places them as instances on the current page.
(globalThis as any).__html__ = "<style>\n\tbody {\n\t\tfont-family: \"Inter\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif;\n\t\tpadding: 16px;\n\t\tmargin: 0;\n\t}\n\th2 {\n\t\tmargin: 0 0 16px 0;\n\t\tfont-size: 16px;\n\t\tfont-weight: 600;\n\t}\n\t#status {\n\t\tmargin: 16px 0;\n\t\tpadding: 12px;\n\t\tborder-radius: 6px;\n\t\tbackground: #f0f0f0;\n\t\tfont-size: 13px;\n\t\tline-height: 1.4;\n\t\tmin-height: 40px;\n\t}\n\t#status.success {\n\t\tbackground: #e6f7e6;\n\t\tcolor: #1a7f1a;\n\t}\n\t#status.error {\n\t\tbackground: #ffe6e6;\n\t\tcolor: #cc0000;\n\t}\n\tbutton {\n\t\tpadding: 8px 16px;\n\t\tborder: none;\n\t\tborder-radius: 6px;\n\t\tbackground: #18a0fb;\n\t\tcolor: white;\n\t\tfont-size: 13px;\n\t\tcursor: pointer;\n\t}\n\tbutton:hover {\n\t\tbackground: #1592e6;\n\t}\n\tbutton:disabled {\n\t\tbackground: #ccc;\n\t\tcursor: not-allowed;\n\t}\n\t#component-names-input {\n\t\twidth: 100%;\n\t\tmin-height: 100px;\n\t\tpadding: 8px;\n\t\tborder: 1px solid #ddd;\n\t\tborder-radius: 4px;\n\t\tfont-size: 13px;\n\t\tfont-family: \"Inter\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif;\n\t\tbox-sizing: border-box;\n\t\tresize: vertical;\n\t}\n\t#component-names-input:focus {\n\t\toutline: none;\n\t\tborder-color: #18a0fb;\n\t}\n\t.run-plugin-buttons {\n\t\tdisplay: flex;\n\t\tgap: 16px;\n\t\tmargin-top: 20px;\n\t}\n\t.run-plugin-buttons > button {\n\t\tdisplay: inline-block;\n\t}\n</style>\n\n<h2>iOS 18 Component Importer</h2>\n<div id=\"status\">Loading components...</div>\n<div id=\"components-section\" style=\"display: none\">\n\t<p style=\"margin: 0 0 8px 0; font-size: 13px; color: #333\">\n\t\tAdd the names of pages containing components you want to include. I will include ALL\n\t\tcomponents found on those pages.\n\t</p>\n\t<textarea\n\t\tid=\"component-names-input\"\n\t\tplaceholder=\"Enter page names separated by commas, e.g., Alerts, Buttons, Cards\"\n\t></textarea>\n\t<p style=\"margin: 8px 0 0 0; font-size: 11px; color: #666\">\n\t\tEnter page names exactly as they appear in the library, separated by commas.\n\t</p>\n</div>\n<div\n\tid=\"instructions\"\n\tstyle=\"\n\t\tdisplay: none;\n\t\tmargin: 16px 0;\n\t\tpadding: 12px;\n\t\tbackground: #f0f0f0;\n\t\tborder-radius: 6px;\n\t\tfont-size: 12px;\n\t\tline-height: 1.6;\n\t\"\n>\n\t<strong>To use this plugin:</strong><br />\n\t1. Go to\n\t<a\n\t\thref=\"https://www.figma.com/community/file/1385659531316001292\"\n\t\ttarget=\"_blank\"\n\t\tstyle=\"color: #18a0fb\"\n\t\t>the iOS 18 Community file</a\n\t><br />\n\t2. Click \"Duplicate\" to add it to your drafts<br />\n\t3. Open the duplicated file in Figma<br />\n\t4. Run this plugin in the duplicated file to select and import components\n</div>\n<div id=\"file-key-section\" style=\"display: none; margin: 16px 0\">\n\t<label style=\"display: block; margin-bottom: 8px; font-size: 12px; font-weight: 500\">\n\t\tOr enter your duplicated file key:\n\t</label>\n\t<input\n\t\ttype=\"text\"\n\t\tid=\"file-key-input\"\n\t\tplaceholder=\"File key from duplicated file URL\"\n\t\tstyle=\"\n\t\t\twidth: 100%;\n\t\t\tpadding: 8px;\n\t\t\tborder: 1px solid #ddd;\n\t\t\tborder-radius: 4px;\n\t\t\tfont-size: 12px;\n\t\t\tbox-sizing: border-box;\n\t\t\"\n\t/>\n\t<p style=\"font-size: 11px; color: #666; margin: 4px 0 0 0\">\n\t\tGet this from the duplicated file's URL: figma.com/file/[FILE_KEY]/...\n\t</p>\n\t<button id=\"use-file-key\" style=\"margin-top: 8px\">Use This File Key</button>\n</div>\n\n<div class=\"run-plugin-buttons\">\n\t<button id=\"extract-btn\" style=\"display: none\">Create Instances</button>\n\t<button id=\"cancel\">Cancel</button>\n</div>\n\n<script>\n\tconst COMMUNITY_FILE_KEY = \"1385659531316001292\";\n\tconst FIGMA_API_BASE = \"https://api.figma.com/v1\";\n\n\tconst statusDiv = document.getElementById(\"status\");\n\tconst extractButton = document.getElementById(\"extract-btn\");\n\tconst cancelButton = document.getElementById(\"cancel\");\n\tconst instructions = document.getElementById(\"instructions\");\n\tconst fileKeySection = document.getElementById(\"file-key-section\");\n\tconst fileKeyInput = document.getElementById(\"file-key-input\");\n\tconst useFileKeyButton = document.getElementById(\"use-file-key\");\n\tconst componentsSection = document.getElementById(\"components-section\");\n\tconst componentNamesInput = document.getElementById(\"component-names-input\");\n\n\tlet availableComponents = [];\n\n\tfunction updateStatus(message, type = \"\") {\n\t\tstatusDiv.textContent = message;\n\t\tstatusDiv.className = type;\n\t}\n\n\tfunction getPageNamesFromInput() {\n\t\tif (!componentNamesInput) return [];\n\t\tconst input = componentNamesInput.value.trim();\n\t\tif (!input) return [];\n\n\t\t// Split by comma and clean up each page name\n\t\treturn input\n\t\t\t.split(\",\")\n\t\t\t.map((name) => name.trim())\n\t\t\t.filter((name) => name.length > 0);\n\t}\n\n\t// Recursively find all component keys in the API response\n\tfunction findComponentKeys(node, components) {\n\t\tif (node.type === \"COMPONENT\" && node.id) {\n\t\t\tcomponents.push(node.id);\n\t\t}\n\n\t\tif (node.children && Array.isArray(node.children)) {\n\t\t\tfor (const child of node.children) {\n\t\t\t\tfindComponentKeys(child, components);\n\t\t\t}\n\t\t}\n\t}\n\n\t// Request components from the current file\n\tfunction requestComponentsFromCurrentFile() {\n\t\tupdateStatus(\"Loading components from current file...\");\n\t\tparent.postMessage(\n\t\t\t{\n\t\t\t\tpluginMessage: {\n\t\t\t\t\ttype: \"load-components\",\n\t\t\t\t},\n\t\t\t},\n\t\t\t\"*\"\n\t\t);\n\t}\n\n\t// Create instances for all components from specified pages\n\tfunction createSelectedInstances() {\n\t\tconst pageNames = getPageNamesFromInput();\n\t\tif (pageNames.length === 0) {\n\t\t\tupdateStatus(\"Please enter at least one page name.\", \"error\");\n\t\t\treturn;\n\t\t}\n\t\tupdateStatus(`Finding components from ${pageNames.length} page(s)...`);\n\t\textractButton.disabled = true;\n\t\tparent.postMessage(\n\t\t\t{\n\t\t\t\tpluginMessage: {\n\t\t\t\t\ttype: \"create-instances\",\n\t\t\t\t\tpageNames: pageNames,\n\t\t\t\t},\n\t\t\t},\n\t\t\t\"*\"\n\t\t);\n\t}\n\n\t// Listen for messages from the plugin code\n\twindow.onmessage = (event) => {\n\t\tconst msg = event.data.pluginMessage;\n\t\tif (msg) {\n\t\t\tif (msg.type === \"status\") {\n\t\t\t\tupdateStatus(msg.message);\n\t\t\t\t// Keep extract button disabled while processing\n\t\t\t\tif (extractButton && msg.message.includes(\"Creating instances\")) {\n\t\t\t\t\textractButton.disabled = true;\n\t\t\t\t}\n\t\t\t} else if (msg.type === \"success\") {\n\t\t\t\tupdateStatus(msg.message, \"success\");\n\t\t\t\t// Re-enable extract button\n\t\t\t\tif (extractButton) {\n\t\t\t\t\textractButton.disabled = false;\n\t\t\t\t}\n\t\t\t} else if (msg.type === \"error\") {\n\t\t\t\tupdateStatus(msg.message, \"error\");\n\t\t\t\t// Re-enable extract button on error\n\t\t\t\tif (extractButton) {\n\t\t\t\t\textractButton.disabled = false;\n\t\t\t\t}\n\t\t\t\t// Show file key input on error\n\t\t\t\tif (fileKeySection) {\n\t\t\t\t\tfileKeySection.style.display = \"block\";\n\t\t\t\t}\n\t\t\t} else if (msg.type === \"components-loaded\") {\n\t\t\t\tif (msg.components && msg.components.length > 0) {\n\t\t\t\t\t// Store available components for reference\n\t\t\t\t\tavailableComponents = msg.components;\n\n\t\t\t\t\t// Show simple ready message - don't show component count until user searches\n\t\t\t\t\tupdateStatus(\"Ready. Enter page names in the textarea below.\", \"\");\n\n\t\t\t\t\tif (componentsSection) {\n\t\t\t\t\t\tcomponentsSection.style.display = \"block\";\n\t\t\t\t\t}\n\t\t\t\t\tif (extractButton) {\n\t\t\t\t\t\textractButton.style.display = \"block\";\n\t\t\t\t\t}\n\t\t\t\t} else {\n\t\t\t\t\tupdateStatus(\n\t\t\t\t\t\t\"No components found in current file. Make sure you're running this in the duplicated Community file.\",\n\t\t\t\t\t\t\"error\"\n\t\t\t\t\t);\n\t\t\t\t\tif (fileKeySection) {\n\t\t\t\t\t\tfileKeySection.style.display = \"block\";\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t};\n\n\t// Load components when UI is ready\n\tsetTimeout(() => {\n\t\trequestComponentsFromCurrentFile();\n\t}, 100);\n\n\t// Set up extract button\n\tif (extractButton) {\n\t\textractButton.onclick = () => {\n\t\t\tcreateSelectedInstances();\n\t\t};\n\t}\n\n\t// Handle file key input\n\tif (useFileKeyButton && fileKeyInput) {\n\t\tuseFileKeyButton.onclick = () => {\n\t\t\tconst fileKey = fileKeyInput.value.trim();\n\t\t\tif (fileKey) {\n\t\t\t\tupdateStatus(\"Using provided file key...\");\n\t\t\t\tparent.postMessage(\n\t\t\t\t\t{\n\t\t\t\t\t\tpluginMessage: {\n\t\t\t\t\t\t\ttype: \"use-file-key\",\n\t\t\t\t\t\t\tfileKey: fileKey,\n\t\t\t\t\t\t},\n\t\t\t\t\t},\n\t\t\t\t\t\"*\"\n\t\t\t\t);\n\t\t\t}\n\t\t};\n\t}\n\n\tcancelButton.onclick = () => {\n\t\tparent.postMessage({ pluginMessage: { type: \"cancel\" } }, \"*\");\n\t};\n</script>\n";


const COMMUNITY_FILE_KEY = '1385659531316001292';
const VERTICAL_SPACING = 64; // Space between components in the same page column
const HORIZONTAL_SPACING = 128; // Space between page columns

// Pages to exclude from component import
const EXCLUDED_PAGES = [
  'Examples',
  'App icons',
  'Bezels',
  'Color wells and pickers',
  'System',
  'Wallpapers',
  'Widgets',
  'Colors',
  'Materials',
  'Layout guides and safe areas',
  '_Kit helpers'
];

// Store components by ID for quick lookup
const componentsMap = new Map<string, ComponentNode>();

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

// Extract all components from the current file, excluding specified pages
async function extractComponentsFromCurrentFile(): Promise<{
  components: ComponentNode[];
  excludedPages: string[];
  allPages: Array<{ name: string; components: ComponentNode[] }>;
}> {
  const allComponents: ComponentNode[] = [];
  const excludedPages: string[] = [];
  const allPages: Array<{ name: string; components: ComponentNode[] }> = [];

  // Load all pages first - this is required before accessing page.children
  await figma.loadAllPagesAsync();

  // Traverse all pages in the current file
  for (const page of figma.root.children) {
    if (page.type === 'PAGE') {
      const pageName = page.name;
      
      // Check if this page should be excluded
      if (EXCLUDED_PAGES.indexOf(pageName) !== -1) {
        excludedPages.push(pageName);
        continue; // Skip this page
      }

      const pageComponents = findAllComponents(page);
      allComponents.push(...pageComponents);
      
      // Store page info for later lookup
      allPages.push({
        name: pageName,
        components: pageComponents
      });
    }
  }

  // Store components in map for quick lookup
  componentsMap.clear();
  for (const component of allComponents) {
    componentsMap.set(component.id, component);
  }

  return { components: allComponents, excludedPages, allPages };
}

// Extract components from specific pages by name, grouped by page
async function extractComponentsFromPages(pageNames: string[]): Promise<Array<{ pageName: string; components: ComponentNode[] }>> {
  const pageGroups: Array<{ pageName: string; components: ComponentNode[] }> = [];
  
  // Load all pages first
  await figma.loadAllPagesAsync();
  
  // Normalize requested page names (case-insensitive)
  const normalizedPageNames = pageNames.map(name => name.trim().toLowerCase());
  
  // Traverse all pages in the current file
  for (const page of figma.root.children) {
    if (page.type === 'PAGE') {
      const pageName = page.name;
      const normalizedPageName = pageName.toLowerCase();
      
      // Check if this page is in the requested list (case-insensitive)
      if (normalizedPageNames.indexOf(normalizedPageName) !== -1) {
        // Skip if this page is in the excluded list
        if (EXCLUDED_PAGES.indexOf(pageName) === -1) {
          const pageComponents = findAllComponents(page);
          if (pageComponents.length > 0) {
            pageGroups.push({
              pageName: pageName,
              components: pageComponents
            });
          }
        }
      }
    }
  }
  
  return pageGroups;
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
  componentIds?: string[];
  componentNames?: string[];
  pageNames?: string[];
}) => {
  console.log('Received message from UI:', JSON.stringify(msg));
  try {
    if (msg.type === 'load-components') {
      // Load components from the current file and send to UI
      console.log('Loading components from current file...');
      figma.ui.postMessage({ type: 'status', message: 'Loading components from current file...' });

      (async () => {
        try {
          const { components, excludedPages, allPages } = await extractComponentsFromCurrentFile();
          console.log('Found components:', components.length);
          console.log('Excluded pages:', excludedPages);

          if (components.length === 0) {
            figma.ui.postMessage({
              type: 'error',
              message: 'No components found in current file. Make sure you\'re running this in the duplicated iOS 18 Community file.'
            });
            return;
          }

          // Send component list to UI with names and IDs, along with excluded pages info
          const componentList = components.map(comp => ({
            id: comp.id,
            name: comp.name
          }));

          figma.ui.postMessage({
            type: 'components-loaded',
            components: componentList,
            excludedPages: excludedPages,
            allPages: allPages.map((p: { name: string; components: ComponentNode[] }) => p.name)
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error during extraction';
          console.error('Error extracting components:', error);
          figma.ui.postMessage({
            type: 'error',
            message: `Error: ${errorMessage}`
          });
        }
      })();

    } else if (msg.type === 'create-instances') {
      // Create instances for all components from specified pages
      if (!msg.pageNames || msg.pageNames.length === 0) {
        figma.ui.postMessage({
          type: 'error',
          message: 'No page names provided.'
        });
        return;
      }

      console.log('Creating instances for components from pages:', msg.pageNames);
      figma.ui.postMessage({
        type: 'status',
        message: `Finding components from ${msg.pageNames.length} page(s)...`
      });

      (async () => {
        try {
          // Get components grouped by page
          const pageGroups = await extractComponentsFromPages(msg.pageNames!);
          
          // Count total components
          const totalComponents = pageGroups.reduce((sum, group) => sum + group.components.length, 0);
          
          if (totalComponents === 0) {
            figma.ui.postMessage({
              type: 'error',
              message: `No components found on the specified pages. Please check the page names and try again.`
            });
            return;
          }

          figma.ui.postMessage({
            type: 'status',
            message: `Found ${totalComponents} component(s) from ${pageGroups.length} page(s). Creating instances...`
          });

          const instances: InstanceNode[] = [];
          let currentX = 0; // X position for the current page column
          let successCount = 0;
          let totalCreated = 0;

          // Process each page group
          for (const pageGroup of pageGroups) {
            let currentY = 0; // Y position within the current page column
            let maxColumnWidth = 0; // Track the widest component in this column

            // Place all components from this page vertically
            for (const component of pageGroup.components) {
              try {
                // Create an instance of the component
                const instance = component.createInstance();

                // Position the instance
                instance.x = currentX;
                instance.y = currentY;

                // Track max width for this column (for horizontal spacing)
                if (instance.width > maxColumnWidth) {
                  maxColumnWidth = instance.width;
                }

                // Add to current page
                figma.currentPage.appendChild(instance);
                instances.push(instance);
                successCount++;
                totalCreated++;

                // Move down for next component in this page column
                currentY += instance.height + VERTICAL_SPACING;

                // Update progress
                if (totalCreated % 10 === 0 || totalCreated === totalComponents) {
                  figma.ui.postMessage({
                    type: 'status',
                    message: `Created ${totalCreated}/${totalComponents} instances...`
                  });
                }
              } catch (error) {
                console.error(`Error creating instance (${component.name} from ${pageGroup.pageName}):`, error);
                // Continue with next component
              }
            }

            // Move to the right for the next page column
            // Add the max width of this column plus horizontal spacing
            currentX += maxColumnWidth + HORIZONTAL_SPACING;
          }

          // Select all instances and zoom to fit
          if (instances.length > 0) {
            figma.currentPage.selection = instances;
            figma.viewport.scrollAndZoomIntoView(instances);

            figma.ui.postMessage({
              type: 'success',
              message: `Successfully created ${successCount} component instance(s)!`
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
          const errorMessage = error instanceof Error ? error.message : 'Unknown error during instance creation';
          console.error('Error creating instances:', error);
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
