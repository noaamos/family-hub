'use client'

import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'

type Member = {
  id: string
  name: string
  email: string
  color: string
  role: string
  createdAt: string
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])

  useEffect(() => {
    fetch('/api/members').then((r) => r.json()).then(setMembers)
  }, [])

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Family Members</h1>
        <span className="text-sm text-gray-400">{members.length} member{members.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="space-y-3">
        {members.map((member) => (
          <div key={member.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
              style={{ backgroundColor: member.color }}
            >
              {member.name[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900">{member.name}</p>
                {member.role === 'admin' && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">Admin</span>
                )}
              </div>
              <p className="text-sm text-gray-400 truncate">{member.email}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-gray-400">Joined</p>
              <p className="text-xs text-gray-500">{format(parseISO(member.createdAt), 'MMM d, yyyy')}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-indigo-50 rounded-2xl p-4 text-center">
        <p className="text-sm text-indigo-700 font-medium">Invite a family member</p>
        <p className="text-xs text-indigo-500 mt-1">
          Share the app URL and have them register an account. The first account is automatically made admin.
        </p>
      </div>
    </div>
  )
}
