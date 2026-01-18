import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('photographers')
      .select('*')
      .order('generation', { ascending: false })

    if (error) throw error

    // 기존 JSON 구조(기수별 그룹화)로 변환
    const grouped = data.reduce((acc: any[], curr: any) => {
      let group = acc.find(g => g.generation === curr.generation)
      if (!group) {
        group = { generation: curr.generation, members: [] }
        acc.push(group)
      }
      group.members.push({
        id: curr.id,
        name: curr.name,
        type: curr.role,
        mainPhoto: curr.image,
        instagram: curr.instagram,
        generation: curr.generation
      })
      return acc
    }, [])

    return NextResponse.json(grouped)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: '데이터를 읽어오는데 실패했습니다.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, photographer, id, generation, oldName } = body
    
    if (action === 'add') {
      const { error } = await supabase
        .from('photographers')
        .insert({
          generation: photographer.generation,
          name: photographer.name,
          role: photographer.type || '',
          image: photographer.mainPhoto || '',
          instagram: photographer.instagram || ''
        })
      if (error) throw error
    } 
    else if (action === 'edit') {
      const { error } = await supabase
        .from('photographers')
        .update({
          generation: photographer.generation,
          name: photographer.name,
          role: photographer.type || '',
          image: photographer.mainPhoto || '',
          instagram: photographer.instagram || ''
        })
        .eq('id', id || photographer.id)
      if (error) throw error
    }
    else if (action === 'delete') {
      const { error } = await supabase
        .from('photographers')
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
