'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Edit2, Save, X, Plus, MapPin, Award, Users, Loader2 } from 'lucide-react'
import { getUserProfile, updateUserProfile } from '@/app/actions/users'

export default function StudentProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    name: 'Student User',
    email: 'student@university.edu',
    phone: '(555) 123-4567',
    location: 'San Francisco, CA',
    bio: 'Driven student passionate about gaining practical work experience.',
    skills: ['Customer Service', 'Data Analysis', 'Communication'],
    interests: ['Tech', 'Retail', 'Education'],
    rating: 4.8,
    completedJobs: 4,
  })

  const [editForm, setEditForm] = useState(profile)
  const [newSkill, setNewSkill] = useState('')

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getUserProfile()
        if (data) {
          let parsedSkills: string[] = ['Customer Service', 'Communication']
          if (data.skills) {
            if (typeof data.skills === 'string') {
              try {
                const arr = JSON.parse(data.skills)
                if (Array.isArray(arr) && arr.length > 0) parsedSkills = arr
              } catch {}
            } else if (Array.isArray(data.skills) && (data.skills as string[]).length > 0) {
              parsedSkills = data.skills as string[]
            }
          }

          const loaded = {
            name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Student User',
            email: 'student@university.edu',
            phone: data.phone || '(555) 123-4567',
            location: 'San Francisco, CA',
            bio: data.bio || 'Driven student passionate about gaining practical work experience.',
            skills: parsedSkills,
            interests: ['Tech', 'Retail', 'Education'],
            rating: 4.8,
            completedJobs: 4,
          }
          setProfile(loaded)
          setEditForm(loaded)
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const nameParts = editForm.name.split(' ')
      const firstName = nameParts[0] || 'Student'
      const lastName = nameParts.slice(1).join(' ') || ''

      const res = await updateUserProfile({
        firstName,
        lastName,
        bio: editForm.bio,
        phone: editForm.phone,
        skills: editForm.skills,
      })

      if (res.success) {
        setProfile(editForm)
        setIsEditing(false)
      } else {
        alert('Failed to save profile updates.')
      }
    } catch (err) {
      console.error('Error saving profile:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditForm(profile)
    setIsEditing(false)
  }

  const handleAddSkill = () => {
    if (newSkill.trim() && !editForm.skills.includes(newSkill.trim())) {
      setEditForm({
        ...editForm,
        skills: [...editForm.skills, newSkill.trim()],
      })
      setNewSkill('')
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setEditForm({
      ...editForm,
      skills: editForm.skills.filter(s => s !== skill),
    })
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-12 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Loading profile data...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground mt-2">Manage your professional profile</p>
        </div>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          className="gap-2"
          variant={isEditing ? 'outline' : 'default'}
        >
          {isEditing ? (
            <>
              <X className="h-4 w-4" />
              Cancel
            </>
          ) : (
            <>
              <Edit2 className="h-4 w-4" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      <Card className="p-8 border border-border/50">
        <div className="space-y-6">
          <div className="flex items-start gap-4 pb-6 border-b border-border/50">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-3xl font-bold">
              {profile.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <Input
                    placeholder="Full Name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                  <Input
                    placeholder="Phone"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                  <p className="text-sm text-muted-foreground">{profile.phone}</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <Award className="h-6 w-6 mx-auto text-amber-500 mb-2" />
              <p className="text-2xl font-bold text-foreground">{profile.rating}</p>
              <p className="text-xs text-muted-foreground mt-1">Rating</p>
            </div>
            <div className="text-center">
              <Users className="h-6 w-6 mx-auto text-blue-500 mb-2" />
              <p className="text-2xl font-bold text-foreground">{profile.completedJobs}</p>
              <p className="text-xs text-muted-foreground mt-1">Jobs Completed</p>
            </div>
            <div className="text-center">
              <Badge className="mx-auto">{profile.skills.length} Skills</Badge>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 border border-border/50 space-y-4">
        <h3 className="text-lg font-semibold text-foreground">About</h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Location</label>
            {isEditing ? (
              <div className="flex gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-2.5" />
                <Input
                  placeholder="City, State"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                />
              </div>
            ) : (
              <div className="flex gap-2 items-center">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <p className="text-foreground">{profile.location}</p>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Bio</label>
            {isEditing ? (
              <textarea
                className="w-full p-3 rounded-lg border border-input bg-background text-foreground resize-none"
                rows={3}
                placeholder="Tell employers about yourself"
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              />
            ) : (
              <p className="text-muted-foreground">{profile.bio}</p>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6 border border-border/50 space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Skills</h3>

        <div className="flex flex-wrap gap-2 mb-4">
          {editForm.skills.map((skill) => (
            <Badge key={skill} className="gap-2 py-1 px-3">
              {skill}
              {isEditing && (
                <button
                  onClick={() => handleRemoveSkill(skill)}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              )}
            </Badge>
          ))}
        </div>

        {isEditing && (
          <div className="flex gap-2">
            <Input
              placeholder="Add new skill"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddSkill()
                }
              }}
            />
            <Button onClick={handleAddSkill} size="sm" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </Card>

      {isEditing && (
        <div className="flex gap-3 justify-end">
          <Button onClick={handleCancel} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      )}
    </div>
  )
}
