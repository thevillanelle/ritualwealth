// ─── Quiz definitions ──────────────────────────────────────────────────────
// Each quiz: slug, title, subtitle, 8-12 questions
// question types: single | multi | number | scale

export const QUIZZES = [
  // ─────────────────────────────────────────────────────────────────────────
  // 1. FIRE TYPE
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'fire_type',
    title: 'What kind of FIRE is yours?',
    subtitle: 'Not all financial independence looks the same. Let\'s find your version.',
    color: '#C8A86B',
    questions: [
      {
        id: 'ft1',
        question: 'What does your ideal retired life look like?',
        type: 'single',
        options: [
          { value: 'lean', label: 'Simple, low-cost, maximum freedom — I don\'t need much' },
          { value: 'moderate', label: 'Comfortable but not extravagant — good food, good travel, no stress' },
          { value: 'fat', label: 'Full lifestyle maintenance — I want everything I have now, forever' },
          { value: 'work_lite', label: 'Still working, but only what I love and only when I want' },
          { value: 'coast', label: 'I want to hit a number young and let compound interest do the rest' },
        ],
      },
      {
        id: 'ft2',
        question: 'What\'s your current relationship with work?',
        type: 'single',
        options: [
          { value: 'hate', label: 'I want out as fast as possible' },
          { value: 'tolerate', label: 'It\'s fine, but I want options' },
          { value: 'love_some', label: 'I love parts of it — I\'d keep doing them for free' },
          { value: 'love_all', label: 'I genuinely love my work — I just want it on my terms' },
        ],
      },
      {
        id: 'ft3',
        question: 'What\'s your estimated annual spending in retirement?',
        type: 'single',
        options: [
          { value: 'under_30k', label: 'Under $30,000 — I live lean' },
          { value: '30_60k', label: '$30,000–$60,000 — comfortable' },
          { value: '60_100k', label: '$60,000–$100,000 — lifestyle maintained' },
          { value: 'over_100k', label: 'Over $100,000 — I intend to live well' },
        ],
      },
      {
        id: 'ft4',
        question: 'How do you feel about geographic flexibility?',
        type: 'single',
        options: [
          { value: 'very_flexible', label: 'Very flexible — I\'d relocate anywhere for lower cost of living' },
          { value: 'somewhat', label: 'Somewhat — I\'d consider another city, maybe another country' },
          { value: 'rooted', label: 'I\'m rooted — I\'m staying in my city' },
          { value: 'multi_city', label: 'I want to split time between multiple places' },
        ],
      },
      {
        id: 'ft5',
        question: 'When do you want to reach financial independence?',
        type: 'single',
        options: [
          { value: 'under_5', label: 'As soon as possible (under 5 years)' },
          { value: '5_10', label: 'Within 5–10 years' },
          { value: '10_20', label: 'In 10–20 years, I\'m building steadily' },
          { value: 'whenever', label: 'Whenever it happens — I\'m not racing' },
        ],
      },
      {
        id: 'ft6',
        question: 'Would you ever do paid work after reaching your FIRE number?',
        type: 'single',
        options: [
          { value: 'never', label: 'No — I\'m done the day I hit the number' },
          { value: 'maybe_passion', label: 'Maybe, but only passion projects that happen to pay' },
          { value: 'yes_parttime', label: 'Yes, part-time or consulting to keep things interesting' },
          { value: 'yes_fulltime', label: 'Possibly full-time if I find something I love more' },
        ],
      },
      {
        id: 'ft7',
        question: 'What would make you feel truly financially free?',
        type: 'multi',
        options: [
          { value: 'no_alarm', label: 'Never setting an alarm again' },
          { value: 'travel', label: 'Traveling whenever I want' },
          { value: 'creative', label: 'Pursuing creative work with no income pressure' },
          { value: 'family', label: 'Being present for family without work guilt' },
          { value: 'health', label: 'Access to the best health care and wellness I want' },
          { value: 'home', label: 'Owning property outright' },
          { value: 'giving', label: 'Having enough to give generously' },
        ],
      },
      {
        id: 'ft8',
        question: 'How important is building legacy wealth (beyond your own lifetime)?',
        type: 'single',
        options: [
          { value: 'not', label: 'Not a priority — I\'m spending it all' },
          { value: 'some', label: 'Somewhat — I\'d like to leave something' },
          { value: 'important', label: 'Important — generational wealth is part of the plan' },
          { value: 'core', label: 'Central — this is the whole point' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2. CAREER PATH
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'career',
    title: 'What\'s your highest-income career path?',
    subtitle: 'Your career is your biggest wealth-building lever. Let\'s find your track.',
    color: '#4A8C6A',
    questions: [
      {
        id: 'c1',
        question: 'What best describes your current or most recent role?',
        type: 'single',
        options: [
          { value: 'individual_contributor', label: 'Individual contributor (analyst, specialist, designer, etc.)' },
          { value: 'manager', label: 'Manager or team lead' },
          { value: 'director_above', label: 'Director or above' },
          { value: 'founder', label: 'Founder or entrepreneur' },
          { value: 'freelance', label: 'Freelancer or consultant' },
          { value: 'early_career', label: 'Early career / just starting out' },
        ],
      },
      {
        id: 'c2',
        question: 'What\'s your current income range?',
        type: 'single',
        options: [
          { value: 'under_60k', label: 'Under $60,000' },
          { value: '60_100k', label: '$60,000–$100,000' },
          { value: '100_150k', label: '$100,000–$150,000' },
          { value: '150_200k', label: '$150,000–$200,000' },
          { value: 'over_200k', label: 'Over $200,000' },
        ],
      },
      {
        id: 'c3',
        question: 'What do you want your work to look like in 3 years?',
        type: 'single',
        options: [
          { value: 'same_more', label: 'Same field, higher comp' },
          { value: 'pivot', label: 'Completely different — I want a pivot' },
          { value: 'build', label: 'Building something of my own' },
          { value: 'international', label: 'International — different country, different market' },
          { value: 'portfolio', label: 'Portfolio — multiple income streams, no single job' },
        ],
      },
      {
        id: 'c4',
        question: 'What do you value most in work?',
        type: 'multi',
        options: [
          { value: 'comp', label: 'Compensation — highest number possible' },
          { value: 'autonomy', label: 'Autonomy — work on my own terms' },
          { value: 'impact', label: 'Impact — work that matters' },
          { value: 'growth', label: 'Growth — constant learning and challenge' },
          { value: 'status', label: 'Status — respected role, recognized field' },
          { value: 'stability', label: 'Stability — reliable income, low stress' },
          { value: 'creativity', label: 'Creativity — make things' },
        ],
      },
      {
        id: 'c5',
        question: 'Are you open to relocation for a significant income increase?',
        type: 'single',
        options: [
          { value: 'yes_anywhere', label: 'Yes, anywhere' },
          { value: 'yes_us', label: 'Yes, within the US' },
          { value: 'yes_international', label: 'Yes, international especially' },
          { value: 'no', label: 'No, I\'m staying where I am' },
        ],
      },
      {
        id: 'c6',
        question: 'How do you feel about leadership and managing people?',
        type: 'single',
        options: [
          { value: 'love', label: 'I love it — it\'s where I shine' },
          { value: 'open', label: 'Open to it if it comes with significant comp' },
          { value: 'prefer_ic', label: 'I prefer to stay an individual contributor' },
          { value: 'own_team', label: 'I want to build my own team, not manage in a corp' },
        ],
      },
      {
        id: 'c7',
        question: 'What\'s your strongest professional asset?',
        type: 'multi',
        options: [
          { value: 'systems', label: 'Systems thinking / operations' },
          { value: 'relationships', label: 'Relationships and stakeholder management' },
          { value: 'technical', label: 'Technical skills / domain expertise' },
          { value: 'creative', label: 'Creative / aesthetic eye' },
          { value: 'communication', label: 'Communication and storytelling' },
          { value: 'strategy', label: 'Strategy and big-picture thinking' },
          { value: 'compliance', label: 'Compliance, risk, and regulation' },
        ],
      },
      {
        id: 'c8',
        question: 'What\'s your income target in the next 3 years?',
        type: 'single',
        options: [
          { value: 'under_100k', label: 'Under $100,000' },
          { value: '100_150k', label: '$100,000–$150,000' },
          { value: '150_200k', label: '$150,000–$200,000' },
          { value: 'over_200k', label: 'Over $200,000' },
          { value: 'variable', label: 'Variable — building equity or creative income' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3. HOME PLAN
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'home',
    title: 'What\'s your home plan?',
    subtitle: 'Property is the other half of the wealth equation. Let\'s map yours.',
    color: '#C4717A',
    questions: [
      {
        id: 'h1',
        question: 'What\'s your current housing situation?',
        type: 'single',
        options: [
          { value: 'renting', label: 'Renting — no ownership plans yet' },
          { value: 'renting_planning', label: 'Renting but actively planning to buy' },
          { value: 'own_primary', label: 'I own my primary home' },
          { value: 'own_investment', label: 'I own investment property' },
          { value: 'living_with', label: 'Living with family, saving aggressively' },
        ],
      },
      {
        id: 'h2',
        question: 'What role does property play in your FIRE plan?',
        type: 'single',
        options: [
          { value: 'primary_home', label: 'Own my primary home — that\'s it' },
          { value: 'investment', label: 'Investment property / rental income is part of my plan' },
          { value: 'both', label: 'Both — primary home plus investment properties' },
          { value: 'no_ownership', label: 'None — I\'ll always rent and invest the difference' },
        ],
      },
      {
        id: 'h3',
        question: 'Where do you want to own?',
        type: 'single',
        options: [
          { value: 'current_city', label: 'My current city' },
          { value: 'different_us', label: 'Different US city (lower cost of living)' },
          { value: 'international', label: 'Internationally — I want to own abroad' },
          { value: 'multi', label: 'Multiple places — main home + elsewhere' },
          { value: 'unsure', label: 'Not sure yet' },
        ],
      },
      {
        id: 'h4',
        question: 'What kind of property are you targeting?',
        type: 'single',
        options: [
          { value: 'condo', label: 'Condo / co-op' },
          { value: 'townhouse', label: 'Townhouse' },
          { value: 'single_family', label: 'Single-family home' },
          { value: 'multi_family', label: 'Multi-family (live in one unit, rent others)' },
          { value: 'land', label: 'Land / build something custom' },
        ],
      },
      {
        id: 'h5',
        question: 'What\'s your target purchase price range?',
        type: 'single',
        options: [
          { value: 'under_250k', label: 'Under $250,000' },
          { value: '250_500k', label: '$250,000–$500,000' },
          { value: '500k_1m', label: '$500,000–$1,000,000' },
          { value: 'over_1m', label: 'Over $1,000,000' },
          { value: 'unsure', label: 'Not sure — I need to figure out the market first' },
        ],
      },
      {
        id: 'h6',
        question: 'How much do you currently have saved for a down payment?',
        type: 'single',
        options: [
          { value: 'nothing', label: 'Nothing yet — starting from zero' },
          { value: 'under_10k', label: 'Under $10,000' },
          { value: '10_25k', label: '$10,000–$25,000' },
          { value: '25_50k', label: '$25,000–$50,000' },
          { value: 'over_50k', label: 'Over $50,000' },
        ],
      },
      {
        id: 'h7',
        question: 'When do you want to buy?',
        type: 'single',
        options: [
          { value: 'now', label: 'Now or within 12 months' },
          { value: '1_3', label: '1–3 years' },
          { value: '3_5', label: '3–5 years' },
          { value: 'over_5', label: 'More than 5 years out' },
          { value: 'flexible', label: 'When the conditions are right, not on a timeline' },
        ],
      },
      {
        id: 'h8',
        question: 'What matters most to you in a home?',
        type: 'multi',
        options: [
          { value: 'space', label: 'Space — room to work, create, host' },
          { value: 'location', label: 'Location — walkable, neighborhood matters' },
          { value: 'aesthetic', label: 'Aesthetic — beautiful and feels like me' },
          { value: 'investment', label: 'Investment value — appreciation potential' },
          { value: 'community', label: 'Community — the right people around me' },
          { value: 'quiet', label: 'Peace and quiet' },
          { value: 'amenities', label: 'Building amenities (gym, doorman, roof)' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4. CREATIVE INCOME
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'creative',
    title: 'What\'s your creative income plan?',
    subtitle: 'The third income stream that changes everything. Let\'s find yours.',
    color: '#A89BC4',
    questions: [
      {
        id: 'cr1',
        question: 'Do you currently have any income outside your main job?',
        type: 'single',
        options: [
          { value: 'no', label: 'No — this is all new territory' },
          { value: 'yes_small', label: 'Yes, small amounts (under $1k/month)' },
          { value: 'yes_significant', label: 'Yes, significant ($1k–$5k/month)' },
          { value: 'yes_main', label: 'Yes — it\'s actually my main income' },
        ],
      },
      {
        id: 'cr2',
        question: 'Which of these do you have or could develop?',
        type: 'multi',
        options: [
          { value: 'writing', label: 'Writing, editing, content' },
          { value: 'design', label: 'Design, art, visual work' },
          { value: 'consulting', label: 'Consulting in my field' },
          { value: 'teaching', label: 'Teaching, coaching, courses' },
          { value: 'building', label: 'Building digital products / tools' },
          { value: 'performance', label: 'Performance, entertainment, music' },
          { value: 'physical', label: 'Physical products, crafts, handmade goods' },
          { value: 'investing', label: 'Real estate or financial investing' },
        ],
      },
      {
        id: 'cr3',
        question: 'What\'s your creative income goal?',
        type: 'single',
        options: [
          { value: 'cover_basics', label: 'Cover basic expenses so I can invest my whole salary' },
          { value: 'accelerate', label: 'Accelerate my FIRE timeline by 2–5 years' },
          { value: 'replace', label: 'Eventually replace my job entirely' },
          { value: 'legacy', label: 'Build something that generates income after I\'m done working' },
        ],
      },
      {
        id: 'cr4',
        question: 'How much time can you realistically dedicate to this?',
        type: 'single',
        options: [
          { value: 'under_5h', label: 'Under 5 hours a week' },
          { value: '5_15h', label: '5–15 hours a week' },
          { value: '15_30h', label: '15–30 hours a week' },
          { value: 'full_time', label: 'Full-time — I\'m ready to go all in' },
        ],
      },
      {
        id: 'cr5',
        question: 'What kind of creative income most appeals to you?',
        type: 'single',
        options: [
          { value: 'active', label: 'Active — I do the work, I get paid (freelance, consulting)' },
          { value: 'passive', label: 'Passive — build once, earn forever (products, courses, IP)' },
          { value: 'both', label: 'Both — active income now, building toward passive' },
          { value: 'equity', label: 'Equity — build something and sell it' },
        ],
      },
      {
        id: 'cr6',
        question: 'What\'s your creative income target per month?',
        type: 'single',
        options: [
          { value: 'under_1k', label: 'Under $1,000' },
          { value: '1_3k', label: '$1,000–$3,000' },
          { value: '3_10k', label: '$3,000–$10,000' },
          { value: 'over_10k', label: 'Over $10,000' },
        ],
      },
      {
        id: 'cr7',
        question: 'What\'s your biggest barrier to creative income right now?',
        type: 'single',
        options: [
          { value: 'time', label: 'Time — my job leaves me nothing' },
          { value: 'idea', label: 'Ideas — I don\'t know what to build or offer' },
          { value: 'confidence', label: 'Confidence — I don\'t believe I can charge for it' },
          { value: 'audience', label: 'Audience — I don\'t have one' },
          { value: 'tech', label: 'Technical skills — I can\'t execute the idea' },
          { value: 'energy', label: 'Energy — I\'m exhausted by the time I\'m off work' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 5. RISK TOLERANCE
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'risk',
    title: 'What\'s your risk profile?',
    subtitle: 'How you invest is as important as how much you invest.',
    color: '#6AAD8A',
    questions: [
      {
        id: 'r1',
        question: 'You invest $10,000 and it drops 30% in 3 months. You:',
        type: 'single',
        options: [
          { value: 'sell_all', label: 'Sell everything — I can\'t watch it go lower' },
          { value: 'sell_some', label: 'Sell some to reduce exposure' },
          { value: 'hold', label: 'Hold and wait it out' },
          { value: 'buy_more', label: 'Buy more — this is an opportunity' },
        ],
      },
      {
        id: 'r2',
        question: 'What best describes your investment experience?',
        type: 'single',
        options: [
          { value: 'none', label: 'None — I\'m just starting' },
          { value: 'index', label: 'Index funds / 401k — I set it and forget it' },
          { value: 'stocks', label: 'Individual stocks and some research' },
          { value: 'active', label: 'Active investor — options, real estate, alternatives' },
        ],
      },
      {
        id: 'r3',
        question: 'What\'s your investment time horizon?',
        type: 'single',
        options: [
          { value: 'under_5', label: 'Under 5 years — I may need this money soon' },
          { value: '5_10', label: '5–10 years' },
          { value: '10_20', label: '10–20 years' },
          { value: 'over_20', label: '20+ years — long game' },
        ],
      },
      {
        id: 'r4',
        question: 'What\'s your primary investment priority?',
        type: 'single',
        options: [
          { value: 'preserve', label: 'Preserve what I have — safety first' },
          { value: 'balance', label: 'Balanced — some growth, some protection' },
          { value: 'grow', label: 'Grow aggressively — I can handle volatility' },
          { value: 'maximize', label: 'Maximize returns — I\'m in it for the long haul' },
        ],
      },
      {
        id: 'r5',
        question: 'How do you feel about debt as a wealth tool?',
        type: 'single',
        options: [
          { value: 'avoid', label: 'Avoid all debt — I want to be debt-free' },
          { value: 'mortgage_only', label: 'Mortgage only — property is the exception' },
          { value: 'strategic', label: 'Strategic debt is fine (leverage, real estate, etc.)' },
          { value: 'tool', label: 'Debt is just a tool — use it when returns exceed the rate' },
        ],
      },
      {
        id: 'r6',
        question: 'How large is your emergency fund?',
        type: 'single',
        options: [
          { value: 'none', label: 'No emergency fund yet' },
          { value: '1_3mo', label: '1–3 months of expenses' },
          { value: '3_6mo', label: '3–6 months of expenses' },
          { value: 'over_6mo', label: 'Over 6 months — I sleep soundly' },
        ],
      },
      {
        id: 'r7',
        question: 'Which investments appeal to you most?',
        type: 'multi',
        options: [
          { value: 'index_funds', label: 'Index funds and ETFs' },
          { value: 'real_estate', label: 'Real estate' },
          { value: 'individual_stocks', label: 'Individual stocks I believe in' },
          { value: 'bonds', label: 'Bonds and fixed income' },
          { value: 'private', label: 'Private equity or startups' },
          { value: 'crypto', label: 'Crypto (small allocation)' },
          { value: 'business', label: 'Building or buying a business' },
          { value: 'international', label: 'International markets' },
        ],
      },
      {
        id: 'r8',
        question: 'What\'s your current savings rate (% of take-home pay saved/invested)?',
        type: 'single',
        options: [
          { value: 'under_10', label: 'Under 10%' },
          { value: '10_25', label: '10–25%' },
          { value: '25_50', label: '25–50%' },
          { value: 'over_50', label: 'Over 50% — I\'m sprinting to FIRE' },
        ],
      },
    ],
  },
]

// ─── Result derivation ─────────────────────────────────────────────────────

export function deriveFireType(answers) {
  const { ft1, ft3, ft6 } = answers
  if (ft1 === 'coast') return 'coast_fire'
  if (ft1 === 'work_lite' || ft6 === 'yes_parttime') return 'barista_fire'
  if (ft3 === 'under_30k' || ft1 === 'lean') return 'lean_fire'
  if (ft3 === 'over_100k' || ft1 === 'fat') return 'fat_fire'
  return 'regular_fire'
}

export const FIRE_TYPE_META = {
  lean_fire:    { label: 'Lean FIRE', number: 750000,  desc: 'Maximum freedom, minimum overhead. Your target is ~$750k invested — possible in your 30s or 40s with aggressive saving.' },
  regular_fire: { label: 'FIRE',      number: 1250000, desc: 'Comfortable retirement on your terms. ~$1.25M invested covers a middle-class lifestyle indefinitely with the 4% rule.' },
  fat_fire:     { label: 'Fat FIRE',  number: 2500000, desc: 'Full lifestyle maintenance forever. $2–3M invested means you retire without changing a thing about how you live.' },
  barista_fire: { label: 'Barista FIRE', number: 600000, desc: 'Hit partial FIRE and work part-time for benefits + fun money. Less pressure, more freedom — now.' },
  coast_fire:   { label: 'Coast FIRE',   number: 400000, desc: 'Hit a threshold early and let compound interest do the work. Stop aggressive saving and just coast to retirement.' },
}

export function deriveRiskProfile(answers) {
  const { r1, r4, r5 } = answers
  if (r1 === 'sell_all' || r4 === 'preserve') return 'conservative'
  if (r1 === 'buy_more' || r4 === 'maximize') return 'aggressive'
  if (r5 === 'tool') return 'growth'
  return 'moderate'
}

export const RISK_META = {
  conservative: { label: 'Conservative', allocation: '30% stocks · 60% bonds · 10% cash', desc: 'Capital preservation is your priority. Lower returns, lower volatility.' },
  moderate:     { label: 'Moderate',     allocation: '60% stocks · 30% bonds · 10% alternatives', desc: 'Balanced growth and protection. The classic 60/40 with some flexibility.' },
  growth:       { label: 'Growth',       allocation: '80% stocks · 10% bonds · 10% alternatives', desc: 'Long-horizon wealth building. Comfortable with swings for higher returns.' },
  aggressive:   { label: 'Aggressive',   allocation: '90% stocks · 5% real estate · 5% alternatives', desc: 'Maximum growth. You buy the dip. Volatility doesn\'t scare you — it excites you.' },
}
