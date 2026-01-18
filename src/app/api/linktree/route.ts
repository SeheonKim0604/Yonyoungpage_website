import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, link, id, oldName } = body
    
    if (action === 'add') {
      const { error } = await supabase
        .from('linktree')
        .insert({
          name: link.name,
          url: link.url,
          category: link.category
        })
      if (error) throw error
    } 
    else if (action === 'edit') {
      const { error } = await supabase
        .from('linktree')
        .update({
          name: link.name,
          url: link.url,
          category: link.category
        })
        .or(`id.eq.${id || link.id || 0},name.eq.${oldName || ''}`)
      if (error) throw error
    }
    else if (action === 'delete') {
      const { error } = await supabase
        .from('linktree')
        .delete()
        .or(`id.eq.${id || 0},name.eq.${oldName || ''}`)
      if (error) throw error
    }

    // 작업 완료 후 최신 전체 리스트 조회 (정렬 순서 통일: id 오름차순)
    const { data, error: fetchError } = await supabase
      .from('linktree')
      .select('id, name, url, category')
      .order('id', { ascending: true })

    if (fetchError) throw fetchError

    return NextResponse.json({ success: true, linktree: data || [] })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ error: '작업 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
