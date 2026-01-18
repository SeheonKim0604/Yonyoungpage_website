import './About.css'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface Activity {
  month: string;
  title: string;
}

interface HistoryItem {
  year: string;
  title: string;
}

interface AboutData {
  activities: Activity[];
  history: HistoryItem[];
}

async function getAboutData(): Promise<AboutData> {
  const { data, error } = await supabase
    .from('configs')
    .select('value')
    .eq('key', 'about')
    .single()
  
  if (error || !data) {
    return {
      activities: [],
      history: []
    }
  }
  return data.value
}

export default async function About() {
  const data = await getAboutData()
  const { activities, history } = data

  return (
    <div className="about-page">
      <div className="container">
        <section className="about-hero"></section>

        <section className="about-content">
          <div className="about-section">
            <h2>연영회 소개</h2>
            <p>
              연영회는 사진을 통해 세상을 기록하고 표현하는 동아리입니다.
              우리는 다양한 주제와 스타일로 사진을 찍으며, 서로의 작품을 공유하고
              함께 성장해 나갑니다.
            </p>
          </div>

          <div className="about-section activity-section">
            <h2>연간 활동</h2>
            <div className="activity-columns">
              <div className="activity-column">
                {activities.slice(0, 3).map((activity: Activity, index: number) => (
                  <div key={index} className="activity-timeline-item">
                    <div className="dot"></div>
                    <div className="content">
                      <span className="month">{activity.month}</span>
                      <span className="title">{activity.title}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="activity-column">
                {activities.slice(3).map((activity: Activity, index: number) => (
                  <div key={index} className="activity-timeline-item">
                    <div className="dot"></div>
                    <div className="content">
                      <span className="month">{activity.month}</span>
                      <span className="title">{activity.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="about-section activity-section">
            <h2>연혁</h2>
            <div className="activity-columns single-column">
              <div className="activity-column">
                {history.map((item: HistoryItem, index: number) => (
                  <div key={index} className="activity-timeline-item">
                    <div className="dot"></div>
                    <div className="content">
                      <span className="month">{item.year}</span>
                      <span className="title">{item.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
