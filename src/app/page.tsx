import Hero from '@/components/Hero'
import Link from 'next/link'
import Image from 'next/image'
import styles from './Home.module.css'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface Activity {
  id: number;
  title: string;
  date: string;
  cover_image: string;
  images: string[];
}

async function getActivities(): Promise<Activity[]> {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('date', { ascending: false })
  
  if (error) {
    console.error('Failed to fetch activities:', error)
    return []
  }
  return data || []
}

export default async function Home() {
  const activities = await getActivities()
  const previewActivities = (activities || []).slice(0, 6)

  return (
    <div>
      <Hero />
      <section className={styles.previewSection}>
        <div className="container">
          <div className={styles.sectionTitleContainer}>
            <span className={styles.sectionTag}>latest news</span>
          </div>
          <div className={styles.previewGrid}>
            {previewActivities.map((activity: Activity) => (
              <Link key={activity.id} href={`/archive/records/${activity.id}`} className={styles.previewItem}>
                <div className={styles.previewImage}>
                  <Image
                    src={activity.cover_image}
                    alt={activity.title}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    style={{ objectFit: 'cover' }}
                    loading="lazy"
                  />
                </div>
                {activity.title && (
                  <div className={styles.previewOverlay}>
                    <h3>{activity.title}</h3>
                    {activity.date && <p className={styles.previewDate}>{activity.date}</p>}
                  </div>
                )}
              </Link>
            ))}
          </div>
          <div className={styles.viewAllContainer}>
            <Link href="/archive/records" className={styles.viewAllLink}>
              모든 활동 보기 →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
