export type EventCategory = {
  id: string
  label: string
  emoji: string
  color: string     // pastel hex used on the calendar
  textColor: string // dark shade for text on top
}

export const EVENT_CATEGORIES: EventCategory[] = [
  { id: 'workout',  label: 'אימונים',       emoji: '🏃', color: '#A7F3D0', textColor: '#065F46' },
  { id: 'fun',      label: 'כיף ובילויים',  emoji: '🎉', color: '#FDE68A', textColor: '#78350F' },
  { id: 'event',    label: 'אירועים',        emoji: '🎊', color: '#DDD6FE', textColor: '#4C1D95' },
  { id: 'family',   label: 'משפחה וחברים',  emoji: '❤️', color: '#FBCFE8', textColor: '#831843' },
  { id: 'work',     label: 'עבודה ולימודים', emoji: '💼', color: '#BAE6FD', textColor: '#0C4A6E' },
  { id: 'health',   label: 'בריאות ורפואה', emoji: '🏥', color: '#FEF08A', textColor: '#713F12' },
  { id: 'travel',   label: 'טיולים ונסיעות',emoji: '✈️', color: '#E0F2FE', textColor: '#164E63' },
  { id: 'holiday',  label: 'חגים ושבת',     emoji: '✡️', color: '#FCE7F3', textColor: '#9D174D' },
  { id: 'other',    label: 'כללי',           emoji: '📅', color: '#E5E7EB', textColor: '#374151' },
]

const KEYWORD_MAP: Record<string, string[]> = {
  workout: [
    'הליכה', 'ריצה', 'פילאטיס', 'כדורסל', 'כדורגל', 'שחייה', 'בריכה',
    'יוגה', 'חדר כושר', 'כושר', 'אימון', 'ספורט', 'זומבה', 'רכיבה',
    'טניס', 'כדורעף', 'ג\'ים', 'gym', 'אקווה', 'קרוספיט', 'crossfit',
    'טרמפולינה', 'קיקבוקסינג', 'בוקסינג', 'קרב מגע', 'ריקוד',
    'walking', 'running', 'pilates', 'basketball', 'football', 'swimming',
    'yoga', 'tennis', 'volleyball', 'cycling', 'workout', 'training',
  ],
  fun: [
    'מסעדה', 'בית קפה', 'קפה', 'ים', 'ביץ', 'חוף', 'קולנוע', 'סרט',
    'פיקניק', 'מסיבה', 'בילוי', 'בר', 'פאב', 'גלריה', 'מוזיאון',
    'הצגה', 'קונצרט', 'פסטיבל', 'שוק', 'קניות', 'ספא', 'מניקור',
    'פדיקור', 'תספורת', 'בריחה', 'קאטינג', 'כרטיסים', 'פארק',
    'אטרקציה', 'בידור', 'party', 'restaurant', 'cafe', 'beach', 'movie',
    'cinema', 'concert', 'festival', 'spa', 'mall',
  ],
  event: [
    'חתונה', 'אירוסין', 'בר מצווה', 'בת מצווה', 'ברית', 'מסיבת רווקות',
    'מסיבת רווקים', 'קבלת פנים', 'אירוע', 'טקס', 'חגיגה', 'הכנסת ספר תורה',
    'סיום', 'בוגרים', 'גננת', 'סיום כיתה',
    'wedding', 'bar mitzvah', 'bat mitzvah', 'engagement', 'ceremony',
  ],
  family: [
    'יום הולדת', 'ביקור', 'סבתא', 'סבא', 'אמא', 'אבא', 'אח', 'אחות',
    'דוד', 'דודה', 'בן דוד', 'בת דוד', 'נכד', 'נכדה', 'ארוחת ערב',
    'ארוחת צהריים', 'ארוחת בוקר', 'ארוחה', 'מפגש משפחתי', 'גיבוש',
    'birthday', 'family', 'grandma', 'grandpa', 'dinner', 'lunch', 'brunch',
  ],
  work: [
    'ישיבה', 'פגישה', 'ראיון', 'קורס', 'שיעור', 'בחינה', 'מבחן',
    'הרצאה', 'עבודה', 'כנס', 'הדרכה', 'סמינר', 'וובינר', 'פרזנטציה',
    'מצגת', 'לימודים', 'אוניברסיטה', 'מכללה', 'בית ספר', 'גן', 'גנון',
    'חוג', 'שיעורי בית', 'פרויקט', 'דדליין', 'יעד',
    'meeting', 'interview', 'exam', 'lecture', 'conference', 'webinar',
    'presentation', 'deadline', 'class', 'course', 'seminar',
  ],
  health: [
    'רופא', 'דוקטור', 'רפואה', 'בדיקה', 'תור', 'שיניים', 'קופת חולים',
    'מרפאה', 'בית חולים', 'ניתוח', 'טיפול', 'פיזיותרפיה', 'נוירולוג',
    'עיניים', 'אורטופד', 'דרמטולוג', 'גינקולוג', 'ילדים', 'וטרינר',
    'תרופות', 'חיסון', 'אולטרסאונד', 'mri', 'blood test', 'דם',
    'doctor', 'dentist', 'clinic', 'hospital', 'appointment', 'checkup',
    'therapy', 'physiotherapy', 'vaccination',
  ],
  travel: [
    'טיול', 'נסיעה', 'טיסה', 'חופשה', 'נופש', 'מלון', 'אירוח', 'airbnb',
    'תל אביב', 'ירושלים', 'חיפה', 'אילת', 'נתניה', 'אביב', 'מחו"ל',
    'חו"ל', 'פריז', 'לונדון', 'ניו יורק', 'ברצלונה', 'רומא', 'אמסטרדם',
    'גרמניה', 'איטליה', 'יוון', 'תאילנד', 'הודו', 'יפן', 'ארה"ב',
    'trip', 'flight', 'vacation', 'hotel', 'travel', 'abroad',
  ],
  holiday: [
    'שבת', 'שבת קודש', 'ראש השנה', 'יום כיפור', 'סוכות', 'שמחת תורה',
    'חנוכה', 'פורים', 'פסח', 'שבועות', 'ל"ג בעומר', 'יום העצמאות',
    'יום ירושלים', 'תשעה באב', 'ראש חודש', 'ערב חג', 'חג', 'ליל סדר',
    'shabbat', 'passover', 'hanukkah', 'purim', 'rosh hashana',
  ],
}

export function detectEventCategory(title: string): EventCategory {
  const lower = title.trim().toLowerCase()

  for (const [catId, keywords] of Object.entries(KEYWORD_MAP)) {
    for (const kw of keywords) {
      if (lower.includes(kw.toLowerCase())) {
        return EVENT_CATEGORIES.find((c) => c.id === catId)!
      }
    }
  }

  return EVENT_CATEGORIES.find((c) => c.id === 'other')!
}

export function getCategoryById(id: string): EventCategory {
  return EVENT_CATEGORIES.find((c) => c.id === id) ?? EVENT_CATEGORIES[EVENT_CATEGORIES.length - 1]
}
