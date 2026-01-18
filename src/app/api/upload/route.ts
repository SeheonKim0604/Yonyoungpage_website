import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const type = formData.get('type') as string || 'gallery'
    const title = formData.get('title') as string
    const date = formData.get('date') as string
    const location = formData.get('location') as string
    const mainIndex = parseInt(formData.get('mainIndex') as string || '0')
    const id = formData.get('id') as string
    const existingImagesStr = formData.get('existingImages') as string

    const files = formData.getAll('files') as File[]
    const singleFile = formData.get('file') as File

    const saveFile = async (file: File, folder: string, index: number = 0) => {
      const arrayBuffer = await file.arrayBuffer()
      const fileName = `${Date.now()}_${index}_${encodeURIComponent(file.name).replace(/%/g, '_')}`
      const storagePath = `${folder}/${fileName}`
      const { error } = await supabase.storage.from('images').upload(storagePath, arrayBuffer, { contentType: file.type, upsert: true })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(storagePath)
      return publicUrl
    }

    if (type === 'photographer') {
      const url = await saveFile(singleFile, 'photographers')
      return NextResponse.json({ success: true, url })
    }

    if (type === 'hero') {
      const url = await saveFile(singleFile, 'banner')
      const { error } = await supabase.from('configs').upsert({ key: 'hero', value: { backgroundImage: url } })
      if (error) throw error
      revalidatePath('/')
      return NextResponse.json({ success: true, url })
    }

    if (type === 'exhibition') {
      let imageUrls = existingImagesStr ? JSON.parse(existingImagesStr) : []
      if (files.length > 0) {
        const newImageUrls = await Promise.all(files.map((file, idx) => saveFile(file, 'exhibitions', idx)))
        imageUrls = [...imageUrls, ...newImageUrls]
      }
      const data = { title, date, location, image: imageUrls[mainIndex] || imageUrls[0], images: imageUrls, description: "" }
      const { error } = id ? await supabase.from('exhibitions').update(data).eq('id', parseInt(id)) : await supabase.from('exhibitions').insert(data)
      if (error) throw error
    } else {
      const imageUrls = await Promise.all(files.map((file, idx) => saveFile(file, 'gallery', idx)))
      const data = { title: title || '제목 없음', date: date || new Date().toISOString().split('T')[0], cover_image: imageUrls[0], images: imageUrls }
      const { error } = await supabase.from('activities').insert(data)
      if (error) throw error
    }

    revalidatePath('/')
    revalidatePath('/archive/exhibitions')
    revalidatePath('/archive/records')
    
    // 최신 리스트 반환
    const table = type === 'exhibition' ? 'exhibitions' : 'activities'
    const { data: latestData } = await supabase.from(table).select('*').order('id', { ascending: false })

    return NextResponse.json({ 
      success: true, 
      list: latestData || []
    })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const id = searchParams.get('id')
    if (!type || !id) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

    const table = type === 'exhibition' ? 'exhibitions' : 'activities'
    const { error } = await supabase.from(table).delete().eq('id', parseInt(id))
    if (error) throw error

    revalidatePath('/')
    revalidatePath('/archive/exhibitions')
    revalidatePath('/archive/records')

    const { data: latestData } = await supabase.from(table).select('*').order('id', { ascending: false })
    return NextResponse.json({ success: true, list: latestData || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
