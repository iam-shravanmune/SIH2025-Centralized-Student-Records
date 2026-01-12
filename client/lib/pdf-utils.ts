// PDF generation utilities using browser's print functionality as fallback
export class PDFGenerator {
  static async generatePortfolioPDF(data: any, filename: string) {
    // Create HTML content for printing
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Portfolio Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { font-size: 24px; font-weight: bold; margin-bottom: 20px; }
          .section { margin-bottom: 15px; }
          .item { margin-bottom: 10px; padding: 10px; border: 1px solid #ddd; }
          .skills { color: #666; font-size: 12px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">Portfolio Report</div>
        <div class="section">
          <strong>Student:</strong> ${data.student || 'N/A'}<br>
          <strong>Generated:</strong> ${new Date(data.generatedAt || Date.now()).toLocaleDateString()}
        </div>
        <div class="section">
          <h3>Portfolio Items:</h3>
          ${data.items?.map((item: any, index: number) => `
            <div class="item">
              <strong>${index + 1}. ${item.title}</strong><br>
              <strong>Category:</strong> ${item.category}<br>
              <div class="skills"><strong>Skills:</strong> ${item.skills?.join(', ') || 'N/A'}</div>
              <strong>Relevance:</strong> ${item.relevanceScore}%
            </div>
          `).join('') || 'No items available'}
        </div>
      </body>
      </html>
    `;
    
    // Open in new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  }

  static async generateAnalysisPDF(data: any, filename: string) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Certificate Analysis Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { font-size: 24px; font-weight: bold; margin-bottom: 20px; }
          .section { margin-bottom: 15px; }
          .overview { background: #f5f5f5; padding: 15px; border-radius: 5px; }
          .suggestion { margin-bottom: 15px; padding: 10px; border: 1px solid #ddd; }
          .match-score { color: #007bff; font-weight: bold; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">Certificate Analysis Report</div>
        <div class="section">
          <strong>Student:</strong> ${data.student || 'N/A'}<br>
          <strong>Analyzed:</strong> ${new Date(data.analyzedAt || Date.now()).toLocaleDateString()}
        </div>
        <div class="overview">
          <h3>Overview:</h3>
          <strong>Total Skills:</strong> ${data.analysis?.overallProfile?.totalSkills?.length || 0}<br>
          <strong>Job Matches:</strong> ${data.analysis?.resumeSuggestions?.length || 0}<br>
          <strong>Strengths:</strong> ${data.analysis?.overallProfile?.strengths?.join(', ') || 'N/A'}
        </div>
        ${data.analysis?.resumeSuggestions?.length > 0 ? `
          <div class="section">
            <h3>Resume Suggestions:</h3>
            ${data.analysis.resumeSuggestions.map((suggestion: any, index: number) => `
              <div class="suggestion">
                <strong>${index + 1}. ${suggestion.jobTitle}</strong><br>
                <span class="match-score">Match: ${suggestion.overallMatch}%</span><br>
                <strong>Priority:</strong> ${suggestion.priority}<br>
                <strong>Reason:</strong> ${suggestion.reasoning}
              </div>
            `).join('')}
          </div>
        ` : ''}
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  }

  static async generateResumePDF(data: any, filename: string) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Resume - ${data.name || 'Resume'}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 30px; }
          .name { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .contact { font-size: 14px; color: #666; }
          .section { margin-bottom: 25px; }
          .section-title { font-size: 18px; font-weight: bold; border-bottom: 2px solid #333; padding-bottom: 5px; margin-bottom: 15px; }
          .section-content { font-size: 14px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="name">${data.name || 'Resume'}</div>
          <div class="contact">
            ${data.email ? `Email: ${data.email}` : ''}
            ${data.phone ? ` | Phone: ${data.phone}` : ''}
            ${data.location ? ` | Location: ${data.location}` : ''}
            ${data.linkedin ? ` | LinkedIn: ${data.linkedin}` : ''}
            ${data.github ? ` | GitHub: ${data.github}` : ''}
          </div>
        </div>
        ${data.sections?.map((section: any) => `
          <div class="section">
            <div class="section-title">${section.title}</div>
            <div class="section-content">${section.content.replace(/\n/g, '<br>')}</div>
          </div>
        `).join('') || ''}
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  }

  static async generateEventPDF(data: any, filename: string) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Event Suggestions Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { font-size: 24px; font-weight: bold; margin-bottom: 20px; }
          .section { margin-bottom: 15px; }
          .event { margin-bottom: 15px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
          .event-title { font-size: 16px; font-weight: bold; margin-bottom: 8px; }
          .event-details { font-size: 14px; color: #666; }
          .skills { margin-top: 8px; }
          .skill-tag { display: inline-block; background: #e9ecef; padding: 2px 6px; margin: 2px; border-radius: 3px; font-size: 12px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">Event Suggestions Report</div>
        <div class="section">
          <strong>Generated:</strong> ${new Date().toLocaleDateString()}<br>
          <strong>Total Events:</strong> ${data.events?.length || 0}
        </div>
        <div class="section">
          <h3>Recommended Events:</h3>
          ${data.events?.map((event: any, index: number) => `
            <div class="event">
              <div class="event-title">${index + 1}. ${event.title}</div>
              <div class="event-details">
                <strong>Type:</strong> ${event.type} | 
                <strong>Date:</strong> ${event.date} | 
                <strong>Location:</strong> ${event.location}<br>
                <strong>Organizer:</strong> ${event.organizer}<br>
                <div class="skills">
                  <strong>Skills:</strong> 
                  ${event.skills?.map((skill: string) => `<span class="skill-tag">${skill}</span>`).join('') || 'N/A'}
                </div>
              </div>
            </div>
          `).join('') || 'No events available'}
        </div>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  }
}
