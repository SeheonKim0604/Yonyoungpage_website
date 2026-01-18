 import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const type = params.type
    let table = ''
    
    // 타입에 따른 테이블 매핑
    switch(type) {
      case 'activities': table = 'activities'; break;
      case 'exhibitions': table = 'exhibitions'; break;
      case 'photographers': table = 'photographers'; break;
      case 'linktree': table = 'linktree'; break;
      case 'hero':
      case 'about':
      case 'banner':
        const { data: configData, error: configError } = await supabase
          .from('configs')
          .select('value')
          .eq('key', type)
          .single()
        if (configError) throw configError
        return NextResponse.json(configData.value)
      default:
        return NextResponse.json({ error: 'Invalid data type' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order(table === 'photographers' ? 'generation' : 'id', { ascending: false })

    if (error) throw error

    // 프론트엔드 호환성을 위한 데이터 변환
    let finalData = data
    if (type === 'activities') {
      finalData = data.map((item: any) => ({
        ...item,
        coverImage: item.cover_image
      }))
    } else if (type === 'photographers') {
      const grouped = data.reduce((acc: any[], curr: any) => {
        let group = acc.find(g => g.generation === curr.generation)
        if (!group) {
          group = { generation: curr.generation, members: [] }
          acc.push(group)
        }
        group.members.push({
          name: curr.name,
          type: curr.role,
          mainPhoto: curr.image,
          instagram: curr.instagram,
          generation: curr.generation
        })
        return acc
      }, [])
      finalData = grouped
    }

    return NextResponse.json(finalData, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error) {
    console.error('Data fetch error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
