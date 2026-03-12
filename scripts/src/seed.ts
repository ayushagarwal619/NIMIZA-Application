import {
  db,
  charactersTable,
  storiesTable,
  scenesTable,
  quizQuestionsTable,
} from "@workspace/db";

async function seed() {
  console.log("Seeding database...");

  const [nino, miko, zara] = await db
    .insert(charactersTable)
    .values([
      {
        name: "Nino",
        role: "Curious Explorer",
        emoji: "🧒",
        color: "#60A5FA",
        traits: ["Curious", "Creative", "Observant", "Brave"],
        description:
          "Nino loves to ask questions and explore the world around them. With a magnifying glass always in hand, Nino turns every moment into a new discovery!",
        teaches: "Questions, Awareness & Science",
      },
      {
        name: "Miko",
        role: "Kind Friend",
        emoji: "👧",
        color: "#F472B6",
        traits: ["Empathetic", "Caring", "Patient", "Generous"],
        description:
          "Miko has the biggest heart in the world! She always notices when someone is feeling sad and knows just what to say to make everyone feel included and loved.",
        teaches: "Empathy, Sharing & Kindness",
      },
      {
        name: "Zara",
        role: "Brave Problem Solver",
        emoji: "🌟",
        color: "#FFE66D",
        traits: ["Courageous", "Determined", "Wise", "Leader"],
        description:
          "When there's a problem, Zara steps up! She believes there's always a solution if you think carefully and stay brave. Zara inspires others to be their best selves.",
        teaches: "Decisions, Courage & Leadership",
      },
    ])
    .returning();

  console.log("Characters seeded:", nino.name, miko.name, zara.name);

  const stories = await db
    .insert(storiesTable)
    .values([
      {
        title: "The Missing Lunch Box",
        emoji: "🍱",
        description: "Nino discovers their lunch box is missing and learns to stay calm and think through problems step by step.",
        characterId: nino.id,
        skill: "Courage",
        ageGroup: "5-7",
        duration: 5,
        badgeEmoji: "🌟",
        badgeName: "Problem Solver",
      },
      {
        title: "Miko's New Neighbor",
        emoji: "🏡",
        description: "A new kid moves in next door and Miko learns the courage it takes to say hello and make a new friend.",
        characterId: miko.id,
        skill: "Empathy",
        ageGroup: "4-6",
        duration: 5,
        badgeEmoji: "💗",
        badgeName: "Kind Heart",
      },
      {
        title: "Zara and the Muddy Playground",
        emoji: "🌧️",
        description: "After rain makes the playground muddy, Zara rallies her friends to come up with a creative solution together.",
        characterId: zara.id,
        skill: "Sharing",
        ageGroup: "5-8",
        duration: 6,
        badgeEmoji: "🤝",
        badgeName: "Team Leader",
      },
      {
        title: "Nino Washes Up",
        emoji: "🧼",
        description: "Nino learns why washing hands before meals and after playing keeps everyone healthy and happy.",
        characterId: nino.id,
        skill: "Hygiene",
        ageGroup: "3-5",
        duration: 4,
        badgeEmoji: "✨",
        badgeName: "Clean Champion",
      },
      {
        title: "Zara Says No",
        emoji: "🛡️",
        description: "When friends dare Zara to do something dangerous, she finds the courage to say no and explains why safety matters.",
        characterId: zara.id,
        skill: "Safety",
        ageGroup: "5-8",
        duration: 5,
        badgeEmoji: "🦁",
        badgeName: "Brave Shield",
      },
      {
        title: "Miko and the Butterfly Garden",
        emoji: "🦋",
        description: "Miko discovers a magical garden and learns about caring for nature and the creatures who live there.",
        characterId: miko.id,
        skill: "Nature",
        ageGroup: "4-7",
        duration: 5,
        badgeEmoji: "🌿",
        badgeName: "Nature Friend",
      },
    ])
    .returning();

  console.log("Stories seeded:", stories.length);

  // Scenes for "The Missing Lunch Box"
  await db.insert(scenesTable).values([
    { storyId: stories[0].id, order: 1, emoji: "😰", title: "Oh No!", text: "Nino opened their backpack at lunchtime... but the lunch box was nowhere to be found! 'Oh no,' said Nino. 'What do I do?'", character: "Nino" },
    { storyId: stories[0].id, order: 2, emoji: "🧘", title: "Take a Deep Breath", text: "'When I feel worried,' Nino remembered, 'I take three big breaths first.' In... out... in... out... in... out. 'Okay, I can think clearly now.'", character: "Nino" },
    { storyId: stories[0].id, order: 3, emoji: "🔍", title: "Let's Investigate!", text: "Nino thought carefully. 'Where did I last have it? I remember Mom packed it this morning. Maybe I left it by the school gate!'", character: "Nino" },
    { storyId: stories[0].id, order: 4, emoji: "🏫", title: "Retracing Steps", text: "Nino walked back to the school entrance with their teacher. And there it was — the lunch box sitting on the bench!  'I found it!' cheered Nino.", character: "Nino" },
    { storyId: stories[0].id, order: 5, emoji: "🙏", title: "Saying Thank You", text: "Nino thanked the teacher for helping. 'Thank you for walking with me! I was scared, but thinking it through really helped!'", character: "Nino" },
    { storyId: stories[0].id, order: 6, emoji: "💡", title: "What Nino Learned", text: "That day, Nino learned: when problems feel big, breathe first, think second, and ask for help! Every problem has a solution.", character: "Nino" },
  ]);

  // Scenes for "Miko's New Neighbor"
  await db.insert(scenesTable).values([
    { storyId: stories[1].id, order: 1, emoji: "🚛", title: "Moving Day", text: "A big moving truck pulled up next door. Miko peeked through the window and saw a child looking very nervous in the yard.", character: "Miko" },
    { storyId: stories[1].id, order: 2, emoji: "💭", title: "Miko Wonders", text: "'What if they don't want to talk to me?' Miko thought. 'What if they're different from me?' But then Miko remembered how it felt to be new somewhere.", character: "Miko" },
    { storyId: stories[1].id, order: 3, emoji: "🍪", title: "A Small Idea", text: "Miko asked Mom to help bake some cookies. 'Everyone feels better with a friendly hello and something sweet,' said Mom with a smile.", character: "Miko" },
    { storyId: stories[1].id, order: 4, emoji: "🚪", title: "Knock Knock!", text: "'Hi! My name is Miko. I live next door. Would you like some cookies?' The new child's face lit up like sunshine.", character: "Miko" },
    { storyId: stories[1].id, order: 5, emoji: "😊", title: "New Friends!", text: "'My name is Sam!' said the neighbor. 'Thank you so much. I was so lonely and scared.' Soon Miko and Sam were laughing together.", character: "Miko" },
    { storyId: stories[1].id, order: 6, emoji: "💗", title: "What Miko Learned", text: "Miko learned that one small act of kindness can change someone's whole day. Being brave enough to say hello is one of the greatest gifts you can give.", character: "Miko" },
  ]);

  // Quiz for The Missing Lunch Box
  await db.insert(quizQuestionsTable).values([
    {
      storyId: stories[0].id,
      question: "What did Nino do first when they felt worried?",
      options: ["Started crying", "Took three deep breaths", "Ran home", "Asked a stranger"],
      correctIndex: 1,
    },
    {
      storyId: stories[0].id,
      question: "Where did Nino find the lunch box?",
      options: ["In the classroom", "In the cafeteria", "On a bench by the school entrance", "In the teacher's office"],
      correctIndex: 2,
    },
    {
      storyId: stories[0].id,
      question: "What is the most important lesson from Nino's story?",
      options: ["Always carry a big bag", "Never lose your things", "Breathe, think, and ask for help", "Run fast to find things"],
      correctIndex: 2,
    },
  ]);

  // Quiz for Miko's New Neighbor
  await db.insert(quizQuestionsTable).values([
    {
      storyId: stories[1].id,
      question: "Why was Miko nervous about going next door?",
      options: ["Miko was busy playing", "Miko worried Sam might not want to talk", "Miko didn't like cookies", "Miko was watching TV"],
      correctIndex: 1,
    },
    {
      storyId: stories[1].id,
      question: "What did Miko bring to welcome the new neighbor?",
      options: ["Toys", "Books", "Cookies", "Flowers"],
      correctIndex: 2,
    },
    {
      storyId: stories[1].id,
      question: "What is the lesson in Miko's story?",
      options: ["Only talk to people you know", "Baking is the most important skill", "A small act of kindness can change someone's day", "Moving houses is very hard"],
      correctIndex: 2,
    },
  ]);

  console.log("Scenes and quiz questions seeded!");
  console.log("Done! Database seeded successfully.");
  process.exit(0);
}

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
