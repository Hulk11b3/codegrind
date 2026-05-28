// AI & Modern Dev Track
const AI_DEV_CURRICULUM = [

  // ─── MODULE 1: PROMPT ENGINEERING ───────────────────────────────────────────
  {
    id: "prompt-engineering",
    title: "Prompt Engineering",
    icon: "🧠",
    color: "#a78bfa",
    trackId: "ai",
    lessons: [
      {
        id: "prompting-basics",
        title: "The Art of Talking to AI",
        xp: 120,
        language: "javascript",
        analogy: "Think of prompting like giving directions",
        theory: [
          { type: "plain", text: "A prompt is the instruction you give an AI model. The difference between a bad prompt and a great prompt can be the difference between garbage output and exactly what you need. AI models are incredibly capable — but you have to tell them exactly what you want." },
          { type: "highlight", text: "Bad prompt: 'Write an email.' Great prompt: 'Write a 3-sentence follow-up email from a freelance developer to a client who went silent after a proposal. Tone: professional but warm. End with a soft call to action.'" },
          { type: "list", items: ["Role — tell it who to be: 'You are a senior Python developer...'", "Context — give background: 'My client is a small restaurant...'", "Task — be specific about what you want", "Format — specify output: 'Return as a bullet list', 'Use markdown headers'", "Constraints — set limits: 'Keep under 100 words', 'No jargon'", "Examples — show what good output looks like (few-shot prompting)"] },
          { type: "code", label: "PROMPT TEMPLATE", color: "#a78bfa", code: `You are [ROLE].\n\nContext: [BACKGROUND INFORMATION]\n\nTask: [WHAT YOU WANT IT TO DO]\n\nFormat: [HOW TO STRUCTURE THE OUTPUT]\n\nConstraints: [RULES AND LIMITS]\n\nExample of good output:\n[EXAMPLE]` },
        ],
        hints: [
          "Be specific about the output format — list, paragraph, JSON, code, table.",
          "Assign a role to get better results: 'You are an expert copywriter...'",
          "Chain prompts for complex tasks — break big asks into steps.",
        ],
        challenges: [
          {
            prompt: "GUIDED: Run these prompt comparison examples and see how specificity changes the quality of AI instructions.",
            starterCode: `const prompts = [\n  {\n    label: "VAGUE (bad)",\n    prompt: "Write something about Python.",\n    problem: "Too broad — AI doesn't know length, style, audience, or purpose."\n  },\n  {\n    label: "SPECIFIC (good)",\n    prompt: "You are a coding tutor for beginners. Write a 3-sentence explanation of Python variables using a real-world analogy. Avoid technical jargon. End with one example using a person's age.",\n    problem: "Role, length, analogy requirement, jargon constraint, specific example type — all specified."\n  },\n  {\n    label: "STRUCTURED (best)",\n    prompt: "Role: Python tutor for first-time coders.\\nTask: Explain what a variable is.\\nFormat: 2 sentences + one code example.\\nAudience: Someone who has never coded.\\nTone: Encouraging, conversational.\\nExample: Use storing a person's name.",\n    problem: "Fully structured prompt using role/task/format/audience/tone/example template."\n  }\n];\n\nprompts.forEach(({ label, prompt, problem }) => {\n  console.log(\`\\n[\${label}]\`);\n  console.log("Prompt: " + prompt);\n  console.log("Why it works: " + problem);\n});`,
            whatItDoes: "Shows three levels of prompt quality and explains why specificity matters.",
            check: (output) => output.includes('VAGUE') && output.includes('SPECIFIC') && output.includes('STRUCTURED'),
          },
          {
            prompt: "MODIFY IT: Add a fourth prompt object that uses the full template (Role, Context, Task, Format, Constraints) to ask an AI to write a freelance proposal for a Python automation project. Make it better than the 'STRUCTURED' example.",
            starterCode: `const prompts = [\n  { label: "VAGUE", prompt: "Write a proposal." },\n  { label: "SPECIFIC", prompt: "Write a 3-paragraph freelance proposal for a Python automation project." },\n  // Add your TEMPLATE prompt here (4th item)\n  // Use Role, Context, Task, Format, Constraints fields\n];\n\nprompts.forEach(({ label, prompt }) => {\n  console.log(\`[\${label}]\`);\n  console.log(prompt);\n  console.log('');\n});`,
            whatItDoes: "Write a structured prompt using the full template pattern.",
            check: (output) => {
              const lines = output.split('\n').filter(l => l.trim());
              return lines.length >= 8 && (output.includes('Role:') || output.includes('Context:') || output.includes('Task:'));
            },
          },
          {
            prompt: "FROM SCRATCH: Write a function called buildPrompt(role, context, task, format, constraints) that assembles a structured prompt string from its parts, then call it to build a prompt for: an AI email writer, for a freelance web developer, to write a project follow-up email, in 3 sentences, with a professional tone.",
            starterCode: `function buildPrompt(role, context, task, format, constraints) {\n  // Build and return a formatted prompt string\n  // Include all 5 parts with labels\n}\n\nconst prompt = buildPrompt(\n  "professional email writer",\n  "freelance web developer following up after a proposal",\n  "write a follow-up email to a silent client",\n  "3 sentences, subject line included",\n  "professional tone, no desperation, soft call to action"\n);\n\nconsole.log(prompt);`,
            whatItDoes: "Build a prompt template function that assembles structured AI prompts.",
            check: (output) => output.includes('role') && output.includes('task') && output.includes('format') && output.split('\n').length >= 5,
          },
        ],
        quiz: [
          { question: "What makes a prompt 'specific'?", answer: "It defines role, task, format, constraints, and examples", choices: ["It defines role, task, format, constraints, and examples", "It uses technical jargon", "It is very long", "It includes the word 'please'"] },
          { question: "What is 'few-shot prompting'?", answer: "Giving the AI examples of the output you want", choices: ["Giving the AI examples of the output you want", "Making very short prompts", "Limiting responses to a few words", "Prompting the AI multiple times quickly"] },
          { question: "Why assign a role in your prompt?", answer: "It activates the relevant knowledge and tone in the model", choices: ["It activates the relevant knowledge and tone in the model", "Because AI needs to know your job title", "To bypass safety filters", "Because shorter prompts are better"] },
          { question: "Which prompt is better for getting a JSON response?", answer: "Return the data as JSON with keys: name, email, score", choices: ["Return the data as JSON with keys: name, email, score", "Give me the data", "Make it JSON please", "Output format: standard"] },
          { question: "What is prompt chaining?", answer: "Breaking a complex task into multiple sequential prompts", choices: ["Breaking a complex task into multiple sequential prompts", "Combining two AI models", "Making one very long prompt", "Linking prompts with hyperlinks"] },
        ],
      },

      {
        id: "ai-api-basics",
        title: "Using Claude & OpenAI APIs",
        xp: 180,
        language: "javascript",
        analogy: "Think of the API like a phone call to the AI",
        theory: [
          { type: "plain", text: "Every AI chat app, coding assistant, and AI-powered tool ultimately makes an API call — it sends your message to a server, the AI processes it, and you get a response back. You can do this from your own code. That's what makes you more powerful than someone who just uses the chat interface." },
          { type: "code", label: "JAVASCRIPT", color: "#a78bfa", code: `// Calling the Anthropic Claude API\nasync function askClaude(userMessage) {\n  const response = await fetch('https://api.anthropic.com/v1/messages', {\n    method: 'POST',\n    headers: {\n      'Content-Type': 'application/json',\n      'x-api-key': process.env.ANTHROPIC_API_KEY,\n      'anthropic-version': '2023-06-01'\n    },\n    body: JSON.stringify({\n      model: 'claude-haiku-4-5-20251001',\n      max_tokens: 1024,\n      system: 'You are a helpful coding assistant.',\n      messages: [{ role: 'user', content: userMessage }]\n    })\n  });\n  const data = await response.json();\n  return data.content[0].text;\n}` },
          { type: "highlight", text: "Never put API keys directly in frontend code. Use a server-side proxy (like a Vercel API route) so the key stays private on the server." },
          { type: "list", items: ["model — which AI to use (haiku=fast/cheap, sonnet=balanced, opus=best)", "max_tokens — cap the response length", "system — the AI's persona and rules", "messages — the conversation history as [{role, content}]", "temperature — 0 = precise/deterministic, 1 = creative/varied", "Always handle errors — API can fail, key can expire, rate limits exist"] },
        ],
        hints: [
          "Keep a conversation history as an array and append each message/response to maintain context.",
          "Use haiku model for fast, cheap tasks. Sonnet for balanced quality. Opus for complex reasoning.",
          "Rate limits are per API key. Add retry logic with exponential backoff for production apps.",
        ],
        challenges: [
          {
            prompt: "GUIDED: Run this simulation of an Anthropic API call flow — see how the request is built and response is parsed.",
            starterCode: `// Simulate an API call without network (for this sandbox)\nfunction simulateClaudeCall(userMessage) {\n  const request = {\n    model: 'claude-haiku-4-5-20251001',\n    max_tokens: 1024,\n    system: 'You are a helpful coding tutor. Answer in plain English.',\n    messages: [{ role: 'user', content: userMessage }]\n  };\n\n  console.log('REQUEST:');\n  console.log(JSON.stringify(request, null, 2));\n\n  // Simulated response\n  const response = {\n    id: 'msg_01XA...',\n    type: 'message',\n    role: 'assistant',\n    content: [{ type: 'text', text: 'Variables are like labeled boxes. Each box has a name and holds a value. In Python: name = "Stanley" creates a box called name holding the string Stanley.' }],\n    model: 'claude-haiku-4-5-20251001',\n    usage: { input_tokens: 42, output_tokens: 38 }\n  };\n\n  console.log('\\nRESPONSE:');\n  console.log('Text:', response.content[0].text);\n  console.log('Tokens used:', response.usage.input_tokens + response.usage.output_tokens);\n  return response.content[0].text;\n}\n\nconst reply = simulateClaudeCall("What is a variable?");\nconsole.log('\\nExtracted text:', reply.substring(0, 50) + '...');`,
            whatItDoes: "Shows the exact shape of an Anthropic API request and response, and how to extract the text.",
            check: (output) => output.includes('REQUEST') && output.includes('RESPONSE') && output.includes('content'),
          },
          {
            prompt: "MODIFY IT: Add a second function called buildConversation that tracks multiple messages as an array. Each call pushes the user message and a simulated assistant response to the history. Call it 3 times and log the full conversation history.",
            starterCode: `const conversationHistory = [];\n\nfunction buildConversation(userMessage) {\n  // Push user message to history\n  // Simulate assistant response based on message\n  // Push assistant response to history\n  // Return the response text\n}\n\n// Call 3 times\nbuildConversation("What is a variable?");\nbuildConversation("Give me an example in Python.");\nbuildConversation("How is it different from a constant?");\n\nconsole.log('Full conversation:');\nconsole.log(JSON.stringify(conversationHistory, null, 2));`,
            whatItDoes: "Build a conversation history array that stores alternating user/assistant messages.",
            check: (output) => {
              const parsed = output.includes('"role"') && output.includes('"user"') && output.includes('"assistant"');
              return parsed;
            },
          },
          {
            prompt: "FROM SCRATCH: Build a function called aiEmailWriter(clientName, projectType, daysWaiting) that constructs an API request body for Claude to write a follow-up email. Log the full request body as formatted JSON. Include the system prompt, conversation message, and use the haiku model.",
            starterCode: `function aiEmailWriter(clientName, projectType, daysWaiting) {\n  // Build the Anthropic API request body\n  const request = {\n    // model, max_tokens, system, messages\n  };\n  console.log('API Request Body:');\n  console.log(JSON.stringify(request, null, 2));\n  return request;\n}\n\naiEmailWriter('Johnson Design Co.', 'website redesign', 5);`,
            whatItDoes: "Construct a real Anthropic API request body with dynamic content injected via function parameters.",
            check: (output) => output.includes('model') && output.includes('system') && output.includes('messages') && output.includes('Johnson'),
          },
        ],
        quiz: [
          { question: "Why shouldn't you put your API key in frontend JavaScript code?", answer: "Anyone can read the source code and steal it", choices: ["Anyone can read the source code and steal it", "It makes the app slower", "Frontend code doesn't support API keys", "It violates browser rules"] },
          { question: "What does the system parameter do in a Claude API call?", answer: "Sets the AI's persona, rules, and context for the whole conversation", choices: ["Sets the AI's persona, rules, and context for the whole conversation", "Specifies which operating system to use", "Controls the response speed", "Encrypts the conversation"] },
          { question: "What is the messages array in the API request?", answer: "The conversation history as [{role: 'user'/'assistant', content: '...'}]", choices: ["The conversation history as [{role: 'user'/'assistant', content: '...'}]", "A list of model names", "The user's profile data", "A list of API endpoints to call"] },
          { question: "Which Claude model is best for fast, cheap, high-volume tasks?", answer: "claude-haiku", choices: ["claude-haiku", "claude-opus", "claude-sonnet", "All models cost the same"] },
          { question: "How do you access the text response from a Claude API call?", answer: "data.content[0].text", choices: ["data.content[0].text", "data.text", "data.response", "data.message.content"] },
        ],
      },
    ],
  },

  // ─── MODULE 2: BUILDING AI-POWERED APPS ──────────────────────────────────────
  {
    id: "ai-apps",
    title: "Building AI-Powered Apps",
    icon: "🤖",
    color: "#00d4ff",
    trackId: "ai",
    lessons: [
      {
        id: "ai-chatbot",
        title: "Build Your First AI Chatbot",
        xp: 200,
        language: "react",
        analogy: "Think of it like building a walkie-talkie connected to a genius",
        theory: [
          { type: "plain", text: "A chatbot is just a UI on top of an API call. You collect the user's message, send it to Claude or GPT with your system prompt and conversation history, and display the response. The hard part isn't the AI — it's the UX design and managing the conversation state." },
          { type: "code", label: "REACT + AI", color: "#00d4ff", code: `function ChatApp() {\n  const [messages, setMessages] = useState([]);\n  const [input, setInput] = useState('');\n  const [loading, setLoading] = useState(false);\n\n  const sendMessage = async () => {\n    if (!input.trim()) return;\n    const userMsg = { role: 'user', content: input };\n    const newHistory = [...messages, userMsg];\n    setMessages(newHistory);\n    setInput('');\n    setLoading(true);\n\n    // Call your serverless proxy (never call API directly from browser)\n    const res = await fetch('/api/chat', {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify({ messages: newHistory })\n    });\n    const data = await res.json();\n    setMessages([...newHistory, { role: 'assistant', content: data.text }]);\n    setLoading(false);\n  };\n\n  return (\n    <div>\n      {messages.map((m, i) => <div key={i}>{m.role}: {m.content}</div>)}\n      {loading && <div>Thinking...</div>}\n      <input value={input} onChange={e => setInput(e.target.value)} />\n      <button onClick={sendMessage}>Send</button>\n    </div>\n  );\n}` },
          { type: "highlight", text: "Always pass the full messages array to the API — not just the latest message. This is what gives the AI memory of the conversation." },
          { type: "list", items: ["Conversation state = array of {role, content} objects", "Append user message before calling API", "Append AI response after getting it back", "Show loading state while waiting", "Use a serverless proxy — never call AI APIs from the browser directly", "System prompt in every request sets the AI's persona"] },
        ],
        hints: [
          "Each API call should include the full message history, not just the latest message.",
          "The loading state prevents double-sends and shows feedback to the user.",
          "Scroll to the bottom of the messages list after each new message.",
        ],
        challenges: [
          {
            prompt: "GUIDED: Preview this complete chatbot UI with simulated AI responses.",
            starterCode: `const { useState, useRef, useEffect } = React;\n\nconst RESPONSES = [\n  "That's a great question! Let me explain...",\n  "Here's what you need to know: every concept in coding has a real-world equivalent.",\n  "Think of it this way: if you can explain it to a 10-year-old, you truly understand it.",\n  "The key insight is that code is just instructions — and you're the one giving them.",\n  "Practice is everything. The developers making $10k/month all started where you are now."\n];\n\nfunction App() {\n  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Hey! I am your AI coding partner. Ask me anything about code, career, or getting clients.' }]);\n  const [input, setInput] = useState('');\n  const [loading, setLoading] = useState(false);\n  const bottomRef = useRef(null);\n\n  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);\n\n  const send = async () => {\n    if (!input.trim() || loading) return;\n    const userMsg = { role: 'user', content: input };\n    setMessages(m => [...m, userMsg]);\n    setInput('');\n    setLoading(true);\n    await new Promise(r => setTimeout(r, 800));\n    const reply = RESPONSES[Math.floor(Math.random() * RESPONSES.length)];\n    setMessages(m => [...m, { role: 'assistant', content: reply }]);\n    setLoading(false);\n  };\n\n  return (\n    <div style={{ background: '#0d0d0d', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif', maxWidth: '480px', margin: '0 auto' }}>\n      <div style={{ background: '#111', padding: '16px', borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', gap: '10px' }}>\n        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #a78bfa, #00d4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🤖</div>\n        <div>\n          <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>AI Coding Partner</div>\n          <div style={{ color: '#00ff88', fontSize: '11px' }}>● Online</div>\n        </div>\n      </div>\n      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>\n        {messages.map((m, i) => (\n          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>\n            <div style={{ maxWidth: '80%', background: m.role === 'user' ? '#264de4' : '#1a1a2e', color: '#e0e0e0', padding: '10px 14px', borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', fontSize: '13px', lineHeight: '1.6' }}>\n              {m.content}\n            </div>\n          </div>\n        ))}\n        {loading && <div style={{ color: '#a78bfa', fontSize: '12px' }}>Thinking...</div>}\n        <div ref={bottomRef} />\n      </div>\n      <div style={{ padding: '16px', borderTop: '1px solid #222', display: 'flex', gap: '8px' }}>\n        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Ask anything..." style={{ flex: 1, background: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '10px 14px', borderRadius: '8px', outline: 'none', fontSize: '13px' }} />\n        <button onClick={send} disabled={loading} style={{ background: '#a78bfa', color: '#000', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '13px' }}>Send</button>\n      </div>\n    </div>\n  );\n}`,
            whatItDoes: "A polished chatbot UI with message bubbles, loading state, auto-scroll, and Enter key support.",
            check: (code) => code.includes('useState') && code.includes('messages') && code.includes('loading'),
          },
          {
            prompt: "MODIFY IT: Add a 'Clear Chat' button to the header that resets messages to just the initial assistant greeting. Also add a message counter badge showing 'X messages' next to the title.",
            starterCode: `const { useState, useRef, useEffect } = React;\n\nconst INITIAL = [{ role: 'assistant', content: 'Hey! Ask me anything about code.' }];\n\nfunction App() {\n  const [messages, setMessages] = useState(INITIAL);\n  const [input, setInput] = useState('');\n  const bottomRef = useRef(null);\n\n  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);\n\n  const send = () => {\n    if (!input.trim()) return;\n    setMessages(m => [...m, { role: 'user', content: input }, { role: 'assistant', content: 'Great question! Keep learning and you will get there.' }]);\n    setInput('');\n  };\n\n  return (\n    <div style={{ background: '#0d0d0d', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif' }}>\n      <div style={{ background: '#111', padding: '16px', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>\n        <div style={{ color: '#fff', fontWeight: 'bold' }}>AI Partner</div>\n        {/* Add message counter badge and Clear Chat button here */}\n      </div>\n      <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>\n        {messages.map((m, i) => <div key={i} style={{ margin: '8px 0', color: m.role === 'user' ? '#61dafb' : '#e0e0e0', fontSize: '13px' }}><strong>{m.role}:</strong> {m.content}</div>)}\n        <div ref={bottomRef} />\n      </div>\n      <div style={{ padding: '16px', display: 'flex', gap: '8px' }}>\n        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} style={{ flex: 1, background: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '10px', borderRadius: '6px', outline: 'none' }} />\n        <button onClick={send} style={{ background: '#a78bfa', color: '#000', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Send</button>\n      </div>\n    </div>\n  );\n}`,
            whatItDoes: "Add clear functionality and a message counter to the chatbot header.",
            check: (code) => code.includes('INITIAL') && code.includes('Clear') && code.includes('messages.length'),
          },
          {
            prompt: "FROM SCRATCH: Build a specialized chatbot called 'CodeReviewer' that takes code snippets as input. Add a system message at the top that says it only reviews code. Style user messages in yellow and assistant messages in green. Add a title bar.",
            starterCode: `const { useState } = React;\n\nfunction App() {\n  // messages state (start with a greeting about code review)\n  // input state\n\n  // send function that adds user message and a simulated code review response\n\n  return (\n    <div style={{ background: '#0d0d0d', minHeight: '100vh', fontFamily: 'monospace' }}>\n      {/* Title bar: 'Code Reviewer AI' */}\n      {/* Messages list: user in yellow, assistant in green */}\n      {/* Input area */}\n    </div>\n  );\n}`,
            whatItDoes: "Build a themed chatbot variant with custom styling and a specialized persona.",
            check: (code) => code.includes('useState') && code.includes('messages') && (code.includes('#f7df1e') || code.includes('yellow') || code.includes('fbbf24')),
          },
        ],
        quiz: [
          { question: "Why pass the full messages array to the AI, not just the latest message?", answer: "So the AI has context from the entire conversation history", choices: ["So the AI has context from the entire conversation history", "Because the API requires it", "To use more tokens for better quality", "Because React requires arrays"] },
          { question: "Why use a serverless proxy instead of calling the AI API from the browser?", answer: "To keep the API key secret on the server", choices: ["To keep the API key secret on the server", "Because browsers can't make HTTP requests", "To make responses faster", "Because AI APIs don't support CORS"] },
          { question: "What's the purpose of the loading state in a chatbot?", answer: "To prevent double-sends and show feedback while waiting", choices: ["To prevent double-sends and show feedback while waiting", "To save the conversation", "To encrypt the message", "To count tokens"] },
          { question: "What data structure stores the conversation history?", answer: "An array of {role, content} objects", choices: ["An array of {role, content} objects", "A single string", "A database table", "A Map object"] },
          { question: "What React hook is essential for a chatbot to auto-scroll?", answer: "useRef (to reference the bottom element and scroll to it)", choices: ["useRef (to reference the bottom element and scroll to it)", "useState", "useContext", "useMemo"] },
        ],
      },
    ],
  },

  // ─── MODULE 3: AI AUTOMATION ─────────────────────────────────────────────────
  {
    id: "ai-automation",
    title: "AI Agents & Automation",
    icon: "⚙️",
    color: "#00ff88",
    trackId: "ai",
    lessons: [
      {
        id: "ai-agents-intro",
        title: "AI Agents: Code That Thinks and Acts",
        xp: 180,
        language: "javascript",
        analogy: "Think of an agent like an employee with a to-do list and tools",
        theory: [
          { type: "plain", text: "An AI agent is a program that uses an AI model to make decisions and take actions. Instead of just answering questions, it can call functions, browse the web, read files, and run code to complete multi-step tasks. It's the difference between a calculator and an assistant." },
          { type: "code", label: "JAVASCRIPT", color: "#00ff88", code: `// A simple AI agent pattern\nasync function runAgent(task) {\n  const tools = {\n    search: (query) => \`Search results for: \${query}\`,\n    calculate: (expr) => eval(expr),  // safe in controlled env\n    sendEmail: (to, body) => \`Email sent to \${to}\`,\n  };\n\n  // Step 1: AI decides what to do\n  const plan = await askAI(\`\n    Task: \${task}\n    Available tools: search, calculate, sendEmail\n    What steps should I take? Respond as JSON array.\n  \`);\n\n  // Step 2: Execute each step\n  const steps = JSON.parse(plan);\n  for (const step of steps) {\n    const result = tools[step.tool](step.input);\n    console.log(\`\${step.tool}(\${step.input}) → \${result}\`);\n  }\n}` },
          { type: "highlight", text: "The agent loop: AI decides what tool to use → execute the tool → feed result back to AI → AI decides next step → repeat until done." },
          { type: "list", items: ["Tools — functions the AI can call (search, read file, send email)", "Planning — AI breaks down the task into steps", "Execution — your code runs the tool", "Feedback — result goes back to AI for next decision", "Stopping — AI signals when the task is complete", "Safety — always validate tool inputs, never run arbitrary code"] },
        ],
        hints: [
          "Start with simple, well-defined tools. Don't give an agent access to delete files or send emails without confirmation.",
          "Always parse AI output carefully — use JSON.parse() inside try/catch.",
          "Good agents have a max step count to prevent infinite loops.",
        ],
        challenges: [
          {
            prompt: "GUIDED: Run this agent simulation that breaks a task into steps and executes them.",
            starterCode: `// Simulated agent — no real AI needed\nfunction createAgent(tools) {\n  return async function runTask(task) {\n    console.log(\`🤖 Agent starting task: "\${task}"\\n\`);\n    \n    // Simulate AI planning the steps\n    const plan = [\n      { tool: 'search', input: 'current JavaScript salary trends', step: 1 },\n      { tool: 'filter', input: 'remote positions only', step: 2 },\n      { tool: 'format', input: 'top 3 results as bullet list', step: 3 },\n      { tool: 'report', input: 'summarize findings', step: 4 },\n    ];\n\n    let context = '';\n    for (const step of plan) {\n      if (!tools[step.tool]) {\n        console.log(\`❌ Unknown tool: \${step.tool}\`);\n        continue;\n      }\n      const result = tools[step.tool](step.input, context);\n      context += result + ' ';\n      console.log(\`Step \${step.step}: \${step.tool}(\${step.input})\`);\n      console.log(\`  → \${result}\\n\`);\n    }\n    console.log('✅ Task complete!');\n  };\n}\n\nconst myAgent = createAgent({\n  search: (q) => \`Found 50 results for "\${q}"\`,\n  filter: (f) => \`Filtered to 12 results: \${f}\`,\n  format: (f) => \`Formatted as requested: \${f}\`,\n  report: (r) => \`Report generated with key findings\`,\n});\n\nmyAgent('Research JavaScript developer salaries');`,
            whatItDoes: "An agent with tools that executes a multi-step task plan sequentially.",
            check: (output) => output.includes('Step') && output.includes('Task complete'),
          },
          {
            prompt: "MODIFY IT: Add a 'calculate' tool to the agent that uses eval() to compute a math expression. Add a step to the plan that calculates the average salary: calculate('(120000 + 95000 + 145000) / 3'). Log the result.",
            starterCode: `function createAgent(tools) {\n  return async function runTask(task) {\n    const plan = [\n      { tool: 'search', input: 'JavaScript salaries 2025', step: 1 },\n      // Add calculate step here\n      { tool: 'report', input: 'final summary', step: 3 },\n    ];\n    for (const { tool, input, step } of plan) {\n      const result = tools[tool] ? tools[tool](input) : 'unknown tool';\n      console.log(\`Step \${step}: \${tool}(\${input})\`);\n      console.log(\`  → \${result}\`);\n    }\n  };\n}\n\nconst agent = createAgent({\n  search: (q) => \`Results for: \${q}\`,\n  // Add calculate tool here\n  report: (r) => \`Summary: \${r}\`,\n});\n\nagent('Research JS salaries');`,
            whatItDoes: "Add a tool and corresponding step to extend the agent's capabilities.",
            check: (output) => output.includes('calculate') && (output.includes('120000') || output.includes('avg')),
          },
          {
            prompt: "FROM SCRATCH: Build a content automation agent with tools: summarize(text), extractKeywords(text), generateHashtags(keywords). The agent takes a blog post text and produces: a 1-sentence summary, 5 keywords, and 5 hashtags. Log each step.",
            starterCode: `// Define your tools\nconst tools = {\n  summarize: (text) => { /* return first sentence + 'Summary.' */ },\n  extractKeywords: (text) => { /* return 5 keywords from the text */ },\n  generateHashtags: (keywords) => { /* return keywords prefixed with # */ },\n};\n\n// Build the agent\nfunction runContentAgent(blogPost) {\n  // Run all 3 tools in sequence, log each step\n}\n\nconst blogPost = "JavaScript has become the most popular programming language. Developers use it for web apps, mobile apps, and even AI applications. Learning JavaScript is one of the best career investments you can make in 2025.";\n\nrunContentAgent(blogPost);`,
            whatItDoes: "Build a real-world content marketing agent that processes text through a pipeline of tools.",
            check: (output) => output.includes('#') && output.split('\n').length >= 5,
          },
        ],
        quiz: [
          { question: "What makes something an 'AI agent' vs a regular AI chatbot?", answer: "An agent can take actions and use tools to complete multi-step tasks", choices: ["An agent can take actions and use tools to complete multi-step tasks", "An agent runs on different hardware", "An agent uses more tokens", "An agent has a user interface"] },
          { question: "What is the agent loop?", answer: "Decide → Execute tool → Feed result back → Decide next step", choices: ["Decide → Execute tool → Feed result back → Decide next step", "Prompt → Response → Done", "Fetch → Parse → Render", "Build → Test → Deploy"] },
          { question: "Why should you validate agent tool inputs?", answer: "To prevent the AI from calling tools with dangerous inputs", choices: ["To prevent the AI from calling tools with dangerous inputs", "Because JavaScript requires it", "To speed up execution", "To log the inputs for billing"] },
          { question: "Why give agents a max step count?", answer: "To prevent infinite loops if the AI can't solve the task", choices: ["To prevent infinite loops if the AI can't solve the task", "To limit API costs exactly", "Because agents always stop at step 10", "To keep the agent focused"] },
          { question: "What's the best first step when building an agent?", answer: "Start with simple, well-defined tools with clear inputs and outputs", choices: ["Start with simple, well-defined tools with clear inputs and outputs", "Give it access to the entire internet", "Use the most powerful AI model available", "Build the UI first"] },
        ],
      },
    ],
  },
];

export default AI_DEV_CURRICULUM;
