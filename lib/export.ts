import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import TurndownService from 'turndown'

export async function exportToPDF(title: string, selector: string = '.tiptap') {
  const element = document.querySelector(selector) as HTMLElement
  if (!element) return

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    })
    
    // Calculate aspect ratio and dimensions for A4 page
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: 'a4',
    })
    
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width
    
    let heightLeft = pdfHeight
    let position = 20
    
    // Add first page
    pdf.addImage(imgData, 'PNG', 20, position, pdfWidth - 40, pdfHeight)
    heightLeft -= (pdf.internal.pageSize.getHeight() - 40)
    
    // Add subsequent pages if content is long
    while (heightLeft >= 0) {
      position = heightLeft - pdfHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 20, position, pdfWidth - 40, pdfHeight)
      heightLeft -= pdf.internal.pageSize.getHeight()
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
