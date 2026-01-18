'use client'

import { useState, useRef, useEffect } from 'react'
import './UploadModal.css'

interface UploadModalProps {
  onClose: () => void
  onUpload: (data: { 
    id?: number;
    title: string; 
    files: File[]; 
    mainIndex: number; 
    date?: string; 
    location?: string;
    existingImages?: string[];
  }) => void
  type?: 'gallery' | 'exhibition'
  initialData?: any
}

export default function UploadModal({ onClose, onUpload, type = 'gallery', initialData }: UploadModalProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [date, setDate] = useState(initialData?.date || '')
  const [location, setLocation] = useState(initialData?.location || '')
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<string[]>(initialData?.images || (initialData?.image ? [initialData.image] : []))
  const [mainIndex, setMainIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 초기 데이터가 변경될 때 상태 업데이트
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '')
      setDate(initialData.date || '')
      setLocation(initialData.location || '')
      setExistingImages(initialData.images || (initialData.image ? [initialData.image] : []))
      // 기존 이미지 중 현재 대표 이미지가 몇 번째인지 찾기
      const currentMain = initialData.image
      const foundIndex = (initialData.images || []).indexOf(currentMain)
      setMainIndex(foundIndex >= 0 ? foundIndex : 0)
    }
  }, [initialData])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      const newFiles = [...files, ...selectedFiles]
      setFiles(newFiles)
      
      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file))
      setPreviews([...previews, ...newPreviews])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files) {
      const selectedFiles = Array.from(e.dataTransfer.files)
      const newFiles = [...files, ...selectedFiles]
      setFiles(newFiles)
      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file))
      setPreviews([...previews, ...newPreviews])
    }
  }

  const removeFile = (index: number, isExisting: boolean, e: React.MouseEvent) => {
    e.stopPropagation()
    if (isExisting) {
      const newExisting = existingImages.filter((_, i) => i !== index)
      setExistingImages(newExisting)
      if (mainIndex === index) setMainIndex(0)
      else if (mainIndex > index) setMainIndex(mainIndex - 1)
    } else {
      const actualIndex = index - existingImages.length
      const newFiles = files.filter((_, i) => i !== actualIndex)
      const newPreviews = previews.filter((_, i) => i !== actualIndex)
      setFiles(newFiles)
      setPreviews(newPreviews)
      if (mainIndex === index) setMainIndex(0)
      else if (mainIndex > index) setMainIndex(mainIndex - 1)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isFormValid()) {
      onUpload({ 
        id: initialData?.id,
        title, 
        files, 
        mainIndex, 
        date, 
        location,
        existingImages 
      })
      onClose()
    }
  }

  const isFormValid = () => {
    const hasImages = files.length > 0 || existingImages.length > 0
    if (type === 'exhibition') {
      return title && hasImages && date && location
    }
    return title && hasImages && date
  }

  const allImages = [...existingImages, ...previews]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{initialData ? (type === 'exhibition' ? '전시 정보 수정' : '활동 기록 수정') : (type === 'exhibition' ? '새 전시 추가' : '새 활동 기록 추가')}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">{type === 'exhibition' ? '전시 제목' : '활동 제목'}</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">{type === 'exhibition' ? '전시 기간' : '활동 날짜'}</label>
            <input
              type="text"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder={type === 'exhibition' ? "예: 2026.02.12 ~ 2026.02.14" : "예: 2026.01.18"}
              required
            />
          </div>

          {type === 'exhibition' && (
            <div className="form-group">
              <label htmlFor="location">전시 장소</label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="장소를 입력하세요"
                required
              />
            </div>
          )}

          <div
            className={`upload-area ${isDragging ? 'dragging' : ''} ${allImages.length > 0 ? 'has-files' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {allImages.length > 0 ? (
              <div className="previews-grid">
                {allImages.map((src, index) => (
                  <div 
                    key={index} 
                    className={`preview-item ${index === mainIndex ? 'is-main' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setMainIndex(index)
                    }}
                  >
                    <img src={src} alt={`미리보기 ${index + 1}`} />
                    <button 
                      className="remove-file-btn" 
                      onClick={(e) => removeFile(index, index < existingImages.length, e)}
                    >
                      ×
                    </button>
                    {index === mainIndex && <span className="main-label">대표</span>}
                  </div>
                ))}
                <div className="add-more-placeholder">
                  <span>+</span>
                </div>
              </div>
            ) : (
              <div className="upload-placeholder">
                <span className="upload-icon">+</span>
                <p>이미지를 드래그하거나 클릭하여 선택하세요</p>
                <p className="hint">(여러 장 선택 가능)</p>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              multiple
              style={{ display: 'none' }}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="submit-btn" disabled={!isFormValid()}>
              {initialData ? '수정 완료' : (type === 'exhibition' ? '추가' : '업로드')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
