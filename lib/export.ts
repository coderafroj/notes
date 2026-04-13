import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import TurndownService from 'turndown'

export async function exportToPDF(title: string, selector: string = '.tiptap') {
  const element = document.querySelector(selector) as HTMLElement
  if (!element) return

  try {
    const canvas = await html2canvas(element, {
      scale: 5, // Higher scale for extreme sharpness on zoom
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.querySelector(selector) as HTMLElement
        if (clonedElement) {
          clonedElement.style.padding = '60px'
          clonedElement.style.width = '850px' // Standard A4 width-ish
          clonedElement.style.background = '#ffffff'

          // ── Normalize only problematic modern colors ─────────
          const allElements = clonedElement.querySelectorAll('*')
          allElements.forEach((el) => {
            const htmlEl = el as HTMLElement
            // Use inline style if available, otherwise computed
            const style = window.getComputedStyle(htmlEl)
            
            const props = ['color', 'backgroundColor', 'borderColor', 'outlineColor']
            props.forEach(prop => {
              const val = (style as any)[prop]
              // Only convert if it contains modern functions that html2canvas fails on
              if (val && (val.includes('lab(') || val.includes('oklch(') || val.includes('hwb('))) {
                // Determine a safe fallback color
                if (prop === 'color') {
                   // If it's a heading or text, use dark gray instead of stripping
                   htmlEl.style.setProperty(prop, '#111827', 'important')
                } else {
                   htmlEl.style.setProperty(prop, 'transparent', 'important')
                }
              }
            })
          })
        }
      }
    })
    
    // Calculate aspect ratio and dimensions for A4 page
    const imgData = canvas.toDataURL('image/jpeg', 0.95)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })
    
    const imgWidth = 210 // A4 width in mm
    const pageHeight = 297 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0
    
    // Add first page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
    
    // Add subsequent pages if content is long
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
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
