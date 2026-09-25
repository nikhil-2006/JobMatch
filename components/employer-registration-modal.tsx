'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Building2, MapPin, Phone, User, Store, Loader2, X, Send } from 'lucide-react'
import { registerEmployerRequest } from '@/app/actions/employer'

interface EmployerRegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function EmployerRegistrationModal({
  isOpen,
  onClose,
  onSuccess,
}: EmployerRegistrationModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    companyName: '',
    firstName: '',
    lastName: '',
    phone: '',
    companyAddress: 'MVGR College Main Gate Arcade, Vizianagaram',
    latitude: '18.0603',
    longitude: '83.4004',
    initialJobTitle: 'Campus Store Associate',
    initialHourlyRate: '16.00',
    description: 'Assisting students with store billing, customer service, and daily operations.',
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.companyName || !formData.firstName || !formData.phone) {
      alert('Please fill out your shop name, contact name, and phone number.')
      return
    }

    setSubmitting(true)
    try {
      const res = await registerEmployerRequest({
        ...formData,
        latitude: parseFloat(formData.latitude) || 18.0603,
        longitude: parseFloat(formData.longitude) || 83.4004,
      })

      if (res.success) {
        onSuccess()
        onClose()
      } else {
        alert(res.error || 'Failed to submit employer registration request.')
      }
    } catch (err) {
      console.error('Error registering employer request:', err)
      alert('Network error submitting request.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md overflow-y-auto">
      <Card className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 bg-card text-card-foreground border border-border space-y-5 shadow-2xl z-[10000]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-xl font-bold text-foreground">Register Employer / Campus Shop</h2>
              <p className="text-xs text-muted-foreground">Submit request to MVGR Admin for verification & map placement</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {/* Shop / Business Name */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              Shop / Business Name <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="e.g. MVGR Tech Xerox & Printing Arcade"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Contact Person Names */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">First Name <span className="text-destructive">*</span></label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-10"
                  placeholder="Rajesh"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Last Name</label>
              <Input
                placeholder="Varma"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>

          {/* Phone Contact */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              Business Phone Contact <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Shop Address */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Campus Shop Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Main Gate Shopping Arcade, MVGR Campus"
                value={formData.companyAddress}
                onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
              />
            </div>
          </div>

          {/* Map Coordinates for Pin Placement */}
          <div className="p-3 bg-muted/40 rounded-xl border border-border/50 space-y-2">
            <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary" />
              Map Pin Coordinates (For Student Interactive Campus Map)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">Latitude</label>
                <Input
                  className="font-mono text-xs"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">Longitude</label>
                <Input
                  className="font-mono text-xs"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Initial Vacancy Info */}
          <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 space-y-3">
            <p className="text-xs font-bold text-primary">Initial Job Vacancy Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">Position Title</label>
                <Input
                  value={formData.initialJobTitle}
                  onChange={(e) => setFormData({ ...formData, initialJobTitle: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">Hourly Rate (₹)</label>
                <Input
                  value={formData.initialHourlyRate}
                  onChange={(e) => setFormData({ ...formData, initialHourlyRate: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Submit Join Request to Admin
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
