
import { handleBrowserAction } from '../src/tools/BrowserTool/handler.js'

async function searchMission() {
  console.log('🕵️ ภารกิจค้นหาอัจฉริยะ (V5 - ใช้คำสั่ง Search ตัวแรง)...')
  try {
    // ใช้คำสั่ง search ตัวแรงที่เรามีใน handler.ts
    // มันจะจัดการ navigate -> type -> press enter -> extract ให้เสร็จในตัวเดียว!
    const data = await handleBrowserAction({ 
      action: 'search', 
      query: 'room temperature superconductor breakthroughs 2026',
      engine: 'google',
      headless: true
    }) as any;

    if (data.content) {
      const results = JSON.parse(data.content);
      console.log('\n✨ --- สรุปผลการค้นหาจาก Google (Auto-Extracted) --- ✨')
      results.forEach((res: any, i: number) => {
        console.log(`${i + 1}. 📌 ${res.title}`);
        console.log(`   🔗 ${res.link}`);
        console.log(`   📝 ${res.snippet}\n`);
      });
      console.log('------------------------------------------------------\n')
    } else {
      console.log('⚠️ ไม่พบข้อมูลใน content:', data.error || 'Unknown error');
    }

    await handleBrowserAction({ action: 'close' })
    console.log('👋 ภารกิจสำเร็จลุล่วง!')

  } catch (error) {
    console.error('❌ พัง:', error)
    await handleBrowserAction({ action: 'close' }).catch(() => {})
  }
}

searchMission()
