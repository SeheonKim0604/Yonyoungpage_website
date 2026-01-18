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

async function main() {
  try {
    console.log('데이터 강제 복구 시작...');

    // 1. Activities 복구
    const activities = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/config/activities.json'), 'utf8'));
    for (const item of activities) {
      const coverImage = await uploadImage(item.coverImage || item.image);
      const images = await Promise.all((item.images || []).map(img => uploadImage(img)));
      const { error } = await supabase.from('activities').upsert({
        id: item.id,
        title: item.title,
        date: item.date,
        cover_image: coverImage,
        images: images
      });
      if (error) console.error(`Activity ${item.id} 복구 실패:`, error.message);
    }

    // 2. Exhibitions 복구
    const exhibitions = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/config/exhibitions.json'), 'utf8'));
    for (const item of exhibitions) {
      const image = await uploadImage(item.image || item.coverImage);
      const images = await Promise.all((item.images || [item.image]).map(img => uploadImage(img)));
      const { error } = await supabase.from('exhibitions').upsert({
        id: item.id,
        title: item.title,
        date: item.date,
        location: item.location,
        image: image,
        images: images,
        description: item.description || ''
      });
      if (error) console.error(`Exhibition ${item.id} 복구 실패:`, error.message);
    }

    console.log('데이터 강제 복구 완료!');
  } catch (error) {
    console.error('복구 중 오류 발생:', error);
  }
}

main();
