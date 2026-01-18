import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, link, id } = body
    
    if (action === 'add') {
      const { error } = await supabase
        .from('linktree')
        .insert({
          name: link.name,
          url: link.url
        })
      if (error) throw error
    } 
    else if (action === 'edit') {
      const { error } = await supabase
        .from('linktree')
        .update({
          name: link.name,
          url: link.url
        })
      .eq('id', id || link.id)
      if (error) throw error
    }
    else if (action === 'delete') {
      const { error } = await supabase
        .from('linktree')
        .delete()
        .eq('id', id)
      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: '작업 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
