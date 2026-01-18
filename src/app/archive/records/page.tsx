'use client'

// AI_SYNC_CHECK_V2
import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ImageGrid from '@/components/ImageGrid'
import UploadModal from '@/components/UploadModal'
import './Archive.css'

export const dynamic = 'force-dynamic'

export default function Archive() {
  const router = useRouter()
  const [activities, setActivities] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 데이터 동기 로딩 (API 호출)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data/activities', { cache: 'no-store' })
        if (response.ok) {
          const data = await response.json()
          setActivities([...data].sort((a, b) => (b.date || '').localeCompare(a.date || '')))
        }
      } catch (error) {
        console.error('Failed to fetch activities:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleUpload = async (data: { title: string; files: File[]; date?: string }) => {
    try {
      const { title, files, date } = data
      const formData = new FormData()
      files.forEach(file => formData.append('files', file))
      formData.append('title', title)
      if (date) formData.append('date', date)
      formData.append('type', 'gallery')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        const newActivities = [result.activity, ...activities].sort((a, b) => (b.date || '').localeCompare(a.date || ''))
        setActivities(newActivities)
        alert('활동 기록이 성공적으로 업로드되었습니다!')
      } else {
        const errorData = await response.json()
        alert(`업로드 실패: ${errorData.error}`)
      }
    } catch (error) {
      console.error('업로드 중 오류 발생:', error)
      alert('업로드 중 오류가 발생했습니다.')
    }
  }

  const handleActivityClick = (id: number) => {
    router.push(`/archive/records/${id}`)
  }

  // 활동 데이터 갱신 처리
  const handleActivitiesUpdate = (updatedActivities: any[]) => {
    // 날짜 기준 정렬 유지
    const sorted = [...updatedActivities].sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    setActivities(sorted)
  }

  // ImageGrid에 맞게 데이터 변환 (최적화)
  const gridImages = useMemo(() => activities.map(activity => ({
    id: activity.id,
    src: activity.coverImage,
    alt: activity.title,
    title: activity.title,
    date: activity.date
  })), [activities])

  return (
    <div className="archive-page">
      <div className="archive-header">
        <div className="container">
          <h1>활동 기록</h1>
          <button 
            className="upload-trigger-btn" 
            onClick={() => setIsModalOpen(true)}
            aria-label="이미지 업로드"
          >
            +
          </button>
        </div>
      </div>
      
      <div className="gallery-container">
        {isLoading ? (
          <div className="loading">로딩 중...</div>
        ) : (
          <ImageGrid 
            images={gridImages} 
            onItemClick={(index) => handleActivityClick(gridImages[index].id)}
            onUpdate={handleActivitiesUpdate}
          />
        )}
      </div>

      {isModalOpen && (
        <UploadModal 
          onClose={() => setIsModalOpen(false)} 
          onUpload={handleUpload}
          type="gallery"
        />
      )}
    </div>
  )
}
