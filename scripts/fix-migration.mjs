import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function uploadImage(localPath) {
  if (!localPath || !localPath.startsWith('/images/')) return localPath;
  const parts = localPath.split('/');
  const folder = parts[2];
  const fileName = parts.slice(3).join('_');
  const safeFileName = encodeURIComponent(fileName).replace(/%/g, '_'); 
  const storagePath = `${folder}/${safeFileName}`;
  const filePath = path.join(__dirname, '../public', localPath);
  if (!fs.existsSync(filePath)) return localPath;

  const fileBuffer = fs.readFileSync(filePath);
  await supabase.storage.from('images').upload(storagePath, fileBuffer, { upsert: true, contentType: 'image/jpeg' });
  const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(storagePath);
  return publicUrl;
}

async function clearTables() {
  console.log('기존 데이터 삭제 중...');
  await supabase.from('activities').delete().neq('id', 0);
  await supabase.from('exhibitions').delete().neq('id', 0);
  await supabase.from('photographers').delete().neq('id', 0);
  await supabase.from('linktree').delete().neq('id', 0);
  await supabase.from('configs').delete().neq('key', '');
}

async function main() {
  try {
    await clearTables();
    
    // 1. Activities (기존 ID 유지)
    console.log('Activities 이전 중...');
    const activities = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/config/activities.json'), 'utf8'));
    for (const item of activities) {
      const coverImage = await uploadImage(item.coverImage || item.image);
      const images = await Promise.all((item.images || []).map(img => uploadImage(img)));
      await supabase.from('activities').insert({
        id: item.id, // 기존 ID(타임스탬프) 유지
        title: item.title,
        date: item.date,
        cover_image: coverImage,
        images: images
      });
    }

    // 2. Exhibitions (기존 ID 유지)
    console.log('Exhibitions 이전 중...');
    const exhibitions = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/config/exhibitions.json'), 'utf8'));
    for (const item of exhibitions) {
      const image = await uploadImage(item.image || item.coverImage);
      const images = await Promise.all((item.images || [item.image]).map(img => uploadImage(img)));
      await supabase.from('exhibitions').insert({
        id: item.id,
        title: item.title,
        date: item.date,
        location: item.location,
        image: image,
        images: images,
        description: item.description || ''
      });
    }

    // 3. Photographers (Works 데이터 포함)
    console.log('Photographers 이전 중...');
    const photographersData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/config/photographers.json'), 'utf8'));
    for (const group of photographersData) {
      for (const member of group.members) {
        const image = await uploadImage(member.mainPhoto);
        const works = await Promise.all((member.works || []).map(img => uploadImage(img)));
        await supabase.from('photographers').insert({
          generation: group.generation,
          name: member.name,
          role: member.type || '',
          image: image,
          instagram: member.instagram || '',
          works: works // 추가된 컬럼에 데이터 삽입
        });
      }
    }

    // 4. Linktree
    console.log('Linktree 이전 중...');
    const linktree = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/config/linktree.json'), 'utf8'));
    for (const item of linktree) {
      await supabase.from('linktree').insert({ name: item.name, url: item.url });
    }

    // 5. Configs
    console.log('Configs 이전 중...');
    const hero = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/config/hero.json'), 'utf8'));
    if (hero.backgroundImage) hero.backgroundImage = await uploadImage(hero.backgroundImage);
    await supabase.from('configs').upsert({ key: 'hero', value: hero });

    const about = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/config/about.json'), 'utf8'));
    await supabase.from('configs').upsert({ key: 'about', value: about });

    const banner = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/config/banner.json'), 'utf8'));
    const updatedBanner = await Promise.all(banner.map(img => uploadImage(img)));
    await supabase.from('configs').upsert({ key: 'banner', value: updatedBanner });

    console.log('데이터 복구가 완료되었습니다!');
  } catch (error) {
    console.error('오류 발생:', error);
  }
}

main();
