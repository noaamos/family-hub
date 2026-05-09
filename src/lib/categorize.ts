export type Category = {
  id: string
  label: string
  emoji: string
}

export const CATEGORIES: Category[] = [
  { id: 'fridge',   label: 'מקרר',           emoji: '🥛' },
  { id: 'veggies',  label: 'ירקות',           emoji: '🥬' },
  { id: 'fruits',   label: 'פירות',           emoji: '🍎' },
  { id: 'meat',     label: 'בשר ועוף',        emoji: '🍗' },
  { id: 'bakery',   label: 'לחם ומאפים',      emoji: '🍞' },
  { id: 'dry',      label: 'יבשים ושימורים',  emoji: '🥫' },
  { id: 'drinks',   label: 'משקאות',          emoji: '🥤' },
  { id: 'cleaning', label: 'ניקיון',          emoji: '🧹' },
  { id: 'other',    label: 'אחר',             emoji: '🛒' },
]

const KEYWORD_MAP: Record<string, string[]> = {
  fridge: [
    // Hebrew
    'חלב', 'גבינה', 'קוטג', 'שמנת', 'חמאה', 'מרגרינה', 'ביצה', 'ביצים',
    'יוגורט', 'לבן', 'שמנת חמוצה', 'קשקבל', 'צהוב', 'עמק', 'גד', 'תנובה',
    'מוצרלה', 'פרמז\'ן', 'פטה', 'בולגרית', 'ריקוטה', 'עמק', 'מחלבה',
    'קפיר', 'ממרח', 'מרגרינה', 'אינגי', 'אשל',
    // English
    'milk', 'cheese', 'butter', 'cream', 'yogurt', 'egg', 'eggs',
    'cottage', 'sour cream', 'cheddar', 'mozzarella', 'parmesan',
    'feta', 'ricotta', 'margarine', 'whipped cream', 'half and half',
    'dairy', 'kefir',
  ],
  veggies: [
    // Hebrew
    'עגבנייה', 'עגבניה', 'עגבניות', 'מלפפון', 'מלפפונים', 'חסה', 'גזר',
    'פלפל', 'בצל', 'שום', 'תפוח אדמה', 'תפו"א', 'בטטה', 'כרוב',
    'ברוקולי', 'כרובית', 'חציל', 'קישוא', 'דלעת', 'סלרי', 'פטרוזיליה',
    'כוסברה', 'תרד', 'עלי בית', 'רוקט', 'אפונה', 'שעועית ירוקה',
    'תירס', 'פטריות', 'ארטישוק', 'אספרגוס', 'לפת', 'צנון', 'כרישה',
    'אבוקדו', 'עירית', 'נענע', 'בזיליקום', 'אורגנו', 'תימין',
    // English
    'tomato', 'cucumber', 'lettuce', 'carrot', 'pepper', 'onion', 'garlic',
    'potato', 'sweet potato', 'cabbage', 'broccoli', 'cauliflower',
    'eggplant', 'zucchini', 'pumpkin', 'celery', 'parsley', 'coriander',
    'spinach', 'rocket', 'arugula', 'peas', 'green beans', 'corn',
    'mushroom', 'artichoke', 'asparagus', 'radish', 'leek', 'avocado',
    'chives', 'mint', 'basil', 'oregano', 'thyme', 'vegetable', 'veggie',
  ],
  fruits: [
    // Hebrew
    'תפוח', 'בננה', 'תפוז', 'מנדרינה', 'לימון', 'ענבים', 'תות',
    'אבטיח', 'מלון', 'אפרסק', 'נקטרינה', 'שזיף', 'משמש', 'דובדבן',
    'רימון', 'אנגורייה', 'קיווי', 'מנגו', 'אנונה', 'פסיפלורה',
    'גויאבה', 'פפאיה', 'תמר', 'תאנה', 'אגס', 'פלפל מתוק',
    // English
    'apple', 'banana', 'orange', 'mandarin', 'lemon', 'lime', 'grape',
    'strawberry', 'watermelon', 'melon', 'peach', 'nectarine', 'plum',
    'apricot', 'cherry', 'pomegranate', 'kiwi', 'mango', 'papaya',
    'date', 'fig', 'pear', 'blueberry', 'raspberry', 'blackberry',
    'pineapple', 'fruit',
  ],
  meat: [
    // Hebrew
    'עוף', 'פרגית', 'חזה עוף', 'שוק עוף', 'כנפיים', 'טחון',
    'בשר', 'בקר', 'כבש', 'טלה', 'חזיר', 'נקניק', 'נקניקייה',
    'שניצל', 'המבורגר', 'קציצות', 'דג', 'דגים', 'סלמון', 'טונה',
    'פילה', 'דניס', 'לוקוס', 'בורי', 'אמנון', 'קרפיון',
    'שרימפס', 'גמבה', 'קלמרי', 'בשר קפוא', 'קוביות עוף',
    // English
    'chicken', 'beef', 'lamb', 'pork', 'turkey', 'sausage', 'hot dog',
    'schnitzel', 'burger', 'meatball', 'fish', 'salmon', 'tuna',
    'fillet', 'shrimp', 'prawn', 'squid', 'meat', 'steak', 'veal',
    'duck', 'ground beef', 'minced',
  ],
  bakery: [
    // Hebrew
    'לחם', 'פיתה', 'חלה', 'בגט', 'לחמנייה', 'קרואסון', 'עוגה',
    'עוגיות', 'מאפה', 'לפת', 'טוסט', 'לחם קל', 'לחם מלא',
    'לחם שיפון', 'פוקצ\'ה', 'ציאבטה',
    // English
    'bread', 'pita', 'challah', 'baguette', 'roll', 'croissant',
    'cake', 'cookies', 'pastry', 'toast', 'sourdough', 'rye bread',
    'focaccia', 'ciabatta', 'muffin', 'bagel', 'pretzel',
  ],
  dry: [
    // Hebrew
    'אורז', 'פסטה', 'ספגטי', 'מקרוני', 'קמח', 'סוכר', 'מלח',
    'שמן', 'שמן זית', 'חומוס', 'עדשים', 'שעועית', 'גריסים',
    'שיבולת שועל', 'קינואה', 'כוסמת', 'מוזלי', 'קורנפלקס',
    'שוקולד', 'ריבה', 'דבש', 'טחינה', 'חמוציות', 'שקדים',
    'אגוזים', 'קשיו', 'פיסטוק', 'צימוקים', 'שקדים', 'בוטנים',
    'רוטב עגבניות', 'רסק', 'שימורים', 'טונה שימורים', 'תירס שימורים',
    'חומוס שימורים', 'ממרח', 'גרנולה', 'ביסקוויט',
    // English
    'rice', 'pasta', 'spaghetti', 'flour', 'sugar', 'salt', 'oil',
    'olive oil', 'lentils', 'beans', 'oats', 'quinoa', 'buckwheat',
    'cereal', 'granola', 'chocolate', 'jam', 'honey', 'tahini',
    'almonds', 'nuts', 'cashews', 'pistachios', 'raisins', 'peanuts',
    'tomato sauce', 'canned', 'can of', 'biscuit', 'cracker', 'chips',
    'vinegar', 'soy sauce', 'ketchup', 'mustard', 'mayonnaise',
  ],
  drinks: [
    // Hebrew
    'מים', 'מיץ', 'קפה', 'תה', 'שתייה', 'קולה', 'פיילה', 'ספרייט',
    'בירה', 'יין', 'מיץ תפוזים', 'מיץ תפוחים', 'סודה', 'מים מינרליים',
    'מים מוגזים', 'אייס טי', 'אנרגטיק', 'רד בול', 'חלב שוקו',
    // English
    'water', 'juice', 'coffee', 'tea', 'soda', 'cola', 'sprite',
    'beer', 'wine', 'energy drink', 'mineral water', 'sparkling water',
    'lemonade', 'smoothie', 'shake', 'drink', 'beverage',
  ],
  cleaning: [
    // Hebrew
    'סבון', 'שמפו', 'מרכך', 'אבקת כביסה', 'נוזל כביסה', 'נוזל כלים',
    'מנקה', 'ממס', 'נייר טואלט', 'מגבות נייר', 'שקיות אשפה',
    'פריז', 'דאודורנט', 'קרם', 'משחת שיניים', 'מברשת שיניים',
    'תחתונים', 'לכה', 'ספוג', 'מטאטא', 'מגב',
    // English
    'soap', 'shampoo', 'conditioner', 'laundry', 'detergent',
    'dish soap', 'cleaner', 'bleach', 'toilet paper', 'paper towels',
    'trash bags', 'garbage bags', 'deodorant', 'toothpaste',
    'toothbrush', 'sponge', 'mop', 'cleaning',
  ],
}

export function categorize(name: string): string {
  const lower = name.trim().toLowerCase()

  for (const [categoryId, keywords] of Object.entries(KEYWORD_MAP)) {
    for (const kw of keywords) {
      if (lower.includes(kw.toLowerCase())) {
        return categoryId
      }
    }
  }

  return 'other'
}

export function getCategoryMeta(id: string): Category {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1]
}
