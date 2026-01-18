'use client'

import { useState } from 'react'
import Image from 'next/image'
import ImageGallery from './ImageGallery'
import './ImageGrid.css'

interface ImageItem {
  id: number
  src: string
  alt: string
  title?: string
  date?: string
  category?: string
}

interface ImageGridProps {
  images: ImageItem[]
  onItemClick?: (index: number) => void
  onUpdate?: (updatedImages: any[]) => void
}

export default function ImageGrid({ images, onItemClick, onUpdate }: ImageGridProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const handleItemClick = (index: number) => {
    if (onItemClick) {
      onItemClick(index)
    } else {
      setSelectedImageIndex(index)
    }
  }

  const handleTitleClick = (e: React.MouseEvent, image: ImageItem) => {
    if (!onUpdate) return // 업데이트 콜백이 없으면 수정 불가
    e.stopPropagation()
    setEditingId(image.id)
    setEditTitle(image.title || '')
  }

  const handleTitleSave = async (id: number) => {
    if (!editTitle.trim()) {
      setEditingId(null)
      return
    }

    try {
      const response = await fetch('/api/update-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, title: editTitle }),
      })

      if (response.ok) {
        const data = await response.json()
        if (onUpdate) {
          onUpdate(data.activities) // 서버에서 정렬되어 온 전체 리스트로 갱신
        }
        setEditingId(null)
      } else {
        alert('제목 저장에 실패했습니다.')
      }
    } catch (error) {
      console.error('제목 업데이트 오류:', error)
      alert('오류가 발생했습니다.')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, id: number) => {
    if (e.key === 'Enter') {
      handleTitleSave(id)
    } else if (e.key === 'Escape') {
      setEditingId(null)
    }
  }

  if (images.length === 0) {
    return (
      <div className="empty-gallery">
        <p>이미지가 없습니다.</p>
      </div>
    )
  }

  return (
    <>
      <div className="image-grid">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="grid-item"
            onClick={() => handleItemClick(index)}
          >
            <div className="image-wrapper">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                style={{ objectFit: 'cover' }}
                loading="lazy"
              />
            </div>
            <div className="image-overlay">
              {editingId === image.id ? (
                <input
                  type="text"
                  className="edit-title-input"
                  value={editTitle}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={() => handleTitleSave(image.id)}
                  onKeyDown={(e) => handleKeyDown(e, image.id)}
                />
              ) : (
                <div className="title-container">
                  <h3 onClick={(e) => handleTitleClick(e, image)}>
                    {image.title || '제목 없음'}
                  </h3>
                  {image.date && <span className="image-date">{image.date}</span>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedImageIndex !== null && (
        <ImageGallery
          images={images}
          initialIndex={selectedImageIndex}
          onClose={() => setSelectedImageIndex(null)}
        />
      )}
    </>
  )
}
