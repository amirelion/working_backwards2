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

    let errorData;
    let responseText;
    
    try {
      responseText = await response.text();
      errorData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse response:', responseText);
      throw new Error(`Server returned invalid JSON: ${responseText?.slice(0, 100) || 'No response'}...`);
    }

    if (!response.ok) {
      console.error('API error:', errorData);
      throw new Error(errorData.error || 'Unknown error');
    }

    console.log('Received data from API:', errorData);
    
    // Format the response to match the expected structure for workingBackwardsQuestions
    // Initialize empty text fields and store AI suggestions separately
    return {
      customer: '',
      problem: '',
      benefit: '',
      validation: '',
      experience: '',
      aiSuggestions: {
        "1. Who is the customer?": errorData["1"] || '',
        "2. What is the customer problem or opportunity?": errorData["2"] || '',
        "3. What is the most important customer benefit?": errorData["3"] || '',
        "4. How do you know what customers need or want?": errorData["4"] || '',
        "5. What does the customer experience look like?": errorData["5"] || ''
      }
    };
  } catch (error) {
    console.error('Error in AI processing:', error);
    throw error;
  }
} 