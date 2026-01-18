import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { id, title } = await request.json()

    if (!id || title === undefined) {
      return NextResponse.json({ error: 'ID와 제목이 필요합니다.' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('activities')
      .update({ title: title })
      .eq('id', id)
      .select()

    if (error) {
      console.error('제목 업데이트 에러:', error)
      return NextResponse.json({ error: '업데이트 중 오류가 발생했습니다.' }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: '활동 기록을 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json({ success: true, activities: data })
  } catch (error) {
    console.error('제목 업데이트 에러:', error)
    return NextResponse.json({ error: '업데이트 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
