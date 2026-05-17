'use client'

import React from 'react'

interface CertificateProps {
  studentName: string;
  fatherName: string;
  rollNumber: string;
  marks: string;
  division: string;
  discount: number;
  feePerMonth: number;
}

export const CertificatePreview = React.forwardRef<HTMLDivElement, CertificateProps>(
  ({ studentName, fatherName, rollNumber, marks, division, discount, feePerMonth }, ref) => {
    
    // Getting current date in required format e.g., 23-APRIL-2026
    const date = new Date()
    const formattedDate = `${date.getDate()}-${date.toLocaleString('default', { month: 'short' }).toUpperCase()}-${date.getFullYear()}`
    
    return (
      <div 
        ref={ref} 
        id="certificate-container"
        className="bg-white text-black p-10 relative overflow-hidden flex flex-col font-serif"
        style={{ 
          fontFamily: "'Times New Roman', Times, serif",
          width: '794px', 
          height: '1123px',
          boxSizing: 'border-box'
        }}
      >
        {/* Border */}
        <div className="absolute inset-4 border-[12px] border-double border-red-800 opacity-90 pointer-events-none" style={{boxSizing: 'border-box'}}></div>
        <div className="absolute inset-6 border-2 border-red-800 opacity-90 pointer-events-none" style={{boxSizing: 'border-box'}}></div>

        {/* Watermark Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
          <div className="text-[120px] font-black transform -rotate-45 leading-none text-red-900 text-center select-none">
            BYTECORE<br/>COMPUTER<br/>CENTRE
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center h-full pt-4">
          
          <h1 className="text-5xl font-black text-red-700 tracking-widest mb-1 text-center uppercase drop-shadow-sm">
            Bytecore Computer Centre
          </h1>
          
          <p className="text-2xl font-bold text-gray-800 mb-2 italic text-center">
            "Tech Mastery, Starts Here"
          </p>

          <div className="text-[11px] font-bold text-center text-gray-700 leading-tight mb-4 px-12 border-b-2 border-red-800/30 pb-4">
            ADDRESS: 1. SHITALA MATA MANDIR KE SHAMNE, KUBER INDANE GAS SERVICE NARIYAWAL BAREILLY <br/> 
            2. CHIDIYA GHAR KE PASS, JAFAR TENT HOUSE KE SHAMNE THIRIYA NIZAWAT KHAN BAREILLY
          </div>
          
          <h2 className="text-3xl font-extrabold text-white bg-red-700 px-8 py-2 rounded-lg tracking-widest mb-6 text-center uppercase shadow-md border-2 border-red-900">
            Scholarship Entrance Exam Result
          </h2>

          <div className="w-full flex justify-between items-center text-lg font-bold mb-8 px-4">
            <div>Roll No: <span className="text-red-600 underline underline-offset-4">{rollNumber || '______'}</span></div>
            <div className="text-sm text-gray-600">Mob. 6396835709, 8923916987, 7455098949</div>
          </div>

          <div className="w-full text-left px-4 space-y-4 text-xl">
            <div className="flex gap-4">
              <span className="font-bold w-48">Name Of Student:</span>
              <span className="font-bold border-b-2 border-dotted border-gray-600 flex-1 uppercase">
                {studentName || ''}
              </span>
            </div>
            
            <div className="flex gap-4">
              <span className="font-bold w-48">Father&apos;s Name:</span>
              <span className="font-bold border-b-2 border-dotted border-gray-600 flex-1 uppercase">
                {fatherName || ''}
              </span>
            </div>
          </div>

          <div className="mt-12 text-center text-2xl font-bold px-12 leading-relaxed">
            AWARDED TO <br/>
            Mr./Ms <span className="text-red-700 uppercase underline underline-offset-8 mx-4">{studentName || '_____________'}</span> 
            obtain <span className="text-red-700 underline underline-offset-8 mx-2">{division || '____'}</span> division. <br/>
            Has attend competition exam of general knowledge.
          </div>

          <div className="w-full mt-16 grid grid-cols-2 gap-8 px-8">
            <div className="bg-red-50 p-6 rounded-xl border border-red-200 shadow-sm flex flex-col justify-center items-center">
              <div className="text-lg text-gray-700 font-semibold mb-2">Marks & Division</div>
              <div className="text-3xl font-bold text-red-700">
                {marks || '0'} <span className="text-xl text-gray-800">& {division || '-'} Division</span>
              </div>
            </div>
            <div className="bg-red-50 p-6 rounded-xl border border-red-200 shadow-sm flex flex-col justify-center items-center">
              <div className="text-lg text-gray-700 font-semibold mb-2">Discount Awarded</div>
              <div className="text-4xl font-extrabold text-green-600">
                {discount}%
              </div>
            </div>
            <div className="bg-red-50 p-6 rounded-xl border border-red-200 shadow-sm flex flex-col justify-center items-center">
              <div className="text-lg text-gray-700 font-semibold mb-2">Fee Per Month</div>
              <div className="text-4xl font-extrabold text-blue-700">
                ₹{feePerMonth}
              </div>
            </div>
            <div className="bg-red-50 p-6 rounded-xl border border-red-200 shadow-sm flex flex-col justify-center items-center text-center">
              <div className="text-lg text-gray-700 font-semibold mb-2">Admission Fee</div>
              <div className="text-2xl font-bold text-red-700">
                ₹100 + <span className="text-lg">एक माह की फ़ीस एडवांस</span>
              </div>
            </div>
          </div>

          <div className="mt-auto w-full px-12 flex justify-between items-end pb-12">
            <div className="flex flex-col text-lg">
              <span className="font-bold mb-2 text-red-900">Date of Issue:- <span className="text-black font-semibold">{formattedDate}</span></span>
              <span className="font-bold text-red-900">Admission Date:- <span className="text-black font-semibold">{formattedDate.split('-')[0]} {formattedDate.split('-')[1]} - 26 {formattedDate.split('-')[1]}</span></span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-48 border-b-2 border-black mb-2 border-dashed"></div>
              <span className="font-bold text-xl text-gray-800">Authorized Signature</span>
            </div>
          </div>

        </div>
      </div>
    )
  }
)

CertificatePreview.displayName = 'CertificatePreview'
