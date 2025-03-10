import { PRFAQ, ExportFormat } from '../types';

// Helper function to convert PRFAQ to plain text
const prfaqToText = (prfaq: PRFAQ): string => {
  const { title, pressRelease, faq, customerFaqs, stakeholderFaqs } = prfaq;
  
  // Format press release
  const pressReleaseText = `
# ${title}

## Press Release

### Summary
${pressRelease.summary}

### Problem
${pressRelease.problem}

### Solution
${pressRelease.solution}

### Executive Quote
${pressRelease.executiveQuote}

### Customer Journey
${pressRelease.customerJourney}

### Customer Testimonial
${pressRelease.customerQuote}

### Getting Started
${pressRelease.gettingStarted}
`;

  // Format main FAQ
  const faqText = faq.map((item, index) => {
    return `
Q${index + 1}: ${item.question}
A${index + 1}: ${item.answer}
`;
  }).join('\n');

  // Format customer FAQs
  const customerFaqText = customerFaqs && customerFaqs.length > 0 
    ? customerFaqs.map((item, index) => {
      return `
Q${index + 1}: ${item.question}
A${index + 1}: ${item.answer}
`;
    }).join('\n')
    : 'No customer FAQs available.';

  // Format stakeholder FAQs
  const stakeholderFaqText = stakeholderFaqs && stakeholderFaqs.length > 0
    ? stakeholderFaqs.map((item, index) => {
      return `
Q${index + 1}: ${item.question}
A${index + 1}: ${item.answer}
`;
    }).join('\n')
    : 'No stakeholder FAQs available.';

  return `${pressReleaseText}

## Frequently Asked Questions
${faqText}

## Customer FAQs
${customerFaqText}

## Stakeholder FAQs
${stakeholderFaqText}
`;
};

// Export PRFAQ as plain text
export const exportAsTxt = (prfaq: PRFAQ): void => {
  const text = prfaqToText(prfaq);
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${prfaq.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_prfaq.txt`;
  link.click();
  
  URL.revokeObjectURL(url);
};

// Export PRFAQ as PDF (using browser print functionality)
export const exportAsPdf = (prfaq: PRFAQ): void => {
  try {
    // Create HTML content for PDF
    const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${prfaq.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #333; text-align: center; }
          h2 { color: #555; border-bottom: 1px solid #eee; padding-bottom: 10px; }
          .section { margin-bottom: 20px; }
          .question { font-weight: bold; margin-top: 15px; }
          .answer { margin-left: 20px; }
        </style>
      </head>
      <body>
        <h1>${prfaq.title}</h1>
        
        <h2>Press Release</h2>
        
        <h3>Summary</h3>
        <div class="section">${prfaq.pressRelease.summary}</div>
        
        <h3>Problem</h3>
        <div class="section">${prfaq.pressRelease.problem}</div>
        
        <h3>Solution</h3>
        <div class="section">${prfaq.pressRelease.solution}</div>
        
        <h3>Executive Quote</h3>
        <div class="section">${prfaq.pressRelease.executiveQuote}</div>
        
        <h3>Customer Journey</h3>
        <div class="section">${prfaq.pressRelease.customerJourney}</div>
        
        <h3>Customer Testimonial</h3>
        <div class="section">${prfaq.pressRelease.customerQuote}</div>
        
        <h3>Getting Started</h3>
        <div class="section">${prfaq.pressRelease.gettingStarted}</div>
        
        <h2>Frequently Asked Questions</h2>
        ${prfaq.faq.map((item, index) => `
          <div class="faq-item">
            <div class="question">Q${index + 1}: ${item.question}</div>
            <div>A${index + 1}: ${item.answer}</div>
          </div>
        `).join('')}
        
        <h2>Customer FAQs</h2>
        ${prfaq.customerFaqs && prfaq.customerFaqs.length > 0 ? 
          prfaq.customerFaqs.map((item, index) => `
            <div class="faq-item">
              <div class="question">Q${index + 1}: ${item.question}</div>
              <div>A${index + 1}: ${item.answer}</div>
            </div>
          `).join('') : 
          '<div class="section">No customer FAQs available.</div>'
        }
        
        <h2>Stakeholder FAQs</h2>
        ${prfaq.stakeholderFaqs && prfaq.stakeholderFaqs.length > 0 ? 
          prfaq.stakeholderFaqs.map((item, index) => `
            <div class="faq-item">
              <div class="question">Q${index + 1}: ${item.question}</div>
              <div>A${index + 1}: ${item.answer}</div>
            </div>
          `).join('') : 
          '<div class="section">No stakeholder FAQs available.</div>'
        }
      </body>
    </html>
  `;
  
  // Create an iframe to print from
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  
  iframe.contentWindow?.document.open();
  iframe.contentWindow?.document.write(htmlContent);
  iframe.contentWindow?.document.close();
  
  // Wait for content to load before printing
  setTimeout(() => {
    iframe.contentWindow?.print();
    
    // Clean up
    document.body.removeChild(iframe);
  }, 500);
  } catch (error) {
    console.error('Error in exportAsPdf:', error);
  }
};

