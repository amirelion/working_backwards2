export async function processInitialThoughts(text: string) {
  try {
    // Call your backend API that will process the text with OpenAI
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? window.location.origin
      : '';
    const response = await fetch(`${baseUrl}/api/process-thoughts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API error:', errorData);
      throw new Error(`Failed to process thoughts: ${errorData.error || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Received data from API:', data);
    
    // Format the response to match the expected structure for workingBackwardsQuestions
    // Initialize empty text fields and store AI suggestions separately
    return {
      customer: '',
      problem: '',
      benefit: '',
      validation: '',
      experience: '',
      aiSuggestions: {
        "1. Who is the customer?": data["1"] || '',
        "2. What is the customer problem or opportunity?": data["2"] || '',
        "3. What is the most important customer benefit?": data["3"] || '',
        "4. How do you know what customers need or want?": data["4"] || '',
        "5. What does the customer experience look like?": data["5"] || ''
      }
    };
  } catch (error) {
    console.error('Error in AI processing:', error);
    throw error;
  }
} 