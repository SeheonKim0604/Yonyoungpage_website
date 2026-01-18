'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import './Hero.css'

export default function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [latestExhibition, setLatestExhibition] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [heroData, setHeroData] = useState<any>(null)
  const [isAdminMode, setIsAdminMode] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [exhibitionRes, heroRes] = await Promise.all([
          fetch('/api/data/exhibitions', { cache: 'no-store' }),
          fetch('/api/data/hero', { cache: 'no-store' })
        ])

        if (exhibitionRes.ok) {
          const data = await exhibitionRes.json()
          if (data && data.length > 0) {
            setLatestExhibition(data[0])
          }
        }

        if (heroRes.ok) {
          const data = await heroRes.json()
          setHeroData(data)
        }
      } catch (error) {
        console.error('Failed to fetch hero data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()

    // 관리자 모드 구독
    setIsAdminMode(localStorage.getItem('isAdminMode') === 'true')
    const handleAdminChange = (e: any) => setIsAdminMode(e.detail)
    window.addEventListener('adminModeChange', handleAdminChange)
    return () => window.removeEventListener('adminModeChange', handleAdminChange)
  }, [])

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    
    const formData = new FormData()
    formData.append('file', e.target.files[0])
    formData.append('type', 'hero')

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      if (res.ok) {
        const data = await res.json()
        setHeroData({ backgroundImage: data.url })
        alert('배경 이미지가 변경되었습니다.')
      }
    } catch (error) {
      alert('업로드 중 오류가 발생했습니다.')
    }
  }

  const exhibitionImages = latestExhibition?.images || (latestExhibition?.image ? [latestExhibition.image] : [])

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (exhibitionImages.length <= 1) return

    timerRef.current = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % exhibitionImages.length)
    }, 3000)
  }, [exhibitionImages.length])

  useEffect(() => {
    startTimer()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [startTimer])

  const handlePrev = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? exhibitionImages.length - 1 : prev - 1))
    startTimer()
  }

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % exhibitionImages.length)
    startTimer()
  }

  const handleIndicatorClick = (index: number) => {
    setCurrentImageIndex(index)
    startTimer()
  }

  if (isLoading) {
    return <section className="hero loading-hero"></section>
  }

  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-title-wrapper">
          {heroData?.backgroundImage && (
            <div className="hero-title-bg">
              <Image 
                src={heroData.backgroundImage} 
                alt="배경 로고" 
                width={400} 
                height={400}
                style={{ objectFit: 'contain' }}
              />
            </div>
          )}
          <h1>연영회</h1>
          {isAdminMode && (
            <button 
              className="hero-edit-btn" 
              onClick={() => fileInputRef.current?.click()}
              title="배경 이미지 수정"
            >
              ✎
            </button>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleHeroImageUpload} 
            style={{ display: 'none' }} 
            accept="image/*"
          />
        </div>
        <p className="hero-subtitle">One Step Closer</p>
        <p className="hero-description">연영회는 1966년부터 시작된 연세대학교 유일의 중앙사진동아리입니다</p>
      </div>

      <div className="hero-exhibition-section">
        <div className="hero-exhibition-header">
          {latestExhibition && (
            <div className="exhibition-title-info">
              <span className="exhibition-tag">LATEST EXHIBITION</span>
              <h3>{latestExhibition.title}</h3>
              <p>{latestExhibition.date} | {latestExhibition.location}</p>
            </div>
          )}
        </div>

        <div className="hero-main-container">
          <button className="hero-nav-btn prev" onClick={handlePrev} aria-label="이전 이미지">
            ‹
          </button>

          <div className="hero-slider-wrapper">
            <div className="hero-slider">
              {exhibitionImages.length > 0 ? (
                exhibitionImages.map((image: string, index: number) => (
                  <div
                    key={index}
                    className={`hero-slide ${index === currentImageIndex ? 'active' : ''}`}
                  >
                    <Image
                      src={image}
                      alt={`${latestExhibition?.title} - 이미지 ${index + 1}`}
                      fill
                      priority={index === 0}
                      style={{ objectFit: 'contain' }}
                      sizes="(max-width: 1200px) 100vw, 1200px"
                    />
                  </div>
                ))
              ) : (
                <div className="hero-placeholder">
                  <p>전시 이미지가 없습니다.</p>
                </div>
              )}
            </div>
          </div>

          <button className="hero-nav-btn next" onClick={handleNext} aria-label="다음 이미지">
            ›
          </button>
        </div>

        {exhibitionImages.length > 1 && (
          <div className="hero-indicators">
            {exhibitionImages.map((_: any, index: number) => (
              <button
                key={index}
                className={index === currentImageIndex ? 'active' : ''}
                onClick={() => handleIndicatorClick(index)}
                aria-label={`배너 ${index + 1}로 이동`}
              />
            ))}
          </div>
        )}

        <div className="hero-exhibition-footer">
          <Link href="/archive/exhibitions" className="view-all-exhibitions-btn">
            모든 전시 보기 →
          </Link>
        </div>
      </div>
    </section>
  )
}
