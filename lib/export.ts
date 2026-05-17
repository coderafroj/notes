import jsPDF from 'jspdf'
import { toPng } from 'html-to-image'
import TurndownService from 'turndown'

export async function exportToPDF(title: string, selector: string = '.tiptap') {
  const element = document.querySelector(selector) as HTMLElement
  if (!element) return

  try {
    const imgData = await toPng(element, {
      quality: 1.0,
      backgroundColor: '#ffffff',
      pixelRatio: 5, // Higher scale for extreme sharpness on zoom
      style: {
        padding: '60px',
        width: '850px', // Standard A4 width-ish
        background: '#ffffff',
        margin: '0',
      }
    })
    
    // Calculate aspect ratio and dimensions for A4 page
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })
    
    const imgWidth = 210 // A4 width in mm
    const pageHeight = 297 // A4 height in mm
    
    // Create an image object to get its natural dimensions
    const img = new Image()
    img.src = imgData
    
    await new Promise((resolve) => {
      img.onload = resolve
    })

    const imgHeight = (img.height * imgWidth) / img.width
    let heightLeft = imgHeight
    let position = 0
    
    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST')
    heightLeft -= pageHeight
    
    // Add subsequent pages if content is long
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST')
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
