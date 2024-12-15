chrome.contextMenus.create({
    id: "saveAsPng",
    title: "Save Image as PNG",
    contexts: ["image"]
  });
  
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "saveAsPng") {
      console.log("Context menu clicked. Image URL:", info.srcUrl);
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: convertImageToPng,
        args: [info.srcUrl]
      }, () => {
        if (chrome.runtime.lastError) {
          console.error("Error executing script:", chrome.runtime.lastError.message);
        } else {
          console.log("Script executed successfully.");
        }
      });
    }
  });
  
  // Function executed in the active tab
  async function convertImageToPng(imageUrl) {
    // Include extractFilename as part of this function
    function extractFilename(url) {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filename = pathname.substring(pathname.lastIndexOf("/") + 1);
      return filename.split(".")[0] || "image";
    }
  
    try {
      console.log("Starting image conversion for URL:", imageUrl);
  
      const response = await fetch(imageUrl);
      if (!response.ok) {
        console.error("Failed to fetch image:", response.status, response.statusText);
        return;
      }
  
      const blob = await response.blob();
      const bitmap = await createImageBitmap(blob);
  
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
  
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bitmap, 0, 0);
  
      // Use the local extractFilename function
      const originalFilename = extractFilename(imageUrl);
  
      const pngUrl = canvas.toDataURL("image/png");
  
      // Trigger download with the original filename (appending .png)
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = `${originalFilename}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
  
      console.log("Download triggered.");
    } catch (error) {
      console.error("Error in image conversion:", error);
    }
  }
  