// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // We expect message to contain: { url, title, text, scrollDepth }
  // We need to transform it to: { user_id, url, title, content, screenshot_url }

  chrome.storage.local.get('user_id', async (result) => {
    const userId = result.user_id;

    if (!userId) {
      console.log('User not logged in. Skipping capture.');
      return;
    }

    const payload = {
      user_id: userId,
      url: message.url,
      title: message.title,
      content: message.text, // Mapping 'text' from content.js to 'content'
      screenshot_url: null // Placeholder as per requirements
    };

    try {
      const response = await fetch('http://localhost:8086/api/v1/webhook/capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.error('Failed to send capture data:', response.status);
      } else {
        console.log('Capture data sent successfully for user:', userId);
      }
    } catch (error) {
      console.error('Error sending capture data:', error);
    }
  });

  // Return true to indicate async response (though we aren't using sendResponse actively here, it's good practice)
  return true;
});
