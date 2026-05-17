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
        <div className="absolute inset-4 border-[16px] border-double border-black opacity-90 pointer-events-none" style={{boxSizing: 'border-box'}}></div>
        <div className="absolute inset-[1.35rem] border-[3px] border-black opacity-90 pointer-events-none" style={{boxSizing: 'border-box'}}></div>

        {/* Watermark Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
          <div className="text-[120px] font-black transform -rotate-45 leading-none text-black text-center select-none tracking-tighter">
            BYTECORE<br/>COMPUTER<br/>CENTRE
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center h-full pt-4">
          
          <h1 className="text-[3.25rem] leading-none font-black text-black tracking-widest mb-2 text-center uppercase drop-shadow-sm">
            Bytecore Computer Centre
          </h1>
          
          <p className="text-2xl font-bold text-gray-800 mb-3 italic text-center">
            "Tech Mastery, Starts Here"
          </p>

          <div className="text-[11px] font-bold text-center text-gray-800 leading-tight mb-5 px-12 border-b-[3px] border-black pb-4 uppercase">
            ADDRESS: 1. SHITALA MATA MANDIR KE SHAMNE, KUBER INDANE GAS SERVICE NARIYAWAL BAREILLY <br/> 
            2. CHIDIYA GHAR KE PASS, JAFAR TENT HOUSE KE SHAMNE THIRIYA NIZAWAT KHAN BAREILLY
          </div>
          
          <h2 className="text-3xl font-black text-white bg-black px-10 py-3 rounded tracking-widest mb-8 text-center uppercase shadow-md border-2 border-black">
            Scholarship Entrance Exam Result
          </h2>

          <div className="w-full flex justify-between items-end text-2xl font-bold mb-8 px-4 mt-2">
            <div className="tracking-wide flex items-end">Roll No: <span className="text-black font-black text-4xl border-b-4 border-black pb-1 ml-4 px-4 inline-block min-w-[150px] text-center leading-none">{rollNumber || ''}</span></div>
            <div className="text-base text-gray-800 font-black border-2 border-black px-5 py-2 rounded-full mb-1">Contact: 6396835709, 8923916987</div>
          </div>

          <div className="w-full text-left px-4 space-y-8 text-2xl mt-4">
            <div className="flex gap-4 items-end">
              <span className="font-bold w-64 text-gray-800 tracking-wide uppercase">Name Of Student:</span>
              <span className="font-black border-b-4 border-dotted border-black flex-1 uppercase text-4xl pb-1 px-4 leading-none">
                {studentName || ''}
              </span>
            </div>
            
            <div className="flex gap-4 items-end">
              <span className="font-bold w-64 text-gray-800 tracking-wide uppercase">Father&apos;s Name:</span>
              <span className="font-black border-b-4 border-dotted border-black flex-1 uppercase text-4xl pb-1 px-4 leading-none">
                {fatherName || ''}
              </span>
            </div>
          </div>

          <div className="mt-12 text-center text-[1.65rem] font-bold px-12 leading-[3rem] text-gray-800">
            AWARDED TO <br/>
            Mr./Ms <span className="text-black font-black uppercase border-b-4 border-black mx-4 px-6 pb-1 inline-block min-w-[300px]">{studentName || ''}</span> <br/>
            obtain <span className="text-black font-black border-b-4 border-black mx-3 px-4 pb-1 inline-block min-w-[100px]">{division || ''}</span> division. <br/>
            Has attend competition exam of general knowledge.
          </div>

          <div className="w-full mt-auto mb-10 grid grid-cols-2 gap-8 px-8">
            <div className="bg-gray-50 p-6 rounded-xl border-2 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] flex flex-col justify-center items-center">
              <div className="text-xl text-gray-800 font-bold mb-2 uppercase tracking-wider">Marks & Division</div>
              <div className="text-4xl font-black text-black">
                {marks || '0'} <span className="text-2xl text-gray-700 font-bold ml-2">& {division || '-'} Div.</span>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl border-2 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] flex flex-col justify-center items-center">
              <div className="text-xl text-gray-800 font-bold mb-2 uppercase tracking-wider">Discount Awarded</div>
              <div className="text-5xl font-black text-black">
                {discount}%
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl border-2 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] flex flex-col justify-center items-center">
              <div className="text-xl text-gray-800 font-bold mb-2 uppercase tracking-wider">Fee Per Month</div>
              <div className="text-5xl font-black text-black tracking-tighter">
                ₹{feePerMonth}
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl border-2 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] flex flex-col justify-center items-center text-center">
              <div className="text-xl text-gray-800 font-bold mb-2 uppercase tracking-wider">Admission Fee</div>
              <div className="text-3xl font-black text-black tracking-tight">
                ₹100 + <span className="text-xl font-bold uppercase ml-1 block mt-1">एक माह की फ़ीस एडवांस</span>
              </div>
            </div>
          </div>

          <div className="mt-auto w-full px-12 flex justify-between items-end pb-12">
            <div className="flex flex-col text-lg">
              <span className="font-bold mb-3 text-gray-700 uppercase tracking-wide">Date of Issue:- <span className="text-black font-black ml-2 border-b-2 border-black pb-1 px-4">{formattedDate}</span></span>
              <span className="font-bold text-gray-700 uppercase tracking-wide">Admission Date:- <span className="text-black font-black ml-2 border-b-2 border-black pb-1 px-4">{formattedDate.split('-')[0]} {formattedDate.split('-')[1]} - 26 {formattedDate.split('-')[1]}</span></span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-56 border-b-[3px] border-black mb-3"></div>
              <span className="font-black text-xl text-black uppercase tracking-widest">Authorized Signature</span>
            </div>
          </div>

        </div>
      </div>
    )
  }
)

CertificatePreview.displayName = 'CertificatePreview'
