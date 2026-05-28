// Career Track
const CAREER_CURRICULUM = [

  // ─── MODULE 1: TECHNICAL INTERVIEW PREP ─────────────────────────────────────
  {
    id: "interview-prep",
    title: "Technical Interview Prep",
    icon: "💼",
    color: "#fbbf24",
    trackId: "career",
    lessons: [
      {
        id: "interview-basics",
        title: "How Technical Interviews Actually Work",
        xp: 120,
        language: "javascript",
        analogy: "Think of interviews like a cooking audition",
        theory: [
          { type: "plain", text: "Technical interviews are not about being perfect. They're about showing how you think. Interviewers want to see: can you break down a problem, can you communicate while coding, can you handle not knowing the answer immediately? A chef in an audition doesn't need to make a perfect dish — they need to show their process." },
          { type: "highlight", text: "The 5 steps every interviewer wants to see: 1. Clarify the problem. 2. Plan your approach out loud. 3. Write the solution. 4. Test with examples. 5. Discuss trade-offs." },
          { type: "list", items: ["Behavioral questions — 'Tell me about a time...' Use the STAR format: Situation, Task, Action, Result", "Technical questions — arrays, strings, objects, algorithms", "System design — for senior roles: how would you build X?", "Think out loud — silence is your enemy in an interview", "It's okay to say 'I don't know, but here's how I'd figure it out'", "Ask clarifying questions first — never assume the problem"] },
          { type: "code", label: "INTERVIEW PROCESS", color: "#fbbf24", code: `// Problem: Find the most frequent element in an array\n\n// Step 1: CLARIFY\n// "What if there's a tie? What type of elements? Empty array?"\n\n// Step 2: PLAN OUT LOUD\n// "I'll use a frequency map — one pass to count, one to find max"\n\n// Step 3: CODE\nfunction mostFrequent(arr) {\n  const freq = {};\n  for (const item of arr) freq[item] = (freq[item] || 0) + 1;\n  return Object.entries(freq).reduce((a, b) => b[1] > a[1] ? b : a)[0];\n}\n\n// Step 4: TEST\nconsole.log(mostFrequent(['a', 'b', 'a', 'c', 'a'])); // 'a'\n\n// Step 5: TRADE-OFFS\n// "Time: O(n). Space: O(n). Could sort instead: O(n log n) time, O(1) space"` },
        ],
        hints: [
          "Always ask 'Can I assume the input is always valid?' before starting.",
          "Write a solution that works first, then optimize. Interviewers care about correctness before cleverness.",
          "Practice explaining your code out loud at home — record yourself if needed.",
        ],
        challenges: [
          {
            prompt: "GUIDED: Run this interview problem with the full 5-step process documented in comments.",
            starterCode: `// INTERVIEW PROBLEM: Reverse a string without using .reverse()\n\n// Step 1: CLARIFY (assume: string input, return string)\n// Step 2: PLAN — use two-pointer or spread+reverse or manual loop\n\nfunction reverseString(str) {\n  // Two-pointer approach: swap from outside in\n  const arr = str.split('');\n  let left = 0;\n  let right = arr.length - 1;\n\n  while (left < right) {\n    // Swap\n    [arr[left], arr[right]] = [arr[right], arr[left]];\n    left++;\n    right--;\n  }\n  return arr.join('');\n}\n\n// Step 4: TEST with multiple cases\nconsole.log(reverseString("hello"));    // olleh\nconsole.log(reverseString("Stanley"));  // yelnatS\nconsole.log(reverseString("a"));        // a\nconsole.log(reverseString(""));         // ''\n\n// Step 5: TRADE-OFFS\nconsole.log("Time: O(n) | Space: O(n) for the array copy");`,
            whatItDoes: "Shows the full interview process for a string reversal problem.",
            check: (output) => output.includes('olleh') && output.includes('yelnatS'),
          },
          {
            prompt: "MODIFY IT: Add a second function called isPalindrome(str) that uses reverseString to check if a word reads the same forwards and backwards. Test it with: 'racecar', 'hello', 'level', 'world'.",
            starterCode: `function reverseString(str) {\n  return str.split('').reverse().join('');\n}\n\n// Write isPalindrome here\n// It should return true/false and use reverseString\n\n// Test cases\nconsole.log(isPalindrome('racecar')); // true\nconsole.log(isPalindrome('hello'));   // false\nconsole.log(isPalindrome('level'));   // true\nconsole.log(isPalindrome('world'));   // false`,
            whatItDoes: "Build on an existing solution to solve a follow-up interview question.",
            check: (output) => output.includes('true') && output.includes('false') && output.split('\n').filter(l => l.trim()).length >= 4,
          },
          {
            prompt: "FROM SCRATCH: Solve this interview problem: Given an array of numbers, return the two numbers that add up to a target sum. Example: twoSum([2, 7, 11, 15], 9) → [2, 7]. Use a Set or Map for O(n) time. Include your 5-step process as comments.",
            starterCode: `// Step 1: CLARIFY — add your assumptions as comments\n// Step 2: PLAN — explain your approach\nfunction twoSum(nums, target) {\n  // Step 3: CODE — implement using a Set or Map\n}\n// Step 4: TEST\nconsole.log(JSON.stringify(twoSum([2, 7, 11, 15], 9)));   // [2,7]\nconsole.log(JSON.stringify(twoSum([3, 2, 4], 6)));         // [2,4]\nconsole.log(JSON.stringify(twoSum([3, 3], 6)));             // [3,3]\n// Step 5: Complexity — add a console.log`,
            whatItDoes: "Classic interview problem — solve with the full documented 5-step interview process.",
            check: (output) => {
              return output.includes('[2,7]') || output.includes('2,7') || output.includes('2 7');
            },
          },
        ],
        quiz: [
          { question: "What is the STAR method?", answer: "Situation, Task, Action, Result — a framework for behavioral questions", choices: ["Situation, Task, Action, Result — a framework for behavioral questions", "Speed, Time, Accuracy, Review", "System, Test, Analyze, Run", "Structure, Type, Algorithm, Result"] },
          { question: "What should you do FIRST when given an interview problem?", answer: "Ask clarifying questions to understand the problem fully", choices: ["Ask clarifying questions to understand the problem fully", "Start coding immediately", "State the optimal solution", "Ask for hints"] },
          { question: "Why is thinking out loud important in interviews?", answer: "Interviewers evaluate your reasoning process, not just the final answer", choices: ["Interviewers evaluate your reasoning process, not just the final answer", "It speeds up your coding", "Because they can't read your code", "It's required by most companies"] },
          { question: "What is O(n) time complexity?", answer: "The algorithm's runtime grows linearly with input size", choices: ["The algorithm's runtime grows linearly with input size", "The algorithm always takes n seconds", "The algorithm uses n megabytes of memory", "The algorithm runs n times faster than O(1)"] },
          { question: "What should you do after writing a solution?", answer: "Test it with multiple examples including edge cases", choices: ["Test it with multiple examples including edge cases", "Submit immediately", "Optimize it first", "Ask if it's correct"] },
        ],
      },
    ],
  },

  // ─── MODULE 2: PORTFOLIO & FREELANCING ───────────────────────────────────────
  {
    id: "portfolio-freelance",
    title: "Portfolio & Freelancing",
    icon: "💰",
    color: "#00ff88",
    trackId: "career",
    lessons: [
      {
        id: "portfolio-strategy",
        title: "Building a Portfolio That Gets Clients",
        xp: 150,
        language: "javascript",
        analogy: "Think of your portfolio like a store window",
        theory: [
          { type: "plain", text: "A portfolio is your store window. A bad window shows everything you've ever made in a random pile. A good window shows 3 things that make people want to walk in. You don't need 20 projects — you need 3 that are actually useful and well-presented." },
          { type: "highlight", text: "The 3 projects every dev portfolio needs: 1. A tool that solves a real problem. 2. An app that demonstrates a skill clients pay for. 3. A clone of something recognizable." },
          { type: "list", items: ["Quality over quantity — 3 polished projects beat 10 unfinished ones", "Show the problem you solved, not just what you built", "Live demo link is mandatory — if they can't click it, it doesn't count", "GitHub repo with a good README shows professional habits", "Include the tech stack and your role on each project", "Before/after is powerful for automation projects"] },
          { type: "code", label: "PROJECT CARD TEMPLATE", color: "#00ff88", code: `// Every portfolio project should answer:\n\nconst project = {\n  title: "Price Alert Bot",\n  problem: "My client checked Amazon prices manually every day",\n  solution: "Python bot that monitors prices and sends email when target hit",\n  result: "Saved 30 minutes/day, caught a $40 price drop week 1",\n  stack: ["Python", "BeautifulSoup", "SMTP", "Cron"],\n  demoUrl: "https://github.com/you/price-bot",\n  liveUrl: null, // scripts don't have live URLs — show the README\n  earned: "$300 freelance project"\n};` },
        ],
        hints: [
          "Deploy every project. A link people can click is 10x more powerful than screenshots.",
          "Write a README that explains the project like you're explaining it to a client, not a developer.",
          "If you have no real clients yet, build a project that solves YOUR OWN problem.",
        ],
        challenges: [
          {
            prompt: "GUIDED: Run this portfolio project evaluator that scores project descriptions on key criteria.",
            starterCode: `function scoreProject(project) {\n  let score = 0;\n  const feedback = [];\n\n  if (project.hasDemoLink) { score += 30; feedback.push('✅ Demo link (+30)'); }\n  else feedback.push('❌ No demo link — this is critical (-30)');\n\n  if (project.solvesRealProblem) { score += 25; feedback.push('✅ Solves real problem (+25)'); }\n  else feedback.push('⚠️  No clear problem stated (-10)');\n\n  if (project.hasResult) { score += 20; feedback.push('✅ Shows measurable result (+20)'); }\n  else feedback.push('⚠️  No result/impact stated (-10)');\n\n  if (project.hasGoodREADME) { score += 15; feedback.push('✅ Good README (+15)'); }\n  if (project.hasCleanCode) { score += 10; feedback.push('✅ Clean, commented code (+10)'); }\n\n  return { score, grade: score >= 80 ? 'A' : score >= 60 ? 'B' : 'C', feedback };\n}\n\nconst myProject = {\n  title: "Expense Tracker",\n  hasDemoLink: true,\n  solvesRealProblem: true,\n  hasResult: false,\n  hasGoodREADME: true,\n  hasCleanCode: false\n};\n\nconst result = scoreProject(myProject);\nconsole.log(\`Project: \${myProject.title}\`);\nconsole.log(\`Score: \${result.score}/100 (Grade: \${result.grade})\`);\nresult.feedback.forEach(f => console.log(f));`,
            whatItDoes: "Evaluates a portfolio project against 5 key criteria and gives a score with feedback.",
            check: (output) => output.includes('Score:') && output.includes('✅'),
          },
          {
            prompt: "MODIFY IT: Add a sixth criterion: hasTestimonial (25 points). Update the scoreProject function and test with two projects — one with a testimonial and one without. Compare scores.",
            starterCode: `function scoreProject(project) {\n  let score = 0;\n  const feedback = [];\n  if (project.hasDemoLink) { score += 25; feedback.push('✅ Demo link'); } else feedback.push('❌ No demo link');\n  if (project.solvesRealProblem) { score += 20; feedback.push('✅ Real problem'); }\n  if (project.hasResult) { score += 20; feedback.push('✅ Measurable result'); }\n  if (project.hasGoodREADME) { score += 15; feedback.push('✅ Good README'); }\n  if (project.hasCleanCode) { score += 10; feedback.push('✅ Clean code'); }\n  // Add hasTestimonial criterion here (+25 points)\n  return { score, feedback };\n}\n\nconst projectA = { hasDemoLink: true, solvesRealProblem: true, hasResult: true, hasGoodREADME: false, hasCleanCode: true, hasTestimonial: true };\nconst projectB = { hasDemoLink: true, solvesRealProblem: true, hasResult: false, hasGoodREADME: true, hasCleanCode: true, hasTestimonial: false };\n\n// Compare both and log which is stronger`,
            whatItDoes: "Extend the evaluator with a new criterion and compare two projects.",
            check: (output) => output.includes('testimonial') || output.includes('Testimonial'),
          },
          {
            prompt: "FROM SCRATCH: Write a function generateProjectCard(title, problem, solution, stack, demoUrl) that returns a formatted string suitable for a portfolio README. Include all 5 inputs, format it with emoji section headers, and log it.",
            starterCode: `function generateProjectCard(title, problem, solution, stack, demoUrl) {\n  // Build and return a formatted string with:\n  // 🔧 Project name\n  // ❓ The Problem\n  // ✅ The Solution\n  // 🛠️ Tech Stack\n  // 🔗 Live Demo link\n}\n\nconsole.log(generateProjectCard(\n  "Rent Price Tracker",\n  "Manually checking Zillow every day for price changes",\n  "Python scraper that emails alerts when prices drop below target",\n  ["Python", "BeautifulSoup", "SMTP"],\n  "https://github.com/you/rent-tracker"\n));`,
            whatItDoes: "Build a project card generator that formats portfolio content professionally.",
            check: (output) => output.includes('Problem') && output.includes('Solution') && output.includes('Tech') && output.includes('github'),
          },
        ],
        quiz: [
          { question: "How many portfolio projects do you need to land your first freelance client?", answer: "3 polished, deployed projects", choices: ["3 polished, deployed projects", "10+ projects covering every technology", "20 GitHub repos", "A formal degree or certification"] },
          { question: "What is the most important element of a portfolio project?", answer: "A live demo link that works", choices: ["A live demo link that works", "The complexity of the code", "How many lines of code it has", "Using the newest technologies"] },
          { question: "What should a project README explain?", answer: "The problem, solution, and how to run it — written for a non-developer", choices: ["The problem, solution, and how to run it — written for a non-developer", "Every line of code in detail", "Your academic background", "The git commit history"] },
          { question: "What type of project is most impressive to clients?", answer: "Something that solves a real, specific problem with measurable results", choices: ["Something that solves a real, specific problem with measurable results", "The most complex algorithm possible", "A clone of a popular app", "Whatever uses the most libraries"] },
          { question: "If you don't have real client projects yet, what should you build?", answer: "Projects that solve real problems you or people you know actually have", choices: ["Projects that solve real problems you or people you know actually have", "Tutorials you followed exactly", "Official certification projects", "Copy well-known open source projects exactly"] },
        ],
      },

      {
        id: "freelance-first-client",
        title: "Landing Your First Client",
        xp: 160,
        language: "javascript",
        analogy: "Think of finding clients like fishing — right bait, right pond",
        theory: [
          { type: "plain", text: "Most developers look for clients in the wrong pond. Competing on Upwork for $15/hour with 500 applicants is the wrong pond. The right pond: local businesses who have problems they don't know code can solve. They don't need a senior developer — they need someone who speaks their language and delivers results." },
          { type: "highlight", text: "Your first client isn't found — they're chosen. Pick ONE type of business (restaurant, gym, law office). Learn their #1 pain point. Build ONE solution for it. Then approach 20 of them." },
          { type: "list", items: ["Niche down — 'I build websites for restaurants' beats 'I do web dev'", "Price for value, not hours — what is the result worth to them?", "Discovery call first — understand the problem before quoting", "Under-promise, over-deliver — especially for the first client", "Get it in writing — even a simple email confirming scope", "Ask for a testimonial — this is worth $1,000 in future sales"] },
          { type: "code", label: "OUTREACH TEMPLATE", color: "#00ff88", code: `Subject: Question about [BusinessName]'s website\n\nHi [Name],\n\nI'm a developer who specializes in [their industry].\nI noticed [specific observation about their current situation].\n\nI help businesses like yours [specific result, e.g., 'get\nmore walk-in customers by updating their Google presence'].\n\nWould you be open to a 15-minute call this week?\nNo pitch, just want to understand your situation.\n\n[Your name]\n[Your portfolio URL]` },
        ],
        hints: [
          "Send 20 outreach messages before deciding it doesn't work. Most people send 3 and give up.",
          "The most common first project: updating or rebuilding a terrible website for a local business ($500–1,500).",
          "Find clients: Google 'restaurant near me' → pick ones with bad websites → reach out.",
        ],
        challenges: [
          {
            prompt: "GUIDED: Run this client outreach analyzer that scores outreach messages.",
            starterCode: `function analyzeOutreach(message) {\n  const checks = [\n    { name: 'Personalized opener', test: () => !message.includes('Dear Sir/Madam') && !message.toLowerCase().includes('to whom'), points: 20 },\n    { name: 'Specific observation', test: () => message.includes('noticed') || message.includes('saw') || message.includes('checked'), points: 25 },\n    { name: 'Concrete result promised', test: () => message.includes('help') && (message.includes('more') || message.includes('better') || message.includes('faster')), points: 25 },\n    { name: 'Soft call to action', test: () => message.includes('15-minute') || message.includes('quick call') || message.includes('open to'), points: 20 },\n    { name: 'No pricing in first message', test: () => !message.includes('$') && !message.includes('price') && !message.includes('cost'), points: 10 },\n  ];\n\n  let score = 0;\n  checks.forEach(({ name, test, points }) => {\n    const passed = test();\n    if (passed) score += points;\n    console.log(\`\${passed ? '✅' : '❌'} \${name}\${passed ? \` (+\${points})\` : ''}\`);\n  });\n  console.log(\`\\nScore: \${score}/100\`);\n  return score;\n}\n\nconst message = \`Hi Marco, I'm a developer who works with restaurants. I noticed The Olive Garden's website hasn't been updated since 2018 and doesn't show up on mobile well. I help restaurants get more reservations by modernizing their online presence. Would you be open to a 15-minute call this week?\`;\n\nanalyzeOutreach(message);`,
            whatItDoes: "Scores a client outreach message against 5 best-practice criteria.",
            check: (output) => output.includes('Score:') && output.includes('✅'),
          },
          {
            prompt: "MODIFY IT: Write a second outreach message (as a string) that gets a HIGHER score than the example. It should target a different business type (gym, law office, etc.) and pass at least 4 of the 5 checks. Run analyzeOutreach on both and compare.",
            starterCode: `function analyzeOutreach(message) {\n  const checks = [\n    { name: 'Personalized opener', test: () => !message.toLowerCase().includes('dear'), points: 20 },\n    { name: 'Specific observation', test: () => message.includes('noticed') || message.includes('saw'), points: 25 },\n    { name: 'Concrete result', test: () => message.includes('help') && (message.includes('more') || message.includes('better')), points: 25 },\n    { name: 'Soft CTA', test: () => message.includes('15-minute') || message.includes('call'), points: 20 },\n    { name: 'No price in first message', test: () => !message.includes('$'), points: 10 },\n  ];\n  let score = 0;\n  checks.forEach(({ name, test, points }) => { if (test()) score += points; });\n  return score;\n}\n\nconst messageA = "Hi Marco, I noticed your restaurant's website doesn't show up on mobile. I help restaurants get more bookings online. Open to a quick call this week?";\n\n// Write a better messageB for a different business type\nconst messageB = "";\n\nconsole.log('Message A score:', analyzeOutreach(messageA));\nconsole.log('Message B score:', analyzeOutreach(messageB));`,
            whatItDoes: "Write a competing outreach message that scores higher by following best practices.",
            check: (output) => {
              const lines = output.split('\n');
              const scores = lines.filter(l => l.includes('score:'));
              return scores.length >= 2;
            },
          },
          {
            prompt: "FROM SCRATCH: Build a clientResearch function that takes a businessName and businessType and generates a personalized outreach strategy: 1. A list of 3 specific pain points for that business type. 2. One service you'd offer. 3. A personalized subject line. 4. A 3-sentence outreach message.",
            starterCode: `const PAIN_POINTS = {\n  restaurant: ['outdated website', 'no online reservations', 'bad Google reviews response'],\n  gym: ['no member portal', 'class schedule hard to find online', 'no email automation'],\n  lawoffice: ['no client intake form', 'website not mobile-friendly', 'no consultation booking'],\n};\n\nfunction clientResearch(businessName, businessType) {\n  const painPoints = PAIN_POINTS[businessType] || ['website issues', 'automation needs', 'online presence'];\n  // Log pain points, service offer, subject line, and outreach message\n}\n\nclientResearch("Luigi's Bistro", "restaurant");\nclientResearch("Iron Will Gym", "gym");`,
            whatItDoes: "Generate a personalized outreach strategy from business type data.",
            check: (output) => output.includes('pain') || output.includes('Pain') || output.includes('website'),
          },
        ],
        quiz: [
          { question: "Why should you niche down when looking for clients?", answer: "Specialists are trusted more and can charge higher rates", choices: ["Specialists are trusted more and can charge higher rates", "It's easier to learn fewer technologies", "Because generalist jobs don't pay well", "Platforms like Upwork require a niche"] },
          { question: "When should you mention your price in outreach?", answer: "Only after a discovery call where you understand their specific needs", choices: ["Only after a discovery call where you understand their specific needs", "In every first message to filter serious buyers", "Never — let clients name their price first", "Always — it saves time for both parties"] },
          { question: "What is the single most valuable thing to get from your first client?", answer: "A written testimonial you can use in future proposals", choices: ["A written testimonial you can use in future proposals", "As much money as possible", "A referral to 10 other businesses", "Access to their tools and accounts"] },
          { question: "What should a discovery call focus on?", answer: "Understanding the client's problem before proposing any solution", choices: ["Understanding the client's problem before proposing any solution", "Convincing them to hire you immediately", "Explaining all your services", "Showing them your portfolio"] },
          { question: "What's the most effective way to find your first local business client?", answer: "Search Google for businesses in one niche and cold outreach those with obvious problems", choices: ["Search Google for businesses in one niche and cold outreach those with obvious problems", "Post on social media and wait", "Apply to 100 Upwork jobs", "Ask your developer friends for referrals"] },
        ],
      },
    ],
  },

  // ─── MODULE 3: AI AS A CODING PARTNER ────────────────────────────────────────
  {
    id: "ai-coding-partner",
    title: "Using AI as Your Coding Partner",
    icon: "🤝",
    color: "#61dafb",
    trackId: "career",
    lessons: [
      {
        id: "ai-productivity",
        title: "10x Your Speed with AI Tools",
        xp: 140,
        language: "javascript",
        analogy: "Think of AI like a very fast junior developer you can direct",
        theory: [
          { type: "plain", text: "The developers making the most money right now aren't necessarily the best coders — they're the best at using AI tools to move faster than everyone else. AI won't replace you. But a developer who uses AI will replace a developer who doesn't." },
          { type: "highlight", text: "Use AI for: boilerplate code, debugging error messages, writing tests, explaining unfamiliar code, generating ideas for architecture. Keep AI away from: security decisions, architecture you don't understand, code you can't read back." },
          { type: "list", items: ["Prompt for code: 'Write a Python function that...' — be specific about inputs/outputs", "Debug with AI: paste the error + your code and ask 'What's wrong?'", "Code review: 'Review this function for edge cases and performance issues'", "Learn with AI: 'Explain this code line by line in plain English'", "Generate tests: 'Write 5 unit tests for this function covering edge cases'", "Never blindly copy AI code — always read and understand what it does"] },
          { type: "code", label: "AI CODING PROMPTS", color: "#61dafb", code: `// Getting code:\n"Write a JavaScript function called formatCurrency(amount, currency)\nthat takes a number and currency code (USD, EUR, GBP) and returns\na formatted string like '$1,234.56'. Handle negative numbers.\nInclude JSDoc comments."\n\n// Debugging:\n"I'm getting: TypeError: Cannot read properties of undefined (reading 'map')\nHere's my React component: [paste code]\nWhat's causing this and how do I fix it?"\n\n// Understanding:\n"Explain this code to me like I'm a beginner:\n[paste code]\nFocus on what problem it solves and why each part exists."` },
        ],
        hints: [
          "The better your prompt, the better the code. Be specific about edge cases, types, and expected output.",
          "Always test AI-generated code. AI is confident but not always correct.",
          "Use AI to learn faster: ask it to explain code you don't understand, then rewrite it yourself.",
        ],
        challenges: [
          {
            prompt: "GUIDED: Run these AI productivity metrics showing how much time each task saves.",
            starterCode: `const aiTasks = [\n  { task: "Write boilerplate Express server", manual: 25, withAI: 2, unit: 'min' },\n  { task: "Debug a TypeError", manual: 30, withAI: 3, unit: 'min' },\n  { task: "Write 10 unit tests", manual: 60, withAI: 5, unit: 'min' },\n  { task: "Understand unfamiliar codebase", manual: 120, withAI: 15, unit: 'min' },\n  { task: "Write a README", manual: 45, withAI: 3, unit: 'min' },\n  { task: "Convert Python to JavaScript", manual: 60, withAI: 4, unit: 'min' },\n];\n\nlet totalManual = 0;\nlet totalAI = 0;\n\nconsole.log('=== AI PRODUCTIVITY IMPACT ===\\n');\naiTasks.forEach(({ task, manual, withAI }) => {\n  const speedup = Math.round(manual / withAI) + 'x faster';\n  console.log(\`\${task}\`);\n  console.log(\`  Without AI: \${manual} min | With AI: \${withAI} min | \${speedup}\`);\n  totalManual += manual;\n  totalAI += withAI;\n});\n\nconsole.log(\`\\nTotal: \${totalManual} min → \${totalAI} min with AI\`);\nconsole.log(\`That's \${Math.round(totalManual / 60)} hours saved per day on repeat tasks.\`);`,
            whatItDoes: "Shows real productivity gains from using AI across common dev tasks.",
            check: (output) => output.includes('faster') && output.includes('Total:'),
          },
          {
            prompt: "MODIFY IT: Add a calculateDailyEarnings function. A developer charges $75/hour. With the time saved by AI, calculate how many more client hours they can bill per day. Log: 'Extra billable hours per day: X' and 'Extra monthly income: $Y'.",
            starterCode: `const totalManualMinutes = 340;\nconst totalAIMinutes = 32;\nconst hourlyRate = 75;\n\n// Calculate minutes saved\nconst minutesSaved = totalManualMinutes - totalAIMinutes;\n\n// Write calculateDailyEarnings function here\n// Input: minutesSaved, hourlyRate\n// Log: extra hours, extra daily income, extra monthly income (20 working days)\n\ncalculateDailyEarnings(minutesSaved, hourlyRate);`,
            whatItDoes: "Calculate the dollar value of AI productivity gains for a freelancer.",
            check: (output) => output.includes('$') && (output.includes('monthly') || output.includes('daily')),
          },
          {
            prompt: "FROM SCRATCH: Build an AI prompt generator for developers. The function generateDevPrompt(taskType, language, details) should return a well-structured AI prompt. Task types: 'write', 'debug', 'review', 'explain'. Test all 4 types.",
            starterCode: `function generateDevPrompt(taskType, language, details) {\n  const templates = {\n    write: (lang, d) => \`Write a \${lang} function that \${d}. Include: input/output types, edge case handling, JSDoc comments.\`,\n    debug: (lang, d) => \`I have a \${lang} bug: \${d}. Explain what's wrong and give a corrected version.\`,\n    review: (lang, d) => \`Review this \${lang} code for issues:\\n\${d}\\nCheck: edge cases, performance, security, naming.\`,\n    explain: (lang, d) => \`Explain this \${lang} code line by line in plain English:\\n\${d}\`,\n  };\n  // Return the formatted prompt\n}\n\nconsole.log(generateDevPrompt('write', 'JavaScript', 'formats a price with currency symbol'));\nconsole.log(generateDevPrompt('debug', 'Python', 'TypeError: list object is not subscriptable'));\nconsole.log(generateDevPrompt('review', 'JavaScript', 'function getData() { return fetch(url) }'));\nconsole.log(generateDevPrompt('explain', 'Python', 'x = [i**2 for i in range(10) if i % 2 == 0]'));`,
            whatItDoes: "Build a prompt template generator for the most common AI-assisted dev tasks.",
            check: (output) => {
              const lines = output.split('\n').filter(l => l.trim().length > 10);
              return lines.length >= 4 && output.includes('JavaScript') && output.includes('Python');
            },
          },
        ],
        quiz: [
          { question: "What is the right way to use AI-generated code?", answer: "Read it, understand it, test it — then use it if it's correct", choices: ["Read it, understand it, test it — then use it if it's correct", "Copy and paste it directly into production", "Only use it for tutorial projects", "Never — write all code yourself"] },
          { question: "Which task is AI LEAST suitable for?", answer: "Making architecture decisions you don't understand", choices: ["Making architecture decisions you don't understand", "Writing boilerplate code", "Explaining unfamiliar code", "Suggesting variable names"] },
          { question: "What makes an AI coding prompt effective?", answer: "Specificity about inputs, outputs, edge cases, and format", choices: ["Specificity about inputs, outputs, edge cases, and format", "Using technical jargon", "Being as short as possible", "Asking for multiple things at once"] },
          { question: "Why should you NOT blindly copy AI code?", answer: "AI can be confidently wrong — you need to verify correctness", choices: ["AI can be confidently wrong — you need to verify correctness", "It's slower to paste than type", "Copy-paste is considered cheating", "AI code always has bugs"] },
          { question: "How does AI change the value of a developer's time?", answer: "It multiplies output — same developer can do more billable work in less time", choices: ["It multiplies output — same developer can do more billable work in less time", "It reduces rates because AI is free", "It makes developers less valuable", "It only helps senior developers"] },
        ],
      },
    ],
  },
];

export default CAREER_CURRICULUM;
