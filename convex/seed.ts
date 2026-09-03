import { MutationCtx, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// ─────────────────────────────────────────────────────────────────────────────
// Correct "Fear & Anxiety" paths as confirmed by product spec.
// "Trust in Uncertainty" is the only LIVE path for this prototype.
// The remaining 5 are Coming Soon.
// ─────────────────────────────────────────────────────────────────────────────

const FEAR_AND_ANXIETY_PATHS = [
  {
    title: "Trust in Uncertainty",
    description:
      "For when the future feels unclear and you’re trying to trust God one step at a time",
    isLive: true,
    totalDays: 7,
    category: "Fear & Anxiety",
  },
  {
    title: "When Anxiety Won't Stop",
    description: "For the moments when your mind won’t slow down and you need calm and clarity.",
    isLive: false,
    totalDays: 7,
    category: "Fear & Anxiety",
  },
  {
    title: "Fear of Failure",
    description: "For when the pressure to succeed makes you doubt yourself or hold back.",
    isLive: false,
    totalDays: 7,
    category: "Fear & Anxiety",
  },
  {
    title: "When the Worst Happens",
    description: "For the seasons when life breaks unexpectedly and you need strength to get through.",
    isLive: false,
    totalDays: 7,
    category: "Fear & Anxiety",
  },
  {
    title: "Afraid of What People Think",
    description: "For when fear of judgment steals your confidence and you want to live freely again.",
    isLive: false,
    totalDays: 7,
    category: "Fear & Anxiety",
  },
  {
    title: "When You Don't Feel Safe",
    description: "For the moments you feel vulnerable or overwhelmed and long for steady peace.",
    isLive: false,
    totalDays: 7,
    category: "Fear & Anxiety",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Full session content for "Trust in Uncertainty" — 7 days
// ─────────────────────────────────────────────────────────────────────────────

const TRUST_IN_UNCERTAINTY_SESSIONS = [
  {
    dayNumber: 1,
    title: "Naming the Struggle",
    scriptureReference: "Proverbs 3:5–6, NKJV",
    scriptureVerse: "Trust in the Lord with all your heart, And lean not on your own understanding; In all your ways acknowledge Him, And He shall direct your paths.",
    scriptureContext: "The words of this scripture are part of a collection of wisdom teachings attributed to Solomon. They were written to help people learn how to live in a way that honours God by trusting Him. As a ruler known for discernment, Solomon likely observed how human judgment often failed, both in leadership and daily life. These verses strongly reflect a response to that reality: a call to rely fully on God rather than personal insight. It's framed as a father's instruction to a son, and meant to guide young people (anyone actually) toward stability, wise decision-making, and a life aligned with divine direction.",
    insightText: "See God as trustworthy, wise, and one who is actively involved in human life because that is who He is. He has proven it time and time again. Proverbs 3:5-6 implies that God's understanding is far greater than human reasoning, which makes Him reliable when our personal judgment falls short. His character is shown as dependable; someone who can be trusted \"with all your heart,\" not partially. It also reveals God as relational, desiring to be acknowledged in every aspect of life, not kept at a distance. The promise that He will \"direct your paths\" shows that God is very intentional and caring, and He is present to guide you toward what is right rather than leave you to navigate life alone.",
    applicationText: "When things are uncertain, it's natural to want control and try to figure everything out before moving forward. But this scripture challenges that habit. It asks you to notice where you depend on yourself and where trusting God feels hard.\n\nSo, the real struggle isn't just about being in confusing situations, but about where you put your confidence, even in those times. It's about learning to turn to God even when things are uncertain, instead of waiting for everything to make sense before you trust Him.\n\nThis kind of trust is not passive; it is choosing to rely on God above your own judgment. \"Lean not on your own understanding\" means recognizing the limits of your perspective and resisting the urge to make it your final authority. To \"acknowledge Him\" is to consciously involve God in your decisions and daily life, not just in moments of need. And when He \"directs your paths,\" it speaks of Him aligning your steps, guiding your choices and shaping your life in line with His wisdom, even when the outcome is not immediately visible.",
    reflectionQuestions: [
      "What area of your life feels most uncertain right now?",
      "When things are unclear, what do you tend to rely on most?",
      "Can you talk to God and consciously acknowledge God in this situation?",
    ],
    guidedPrayer: "Dear God, I often struggle when I cannot see what lies ahead. I find myself relying on my own understanding instead of trusting You.\nPlease, help me to acknowledge You in every part of my life. Teach me to trust Your direction, even when the path is unclear and doesn't seem promising. Amen.",
  },
  {
    dayNumber: 2,
    title: "God Sees What You Cannot See",
    scriptureReference: "Isaiah 55:8–9, NKJV",
    scriptureVerse: "\"For My thoughts are not your thoughts, Nor are your ways My ways,\" says the LORD. \"For as the heavens are higher than the earth, so are My ways higher than your ways, And My thoughts than your thoughts.\"",
    scriptureContext: "God is speaking to the people of Israel through the prophet Isaiah during a difficult period in their history. Many of them had been taken into exile in Babylon and had lived there for decades. Their nation had been scattered, and the temple in Jerusalem had been destroyed. This was a time marked by uncertainty, discouragement, and loss.",
    insightText: "From where the Israelites stood, everything seemed unsettled and confusing. In this setting, God speaks to them about the difference between His ways and theirs. While they could only see their present condition, God was working with a perspective far beyond what they could understand.\n\nGod is infinitely wise and sees beyond human limitation. His perspective is not confined to time, circumstance, or immediate outcomes. Where we see only fragments, He sees the whole. His plans are not shaped by confusion or uncertainty.",
    applicationText: "It is difficult to trust when you cannot see the full picture. But this passage invites you to release the expectation that you should understand everything. Your role is not to see what God sees; it is to trust that He sees clearly. This means that your inability to understand does not mean God is unclear; it means He is operating from a higher perspective. A lot could change if you stopped waiting for full clarity and started trusting God's perspective.",
    reflectionQuestions: [
      "What situation feels confusing or unclear right now?",
      "Why do you feel the need to understand everything before trusting?",
      "Can you try and see what it would look like to trust God's perspective over your own?",
    ],
    guidedPrayer: "God, I struggle when I cannot see clearly. Help me to trust that your understanding is greater than mine. Teach me to rest in Your wisdom instead of relying on my limited view. Amen.",
  },
  {
    dayNumber: 3,
    title: "Trusting God's Care",
    scriptureReference: "Matthew 6:25–34, NKJV",
    scriptureVerse: "\"Therefore I say unto you, Take no thought for your life, what ye shall eat, or what ye shall drink... for your heavenly Father knoweth that ye have need of all these things. But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.\"",
    scriptureContext: "The words of Jesus in Matthew 6:25-34 took its root in The Sermon On The Mount, which is part of Jesus's teachings on the mountain near the Sea of Galilee.\n\nGalilee at that point in time [A.D. 30] was under the pressure of Roman imperial rule and the Herodian administration. Characterized by low income, heavy taxation and an undeniable moment of distress and uncertainty. Labourers were hired to work from dawn to dusk only to be compensated with a meager sum that could barely sustain them nor cater for their needs. And to make matters worse, each family had to give out about 30 percent of its grains as a tribute to the Emperor. These challenges made worry and anxiety their last resort as their hope of survival was gradually lost.\n\nJesus saw their plight and moved with compassion, gathered them unto himself — an assurance of his presence in their moment of crisis. He calmed their fears with tender love and affection and invited them to have faith and to put their trust in God, who is ever willing and capable of providing their needs.",
    insightText: "This passage reveals one vital attribute of God: \"trustworthy.\" He sees how much you struggle to balance the troubles of life, and He tenderly invites you to worry less and trust him more. He is faithful and considerate. He knows that these difficulties are too much for you to bear, and that is why he says, \"Take no thought for your life…\" because He cares so much about you, He would rather take the thought on your behalf.\n\nHe is the one who gives breath and knows it is His responsibility to preserve life. Even in challenging times, He is ever-present to bear them with you and find a way of escape.",
    applicationText: "When you feel weak and overwhelmed with problems beyond your control and life's needs press heavily on you, do not be fretful. Not because your problems are not worth thinking about, but because your heavenly father is always near to take the thought on your behalf. He does not dismiss your discomfort because He knows how much it affects you. That is why He tenderly invites you to bring your problem to Him in faith, trusting His ability to provide your needs at all times. He has given you His word today. He knows what troubles you and is able to give you rest on all sides.",
    reflectionQuestions: [
      "What is weighing on you the most at this very moment?",
      "Do you believe God is trustworthy and faithful to walk through it with you and restore your inner peace and joy?",
    ],
    guidedPrayer: "Dear God, I firmly believe that you care about all that trouble me. I trust in your word that says you will take care of my daily needs. I believe that what seems overwhelming for me does not overwhelm you. I believe you will restore my peace and inner joy. Please give me the grace to always lean on your help in times of difficulty. Amen.",
  },
  {
    dayNumber: 4,
    title: "Honest Prayer in Uncertainty",
    scriptureReference: "Psalms 13:1–6, NKJV",
    scriptureVerse: "How long wilt thou forget me, O LORD? for ever? how long wilt thou hide thy face from me? How long shall I take counsel in my soul, having sorrow in my heart daily?... But I have trusted in thy mercy; my heart shall rejoice in thy salvation. I will sing unto the LORD, because he hath dealt bountifully with me.",
    scriptureContext: "There's no precise historical record that tells us exactly when David wrote Psalm 13. Unlike some psalms that are tied to specific events, this one has no superscription linking it to a moment in his life.\n\nHowever, based on its tone and content, most scholars place it within periods of intense personal distress, likely during his years fleeing from King Saul, when he was hunted and constantly in danger, or times of internal crisis later in his reign.\n\nPsalms 13 is a short but intense prayer written by David during a season of prolonged struggle — waiting without clarity, doubt, fear and confusion. He felt abandoned by God. He felt God was distant and silent to all his struggles. The opening line says it clearly: \"How long wilt thou forget me, O Lord?\" David is exhausted from the challenges he faces, especially from external opposition.",
    insightText: "Psalms 13 reveals that God is not threatened by your honesty. You can always come to him with your emotions, pains and struggles. Though God may seem silent, His silence does not mean absence.\n\nDavid continually acknowledged the presence of God's mercy, love and past faithfulness. This shows that God is consistent even when our experience feels uncertain. He is faithful even in times of struggles — God's character doesn't change even when circumstances change. God is patient. He listens to our prayers regardless of our weaknesses. His past faithfulness becomes the foundation for present hope.",
    applicationText: "Today's passage teaches you to stop hiding your pains, struggles, and real emotions from God. When you're uncertain about your situation, you are invited to bring it to God in prayers. Stay with Him, even if nothing changes immediately as you might have expected. Stay grounded in your trust in His character.\n\nWhen you feel overwhelmed, don't isolate yourself in your thoughts. Instead, turn those thoughts into prayer. Express your pain honestly, ask God for help, and most importantly, trust in His character.",
    reflectionQuestions: [
      "Do you feel God is distant in any area of your life?",
      "What emotions have you been suppressing instead of expressing to God?",
      "Are you willing to be completely honest with God as your father, even if your words feel imperfect?",
    ],
    guidedPrayer: "God I come to you honestly. There are things I don't understand and moments where you feel silent and distant. I won't pretend, my heart is heavy, and I need you. Please hear and help me. Give me clarity where I feel confused and strength where I feel weak. Lord, even in my uncertainties, I choose to trust you.\nI believe you're still good, still present, still working. Help me hold onto your mercy when my feelings try to say otherwise.\nI will stay with you, regardless of the circumstances surrounding me. I'll keep trusting you. Amen.",
  },
  {
    dayNumber: 5,
    title: "Inviting Trust and Surrender",
    scriptureReference: "Habakkuk 2:3, NKJV",
    scriptureVerse: "For the vision is yet for an appointed time; but at the end it will speak, and it will not lie. Though it tarries, wait for it; because it will surely come, it will not tarry.",
    scriptureContext: "Habakkuk 2 was written to reassure God's people that judgment upon the Babylonians will happen. It was at a time where Babylon had taken over Assyria as the world power. In the earlier chapter, the prophet laments of the corruption in Judah. Violence and great cruelty through military power was being advanced by Babylon. They even carried men in fish nets after conquest. In chapter 2, the Lord speaks and assures him of the impending judgement against Babylon.\n\nThe 'vision' referred to is the promise the Lord made about the fate of the Babylonians. Habakkuk, the prophet, is in a state of worry, wondering whether the injustice done by Babylon will continue as the Lord watches.",
    insightText: "The Lord is faithful. He had the welfare of the children of Israel at heart. He says to the prophet that the vision will not tarry. This shows something unique about the character of God — He deals with man in 'timing' even though He Himself exists outside of time. It also shows that God does not lie. What He says is what He will do. It might not be when you expect, but it will surely happen at the time He sees it best for you.",
    applicationText: "The Lord being faithful sees you in your situation just as he saw Abraham and Sarah. You may have worried for long, but the Lord knows and is setting everything in its place that His child may enjoy the benefits. Instead of worrying, think about how your situation will end up being good at the end due to the Lord's faithfulness. This is an invitation to look up to the One that makes all things good in their time and place your trust in Him.",
    reflectionQuestions: [
      "Do you get worried when it seems as if the promises of the Lord to you are being delayed?",
      "If the Lord is faithful, shouldn't you believe much more in His faithfulness and wait for Him to do as He has said?",
      "What blessing(s) in your life can you count as the doing of the Lord, despite looking delayed at first?",
    ],
    guidedPrayer: "Lord, I come before you now understanding how faithful you are. I choose to leave all my cares to you and allow you to do as You will with my life. Lord, strengthen me to go through this time as I wait on you. In Jesus name, Amen.",
  },
  {
    dayNumber: 6,
    title: "Practising a New Response",
    scriptureReference: "Psalm 56:3, NKJV",
    scriptureVerse: "Whenever I am afraid, I will trust in you.",
    scriptureContext: "This verse was written by David during a time of real danger. He was surrounded by enemies and unsure of what would happen next. His fear was not imagined — it was immediate and personal. But instead of denying that fear, David names it openly. In the same light, he makes a deliberate decision to trust God. This moment shows that trust is not the absence of fear, but a response within it. David did not speak from comfort, but from pressure. His words give a simple but powerful pattern: Fear may come, but trust can follow too.",
    insightText: "In this passage, God shows up as a refuge who can actively be trusted in real time. David does not speak about God as distant or abstract. Instead, he responds to fear by turning toward Him. This shows that God's presence is accessible in the exact moment fear appears. God is not waiting for fear to pass before He becomes relevant — He is the place David runs to because fear has arrived. The verse presents trust as a direction toward God. God is dependable, not just in theory, but in the very situations that unsettle us.",
    applicationText: "Fear often shows up quickly, before you even have time to prepare or think clearly. In that moment, your instinct may be to panic or try to control the situation. But this passage offers another response: a conscious shift toward trust. Not later, or when things calm down, but right there.\n\nWhat would it look like to pause, even briefly, and choose trust in that exact moment? It may sound hard to do, but this is where trust becomes practical. When you pass the challenge, it goes beyond just being an idea — it now becomes a decision you can return to again and again.",
    reflectionQuestions: [
      "When fear shows up, what is your first instinctive response?",
      "What would it look like to pause and turn toward God in that exact moment?",
      "Is there a current situation where you can practice this kind of trust today?",
    ],
    guidedPrayer: "Dear God, fear comes quickly, and I often react without thinking. Help me to turn to You in those moments instead of relying on myself. Teach me to trust You right where I am, not after things settle. Remind me that You are present and dependable. Amen.",
  },
  {
    dayNumber: 7,
    title: "Anchored in God's Faithfulness",
    scriptureReference: "Hebrews 10:23, NKJV",
    scriptureVerse: "\"Let us hold fast the confession of our hope without wavering, for He who promised is faithful.\"",
    scriptureContext: "This letter is written to believers who were experiencing pressure and uncertainty because of their faith. Some were facing hardship, and others were tempted to step back from their commitment. In this setting, they are encouraged to remain steady and not give up what they believe. The instruction to \"hold fast\" comes in the middle of real difficulty, not ease. Their situation had not yet improved, and the future was still unclear. Yet the writer points to something stronger than their circumstances: the reliability of the One who made the promise.",
    insightText: "Today's scripture reveals God's character as faithful and dependable. It presents Him as one who keeps His promises, regardless of circumstances or human doubt. The call to \"hold fast… without wavering\" is rooted in the assurance that God does not change or fail, even when situations seem uncertain. This verse also reveals God as consistent. His word is reliable over time, not temporary or conditional. It shows that our hope is secure not because of our strength, but because of God's unwavering integrity and commitment to fulfill everything He has promised.",
    applicationText: "This passage reveals that God is faithful to what He has promised. His reliability does not change based on circumstances or outcomes. What He says, He remains committed to. This means that your hope is not built on how situations unfold, but on the character of God Himself. Even when things feel uncertain, God is not inconsistent or unreliable. He does not shift or withdraw from what He has spoken. His faithfulness is steady, and it is the reason you can hold on, even when everything around you feels unstable.\n\nAfter walking through uncertainty, it is easy to still feel unsettled. Situations may not have changed, and you may not have gained full clarity. But this passage invites you to anchor your hope differently. Instead of holding onto outcomes, you are called to hold onto God's faithfulness. What you stand on matters. If your confidence is tied to circumstances, it will continue to shift. But if it is tied to who God is, it can remain steady.",
    reflectionQuestions: [
      "What have you been holding onto for stability in uncertain seasons?",
      "Where have you been tempted to let go of trust?",
      "What would it look like to hold firmly to God's faithfulness today?",
    ],
    guidedPrayer: "God, when things feel uncertain, I find it difficult to hold on to hope. Thank You that Your faithfulness does not change. Help me to hold firmly to what You have promised, even when I cannot see the outcome. Teach me to anchor my trust in who You are. Amen.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Coming soon paths for the other 5 categories
// ─────────────────────────────────────────────────────────────────────────────

const OTHER_PATHS = [
  // Loss & Grief
  { title: "Grieving What Was Lost", description: "Honest lament and the slow path back to hope.", isLive: false, totalDays: 7, category: "Loss & Grief" },
  { title: "When Someone You Love Is Gone", description: "Walking through bereavement with Scripture as companion.", isLive: false, totalDays: 7, category: "Loss & Grief" },
  { title: "The Loss of a Dream", description: "For when what you hoped for didn't happen.", isLive: false, totalDays: 7, category: "Loss & Grief" },
  { title: "Letting Go Without Losing Hope", description: "Releasing with open hands what you cannot keep.", isLive: false, totalDays: 7, category: "Loss & Grief" },

  // Identity & Worth
  { title: "You Are Not What You Produce", description: "Reclaiming worth that isn't tied to performance.", isLive: false, totalDays: 7, category: "Identity & Worth" },
  { title: "When You Don't Like Who You See", description: "Learning to receive how God sees you.", isLive: false, totalDays: 7, category: "Identity & Worth" },
  { title: "Comparison and the Quiet War Inside", description: "Breaking free from measuring yourself against others.", isLive: false, totalDays: 7, category: "Identity & Worth" },
  { title: "Rooted in Beloved", description: "A deep dive into what it means to be loved by God.", isLive: false, totalDays: 7, category: "Identity & Worth" },
  { title: "Shame and the Cross", description: "Letting the gospel reach the places shame has taken hold.", isLive: false, totalDays: 7, category: "Identity & Worth" },

  // Faith & Doubt
  { title: "Honest Doubt", description: "For those who believe but struggle to believe fully.", isLive: false, totalDays: 7, category: "Faith & Doubt" },
  { title: "When God Feels Silent", description: "A path through spiritual dryness and perceived absence.", isLive: false, totalDays: 7, category: "Faith & Doubt" },
  { title: "Hard Questions, Honest Faith", description: "Holding difficult questions without losing your footing.", isLive: false, totalDays: 7, category: "Faith & Doubt" },
  { title: "After Deconstruction", description: "Finding what remains when old certainties fall away.", isLive: false, totalDays: 7, category: "Faith & Doubt" },

  // Pressure & Endurance
  { title: "Burnout and the Soul", description: "Rest for those who have given everything and have nothing left.", isLive: false, totalDays: 7, category: "Pressure & Endurance" },
  { title: "Running on Empty", description: "Spiritual renewal when your reserves are depleted.", isLive: false, totalDays: 7, category: "Pressure & Endurance" },
  { title: "When the Pressure Won't Let Up", description: "Sustaining faith under sustained strain.", isLive: false, totalDays: 7, category: "Pressure & Endurance" },
  { title: "Faithful in the Ordinary", description: "Finding God in the unglamorous, relentless days.", isLive: false, totalDays: 7, category: "Pressure & Endurance" },
  { title: "The Long Obedience", description: "Staying committed when the results aren't visible yet.", isLive: false, totalDays: 7, category: "Pressure & Endurance" },

  // Relationships & Community
  { title: "When a Relationship Is Breaking", description: "Navigating conflict with honesty and grace.", isLive: false, totalDays: 7, category: "Relationships & Community" },
  { title: "Loneliness in the Church", description: "For those who feel unseen even in community.", isLive: false, totalDays: 7, category: "Relationships & Community" },
  { title: "Forgiveness Is Hard", description: "The slow, costly work of releasing what was done to you.", isLive: false, totalDays: 7, category: "Relationships & Community" },
  { title: "Marriage Under Strain", description: "Seeking God together when togetherness feels difficult.", isLive: false, totalDays: 7, category: "Relationships & Community" },
  { title: "Carrying Someone Else's Pain", description: "For those who are the support and need support themselves.", isLive: false, totalDays: 7, category: "Relationships & Community" },
  { title: "When You Feel Like an Outsider", description: "Belonging to God when you don't belong anywhere else.", isLive: false, totalDays: 7, category: "Relationships & Community" },
];

// ─────────────────────────────────────────────────────────────────────────────
// seedPaths — safe, one-time seed. Skips if paths already exist.
// ─────────────────────────────────────────────────────────────────────────────

export const seedPaths = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("paths").take(1);
    if (existing.length > 0) {
      return { status: "already_seeded", message: "Paths already exist — run clearAndReseed to start fresh." };
    }

    return await _seed(ctx);
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// clearAndReseed — wipes all paths, sessions, and related records then reseeds.
// Use this whenever seed data changes.
// Run: npx convex run seed:clearAndReseed
// ─────────────────────────────────────────────────────────────────────────────

export const clearAndReseed = mutation({
  args: {},
  handler: async (ctx) => {
    // Wipe tables that reference paths
    const completions = await ctx.db.query("userSessionCompletions").collect();
    await Promise.all(completions.map((r) => ctx.db.delete(r._id)));

    const userPaths = await ctx.db.query("userPaths").collect();
    await Promise.all(userPaths.map((r) => ctx.db.delete(r._id)));

    const taps = await ctx.db.query("pathInterestTaps").collect();
    await Promise.all(taps.map((r) => ctx.db.delete(r._id)));

    const counts = await ctx.db.query("pathInterestCounts").collect();
    await Promise.all(counts.map((r) => ctx.db.delete(r._id)));

    const pulses = await ctx.db.query("sessionPulses").collect();
    await Promise.all(pulses.map((r) => ctx.db.delete(r._id)));

    const debriefs = await ctx.db.query("pathDebriefs").collect();
    await Promise.all(debriefs.map((r) => ctx.db.delete(r._id)));

    // Wipe sessions then paths
    const sessions = await ctx.db.query("sessions").collect();
    await Promise.all(sessions.map((r) => ctx.db.delete(r._id)));

    const paths = await ctx.db.query("paths").collect();
    await Promise.all(paths.map((r) => ctx.db.delete(r._id)));

    return await _seed(ctx);
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Internal seed helper — shared by both mutations
// ─────────────────────────────────────────────────────────────────────────────

async function _seed(ctx: MutationCtx) {
  // 1. Insert all Fear & Anxiety paths
  let livePathId: Id<"paths"> | null = null;

  for (const pathData of FEAR_AND_ANXIETY_PATHS) {
    const pathId = await ctx.db.insert("paths", pathData);
    if (pathData.isLive) {
      livePathId = pathId;
    }
  }

  // 2. Insert the 7 sessions for "Trust in Uncertainty" with full content
  if (livePathId) {
    for (const session of TRUST_IN_UNCERTAINTY_SESSIONS) {
      await ctx.db.insert("sessions", {
        pathId: livePathId,
        ...session,
      });
    }
  }

  // 3. Insert all other Coming Soon paths (no sessions needed yet)
  for (const pathData of OTHER_PATHS) {
    await ctx.db.insert("paths", pathData);
  }

  return {
    status: "seeded",
    message: `Seeded ${FEAR_AND_ANXIETY_PATHS.length} Fear & Anxiety paths (1 live, ${FEAR_AND_ANXIETY_PATHS.length - 1} coming soon), 7 sessions for "Trust in Uncertainty", and ${OTHER_PATHS.length} other coming-soon paths.`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// seedLemonSqueezyVariants — helper to set up your store variants
// Run: npx convex run seed:seedLemonSqueezyVariants
// ─────────────────────────────────────────────────────────────────────────────

export const seedLemonSqueezyVariants = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("lemonSqueezyVariantMaps").collect();
    if (existing.length > 0) {
      for (const record of existing) {
        await ctx.db.delete(record._id);
      }
    }

    const now = Date.now();

    const variants = [
      // USD Store Configuration
      {
        storeId: process.env.LEMON_SQUEEZY_USD_STORE_ID || "YOUR_USD_STORE_ID",
        currency: "USD",
        donationType: "one_time",
        tierKey: "one_time_pwyw",
        amountMinor: 1500, // Suggested $15.00
        displayLabel: "One-Time Gift",
        lemonSqueezyVariantId: process.env.LEMON_SQUEEZY_USD_ONETIME_VARIANT_ID || "YOUR_USD_ONE_TIME_VARIANT_ID",
        isActive: true,
        createdAt: now,
      },
      {
        storeId: process.env.LEMON_SQUEEZY_USD_STORE_ID || "YOUR_USD_STORE_ID",
        currency: "USD",
        donationType: "monthly",
        tierKey: "monthly_3",
        amountMinor: 300, // $3.00
        displayLabel: "$3 / month",
        lemonSqueezyVariantId: process.env.LEMON_SQUEEZY_USD_MONTHLY_3_VARIANT_ID || "YOUR_USD_MONTHLY_3_VARIANT_ID",
        isActive: true,
        createdAt: now,
      },
      {
        storeId: process.env.LEMON_SQUEEZY_USD_STORE_ID || "YOUR_USD_STORE_ID",
        currency: "USD",
        donationType: "monthly",
        tierKey: "monthly_7",
        amountMinor: 700, // $7.00
        displayLabel: "$7 / month",
        lemonSqueezyVariantId: process.env.LEMON_SQUEEZY_USD_MONTHLY_7_VARIANT_ID || "YOUR_USD_MONTHLY_7_VARIANT_ID",
        isActive: true,
        createdAt: now,
      },
      {
        storeId: process.env.LEMON_SQUEEZY_USD_STORE_ID || "YOUR_USD_STORE_ID",
        currency: "USD",
        donationType: "monthly",
        tierKey: "monthly_15",
        amountMinor: 1500, // $15.00
        displayLabel: "$15 / month",
        lemonSqueezyVariantId: process.env.LEMON_SQUEEZY_USD_MONTHLY_15_VARIANT_ID || "YOUR_USD_MONTHLY_15_VARIANT_ID",
        isActive: true,
        createdAt: now,
      },
      // NGN Store Configuration
      {
        storeId: process.env.LEMON_SQUEEZY_NGN_STORE_ID || "YOUR_NGN_STORE_ID",
        currency: "NGN",
        donationType: "one_time",
        tierKey: "one_time_pwyw",
        amountMinor: 2100000, // Suggested ₦21,000 (in kobo)
        displayLabel: "One-Time Gift",
        lemonSqueezyVariantId: process.env.LEMON_SQUEEZY_NGN_ONETIME_VARIANT_ID || "YOUR_NGN_ONE_TIME_VARIANT_ID",
        isActive: true,
        createdAt: now,
      },
      {
        storeId: process.env.LEMON_SQUEEZY_NGN_STORE_ID || "YOUR_NGN_STORE_ID",
        currency: "NGN",
        donationType: "monthly",
        tierKey: "monthly_4000",
        amountMinor: 400000, // ₦4,000
        displayLabel: "₦4,000 / month",
        lemonSqueezyVariantId: process.env.LEMON_SQUEEZY_NGN_MONTHLY_4000_VARIANT_ID || "YOUR_NGN_MONTHLY_4000_VARIANT_ID",
        isActive: true,
        createdAt: now,
      },
      {
        storeId: process.env.LEMON_SQUEEZY_NGN_STORE_ID || "YOUR_NGN_STORE_ID",
        currency: "NGN",
        donationType: "monthly",
        tierKey: "monthly_10000",
        amountMinor: 1000000, // ₦10,000
        displayLabel: "₦10,000 / month",
        lemonSqueezyVariantId: process.env.LEMON_SQUEEZY_NGN_MONTHLY_10000_VARIANT_ID || "YOUR_NGN_MONTHLY_10000_VARIANT_ID",
        isActive: true,
        createdAt: now,
      },
      {
        storeId: process.env.LEMON_SQUEEZY_NGN_STORE_ID || "YOUR_NGN_STORE_ID",
        currency: "NGN",
        donationType: "monthly",
        tierKey: "monthly_21000",
        amountMinor: 2100000, // ₦21,000
        displayLabel: "₦21,000 / month",
        lemonSqueezyVariantId: process.env.LEMON_SQUEEZY_NGN_MONTHLY_21000_VARIANT_ID || "YOUR_NGN_MONTHLY_21000_VARIANT_ID",
        isActive: true,
        createdAt: now,
      },
    ];

    for (const variant of variants) {
      await ctx.db.insert("lemonSqueezyVariantMaps", variant);
    }

    return `${variants.length} variants seeded successfully!`;
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// seedFlutterwavePlans — helper to set up your Flutterwave plans
// Run: npx convex run seed:seedFlutterwavePlans
// ─────────────────────────────────────────────────────────────────────────────

export const seedFlutterwavePlans = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("flutterwavePlanMaps").collect();
    if (existing.length > 0) {
      for (const record of existing) {
        await ctx.db.delete(record._id);
      }
    }

    const now = Date.now();

    const plans = [
      // USD Store Configuration
      {
        currency: "USD",
        donationType: "one_time",
        tierKey: "one_time_pwyw",
        amount: 15.00, // Suggested $15.00
        displayLabel: "One-Time Gift",
        isActive: true,
        createdAt: now,
      },
      {
        currency: "USD",
        donationType: "monthly",
        tierKey: "monthly_3",
        amount: 3.00, // $3.00
        displayLabel: "$3 / month",
        flutterwavePlanId: process.env.FLUTTERWAVE_USD_PLAN_3_ID || "12345", // Plan ID from dashboard
        isActive: true,
        createdAt: now,
      },
      {
        currency: "USD",
        donationType: "monthly",
        tierKey: "monthly_7",
        amount: 7.00, // $7.00
        displayLabel: "$7 / month",
        flutterwavePlanId: process.env.FLUTTERWAVE_USD_PLAN_7_ID || "12346",
        isActive: true,
        createdAt: now,
      },
      {
        currency: "USD",
        donationType: "monthly",
        tierKey: "monthly_15",
        amount: 15.00, // $15.00
        displayLabel: "$15 / month",
        flutterwavePlanId: process.env.FLUTTERWAVE_USD_PLAN_15_ID || "12347",
        isActive: true,
        createdAt: now,
      },
      // NGN Store Configuration
      {
        currency: "NGN",
        donationType: "one_time",
        tierKey: "one_time_pwyw",
        amount: 7000.00, // Suggested ₦7,000
        displayLabel: "One-Time Gift",
        isActive: true,
        createdAt: now,
      },
      {
        currency: "NGN",
        donationType: "monthly",
        tierKey: "monthly_ngn_3",
        amount: 2500.00, // ₦2,500
        displayLabel: "₦2,500 / month",
        flutterwavePlanId: process.env.FLUTTERWAVE_NGN_PLAN_3_ID || "YOUR_NGN_PLAN_3_ID",
        isActive: true,
        createdAt: now,
      },
      {
        currency: "NGN",
        donationType: "monthly",
        tierKey: "monthly_ngn_7",
        amount: 5000.00, // ₦5,000
        displayLabel: "₦5,000 / month",
        flutterwavePlanId: process.env.FLUTTERWAVE_NGN_PLAN_7_ID || "YOUR_NGN_PLAN_7_ID",
        isActive: true,
        createdAt: now,
      },
      {
        currency: "NGN",
        donationType: "monthly",
        tierKey: "monthly_ngn_15",
        amount: 10000.00, // ₦10,000
        displayLabel: "₦10,000 / month",
        flutterwavePlanId: process.env.FLUTTERWAVE_NGN_PLAN_15_ID || "YOUR_NGN_PLAN_15_ID",
        isActive: true,
        createdAt: now,
      },
    ];

    for (const plan of plans) {
      await ctx.db.insert("flutterwavePlanMaps", plan);
    }

    return `${plans.length} plans seeded successfully!`;
  }
});

