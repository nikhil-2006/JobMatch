'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, Printer, Download, Award, Building, CheckCircle, X, MapPin, Calendar, FileText } from 'lucide-react'

interface EmployerCertificateModalProps {
  isOpen: boolean
  onClose: () => void
  employerData: {
    companyName?: string | null
    employerName?: string | null
    companyAddress?: string | null
    phone?: string | null
    certificateId?: string | null
    verifiedAt?: string | null
  }
}

export default function EmployerCertificateModal({
  isOpen,
  onClose,
  employerData,
}: EmployerCertificateModalProps) {
  if (!isOpen) return null

  const company = employerData.companyName || 'MVGR Registered Campus Partner'
  const name = employerData.employerName || 'Authorized Store Manager'
  const address = employerData.companyAddress || 'MVGR Main Gate Shopping Arcade, Vizianagaram'
  const certId = employerData.certificateId || 'CERT-MVGR-2026-88F4A2'
  const dateStr = employerData.verifiedAt
    ? new Date(employerData.verifiedAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })

  const handlePrint = () => {
    window.print()
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div className="relative w-full max-w-3xl space-y-4" onClick={(e) => e.stopPropagation()}>
        {/* Controls */}
        <div className="flex items-center justify-between text-white print:hidden">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-400" />
            <span className="font-bold text-sm">Official MVGR Campus Verification Certificate</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handlePrint} className="gap-1.5 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs">
              <Printer className="h-4 w-4" /> Print / Save PDF
            </Button>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Certificate Card Body */}
        <Card className="relative bg-gradient-to-br from-slate-900 via-zinc-900 to-slate-950 text-white p-8 md:p-12 border-4 border-amber-500/40 rounded-2xl shadow-2xl space-y-6 overflow-hidden print:border-2 print:p-6 print:bg-white print:text-black">
          {/* Close Button on Top Right of Certificate */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors print:hidden"
            title="Close certificate"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Background Decorative Seals */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Certificate Header */}
          <div className="text-center space-y-2 border-b border-amber-500/30 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest mb-1">
              <ShieldCheck className="h-4 w-4 text-amber-400" /> MVGR College of Engineering (Autonomous)
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-amber-300 font-serif">
              CERTIFICATE OF VERIFICATION
            </h1>
            <p className="text-xs uppercase tracking-widest text-zinc-400">
              OFFICIAL AUTHORIZED CAMPUS EMPLOYER & RECRUITER PARTNER
            </p>
          </div>

          {/* Certificate Body Text */}
          <div className="text-center space-y-6 py-4">
            <p className="text-xs text-zinc-400 uppercase tracking-widest">THIS IS TO OFFICIALLY CERTIFY THAT</p>
            
            <div className="space-y-1">
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-wide font-serif border-b-2 border-amber-400/50 inline-block px-6 py-1">
                {company}
              </h2>
              <p className="text-sm text-amber-400/90 font-medium pt-1">
                Represented by: <span className="text-white font-semibold">{name}</span>
              </p>
            </div>

            <p className="text-sm text-zinc-300 max-w-xl mx-auto leading-relaxed font-sans">
              has completed official administrative registration and is fully authorized by 
              <strong className="text-amber-300"> MVGR JobMatch Platform Administration</strong> to operate campus shop services, post part-time student employment positions, and recruit engineering candidates on campus.
            </p>
          </div>

          {/* Verification Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-white/5 p-4 rounded-xl border border-white/10 text-xs">
            <div className="space-y-1">
              <span className="text-zinc-400 block text-[10px] uppercase font-bold">Campus Location</span>
              <span className="font-semibold text-white flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{address}</span>
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-zinc-400 block text-[10px] uppercase font-bold">Certificate ID</span>
              <span className="font-mono font-bold text-amber-300">{certId}</span>
            </div>
            <div className="space-y-1 col-span-2 md:col-span-1">
              <span className="text-zinc-400 block text-[10px] uppercase font-bold">Date of Issuance</span>
              <span className="font-semibold text-white flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                {dateStr}
              </span>
            </div>
          </div>

          {/* Placeholder Box for Custom Designed Certificate Upload */}
          <div className="p-3 bg-amber-500/10 border border-dashed border-amber-500/30 rounded-xl text-center space-y-1 text-xs text-amber-300/90">
            <div className="flex items-center justify-center gap-1 font-bold">
              <FileText className="h-4 w-4 text-amber-400" />
              <span>Official Certificate Design Slot</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              [Custom certificate graphic design template ready for high-resolution replacement]
            </p>
          </div>

          {/* Footer Signatures */}
          <div className="flex items-center justify-between border-t border-amber-500/30 pt-6 text-xs">
            <div className="text-left space-y-1">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold text-sm">
                MVGR
              </div>
              <p className="text-[10px] text-zinc-400 uppercase font-bold">Campus Seal</p>
            </div>

            <div className="text-center space-y-1">
              <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 text-xs">
                <CheckCircle className="h-3.5 w-3.5" /> VERIFIED & LIVE ON CAMPUS MAP
              </span>
            </div>

            <div className="text-right space-y-1">
              <p className="font-serif font-bold text-amber-300 italic text-base">System Administrator</p>
              <p className="text-[10px] text-zinc-400 uppercase font-bold">MVGR Platform Admin</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
