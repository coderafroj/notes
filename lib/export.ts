import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import TurndownService from 'turndown'

export async function exportToPDF(title: string, selector: string = '.tiptap') {
  const element = document.querySelector(selector) as HTMLElement
  if (!element) return

  try {
    const canvas = await html2canvas(element, {
      scale: 3, // Higher scale for better quality
      useCORS: true,
      logging: false,
      backgroundColor: getComputedStyle(document.body).getPropertyValue('--background').trim() || '#ffffff',
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.querySelector(selector) as HTMLElement
        if (clonedElement) {
          // Explicitly set colors to ensure they are captured correctly without depending on CSS variable inheritance
          clonedElement.style.color = getComputedStyle(element).color
          clonedElement.style.background = getComputedStyle(element).backgroundColor
          clonedElement.style.padding = '40px'
          clonedElement.style.borderRadius = '0'
          
          // Ensure marks (highlights) are captured
          const marks = clonedElement.querySelectorAll('mark')
          marks.forEach(mark => {
            const originalMark = document.querySelector('mark')
            if (originalMark) {
              mark.style.backgroundColor = getComputedStyle(originalMark).backgroundColor
              mark.style.color = getComputedStyle(originalMark).color
            }
          })
        }
      }
    })
    
    // Calculate aspect ratio and dimensions for A4 page
    const imgData = canvas.toDataURL('image/png', 1.0)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt', // Using points for more precision
      format: 'a4',
    })
    
    const margin = 20
    const pdfWidth = pdf.internal.pageSize.getWidth() - (margin * 2)
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width
    const pageHeight = pdf.internal.pageSize.getHeight()
    
    let heightLeft = pdfHeight
    let position = margin
    
    // Add first page
    pdf.addImage(imgData, 'PNG', margin, position, pdfWidth, pdfHeight, undefined, 'FAST')
    heightLeft -= (pageHeight - (margin * 2))
    
    // Add subsequent pages if content is long
    while (heightLeft > 0) {
      position = heightLeft - pdfHeight + margin
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', margin, position, pdfWidth, pdfHeight, undefined, 'FAST')
      heightLeft -= pageHeight
    }
    
    pdf.save(`${title.toLowerCase().replace(/\s+/g, '-')}.pdf`)
  } catch (error) {
    console.error('Failed to export PDF:', error)
  }
}

export function exportToMarkdown(title: string, htmlContent: string) {
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced'
  })
  
  const markdown = turndownService.turndown(htmlContent)
  
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${title.toLowerCase().replace(/\s+/g, '-')}.md`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
