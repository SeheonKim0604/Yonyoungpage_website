import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const type = formData.get('type') as string || 'gallery'
    const title = formData.get('title') as string
    const date = formData.get('date') as string
    const location = formData.get('location') as string
    const mainIndex = parseInt(formData.get('mainIndex') as string || '0')
    const id = formData.get('id') as string // 수정 시 사용
    const existingImagesStr = formData.get('existingImages') as string // 수정 시 사용

    const files = formData.getAll('files') as File[]
    const singleFile = formData.get('file') as File

    const saveFile = async (file: File, folder: string, index: number = 0) => {
      const arrayBuffer = await file.arrayBuffer()
      const fileName = `${Date.now()}_${index}_${encodeURIComponent(file.name).replace(/%/g, '_')}`
      const storagePath = `${folder}/${fileName}`
      
      const { data, error } = await supabase.storage
        .from('images')
        .upload(storagePath, arrayBuffer, {
          contentType: file.type,
          upsert: true
        })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(storagePath)
        
      return publicUrl
    }

    if (type === 'photographer') {
      if (!singleFile) return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 })
      const url = await saveFile(singleFile, 'photographers')
      return NextResponse.json({ success: true, url })
    }

    if (type === 'hero') {
      if (!singleFile) return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 })
      const url = await saveFile(singleFile, 'banner')
      
      const { error } = await supabase
        .from('configs')
        .upsert({ key: 'hero', value: { backgroundImage: url } })
      
      if (error) throw error
      return NextResponse.json({ success: true, url })
    }

    let newItem
    if (type === 'exhibition') {
      let imageUrls: string[] = []
      if (existingImagesStr) {
        imageUrls = JSON.parse(existingImagesStr)
      }
      
      if (files.length > 0) {
        const newImageUrls = await Promise.all(files.map((file, idx) => saveFile(file, 'exhibitions', idx)))
        imageUrls = [...imageUrls, ...newImageUrls]
      }

      const exhibitionData = {
        title: title,
        date: date,
        location: location,
        image: imageUrls[mainIndex] || imageUrls[0],
        images: imageUrls,
        description: ""
      }

      if (id) {
        // 업데이트
        const { data, error } = await supabase
          .from('exhibitions')
          .update(exhibitionData)
          .eq('id', id)
          .select()
          .single()
        if (error) throw error
        newItem = data
      } else {
        // 신규 추가
        const { data, error } = await supabase
          .from('exhibitions')
          .insert(exhibitionData)
          .select()
          .single()
        if (error) throw error
        newItem = data
      }
    } else {
      if (files.length === 0) return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 })
      const imageUrls = await Promise.all(files.map((file, idx) => saveFile(file, 'gallery', idx)))
      
      const activityData = {
        title: title || '제목 없음',
        date: date || new Date().toISOString().split('T')[0],
        cover_image: imageUrls[0],
        images: imageUrls
      }

      const { data, error } = await supabase
        .from('activities')
        .insert(activityData)
        .select()
        .single()

      if (error) throw error
      newItem = data
    }

    return NextResponse.json({ 
      success: true, 
      [type === 'exhibition' ? 'exhibition' : 'activity']: {
        ...newItem,
        coverImage: newItem.cover_image || newItem.image
      } 
    })
  } catch (error: any) {
    console.error('업로드 에러:', error)
    return NextResponse.json({ error: error.message || '업로드 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const id = searchParams.get('id')

    if (!type || !id) {
      return NextResponse.json({ error: '타입과 ID가 필요합니다.' }, { status: 400 })
    }

    const table = type === 'exhibition' ? 'exhibitions' : 'activities'
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('삭제 에러:', error)
    return NextResponse.json({ error: error.message || '삭제 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
