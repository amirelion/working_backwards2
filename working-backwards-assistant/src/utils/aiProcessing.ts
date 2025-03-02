export async function processInitialThoughts(text: string) {
  try {
    // Call your backend API that will process the text with OpenAI
    const response = await fetch('/api/process-thoughts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error('Failed to process thoughts');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in AI processing:', error);
    throw error;
  }
} 