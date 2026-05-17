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
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

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
      const canvas = await html2canvas(certificateRef.current, { scale: 2 })
      const imgData = canvas.toDataURL('image/png')
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [794, 1123] // A4 size in pixels roughly at 96 DPI
      })
      
      pdf.addImage(imgData, 'PNG', 0, 0, 794, 1123)
      pdf.save(`${studentName}_Result.pdf`)
    } catch (error) {
      console.error(error)
      alert("Failed to generate PDF.")
    }
  }

  if (status === 'loading') {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-red-500 w-10 h-10" /></div>
  }

  if (!session?.user?.isAdmin) {
    return null // useEffect will redirect
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 pb-32 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl backdrop-blur-md bg-opacity-70">
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent flex items-center gap-3">
              <FileText className="text-red-500" />
              Pro Result Generator
            </h1>
            <p className="text-gray-400 mt-1">Create premium scholarship certificates instantly.</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium bg-gray-700 px-4 py-2 rounded-full border border-gray-600 shadow-inner">
              Admin: coderafroj
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Form Section */}
          <div className="xl:col-span-4 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 p-6 rounded-3xl shadow-2xl border border-gray-700 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
              <h2 className="text-2xl font-bold mb-6 text-gray-100 flex items-center gap-2">
                Student Details
              </h2>
              
              <div className="space-y-5">
                {[
                  { id: 'studentName', label: 'Student Name', val: studentName, set: setStudentName },
                  { id: 'fatherName', label: 'Father\'s Name', val: fatherName, set: setFatherName },
                  { id: 'rollNumber', label: 'Roll Number', val: rollNumber, set: setRollNumber },
                  { id: 'marks', label: 'Marks', val: marks, set: setMarks, type: 'number' },
                ].map((field) => (
                  <div key={field.id} className="relative">
                    <label className="block text-sm font-semibold text-gray-400 mb-1">{field.label}</label>
                    <div className="relative flex items-center">
                      <input 
                        type={field.type || "text"}
                        value={field.val}
                        onChange={(e) => field.set(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all shadow-inner"
                        placeholder={`Enter ${field.label}`}
                      />
                      <button 
                        onClick={() => startListening(field.id, field.set)}
                        className={`absolute right-2 p-2 rounded-lg transition-all ${
                          isListening && activeField === field.id 
                            ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                            : 'text-gray-400 hover:text-red-400 hover:bg-gray-700'
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
                <div className="bg-gray-900 rounded-xl p-4 border border-gray-700 flex flex-col items-center justify-center">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Division</span>
                  <span className={`text-2xl font-black ${division === '1ST' ? 'text-green-500' : division === '2ND' ? 'text-blue-500' : 'text-orange-500'}`}>
                    {division || '-'}
                  </span>
                </div>
                <div className="bg-gray-900 rounded-xl p-4 border border-gray-700 flex flex-col items-center justify-center">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Discount</span>
                  <span className="text-2xl font-black text-green-400">{discount}%</span>
                </div>
                <div className="bg-gray-900 rounded-xl p-4 border border-gray-700 col-span-2 flex flex-col items-center justify-center">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Fee Per Month</span>
                  <span className="text-3xl font-black text-blue-400">₹{feePerMonth}</span>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button 
                  onClick={handleSaveResult}
                  disabled={isSaving}
                  className="flex-1 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                  Save Result
                </button>
                <button 
                  onClick={handleDownloadPDF}
                  className="flex-1 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-bold py-3 px-4 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Export PDF
                </button>
              </div>
            </motion.div>

            {/* History Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800 p-6 rounded-3xl shadow-2xl border border-gray-700 max-h-[400px] overflow-y-auto custom-scrollbar"
            >
              <h3 className="text-xl font-bold mb-4 text-gray-200">Recent Results</h3>
              {savedResults.length === 0 ? (
                <p className="text-gray-500 text-sm italic text-center py-4">No results saved yet.</p>
              ) : (
                <div className="space-y-3">
                  {savedResults.map((res: any) => (
                    <div key={res.id} className="bg-gray-900 p-4 rounded-xl border border-gray-700 flex justify-between items-center hover:border-gray-600 transition-colors">
                      <div>
                        <div className="font-bold text-gray-200">{res.studentName}</div>
                        <div className="text-xs text-gray-500">Roll: {res.rollNumber} | Marks: {res.marks}</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-black text-sm ${res.division === '1ST' ? 'text-green-500' : res.division === '2ND' ? 'text-blue-500' : 'text-orange-500'}`}>
                          {res.division}
                        </div>
                        <div className="text-xs text-gray-400">{new Date(res.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

          </div>

          {/* Preview Section */}
          <div className="xl:col-span-8 flex justify-center bg-gray-800 rounded-3xl p-8 border border-gray-700 shadow-2xl overflow-x-auto">
            <div className="transform scale-75 xl:scale-[0.85] 2xl:scale-100 origin-top flex-shrink-0">
              <CertificatePreview 
                ref={certificateRef}
                studentName={studentName}
                fatherName={fatherName}
                rollNumber={rollNumber}
                marks={marks}
                division={division}
                discount={discount}
                feePerMonth={feePerMonth}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