// Export PRFAQ as DOCX (simplified version - creates HTML and prompts download)
export const exportAsDocx = (prfaq: PRFAQ): void => {
  try {
    // Create HTML content for Word
    const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${prfaq.title}</title>
        <style>
          /* Basic styling for Word export */
          body { font-family: Calibri, Arial, sans-serif; margin: 20px; }
          h1 { font-size: 18pt; color: #2F5496; }
          h2 { font-size: 16pt; color: #2F5496; margin-top: 20px; }
          h3 { font-size: 14pt; color: #2F5496; }
          p { font-size: 11pt; line-height: 1.5; }
          .question { font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>${prfaq.title}</h1>
        
        <h2>Press Release</h2>
        
        <h3>Summary</h3>
        <p>${prfaq.pressRelease.summary}</p>
        
        <h3>Problem</h3>
        <p>${prfaq.pressRelease.problem}</p>
        
        <h3>Solution</h3>
        <p>${prfaq.pressRelease.solution}</p>
        
        <h3>Executive Quote</h3>
        <p>${prfaq.pressRelease.executiveQuote}</p>
        
        <h3>Customer Journey</h3>
        <p>${prfaq.pressRelease.customerJourney}</p>
        
        <h3>Customer Testimonial</h3>
        <p>${prfaq.pressRelease.customerQuote}</p>
        
        <h3>Getting Started</h3>
        <p>${prfaq.pressRelease.gettingStarted}</p>
        
        <h2>Frequently Asked Questions</h2>
        ${prfaq.faq.map((item, index) => `
          <p><strong>Q${index + 1}: ${item.question}</strong></p>
          <p>A${index + 1}: ${item.answer}</p>
        `).join('')}
        
        <h2>Customer FAQs</h2>
        ${prfaq.customerFaqs && prfaq.customerFaqs.length > 0 ? 
          prfaq.customerFaqs.map((item, index) => `
            <p><strong>Q${index + 1}: ${item.question}</strong></p>
            <p>A${index + 1}: ${item.answer}</p>
          `).join('') : 
          '<p>No customer FAQs available.</p>'
        }
        
        <h2>Stakeholder FAQs</h2>
        ${prfaq.stakeholderFaqs && prfaq.stakeholderFaqs.length > 0 ? 
          prfaq.stakeholderFaqs.map((item, index) => `
            <p><strong>Q${index + 1}: ${item.question}</strong></p>
            <p>A${index + 1}: ${item.answer}</p>
          `).join('') : 
          '<p>No stakeholder FAQs available.</p>'
        }
      </body>
    </html>
  `;
  
  const blob = new Blob([htmlContent], { type: 'application/vnd.ms-word' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${prfaq.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_prfaq.doc`;
  link.click();
  
  URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error in exportAsDocx:', error);
  }
};

// Send PRFAQ via email
export const sendViaEmail = (prfaq: PRFAQ, email?: string): void => {
  console.log('sendViaEmail called');
  try {
    // Create a mailto link with the PRFAQ content
    const subject = encodeURIComponent(`PRFAQ: ${prfaq.title}`);
    const body = encodeURIComponent(prfaqToText(prfaq));
    
    // Open the default email client
    window.location.href = `mailto:${email || ''}?subject=${subject}&body=${body}`;
    console.log('Email client opened');
  } catch (error) {
    console.error('Error sending email:', error);
    alert('Failed to open email client. Please try another export format.');
  }
};

// Export PRFAQ as Markdown
export const exportAsMarkdown = (prfaq: PRFAQ): void => {
  // Use the existing prfaqToText function which already formats in Markdown
  const markdown = prfaqToText(prfaq);
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${prfaq.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_prfaq.md`;
  link.click();
  
  URL.revokeObjectURL(url);
};

// Main export function
export const exportPRFAQ = (prfaq: PRFAQ, format: ExportFormat): void => {
  // For debugging
  console.log('Exporting PRFAQ in format:', format);
  console.log('PRFAQ data:', {
    title: prfaq.title,
    pressReleaseKeys: Object.keys(prfaq.pressRelease || {}),
    faqCount: prfaq.faq?.length || 0,
    customerFaqCount: prfaq.customerFaqs?.length || 0,
    stakeholderFaqCount: prfaq.stakeholderFaqs?.length || 0
  });
  
  try {
    switch (format) {
      case 'pdf':
        console.log('Exporting as PDF');
        exportAsPdf(prfaq);
        break;
      case 'docx':
        console.log('Exporting as DOCX');
        exportAsDocx(prfaq);
        break;
      case 'txt':
        console.log('Exporting as TXT');
        exportAsTxt(prfaq);
        break;
      case 'email':
        console.log('Sending via Email');
        sendViaEmail(prfaq);
        break;
      case 'markdown':
        console.log('Exporting as Markdown');
        exportAsMarkdown(prfaq);
        break;
      default:
        console.error(`Unsupported export format: ${format}`);
    }
    console.log('Export completed successfully');
  } catch (error) {
    console.error('Error in exportPRFAQ:', error);
  }
};

const exportUtils = {
  prfaqToText,
  exportPRFAQ
};

export default exportUtils; 