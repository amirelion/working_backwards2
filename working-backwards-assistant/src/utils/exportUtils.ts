import { PRFAQ, ExportFormat } from '../types';

// Helper function to convert PRFAQ to plain text
const prfaqToText = (prfaq: PRFAQ): string => {
  const { title, date, pressRelease, faq, customerFaqs, stakeholderFaqs } = prfaq;
  
  // Format press release
  const pressReleaseText = `
# ${title}
Date: ${date}

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
  // Create a temporary div to hold the formatted content
  const tempDiv = document.createElement('div');
  tempDiv.style.display = 'none';
  document.body.appendChild(tempDiv);
  
  // Format the content with basic styling
  tempDiv.innerHTML = `
    <html>
      <head>
        <title>${prfaq.title} - PRFAQ</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #232F3E; }
          h2 { color: #232F3E; margin-top: 20px; }
          h3 { color: #232F3E; }
          .date { color: #555; margin-bottom: 20px; }
          .section { margin-bottom: 15px; }
          .faq-item { margin-bottom: 15px; }
          .question { font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>${prfaq.title}</h1>
        <div class="date">Date: ${prfaq.date}</div>
        
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
  iframe.contentWindow?.document.write(tempDiv.innerHTML);
  iframe.contentWindow?.document.close();
  
  // Wait for content to load before printing
  setTimeout(() => {
    iframe.contentWindow?.print();
    
    // Clean up
    document.body.removeChild(tempDiv);
    document.body.removeChild(iframe);
  }, 500);
};

// Export PRFAQ as DOCX (simplified version - creates HTML and prompts download)
export const exportAsDocx = (prfaq: PRFAQ): void => {
  // For a proper DOCX export, you would typically use a library like docx.js
  // This is a simplified version that creates HTML with MS Word compatibility
  
  const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" 
          xmlns:w="urn:schemas-microsoft-com:office:word" 
          xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>${prfaq.title} - PRFAQ</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>90</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          body { font-family: 'Calibri', sans-serif; }
          h1 { color: #232F3E; }
          h2 { color: #232F3E; margin-top: 20px; }
          h3 { color: #232F3E; }
        </style>
      </head>
      <body>
        <h1>${prfaq.title}</h1>
        <p>Date: ${prfaq.date}</p>
        
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
};

// Send PRFAQ via email
export const sendViaEmail = (prfaq: PRFAQ, email?: string): void => {
  const subject = encodeURIComponent(`${prfaq.title} - PRFAQ`);
  const body = encodeURIComponent(prfaqToText(prfaq));
  
  // If email is provided, use mailto with to field
  const mailtoLink = email 
    ? `mailto:${email}?subject=${subject}&body=${body}`
    : `mailto:?subject=${subject}&body=${body}`;
  
  window.open(mailtoLink);
};

// Main export function
export const exportPRFAQ = (prfaq: PRFAQ, format: ExportFormat): void => {
  switch (format) {
    case 'pdf':
      exportAsPdf(prfaq);
      break;
    case 'docx':
      exportAsDocx(prfaq);
      break;
    case 'txt':
      exportAsTxt(prfaq);
      break;
    case 'email':
      sendViaEmail(prfaq);
      break;
    default:
      console.error(`Unsupported export format: ${format}`);
  }
};

const exportUtils = {
  prfaqToText,
  exportPRFAQ
};

export default exportUtils; 