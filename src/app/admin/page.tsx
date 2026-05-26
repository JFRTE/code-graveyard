'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, AlertTriangle, CheckCircle, XCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { showToast } from '@/components/Toast'

interface Report {
  id: string
  user_id: string
  tombstone_id: string
  reason: string
  status: string
  created_at: string
  tombstones?: { code_name: string }
}

export default function AdminPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/reports')
      if (res.ok) {
        const data = await res.json()
        setReports(data.reports || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const filteredReports = reports.filter(r => filter === 'all' || r.status === filter)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-600 dark:border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">管理后台</h1>
          <p className="text-gray-600 dark:text-gray-400">举报管理 ⚠️</p>
        </motion.div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 justify-center">
          {['pending', 'resolved', 'dismissed', 'all'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                filter === f
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {f === 'pending' ? '待处理' : f === 'resolved' ? '已处理' : f === 'dismissed' ? '已驳回' : '全部'}
            </button>
          ))}
        </div>

        {filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">没有举报</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report, i) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className={`w-5 h-5 ${report.status === 'pending' ? 'text-yellow-500' : report.status === 'resolved' ? 'text-green-500' : 'text-gray-500'}`} />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {report.tombstones?.code_name || '未知墓碑'}
                      </span>
                      <Link href={`/tombstone/${report.tombstone_id}`} className="text-purple-600 dark:text-purple-400 hover:text-purple-500">
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">{report.reason}</p>
                    <p className="text-xs text-gray-500">
                      举报者: {report.user_id} · {new Date(report.created_at).toLocaleString('zh-CN')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    report.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                    report.status === 'resolved' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                    'bg-gray-100 dark:bg-gray-800 text-gray-500'
                  }`}>
                    {report.status === 'pending' ? '待处理' : report.status === 'resolved' ? '已处理' : '已驳回'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
