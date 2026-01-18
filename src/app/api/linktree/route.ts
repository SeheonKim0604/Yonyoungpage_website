import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, link, id, oldName } = body
    
    let dbError = null;

    if (action === 'add') {
      const { error } = await supabase
        .from('linktree')
        .insert({
          name: link.name,
          url: link.url,
          category: link.category
        })
      dbError = error
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
      dbError = error
    }
    else if (action === 'delete') {
      const { error } = await supabase
        .from('linktree')
        .delete()
        .or(`id.eq.${id || 0},name.eq.${oldName || ''}`)
      dbError = error
    }

    if (dbError) {
      console.error('Database Error:', dbError)
      return NextResponse.json({ 
        error: `DB 오류: ${dbError.message}`, 
        details: dbError.details,
        hint: dbError.hint 
      }, { status: 500 })
    }

    // 작업 완료 후 최신 전체 리스트 조회
    const { data, error: fetchError } = await supabase
      .from('linktree')
      .select('*')
      .order('id', { ascending: true })

    if (fetchError) throw fetchError

    return NextResponse.json({ success: true, linktree: data || [] })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ error: `서버 오류: ${error.message}` }, { status: 500 })
  }
}
