'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { calculateResult } from '@/lib/result-logic'
import { CertificatePreview } from '@/components/result-generator/CertificatePreview'
import { db } from '@/lib/db'
import { Mic, MicOff, Save, Download, FileText, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { v4 as uuidv4 } from 'uuid'

// Add speech recognition types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function ResultGeneratorPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const certificateRef = useRef<HTMLDivElement>(null)

  const [studentName, setStudentName] = useState('')
  const [fatherName, setFatherName] = useState('')
  const [rollNumber, setRollNumber] = useState('')
  const [marks, setMarks] = useState('')
  const [admissionDate, setAdmissionDate] = useState('23 APRIL - 26 APRIL')
  
  const [isListening, setIsListening] = useState(false)
  const [activeField, setActiveField] = useState<string | null>(null)
  
  const [isSaving, setIsSaving] = useState(false)
  const [savedResults, setSavedResults] = useState<any[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && !session?.user?.isAdmin) {
      router.push('/')
    }
  }, [status, session, router])

  useEffect(() => {
    loadSavedResults()
  }, [])

  const loadSavedResults = async () => {
    try {
      const results = await db.results.orderBy('createdAt').reverse().toArray()
      setSavedResults(results)
    } catch (error) {
      console.error('Failed to load results:', error)
    }
  }

  const { division, discount, feePerMonth } = calculateResult(Number(marks) || 0)

  const startListening = (field: string, setter: (val: string) => void) => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome.")
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'hi-IN' // Defaulting to Hindi for Indian names/numbers, can be en-IN
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsListening(true)
      setActiveField(field)
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      // If it's roll number or marks, try to parse digits only if possible, but raw string is okay
      let finalVal = transcript.replace(/[^a-zA-Z0-9 ]/g, '')
      if (field === 'marks') {
        finalVal = finalVal.replace(/\D/g, '') // Only digits for marks
      }
      setter(finalVal)
    }

    recognition.onerror = (event: any) => {
      console.error(event.error)
      setIsListening(false)
      setActiveField(null)
    }

    recognition.onend = () => {
      setIsListening(false)
      setActiveField(null)
    }

    recognition.start()
  }

  const handleSaveResult = async () => {
    if (!studentName || !rollNumber || !marks) {
      alert("Please fill at least Student Name, Roll Number, and Marks.")
      return
    }

    setIsSaving(true)
    try {
      const id = uuidv4()
      await db.results.add({
        id,
        studentName,
        fatherName,
        rollNumber,
        marks: Number(marks),
        division,
        discount,
        feePerMonth,
        createdAt: Date.now()
      })
      alert("Result Saved Successfully!")
      loadSavedResults()
    } catch (error) {
      console.error(error)
      alert("Failed to save result.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return

    try {
      setIsSaving(true) 
      
      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')

      // Temporarily remove transform from parent to prevent html2canvas clipping
      const parentElement = certificateRef.current.parentElement
      const originalTransform = parentElement ? parentElement.style.transform : ''
      if (parentElement) parentElement.style.transform = 'none'

      const canvas = await html2canvas(certificateRef.current, { 
        scale: 2, 
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })
      
      if (parentElement) parentElement.style.transform = originalTransform

      const imgData = canvas.toDataURL('image/png', 1.0)
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [794, 1123]
      })
      
      pdf.addImage(imgData, 'PNG', 0, 0, 794, 1123, undefined, 'FAST')
      pdf.save(`${studentName || 'Student'}_Result.pdf`)
    } catch (error) {
      console.error(error)
      alert("Failed to generate PDF. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (status === 'loading') {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-red-500 w-10 h-10" /></div>
  }

  if (!session?.user?.isAdmin) {
    return null // useEffect will redirect
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 sm:p-8 pb-32 overflow-y-auto relative isolate">
      {/* Dynamic Ambient Background */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-purple-900/20 blur-[120px] mix-blend-screen" />
        <div className="absolute top-[20%] -right-[20%] w-[60%] h-[80%] rounded-full bg-red-900/20 blur-[120px] mix-blend-screen" />
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-center bg-white/5 p-6 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 pointer-events-none" />
          <div className="relative z-10 text-center sm:text-left mb-4 sm:mb-0">
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent flex justify-center sm:justify-start items-center gap-3">
              <FileText className="text-red-500 w-8 h-8" />
              Pro Result Generator
            </h1>
            <p className="text-gray-400 mt-2 font-medium">Create premium scholarship certificates instantly.</p>
          </div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="px-5 py-2.5 bg-black/40 rounded-full border border-white/10 flex items-center gap-2 backdrop-blur-md shadow-inner">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-bold tracking-wide text-gray-200">Admin: coderafroj</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Form Section */}
          <div className="xl:col-span-4 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-black/40 p-7 rounded-[2rem] shadow-2xl border border-white/10 relative overflow-hidden backdrop-blur-2xl"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500"></div>
              <h2 className="text-2xl font-bold mb-8 text-white flex items-center gap-2">
                Student Details
              </h2>
              
              <div className="space-y-5">
                {[
                  { id: 'studentName', label: 'Student Name', val: studentName, set: setStudentName },
                  { id: 'fatherName', label: 'Father\'s Name', val: fatherName, set: setFatherName },
                  { id: 'rollNumber', label: 'Roll Number', val: rollNumber, set: setRollNumber },
                  { id: 'marks', label: 'Marks', val: marks, set: setMarks, type: 'number' },
                  { id: 'admissionDate', label: 'Admission Date', val: admissionDate, set: setAdmissionDate },
                ].map((field) => (
                  <div key={field.id} className="relative group">
                    <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider pl-1">{field.label}</label>
                    <div className="relative flex items-center">
                      <input 
                        type={field.type || "text"}
                        value={field.val}
                        onChange={(e) => field.set(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white font-medium focus:outline-none focus:border-red-500/50 focus:bg-white/5 transition-all shadow-inner hover:border-white/20"
                        placeholder={`Enter ${field.label}`}
                      />
                      <button 
                        onClick={() => startListening(field.id, field.set)}
                        className={`absolute right-3 p-2.5 rounded-xl transition-all duration-300 ${
                          isListening && activeField === field.id 
                            ? 'bg-red-500/20 text-red-400 animate-pulse border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                            : 'text-gray-500 hover:text-white hover:bg-white/10'
                        }`}
                        title="Voice Type"
                      >
                        {isListening && activeField === field.id ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Calculated Stats Display */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="bg-black/60 rounded-2xl p-5 border border-white/5 flex flex-col items-center justify-center hover:bg-white/5 transition-colors">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1.5">Division</span>
                  <span className={`text-3xl font-black tracking-tight ${division === '1ST' ? 'text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]' : division === '2ND' ? 'text-blue-400' : 'text-orange-400'}`}>
                    {division || '-'}
                  </span>
                </div>
                <div className="bg-black/60 rounded-2xl p-5 border border-white/5 flex flex-col items-center justify-center hover:bg-white/5 transition-colors">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1.5">Discount</span>
                  <span className="text-3xl font-black text-green-400 tracking-tight">{discount}%</span>
                </div>
                <div className="bg-gradient-to-br from-black/80 to-black/40 rounded-2xl p-5 border border-white/5 col-span-2 flex flex-col items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1.5 relative z-10">Fee Per Month</span>
                  <span className="text-4xl font-black text-blue-400 tracking-tight relative z-10">₹{feePerMonth}</span>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveResult}
                  disabled={isSaving}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-4 px-4 rounded-2xl border border-white/10 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="animate-spin w-5 h-5 text-gray-400" /> : <Save className="w-5 h-5 text-gray-400" />}
                  Save Result
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDownloadPDF}
                  disabled={isSaving}
                  className="flex-1 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-bold py-4 px-4 rounded-2xl shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all flex items-center justify-center gap-2 border border-red-400/30"
                >
                  <Download className="w-5 h-5" />
                  Export PDF
                </motion.button>
              </div>
            </motion.div>

            {/* History Section */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-black/40 p-7 rounded-[2rem] shadow-2xl border border-white/10 max-h-[450px] overflow-y-auto custom-scrollbar backdrop-blur-2xl"
            >
              <h3 className="text-xl font-extrabold mb-6 text-white flex items-center gap-2">
                <div className="w-2 h-6 bg-red-500 rounded-full" />
                Recent History
              </h3>
              {savedResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 opacity-50">
                  <FileText className="w-10 h-10 mb-3 text-gray-500" />
                  <p className="text-gray-400 text-sm italic">No results generated yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedResults.map((res: any) => (
                    <div key={res.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex justify-between items-center hover:bg-white/10 transition-colors group cursor-default">
                      <div>
                        <div className="font-bold text-gray-100 group-hover:text-white transition-colors">{res.studentName}</div>
                        <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mt-1">Roll: {res.rollNumber} • Marks: {res.marks}</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-black text-sm tracking-tight ${res.division === '1ST' ? 'text-green-400' : res.division === '2ND' ? 'text-blue-400' : 'text-orange-400'}`}>
                          {res.division}
                        </div>
                        <div className="text-[10px] text-gray-500 font-medium mt-1">{new Date(res.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

          </div>

          {/* Preview Section */}
          <div className="xl:col-span-8 flex justify-center items-start bg-black/20 rounded-[2.5rem] p-4 sm:p-10 border border-white/5 shadow-2xl overflow-x-auto backdrop-blur-3xl custom-scrollbar relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 rounded-[2.5rem] pointer-events-none" />
            
            <div className="transform scale-[0.6] sm:scale-75 md:scale-[0.85] xl:scale-95 2xl:scale-100 origin-top flex-shrink-0 shadow-[0_20px_60px_rgba(0,0,0,0.5)] rounded-lg">
              <CertificatePreview 
                ref={certificateRef}
                studentName={studentName}
                fatherName={fatherName}
                rollNumber={rollNumber}
                marks={marks}
                division={division}
                discount={discount}
                feePerMonth={feePerMonth}
                admissionDate={admissionDate}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
