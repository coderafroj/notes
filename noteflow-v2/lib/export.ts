// lib/export.ts
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import TurndownService from 'turndown'

export async function exportToPDF(title: string, selector = '.tiptap') {
  const el = document.querySelector(selector) as HTMLElement
  if (!el) return
  try {
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, logging: false })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' })
    const pw = pdf.internal.pageSize.getWidth()
    const ph = pdf.internal.pageSize.getHeight()
    const imgH = (canvas.height * pw) / canvas.width
    let pos = 20
    let remaining = imgH
    pdf.addImage(imgData, 'PNG', 20, pos, pw - 40, imgH)
    remaining -= ph - 40
    while (remaining > 0) {
      pdf.addPage()
      pos = -(imgH - remaining) + 20
      pdf.addImage(imgData, 'PNG', 20, pos, pw - 40, imgH)
      remaining -= ph - 40
    }
    pdf.save(`${title.toLowerCase().replace(/\s+/g, '-')}.pdf`)
  } catch (e) {
    console.error('PDF export failed:', e)
  }
}

export function exportToMarkdown(title: string, contentText: string) {
  const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' })
  const md = `# ${title}\n\n${contentText}`
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
