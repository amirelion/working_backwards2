export async function processInitialThoughts(text: string) {
  try {
    // Call your backend API that will process the text with OpenAI
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? window.location.origin
      : '';
    
    console.log('Making API request to process initial thoughts');
    const response = await fetch(`${baseUrl}/api/process-thoughts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    // Handle server error responses
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      
      // If error contains Lambda function invocation failure
      if (errorText.includes('FUNCTION_INVOCATION_FAILED')) {
        throw new Error('The AI service is temporarily unavailable. Your data was saved, but AI suggestions will not be available right now. Please try again later or proceed without AI suggestions.');
      }
      
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || 'API request failed');
      } catch (parseError) {
        throw new Error(`Server error (${response.status}): ${errorText.slice(0, 150)}...`);
      }
    }
    
    // Handle successful response
    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
      console.log('Successfully parsed API response');
    } catch (parseError) {
      console.error('Failed to parse successful response:', responseText.slice(0, 200));
      throw new Error(`Server returned invalid JSON. Your data was saved, but AI suggestions won't be available right now.`);
    }

    console.log('Received data from API:', responseData);
    
    // Format the response to match the expected structure for workingBackwardsQuestions
    // Initialize empty text fields and store AI suggestions separately
    return {
      customer: '',
      problem: '',
      benefit: '',
      validation: '',
      experience: '',
      aiSuggestions: {
        "1. Who is the customer?": responseData["1"] || '',
        "2. What is the customer problem or opportunity?": responseData["2"] || '',
        "3. What is the most important customer benefit?": responseData["3"] || '',
        "4. How do you know what customers need or want?": responseData["4"] || '',
        "5. What does the customer experience look like?": responseData["5"] || ''
      }
    };
  } catch (error) {
    console.error('Error in AI processing:', error);
    throw error;
  }
} 