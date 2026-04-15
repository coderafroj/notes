import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export async function exportToPDF(title: string, selector = '.tiptap') {
  const el = document.querySelector(selector) as HTMLElement
  if (!el) return
  try {
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, logging: false })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' })
    const w = pdf.internal.pageSize.getWidth()
    const h = (canvas.height * w) / canvas.width
    let left = h; let pos = 20
    pdf.addImage(imgData, 'PNG', 20, pos, w - 40, h)
    left -= (pdf.internal.pageSize.getHeight() - 40)
    while (left >= 0) {
      pos = left - h; pdf.addPage()
      pdf.addImage(imgData, 'PNG', 20, pos, w - 40, h)
      left -= pdf.internal.pageSize.getHeight()
    }
    pdf.save(`${title.toLowerCase().replace(/\s+/g, '-')}.pdf`)
  } catch (e) { console.error(e) }
}

export function exportToMarkdown(title: string, text: string) {
  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.md`
  document.body.appendChild(a); a.click()
  document.body.removeChild(a); URL.revokeObjectURL(url)
}
