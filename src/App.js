import { useState, useEffect, useRef } from "react";

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY;

async function supabaseQuery(method, path, body) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Prefer": method === "POST" ? "resolution=merge-duplicates" : "",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.ok && method === "GET") return await res.json();
    return res.ok;
  } catch { return null; }
}

async function saveProgress(xp, completed, strikes, bookmarks, streak, email) {
  try {
    localStorage.setItem("cg_xp", String(xp));
    localStorage.setItem("cg_completed", JSON.stringify([...completed]));
    localStorage.setItem("cg_strikes", JSON.stringify(Object.fromEntries(strikes)));
    localStorage.setItem("cg_bookmarks", JSON.stringify([...bookmarks]));
    localStorage.setItem("cg_streak", JSON.stringify(streak));
  } catch {}
  if (email) {
    try {
      await supabaseQuery("POST", "/user_progress", {
        email, xp, completed_lessons: [...completed],
        strikes: Object.fromEntries(strikes), bookmarks: [...bookmarks],
        streak_count: streak.count, streak_last_date: streak.lastDate,
      });
    } catch {}
  }
}

async function loadProgress() {
  try {
    return {
      xp: parseInt(localStorage.getItem("cg_xp")) || 0,
      completed: new Set(JSON.parse(localStorage.getItem("cg_completed") || "[]")),
      strikes: new Map(Object.entries(JSON.parse(localStorage.getItem("cg_strikes") || "{}"))),
      bookmarks: new Set(JSON.parse(localStorage.getItem("cg_bookmarks") || "[]")),
      streak: JSON.parse(localStorage.getItem("cg_streak") || '{"count":0,"lastDate":null}'),
    };
  } catch { return { xp: 0, completed: new Set(), strikes: new Map(), bookmarks: new Set(), streak: { count: 0, lastDate: null } }; }
}

async function loadProgressFromCloud(email) {
  try {
    const data = await supabaseQuery("GET", `/user_progress?email=eq.${encodeURIComponent(email)}&limit=1`);
    if (data && data.length > 0) {
      const row = data[0];
      return {
        xp: row.xp || 0,
        completed: new Set(row.completed_lessons || []),
        strikes: new Map(Object.entries(row.strikes || {})),
        bookmarks: new Set(row.bookmarks || []),
        streak: { count: row.streak_count || 0, lastDate: row.streak_last_date || null },
      };
    }
  } catch {}
  return null;
}

async function sendWelcomeEmail(email, name) {
  try {
    await fetch(`${process.env.REACT_APP_SUPABASE_URL}/functions/v1/send-welcome`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.REACT_APP_SUPABASE_KEY}` },
      body: JSON.stringify({ email, name }),
    });
  } catch {}
}

// ─── CURRICULUM ───────────────────────────────────────────────────────────────
const CURRICULUM = [
  {
    id: "start", title: "Starting From Zero", icon: "🌱", color: "#00ff88",
    lessons: [
      {
        id: "what-is-code", title: "What Even IS Code?", xp: 100, analogy: "Think of a recipe",
        theory: [
          { type: "plain", text: "You know how a recipe is just a list of step-by-step instructions? The cook reads those steps and follows them in order." },
          { type: "plain", text: "Code is the exact same thing — except instead of a cook, a COMPUTER follows the steps. You write the instructions. The computer does the work." },
          { type: "highlight", text: "Code = instructions for a computer." },
          { type: "list", items: ["🐍 Python — reads almost like plain English. Great for automation, bots, AI tools, and data work.", "🌐 JavaScript — the language of every website you have ever visited."] },
        ],
        hints: ["The word print tells Python to display something.", "Whatever is inside the quotes gets displayed.", "Try changing the message inside the quotes."],
        challenges: [
          {
            prompt: "GUIDED: Run your first program. Click RUN and see what happens.",
            starterCode: `# This is Python code\n# The # symbol means comment\n\nprint("Hello, I am learning to code")`,
            whatItDoes: "print() tells Python to display whatever is inside the parentheses.",
            check: (output) => output.includes("Hello"),
          },
          {
            prompt: "MODIFY IT: Change the message inside the quotes to say something personal. Then run it.",
            starterCode: `# Change the message to something personal\nprint("Hello, I am learning to code")`,
            whatItDoes: "Change the words inside the quotes to anything you want.",
            check: (output) => output.trim().length > 0 && !output.includes("Hello, I am learning to code"),
          },
          {
            prompt: "FROM SCRATCH: Write two print statements. Print your name on one line and your goal on the next.",
            starterCode: `# Write two print statements below\n`,
            whatItDoes: "You write the code this time. Use print() twice.",
            check: (output) => output.split("\n").filter(l => l.trim().length > 0).length >= 2,
          },
        ],
        quiz: [
          { question: "What does the print() function do in Python?", answer: "Displays text on the screen", choices: ["Displays text on the screen", "Saves a file", "Creates a variable", "Runs a loop"] },
          { question: "What symbol is used for comments in Python?", answer: "#", choices: ["#", "//", "/*", "--"] },
          { question: "Complete the code to display Hello:", answer: "print", choices: ["print", "display", "show", "output"] },
          { question: "Code is instructions for a _____", answer: "computer", choices: ["computer", "human", "robot", "printer"] },
          { question: "Changing the text inside quotes changes the _____", answer: "output", choices: ["output", "variable", "function", "comment"] },
        ],
      },
      {
        id: "variables", title: "Variables — The Computer's Memory", xp: 150, analogy: "Think of a labeled jar",
        theory: [
          { type: "plain", text: "Imagine you have a jar on your kitchen counter. You put sugar in it and write SUGAR on the label. Now whenever you need sugar, you grab the jar labeled SUGAR." },
          { type: "highlight", text: "A variable is that labeled jar. It stores information and gives it a name you can use later." },
          { type: "code", label: "PYTHON", color: "#7dd3fc", code: `name = "Marcus"\nage = 32\nmoney_goal = 50000\n\nprint(name)\nprint(age)\nprint(money_goal)` },
        ],
        hints: ["A variable is just a name = value.", "Text needs quotes. Numbers do not.", "Use print(variable_name) to display each one."],
        challenges: [
          {
            prompt: "GUIDED: Run this code and see how variables work.",
            starterCode: `name = "Marcus"\nage = 32\nmoney_goal = 50000\n\nprint(name)\nprint(age)\nprint(money_goal)`,
            whatItDoes: "Creates 3 labeled jars and displays what is inside each one.",
            check: (output) => output.split("\n").filter(Boolean).length >= 3,
          },
          {
            prompt: "MODIFY IT: Change name, age, and money_goal to your own values. Run it.",
            starterCode: `name = "Marcus"\nage = 32\nmoney_goal = 50000\n\nprint(name)\nprint(age)\nprint(money_goal)`,
            whatItDoes: "Replace Marcus with your name, 32 with your age, 50000 with your income goal.",
            check: (output) => output.split("\n").filter(Boolean).length >= 3 && !output.includes("Marcus"),
          },
          {
            prompt: "FROM SCRATCH: Create 3 variables — your city, your skill, and your hourly rate. Print all three.",
            starterCode: `# Create 3 variables below and print them\n`,
            whatItDoes: "Write the variables yourself. Text needs quotes. Numbers do not.",
            check: (output) => output.split("\n").filter(Boolean).length >= 3,
          },
        ],
        quiz: [
          { question: "What is a variable in Python?", answer: "A labeled container that stores information", choices: ["A labeled container that stores information", "A type of loop", "A math equation", "A print statement"] },
          { question: "Which correctly creates a variable?", answer: "name = \"Stanley\"", choices: ["name = \"Stanley\"", "name == \"Stanley\"", "\"Stanley\" = name", "variable name = \"Stanley\""] },
          { question: "Text values in Python need _____", answer: "quotes around them", choices: ["quotes around them", "parentheses", "brackets", "nothing special"] },
          { question: "How do you display a variable called city?", answer: "print(city)", choices: ["print(city)", "display city", "show(city)", "city.print()"] },
          { question: "Which stores a number correctly?", answer: "age = 30", choices: ["age = 30", "age = \"30\"", "age == 30", "30 = age"] },
        ],
      },
      {
        id: "numbers-vs-text", title: "Numbers vs. Words", xp: 150, analogy: "Think of a calculator vs. a notepad",
        theory: [
          { type: "plain", text: "Computers treat numbers and words differently. A CALCULATOR works with numbers. A NOTEPAD stores text. Python knows the difference." },
          { type: "code", label: "NUMBERS — no quotes, can do math", color: "#86efac", code: `price = 49.99\nclients = 10\ntotal = price * clients\nprint(total)` },
          { type: "code", label: "TEXT — use quotes, cannot do math", color: "#7dd3fc", code: `city = "Atlanta"\njob = "Freelance Developer"\nprint(city)\nprint(job)` },
          { type: "highlight", text: "Rule: Words need quotes. Numbers you will do math with do not." },
        ],
        hints: ["hourly_rate and hours should be plain numbers — no quotes.", "To multiply use *.", "Make sure you have a print statement."],
        challenges: [
          {
            prompt: "GUIDED: Run this code and see how Python does math with numbers automatically.",
            starterCode: `hourly_rate = 75\nhours = 40\nweekly_pay = hourly_rate * hours\n\nprint("Weekly pay:")\nprint(weekly_pay)`,
            whatItDoes: "Python multiplies 75 by 40 and gives you 3000.",
            check: (output) => /\d+/.test(output),
          },
          {
            prompt: "MODIFY IT: Change hourly_rate to 100 and hours to 20. The answer should be 2000.",
            starterCode: `hourly_rate = 75\nhours = 40\nweekly_pay = hourly_rate * hours\n\nprint("Weekly pay:")\nprint(weekly_pay)`,
            whatItDoes: "Change just the numbers and see how the result changes.",
            check: (output) => output.includes("2000"),
          },
          {
            prompt: "FROM SCRATCH: Calculate monthly income. Create hourly_rate, hours_per_day, and days_per_month. Multiply them and print the result.",
            starterCode: `# Create your 3 variables and multiply them\n`,
            whatItDoes: "Write all the math yourself. Use * to multiply. No quotes on numbers.",
            check: (output) => /\d{3,}/.test(output),
          },
        ],
        quiz: [
          { question: "Which correctly stores a price?", answer: "price = 49.99", choices: ["price = 49.99", "price = \"49.99\"", "price = $49.99", "\"price\" = 49.99"] },
          { question: "What symbol is used for multiplication in Python?", answer: "*", choices: ["*", "x", "×", "mul"] },
          { question: "Which stores text correctly?", answer: "city = \"Atlanta\"", choices: ["city = \"Atlanta\"", "city = Atlanta", "city == Atlanta", "Atlanta = city"] },
          { question: "Text values need _____ to be stored correctly", answer: "quotes", choices: ["quotes", "brackets", "parentheses", "asterisks"] },
          { question: "What does 8 * 75 equal in Python?", answer: "600", choices: ["600", "875", "83", "8.75"] },
        ],
      },
      {
        id: "if-statements", title: "If This, Then That", xp: 100, analogy: "Think of a bouncer at a club",
        theory: [
          { type: "plain", text: "A bouncer checks one thing: Are you 21 or older? If YES you get in. If NO you do not." },
          { type: "highlight", text: "An if-statement tells your code: IF something is true, THEN do this. OTHERWISE, do that." },
          { type: "code", label: "PYTHON", color: "#7dd3fc", code: `income = 5000\n\nif income > 3000:\n    print("You are profitable!")\nelse:\n    print("Keep grinding")` },
        ],
        hints: ["Start with: if income > 3000: do not forget the colon.", "The line after if must be indented.", "else: handles the false case."],
        challenges: [
          {
            prompt: "GUIDED: Run this code and see how Python makes decisions.",
            starterCode: `income = 5000\n\nif income > 3000:\n    print("You are profitable!")\nelse:\n    print("Keep grinding")`,
            whatItDoes: "Python checks if income is greater than 3000. Prints one thing if true, another if false.",
            check: (output) => output.includes("profitable") || output.includes("grinding"),
          },
          {
            prompt: "MODIFY IT: Change income to 1500 and run it. Then change the threshold from 3000 to 1000 and run again.",
            starterCode: `income = 5000\n\nif income > 3000:\n    print("You are profitable!")\nelse:\n    print("Keep grinding")`,
            whatItDoes: "Change the income value and see how the output changes.",
            check: (output) => output.includes("grinding"),
          },
          {
            prompt: "FROM SCRATCH: Write an if/else that checks if hourly_rate is above 50. Print 'Great rate!' if yes, 'Negotiate higher' if no.",
            starterCode: `# Create an hourly_rate variable\n# Write an if/else statement\n`,
            whatItDoes: "Build the condition yourself. Use if rate > 50: then indented print, then else: then indented print.",
            check: (output) => output.length > 0,
          },
        ],
        quiz: [
          { question: "What keyword starts a conditional statement?", answer: "if", choices: ["if", "when", "check", "condition"] },
          { question: "What keyword handles the false case?", answer: "else", choices: ["else", "otherwise", "if not", "fail"] },
          { question: "What must come after the condition?", answer: "A colon :", choices: ["A colon :", "A semicolon ;", "Parentheses ()", "Nothing"] },
          { question: "Code inside an if block must be _____", answer: "indented", choices: ["indented", "in quotes", "capitalized", "on one line"] },
          { question: "if 10 > 5 is _____", answer: "True", choices: ["True", "False", "Error", "None"] },
        ],
      },
      {
        id: "loops", title: "Loops — Make the Computer Do the Boring Work", xp: 125, analogy: "Think of a photocopier",
        theory: [
          { type: "plain", text: "If you need 100 copies of a flyer, you do not hand-copy it 100 times. You set the copier to 100 and press go." },
          { type: "highlight", text: "A loop tells your code: repeat this action X times." },
          { type: "code", label: "PYTHON", color: "#7dd3fc", code: `for i in range(5):\n    print("Sending invoice to client", i + 1)` },
        ],
        hints: ["Start with: for i in range(5):", "The line inside the loop must be indented.", "range(5) means repeat 5 times."],
        challenges: [
          {
            prompt: "GUIDED: Run this code and see how a loop repeats an action automatically.",
            starterCode: `for i in range(5):\n    print("Processing client number", i + 1)\n\nprint("Done! All clients processed.")`,
            whatItDoes: "The loop runs 5 times, printing a different number each time.",
            check: (output) => output.includes("1") && output.split("\n").filter(Boolean).length >= 3,
          },
          {
            prompt: "MODIFY IT: Change range(5) to range(10) and change the message to something about invoices.",
            starterCode: `for i in range(5):\n    print("Processing client number", i + 1)\n\nprint("Done! All clients processed.")`,
            whatItDoes: "Change the range number and the print message.",
            check: (output) => output.split("\n").filter(Boolean).length >= 10,
          },
          {
            prompt: "FROM SCRATCH: Write a loop that prints numbers 1 through 7, then prints 'Week complete!'",
            starterCode: `# Write a for loop using range\n`,
            whatItDoes: "Use for i in range(): and remember range starts at 0 so use i+1.",
            check: (output) => output.includes("7") && output.includes("complete"),
          },
        ],
        quiz: [
          { question: "What keyword starts a for loop?", answer: "for", choices: ["for", "loop", "repeat", "while"] },
          { question: "range(5) makes the loop run _____ times", answer: "5", choices: ["5", "4", "6", "0"] },
          { question: "What must the code inside a loop be?", answer: "Indented", choices: ["Indented", "Quoted", "Capitalized", "Numbered"] },
          { question: "range(5) starts counting at _____", answer: "0", choices: ["0", "1", "5", "-1"] },
          { question: "What prints Hello 3 times?", answer: "for i in range(3): print('Hello')", choices: ["for i in range(3): print('Hello')", "repeat(3): print('Hello')", "loop 3: print('Hello')", "print('Hello') * 3"] },
        ],
      },
      {
        id: "what-is-function", title: "Functions — Building Your Toolbox", xp: 200, analogy: "Think of a microwave",
        theory: [
          { type: "plain", text: "You do not rewire a microwave every time you want to heat food. You built the machine once and now just press the button." },
          { type: "highlight", text: "A function is code you write once and reuse forever." },
          { type: "code", label: "PYTHON", color: "#7dd3fc", code: `def calculate_profit(revenue, costs):\n    return revenue - costs\n\nprint(calculate_profit(10000, 3000))\nprint(calculate_profit(5000, 1200))` },
        ],
        hints: ["Start with: def function_name(inputs):", "Inside the function indented: return result", "Call it: print(function_name(values))"],
        challenges: [
          {
            prompt: "GUIDED: Run this code and see how a function works.",
            starterCode: `def calculate_profit(revenue, costs):\n    return revenue - costs\n\nprint(calculate_profit(10000, 3000))\nprint(calculate_profit(5000, 1200))\nprint(calculate_profit(25000, 8000))`,
            whatItDoes: "The function runs 3 times with different numbers each time.",
            check: (output) => output.split("\n").filter(l => /\d+/.test(l)).length >= 2,
          },
          {
            prompt: "MODIFY IT: Change the revenue and costs values. Add a fourth call with different values.",
            starterCode: `def calculate_profit(revenue, costs):\n    return revenue - costs\n\nprint(calculate_profit(10000, 3000))\nprint(calculate_profit(5000, 1200))\nprint(calculate_profit(25000, 8000))`,
            whatItDoes: "Change the numbers and add one more print(calculate_profit()) line.",
            check: (output) => output.split("\n").filter(l => /\d+/.test(l)).length >= 4,
          },
          {
            prompt: "FROM SCRATCH: Write a function called weekly_pay that takes hours and rate and returns hours * rate. Call it 3 times.",
            starterCode: `# Write your function below\n# def weekly_pay(hours, rate):\n#     return ?\n\n# Call it 3 times\n`,
            whatItDoes: "Build the function yourself. Use def, inputs in parentheses, and return the calculation.",
            check: (output) => output.split("\n").filter(l => /\d+/.test(l)).length >= 3,
          },
        ],
        quiz: [
          { question: "What keyword defines a function in Python?", answer: "def", choices: ["def", "function", "create", "make"] },
          { question: "What does the return keyword do?", answer: "Sends a result back from the function", choices: ["Sends a result back from the function", "Prints the result", "Ends the program", "Creates a variable"] },
          { question: "How do you call a function named calculate_profit?", answer: "calculate_profit(values)", choices: ["calculate_profit(values)", "run calculate_profit", "call calculate_profit()", "def calculate_profit"] },
          { question: "What is the main benefit of using functions?", answer: "Write code once and reuse it forever", choices: ["Write code once and reuse it forever", "Makes code shorter", "Runs faster", "Uses less memory"] },
          { question: "Complete: def double(number):\n    _____ number * 2", answer: "return", choices: ["return", "print", "give", "output"] },
        ],
      },
      {
        id: "lists", title: "Lists — Storing Multiple Things", xp: 125, analogy: "Think of a grocery list",
        theory: [
          { type: "plain", text: "A grocery list holds multiple items in one place: milk, eggs, bread, butter. You don't need a separate jar for each item — one list holds them all." },
          { type: "highlight", text: "A list in Python stores multiple values in one variable. Use square brackets [ ] to create one." },
          { type: "code", label: "PYTHON", color: "#7dd3fc", code: `clients = ["Marcus", "Tamika", "DeShawn", "Keisha"]\n\nprint(clients)\nprint(clients[0])\n\nfor client in clients:\n    print("Sending invoice to:", client)` },
          { type: "plain", text: "Lists start counting at 0 not 1. So clients[0] is the first item, clients[1] is second, and so on." },
          { type: "plain", text: "Why this matters for money: imagine storing 500 customer names, 1000 product prices, or every order that came in today. Lists make that possible." },
        ],
        hints: ["Create a list like this: skills = [\"Python\", \"JavaScript\", \"Automation\"]", "To print one item use its position: print(skills[0])", "To loop: for skill in skills:  then indented: print(skill)"],
        challenge: {
          prompt: "Create a list called 'skills' with at least 3 coding skills you want to learn. Then loop through the list and print each one.",
          starterCode: `skills = ["Python", "JavaScript", "Automation"]\n\nprint("My skills list:", skills)\n\nfor skill in skills:\n    print("Learning:", skill)\n\nskills.append("Web Scraping")\nprint("Updated list:", skills)`,
          whatItDoes: "You created a list, looped through it, and added a new item with .append(). These are the building blocks of real apps.",
          check: (output) => output.split("\n").filter(Boolean).length >= 3,
        },
      },
      {
        id: "dictionaries", title: "Dictionaries — Labeled Data", xp: 150, analogy: "Think of a contact card",
        theory: [
          { type: "plain", text: "A contact card for someone has labeled fields: Name: Marcus, Phone: 555-1234, Email: marcus@gmail.com. Each label points to a value." },
          { type: "highlight", text: "A dictionary in Python stores data with labels (called keys) instead of just positions. Perfect for storing related information together." },
          { type: "code", label: "PYTHON", color: "#7dd3fc", code: `client = {\n    "name": "Marcus Johnson",\n    "email": "marcus@gmail.com",\n    "budget": 2500,\n    "project": "Website"\n}\n\nprint(client["name"])\nprint(client["budget"])\n\nclient["budget"] = 3000\nprint("Updated budget:", client["budget"])` },
          { type: "plain", text: "Dictionaries use curly braces { }. Each entry has a 'key': 'value' pair separated by a colon. This is how real apps store user data, product info, and settings." },
        ],
        hints: ["Create a dict: person = {\"name\": \"Stanley\", \"age\": 30, \"goal\": \"financial freedom\"}", "Access a value: print(person[\"name\"])", "Loop: for key, value in person.items():  then indented: print(key, \":\", value)"],
        challenge: {
          prompt: "Create a dictionary called 'my_profile' with your name, your coding goal, and your target income. Then print each value.",
          starterCode: `my_profile = {\n    "name": "Your Name",\n    "goal": "Financial Freedom",\n    "target_income": 100000,\n    "skills": ["Python", "JavaScript"]\n}\n\nprint("Name:", my_profile["name"])\nprint("Goal:", my_profile["goal"])\nprint("Target:", my_profile["target_income"])\n\nfor key, value in my_profile.items():\n    print(key, "->", value)`,
          whatItDoes: "You built a data structure that could represent a user profile in a real app. This is exactly how apps store user information.",
          check: (output) => output.split("\n").filter(Boolean).length >= 3,
        },
      },
      {
        id: "working-with-files", title: "Working With Files", xp: 175, analogy: "Think of a filing cabinet",
        theory: [
          { type: "plain", text: "A filing cabinet stores documents you can pull out later, read, add to, or replace. Your computer's files work exactly the same way." },
          { type: "highlight", text: "Python can read from and write to files — this is how real automation works. Instead of manually opening Excel, Python opens it for you." },
          { type: "code", label: "PYTHON — Writing a file", color: "#86efac", code: `with open("clients.txt", "w") as file:\n    file.write("Marcus Johnson\\n")\n    file.write("Tamika Williams\\n")\n    file.write("DeShawn Carter\\n")\n\nprint("File saved!")` },
          { type: "code", label: "PYTHON — Reading a file", color: "#7dd3fc", code: `with open("clients.txt", "r") as file:\n    content = file.read()\n    print(content)` },
          { type: "plain", text: "'w' means write (creates or overwrites). 'r' means read. 'a' means append. The 'with' statement automatically closes the file when done — always use it." },
          { type: "plain", text: "Real money use: automatically generate client reports, save scraped data, process CSV files from clients. This is a billable skill right now." },
        ],
        hints: ["Use open(\"filename.txt\", \"w\") to create and write a file.", "Inside the with block, use file.write(\"your text\\n\") — the \\n creates a new line.", "To read: open(\"filename.txt\", \"r\") and file.read()"],
        challenge: {
          prompt: "Write a Python script that saves your name and coding goal to a file called 'mygoals.txt', then reads it back and prints it.",
          starterCode: `with open("mygoals.txt", "w") as file:\n    file.write("Name: Stanley White\\n")\n    file.write("Goal: Financial Freedom\\n")\n    file.write("Timeline: 9 months\\n")\n\nprint("Goals saved!")\n\nwith open("mygoals.txt", "r") as file:\n    content = file.read()\n    print("\\nMy Goals:")\n    print(content)`,
          whatItDoes: "You wrote data to a real file and read it back. This same pattern is used to process thousands of Excel rows, save scraped data, and generate automated reports.",
          check: (output) => output.includes("saved") || output.includes("Goals") || output.length > 0,
        },
      },
    ],
  },
  {
    id: "decisions", title: "Making Decisions", icon: "🧠", color: "#ff6b35",
    lessons: [
      {
        id: "if-statements", title: "If This, Then That", xp: 100, analogy: "Think of a bouncer at a club",
        theory: [
          { type: "plain", text: "A bouncer checks one thing: Are you 21 or older? If YES you get in. If NO you do not." },
          { type: "highlight", text: "An if-statement tells your code: IF something is true, THEN do this. OTHERWISE, do that." },
          { type: "code", label: "PYTHON", color: "#7dd3fc", code: `income = 5000\n\nif income > 3000:\n    print("You are profitable!")\nelse:\n    print("Keep grinding")` },
        ],
        hints: ["Start with: if income > 3000: do not forget the colon.", "The line after if must be indented.", "else: handles the false case."],
        challenges: [
          {
            prompt: "GUIDED: Run this code and see how Python makes decisions.",
            starterCode: `income = 5000\n\nif income > 3000:\n    print("You are profitable!")\nelse:\n    print("Keep grinding")`,
            whatItDoes: "Python checks if income is greater than 3000. Prints one thing if true, another if false.",
            check: (output) => output.includes("profitable") || output.includes("grinding"),
          },
          {
            prompt: "MODIFY IT: Change income to 1500 and run it. The output should change.",
            starterCode: `income = 5000\n\nif income > 3000:\n    print("You are profitable!")\nelse:\n    print("Keep grinding")`,
            whatItDoes: "Change the income value and see how the output changes.",
            check: (output) => output.includes("grinding"),
          },
          {
            prompt: "FROM SCRATCH: Write an if/else that checks if hourly_rate is above 50. Print Great rate! if yes, Negotiate higher if no.",
            starterCode: `# Create an hourly_rate variable\n# Write an if/else statement\n`,
            whatItDoes: "Build the condition yourself.",
            check: (output) => output.length > 0,
          },
        ],
        quiz: [
          { question: "What keyword starts a conditional statement?", answer: "if", choices: ["if", "when", "check", "condition"] },
          { question: "What keyword handles the false case?", answer: "else", choices: ["else", "otherwise", "if not", "fail"] },
          { question: "What must come after the condition?", answer: "A colon :", choices: ["A colon :", "A semicolon ;", "Parentheses ()", "Nothing"] },
          { question: "Code inside an if block must be _____", answer: "indented", choices: ["indented", "in quotes", "capitalized", "on one line"] },
          { question: "if 10 > 5 is _____", answer: "True", choices: ["True", "False", "Error", "None"] },
        ],
      },
      {
        id: "loops", title: "Loops — Make the Computer Do the Boring Work", xp: 125, analogy: "Think of a photocopier",
        theory: [
          { type: "plain", text: "If you need 100 copies of a flyer, you do not hand-copy it 100 times. You set the copier to 100 and press go." },
          { type: "highlight", text: "A loop tells your code: repeat this action X times." },
          { type: "code", label: "PYTHON", color: "#7dd3fc", code: `for i in range(5):\n    print("Sending invoice to client", i + 1)` },
        ],
        hints: ["Start with: for i in range(5):", "The line inside the loop must be indented.", "range(5) means repeat 5 times."],
        challenges: [
          {
            prompt: "GUIDED: Run this code and see how a loop repeats an action automatically.",
            starterCode: `for i in range(5):\n    print("Processing client number", i + 1)\n\nprint("Done! All clients processed.")`,
            whatItDoes: "The loop runs 5 times, printing a different number each time.",
            check: (output) => output.includes("1") && output.split("\n").filter(Boolean).length >= 3,
          },
          {
            prompt: "MODIFY IT: Change range(5) to range(10) and change the message to something about invoices.",
            starterCode: `for i in range(5):\n    print("Processing client number", i + 1)\n\nprint("Done! All clients processed.")`,
            whatItDoes: "Change the range number and the print message.",
            check: (output) => output.split("\n").filter(Boolean).length >= 10,
          },
          {
            prompt: "FROM SCRATCH: Write a loop that prints numbers 1 through 7, then prints Week complete!",
            starterCode: `# Write a for loop using range\n`,
            whatItDoes: "Use for i in range(): and use i+1 to show 1-7.",
            check: (output) => output.includes("7") && output.includes("complete"),
          },
        ],
        quiz: [
          { question: "What keyword starts a for loop?", answer: "for", choices: ["for", "loop", "repeat", "while"] },
          { question: "range(5) makes the loop run _____ times", answer: "5", choices: ["5", "4", "6", "0"] },
          { question: "What must the code inside a loop be?", answer: "Indented", choices: ["Indented", "Quoted", "Capitalized", "Numbered"] },
          { question: "range(5) starts counting at _____", answer: "0", choices: ["0", "1", "5", "-1"] },
          { question: "What prints Hello 3 times?", answer: "for i in range(3): print('Hello')", choices: ["for i in range(3): print('Hello')", "repeat(3): print('Hello')", "loop 3: print('Hello')", "print('Hello') * 3"] },
        ],
      },
    ],
  },
  {
    id: "functions", title: "Functions — Your Own Tools", icon: "🔧", color: "#a78bfa",
    lessons: [
      {
        id: "what-is-function", title: "Functions — Building Your Toolbox", xp: 200, analogy: "Think of a microwave",
        theory: [
          { type: "plain", text: "You do not rewire a microwave every time you want to heat food. You built the machine once and now just press the button." },
          { type: "highlight", text: "A function is code you write once and reuse forever." },
          { type: "code", label: "PYTHON", color: "#7dd3fc", code: `def calculate_profit(revenue, costs):\n    return revenue - costs\n\nprint(calculate_profit(10000, 3000))\nprint(calculate_profit(5000, 1200))` },
        ],
        hints: ["Start with: def function_name(inputs):", "Inside the function indented: return result", "Call it: print(function_name(values))"],
        challenges: [
          {
            prompt: "GUIDED: Run this code and see how a function works.",
            starterCode: `def calculate_profit(revenue, costs):\n    return revenue - costs\n\nprint(calculate_profit(10000, 3000))\nprint(calculate_profit(5000, 1200))\nprint(calculate_profit(25000, 8000))`,
            whatItDoes: "The function runs 3 times with different numbers each time.",
            check: (output) => output.split("\n").filter(l => /\d+/.test(l)).length >= 2,
          },
          {
            prompt: "MODIFY IT: Change the revenue and costs values. Add a fourth call with different values.",
            starterCode: `def calculate_profit(revenue, costs):\n    return revenue - costs\n\nprint(calculate_profit(10000, 3000))\nprint(calculate_profit(5000, 1200))\nprint(calculate_profit(25000, 8000))`,
            whatItDoes: "Change the numbers and add one more print line.",
            check: (output) => output.split("\n").filter(l => /\d+/.test(l)).length >= 4,
          },
          {
            prompt: "FROM SCRATCH: Write a function called weekly_pay that takes hours and rate and returns hours * rate. Call it 3 times.",
            starterCode: `# Write your function below\n# def weekly_pay(hours, rate):\n#     return ?\n\n# Call it 3 times\n`,
            whatItDoes: "Build the function yourself.",
            check: (output) => output.split("\n").filter(l => /\d+/.test(l)).length >= 3,
          },
        ],
        quiz: [
          { question: "What keyword defines a function in Python?", answer: "def", choices: ["def", "function", "create", "make"] },
          { question: "What does the return keyword do?", answer: "Sends a result back from the function", choices: ["Sends a result back from the function", "Prints the result", "Ends the program", "Creates a variable"] },
          { question: "How do you call a function named greet?", answer: "greet()", choices: ["greet()", "call greet", "run greet", "greet{}"] },
          { question: "What is the main benefit of using functions?", answer: "Write code once and reuse it forever", choices: ["Write code once and reuse it forever", "Makes code shorter", "Runs faster", "Uses less memory"] },
          { question: "Complete: def double(number):\n    _____ number * 2", answer: "return", choices: ["return", "print", "give", "output"] },
        ],
      },
    ],
  },
  {
    id: "data", title: "Working With Data", icon: "📦", color: "#22d3ee",
    lessons: [
      {
        id: "lists", title: "Lists — Storing Multiple Things", xp: 175, analogy: "Think of a grocery list",
        theory: [
          { type: "plain", text: "A grocery list holds multiple items in one place. You do not need a separate jar for each item." },
          { type: "highlight", text: "A list in Python stores multiple values in one variable. Use square brackets [ ] to create one." },
          { type: "code", label: "PYTHON", color: "#7dd3fc", code: `clients = ["Marcus", "Tamika", "DeShawn"]\n\nfor client in clients:\n    print("Sending invoice to:", client)` },
        ],
        hints: ["Create a list: skills = [\"Python\", \"JavaScript\"]", "Access one item: print(skills[0])", "Loop: for skill in skills: then print(skill)"],
        challenges: [
          {
            prompt: "GUIDED: Run this code and see how a list stores multiple items.",
            starterCode: `clients = ["Marcus", "Tamika", "DeShawn", "Keisha"]\n\nprint("All clients:", clients)\nprint("First client:", clients[0])\n\nfor client in clients:\n    print("Sending invoice to:", client)`,
            whatItDoes: "A list stores 4 names. The loop goes through each one.",
            check: (output) => output.includes("Marcus") && output.split("\n").filter(Boolean).length >= 4,
          },
          {
            prompt: "MODIFY IT: Change the 4 names to your own. Add a 5th with .append(). Print the total count.",
            starterCode: `clients = ["Marcus", "Tamika", "DeShawn", "Keisha"]\n\nfor client in clients:\n    print("Sending invoice to:", client)`,
            whatItDoes: "Replace the names. Add clients.append('NewName') and print(len(clients))",
            check: (output) => !output.includes("Marcus") && output.split("\n").filter(Boolean).length >= 4,
          },
          {
            prompt: "FROM SCRATCH: Create a list called skills with 4 coding skills. Loop and print each one. Add a 5th with .append().",
            starterCode: `# Create your skills list\n# Loop through and print each\n# Add a 5th skill\n`,
            whatItDoes: "Build the list yourself. Use square brackets. Loop with for skill in skills.",
            check: (output) => output.split("\n").filter(Boolean).length >= 5,
          },
        ],
        quiz: [
          { question: "What brackets are used to create a list?", answer: "Square brackets [ ]", choices: ["Square brackets [ ]", "Curly brackets { }", "Round brackets ( )", "Angle brackets < >"] },
          { question: "What index is the FIRST item in a list?", answer: "0", choices: ["0", "1", "-1", "first"] },
          { question: "How do you add an item to a list?", answer: ".append(item)", choices: [".append(item)", ".add(item)", ".push(item)", ".insert(item)"] },
          { question: "How do you count items in a list?", answer: "len(list)", choices: ["len(list)", "count(list)", "list.size()", "list.length"] },
          { question: "Complete: for _____ in clients: print(client)", answer: "client", choices: ["client", "item", "i", "x"] },
        ],
      },
      {
        id: "dictionaries", title: "Dictionaries — Labeled Data", xp: 175, analogy: "Think of a contact card",
        theory: [
          { type: "plain", text: "A contact card has labeled fields: Name, Phone, Email. Each label points to a value." },
          { type: "highlight", text: "A dictionary stores data with labels called keys. Perfect for storing related information together." },
          { type: "code", label: "PYTHON", color: "#7dd3fc", code: `client = {\n    "name": "Marcus Johnson",\n    "budget": 2500\n}\nprint(client["name"])\nprint(client["budget"])` },
        ],
        hints: ["Create: person = {\"name\": \"Stanley\", \"age\": 30}", "Access: print(person[\"name\"])", "Loop: for key, value in person.items():"],
        challenges: [
          {
            prompt: "GUIDED: Run this code and see how a dictionary stores labeled data.",
            starterCode: `client = {\n    "name": "Marcus Johnson",\n    "email": "marcus@gmail.com",\n    "budget": 2500,\n    "project": "Website"\n}\n\nfor key, value in client.items():\n    print(key, "->", value)`,
            whatItDoes: "A dictionary stores 4 pieces of info about one client.",
            check: (output) => output.includes("Marcus") && output.split("\n").filter(Boolean).length >= 4,
          },
          {
            prompt: "MODIFY IT: Change all values to a real or made-up client. Add a new key called rate.",
            starterCode: `client = {\n    "name": "Marcus Johnson",\n    "email": "marcus@gmail.com",\n    "budget": 2500,\n    "project": "Website"\n}\n\nfor key, value in client.items():\n    print(key, "->", value)`,
            whatItDoes: "Replace all values and add a rate key.",
            check: (output) => !output.includes("Marcus") && output.includes("rate"),
          },
          {
            prompt: "FROM SCRATCH: Create a dictionary called my_profile with name, goal, target_income, and top_skill. Print each value.",
            starterCode: `# Create your profile dictionary\n# Print each value individually\n`,
            whatItDoes: "Build the dictionary yourself.",
            check: (output) => output.split("\n").filter(Boolean).length >= 4,
          },
        ],
        quiz: [
          { question: "What brackets are used to create a dictionary?", answer: "Curly brackets { }", choices: ["Curly brackets { }", "Square brackets [ ]", "Round brackets ( )", "Angle brackets < >"] },
          { question: "How do you access a value in a dictionary?", answer: 'dict["key"]', choices: ['dict["key"]', "dict.key", "dict(key)", "dict->key"] },
          { question: "What is a dictionary key?", answer: "A label that points to a value", choices: ["A label that points to a value", "A password", "An index number", "A variable name"] },
          { question: "How do you loop through all key-value pairs?", answer: "for key, value in dict.items():", choices: ["for key, value in dict.items():", "for item in dict:", "for key in dict.keys():", "loop dict"] },
          { question: "Which correctly adds a new key?", answer: 'client["phone"] = "555-1234"', choices: ['client["phone"] = "555-1234"', 'client.add("phone")', 'client.append("phone")', 'add client["phone"]'] },
        ],
      },
      {
        id: "working-with-files", title: "Working With Files", xp: 200, analogy: "Think of a filing cabinet",
        theory: [
          { type: "plain", text: "A filing cabinet stores documents you can pull out later, read, add to, or replace." },
          { type: "highlight", text: "Python can read from and write to files. This is how real automation works." },
          { type: "code", label: "PYTHON — Writing", color: "#86efac", code: `with open("clients.txt", "w") as file:\n    file.write("Marcus Johnson\\n")\nprint("File saved!")` },
          { type: "code", label: "PYTHON — Reading", color: "#7dd3fc", code: `with open("clients.txt", "r") as file:\n    content = file.read()\n    print(content)` },
        ],
        hints: ["Use open(\"filename.txt\", \"w\") to create and write", "file.write(\"text\\n\")", "To read: open(\"filename.txt\", \"r\") then file.read()"],
        challenges: [
          {
            prompt: "GUIDED: Run this code and see how Python writes to a file then reads it back.",
            starterCode: `with open("mygoals.txt", "w") as file:\n    file.write("Name: Stanley White\\n")\n    file.write("Goal: Financial Freedom\\n")\n\nprint("File saved!")\n\nwith open("mygoals.txt", "r") as file:\n    content = file.read()\n    print(content)`,
            whatItDoes: "Writes 3 lines to a file then reads them all back.",
            check: (output) => output.includes("saved") && output.includes("Stanley"),
          },
          {
            prompt: "MODIFY IT: Change the name and goal. Add a 4th line called Skills with your top skill.",
            starterCode: `with open("mygoals.txt", "w") as file:\n    file.write("Name: Stanley White\\n")\n    file.write("Goal: Financial Freedom\\n")\n\nprint("File saved!")\n\nwith open("mygoals.txt", "r") as file:\n    content = file.read()\n    print(content)`,
            whatItDoes: "Change the values and add a Skills line.",
            check: (output) => !output.includes("Stanley White") && output.includes("Skills"),
          },
          {
            prompt: "FROM SCRATCH: Write 3 client names to clients.txt, then read it back and print each line.",
            starterCode: `# Write 3 client names to clients.txt\n# Then read and print the file\n`,
            whatItDoes: "Write the whole thing yourself. Use w to write, r to read.",
            check: (output) => output.split("\n").filter(Boolean).length >= 3,
          },
        ],
        quiz: [
          { question: "What does the w mode do when opening a file?", answer: "Creates or overwrites the file for writing", choices: ["Creates or overwrites the file for writing", "Reads the file", "Appends to the file", "Deletes the file"] },
          { question: "What does \\n do inside a file.write() string?", answer: "Creates a new line", choices: ["Creates a new line", "Adds a tab", "Ends the program", "Nothing"] },
          { question: "Why do we use the with statement?", answer: "It automatically closes the file when done", choices: ["It automatically closes the file when done", "It makes the file bigger", "It reads faster", "It is required by Python"] },
          { question: "How do you read all content from an open file?", answer: "file.read()", choices: ["file.read()", "file.open()", "file.get()", "file.load()"] },
          { question: "Which mode appends without deleting?", answer: "a", choices: ["a", "w", "r", "x"] },
        ],
      },
    ],
  },
  {
    id: "logic2", title: "Logic Level Up", icon: "⚡", color: "#f472b6",
    lessons: [
      {
        id: "elif", title: "Multiple Choices with elif", xp: 125, analogy: "Think of a traffic light",
        theory: [
          { type: "plain", text: "A traffic light doesn't just have two options. It has three: Red = Stop. Yellow = Slow down. Green = Go. If/else only gives you two paths — but elif gives you as many as you need." },
          { type: "highlight", text: "elif means 'else if' — it lets you check multiple conditions in order until one is true." },
          { type: "code", label: "PYTHON", color: "#f9a8d4", code: `score = 85\n\nif score >= 90:\n    print("A — Excellent!")\nelif score >= 80:\n    print("B — Good work")\nelif score >= 70:\n    print("C — Passing")\nelse:\n    print("Keep practicing")` },
          { type: "plain", text: "Python checks each condition top to bottom and stops at the first one that's true." },
          { type: "plain", text: "Real use: pricing tiers. If a client wants 1 page → $500. elif 5 pages → $1500. elif 10 pages → $3000. else → custom quote." },
        ],
        hints: ["Start with if, then use elif (not else if — it's one word in Python), then end with else.", "Each condition needs a colon at the end.", "The indented line under each condition is what runs when that condition is true."],
        challenge: {
          prompt: "Build a freelance pricing calculator. If hours > 40: Senior rate. elif > 20: Standard rate. else: Starter rate.",
          starterCode: `hours = 25\n\nif hours > 40:\n    print("Senior rate: $150/hr")\nelif hours > 20:\n    print("Standard rate: $100/hr")\nelse:\n    print("Starter rate: $75/hr")\n\n# Try changing hours to 10, then 25, then 50`,
          whatItDoes: "Your code checks hours and picks the right pricing tier automatically. This is how real billing software works.",
          check: (output) => output.includes("rate") || output.includes("$"),
        },
      },
      {
        id: "combining-conditions", title: "AND / OR — Combining Conditions", xp: 125, analogy: "Think of a job application",
        theory: [
          { type: "plain", text: "A job posting says: you need 2+ years experience AND a degree. Both must be true. That's AND. Another job says: Python OR JavaScript. Either works. That's OR." },
          { type: "highlight", text: "AND means both conditions must be true. OR means at least one must be true." },
          { type: "code", label: "PYTHON", color: "#f9a8d4", code: `has_portfolio = True\nhas_skills = True\n\nif has_portfolio and has_skills:\n    print("You're hireable!")\n\nknows_python = True\nknows_javascript = False\n\nif knows_python or knows_javascript:\n    print("You qualify!")` },
          { type: "plain", text: "You can combine as many as you want: if age > 18 and has_id and not banned — that's three conditions checked at once." },
        ],
        hints: ["Use the word 'and' between two conditions: if condition1 and condition2:", "Use 'or' when either condition being true is enough.", "True and False must be capitalized in Python."],
        challenge: {
          prompt: "A client qualifies for a discount if they have more than 3 projects AND their budget is over 5000. Write the check and print 'Discount applied!' or 'No discount'.",
          starterCode: `projects = 4\nbudget = 6000\n\nif projects > 3 and budget > 5000:\n    print("Discount applied!")\nelse:\n    print("No discount")\n\n# Try changing projects to 2 — what happens?`,
          whatItDoes: "Both conditions must be true for the discount to apply. Change the numbers to see how AND works in practice.",
          check: (output) => output.includes("Discount") || output.includes("discount") || output.includes("No"),
        },
      },
      {
        id: "while-loops", title: "While Loops — Keep Going Until", xp: 150, analogy: "Think of a vending machine",
        theory: [
          { type: "plain", text: "A vending machine keeps waiting for money. While the amount inserted is less than the price, it keeps waiting. The moment you insert enough — it gives you the item and stops." },
          { type: "highlight", text: "A while loop keeps running AS LONG AS a condition is true. It stops the moment the condition becomes false." },
          { type: "code", label: "PYTHON", color: "#f9a8d4", code: `counter = 1\n\nwhile counter <= 5:\n    print("Client", counter, "invoiced")\n    counter = counter + 1\n\nprint("All clients invoiced!")` },
          { type: "plain", text: "IMPORTANT: always make sure your while loop will eventually stop. Always update the variable inside the loop." },
          { type: "plain", text: "Real use: keep checking for new orders until none are left. Keep retrying a failed connection until it works." },
        ],
        hints: ["Start with: counter = 1  then while counter <= 5:", "Inside the loop: do your action AND update counter = counter + 1", "Without counter = counter + 1, the loop runs forever."],
        challenge: {
          prompt: "Write a while loop that starts at 1 and prints each number up to 10, then prints 'Done!'",
          starterCode: `number = 1\n\nwhile number <= 10:\n    print("Number:", number)\n    number = number + 1\n\nprint("Done! Counted to 10.")`,
          whatItDoes: "The loop runs 10 times, printing each number. number = number + 1 makes sure it eventually stops at 10.",
          check: (output) => output.includes("10") && output.includes("Done"),
        },
      },
      {
        id: "error-handling", title: "Error Handling — When Things Go Wrong", xp: 150, analogy: "Think of a seatbelt",
        theory: [
          { type: "plain", text: "A seatbelt doesn't stop car crashes from happening. But it protects you when they do. Error handling in code works the same way — you can't prevent every error, but you can handle them gracefully." },
          { type: "highlight", text: "try/except lets your code attempt something risky and handle it cleanly if it fails — instead of crashing." },
          { type: "code", label: "PYTHON", color: "#f9a8d4", code: `try:\n    result = 100 / 0\n    print(result)\nexcept:\n    print("Something went wrong — can't divide by zero")\n\nprint("Program keeps running!")` },
          { type: "plain", text: "Real use: when reading a file that might not exist. When calling an API that might be down. Professional code always handles errors." },
          { type: "plain", text: "This is one of the things that separates beginner code from code you can sell. Clients don't want apps that crash." },
        ],
        hints: ["Wrap the risky code in try:  then indent the code under it.", "Under except:  write what should happen if it fails.", "The code after the try/except block always runs — the program doesn't crash."],
        challenge: {
          prompt: "Write a try/except that tries to convert 'hello' to a number using int('hello'), catches the error, and prints 'That is not a valid number'.",
          starterCode: `try:\n    number = int("hello")\n    print("Converted:", number)\nexcept:\n    print("That is not a valid number")\n\nprint("Program finished without crashing!")`,
          whatItDoes: "int('hello') would normally crash your program. The try/except catches it and prints a friendly message instead.",
          check: (output) => output.includes("not a valid") || output.includes("finished") || output.length > 0,
        },
      },
    ],
  },
  {
    id: "python-pro", title: "Python Pro Skills", icon: "🐍", color: "#34d399",
    lessons: [
      {
        id: "string-methods", title: "String Methods — Manipulating Text", xp: 150, analogy: "Think of a word processor",
        theory: [
          { type: "plain", text: "Microsoft Word lets you do things to text — make it uppercase, find and replace words, count characters, trim spaces. Python has all of those built in for strings." },
          { type: "highlight", text: "String methods are built-in tools that manipulate text. You use them with a dot after the variable name." },
          { type: "code", label: "PYTHON", color: "#6ee7b7", code: `name = "stanley white"\n\nprint(name.upper())\nprint(name.title())\nprint(name.replace("white", "johnson"))\nprint(len(name))\nprint(name.strip())\nprint(name.split(" "))` },
          { type: "plain", text: "Real money use: cleaning up messy data from clients. If someone gives you a spreadsheet with names in random capitalization or extra spaces, 2 lines of Python fixes 10,000 rows instantly." },
        ],
        hints: ["Call a method with a dot: name.upper() or name.title()", "len(variable) counts the characters — it goes outside the variable, not after a dot.", "Try chaining methods: name.strip().title()"],
        challenge: {
          prompt: "Take the messy string '   FINANCIAL freedom   ' and clean it up — strip the spaces, convert to title case, and print the result.",
          starterCode: `messy = "   FINANCIAL freedom   "\n\ncleaned = messy.strip()\ncleaned = cleaned.title()\n\nprint(cleaned)\nprint("Length:", len(cleaned))`,
          whatItDoes: "You cleaned messy text automatically. This exact skill — data cleaning — is one of the most in-demand Python freelance skills. Businesses pay $50-100/hr for it.",
          check: (output) => output.includes("Financial Freedom") || output.includes("financial freedom") || output.length > 0,
        },
      },
      {
        id: "list-methods", title: "List Methods — Managing Collections", xp: 150, analogy: "Think of managing a team roster",
        theory: [
          { type: "plain", text: "A coach manages a team roster — adding new players, removing ones who left, sorting by jersey number, finding how many players are on the team. Python lists have all of these built in." },
          { type: "highlight", text: "List methods let you add, remove, sort, and search through your lists without writing complex code." },
          { type: "code", label: "PYTHON", color: "#6ee7b7", code: `clients = ["Marcus", "Tamika", "DeShawn"]\n\nclients.append("Keisha")\nclients.remove("DeShawn")\nclients.sort()\nprint(len(clients))\nprint("Marcus" in clients)\nprint(clients[0])\nprint(clients[-1])` },
          { type: "plain", text: "The 'in' keyword is powerful — it checks if something exists in a list. This is how you check if a user exists, if a product is in stock, if a name is on a list." },
        ],
        hints: ["Add items with .append('item')  — remove with .remove('item')", "Sort alphabetically with .sort()  — count items with len(list)", "Check if something exists: if 'item' in list_name:"],
        challenge: {
          prompt: "Start with a list of 3 skills. Add 2 more with append. Remove one. Sort the list. Print the final list and how many skills you have.",
          starterCode: `skills = ["Python", "JavaScript", "Automation"]\n\nskills.append("Web Scraping")\nskills.append("Data Analysis")\n\nskills.remove("JavaScript")\n\nskills.sort()\n\nprint("My skills:", skills)\nprint("Total skills:", len(skills))`,
          whatItDoes: "You managed a dynamic list — adding, removing, sorting, counting. This is how apps manage user data, shopping carts, and playlists.",
          check: (output) => output.includes("skills") || output.split("\n").filter(Boolean).length >= 2,
        },
      },
      {
        id: "functions-advanced", title: "Functions — Default Values & Multiple Returns", xp: 175, analogy: "Think of a coffee order",
        theory: [
          { type: "plain", text: "At a coffee shop, if you don't specify milk, they use regular milk by default. But you can always override it. Functions work the same — you can set default values for inputs." },
          { type: "highlight", text: "Default parameters mean a function works even if you don't provide every input. Multiple returns let a function give back more than one value." },
          { type: "code", label: "PYTHON", color: "#6ee7b7", code: `def greet(name, greeting="Hello"):\n    return greeting + ", " + name\n\nprint(greet("Marcus"))\nprint(greet("Tamika", "Hey"))\n\ndef get_stats(numbers):\n    total = sum(numbers)\n    average = total / len(numbers)\n    return total, average\n\nt, avg = get_stats([100, 200, 300])\nprint("Total:", t)\nprint("Average:", avg)` },
          { type: "plain", text: "Returning multiple values is huge for business logic — calculate revenue AND profit AND tax all in one function call." },
        ],
        hints: ["Set a default: def greet(name, greeting='Hello'):", "Return multiple values separated by commas: return total, average", "Capture multiple returns: total, average = get_stats(numbers)"],
        challenge: {
          prompt: "Build a function called 'project_quote' that takes client_name and hours, with a default rate of 75. Return both the total cost and a formatted quote message.",
          starterCode: `def project_quote(client_name, hours, rate=75):\n    total = hours * rate\n    message = "Quote for " + client_name + ": $" + str(total)\n    return total, message\n\ncost, quote = project_quote("Marcus", 20)\nprint(quote)\n\ncost2, quote2 = project_quote("Tamika", 40, 100)\nprint(quote2)`,
          whatItDoes: "A reusable quote generator. Pass in a client name and hours, get back a professional quote. This is the kind of tool you'd build for a client and charge $300+ for.",
          check: (output) => output.includes("Quote") || output.includes("$") || output.split("\n").filter(Boolean).length >= 2,
        },
      },
      {
        id: "modules", title: "Modules — Using Other People's Code", xp: 175, analogy: "Think of a toolbox",
        theory: [
          { type: "plain", text: "A plumber doesn't forge their own wrenches. They buy a toolbox full of tools other people made. Python has thousands of pre-built toolboxes called modules — you just import them and use them." },
          { type: "highlight", text: "A module is a collection of ready-made functions you can import and use. This is how you access Python's real power without writing everything from scratch." },
          { type: "code", label: "PYTHON", color: "#6ee7b7", code: `import random\nimport math\nimport datetime\n\nprint(random.randint(1, 100))\nprint(math.ceil(4.2))\n\ntoday = datetime.date.today()\nprint("Today is:", today)` },
          { type: "plain", text: "Beyond built-in modules, you can install thousands more. requests lets you pull data from any website. pandas processes massive spreadsheets. These are the tools that make automation scripts worth thousands of dollars." },
        ],
        hints: ["Import a module at the top: import random  then use it: random.randint(1, 100)", "import datetime  then datetime.date.today() gives you today's date.", "import math  then math.ceil() rounds up, math.floor() rounds down."],
        challenge: {
          prompt: "Import datetime and random. Print today's date with a label. Then generate a random invoice number between 1000 and 9999 and print it.",
          starterCode: `import datetime\nimport random\n\ntoday = datetime.date.today()\nprint("Invoice Date:", today)\n\ninvoice_num = random.randint(1000, 9999)\nprint("Invoice #:", invoice_num)\n\nprint("Invoice ready to send!")`,
          whatItDoes: "You just used two real Python modules to generate a professional invoice header. No math needed — Python's built-in tools did the work.",
          check: (output) => output.includes("Invoice") || output.includes("2026") || output.length > 0,
        },
      },
      {
        id: "real-project", title: "Mini Project — Client Invoice Generator", xp: 250, analogy: "Think of your first paid job",
        theory: [
          { type: "plain", text: "Every skill you've learned so far — variables, functions, lists, dictionaries, modules, loops, conditionals — they all come together in real projects. This is your first one." },
          { type: "highlight", text: "A real project combines multiple concepts to solve a real problem. This invoice generator is something you could actually sell to small businesses." },
          { type: "code", label: "PYTHON — Full Invoice Generator", color: "#6ee7b7", code: `import datetime\nimport random\n\ndef create_invoice(client, services, rate=75):\n    today = datetime.date.today()\n    invoice_id = random.randint(1000, 9999)\n    total = sum(services.values()) * rate\n    print("=" * 40)\n    print("INVOICE #", invoice_id)\n    print("Date:", today)\n    print("Client:", client)\n    print("-" * 40)\n    for service, hours in services.items():\n        cost = hours * rate\n        print(service + ":", hours, "hrs @ $" + str(rate) + " = $" + str(cost))\n    print("-" * 40)\n    print("TOTAL DUE: $", total)\n    print("=" * 40)\n    return total` },
          { type: "plain", text: "This script uses: functions, dictionaries, loops, modules, string formatting, and math. That's 6 concepts working together. This is what 'knowing how to code' actually looks like." },
        ],
        hints: ["Run the starter code first — don't change anything, just see it work.", "Then change the client name and add your own services to the dictionary.", "Try changing the rate from 75 to 100 and see how the total changes automatically."],
        challenge: {
          prompt: "Run the invoice generator with your own client name, your own services, and your own hourly rate. Make it real — use actual services you could offer.",
          starterCode: `import datetime\nimport random\n\ndef create_invoice(client, services, rate=75):\n    today = datetime.date.today()\n    invoice_id = random.randint(1000, 9999)\n    total = sum(services.values()) * rate\n    print("=" * 40)\n    print("INVOICE #", invoice_id)\n    print("Date:", today)\n    print("Bill To:", client)\n    print("-" * 40)\n    for service, hours in services.items():\n        cost = hours * rate\n        print(service + ":", hours, "hrs = $" + str(cost))\n    print("-" * 40)\n    print("TOTAL DUE: $", total)\n    print("=" * 40)\n    return total\n\ncreate_invoice(\n    "Marcus Johnson",\n    {\n        "Website Design": 10,\n        "Automation Script": 5,\n        "Consultation": 2\n    },\n    rate=75\n)`,
          whatItDoes: "A real invoice generator using variables, functions, dictionaries, loops, and modules all at once. This is a sellable script — small businesses pay for exactly this.",
          check: (output) => output.includes("INVOICE") || output.includes("TOTAL") || output.includes("$"),
        },
      },
    ],
  },
  {
    id: "javascript", title: "JavaScript — The Web Language", icon: "🌐", color: "#f59e0b",
    lessons: [
      {
        id: "js-intro", title: "What is JavaScript?", xp: 75, analogy: "Think of a website as a house", language: "javascript",
        theory: [
          { type: "plain", text: "If a website is a house — HTML is the structure (walls, rooms, doors). CSS is the decoration (paint, furniture, style). JavaScript is the electricity — it makes everything work and move." },
          { type: "highlight", text: "JavaScript runs IN the browser. Every button you've ever clicked, every animation you've seen, every form you've filled out — JavaScript made that happen." },
          { type: "code", label: "JAVASCRIPT", color: "#fcd34d", code: `// This is JavaScript\n// console.log shows output — like Python's print()\n\nconsole.log("Hello from JavaScript!")\n\nlet name = "Stanley"\nlet goal = "financial freedom"\n\nconsole.log(name)\nconsole.log(goal)` },
          { type: "plain", text: "Notice: JavaScript uses let for variables instead of just writing the name. And console.log() instead of print(). Different syntax, same idea." },
          { type: "list", items: ["🌐 Every website runs JavaScript", "💰 Full stack web developer salary: $80k-$150k/year", "🚀 Learn JavaScript = build anything on the web"] },
        ],
        hints: ["Use console.log() to display output — it's JavaScript's version of Python's print()", "Create variables with let: let name = 'Stanley'", "Run the code and see the output — then change the values and run again"],
        challenge: {
          prompt: "Run the code. Then change the name and goal variables to your own values and run it again.",
          starterCode: `let name = "Stanley"\nlet goal = "financial freedom"\nlet year = 2026\n\nconsole.log("Name:", name)\nconsole.log("Goal:", goal)\nconsole.log("Year:", year)\nconsole.log("Let's get it!")`,
          whatItDoes: "JavaScript displays your variables with console.log(). Same concept as Python's print() — just different syntax.",
          check: (output) => output.length > 0 && output.includes("\n"),
        },
      },
      {
        id: "js-functions", title: "JavaScript Functions", xp: 100, analogy: "Think of a vending machine button", language: "javascript",
        theory: [
          { type: "plain", text: "A vending machine button is a function. Press B3 → get chips. The machine does the same thing every time you press that button. You built the machine once, now just press the button." },
          { type: "highlight", text: "JavaScript functions use the 'function' keyword instead of Python's 'def'. Everything else is the same idea." },
          { type: "code", label: "JAVASCRIPT vs PYTHON", color: "#fcd34d", code: `function calculatePay(hours, rate) {\n  return hours * rate\n}\n\nconsole.log(calculatePay(40, 75))  // 3000\nconsole.log(calculatePay(20, 100)) // 2000` },
          { type: "plain", text: "JavaScript uses curly braces { } to wrap the function body. Python uses indentation. Both work the same way — they're just different styles." },
        ],
        hints: ["Start with: function greet(name) {", "Inside the curly braces: return 'Hello, ' + name", "Close with } then test it: console.log(greet('Stanley'))"],
        challenge: {
          prompt: "Write a JavaScript function called 'greet' that takes a name and returns 'Hello, ' + name. Then call it with your own name.",
          starterCode: `function greet(name) {\n  return "Hello, " + name\n}\n\nconsole.log(greet("Stanley"))\nconsole.log(greet("World"))\n\nfunction weeklyPay(hours, rate) {\n  return hours * rate\n}\n\nconsole.log("Weekly pay: $" + weeklyPay(40, 75))`,
          whatItDoes: "You built two reusable JavaScript functions. Same concept as Python functions — different syntax.",
          check: (output) => output.includes("Hello") || output.length > 0,
        },
      },
      {
        id: "js-dom", title: "The DOM — Controlling Websites", xp: 150, analogy: "Think of a TV remote", language: "javascript",
        theory: [
          { type: "plain", text: "A TV remote controls what's on screen without touching the TV itself. The DOM (Document Object Model) is JavaScript's remote control for a webpage." },
          { type: "highlight", text: "The DOM is what makes websites interactive. Every button click, form update, popup, and animation uses the DOM. This is where JavaScript gets its real power." },
          { type: "code", label: "JAVASCRIPT — DOM Manipulation", color: "#fcd34d", code: `const title = document.getElementById("main-title")\ntitle.textContent = "Hello World!"\ntitle.style.color = "green"\ntitle.style.fontSize = "32px"\n\nconst btn = document.getElementById("my-button")\nbtn.addEventListener("click", function() {\n  alert("Button clicked!")\n})` },
          { type: "plain", text: "This is what separates JavaScript from Python. Python runs on servers. JavaScript runs IN the browser and can change what the user sees in real time — no page reload needed." },
          { type: "plain", text: "Real money use: a client pays you $500 to make their contact form work. That form is 20 lines of JavaScript using the DOM." },
        ],
        hints: ["document.getElementById() finds an element by its id attribute", "Use .textContent to change the text of an element", "Use .addEventListener('click', function(){}) to respond to clicks"],
        challenge: {
          prompt: "Run this code and see how JavaScript can build interactive content. Then change the message and colors to make it your own.",
          starterCode: `function buildWebpage() {\n  let title = "Welcome to CodeGrind"\n  let color = "green"\n  let buttonText = "Start Learning"\n  \n  console.log("Page Title:", title)\n  console.log("Title Color:", color)\n  console.log("Button:", buttonText)\n  console.log("")\n  console.log("User clicked the button...")\n  console.log("Showing lesson 1!")\n}\n\nbuildWebpage()`,
          whatItDoes: "In a real browser this code would change visible elements on a webpage. The DOM is JavaScript's superpower — it makes static pages come alive.",
          check: (output) => output.includes("Title") || output.includes("Page") || output.length > 0,
        },
      },
      {
        id: "js-arrays", title: "Arrays — JavaScript Lists", xp: 100, analogy: "Think of a playlist", language: "javascript",
        theory: [
          { type: "plain", text: "A music playlist holds multiple songs in order. You can add songs, remove them, skip to a specific one, or play them all in sequence. JavaScript arrays work exactly the same way." },
          { type: "highlight", text: "JavaScript arrays are like Python lists — same concept, slightly different syntax. Square brackets [ ], comma-separated items." },
          { type: "code", label: "JAVASCRIPT", color: "#fcd34d", code: `let clients = ["Marcus", "Tamika", "DeShawn"]\n\nconsole.log(clients[0])  // Marcus\n\nclients.push("Keisha")\nconsole.log(clients)\n\nfor (let i = 0; i < clients.length; i++) {\n  console.log("Invoice sent to:", clients[i])\n}` },
          { type: "plain", text: "Python uses .append() to add items. JavaScript uses .push(). Python uses len() for length. JavaScript uses .length. Same ideas, different words." },
        ],
        hints: ["Create an array: let skills = ['JavaScript', 'Python', 'HTML']", "Add items with .push('new item')", "Loop: for (let i = 0; i < skills.length; i++) { console.log(skills[i]) }"],
        challenge: {
          prompt: "Create a JavaScript array of your top 3 coding skills. Add one more with .push(). Loop through and print each one.",
          starterCode: `let skills = ["JavaScript", "Python", "Automation"]\n\nskills.push("Web Scraping")\n\nconsole.log("My skills:")\nfor (let i = 0; i < skills.length; i++) {\n  console.log((i + 1) + ".", skills[i])\n}\n\nconsole.log("Total skills:", skills.length)`,
          whatItDoes: "You managed a dynamic JavaScript array — adding items and looping through them. This is how web apps manage shopping carts, user lists, and data.",
          check: (output) => output.split("\n").filter(Boolean).length >= 3,
        },
      },
      {
        id: "js-events", title: "Events — Making Pages Interactive", xp: 150, analogy: "Think of a doorbell", language: "javascript",
        theory: [
          { type: "plain", text: "A doorbell just waits. When someone presses it, it rings. It doesn't ring on its own — it reacts to something happening. JavaScript events work the same way." },
          { type: "highlight", text: "Events let your code REACT to what users do — clicks, typing, scrolling, hovering. This is the foundation of all interactive websites." },
          { type: "code", label: "JAVASCRIPT — Common Events", color: "#fcd34d", code: `btn.addEventListener("click", function() {\n  console.log("Button was clicked!")\n})\n\ninput.addEventListener("input", function() {\n  console.log("User typed:", input.value)\n})\n\nform.addEventListener("submit", function(e) {\n  e.preventDefault()\n  console.log("Form submitted!")\n})` },
          { type: "plain", text: "Every time you filled out a contact form on a website, clicked a buy button, or saw an error message appear as you typed — that was JavaScript events in action." },
          { type: "plain", text: "A client paying $800 for a working contact form is really paying for 3 event listeners. That's the value of knowing this." },
        ],
        hints: ["addEventListener takes two arguments: the event name in quotes, then a function", "Common events: 'click', 'input', 'submit', 'mouseover'", "The function inside runs every time that event happens"],
        challenge: {
          prompt: "Simulate an event system. Create a function that handles different user actions and logs what happened.",
          starterCode: `function handleEvent(eventType, data) {\n  if (eventType === "click") {\n    console.log("Button clicked! Data:", data)\n  } else if (eventType === "input") {\n    console.log("User typed:", data)\n  } else if (eventType === "submit") {\n    console.log("Form submitted with:", data)\n  }\n}\n\nhandleEvent("click", "Submit Button")\nhandleEvent("input", "Stanley White")\nhandleEvent("submit", "stanleywhiteiii87@gmail.com")\nhandleEvent("click", "Buy Now Button")`,
          whatItDoes: "You built an event handler system. In a real browser this would respond to actual user interactions — clicks, typing, form submissions.",
          check: (output) => output.split("\n").filter(Boolean).length >= 3,
        },
      },
    ],
  },
  {
    id: "money", title: "Real Money Paths", icon: "💰", color: "#fbbf24",
    lessons: [
      {
        id: "tip-calculator", title: "Mini Project — Tip Calculator", xp: 200, analogy: "Think of your first real tool",
        theory: [
          { type: "plain", text: "You've learned variables, math, functions, and if statements. Now it's time to combine them into something real that people actually use every day." },
          { type: "highlight", text: "This is your first complete Python project. It uses everything you've learned so far — in one working tool." },
          { type: "code", label: "PYTHON — Tip Calculator", color: "#fbbf24", code: `def calculate_tip(bill, tip_percent, people):\n    tip_amount = bill * (tip_percent / 100)\n    total = bill + tip_amount\n    per_person = total / people\n    return tip_amount, total, per_person\n\ntip, total, each = calculate_tip(85.50, 20, 4)\nprint("Tip amount: $", round(tip, 2))\nprint("Total bill: $", round(total, 2))\nprint("Each person pays: $", round(each, 2))` },
          { type: "plain", text: "This script uses: variables, math operators, functions, parameters, return values, and rounding. That's 6 concepts working together — you know all of them." },
          { type: "plain", text: "This is exactly the kind of tool small restaurants pay $50-200 for. A working tip calculator with tax, split by party size — you could sell this on Fiverr today." },
        ],
        hints: ["The function takes bill amount, tip percentage, and number of people", "tip_amount = bill * (tip_percent / 100) — divide by 100 to convert percent to decimal", "Use round(number, 2) to round to 2 decimal places for money"],
        challenge: {
          prompt: "Run the tip calculator. Then modify it to also include an 8% tax. Print the tax amount separately. Change the values to a real dinner you've had.",
          starterCode: `def calculate_tip(bill, tip_percent, tax_percent, people):\n    tip_amount = bill * (tip_percent / 100)\n    tax_amount = bill * (tax_percent / 100)\n    total = bill + tip_amount + tax_amount\n    per_person = total / people\n    \n    print("=== BILL BREAKDOWN ===")\n    print("Original bill: $", bill)\n    print("Tip (", tip_percent, "%): $", round(tip_amount, 2))\n    print("Tax (", tax_percent, "%): $", round(tax_amount, 2))\n    print("Total: $", round(total, 2))\n    print("Each person pays: $", round(per_person, 2))\n\ncalculate_tip(\n    bill=85.50,\n    tip_percent=20,\n    tax_percent=8,\n    people=4\n)`,
          whatItDoes: "A complete bill splitting tool with tip and tax. This is a real sellable product — restaurants, event planners, and groups pay for tools like this.",
          check: (output) => (output.includes("$") && output.includes("Total")) || output.includes("bill"),
        },
      },
      {
        id: "freelance-math", title: "The Freelance Math", xp: 150, analogy: "Think of a skilled trade",
        theory: [
          { type: "plain", text: "A plumber doesn't build the whole city's water system. They solve the problem in front of them — and get paid well for that skill. Coding is the same." },
          { type: "highlight", text: "You don't need to know everything. You need to know enough to solve problems people will pay for." },
          { type: "list", items: ["📊 Automate spreadsheets → $50–100/hr", "🤖 Build simple chatbots → $500–2,000/project", "🌐 Simple websites → $500–3,000/project", "📧 Email automation → $200–800/project", "📱 Data entry automation → $300–1,000/project"] },
          { type: "plain", text: "Where to find these jobs: Fiverr, Upwork, or just telling people you know. Most small business owners have no idea what simple automation can do for them." },
        ],
        hints: ["Change hourly_rate and hours_per_week to numbers that match your real goals.", "The calculation is just multiplication: hourly_rate * hours_per_week * weeks_per_year", "Run it, then try different numbers — what if you charged $100/hr instead of $75?"],
        challenge: {
          prompt: "Run this income calculator. Then change the numbers to match your own goals and see what your first year could look like.",
          starterCode: `hourly_rate = 75\nhours_per_week = 20\nweeks_per_year = 48\n\nprojects_per_month = 2\navg_project_price = 800\n\nhourly_annual = hourly_rate * hours_per_week * weeks_per_year\nproject_annual = projects_per_month * avg_project_price * 12\ntotal = hourly_annual + project_annual\n\nprint("=== YOUR FIRST YEAR ESTIMATE ===")\nprint("Hourly work income: $", hourly_annual)\nprint("Project income: $", project_annual)\nprint("TOTAL POTENTIAL: $", total)`,
          whatItDoes: "Real math on real income. Change any variable and re-run to see how your income shifts.",
          check: (output) => output.includes("$") || output.includes("TOTAL"),
        },
      },
    ],
  },
  {
    id: "premium-python", title: "Premium — Python Pro", icon: "🐍", color: "#34d399",
    lessons: [
      {
        id: "csv-files", title: "Reading CSV Files — Real Data", xp: 200, analogy: "Think of opening a spreadsheet",
        theory: [
          { type: "plain", text: "Almost every business runs on spreadsheets. Sales data, customer lists, inventory — all stored as CSV files. Python can open, read, and process thousands of rows in seconds." },
          { type: "highlight", text: "CSV stands for Comma Separated Values. Python's csv module reads them instantly." },
          { type: "code", label: "PYTHON", color: "#6ee7b7", code: `import csv\n\nwith open("sales.csv", "r") as file:\n    reader = csv.DictReader(file)\n    for row in reader:\n        print(row["name"], row["amount"])` },
          { type: "plain", text: "Real money: A client gives you a 10,000 row sales CSV. They want totals by region. Without Python — 4 hours of manual work. With Python — 10 lines of code, done in 30 seconds. They pay you $150." },
        ],
        hints: ["Import csv at the top: import csv", "Use with open('file.csv', 'r') as file: to open it safely", "csv.DictReader gives you each row as a dictionary with column names as keys"],
        challenge: {
          prompt: "Write a script that creates a CSV file with 3 sales records, then reads it back and prints each row with a total.",
          starterCode: `import csv\n\nwith open("sales.csv", "w", newline="") as file:\n    writer = csv.writer(file)\n    writer.writerow(["name", "amount", "region"])\n    writer.writerow(["Marcus", 500, "South"])\n    writer.writerow(["Tamika", 750, "East"])\n    writer.writerow(["DeShawn", 300, "West"])\n\nprint("CSV created!")\n\nwith open("sales.csv", "r") as file:\n    reader = csv.DictReader(file)\n    total = 0\n    for row in reader:\n        print(row["name"], "sold $" + row["amount"])\n        total += int(row["amount"])\n\nprint("Total sales: $", total)`,
          whatItDoes: "You created and read a real CSV file. Processing sales data is one of the most requested Python freelance tasks.",
          check: (output) => output.includes("CSV") || output.includes("sold") || output.includes("Total"),
        },
      },
      {
        id: "web-scraping", title: "Web Scraping — Get Any Data", xp: 225, analogy: "Think of a research assistant",
        theory: [
          { type: "plain", text: "A research assistant can visit any website, read the content, and bring back exactly the information you asked for. Web scraping is your automated research assistant." },
          { type: "highlight", text: "Web scraping means writing Python code that visits a website and extracts specific data automatically — prices, names, listings, anything visible on the page." },
          { type: "code", label: "PYTHON", color: "#6ee7b7", code: `import requests\nfrom bs4 import BeautifulSoup\n\nurl = "https://example.com"\nresponse = requests.get(url)\nsoup = BeautifulSoup(response.text, "html.parser")\n\ntitle = soup.find("h1").text\nlinks = soup.find_all("a")\n\nprint("Page title:", title)\nfor link in links:\n    print(link.text, link["href"])` },
          { type: "plain", text: "Real money: Businesses pay $300-1,500 for scripts that monitor competitor prices, scrape job listings, collect leads, or track product availability." },
          { type: "plain", text: "Note: Always check a website's terms of service before scraping. Most public data is fair game. Never scrape private or personal data." },
        ],
        hints: ["import requests gets the webpage. BeautifulSoup parses the HTML.", "soup.find('tag') finds the first element. soup.find_all('tag') finds all of them.", "Use .text to get the text content of an element."],
        challenge: {
          prompt: "Write a web scraper that fetches 'https://books.toscrape.com' and prints the page title and first 5 book titles.",
          starterCode: `import requests\nfrom bs4 import BeautifulSoup\n\nurl = "https://books.toscrape.com"\nresponse = requests.get(url)\nsoup = BeautifulSoup(response.text, "html.parser")\n\ntitle = soup.find("title").text\nprint("Page:", title)\n\nbooks = soup.find_all("h3")\nprint("\\nFirst 5 books:")\nfor book in books[:5]:\n    print("-", book.find("a")["title"])`,
          whatItDoes: "You scraped a real website and extracted real data. books.toscrape.com is a practice site made for scraping — safe and legal to use.",
          check: (output) => output.length > 0 && (output.includes("Page") || output.includes("book") || output.includes("-")),
        },
      },
      {
        id: "working-with-apis", title: "APIs — Getting Live Data", xp: 225, analogy: "Think of a waiter",
        theory: [
          { type: "plain", text: "A waiter takes your order to the kitchen and brings back your food. You don't go into the kitchen yourself — the waiter is the middleman. An API is that waiter between your code and someone else's data." },
          { type: "highlight", text: "An API (Application Programming Interface) lets your code request data from another service — weather, stock prices, news, anything. You send a request, they send data back." },
          { type: "code", label: "PYTHON", color: "#6ee7b7", code: `import requests\n\nurl = "https://official-joke-api.appspot.com/random_joke"\nresponse = requests.get(url)\njoke = response.json()\n\nprint("Setup:", joke["setup"])\nprint("Punchline:", joke["punchline"])` },
          { type: "plain", text: "Real money: Every app that shows weather, maps, prices, or news uses APIs. Developers who know how to connect to APIs are worth $75-150/hr. This is a core skill." },
        ],
        hints: ["requests.get(url) fetches data from a URL", "response.json() converts the response to a Python dictionary", "Use ['key'] to access specific values in the dictionary"],
        challenge: {
          prompt: "Call the free joke API at 'https://official-joke-api.appspot.com/random_joke' and print the setup and punchline of a random joke.",
          starterCode: `import requests\n\nurl = "https://official-joke-api.appspot.com/random_joke"\nresponse = requests.get(url)\njoke = response.json()\n\nprint("Setup:", joke["setup"])\nprint("Punchline:", joke["punchline"])\nprint("\\nType:", joke["type"])`,
          whatItDoes: "You called a real live API and got real data back. This exact pattern — request URL, parse JSON, use the data — works with any API in the world.",
          check: (output) => output.includes("Setup") || output.includes("Punchline") || output.length > 0,
        },
      },
      {
        id: "automate-email", title: "Automate Emails with Python", xp: 250, analogy: "Think of a mail merge",
        theory: [
          { type: "plain", text: "Mail merge lets you send the same letter to 1,000 people with their name personalized. Python does the same thing — but faster, smarter, and fully automated." },
          { type: "highlight", text: "Python can send emails automatically using the smtplib module. Write once, send to thousands. This is one of the most requested automation skills." },
          { type: "code", label: "PYTHON", color: "#6ee7b7", code: `import smtplib\nfrom email.mime.text import MIMEText\n\ndef send_email(to_email, subject, body, from_email, password):\n    msg = MIMEText(body, "html")\n    msg["Subject"] = subject\n    msg["From"] = from_email\n    msg["To"] = to_email\n    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:\n        server.login(from_email, password)\n        server.send_message(msg)\n        print(f"Email sent to {to_email}")` },
          { type: "plain", text: "Note: For Gmail you need to enable 'App Passwords' in your Google account settings. This is safer than using your real password." },
          { type: "plain", text: "Real money: Small businesses pay $200-500 for a script that automatically sends invoices, appointment reminders, or follow-up emails. Write it once, they use it forever." },
        ],
        hints: ["smtplib handles the connection to Gmail's mail server", "MIMEText creates the email message — use 'html' for HTML, 'plain' for plain text", "Always use App Passwords, never your real Gmail password in code"],
        challenge: {
          prompt: "Write the email sending function and simulate sending to 3 clients by printing what would be sent instead of actually sending.",
          starterCode: `def simulate_email(to_email, subject, body):\n    print("=" * 40)\n    print(f"TO: {to_email}")\n    print(f"SUBJECT: {subject}")\n    print(f"BODY: {body}")\n    print("STATUS: Sent")\n    print("=" * 40)\n\nclients = [\n    {"name": "Marcus", "email": "marcus@example.com", "amount": 500},\n    {"name": "Tamika", "email": "tamika@example.com", "amount": 750},\n    {"name": "DeShawn", "email": "deshawn@example.com", "amount": 300},\n]\n\nfor client in clients:\n    subject = "Invoice from CodeGrind - $" + str(client["amount"]) + " due"\n    body = "Hi " + client["name"] + ", your invoice for $" + str(client["amount"]) + " is ready."\n    simulate_email(client["email"], subject, body)\n\nprint(str(len(clients)) + " invoices sent!")`,
          whatItDoes: "You built an automated invoice system. Replace simulate_email with the real send_email function and you have a script worth $200-500 to any small business.",
          check: (output) => output.includes("TO:") || output.includes("Sent") || output.includes("invoices"),
        },
      },
      {
        id: "classes-objects", title: "Classes — Blueprint for Everything", xp: 250, analogy: "Think of a blueprint",
        theory: [
          { type: "plain", text: "A blueprint for a house tells you exactly what every house built from it will have — bedrooms, bathrooms, a kitchen. Each actual house is different but follows the same plan." },
          { type: "highlight", text: "A class is a blueprint. An object is a house built from that blueprint. This is how real software organizes complex data and behavior." },
          { type: "code", label: "PYTHON", color: "#6ee7b7", code: `class Client:\n    def __init__(self, name, email, budget):\n        self.name = name\n        self.email = email\n        self.budget = budget\n    \n    def send_invoice(self, amount):\n        if amount <= self.budget:\n            print(f"Invoice sent to {self.name} for \${amount}")\n        else:\n            print(f"Amount exceeds {self.name}'s budget")\n\nclient1 = Client("Marcus", "marcus@gmail.com", 1000)\nclient2 = Client("Tamika", "tamika@gmail.com", 500)\n\nclient1.send_invoice(800)\nclient2.send_invoice(600)` },
          { type: "plain", text: "Every app you've ever used is built with classes. Users, products, orders, payments — all classes. Understanding this unlocks the ability to build real apps." },
        ],
        hints: ["__init__ is the constructor — it runs when you create a new object", "self refers to the object itself — use self.name to store data on the object", "Create objects: client = Client('Marcus', 'email', 1000)"],
        challenge: {
          prompt: "Create a FreelanceProject class with name, client, and rate properties. Add a calculate_cost method that takes hours and returns rate * hours. Create 2 projects and call the method.",
          starterCode: `class FreelanceProject:\n    def __init__(self, name, client, rate):\n        self.name = name\n        self.client = client\n        self.rate = rate\n    \n    def calculate_cost(self, hours):\n        total = self.rate * hours\n        print("Project:", self.name)\n        print("Client:", self.client)\n        print("Hours:", hours, "@ $" + str(self.rate) + "/hr")\n        print("Total: $" + str(total))\n        return total\n\nproject1 = FreelanceProject("Website Redesign", "Marcus Johnson", 75)\nproject2 = FreelanceProject("Automation Script", "Tamika Williams", 100)\n\nproject1.calculate_cost(20)\nprint()\nproject2.calculate_cost(8)`,
          whatItDoes: "You built a class that models real freelance work. This is how professional project management software works at its core.",
          check: (output) => output.includes("Project") || output.includes("Total") || output.includes("$"),
        },
      },
      {
        id: "regex", title: "Regex — Finding Patterns in Text", xp: 200, analogy: "Think of a search filter",
        theory: [
          { type: "plain", text: "When you search your email for messages containing a phone number, your email app uses pattern matching. Regex (Regular Expressions) is Python's built-in pattern matching tool." },
          { type: "highlight", text: "Regex lets you find, extract, and replace patterns in text — phone numbers, emails, dates, prices — anything with a consistent format." },
          { type: "code", label: "PYTHON", color: "#6ee7b7", code: `import re\n\ntext = "Call me at 404-555-1234 or email john@example.com"\n\nphone = re.findall(r"\\d{3}-\\d{3}-\\d{4}", text)\nprint("Phone:", phone)\n\nemail_pattern = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}"\nemails = re.findall(email_pattern, text)\nprint("Email:", emails)` },
          { type: "plain", text: "Real money: Data cleaning is a $50-100/hr skill. Extracting emails from text, validating phone numbers, parsing addresses — all regex. Businesses have mountains of messy data." },
        ],
        hints: ["import re at the top", "re.findall(pattern, text) returns a list of all matches", "\\d means any digit, {3} means exactly 3 of them"],
        challenge: {
          prompt: "Write a script that takes a contact list string and extracts all valid email addresses from it.",
          starterCode: `import re\n\nraw_data = "Contact list: John Smith jsmith@company.com, Tamika Jones tjones@business.net, Marcus Brown mbrown@startup.io, Invalid notanemail"\n\nemail_pattern = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}"\nemails = re.findall(email_pattern, raw_data)\n\nprint("Found", len(emails), "email addresses:")\nfor email in emails:\n    print(" -", email)`,
          whatItDoes: "You extracted structured data from messy text automatically. This exact task — cleaning client data — is one of the most requested Python freelance jobs.",
          check: (output) => output.includes("@") || output.includes("email") || output.includes("Found"),
        },
      },
      {
        id: "file-automation", title: "File Automation — Organize Anything", xp: 225, analogy: "Think of a filing clerk",
        theory: [
          { type: "plain", text: "A filing clerk manually sorts hundreds of documents into folders by type, date, or client. It takes hours. Python can sort thousands of files in seconds." },
          { type: "highlight", text: "Python's os and shutil modules let you create folders, move files, rename them, and organize your entire file system automatically." },
          { type: "code", label: "PYTHON", color: "#6ee7b7", code: `import os\nimport shutil\n\nos.makedirs("organized/images", exist_ok=True)\nos.makedirs("organized/documents", exist_ok=True)\n\nfor filename in os.listdir("."):\n    if filename.endswith(".jpg") or filename.endswith(".png"):\n        shutil.move(filename, "organized/images/" + filename)\n        print(f"Moved {filename} to images folder")` },
          { type: "plain", text: "Real money: A small business owner has 3 years of unsorted invoice PDFs. You write a 20-line script that sorts them by year and client. They pay you $200. Takes you 30 minutes." },
        ],
        hints: ["os.makedirs creates folders — exist_ok=True means don't error if it already exists", "os.listdir('.') lists all files in the current folder", "shutil.move(source, destination) moves a file"],
        challenge: {
          prompt: "Write a script that creates 3 folders (reports, invoices, misc) and simulates sorting 5 files into them based on their names.",
          starterCode: `import os\n\nfolders = ["reports", "invoices", "misc"]\nfor folder in folders:\n    os.makedirs(folder, exist_ok=True)\n    print("Created folder:", folder)\n\nfiles = [\n    "report_jan_2026.pdf",\n    "invoice_marcus_001.pdf",\n    "notes.txt",\n    "report_feb_2026.pdf",\n    "invoice_tamika_002.pdf"\n]\n\nfor filename in files:\n    if "report" in filename:\n        destination = "reports/" + filename\n    elif "invoice" in filename:\n        destination = "invoices/" + filename\n    else:\n        destination = "misc/" + filename\n    print("Sorted:", filename, "->", destination)`,
          whatItDoes: "You built a file sorting system. Connect this to shutil.move() and it physically moves real files. This script alone is worth $150-300 to any disorganized small business.",
          check: (output) => output.includes("folder") || output.includes("Sorted") || output.includes("Created"),
        },
      },

      {
        id: "json-data", title: "Working with JSON", xp: 200, analogy: "Think of a digital form",
        theory: [
          { type: "plain", text: "Every time you use an app that loads data from the internet that data comes back as JSON. It is the universal language apps use to talk to each other." },
          { type: "highlight", text: "JSON is the universal language apps use to talk to each other. Python reads and writes it instantly." },
          { type: "code", label: "PYTHON", color: "#6ee7b7", code: `import json\n\ndata = {"name": "Stanley", "skills": ["Python", "JavaScript"]}\njson_string = json.dumps(data)\nprint("JSON:", json_string)\nparsed = json.loads(json_string)\nprint("Name:", parsed["name"])` },
        ],
        hints: ["import json at the top", "json.dumps() converts a dict to JSON string", "json.loads() converts JSON string back to dict"],
        challenge: {
          prompt: "Create a profile dictionary, save it as JSON to a file, read it back, and print your name and goal.",
          starterCode: `import json\n\nprofile = {\n    "name": "Stanley White",\n    "goal": "Financial Freedom",\n    "skills": ["Python", "JavaScript"],\n    "target": 100000\n}\n\nwith open("profile.json", "w") as f:\n    json.dump(profile, f)\nprint("Saved!")\n\nwith open("profile.json", "r") as f:\n    loaded = json.load(f)\nprint("Name:", loaded["name"])\nprint("Goal:", loaded["goal"])`,
          whatItDoes: "You saved and loaded real JSON data exactly how apps store user profiles.",
          check: (output) => output.includes("Name:") || output.includes("Saved"),
        },
      },
      {
        id: "flask-basics", title: "Flask — Build Your First Web Server", xp: 275, analogy: "Think of a restaurant kitchen",
        theory: [
          { type: "plain", text: "A restaurant kitchen receives orders, prepares food, and sends it back out. A web server does the exact same thing." },
          { type: "highlight", text: "Flask is a Python library that lets you build web servers and APIs in just a few lines of code." },
          { type: "code", label: "PYTHON", color: "#6ee7b7", code: `from flask import Flask, jsonify\n\napp = Flask(__name__)\n\n@app.route("/")\ndef home():\n    return "Hello from your Python server!"\n\n@app.route("/api/profile")\ndef profile():\n    return jsonify({"name": "Stanley", "rate": "$75/hr"})` },
        ],
        hints: ["Install Flask: pip install flask", "@app.route() defines a URL endpoint", "jsonify() converts a Python dict to a JSON response"],
        challenge: {
          prompt: "Simulate a Flask app with 3 routes. Call each function and print the responses.",
          starterCode: `def home():\n    return "Hello from your Python server!"\n\ndef api_profile():\n    return {"name": "Stanley White", "skills": ["Python", "Flask"], "rate": "$75/hr"}\n\ndef api_services():\n    return {"services": ["Websites", "Automation", "Chatbots"], "starting_at": "$200"}\n\nroutes = {"/": home, "/api/profile": api_profile, "/api/services": api_services}\n\nprint("=== FLASK SERVER SIMULATION ===")\nfor route, handler in routes.items():\n    print("\\nGET", route)\n    print("Response:", handler())`,
          whatItDoes: "You simulated a real Flask web server with multiple routes.",
          check: (output) => output.includes("FLASK") || output.includes("profile"),
        },
      },
      {
        id: "sqlite-basics", title: "SQLite — Simple Databases", xp: 250, analogy: "Think of a permanent spreadsheet",
        theory: [
          { type: "plain", text: "A spreadsheet breaks when you have thousands of rows. A database does everything faster and automatically." },
          { type: "highlight", text: "SQLite is built into Python. No setup needed. Just import and start storing data permanently." },
          { type: "code", label: "PYTHON", color: "#6ee7b7", code: `import sqlite3\n\nconn = sqlite3.connect("clients.db")\ncursor = conn.cursor()\ncursor.execute("CREATE TABLE IF NOT EXISTS clients (id INTEGER PRIMARY KEY, name TEXT, budget INTEGER)")\ncursor.execute("INSERT INTO clients (name, budget) VALUES (?, ?)", ("Marcus", 2500))\nconn.commit()\ncursor.execute("SELECT * FROM clients")\nprint(cursor.fetchall())\nconn.close()` },
        ],
        hints: ["sqlite3 is built into Python", "CREATE TABLE makes a table. INSERT adds data. SELECT retrieves it.", "Always commit() after inserting and close() when done"],
        challenge: {
          prompt: "Create a freelance.db with a projects table. Insert 3 projects and print them all.",
          starterCode: `import sqlite3\n\nconn = sqlite3.connect("freelance.db")\ncursor = conn.cursor()\ncursor.execute("CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY, client TEXT, service TEXT, amount INTEGER, status TEXT)")\n\nprojects = [("Marcus", "Website", 1500, "completed"), ("Tamika", "Automation", 800, "in progress"), ("DeShawn", "Chatbot", 1200, "completed")]\n\nfor p in projects:\n    cursor.execute("INSERT INTO projects (client, service, amount, status) VALUES (?, ?, ?, ?)", p)\nconn.commit()\n\nprint("=== FREELANCE DATABASE ===")\ncursor.execute("SELECT * FROM projects")\nfor row in cursor.fetchall():\n    print("Client:", row[1], "| Service:", row[2], "| $" + str(row[3]), "| Status:", row[4])\n\ncursor.execute("SELECT SUM(amount) FROM projects WHERE status = \'completed\'")\nprint("Total earned: $", cursor.fetchone()[0])\nconn.close()`,
          whatItDoes: "You built a real database that stores freelance project data permanently.",
          check: (output) => output.includes("DATABASE") || output.includes("Client:") || output.includes("Total"),
        },
      },
      {
        id: "virtual-environments", title: "Virtual Environments — Professional Python Setup", xp: 175, analogy: "Think of separate toolboxes for each job",
        theory: [
          { type: "plain", text: "A plumber keeps different toolboxes for different jobs. Virtual environments do the same for Python projects." },
          { type: "highlight", text: "A virtual environment is an isolated Python setup for each project. Professional developers always use them." },
          { type: "code", label: "TERMINAL", color: "#6ee7b7", code: `python3 -m venv myproject\nsource myproject/bin/activate\npip install flask requests pandas\npip freeze > requirements.txt\ndeactivate` },
        ],
        hints: ["python3 -m venv name creates the environment", "source name/bin/activate turns it on", "pip freeze > requirements.txt saves all your packages"],
        challenge: {
          prompt: "Simulate a virtual environment setup by printing each step and what it does.",
          starterCode: `steps = [\n    ("python3 -m venv codegrind_env", "Creates an isolated Python environment"),\n    ("source codegrind_env/bin/activate", "Activates the environment"),\n    ("pip install flask requests pandas", "Installs packages only in this environment"),\n    ("pip freeze > requirements.txt", "Saves package list so others can replicate"),\n    ("deactivate", "Turns off the environment when done")\n]\n\nprint("=== VIRTUAL ENVIRONMENT SETUP ===")\nfor command, explanation in steps:\n    print("$ " + command)\n    print("  ->", explanation)\n    print()\n\nprint("Your project is now professionally set up!")`,
          whatItDoes: "Virtual environments are standard practice in professional Python development.",
          check: (output) => output.includes("VIRTUAL") || output.includes("professionally"),
        },
      },
      {
        id: "pandas-intro", title: "Pandas — Data Analysis Like a Pro", xp: 275, analogy: "Think of a supercharged spreadsheet",
        theory: [
          { type: "plain", text: "Excel crashes with large datasets. Pandas handles millions of rows in seconds." },
          { type: "highlight", text: "Pandas is the most in-demand Python library for data work. It reads CSVs, Excel files, and databases instantly." },
          { type: "code", label: "PYTHON", color: "#6ee7b7", code: `import pandas as pd\n\ndf = pd.read_csv("sales.csv")\nprint(df.head())\nprint("Total:", df["amount"].sum())\nprint("Average:", df["amount"].mean())` },
        ],
        hints: ["Install: pip install pandas", "pd.read_csv() loads a CSV into a DataFrame", "Use .sum(), .mean(), .groupby() to analyze"],
        challenge: {
          prompt: "Create a pandas DataFrame with sales data, calculate totals and averages, and find the top performer.",
          starterCode: `import pandas as pd\n\ndata = {\n    "name": ["Marcus", "Tamika", "DeShawn", "Keisha", "Jerome"],\n    "sales": [1500, 2200, 900, 3100, 1800],\n    "region": ["South", "East", "West", "East", "South"]\n}\n\ndf = pd.DataFrame(data)\nprint("=== SALES REPORT ===")\nprint(df.to_string(index=False))\nprint("\\nTotal sales: $", df["sales"].sum())\nprint("Average sale: $", df["sales"].mean())\nprint("Top performer:", df.loc[df["sales"].idxmax(), "name"])`,
          whatItDoes: "You analyzed a sales dataset with pandas exactly what data freelancers get paid for.",
          check: (output) => output.includes("SALES") || output.includes("Total") || output.includes("performer"),
        },
      },
      {
        id: "mini-project-scraper", title: "Mini Project — Price Tracker", xp: 300, analogy: "Think of a personal shopper",
        theory: [
          { type: "plain", text: "A personal shopper checks multiple stores to find the best price on what you want. A price tracker does this automatically — checking any website and alerting you when the price drops." },
          { type: "highlight", text: "This project combines requests, BeautifulSoup, CSV files, and functions into one real tool. This is the kind of project that gets you hired." },
          { type: "code", label: "PYTHON — Price Tracker Structure", color: "#fbbf24", code: `import csv\nfrom datetime import date\n\ndef save_price(product, price):\n    with open("prices.csv", "a", newline="") as f:\n        writer = csv.writer(f)\n        writer.writerow([date.today(), product, price])\n    print(f"Saved: {product} = {price} on {date.today()}")` },
          { type: "plain", text: "This exact type of tool is requested constantly on Fiverr. 'Track prices for my Amazon products' — $300-1,000 per project." },
        ],
        hints: ["Run the starter code first to see how the structure works", "The save_price function appends to a CSV each time it runs", "In production you'd schedule this to run every hour with a cron job"],
        challenge: {
          prompt: "Build the price tracker. Simulate checking 3 products and saving their prices to a CSV file. Print a summary at the end.",
          starterCode: `import csv\nfrom datetime import date\n\ndef save_price(product, price, url):\n    with open("price_history.csv", "a", newline="") as f:\n        writer = csv.writer(f)\n        writer.writerow([date.today(), product, price, url])\n\ndef check_prices(products):\n    print("=== PRICE TRACKER RUNNING ===")\n    print("Date:", str(date.today()))\n    print()\n    for product in products:\n        print("Checking:", product["name"])\n        print("  URL:", product["url"])\n        print("  Price:", product["simulated_price"])\n        save_price(product["name"], product["simulated_price"], product["url"])\n        print("  Saved to CSV")\n        print()\n    print("Tracked", len(products), "products.")\n\nmy_products = [\n    {"name": "Python Book", "url": "amazon.com/python-book", "simulated_price": "$29.99"},\n    {"name": "Mechanical Keyboard", "url": "amazon.com/keyboard", "simulated_price": "$89.99"},\n    {"name": "Monitor Stand", "url": "amazon.com/stand", "simulated_price": "$45.00"},\n]\n\ncheck_prices(my_products)`,
          whatItDoes: "A complete price tracking system. Add real web scraping and schedule it to run daily and you have a $500 Fiverr product.",
          check: (output) => output.includes("TRACKER") || output.includes("Tracked") || output.includes("Price"),
        },
      },
    ],
  },
  {
    id: "premium-js", title: "Premium — JavaScript Pro", icon: "🌐", color: "#f59e0b",
    lessons: [
      {
        id: "js-objects", title: "JavaScript Objects", xp: 175, analogy: "Think of a contact card", language: "javascript",
        theory: [
          { type: "plain", text: "A contact card has labeled fields — Name, Phone, Email, Address. JavaScript objects work exactly the same way. Labels (keys) pointing to values." },
          { type: "highlight", text: "JavaScript objects are like Python dictionaries — key/value pairs. But in JS they're used everywhere. Every webpage element, user, and data structure is an object." },
          { type: "code", label: "JAVASCRIPT", color: "#fcd34d", code: `const client = {\n  name: "Marcus Johnson",\n  email: "marcus@gmail.com",\n  budget: 2500,\n  active: true,\n  sendInvoice: function(amount) {\n    console.log("Invoice sent to " + this.name + " for $" + amount)\n  }\n}\n\nconsole.log(client.name)\nconsole.log(client.budget)\nclient.sendInvoice(800)` },
          { type: "plain", text: "Notice the function inside the object — that's a method. Objects can contain data AND behavior. This is the foundation of object-oriented JavaScript." },
        ],
        hints: ["Create an object: const obj = { key: value, key2: value2 }", "Access properties with dot notation: obj.name", "Add functions inside objects — they're called methods"],
        challenge: {
          prompt: "Create a JavaScript object called 'myBusiness' with your name, service, rate, and a method called 'getQuote' that takes hours and logs the total cost.",
          starterCode: `const myBusiness = {\n  owner: "Stanley White",\n  service: "Web Development",\n  hourlyRate: 75,\n  \n  getQuote: function(hours) {\n    const total = this.hourlyRate * hours\n    console.log("Quote for " + this.service)\n    console.log("Hours: " + hours + " @ $" + this.hourlyRate + "/hr")\n    console.log("Total: $" + total)\n    return total\n  }\n}\n\nconsole.log("Business:", myBusiness.owner)\nconsole.log("Service:", myBusiness.service)\nconsole.log("")\nmyBusiness.getQuote(20)\nconsole.log("")\nmyBusiness.getQuote(40)`,
          whatItDoes: "You built a business object with a quote generator method. This is how real apps model data — users, products, orders are all objects like this.",
          check: (output) => output.includes("Quote") || output.includes("Total") || output.includes("$"),
        },
      },
      {
        id: "js-fetch", title: "Fetch API — Get Live Data in JavaScript", xp: 200, analogy: "Think of ordering delivery", language: "javascript",
        theory: [
          { type: "plain", text: "When you order food delivery you send a request — here's my order, my address. The restaurant prepares it and sends it back. fetch() works the same way — you send a request to a URL and get data back." },
          { type: "highlight", text: "fetch() is JavaScript's built-in tool for getting data from APIs. It's how every modern website loads dynamic content — news feeds, weather, prices, social media." },
          { type: "code", label: "JAVASCRIPT", color: "#fcd34d", code: `fetch("https://official-joke-api.appspot.com/random_joke")\n  .then(response => response.json())\n  .then(joke => {\n    console.log("Setup:", joke.setup)\n    console.log("Punchline:", joke.punchline)\n  })\n  .catch(error => {\n    console.log("Error:", error)\n  })` },
          { type: "plain", text: "The .then() chain handles the response. First convert to JSON, then use the data. The .catch() handles errors gracefully. This pattern is in every JavaScript app ever built." },
        ],
        hints: ["fetch(url) returns a Promise — you need .then() to handle the result", "First .then(response => response.json()) converts the response", "Second .then(data => ...) is where you use the actual data"],
        challenge: {
          prompt: "Use fetch() to get a random joke from the joke API and log the setup and punchline.",
          starterCode: `fetch("https://official-joke-api.appspot.com/random_joke")\n  .then(response => response.json())\n  .then(joke => {\n    console.log("Type:", joke.type)\n    console.log("Setup:", joke.setup)\n    console.log("Punchline:", joke.punchline)\n    console.log("---")\n    console.log("Joke ID:", joke.id)\n  })\n  .catch(error => {\n    console.log("Fetch failed:", error.message)\n  })`,
          whatItDoes: "You fetched live data from a real API using JavaScript. This exact pattern powers Twitter feeds, weather apps, stock tickers — everything dynamic on the web.",
          check: (output) => output.includes("Setup") || output.includes("Punchline") || output.length > 5,
        },
      },
      {
        id: "js-async-await", title: "Async/Await — Cleaner Code", xp: 200, analogy: "Think of waiting for food", language: "javascript",
        theory: [
          { type: "plain", text: "When you're at a restaurant you don't stand frozen at the counter waiting for your food. You go sit down, and when the food is ready it comes to you. Async/await works the same way." },
          { type: "highlight", text: "async/await is a cleaner way to write the same fetch code. Instead of chaining .then(), you write it like normal code that just waits at the right moments." },
          { type: "code", label: "JAVASCRIPT — Same result, cleaner code", color: "#fcd34d", code: `// Old way with .then()\nfetch(url).then(r => r.json()).then(data => console.log(data))\n\n// New way with async/await\nasync function getJoke() {\n  const response = await fetch("https://official-joke-api.appspot.com/random_joke")\n  const joke = await response.json()\n  console.log("Setup:", joke.setup)\n  console.log("Punchline:", joke.punchline)\n}\n\ngetJoke()` },
          { type: "plain", text: "The await keyword pauses that function until the data arrives — but doesn't freeze the whole app. This is how all modern JavaScript is written." },
        ],
        hints: ["Put async before the function keyword: async function myFunc()", "Put await before any operation that takes time: await fetch(url)", "Wrap in try/catch for error handling instead of .catch()"],
        challenge: {
          prompt: "Rewrite a fetch call using async/await. Create an async function that gets a joke and logs both the setup and punchline with try/catch error handling.",
          starterCode: `async function getRandomJoke() {\n  try {\n    const response = await fetch("https://official-joke-api.appspot.com/random_joke")\n    const joke = await response.json()\n    \n    console.log("Got a joke!")\n    console.log("Setup:", joke.setup)\n    console.log("Punchline:", joke.punchline)\n    \n    return joke\n  } catch (error) {\n    console.log("Something went wrong:", error.message)\n  }\n}\n\ngetRandomJoke()`,
          whatItDoes: "async/await makes asynchronous code readable. This is the standard way to write JavaScript in 2026 — every job posting expects you to know this.",
          check: (output) => output.includes("joke") || output.includes("Setup") || output.length > 5,
        },
      },

      {
        id: "js-local-storage", title: "Local Storage — Save Data in the Browser", xp: 175, analogy: "Think of a notepad the browser keeps", language: "javascript",
        theory: [
          { type: "plain", text: "When you close a tab and come back to a website and it still remembers you — that is Local Storage." },
          { type: "highlight", text: "Local Storage lets JavaScript save data permanently in the browser. No server needed." },
          { type: "code", label: "JAVASCRIPT", color: "#fcd34d", code: `localStorage.setItem("username", "Stanley")\nconst name = localStorage.getItem("username")\nconsole.log("Welcome back,", name)` },
        ],
        hints: ["localStorage.setItem('key', 'value') saves data", "localStorage.getItem('key') retrieves it", "Data is always stored as strings"],
        challenge: {
          prompt: "Simulate a Local Storage system that saves a user profile and updates the visit count.",
          starterCode: `const storage = {}\nfunction setItem(key, value) { storage[key] = String(value) }\nfunction getItem(key) { return storage[key] || null }\n\nsetItem("username", "Stanley White")\nsetItem("visits", "1")\nconsole.log("=== LOCAL STORAGE ===")\nconsole.log("User:", getItem("username"))\nconsole.log("Visits:", getItem("visits"))\nconst visits = parseInt(getItem("visits")) + 1\nsetItem("visits", visits)\nconsole.log("Updated visits:", getItem("visits"))`,
          whatItDoes: "You simulated browser Local Storage — the same system CodeGrind uses to save your XP.",
          check: (output) => output.includes("LOCAL") || output.includes("User:") || output.includes("visits"),
        },
      },
      {
        id: "js-form-validation", title: "Form Validation — Making Forms That Work", xp: 200, analogy: "Think of a bouncer checking IDs", language: "javascript",
        theory: [
          { type: "plain", text: "A bouncer checks every person before letting them in. Form validation checks every input before accepting it." },
          { type: "highlight", text: "Form validation is one of the most requested freelance JavaScript skills." },
          { type: "code", label: "JAVASCRIPT", color: "#fcd34d", code: `function validateForm(name, email, password) {\n  const errors = []\n  if (!name || name.length < 2) errors.push("Name too short")\n  if (!email.includes("@")) errors.push("Invalid email")\n  if (!password || password.length < 8) errors.push("Password too short")\n  return errors\n}` },
        ],
        hints: ["Check if fields are empty with !value", "Use .includes('@') to check email", "Return an array of errors — empty means valid"],
        challenge: {
          prompt: "Build a form validator that checks name, email, and password. Test with valid and invalid data.",
          starterCode: `function validateForm(name, email, password) {\n  const errors = []\n  if (!name || name.trim().length < 2) errors.push("Name must be at least 2 characters")\n  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/\n  if (!emailRegex.test(email)) errors.push("Please enter a valid email")\n  if (!password || password.length < 8) errors.push("Password must be at least 8 characters")\n  return errors\n}\n\nconst test1 = validateForm("Stanley White", "stanley@gmail.com", "mypassword123")\nconsole.log("Test 1:", test1.length === 0 ? "VALID" : test1)\n\nconst test2 = validateForm("S", "notanemail", "short")\nconsole.log("Test 2:", test2)`,
          whatItDoes: "A reusable form validator. Plug this into any website contact form.",
          check: (output) => output.includes("VALID") || output.includes("Test"),
        },
      },
      {
        id: "js-promises", title: "Promises — Handling Future Results", xp: 200, analogy: "Think of a restaurant buzzer", language: "javascript",
        theory: [
          { type: "plain", text: "When you get a buzzer at a restaurant the kitchen is making a promise — your food will be ready eventually." },
          { type: "highlight", text: "A Promise represents a value that will be available in the future. It is the foundation of all async JavaScript." },
          { type: "code", label: "JAVASCRIPT", color: "#fcd34d", code: `const myPromise = new Promise((resolve, reject) => {\n  const success = true\n  if (success) { resolve("Data loaded!") }\n  else { reject("Something went wrong") }\n})\nmyPromise.then(result => console.log(result)).catch(error => console.log("Error:", error))` },
        ],
        hints: ["new Promise((resolve, reject) => {}) creates a promise", "resolve() means success — reject() means failure", ".then() handles success — .catch() handles errors"],
        challenge: {
          prompt: "Create a Promise that loads user data by ID. Resolve if user exists, reject if not.",
          starterCode: `function loadUser(userId) {\n  return new Promise((resolve, reject) => {\n    const users = { 1: { name: "Stanley White", role: "Developer" }, 2: { name: "Marcus Johnson", role: "Designer" } }\n    const user = users[userId]\n    if (user) { resolve(user) } else { reject("User not found") }\n  })\n}\n\nloadUser(1).then(user => { console.log("Loaded:", user.name); console.log("Role:", user.role) }).catch(error => console.log("Error:", error))\nloadUser(99).then(user => console.log(user)).catch(error => console.log("Error:", error))`,
          whatItDoes: "You built a Promise-based data loader — the same pattern used in every real web app.",
          check: (output) => output.includes("Loaded:") || output.includes("Error:"),
        },
      },
      {
        id: "js-classes", title: "JavaScript Classes", xp: 225, analogy: "Think of a blueprint", language: "javascript",
        theory: [
          { type: "plain", text: "You learned Python classes already. JavaScript has them too — same concept, different syntax." },
          { type: "highlight", text: "JavaScript classes are used everywhere in modern web development." },
          { type: "code", label: "JAVASCRIPT", color: "#fcd34d", code: `class FreelanceClient {\n  constructor(name, budget) {\n    this.name = name\n    this.budget = budget\n  }\n  getQuote(hours) { return hours * 75 }\n}\nconst client = new FreelanceClient("Marcus", 2500)\nconsole.log(client.getQuote(20))` },
        ],
        hints: ["class Name { constructor() {} } creates a class", "this refers to the current object", "new ClassName() creates an instance"],
        challenge: {
          prompt: "Create a ShoppingCart class with addItem and getTotal methods. Test with 3 items.",
          starterCode: `class ShoppingCart {\n  constructor(owner) { this.owner = owner; this.items = [] }\n  addItem(name, price) { this.items.push({ name, price }); console.log("Added:", name, "- $" + price) }\n  getTotal() { return this.items.reduce((sum, item) => sum + item.price, 0) }\n  printReceipt() {\n    console.log("\\n=== RECEIPT FOR", this.owner, "===")\n    this.items.forEach(item => console.log(item.name + ": $" + item.price))\n    console.log("TOTAL: $" + this.getTotal())\n  }\n}\n\nconst cart = new ShoppingCart("Stanley White")\ncart.addItem("Python Course", 49)\ncart.addItem("VS Code Theme", 9)\ncart.addItem("Domain Name", 12)\ncart.printReceipt()`,
          whatItDoes: "You built a shopping cart class — the same pattern used in every e-commerce website.",
          check: (output) => output.includes("RECEIPT") || output.includes("TOTAL") || output.includes("Added:"),
        },
      },
      {
        id: "js-error-handling", title: "Error Handling in JavaScript", xp: 175, analogy: "Think of a safety net", language: "javascript",
        theory: [
          { type: "plain", text: "A trapeze artist always has a safety net. JavaScript error handling is that safety net for your code." },
          { type: "highlight", text: "try/catch in JavaScript works just like Python. Professional code always handles errors gracefully." },
          { type: "code", label: "JAVASCRIPT", color: "#fcd34d", code: `try {\n  const data = JSON.parse("invalid json")\n  console.log(data)\n} catch (error) {\n  console.log("Caught error:", error.message)\n}\nconsole.log("Program keeps running!")` },
        ],
        hints: ["Wrap risky code in try { }", "Handle errors in catch (error) { }", "error.message gives you a readable description"],
        challenge: {
          prompt: "Write a function that safely parses JSON and returns null if it fails. Test with valid and invalid strings.",
          starterCode: `function safeParseJSON(jsonString) {\n  try {\n    const result = JSON.parse(jsonString)\n    console.log("Parsed successfully")\n    return result\n  } catch (error) {\n    console.log("Parse failed:", error.message)\n    return null\n  }\n}\n\nconst valid = safeParseJSON('{"name": "Stanley", "goal": "Financial Freedom"}')\nconsole.log("Valid result:", valid ? valid.name : "null")\n\nconst invalid = safeParseJSON("this is not json")\nconsole.log("Invalid result:", invalid)`,
          whatItDoes: "A safe JSON parser that never crashes your app.",
          check: (output) => output.includes("Parsed") || output.includes("failed") || output.includes("Stanley"),
        },
      },
      {
        id: "js-mini-project", title: "Mini Project — Live Quote Generator", xp: 300, analogy: "Think of your first web app", language: "javascript",
        theory: [
          { type: "plain", text: "Everything you've learned in JavaScript comes together here — objects, fetch, async/await, functions, arrays. This is your first real JavaScript project." },
          { type: "highlight", text: "A quote generator fetches a random quote from an API and displays it. Simple concept — but it uses the same patterns as Twitter, Reddit, and any news feed." },
          { type: "code", label: "JAVASCRIPT — Quote Generator", color: "#fbbf24", code: `async function getQuote() {\n  try {\n    const response = await fetch("https://api.quotable.io/random")\n    const data = await response.json()\n    \n    console.log("\\n═══════════════════════")\n    console.log('"' + data.content + '"')\n    console.log("— " + data.author)\n    console.log("═══════════════════════")\n    \n    return data\n  } catch (error) {\n    console.log("Work hard in silence.")\n    console.log("— Stan White")\n  }\n}\n\ngetQuote()` },
          { type: "plain", text: "This project in a real browser would update a webpage in real time. Same logic, different output — replace console.log with innerHTML and it's a live webpage." },
        ],
        hints: ["async function getQuote() wraps everything in an async context", "await fetch(url) waits for the API response before continuing", "Use try/catch so if the API is down your app still works"],
        challenge: {
          prompt: "Run the quote generator. Then modify it to also show the quote length and tags. Add a second function that gets a quote by a specific author.",
          starterCode: `async function getQuote(author = null) {\n  try {\n    const url = author \n      ? "https://api.quotable.io/random?author=" + author\n      : "https://api.quotable.io/random"\n    \n    const response = await fetch(url)\n    const data = await response.json()\n    \n    console.log("\\n" + "─".repeat(50))\n    console.log('"' + data.content + '"')\n    console.log("  — " + data.author)\n    console.log("  Length:", data.length, "characters")\n    if (data.tags && data.tags.length > 0) {\n      console.log("  Tags:", data.tags.join(", "))\n    }\n    console.log("─".repeat(50))\n    \n  } catch (error) {\n    console.log("API unavailable — here\\'s a free one:")\n    console.log('"The secret of getting ahead is getting started."')\n    console.log("  — Mark Twain")\n  }\n}\n\nconsole.log("QUOTE GENERATOR")\ngetQuote()\ngetQuote()`,
          whatItDoes: "A real API-powered quote generator. In a browser this updates live HTML. On a server this powers an API endpoint. The logic is identical — only the output changes.",
          check: (output) => output.includes("GENERATOR") || output.includes("─") || output.length > 20,
        },
      },
    ],
  },
];

const ALL_LESSONS = CURRICULUM.flatMap((m) =>
  m.lessons.map((l) => ({ ...l, moduleId: m.id, moduleTitle: m.title, moduleColor: m.color }))
);

const ROADMAP = [
  { week: "Week 1–2", title: "The Foundation", skills: ["Variables", "Data types", "print statements", "Basic math in code"], milestone: "You can write your first real script", earn: null, color: "#00ff88" },
  { week: "Week 3–4", title: "Logic & Control", skills: ["If/else statements", "Loops", "Combining conditions", "Reading error messages"], milestone: "You can automate a repeated task", earn: null, color: "#00ff88" },
  { week: "Week 5–6", title: "Functions & Structure", skills: ["Writing functions", "Passing inputs", "Returning results", "Organizing code"], milestone: "You can build a reusable tool", earn: null, color: "#22d3ee" },
  { week: "Week 7–8", title: "Working With Data", skills: ["Lists", "Dictionaries", "Reading/writing files", "Simple CSV handling"], milestone: "You can process real data", earn: null, color: "#22d3ee" },
  { week: "Week 9–10", title: "First Money Skill", skills: ["Excel/CSV automation", "Report generator", "Command line basics"], milestone: "⭐ FIRST PAID SKILL — automate spreadsheets", earn: "$50–100/hr freelance rate", color: "#fbbf24" },
  { week: "Week 11–12", title: "Web Basics", skills: ["HTML basics", "CSS basics", "How websites work", "JavaScript intro"], milestone: "You understand how every website works", earn: null, color: "#a78bfa" },
  { week: "Week 13–16", title: "Build Your First Website", skills: ["JavaScript interactivity", "Forms and buttons", "Simple layouts", "Deploy a free site"], milestone: "⭐ SECOND PAID SKILL — build simple websites", earn: "$500–2,000/project", color: "#fbbf24" },
  { week: "Week 17–20", title: "Automation & APIs", skills: ["Web scraping", "Email automation", "Using free APIs", "Scheduling scripts"], milestone: "⭐ THIRD PAID SKILL — automation scripts", earn: "$300–1,500/project", color: "#fbbf24" },
  { week: "Week 21–24", title: "Your First App", skills: ["Front-end + back-end", "Simple databases", "User logins", "Deploying a real app"], milestone: "⭐ PORTFOLIO PROJECT", earn: "$1,000–5,000/project range unlocked", color: "#ff6b35" },
  { week: "Month 7–9", title: "Specialize & Scale", skills: ["Pick your lane", "Build 2–3 portfolio projects", "Set up Fiverr/Upwork", "First client outreach"], milestone: "🚀 FULL INCOME MODE", earn: "$3,000–8,000/month realistic target", color: "#ff6b35" },
];

// ─── PYODIDE CODE RUNNER ──────────────────────────────────────────────────────
function CodeRunner({ starterCode, whatItDoes, onPass, check, hints, onCodeChange, strikes, onStrike, onReviewNeeded, requiresChange }) {
  const [code, setCode] = useState(starterCode);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [passed, setPassed] = useState(false);
  const [codeChanged, setCodeChanged] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const pyodideRef = useRef(null);
  const [pyLoading, setPyLoading] = useState(false);

  const handleCodeChange = (val) => { setCode(val); if (onCodeChange) onCodeChange(val); if (requiresChange) setCodeChanged(val.trim() !== starterCode.trim()); };

  const loadPyodide = async () => {
    if (pyodideRef.current || pyLoading) return;
    setPyLoading(true);
    try {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js";
      document.head.appendChild(script);
      await new Promise((res) => { script.onload = res; });
      pyodideRef.current = await window.loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/" });
    } catch { setOutput("⚠️ Couldn't load Python. Check your connection and try again."); }
    setPyLoading(false);
  };

  useEffect(() => { loadPyodide(); }, []);

  const runCode = async () => {
    if (!pyodideRef.current) { setOutput("⏳ Python is still loading... try again in a moment."); return; }
    setRunning(true); setOutput("");
    try {
      let captured = "";
      pyodideRef.current.globals.set("print", (...args) => { captured += args.map(String).join(" ") + "\n"; });
      await pyodideRef.current.runPythonAsync(code);
      setOutput(captured || "(no output — make sure you have a print statement)");
      const didPass = check(captured);
      if (didPass && !passed) { setPassed(true); onPass(); }
      else if (!didPass) {
        const newStrikes = (strikes || 0) + 1;
        if (onStrike) onStrike(newStrikes);
        if (newStrikes >= 3 && onReviewNeeded) onReviewNeeded();
        else if (newStrikes < 3 && hints && newStrikes <= hints.length) {}
      }
    } catch (e) {
      const msg = String(e).replace(/Error: /g, "").split("\n")[0];
      setOutput("❌ Error: " + msg + "\n\n💡 Common fixes:\n  • Check your indentation (spaces matter in Python)\n  • Make sure quotes are closed\n  • Ask the AI tutor for help");
      const newStrikes = (strikes || 0) + 1;
      if (onStrike) onStrike(newStrikes);
      if (newStrikes >= 3 && onReviewNeeded) onReviewNeeded();
    }
    setRunning(false);
  };

  return (
    <div>
      <div style={{ background: "#0f1a0f", border: "1px solid #1a2a1a", borderRadius: "10px", padding: "14px", marginBottom: "12px" }}>
        <div style={{ fontSize: "10px", color: "#555", marginBottom: "6px", letterSpacing: "1px" }}>WHAT THIS CODE DOES:</div>
        <p style={{ fontSize: "12px", color: "#777", margin: 0, lineHeight: "1.7" }}>{whatItDoes}</p>
      </div>
      {strikes > 0 && strikes < 3 && (
        <div style={{ background: "#fbbf2410", border: "1px solid #fbbf2430", borderRadius: "8px", padding: "12px 14px", marginBottom: "10px" }}>
          <div style={{ fontSize: "11px", color: "#fbbf24", marginBottom: "4px" }}>⚠️ ATTEMPT {strikes}/3 — Hint {strikes}:</div>
          <p style={{ fontSize: "13px", color: "#d4a500", margin: 0, lineHeight: "1.6" }}>{hints && hints[strikes - 1]}</p>
        </div>
      )}
      <div style={{ fontSize: "10px", color: "#3b82f6", marginBottom: "6px", letterSpacing: "1px" }}>🐍 YOUR CODE:</div>
      <textarea value={code} onChange={(e) => handleCodeChange(e.target.value)}
        style={{ width: "100%", minHeight: "160px", background: "#0d1117", border: `1px solid ${strikes >= 2 ? "#ff444440" : "#1f2937"}`, borderRadius: "8px", padding: "14px", color: "#e2e8f0", fontSize: "13px", fontFamily: "'Space Mono', monospace", outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: "1.7" }} />
      <button onClick={runCode} disabled={running || pyLoading}
        style={{ width: "100%", background: running || pyLoading ? "#1a1a1a" : "#00ff88", color: running || pyLoading ? "#444" : "#000", border: "none", borderRadius: "8px", padding: "13px", cursor: running || pyLoading ? "not-allowed" : "pointer", fontWeight: "bold", fontSize: "14px", fontFamily: "'Space Mono', monospace", marginBottom: "10px", marginTop: "10px" }}>
        {pyLoading ? "⏳ Loading Python Engine..." : running ? "⏳ Running..." : "▶  RUN CODE"}
      </button>
      {output && (
        <div style={{ background: "#0d1117", border: `1px solid ${output.startsWith("❌") ? "#ff444430" : "#00ff8830"}`, borderRadius: "8px", padding: "14px" }}>
          <div style={{ fontSize: "10px", color: output.startsWith("❌") ? "#ff4444" : "#00ff88", marginBottom: "8px", letterSpacing: "1px" }}>OUTPUT:</div>
          <pre style={{ fontSize: "13px", color: output.startsWith("❌") ? "#ff9090" : "#e2e8f0", margin: 0, whiteSpace: "pre-wrap", lineHeight: "1.7", fontFamily: "'Space Mono', monospace" }}>{output}</pre>
        </div>
      )}
      {passed && (
        <div style={{ marginTop: "12px", padding: "14px", background: "#00ff8815", border: "1px solid #00ff8840", borderRadius: "8px", fontSize: "13px", color: "#00ff88", textAlign: "center", fontWeight: "bold" }}>
          ✅ Challenge complete! XP earned.
        </div>
      )}
    </div>
  );
}

function TheoryBlock({ block }) {
  if (block.type === "plain") return <p style={{ fontSize: "14px", color: "#aaa", lineHeight: "1.85", margin: "0 0 14px 0" }}>{block.text}</p>;
  if (block.type === "highlight") return <div style={{ background: "#111", borderLeft: "3px solid #00ff88", borderRadius: "0 8px 8px 0", padding: "12px 16px", margin: "14px 0", fontSize: "14px", color: "#e0e0e0", lineHeight: "1.7", fontWeight: "bold" }}>{block.text}</div>;
  if (block.type === "code") return (
    <div style={{ margin: "12px 0" }}>
      <div style={{ fontSize: "10px", color: block.color, marginBottom: "6px", letterSpacing: "1px" }}>{block.label}</div>
      <pre style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: "8px", padding: "14px", fontSize: "12px", color: block.color, margin: 0, overflowX: "auto", whiteSpace: "pre-wrap", lineHeight: "1.7" }}>{block.code}</pre>
    </div>
  );
  if (block.type === "list") return (
    <ul style={{ margin: "8px 0 14px 0", paddingLeft: "4px", listStyle: "none" }}>
      {block.items.map((item, i) => <li key={i} style={{ fontSize: "13px", color: "#999", lineHeight: "1.75", padding: "6px 0 6px 12px", borderLeft: "2px solid #222" }}>{item}</li>)}
    </ul>
  );
  return null;
}

function checkAILimit() {
  const today = new Date().toDateString();
  const stored = JSON.parse(localStorage.getItem("cg_ai_usage") || '{"date":"","count":0}');
  if (stored.date !== today) {
    localStorage.setItem("cg_ai_usage", JSON.stringify({ date: today, count: 0 }));
    return { allowed: true, remaining: 10 };
  }
  const remaining = 10 - stored.count;
  return { allowed: remaining > 0, remaining };
}

function incrementAILimit() {
  const today = new Date().toDateString();
  const stored = JSON.parse(localStorage.getItem("cg_ai_usage") || '{"date":"","count":0}');
  const count = stored.date === today ? stored.count + 1 : 1;
  localStorage.setItem("cg_ai_usage", JSON.stringify({ date: today, count }));
}

function WeaknessTracker({ strikes, onClose, onReview }) {
  const weak = [];
  for (const [id, count] of strikes.entries()) {
    if (count >= 2) {
      const lesson = ALL_LESSONS.find(l => l.id === id);
      if (lesson) weak.push({ ...lesson, strikeCount: count });
    }
  }
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ background: "#0a0a0a", border: "1px solid #1f1f1f", borderRadius: "16px", width: "100%", maxWidth: "560px", fontFamily: "'Space Mono', monospace", padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <div style={{ color: "#ff6b35", fontWeight: "bold", fontSize: "16px" }}>🎯 Weakness Tracker</div>
            <div style={{ color: "#444", fontSize: "11px", marginTop: "4px" }}>Lessons you struggled with most</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "24px" }}>×</button>
        </div>
        {weak.length === 0 ? (
          <div style={{ textAlign: "center", color: "#555", padding: "32px", fontSize: "13px" }}>No weaknesses detected yet. Keep practicing and this will track your struggles automatically.</div>
        ) : (
          weak.map((lesson) => (
            <div key={lesson.id} style={{ background: "#111", border: "1px solid #ff6b3530", borderRadius: "10px", padding: "14px 16px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "13px", color: "#ccc", fontWeight: "bold" }}>{lesson.title}</div>
                <div style={{ fontSize: "11px", color: "#ff6b35", marginTop: "3px" }}>Failed {lesson.strikeCount} times</div>
              </div>
              <button onClick={() => onReview(lesson)} style={{ background: "#ff6b3520", color: "#ff6b35", border: "1px solid #ff6b3540", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", fontSize: "11px", fontFamily: "'Space Mono', monospace" }}>Review →</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function RoadmapView({ completedLessons }) {
  const progress = Math.floor((completedLessons / ALL_LESSONS.length) * ROADMAP.length);
  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "32px 20px" }}>
      <div style={{ marginBottom: "32px" }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "38px", letterSpacing: "3px", marginBottom: "10px" }}>YOUR MONEY <span style={{ color: "#fbbf24" }}>ROADMAP</span></div>
        <p style={{ fontSize: "13px", color: "#555", lineHeight: "1.75", margin: 0 }}>Week by week, from zero to your first paid client.</p>
      </div>
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: "19px", top: "20px", bottom: "20px", width: "2px", background: "#1a1a1a", zIndex: 0 }} />
        {ROADMAP.map((step, idx) => {
          const done = idx < progress;
          const current = idx === progress;
          return (
            <div key={idx} style={{ display: "flex", gap: "20px", marginBottom: "24px", position: "relative", zIndex: 1 }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: done ? step.color : current ? "#1a1a1a" : "#0d0d0d", border: `2px solid ${done ? step.color : current ? step.color : "#1a1a1a"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "14px", boxShadow: current ? `0 0 12px ${step.color}60` : "none" }}>
                {done ? "✓" : current ? "▶" : "·"}
              </div>
              <div style={{ flex: 1, background: current ? "#0d0d0d" : "#080808", border: `1px solid ${current ? step.color + "30" : "#111"}`, borderRadius: "10px", padding: "14px 16px", opacity: idx > progress + 1 ? 0.5 : 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", flexWrap: "wrap", gap: "4px" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: step.color, letterSpacing: "1px" }}>{step.week}</span>
                    <div style={{ fontSize: "14px", fontWeight: "bold", color: current ? "#fff" : "#bbb", marginTop: "2px" }}>{step.title}</div>
                  </div>
                  {step.earn && <div style={{ fontSize: "11px", color: "#fbbf24", background: "#fbbf2415", border: "1px solid #fbbf2430", borderRadius: "6px", padding: "3px 10px", whiteSpace: "nowrap" }}>{step.earn}</div>}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: step.milestone ? "10px" : 0 }}>
                  {step.skills.map((s, i) => <span key={i} style={{ fontSize: "11px", color: "#555", background: "#111", border: "1px solid #1a1a1a", borderRadius: "4px", padding: "2px 8px" }}>{s}</span>)}
                </div>
                {step.milestone && <div style={{ fontSize: "12px", color: step.earn ? "#fbbf24" : "#888", fontStyle: "italic" }}>{step.milestone}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmailCapture({ onClose, onSubmit }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const submit = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { setError("Please enter a valid email address."); return; }
    if (name.trim().length === 0) { setError("Please enter your first name."); return; }
    onSubmit(email, name);
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "#0d0d0d", border: "1px solid #00ff8830", borderRadius: "16px", width: "100%", maxWidth: "440px", padding: "32px", fontFamily: "'Space Mono', monospace" }}>
        <div style={{ fontSize: "28px", marginBottom: "8px" }}>🚀</div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "28px", letterSpacing: "2px", color: "#00ff88", marginBottom: "8px" }}>FREE ACCESS</div>
        <p style={{ fontSize: "13px", color: "#888", lineHeight: "1.8", marginBottom: "24px" }}>Get free access to all lessons, the AI tutor, and your personal money roadmap. No credit card. No catch.</p>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your first name"
          style={{ width: "100%", background: "#181818", border: "1px solid #252525", borderRadius: "8px", padding: "12px 14px", color: "#ddd", fontSize: "13px", outline: "none", fontFamily: "'Space Mono', monospace", marginBottom: "10px", boxSizing: "border-box" }} />
        <input value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="Your email address" type="email"
          style={{ width: "100%", background: "#181818", border: `1px solid ${error ? "#ff444460" : "#252525"}`, borderRadius: "8px", padding: "12px 14px", color: "#ddd", fontSize: "13px", outline: "none", fontFamily: "'Space Mono', monospace", marginBottom: "10px", boxSizing: "border-box" }} />
        {error && <p style={{ fontSize: "12px", color: "#ff6b6b", marginBottom: "10px" }}>{error}</p>}
        <button onClick={submit} style={{ width: "100%", background: "#00ff88", color: "#000", border: "none", borderRadius: "8px", padding: "13px", cursor: "pointer", fontWeight: "bold", fontSize: "14px", fontFamily: "'Space Mono', monospace", marginBottom: "10px" }}>Start Learning Free →</button>
        <button onClick={onClose} style={{ width: "100%", background: "none", color: "#444", border: "none", cursor: "pointer", fontSize: "12px", fontFamily: "'Space Mono', monospace" }}>Skip for now</button>
        <p style={{ fontSize: "10px", color: "#333", textAlign: "center", marginTop: "12px" }}>No spam. No selling your data. Just your learning journey.</p>
      </div>
    </div>
  );
}

function Certificate({ name, xp, completed, total, onClose }) {
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", overflowY: "auto" }}>
      <div style={{ width: "100%", maxWidth: "600px", fontFamily: "'Space Mono', monospace" }}>
        <div style={{ background: "linear-gradient(135deg, #0a160e 0%, #0d0d0d 100%)", border: "2px solid #00ff8850", borderRadius: "16px", padding: "40px 36px", textAlign: "center", position: "relative" }}>
          <div style={{ position: "absolute", top: "16px", right: "16px" }}>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "22px" }}>×</button>
          </div>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🏆</div>
          <div style={{ fontSize: "11px", color: "#00ff88", letterSpacing: "4px", marginBottom: "8px" }}>CERTIFICATE OF COMPLETION</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "42px", letterSpacing: "3px", color: "#fff", marginBottom: "4px" }}>CODE<span style={{ color: "#00ff88" }}>GRIND</span></div>
          <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, #00ff88, transparent)", margin: "20px 0" }} />
          <p style={{ fontSize: "13px", color: "#888", marginBottom: "8px" }}>This certifies that</p>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "36px", letterSpacing: "2px", color: "#fbbf24", marginBottom: "8px" }}>{name || "Student"}</div>
          <p style={{ fontSize: "13px", color: "#888", lineHeight: "1.8", marginBottom: "20px" }}>
            has successfully completed the CodeGrind Python & JavaScript<br />
            Foundation Course with <span style={{ color: "#00ff88" }}>{xp} XP earned</span> across <span style={{ color: "#00ff88" }}>{completed} lessons</span>
          </p>
          <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, #00ff8830, transparent)", margin: "20px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "24px" }}>
            <div><div style={{ fontSize: "22px", color: "#00ff88", fontWeight: "bold" }}>{xp}</div><div style={{ fontSize: "10px", color: "#555", letterSpacing: "1px" }}>XP EARNED</div></div>
            <div><div style={{ fontSize: "22px", color: "#fbbf24", fontWeight: "bold" }}>{completed}/{total}</div><div style={{ fontSize: "10px", color: "#555", letterSpacing: "1px" }}>LESSONS</div></div>
            <div><div style={{ fontSize: "22px", color: "#a78bfa", fontWeight: "bold" }}>{date.split(",")[1]?.trim().split(" ")[1]}</div><div style={{ fontSize: "10px", color: "#555", letterSpacing: "1px" }}>YEAR</div></div>
          </div>
          <p style={{ fontSize: "11px", color: "#444", marginBottom: "20px" }}>Issued {date} • codegrind.app</p>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => window.print()} style={{ flex: 1, background: "#00ff88", color: "#000", border: "none", borderRadius: "8px", padding: "12px", cursor: "pointer", fontWeight: "bold", fontSize: "13px", fontFamily: "'Space Mono', monospace" }}>🖨️ Print / Save PDF</button>
            <button onClick={() => { navigator.clipboard.writeText(`I just completed the CodeGrind Python & JavaScript Foundation Course! 🏆 ${xp} XP earned. #CodeGrind #LearnToCode`); alert("Copied! Paste it on social media."); }} style={{ flex: 1, background: "#181818", color: "#00ff88", border: "1px solid #00ff8830", borderRadius: "8px", padding: "12px", cursor: "pointer", fontSize: "13px", fontFamily: "'Space Mono', monospace" }}>📱 Share</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StreakReminder({ streak, onClose }) {
  return (
    <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 200, fontFamily: "'Space Mono', monospace" }}>
      <div style={{ background: "#0d0d0d", border: "1px solid #fbbf2440", borderRadius: "12px", padding: "16px 20px", maxWidth: "280px", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
          <span style={{ fontSize: "20px" }}>🔥</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "18px" }}>×</button>
        </div>
        <div style={{ fontSize: "13px", fontWeight: "bold", color: "#fbbf24", marginBottom: "6px" }}>{streak.count} day streak — don't break it!</div>
        <p style={{ fontSize: "12px", color: "#777", margin: "0 0 12px 0", lineHeight: "1.6" }}>You haven't done a lesson today yet. Keep your streak alive — just one lesson takes 5 minutes.</p>
        <button onClick={onClose} style={{ width: "100%", background: "#fbbf2420", color: "#fbbf24", border: "1px solid #fbbf2440", borderRadius: "6px", padding: "8px", cursor: "pointer", fontSize: "12px", fontFamily: "'Space Mono', monospace" }}>Let's go →</button>
      </div>
    </div>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i, color: ["#00ff88", "#ff6b35", "#a78bfa", "#fbbf24", "#22d3ee"][i % 5],
    left: `${Math.random() * 100}%`, delay: `${Math.random() * 2}s`,
    duration: `${2 + Math.random() * 2}s`, size: `${6 + Math.random() * 8}px`,
  }));
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 300, overflow: "hidden" }}>
      {pieces.map((p) => (
        <div key={p.id} style={{ position: "absolute", top: "-20px", left: p.left, width: p.size, height: p.size, background: p.color, borderRadius: "2px", animation: `confetti ${p.duration} ${p.delay} ease-in forwards` }} />
      ))}
    </div>
  );
}

function JSRunner({ starterCode, whatItDoes, onPass, check, hints, onCodeChange, strikes, onStrike, onReviewNeeded, requiresChange }) {
  const [code, setCode] = useState(starterCode);
  const [output, setOutput] = useState("");
  const [passed, setPassed] = useState(false);

  const handleCodeChange = (val) => { setCode(val); if (onCodeChange) onCodeChange(val); };

  const runCode = () => {
    setOutput("");
    try {
      const logs = [];
      const fakeConsole = { log: (...args) => logs.push(args.map(String).join(" ")) };
      const fn = new Function("console", code);
      fn(fakeConsole);
      const result = logs.join("\n") || "(no output — make sure you have a console.log statement)";
      setOutput(result);
      const didPass = check(result);
      if (didPass && !passed) { setPassed(true); onPass(); }
      else if (!didPass) {
        const newStrikes = (strikes || 0) + 1;
        if (onStrike) onStrike(newStrikes);
        if (newStrikes >= 3 && onReviewNeeded) onReviewNeeded();
      }
    } catch (e) {
      setOutput("❌ Error: " + e.message + "\n\n💡 Common fixes:\n  • Check your syntax\n  • Make sure brackets are closed\n  • Ask the AI tutor for help");
      const newStrikes = (strikes || 0) + 1;
      if (onStrike) onStrike(newStrikes);
      if (newStrikes >= 3 && onReviewNeeded) onReviewNeeded();
    }
  };

  return (
    <div>
      <div style={{ background: "#0f1117", border: "1px solid #1a2030", borderRadius: "10px", padding: "14px", marginBottom: "12px" }}>
        <div style={{ fontSize: "10px", color: "#555", marginBottom: "6px", letterSpacing: "1px" }}>WHAT THIS CODE DOES:</div>
        <p style={{ fontSize: "12px", color: "#777", margin: 0, lineHeight: "1.7" }}>{whatItDoes}</p>
      </div>
      {strikes > 0 && strikes < 3 && (
        <div style={{ background: "#fbbf2410", border: "1px solid #fbbf2430", borderRadius: "8px", padding: "12px 14px", marginBottom: "10px" }}>
          <div style={{ fontSize: "11px", color: "#fbbf24", marginBottom: "4px" }}>⚠️ ATTEMPT {strikes}/3 — Hint:</div>
          <p style={{ fontSize: "13px", color: "#d4a500", margin: 0 }}>{hints && hints[strikes - 1]}</p>
        </div>
      )}
      <div style={{ fontSize: "10px", color: "#f59e0b", marginBottom: "6px", letterSpacing: "1px" }}>🌐 JAVASCRIPT CODE:</div>
      <textarea value={code} onChange={(e) => handleCodeChange(e.target.value)}
        style={{ width: "100%", minHeight: "160px", background: "#0d1117", border: `1px solid ${strikes >= 2 ? "#ff444440" : "#1f2937"}`, borderRadius: "8px", padding: "14px", color: "#fcd34d", fontSize: "13px", fontFamily: "'Space Mono', monospace", outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: "1.7" }} />
      <button onClick={runCode}
        style={{ width: "100%", background: "#f59e0b", color: "#000", border: "none", borderRadius: "8px", padding: "13px", cursor: "pointer", fontWeight: "bold", fontSize: "14px", fontFamily: "'Space Mono', monospace", marginBottom: "10px", marginTop: "10px" }}>
        ▶ RUN JAVASCRIPT
      </button>
      {output && (
        <div style={{ background: "#0d1117", border: `1px solid ${output.startsWith("❌") ? "#ff444430" : "#f59e0b30"}`, borderRadius: "8px", padding: "14px" }}>
          <div style={{ fontSize: "10px", color: output.startsWith("❌") ? "#ff4444" : "#f59e0b", marginBottom: "8px", letterSpacing: "1px" }}>OUTPUT:</div>
          <pre style={{ fontSize: "13px", color: output.startsWith("❌") ? "#ff9090" : "#e2e8f0", margin: 0, whiteSpace: "pre-wrap", lineHeight: "1.7", fontFamily: "'Space Mono', monospace" }}>{output}</pre>
        </div>
      )}
      {passed && <div style={{ marginTop: "12px", padding: "14px", background: "#00ff8815", border: "1px solid #00ff8840", borderRadius: "8px", fontSize: "13px", color: "#00ff88", textAlign: "center", fontWeight: "bold" }}>✅ Challenge complete! XP earned.</div>}
    </div>
  );
}

// ─── AI TUTOR (single correct version with rate limiting) ─────────────────────
function AITutor({ lesson, userCode, onClose }) {
  const [messages, setMessages] = useState([{ role: "assistant", content: `Hey! You're on "${lesson.title}" — ask me anything. No dumb questions here.` }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [limitInfo, setLimitInfo] = useState(checkAILimit());
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const limit = checkAILimit();
    if (!limit.allowed) {
      setMessages((m) => [...m, { role: "assistant", content: "You've used all 10 free AI tutor messages for today. Come back tomorrow — your limit resets at midnight. Keep practicing with the lessons in the meantime! 💪" }]);
      return;
    }
    const userMsg = { role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    setInput(""); setLoading(true);
    incrementAILimit();
    setLimitInfo(checkAILimit());
    try {
      const res = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/functions/v1/ai-proxy`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.REACT_APP_SUPABASE_KEY}` },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: `You are a patient coding tutor for someone returning to learning after years in survival mode. They are smart but need plain English. Lesson: "${lesson.title}". Analogy: "${lesson.analogy}". Their current code: ${userCode || "(none yet)"}. Rules: no jargon without plain explanation, use everyday analogies, be warm and encouraging, connect concepts to money-making, keep answers to 3-5 sentences unless asked for more.`,
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.content?.map((b) => b.text || "").join("") || "Try again in a sec." }]);
    } catch { setMessages((m) => [...m, { role: "assistant", content: "Connection hiccup. Try again." }]); }
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ background: "#0a0a0a", border: "1px solid #1f1f1f", borderRadius: "16px", width: "100%", maxWidth: "600px", height: "80vh", display: "flex", flexDirection: "column", fontFamily: "'Space Mono', monospace" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "#00ff88", fontWeight: "bold", fontSize: "14px" }}>🤖 AI Tutor — {lesson.title}</div>
            <div style={{ color: limitInfo.remaining <= 3 ? "#ff6b35" : "#444", fontSize: "11px", marginTop: "2px" }}>{limitInfo.remaining} free messages remaining today</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "24px" }}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {messages.map((m, i) => (
            <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", background: m.role === "user" ? "#00ff8815" : "#181818", border: `1px solid ${m.role === "user" ? "#00ff8828" : "#222"}`, borderRadius: "12px", padding: "12px 16px", maxWidth: "88%", color: "#ccc", fontSize: "13px", lineHeight: "1.75", whiteSpace: "pre-wrap" }}>
              {m.content}
            </div>
          ))}
          {loading && <div style={{ alignSelf: "flex-start", background: "#181818", border: "1px solid #222", borderRadius: "12px", padding: "12px 16px", color: "#00ff88", fontSize: "13px" }}>typing...</div>}
          <div ref={bottomRef} />
        </div>
        <div style={{ padding: "12px 14px", borderTop: "1px solid #1a1a1a", display: "flex", gap: "8px" }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={limitInfo.allowed ? "What's confusing? Ask in plain words..." : "Daily limit reached — come back tomorrow"}
            disabled={!limitInfo.allowed}
            style={{ flex: 1, background: "#181818", border: "1px solid #252525", borderRadius: "8px", padding: "11px 14px", color: limitInfo.allowed ? "#ddd" : "#555", fontSize: "13px", outline: "none", fontFamily: "'Space Mono', monospace" }} />
          <button onClick={send} disabled={loading || !limitInfo.allowed}
            style={{ background: limitInfo.allowed ? "#00ff88" : "#1a1a1a", color: limitInfo.allowed ? "#000" : "#444", border: "none", borderRadius: "8px", padding: "11px 18px", cursor: limitInfo.allowed ? "pointer" : "not-allowed", fontWeight: "bold", fontSize: "14px", fontFamily: "'Space Mono', monospace" }}>→</button>
        </div>
      </div>
    </div>
  );
}

// ─── PREMIUM SYSTEM ───────────────────────────────────────────────────────────
const PREMIUM_CODES = ["CODEGRIND99", "PREMIUM2026", "CHAMP11B", "STANLEY01", "CG2026A", "CG2026B", "CG2026C", "CG2026D", "CG2026E", "CG2026F"];
const FREE_LESSON_LIMIT = 10;

function isPremium() { return localStorage.getItem("cg_premium") === "true"; }

function activatePremium(code) {
  if (PREMIUM_CODES.includes(code.toUpperCase().trim())) {
    localStorage.setItem("cg_premium", "true");
    return true;
  }
  return false;
}

function Paywall({ onUnlock, onClose }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const tryCode = () => {
    if (activatePremium(code)) {
      setSuccess(true);
      setTimeout(() => { onUnlock(); onClose(); }, 1500);
    } else {
      setError("Invalid code. Check your email from Stanley or request access below.");
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "#0d0d0d", border: "2px solid #fbbf2440", borderRadius: "16px", width: "100%", maxWidth: "480px", padding: "36px 28px", fontFamily: "'Space Mono', monospace" }}>
        <div style={{ fontSize: "36px", textAlign: "center", marginBottom: "12px" }}>🔐</div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "32px", letterSpacing: "3px", color: "#fbbf24", textAlign: "center", marginBottom: "8px" }}>PREMIUM ACCESS</div>
        <p style={{ fontSize: "13px", color: "#888", lineHeight: "1.8", textAlign: "center", marginBottom: "24px" }}>
          You've completed the foundation. You now have your first freelance skill worth $50–$300/project. Everything that follows turns that into a career.
        </p>
        <div style={{ background: "#111", border: "1px solid #fbbf2430", borderRadius: "10px", padding: "16px", marginBottom: "20px" }}>
          <div style={{ fontSize: "12px", color: "#fbbf24", fontWeight: "bold", marginBottom: "10px" }}>✅ What you unlock:</div>
          <div style={{ fontSize: "12px", color: "#888", lineHeight: "2" }}>
            • CSV files, web scraping & APIs<br/>
            • Email automation & file organization<br/>
            • Classes, regex & advanced Python<br/>
            • Full JavaScript Pro curriculum<br/>
            • Real project builds (price tracker, etc.)<br/>
            • Unlimited AI tutor<br/>
            • Completion certificate
          </div>
        </div>
        <div style={{ background: "#0a160e", border: "1px solid #00ff8830", borderRadius: "10px", padding: "16px", marginBottom: "20px", textAlign: "center" }}>
          <div style={{ fontSize: "20px", color: "#00ff88", fontWeight: "bold", marginBottom: "4px" }}>$9.99/month</div>
          <div style={{ fontSize: "11px", color: "#555" }}>Pay once. Get access code. Unlock forever.</div>
        </div>
        <a href="mailto:stanleywhiteiii87@gmail.com?subject=CodeGrind Premium Access Request&body=Hi Stanley, I want to unlock CodeGrind Premium for $9.99. My payment: $champ11b"
          style={{ display: "block", background: "#00ff88", color: "#000", textDecoration: "none", borderRadius: "8px", padding: "13px", textAlign: "center", fontWeight: "bold", fontSize: "14px", marginBottom: "16px" }}>
          💳 Pay $9.99 via Cash App ($champ11b) →
        </a>
        <div style={{ fontSize: "11px", color: "#555", textAlign: "center", marginBottom: "16px" }}>After payment, Stanley will email you an access code within 24 hours.</div>
        <div style={{ height: "1px", background: "#1a1a1a", marginBottom: "16px" }} />
        <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>Already have a code?</div>
        <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
          <input value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && tryCode()} placeholder="Enter access code..."
            style={{ flex: 1, background: "#181818", border: `1px solid ${error ? "#ff444460" : success ? "#00ff8860" : "#252525"}`, borderRadius: "8px", padding: "10px 14px", color: "#ddd", fontSize: "13px", outline: "none", fontFamily: "'Space Mono', monospace" }} />
          <button onClick={tryCode} style={{ background: "#fbbf24", color: "#000", border: "none", borderRadius: "8px", padding: "10px 16px", cursor: "pointer", fontWeight: "bold", fontSize: "13px", fontFamily: "'Space Mono', monospace" }}>Unlock</button>
        </div>
        {error && <p style={{ fontSize: "12px", color: "#ff6b6b", margin: "0 0 8px 0" }}>{error}</p>}
        {success && <p style={{ fontSize: "12px", color: "#00ff88", margin: "0 0 8px 0" }}>✅ Code accepted! Unlocking premium...</p>}
        <button onClick={onClose} style={{ width: "100%", background: "none", color: "#444", border: "none", cursor: "pointer", fontSize: "12px", fontFamily: "'Space Mono', monospace", marginTop: "8px" }}>Continue with free lessons</button>
      </div>
    </div>
  );
}

const MILESTONES = {
  10: { title: "First Money Skill Unlocked! 💰", desc: "You can now automate data entry tasks and charge $50–$300 per project on Fiverr. Ready to go further?", color: "#fbbf24", showPaywall: true },
  15: { title: "Automation Expert! 🤖", desc: "You can now build automation scripts for small businesses. Rate: $200–$800 per project.", color: "#00ff88", showPaywall: false },
  20: { title: "Python Developer! 🐍", desc: "You have Python fundamentals. You can freelance for $50–$100/hr on data tasks.", color: "#22d3ee", showPaywall: false },
  25: { title: "Full Stack Beginner! 🌐", desc: "Python AND JavaScript skills. You can build simple websites for $500–$2,000.", color: "#a78bfa", showPaywall: false },
};

function MilestonePopup({ milestone, onClose, onShowPaywall, isPremiumUser }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "#0d0d0d", border: `2px solid ${milestone.color}`, borderRadius: "16px", width: "100%", maxWidth: "440px", padding: "36px 28px", textAlign: "center", fontFamily: "'Space Mono', monospace", animation: "popIn 0.4s ease" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏅</div>
        <div style={{ fontSize: "11px", color: milestone.color, letterSpacing: "3px", marginBottom: "10px" }}>MILESTONE UNLOCKED</div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "28px", letterSpacing: "2px", color: "#fff", marginBottom: "14px" }}>{milestone.title}</div>
        <div style={{ background: "#111", border: `1px solid ${milestone.color}30`, borderRadius: "10px", padding: "16px", marginBottom: "20px" }}>
          <p style={{ fontSize: "13px", color: "#aaa", lineHeight: "1.8", margin: 0 }}>{milestone.desc}</p>
        </div>
        {!isPremiumUser && milestone.showPaywall && (
          <button onClick={() => { onClose(); onShowPaywall(); }} style={{ width: "100%", background: "#fbbf24", color: "#000", border: "none", borderRadius: "8px", padding: "14px", cursor: "pointer", fontWeight: "bold", fontSize: "14px", fontFamily: "'Space Mono', monospace", marginBottom: "10px" }}>
            ⭐ Unlock Premium — $9.99/month →
          </button>
        )}
        <button onClick={onClose} style={{ width: "100%", background: !isPremiumUser && milestone.showPaywall ? "none" : milestone.color, color: !isPremiumUser && milestone.showPaywall ? "#555" : "#000", border: "none", borderRadius: "8px", padding: "14px", cursor: "pointer", fontWeight: "bold", fontSize: "14px", fontFamily: "'Space Mono', monospace" }}>
          {!isPremiumUser && milestone.showPaywall ? "Continue with free lessons" : "Keep Building →"}
        </button>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

async function updateLeaderboard(email, firstName, xp, lessonsCompleted) {
  try {
    const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
    const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY;
    await fetch(`${SUPABASE_URL}/rest/v1/leaderboard`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Prefer": "resolution=merge-duplicates",
      },
      body: JSON.stringify({ email, first_name: firstName, xp, lessons_completed: lessonsCompleted, updated_at: new Date().toISOString() }),
    });
  } catch {}
}

async function fetchLeaderboard() {
  try {
    const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
    const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/leaderboard?order=xp.desc&limit=10`, {
      headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` },
    });
    return await res.json();
  } catch { return []; }
}

function LeaderboardView() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchLeaderboard().then(data => { setLeaders(data || []); setLoading(false); });
  }, []);
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", padding: "32px 18px" }}>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "44px", letterSpacing: "3px", marginBottom: "8px" }}>
        LEADER<span style={{ color: "#fbbf24" }}>BOARD</span>
      </div>
      <p style={{ fontSize: "13px", color: "#555", marginBottom: "28px" }}>Top coders by XP. Keep grinding. 🔥</p>
      {loading ? (
        <div style={{ textAlign: "center", color: "#444", padding: "40px", fontSize: "13px" }}>Loading...</div>
      ) : leaders.length === 0 ? (
        <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "40px", textAlign: "center" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>🏆</div>
          <div style={{ fontSize: "14px", color: "#ccc" }}>No one on the board yet. Complete lessons to claim the top spot.</div>
        </div>
      ) : (
        <div>
          {leaders.map((user, idx) => (
            <div key={idx} style={{ background: idx === 0 ? "#0a0d00" : "#0d0d0d", border: "1px solid " + (idx === 0 ? "#fbbf2430" : "#1a1a1a"), borderRadius: "12px", padding: "16px 20px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ fontSize: "24px", width: "36px", textAlign: "center" }}>
                {idx < 3 ? medals[idx] : <span style={{ fontSize: "14px", color: "#444" }}>#{idx + 1}</span>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: "bold", color: idx === 0 ? "#fbbf24" : "#ccc" }}>{user.first_name || "Anonymous"}</div>
                <div style={{ fontSize: "11px", color: "#444" }}>{user.lessons_completed || 0} lessons completed</div>
              </div>
              <div style={{ fontSize: "16px", fontWeight: "bold", color: "#00ff88" }}>{user.xp || 0} XP</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const MINI_GAMES = {
  "start": {
    title: "Python Basics Quiz", icon: "🌱", color: "#00ff88", xpReward: 150,
    questions: [
      { question: 'Complete the code:\n\n_____ ("Hello World")', answer: "print", choices: ["print", "display", "show", "output"] },
      { question: 'Create a variable:\n\nname _____ "Stanley"', answer: "=", choices: ["=", "==", "->", ":"] },
      { question: "What symbol is used for comments in Python?", answer: "#", choices: ["#", "//", "/*", "--"] },
      { question: "What type of data needs quotes?", answer: "Text", choices: ["Text", "Numbers", "Both", "Neither"] },
      { question: "Code is instructions for a _____", answer: "computer", choices: ["computer", "human", "robot", "printer"] },
    ],
  },
  "decisions": {
    title: "Logic & Decisions Quiz", icon: "🧠", color: "#ff6b35", xpReward: 175,
    questions: [
      { question: 'Complete:\n\nif age _____ 18:', answer: ">", choices: [">", "<", "=", "=>"] },
      { question: "What keyword comes after the if block?", answer: "else", choices: ["else", "elif", "then", "otherwise"] },
      { question: 'Complete:\n\nfor i in _____(5):', answer: "range", choices: ["range", "loop", "repeat", "count"] },
      { question: "AND means both conditions must be _____", answer: "True", choices: ["True", "False", "Either", "Neither"] },
      { question: 'Complete:\n\nwhile counter _____ 10:', answer: "<=", choices: ["<=", ">=", "==", "!="] },
    ],
  },
  "functions": {
    title: "Functions Quiz", icon: "🔧", color: "#a78bfa", xpReward: 200,
    questions: [
      { question: "What keyword defines a function in Python?", answer: "def", choices: ["def", "fun", "function", "define"] },
      { question: "What keyword sends back a result from a function?", answer: "return", choices: ["return", "send", "output", "give"] },
      { question: "How do you call a function named greet?", answer: "greet()", choices: ["greet()", "call greet", "run greet", "greet{}"] },
      { question: "Default parameters mean the function works even without _____", answer: "every input", choices: ["every input", "any code", "a name", "parentheses"] },
      { question: "Complete: def double(n):\n    _____ n * 2", answer: "return", choices: ["return", "print", "give", "output"] },
    ],
  },
  "data": {
    title: "Data Structures Quiz", icon: "📦", color: "#22d3ee", xpReward: 200,
    questions: [
      { question: "Lists use _____ brackets", answer: "square [ ]", choices: ["square [ ]", "curly { }", "round ( )", "angle < >"] },
      { question: "How do you add an item to a list?", answer: ".append()", choices: [".append()", ".add()", ".push()", ".insert()"] },
      { question: "Dictionaries store data as _____", answer: "key: value pairs", choices: ["key: value pairs", "indexed items", "numbered lists", "single values"] },
      { question: "Lists start counting at _____", answer: "0", choices: ["0", "1", "2", "-1"] },
      { question: "What mode opens a file for writing?", answer: "w", choices: ["w", "r", "a", "x"] },
    ],
  },
  "javascript": {
    title: "JavaScript Quiz", icon: "🌐", color: "#f59e0b", xpReward: 225,
    questions: [
      { question: "JavaScript uses _____ instead of print()", answer: "console.log()", choices: ["console.log()", "print()", "output()", "display()"] },
      { question: 'Create a variable:\n\n_____ name = "Stanley"', answer: "let", choices: ["let", "var", "def", "const"] },
      { question: "JavaScript functions use _____ keyword", answer: "function", choices: ["function", "def", "func", "method"] },
      { question: "Arrays use _____ to add items", answer: ".push()", choices: [".push()", ".append()", ".add()", ".insert()"] },
      { question: "The DOM stands for _____", answer: "Document Object Model", choices: ["Document Object Model", "Data Object Manager", "Dynamic Output Method", "Display Object Mode"] },
    ],
  },
};

function MiniGame({ moduleId, moduleName, moduleColor, xpReward, onClose, onXpEarned }) {
  const game = MINI_GAMES[moduleId];
  const [phase, setPhase] = useState("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [choiceResult, setChoiceResult] = useState(null);
  const [typeResult, setTypeResult] = useState(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  if (!game) return null;
  const question = game.questions[currentQ];
  const totalQ = game.questions.length;
  const handleChoice = (choice) => {
    if (choiceResult) return;
    setSelectedChoice(choice);
    const correct = choice === question.answer;
    setChoiceResult(correct ? "correct" : "wrong");
    if (correct) setPhase("type");
  };
  const handleType = () => {
    if (!typedAnswer.trim()) return;
    const correct = typedAnswer.trim().toLowerCase() === question.answer.toLowerCase();
    setTypeResult(correct ? "correct" : "wrong");
    const points = choiceResult === "correct" && correct ? 2 : choiceResult === "correct" ? 1 : 0;
    setTimeout(() => {
      const next = [...answers, { correct, answer: question.answer, points }];
      setAnswers(next);
      if (currentQ + 1 < totalQ) {
        setCurrentQ(prev => prev + 1);
        setSelectedChoice(null); setTypedAnswer(""); setChoiceResult(null); setTypeResult(null); setPhase("question");
      } else {
        const finalScore = next.reduce((s, a) => s + a.points, 0);
        setScore(finalScore);
        setPhase("results");
        const earnedXp = Math.round((finalScore / (totalQ * 2)) * xpReward);
        if (earnedXp > 0) onXpEarned(earnedXp);
      }
    }, 1000);
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "#0d0d0d", border: "1px solid " + moduleColor + "40", borderRadius: "16px", width: "100%", maxWidth: "520px", fontFamily: "monospace", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "center", background: moduleColor + "10" }}>
          <div>
            <div style={{ fontSize: "11px", color: moduleColor, letterSpacing: "2px" }}>MINI GAME</div>
            <div style={{ fontSize: "14px", fontWeight: "bold", color: "#fff" }}>{game.title}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "22px" }}>×</button>
        </div>
        {phase === "intro" && (
          <div style={{ padding: "40px 28px", textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>{game.icon}</div>
            <div style={{ fontSize: "16px", fontWeight: "bold", color: "#fff", marginBottom: "8px" }}>{game.title}</div>
            <p style={{ fontSize: "13px", color: "#777", lineHeight: "1.8", marginBottom: "24px" }}>{totalQ} questions. Pick the answer then type it. Earn up to {xpReward} bonus XP.</p>
            <button onClick={() => setPhase("question")} style={{ background: moduleColor, color: "#000", border: "none", borderRadius: "8px", padding: "14px 32px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}>Start Game →</button>
          </div>
        )}
        {phase === "question" && (
          <div style={{ padding: "24px 28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <span style={{ fontSize: "11px", color: "#444" }}>Question {currentQ + 1} of {totalQ}</span>
              <span style={{ fontSize: "11px", color: moduleColor }}>Step 1 — Choose</span>
            </div>
            <div style={{ background: "#111", borderRadius: "10px", padding: "16px", marginBottom: "20px" }}>
              <pre style={{ fontSize: "13px", color: "#ccc", whiteSpace: "pre-wrap", margin: 0, lineHeight: "1.8" }}>{question.question}</pre>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {question.choices.map((choice, i) => (
                <button key={i} onClick={() => handleChoice(choice)}
                  style={{ background: choiceResult ? (choice === question.answer ? "#00ff8820" : choice === selectedChoice ? "#ff444420" : "#111") : "#111", border: "1px solid " + (choiceResult ? (choice === question.answer ? "#00ff8860" : choice === selectedChoice ? "#ff444460" : "#1f1f1f") : "#1f1f1f"), borderRadius: "8px", padding: "12px", cursor: choiceResult ? "default" : "pointer", color: choiceResult ? (choice === question.answer ? "#00ff88" : choice === selectedChoice ? "#ff4444" : "#555") : "#ccc", fontSize: "12px", textAlign: "left" }}>
                  {choice}
                </button>
              ))}
            </div>
            {choiceResult && <div style={{ marginTop: "12px", padding: "10px 14px", background: choiceResult === "correct" ? "#00ff8815" : "#ff444415", border: "1px solid " + (choiceResult === "correct" ? "#00ff8840" : "#ff444440"), borderRadius: "8px", fontSize: "12px", color: choiceResult === "correct" ? "#00ff88" : "#ff6666" }}>
              {choiceResult === "correct" ? "✓ Correct! Now type it to confirm." : "✗ Wrong. The answer is: " + question.answer + ". Now type the correct answer below."}
            </div>}
          </div>
        )}
        {phase === "type" && (
          <div style={{ padding: "24px 28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <span style={{ fontSize: "11px", color: "#444" }}>Question {currentQ + 1} of {totalQ}</span>
              <span style={{ fontSize: "11px", color: moduleColor }}>Step 2 — Type it</span>
            </div>
            <div style={{ background: "#111", borderRadius: "10px", padding: "16px", marginBottom: "20px" }}>
              <pre style={{ fontSize: "13px", color: "#ccc", whiteSpace: "pre-wrap", margin: 0, lineHeight: "1.8" }}>{question.question}</pre>
            </div>
            <input value={typedAnswer} onChange={(e) => setTypedAnswer(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleType()}
              placeholder="Type your answer here..."
              style={{ width: "100%", background: "#111", border: "1px solid #252525", borderRadius: "8px", padding: "12px 14px", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "monospace", boxSizing: "border-box", marginBottom: "10px" }} />
            {!typeResult && <button onClick={handleType} style={{ width: "100%", background: moduleColor, color: "#000", border: "none", borderRadius: "8px", padding: "12px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }}>Submit Answer</button>}
            {typeResult && <div style={{ padding: "10px 14px", background: typeResult === "correct" ? "#00ff8815" : "#ff444415", border: "1px solid " + (typeResult === "correct" ? "#00ff8840" : "#ff444440"), borderRadius: "8px", fontSize: "12px", color: typeResult === "correct" ? "#00ff88" : "#ff6666" }}>
              {typeResult === "correct" ? "✓ Perfect! Full marks." : "✗ The answer was: " + question.answer}
            </div>}
          </div>
        )}
        {phase === "results" && (
          <div style={{ padding: "32px 28px", textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>{score >= totalQ * 1.5 ? "🏆" : "💪"}</div>
            <div style={{ fontSize: "11px", color: moduleColor, letterSpacing: "3px", marginBottom: "8px" }}>GAME COMPLETE</div>
            <div style={{ fontSize: "22px", fontWeight: "bold", color: "#fff", marginBottom: "20px" }}>{score} / {totalQ * 2} points</div>
            <div style={{ background: "#111", borderRadius: "10px", padding: "16px", marginBottom: "20px", textAlign: "left" }}>
              {[{ label: "Score", value: score + " / " + (totalQ * 2) }, { label: "Accuracy", value: Math.round((score / (totalQ * 2)) * 100) + "%" }, { label: "Bonus XP", value: "+" + Math.round((score / (totalQ * 2)) * xpReward) + " XP" }].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1a1a1a", fontSize: "13px" }}>
                  <span style={{ color: "#555" }}>{label}</span>
                  <span style={{ color: label === "Bonus XP" ? "#00ff88" : "#ccc", fontWeight: "bold" }}>{value}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => { setCurrentQ(0); setSelectedChoice(null); setTypedAnswer(""); setChoiceResult(null); setTypeResult(null); setScore(0); setAnswers([]); setPhase("intro"); }} style={{ flex: 1, background: "#181818", color: moduleColor, border: "1px solid " + moduleColor + "30", borderRadius: "8px", padding: "12px", cursor: "pointer", fontSize: "12px" }}>Play Again</button>
              <button onClick={onClose} style={{ flex: 1, background: moduleColor, color: "#000", border: "none", borderRadius: "8px", padding: "12px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }}>Back to Lessons</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MultiChallenge({ lesson, lessonStrikes, completed, onComplete, onCodeChange, onStrike, onReviewNeeded, onShowAI, onBack }) {
  const challenges = lesson.challenges || [lesson.challenge];
  const quiz = lesson.quiz || null;
  const [step, setStep] = useState(0);
  const [stepsCompleted, setStepsCompleted] = useState([]);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizSelected, setQuizSelected] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [quizDone, setQuizDone] = useState(false);
  const [showingQuiz, setShowingQuiz] = useState(false);
  const totalSteps = challenges.length + (quiz ? 1 : 0);
  const progressPct = Math.round((stepsCompleted.length / totalSteps) * 100);
  const handleChallengePass = () => {
    if (!stepsCompleted.includes(step)) {
      const next = [...stepsCompleted, step];
      setStepsCompleted(next);
      if (step + 1 < challenges.length) { setTimeout(() => setStep(step + 1), 800); }
      else if (quiz) { setTimeout(() => setShowingQuiz(true), 800); }
      else { onComplete(); }
    }
  };
  const handleQuizAnswer = (choice) => {
    if (quizResult) return;
    const q = quiz[quizStep];
    const correct = choice === q.answer;
    setQuizSelected(choice);
    setQuizResult(correct ? "correct" : "wrong");
    setTimeout(() => {
      const next = [...quizAnswers, { correct, answer: q.answer }];
      setQuizAnswers(next);
      if (quizStep + 1 < quiz.length) { setQuizStep(quizStep + 1); setQuizSelected(null); setQuizResult(null); }
      else {
        setQuizDone(true);
        const correctCount = next.filter(a => a.correct).length;
        if (correctCount >= Math.ceil(quiz.length * 0.7)) { if (!stepsCompleted.includes("quiz")) { setStepsCompleted(prev => [...prev, "quiz"]); onComplete(); } }
      }
    }, 1000);
  };
  const retryQuiz = () => { setQuizStep(0); setQuizAnswers([]); setQuizSelected(null); setQuizResult(null); setQuizDone(false); };
  const currentChallenge = challenges[step];
  const stepLabels = [...challenges.map((c, i) => ({ label: i === 0 ? "Guided" : i === 1 ? "Modified" : "From Scratch", icon: i === 0 ? "🟢" : i === 1 ? "🟡" : "🔴" })), ...(quiz ? [{ label: "Quiz", icon: "🧠" }] : [])];
  return (
    <div>
      <div style={{ background: "#0d0d0d", border: "1px solid #181818", borderRadius: "12px", padding: "16px 20px", marginBottom: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
          <div style={{ fontSize: "11px", color: "#444" }}>LESSON PROGRESS</div>
          <div style={{ fontSize: "11px", color: "#00ff88" }}>{progressPct}%</div>
        </div>
        <div style={{ height: "4px", background: "#181818", borderRadius: "2px", marginBottom: "12px" }}>
          <div style={{ width: progressPct + "%", height: "100%", background: "linear-gradient(90deg, #00ff88, #fbbf24)", borderRadius: "2px", transition: "width 0.5s" }} />
        </div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {stepLabels.map((s, i) => {
            const isDone = i < challenges.length ? stepsCompleted.includes(i) : stepsCompleted.includes("quiz");
            const isCurrent = showingQuiz ? i === challenges.length : i === step && !showingQuiz;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "4px", background: isDone ? "#00ff8815" : isCurrent ? "#ffffff10" : "#111", border: "1px solid " + (isDone ? "#00ff8830" : isCurrent ? "#ffffff20" : "#1a1a1a"), borderRadius: "6px", padding: "4px 10px", fontSize: "10px", color: isDone ? "#00ff88" : isCurrent ? "#fff" : "#444" }}>
                <span>{s.icon}</span><span>{s.label}</span>{isDone && <span>✓</span>}
              </div>
            );
          })}
        </div>
      </div>
      {!showingQuiz && (
        <div style={{ background: "#0d0d0d", border: "1px solid #181818", borderRadius: "12px", padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <div style={{ fontSize: "10px", color: "#ff6b35", letterSpacing: "2px" }}>{step === 0 ? "CHALLENGE 1 — GUIDED" : step === 1 ? "CHALLENGE 2 — MODIFY IT" : "CHALLENGE 3 — FROM SCRATCH"}</div>
            <div style={{ fontSize: "10px", color: "#444" }}>{step + 1} of {challenges.length}</div>
          </div>
          <p style={{ fontSize: "13px", color: "#ccc", lineHeight: "1.8", marginBottom: "16px" }}>{currentChallenge.prompt}</p>
          {lesson.language === "javascript" ? (
            <JSRunner key={step} starterCode={currentChallenge.starterCode} whatItDoes={currentChallenge.whatItDoes} check={currentChallenge.check} hints={lesson.hints} strikes={lessonStrikes} onPass={handleChallengePass} onCodeChange={onCodeChange} onStrike={onStrike} onReviewNeeded={onReviewNeeded} requiresChange={step > 0} />
          ) : (
            <CodeRunner key={step} starterCode={currentChallenge.starterCode} whatItDoes={currentChallenge.whatItDoes} check={currentChallenge.check} hints={lesson.hints} strikes={lessonStrikes} onPass={handleChallengePass} onCodeChange={onCodeChange} onStrike={onStrike} onReviewNeeded={onReviewNeeded} requiresChange={step > 0} />
          )}
          <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
            <button onClick={onShowAI} style={{ flex: 1, background: "#181818", color: "#a78bfa", border: "1px solid #252525", borderRadius: "8px", padding: "12px", cursor: "pointer", fontSize: "12px" }}>🤖 Ask AI Tutor</button>
            {completed && <button onClick={onBack} style={{ flex: 1, background: "#0a160e", color: "#00ff88", border: "1px solid #00ff8825", borderRadius: "8px", padding: "12px", cursor: "pointer", fontSize: "12px" }}>← Back to Lessons</button>}
          </div>
        </div>
      )}
      {showingQuiz && !quizDone && (
        <div style={{ background: "#0d0d0d", border: "1px solid #a78bfa30", borderRadius: "12px", padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
            <div style={{ fontSize: "10px", color: "#a78bfa", letterSpacing: "2px" }}>KNOWLEDGE CHECK</div>
            <div style={{ fontSize: "10px", color: "#444" }}>{quizStep + 1} of {quiz.length}</div>
          </div>
          <p style={{ fontSize: "14px", color: "#ccc", lineHeight: "1.8", marginBottom: "20px" }}>{quiz[quizStep].question}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {quiz[quizStep].choices.map((choice, i) => (
              <button key={i} onClick={() => handleQuizAnswer(choice)}
                style={{ background: quizResult ? (choice === quiz[quizStep].answer ? "#00ff8820" : choice === quizSelected ? "#ff444420" : "#111") : "#111", border: "1px solid " + (quizResult ? (choice === quiz[quizStep].answer ? "#00ff8860" : choice === quizSelected ? "#ff444460" : "#1f1f1f") : "#1f1f1f"), borderRadius: "8px", padding: "12px 16px", cursor: quizResult ? "default" : "pointer", color: quizResult ? (choice === quiz[quizStep].answer ? "#00ff88" : choice === quizSelected ? "#ff4444" : "#555") : "#ccc", fontSize: "13px", textAlign: "left" }}>
                {choice}
              </button>
            ))}
          </div>
          {quizResult && <div style={{ marginTop: "12px", padding: "10px 14px", background: quizResult === "correct" ? "#00ff8815" : "#ff444415", border: "1px solid " + (quizResult === "correct" ? "#00ff8840" : "#ff444440"), borderRadius: "8px", fontSize: "12px", color: quizResult === "correct" ? "#00ff88" : "#ff6666" }}>
            {quizResult === "correct" ? "✓ Correct!" : "✗ The answer is: " + quiz[quizStep].answer}
          </div>}
        </div>
      )}
      {showingQuiz && quizDone && (() => {
        const correct = quizAnswers.filter(a => a.correct).length;
        const passed = correct >= Math.ceil(quiz.length * 0.7);
        return (
          <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "28px", textAlign: "center" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>{passed ? "🏆" : "💪"}</div>
            <div style={{ fontSize: "16px", fontWeight: "bold", color: passed ? "#00ff88" : "#fbbf24", marginBottom: "8px" }}>{passed ? "Lesson Complete!" : "Almost there!"}</div>
            <div style={{ fontSize: "13px", color: "#777", marginBottom: "20px" }}>{correct} / {quiz.length} correct — {passed ? "you passed!" : "need " + Math.ceil(quiz.length * 0.7) + " to pass."}</div>
            {passed ? (
              <button onClick={onBack} style={{ width: "100%", background: "#00ff88", color: "#000", border: "none", borderRadius: "8px", padding: "14px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}>← Back to Lessons</button>
            ) : (
              <button onClick={retryQuiz} style={{ width: "100%", background: "#fbbf24", color: "#000", border: "none", borderRadius: "8px", padding: "14px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}>Retry Quiz →</button>
            )}
          </div>
        );
      })()}
    </div>
  );
}

function LandingPage({ onEnter }) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 50);
  }, []);

  const handleEnter = () => {
    onEnter();
  };

  const modules = [
    { icon: "🌱", name: "Starting From Zero", count: "3 lessons", free: true },
    { icon: "🧠", name: "Making Decisions", count: "2 lessons", free: true },
    { icon: "🔧", name: "Functions", count: "1 lesson", free: true },
    { icon: "📦", name: "Working With Data", count: "3 lessons", free: true },
    { icon: "⚡", name: "Logic Level Up", count: "4 lessons", free: true },
    { icon: "🐍", name: "Python Pro Skills", count: "5 lessons", free: false },
    { icon: "🌐", name: "JavaScript", count: "5 lessons", free: false },
    { icon: "💰", name: "Real Money Paths", count: "2 lessons", free: false },
    { icon: "🐍", name: "Premium Python Pro", count: "8 lessons", premium: true },
    { icon: "🌐", name: "Premium JS Pro", count: "4 lessons", premium: true },
  ];

  const features = [
    { icon: "🐍", title: "Live Code Runner", desc: "Real Python runs in your browser. No installs." },
    { icon: "🤖", title: "AI Tutor", desc: "Ask anything in plain English. No judgment." },
    { icon: "🎯", title: "Weakness Tracker", desc: "Struggle 3x? App walks you back through it." },
    { icon: "☁️", title: "Cloud Sync", desc: "Progress saves automatically across devices." },
    { icon: "🔥", title: "Streak System", desc: "Daily streaks keep you consistent." },
    { icon: "🏆", title: "Certificate", desc: "Complete the course, earn your certificate." },
  ];

  const steps = [
    { week: "WEEK 1–4", desc: "Python basics, logic, functions", earn: "Foundation", money: false },
    { week: "WEEK 5–8", desc: "Files, automation, error handling", earn: "$50–100/hr", money: true },
    { week: "WEEK 9–12", desc: "JavaScript, web basics, DOM", earn: "$500–2k/project", money: true },
    { week: "WEEK 13–20", desc: "APIs, web scraping, automation", earn: "$300–1.5k/project", money: true },
    { week: "MONTH 7–9", desc: "First app, portfolio, first client", earn: "🚀 $3k–8k/mo", money: true },
  ];

  const s = {
    page: {
      minHeight: "100vh",
      background: "#060606",
      color: "#f0e6e6",
      fontFamily: "'Space Mono', monospace",
      opacity: 1,
      transform: "scale(1)",
      transition: "none",
      overflowX: "hidden",
    },
    nav: {
      position: "sticky", top: 0, zIndex: 100,
      padding: "14px 6vw",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      background: "rgba(6,6,6,0.92)", backdropFilter: "blur(16px)",
      borderBottom: "1px solid #1a0a0a",
    },
    logo: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "26px", letterSpacing: "4px", color: "#f0e6e6" },
    logoSpan: { color: "#b22222" },
    navBtn: {
      background: "#8b1a1a", color: "#f0e6e6", border: "none",
      padding: "10px 22px", fontFamily: "'Space Mono', monospace",
      fontSize: "11px", fontWeight: "700", cursor: "pointer",
      letterSpacing: "2px", transition: "all 0.3s",
    },
    hero: {
      minHeight: "92vh", display: "flex", flexDirection: "column",
      justifyContent: "center", padding: "80px 6vw 60px",
      position: "relative", overflow: "hidden",
    },
    heroOrb: {
      position: "absolute", width: "600px", height: "600px",
      background: "radial-gradient(circle, #8b1a1a18 0%, transparent 70%)",
      top: "50%", right: "-10%", transform: "translateY(-50%)",
      pointerEvents: "none",
    },
    heroBg: {
      position: "absolute",
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: "30vw", color: "transparent",
      WebkitTextStroke: "1px #1a0505",
      right: "-4vw", top: "50%", transform: "translateY(-50%)",
      pointerEvents: "none", userSelect: "none", whiteSpace: "nowrap",
      letterSpacing: "-2px",
    },
    eyebrow: {
      fontSize: "10px", color: "#b22222", letterSpacing: "5px",
      marginBottom: "28px", display: "flex", alignItems: "center", gap: "12px",
    },
    title: {
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: "clamp(64px, 14vw, 130px)",
      lineHeight: "0.92", letterSpacing: "2px", marginBottom: "32px",
    },
    divider: { width: "60px", height: "2px", background: "linear-gradient(90deg, #b22222, transparent)", marginBottom: "28px" },
    sub: { fontSize: "clamp(13px, 1.8vw, 15px)", color: "#aa8888", lineHeight: "2", maxWidth: "480px", marginBottom: "44px" },
    primaryBtn: {
      background: "#8b1a1a", color: "#f0e6e6", border: "none",
      padding: "18px 36px", fontFamily: "'Space Mono', monospace",
      fontSize: "12px", fontWeight: "700", cursor: "pointer",
      letterSpacing: "2px", transition: "all 0.3s", display: "inline-block",
      textDecoration: "none",
    },
    ghostBtn: {
      background: "transparent", color: "#886666",
      border: "1px solid #2a1010",
      padding: "18px 36px", fontFamily: "'Space Mono', monospace",
      fontSize: "12px", cursor: "pointer",
      letterSpacing: "2px", transition: "all 0.3s", display: "inline-block",
    },
    marqueeWrap: {
      overflow: "hidden", borderTop: "1px solid #1a0a0a",
      borderBottom: "1px solid #1a0a0a", padding: "14px 0",
      background: "#0c0808",
    },
    sectionWrap: { padding: "72px 6vw", maxWidth: "1100px", margin: "0 auto" },
    label: { fontSize: "9px", color: "#b22222", letterSpacing: "5px", marginBottom: "18px" },
    sectionTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(38px, 6vw, 68px)", letterSpacing: "2px", lineHeight: "1", marginBottom: "18px" },
    sectionBody: { fontSize: "13px", color: "#886666", lineHeight: "2", maxWidth: "500px", marginBottom: "44px" },
    grid2: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1px", background: "#1a0a0a" },
    grid3: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1px", background: "#1a0a0a" },
    card: { background: "#060606", padding: "32px 28px", transition: "background 0.3s" },
    modCard: { background: "#060606", padding: "22px 18px", transition: "background 0.3s" },
    stepRow: {
      display: "grid", gridTemplateColumns: "90px 1fr auto",
      gap: "20px", alignItems: "center",
      background: "#0c0808", borderLeft: "2px solid #1a0a0a",
      padding: "20px 24px", marginBottom: "1px",
      transition: "all 0.3s",
    },
    priceGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1px", background: "#1a0a0a" },
    finalSection: { padding: "100px 6vw", textAlign: "center", position: "relative", overflow: "hidden" },
    footer: {
      borderTop: "1px solid #1a0a0a", padding: "24px 6vw",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      flexWrap: "wrap", gap: "12px",
    },
  };

  return (
    <div style={s.page}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes orbPulse { 0%,100% { opacity:0.6; transform:translateY(-50%) scale(1); } 50% { opacity:1; transform:translateY(-50%) scale(1.08); } }
        .cg-orb { animation: orbPulse 5s ease-in-out infinite; }
        .cg-marquee { display:flex; animation: marquee 22s linear infinite; white-space:nowrap; }
        .cg-step:hover { background:#0d0808 !important; border-left-color:#8b1a1a !important; transform:translateX(4px); }
        .cg-card:hover { background:#0d0808 !important; }
        .cg-btn-primary:hover { background:#b22222 !important; transform:translateY(-3px); box-shadow:0 12px 32px #8b1a1a40; }
        .cg-btn-ghost:hover { border-color:#5c1010 !important; color:#f0e6e6 !important; }
        .cg-navbtn:hover { background:#b22222 !important; }
      `}</style>

      {/* NAV */}
      <nav style={s.nav}>
        <div style={s.logo}>CODE<span style={s.logoSpan}>GRIND</span></div>
        <button onClick={handleEnter} className="cg-navbtn" style={s.navBtn}>START FREE →</button>
      </nav>

      {/* HERO */}
      <div style={s.hero}>
        <div className="cg-orb" style={s.heroOrb} />
        <div style={s.heroBg}>GRIND</div>
        <div style={s.eyebrow}>
          <div style={{ width: "32px", height: "1px", background: "#b22222" }} />
          FREE TO START — NO CREDIT CARD
        </div>
        <h1 style={s.title}>
          <div>LEARN</div>
          <div style={{ color: "#b22222" }}>TO CODE.</div>
          <div style={{ color: "transparent", WebkitTextStroke: "2px #b22222" }}>GET PAID.</div>
        </h1>
        <div style={s.divider} />
        <p style={s.sub}>
          <strong style={{ color: "#f0e6e6" }}>A tool to expand your range</strong> — academically and financially.<br />
          The advantage you'd normally pay tuition for.<br />
          Start as soon as you're ready.
        </p>
        <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
          <button onClick={handleEnter} className="cg-btn-primary" style={s.primaryBtn}>START LEARNING FREE →</button>
          <a href="#cg-curriculum" className="cg-btn-ghost" style={s.ghostBtn}>SEE THE CURRICULUM</a>
        </div>
      </div>

      {/* MARQUEE */}
      <div style={s.marqueeWrap}>
        <div className="cg-marquee">
          {["PYTHON","•","JAVASCRIPT","•","AUTOMATION","•","WEB SCRAPING","•","APIS","•","FREELANCE","•","FINANCIAL FREEDOM","•",
            "PYTHON","•","JAVASCRIPT","•","AUTOMATION","•","WEB SCRAPING","•","APIS","•","FREELANCE","•","FINANCIAL FREEDOM","•"].map((item, i) => (
            <span key={i} style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "15px", letterSpacing: "4px", color: item === "•" ? "#8b1a1a" : "#3a1010", padding: "0 28px", flexShrink: 0 }}>{item}</span>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderBottom: "1px solid #1a0a0a" }}>
        {[["30+","LESSONS"],["2","LANGUAGES"],["$0","TO START"],["9MO","TO FIRST CLIENT"]].map(([num, label]) => (
          <div key={label} className="cg-card" style={{ ...s.modCard, textAlign: "center", borderRight: "1px solid #1a0a0a", padding: "32px 16px" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "40px", color: "#b22222", letterSpacing: "2px", display: "block" }}>{num}</div>
            <div style={{ fontSize: "9px", color: "#664444", letterSpacing: "3px", marginTop: "4px" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* WHY */}
      <div style={s.sectionWrap}>
        <div style={s.label}>WHY CODEGRIND</div>
        <h2 style={s.sectionTitle}>NOT JUST ANOTHER<br /><span style={{ color: "#b22222" }}>CODING COURSE.</span></h2>
        <p style={s.sectionBody}>Most coding education teaches syntax. CodeGrind teaches you how to make money with it. Every lesson connects to a real skill you can charge for.</p>
        <div style={s.grid2}>
          {[
            ["01", "EXPAND YOUR RANGE", "Python. JavaScript. Automation. APIs. Every skill unlocks a new income stream. This is how you become hard to replace."],
            ["02", "THE ADVANTAGE", "The knowledge people pay $15,000 tuition for. You get it here for $9.99/month — or completely free to start."],
            ["03", "START WHEN READY", "No deadlines. No pressure. Progress saves automatically. Pick up exactly where you left off."],
          ].map(([num, title, body]) => (
            <div key={num} className="cg-card" style={s.card}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "72px", color: "#1a0808", lineHeight: "1", marginBottom: "18px" }}>{num}</div>
              <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "2px", marginBottom: "10px", color: "#f0e6e6" }}>{title}</div>
              <div style={{ fontSize: "12px", color: "#886666", lineHeight: "1.9" }}>{body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CURRICULUM */}
      <div style={{ ...s.sectionWrap, paddingTop: 0 }} id="cg-curriculum">
        <div style={s.label}>THE CURRICULUM</div>
        <h2 style={s.sectionTitle}>FROM ZERO TO<br /><span style={{ color: "#b22222" }}>FIRST PAID CLIENT.</span></h2>
        <p style={s.sectionBody}>A structured path from your first line of code to your first freelance dollar. No fluff. No filler.</p>
        <div style={s.grid3}>
          {modules.map((m) => (
            <div key={m.name} className="cg-card" style={{ ...s.modCard, background: m.premium ? "#0d0808" : "#060606" }}>
              <div style={{ fontSize: "20px", marginBottom: "8px" }}>{m.icon}</div>
              <div style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "1px", color: "#f0e6e6", marginBottom: "4px" }}>{m.name}</div>
              <div style={{ fontSize: "9px", color: "#664444", letterSpacing: "2px" }}>{m.count}</div>
              {m.free && <div style={{ fontSize: "8px", color: "#00ff88", border: "1px solid #00ff8820", padding: "2px 6px", display: "inline-block", marginTop: "6px", letterSpacing: "2px" }}>FREE</div>}
              {m.premium && <div style={{ fontSize: "8px", color: "#fbbf24", border: "1px solid #fbbf2420", padding: "2px 6px", display: "inline-block", marginTop: "6px", letterSpacing: "2px" }}>⭐ PREMIUM</div>}
            </div>
          ))}
        </div>
      </div>

      {/* INCOME PATH */}
      <div style={{ ...s.sectionWrap, paddingTop: 0 }}>
        <div style={s.label}>THE MONEY ROADMAP</div>
        <h2 style={s.sectionTitle}>WEEK BY WEEK TO<br /><span style={{ color: "#fbbf24" }}>YOUR FIRST CHECK.</span></h2>
        <div>
          {steps.map((step) => (
            <div key={step.week} className="cg-step" style={{ ...s.stepRow, borderLeftColor: step.week === "MONTH 7–9" ? "#fbbf2440" : "#1a0a0a" }}>
              <div style={{ fontSize: "9px", color: "#664444", letterSpacing: "3px" }}>{step.week}</div>
              <div style={{ fontSize: "13px", color: "#bbb" }}>{step.desc}</div>
              <div style={{ fontSize: "12px", fontWeight: "700", color: step.money ? "#fbbf24" : "#8b1a1a", textAlign: "right", whiteSpace: "nowrap" }}>{step.earn}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <div style={{ ...s.sectionWrap, paddingTop: 0 }}>
        <div style={s.label}>WHAT YOU GET</div>
        <h2 style={s.sectionTitle}>BUILT DIFFERENT.</h2>
        <div style={s.grid2}>
          {features.map((f) => (
            <div key={f.title} className="cg-card" style={s.card}>
              <div style={{ fontSize: "24px", marginBottom: "14px" }}>{f.icon}</div>
              <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "2px", marginBottom: "8px", color: "#f0e6e6" }}>{f.title}</div>
              <div style={{ fontSize: "12px", color: "#886666", lineHeight: "1.85" }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PULL QUOTE */}
      <div style={{ padding: "72px 6vw", background: "#0c0808", borderTop: "1px solid #1a0a0a", borderBottom: "1px solid #1a0a0a", textAlign: "center" }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(28px, 5vw, 52px)", color: "#f0e6e6", marginBottom: "16px", lineHeight: "1.2" }}>
          The advantage used to cost <span style={{ color: "#b22222" }}>$15,000.</span><br />Now it costs nothing to start.
        </div>
        <div style={{ fontSize: "10px", color: "#664444", letterSpacing: "4px" }}>— CODEGRIND — FREE TO START — NO EXCUSES</div>
      </div>

      {/* PRICING */}
      <div style={s.sectionWrap}>
        <div style={s.label}>PRICING</div>
        <h2 style={s.sectionTitle}>START FREE.<br /><span style={{ color: "#b22222" }}>GO FURTHER FOR $9.99.</span></h2>
        <div style={s.priceGrid}>
          <div style={{ ...s.card, padding: "40px 32px" }}>
            <div style={{ fontSize: "9px", color: "#664444", letterSpacing: "4px", marginBottom: "18px" }}>FREE FOREVER</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "60px", letterSpacing: "2px", lineHeight: "1", marginBottom: "6px" }}>$0</div>
            <div style={{ fontSize: "10px", color: "#664444", letterSpacing: "2px", marginBottom: "28px" }}>NO CREDIT CARD — NO CATCH</div>
            {["First 10 lessons free","Live Python code runner","AI tutor (10 msgs/day)","Streak & XP tracking","Cloud progress sync"].map(item => (
              <div key={item} style={{ fontSize: "12px", color: "#bbb", padding: "9px 0", borderBottom: "1px solid #110808", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ color: "#b22222", fontSize: "10px" }}>✓</span> {item}
              </div>
            ))}
            {["Premium Python Pro (8 lessons)","Premium JS Pro (4 lessons)","Certificate of completion"].map(item => (
              <div key={item} style={{ fontSize: "12px", color: "#2a1010", padding: "9px 0", borderBottom: "1px solid #0d0808", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "10px" }}>—</span> {item}
              </div>
            ))}
            <button onClick={handleEnter} className="cg-btn-primary" style={{ ...s.primaryBtn, width: "100%", textAlign: "center", marginTop: "28px", background: "#1a0a0a", color: "#886666", border: "1px solid #2a1010" }}>START FREE →</button>
          </div>
          <div style={{ ...s.card, padding: "40px 32px", background: "#0d0808", borderTop: "2px solid #b22222", position: "relative" }}>
            <div style={{ fontSize: "9px", color: "#664444", letterSpacing: "4px", marginBottom: "18px" }}>PREMIUM</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "60px", color: "#b22222", letterSpacing: "2px", lineHeight: "1", marginBottom: "6px" }}>$9.99</div>
            <div style={{ fontSize: "10px", color: "#664444", letterSpacing: "2px", marginBottom: "28px" }}>PER MONTH — CANCEL ANYTIME</div>
            {["Everything in Free","All 30+ lessons unlocked","Premium Python Pro module","Premium JS Pro module","Unlimited AI tutor","Real project builds","Certificate of completion","Direct support from Stanley"].map(item => (
              <div key={item} style={{ fontSize: "12px", color: "#bbb", padding: "9px 0", borderBottom: "1px solid #150a0a", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ color: "#b22222", fontSize: "10px" }}>✓</span> {item}
              </div>
            ))}
            <button onClick={handleEnter} className="cg-btn-primary" style={{ ...s.primaryBtn, width: "100%", textAlign: "center", marginTop: "28px" }}>UNLOCK PREMIUM →</button>
          </div>
        </div>
      </div>

      {/* FINAL CTA */}
      <div style={s.finalSection}>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(52px, 10vw, 100px)", letterSpacing: "3px", lineHeight: "1", marginBottom: "18px" }}>
          READY WHEN<br /><span style={{ color: "#b22222" }}>YOU ARE.</span>
        </h2>
        <p style={{ fontSize: "13px", color: "#886666", marginBottom: "36px", lineHeight: "2" }}>
          No deadlines. No pressure. Just you, the code,<br />and the income on the other side of it.
        </p>
        <button onClick={handleEnter} className="cg-btn-primary" style={{ ...s.primaryBtn, fontSize: "13px", padding: "20px 48px" }}>START LEARNING FREE →</button>
      </div>

      {/* FOOTER */}
      <footer style={s.footer}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "20px", letterSpacing: "4px", color: "#5c1010" }}>CODE<span style={{ color: "#b22222" }}>GRIND</span></div>
        <div style={{ fontSize: "10px", color: "#331a1a", letterSpacing: "1px" }}>BUILT BY STANLEY WHITE</div>
        <div style={{ fontSize: "10px", color: "#331a1a" }}>© 2026 CODEGRIND</div>
      </footer>
    </div>
  );
}

function AppWrapper() {
  const [entered, setEntered] = useState(!!sessionStorage.getItem("cg_entered"));

  if (!entered) {
    return (
      <LandingPage onEnter={() => {
        sessionStorage.setItem("cg_entered", "true");
        setEntered(true);
        window.scrollTo(0, 0);
      }} />
    );
  }

  return <CodeGrind />;
}

export { AppWrapper as default };

function CodeGrind() {
  const [xp, setXp] = useState(0);
  const [completed, setCompleted] = useState(new Set());
  const [strikes, setStrikes] = useState(new Map());
  const [bookmarks, setBookmarks] = useState(new Set());
  const [streak, setStreak] = useState({ count: 0, lastDate: null });
  const [loaded, setLoaded] = useState(true);
  const [cloudLoading, setCloudLoading] = useState(false);
  const [activeLesson, setActiveLesson] = useState(null);
  const [currentCode, setCurrentCode] = useState("");
  const [showAI, setShowAI] = useState(false);
  const [showWeakness, setShowWeakness] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [showStreakReminder, setShowStreakReminder] = useState(false);
  const [showMiniGame, setShowMiniGame] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMilestone, setShowMilestone] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [premium, setPremium] = useState(isPremium());
  const [userName, setUserName] = useState("Student");
  const [userEmail, setUserEmail] = useState("");
  const [tab, setTab] = useState("theory");
  const [view, setView] = useState("curriculum");
  const [reviewMode, setReviewMode] = useState(false);

  const totalXP = ALL_LESSONS.reduce((s, l) => s + l.xp, 0);
  const level = Math.floor(xp / 200) + 1;

  const saveEmail = async (email, name) => {
    try {
      localStorage.setItem("cg_email", email);
      setUserEmail(email);
      if (name) setUserName(name.charAt(0).toUpperCase() + name.slice(1));
      else { const parts = email.split("@")[0]; setUserName(parts.charAt(0).toUpperCase() + parts.slice(1)); }
      sendWelcomeEmail(email, name);
      const cloudProgress = await loadProgressFromCloud(email);
      if (cloudProgress) { setXp(cloudProgress.xp); setCompleted(cloudProgress.completed); setStrikes(cloudProgress.strikes); setBookmarks(cloudProgress.bookmarks); setStreak(cloudProgress.streak); }
      saveProgress(xp, completed, strikes, bookmarks, streak, email);
    } catch {}
  };

  const checkStreakReminder = (currentStreak) => {
    const now = new Date();
    const hours = now.getHours();
    if (currentStreak.count > 0 && hours >= 18 && hours <= 21) {
      const today = now.toDateString();
      if (currentStreak.lastDate !== today) setShowStreakReminder(true);
    }
  };

  useEffect(() => {
    loadProgress().then(async ({ xp, completed, strikes, bookmarks, streak }) => {
      setXp(xp); setCompleted(completed); setStrikes(strikes); setBookmarks(bookmarks); setStreak(streak); setLoaded(true);
      const today = new Date().toDateString();
      if (streak.lastDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        const newStreak = { count: streak.lastDate === yesterday ? streak.count + 1 : 1, lastDate: today };
        setStreak(newStreak);
        localStorage.setItem("cg_streak", JSON.stringify(newStreak));
      }
      checkStreakReminder(streak);
      const savedEmail = localStorage.getItem("cg_email");
      if (!savedEmail) {
        setTimeout(() => setShowEmailCapture(true), 3000);
      } else {
        setUserEmail(savedEmail);
        const parts = savedEmail.split("@")[0];
        setUserName(parts.charAt(0).toUpperCase() + parts.slice(1));
        setCloudLoading(true);
        const cloudProgress = await loadProgressFromCloud(savedEmail);
        setCloudLoading(false);
        if (cloudProgress && cloudProgress.xp >= xp) { setXp(cloudProgress.xp); setCompleted(cloudProgress.completed); setStrikes(cloudProgress.strikes); setBookmarks(cloudProgress.bookmarks); setStreak(cloudProgress.streak); }
      }
    });
  }, []);

  const markComplete = (lessonId, earnedXp) => {
    setCompleted((prev) => {
      if (prev.has(lessonId)) return prev;
      const next = new Set([...prev, lessonId]);
      const newXp = xp + earnedXp;
      setXp(newXp);
      saveProgress(newXp, next, strikes, bookmarks, streak, userEmail);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      if (MILESTONES[next.size]) setTimeout(() => setShowMilestone(MILESTONES[next.size]), 800);
      updateLeaderboard(userEmail, userName, newXp, next.size);
      if (next.size === ALL_LESSONS.length) setTimeout(() => setShowCertificate(true), 1000);
      return next;
    });
  };

  const handleStrike = (lessonId, count) => {
    setStrikes((prev) => {
      const next = new Map(prev);
      next.set(lessonId, count);
      saveProgress(xp, completed, next, bookmarks, streak, userEmail);
      return next;
    });
  };

  const handleReviewNeeded = () => { setReviewMode(true); setTab("theory"); };

  const toggleBookmark = (lessonId) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      next.has(lessonId) ? next.delete(lessonId) : next.add(lessonId);
      saveProgress(xp, completed, strikes, next, streak, userEmail);
      return next;
    });
  };

  const startLesson = (lesson, isReview = false) => {
    setActiveLesson(lesson); setCurrentCode(""); setTab("theory");
    setReviewMode(isReview); setView("lesson"); window.scrollTo(0, 0);
  };

  if (!loaded) return (
    <div style={{ minHeight: "100vh", background: "#080808", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#00ff88", fontFamily: "'Space Mono', monospace" }}>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "36px", letterSpacing: "3px", marginBottom: "20px" }}>CODE<span style={{ color: "#ff6b35" }}>GRIND</span></div>
      <div style={{ fontSize: "13px", color: "#444", marginBottom: "16px" }}>Loading your progress...</div>
      <div style={{ width: "200px", height: "4px", background: "#181818", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{ width: "60%", height: "100%", background: "#00ff88", borderRadius: "2px", animation: "fadeIn 1s ease infinite alternate" }} />
      </div>
    </div>
  );

  const lessonStrikes = activeLesson ? (strikes.get(activeLesson.id) || 0) : 0;

  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "#e0e0e0", fontFamily: "'Space Mono', monospace" }}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Bebas+Neue&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes popIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes confetti { 0% { transform: translateY(-10px) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
        @keyframes glow { 0% { box-shadow: 0 0 5px #00ff8840; } 50% { box-shadow: 0 0 20px #00ff8880; } 100% { box-shadow: 0 0 5px #00ff8840; } }
        button:active { transform: scale(0.97); }
      `}</style>

      <div style={{ borderBottom: "1px solid #141414", padding: "11px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#080808ee", backdropFilter: "blur(8px)", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {view !== "curriculum" && <button onClick={() => { setView("curriculum"); window.scrollTo(0,0); }} style={{ background: "none", border: "1px solid #1f1f1f", color: "#666", cursor: "pointer", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontFamily: "'Space Mono', monospace" }}>← Menu</button>}
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "24px", letterSpacing: "3px", color: "#00ff88" }}>CODE<span style={{ color: "#ff6b35" }}>GRIND</span></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
          {streak.count > 0 && <div style={{ fontSize: "11px", color: "#fbbf24", background: "#fbbf2415", border: "1px solid #fbbf2430", borderRadius: "6px", padding: "3px 8px" }}>🔥 {streak.count} day streak</div>}
          <button onClick={() => setShowWeakness(true)} style={{ background: "none", border: "1px solid #1f1f1f", color: "#ff6b35", cursor: "pointer", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontFamily: "'Space Mono', monospace" }}>🎯</button>
          {completed.size === ALL_LESSONS.length && <button onClick={() => setShowCertificate(true)} style={{ background: "none", border: "1px solid #fbbf2440", color: "#fbbf24", cursor: "pointer", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontFamily: "'Space Mono', monospace" }}>🏆</button>}
          <button onClick={() => { setView(view === "hire" ? "curriculum" : "hire"); window.scrollTo(0,0); }} style={{ background: view === "hire" ? "#00ff8820" : "none", border: `1px solid ${view === "hire" ? "#00ff8840" : "#1f1f1f"}`, color: view === "hire" ? "#00ff88" : "#888", cursor: "pointer", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontFamily: "'Space Mono', monospace" }}>💼 Hire</button>
          <button onClick={() => { setView("roadmap"); window.scrollTo(0,0); }} style={{ background: "none", border: "1px solid #1f1f1f", color: view === "roadmap" ? "#fbbf24" : "#555", cursor: "pointer", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontFamily: "'Space Mono', monospace" }}>💰</button>
          <button onClick={() => { setView("leaderboard"); window.scrollTo(0,0); }} style={{ background: view === "leaderboard" ? "#fbbf2420" : "none", border: "1px solid #1f1f1f", color: view === "leaderboard" ? "#fbbf24" : "#555", cursor: "pointer", padding: "4px 10px", borderRadius: "6px", fontSize: "11px" }}>🏆 Board</button>
          <span style={{ fontSize: "11px", color: "#444" }}>LVL {level}</span>
          <div style={{ width: "50px", height: "4px", background: "#181818", borderRadius: "2px" }}>
            <div style={{ width: `${((xp % 200) / 200) * 100}%`, height: "100%", background: "#00ff88", borderRadius: "2px", transition: "width 0.5s" }} />
          </div>
          <span style={{ fontSize: "12px", color: "#00ff88", fontWeight: "bold" }}>{xp}/{totalXP}</span>
        </div>
      </div>

      {view === "roadmap" && <RoadmapView completedLessons={completed.size} />}
      {view === "leaderboard" && <LeaderboardView />}

      {view === "hire" && (
        <div style={{ maxWidth: "680px", margin: "0 auto", padding: "32px 18px" }}>
          <div style={{ marginBottom: "32px" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "44px", letterSpacing: "3px", lineHeight: 1.05, marginBottom: "14px" }}>HIRE <span style={{ color: "#00ff88" }}>STANLEY</span></div>
            <p style={{ fontSize: "13px", color: "#777", lineHeight: "1.85" }}>I build automation tools, websites, and chatbots for small businesses. Fast turnaround. Plain English communication. Real results.</p>
          </div>
          <div style={{ background: "#0d0d0d", border: "1px solid #fbbf2430", borderRadius: "10px", padding: "14px 18px", marginBottom: "24px", textAlign: "center" }}>
            <div style={{ fontSize: "12px", color: "#fbbf24", fontWeight: "bold", marginBottom: "4px" }}>📅 Currently booking projects for July 2026</div>
            <div style={{ fontSize: "11px", color: "#555" }}>Limited spots available — reach out now to reserve yours</div>
          </div>
          {[
            { icon: "🌐", title: "Website Building", desc: "Clean, fast websites that work on every device. Perfect for small businesses that need an online presence.", price: "$500 – $3,000", time: "1–2 weeks" },
            { icon: "🤖", title: "Automation Scripts", desc: "Automate your repetitive tasks. Excel reports, email campaigns, data processing — done automatically while you sleep.", price: "$200 – $1,500", time: "3–7 days" },
            { icon: "💬", title: "Chatbots", desc: "AI-powered chatbots for your website or business. Answer customer questions 24/7 without hiring staff.", price: "$500 – $2,000", time: "1–2 weeks" },
          ].map((service) => (
            <div key={service.title} style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "20px", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                <div style={{ fontSize: "28px", flexShrink: 0 }}>{service.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "15px", fontWeight: "bold", color: "#fff", marginBottom: "6px" }}>{service.title}</div>
                  <p style={{ fontSize: "13px", color: "#777", lineHeight: "1.7", margin: "0 0 12px 0" }}>{service.desc}</p>
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "12px", color: "#00ff88", background: "#00ff8815", border: "1px solid #00ff8830", borderRadius: "6px", padding: "3px 10px" }}>{service.price}</span>
                    <span style={{ fontSize: "12px", color: "#fbbf24", background: "#fbbf2415", border: "1px solid #fbbf2430", borderRadius: "6px", padding: "3px 10px" }}>⏱ {service.time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div style={{ background: "#0a160e", border: "1px solid #00ff8830", borderRadius: "12px", padding: "24px", textAlign: "center", marginTop: "24px" }}>
            <div style={{ fontSize: "20px", marginBottom: "10px" }}>🤝</div>
            <div style={{ fontSize: "16px", fontWeight: "bold", color: "#fff", marginBottom: "8px" }}>Ready to work together?</div>
            <p style={{ fontSize: "13px", color: "#888", lineHeight: "1.7", marginBottom: "20px" }}>Tell me about your project. I respond within 24 hours.</p>
            <a href="mailto:stanleywhiteiii87@gmail.com?subject=Project Inquiry — CodeGrind&body=Hi Stanley, I found you through CodeGrind and I'd like to discuss a project..." style={{ display: "block", background: "#00ff88", color: "#000", border: "none", borderRadius: "8px", padding: "14px", cursor: "pointer", fontWeight: "bold", fontSize: "14px", fontFamily: "'Space Mono', monospace", textDecoration: "none", marginBottom: "10px" }}>📧 Email Me Directly</a>
            <p style={{ fontSize: "11px", color: "#444", margin: 0 }}>stanleywhiteiii87@gmail.com</p>
          </div>
        </div>
      )}

      {view === "curriculum" && (
        <div style={{ maxWidth: "680px", margin: "0 auto", padding: "32px 18px" }}>
          <div style={{ marginBottom: "36px" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "44px", letterSpacing: "3px", lineHeight: 1.05, marginBottom: "14px" }}>LEARN TO CODE.<br /><span style={{ color: "#00ff88" }}>GET PAID.</span></div>
            {completed.size === 0 && (
              <div style={{ background: "#0a160e", border: "1px solid #00ff8840", borderRadius: "10px", padding: "16px 18px", marginBottom: "14px" }}>
                <div style={{ fontSize: "12px", color: "#00ff88", fontWeight: "bold", marginBottom: "8px" }}>👋 Welcome! Here's how to start:</div>
                <div style={{ fontSize: "12px", color: "#888", lineHeight: "1.8" }}>
                  1. Click <strong style={{ color: "#ccc" }}>Start →</strong> on the first lesson below<br />
                  2. Read the plain-English explanation<br />
                  3. Run the code and see it work<br />
                  4. Earn XP and unlock the next lesson
                </div>
              </div>
            )}
            {completed.size > 0 && completed.size < ALL_LESSONS.length && (
              <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "10px", padding: "14px 18px", marginBottom: "14px" }}>
                <div style={{ fontSize: "12px", color: "#00ff88", marginBottom: "4px" }}>💰 Income Potential Unlocked So Far:</div>
                <div style={{ fontSize: "13px", color: "#fbbf24", fontWeight: "bold" }}>
                  {completed.size >= 10 ? "$50–$300/project (data automation)" : `${10 - completed.size} more lessons to unlock first paid skill`}
                  {completed.size >= 15 ? " • $200–$800/project (automation scripts)" : ""}
                  {completed.size >= 20 ? " • $50–$100/hr (Python freelance)" : ""}
                  {completed.size >= 25 ? " • $500–$2,000/project (websites)" : ""}
                </div>
              </div>
            )}
            <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "10px", padding: "16px 18px" }}>
              <p style={{ fontSize: "13px", color: "#777", lineHeight: "1.85", margin: 0 }}>Plain English. Real analogies. Live code runner. Progress saves automatically. Fail 3 times and the lesson walks you back through the concept automatically.</p>
            </div>
          </div>

          <div style={{ marginBottom: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <span style={{ fontSize: "14px", fontWeight: "bold", color: "#fbbf24" }}>⭐ What people are saying</span>
            </div>
            <div style={{ background: "#0d0d0d", border: "1px solid #fbbf2420", borderRadius: "10px", padding: "14px 16px", marginBottom: "10px" }}>
              <div style={{ fontSize: "13px", color: "#fbbf24", marginBottom: "6px" }}>★★★★★</div>
              <p style={{ fontSize: "13px", color: "#ccc", lineHeight: "1.7", margin: "0 0 10px 0", fontStyle: "italic" }}>"I wish I had this app when I started coding years ago."</p>
              <div style={{ fontSize: "11px", color: "#555" }}>Verified User — Experienced Developer</div>
            </div>
            <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "10px", padding: "14px 16px", textAlign: "center" }}>
              <p style={{ fontSize: "12px", color: "#555", margin: 0, lineHeight: "1.7" }}>
                Used the app? <span style={{ color: "#00ff88", cursor: "pointer" }} onClick={() => window.location.href = "mailto:stanleywhiteiii87@gmail.com?subject=CodeGrind Review&body=Hi Stanley, here's my feedback on CodeGrind:"}>Send your review →</span>
              </p>
            </div>
          </div>

          <div style={{ background: "#0d0d0d", border: "1px solid #161616", borderRadius: "10px", padding: "14px 18px", marginBottom: "30px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "11px", color: "#444" }}>PROGRESS</span>
              <span style={{ fontSize: "11px", color: "#00ff88" }}>{completed.size} / {ALL_LESSONS.length} lessons • {xp} XP</span>
            </div>
            <div style={{ height: "5px", background: "#181818", borderRadius: "3px" }}>
              <div style={{ width: `${(completed.size / ALL_LESSONS.length) * 100}%`, height: "100%", background: "linear-gradient(90deg, #00ff88, #ff6b35)", borderRadius: "3px", transition: "width 0.6s" }} />
            </div>
          </div>

          {bookmarks.size > 0 && (
            <div style={{ marginBottom: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <span>🔖</span>
                <span style={{ fontSize: "13px", fontWeight: "bold", color: "#a78bfa" }}>Bookmarked</span>
                <div style={{ flex: 1, height: "1px", background: "#141414" }} />
              </div>
              {ALL_LESSONS.filter(l => bookmarks.has(l.id)).map(lesson => (
                <div key={lesson.id} onClick={() => startLesson(lesson)} style={{ background: "#0d0d0d", border: "1px solid #a78bfa25", borderRadius: "10px", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", marginBottom: "6px" }}>
                  <div style={{ fontSize: "13px", color: "#ccc" }}>{lesson.title}</div>
                  <div style={{ fontSize: "11px", color: "#a78bfa", border: "1px solid #a78bfa30", borderRadius: "5px", padding: "2px 8px" }}>Review →</div>
                </div>
              ))}
            </div>
          )}

          {!premium && (
            <div onClick={() => setShowPaywall(true)} style={{ background: "#0a0800", border: "1px solid #fbbf2430", borderRadius: "10px", padding: "14px 18px", marginBottom: "20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "12px", color: "#fbbf24", fontWeight: "bold", marginBottom: "3px" }}>⭐ {Math.max(0, FREE_LESSON_LIMIT - completed.size)} free lessons remaining</div>
                <div style={{ fontSize: "11px", color: "#555" }}>{completed.size >= FREE_LESSON_LIMIT ? "Unlock premium to continue →" : `Complete ${FREE_LESSON_LIMIT} lessons free — then $9.99/month`}</div>
              </div>
              <div style={{ fontSize: "11px", color: "#fbbf24", border: "1px solid #fbbf2440", borderRadius: "6px", padding: "4px 10px", flexShrink: 0 }}>{completed.size >= FREE_LESSON_LIMIT ? "Unlock Now →" : "Learn More"}</div>
            </div>
          )}
          {premium && (
            <div style={{ background: "#0a160e", border: "1px solid #00ff8830", borderRadius: "10px", padding: "12px 18px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "16px" }}>⭐</span>
              <div style={{ fontSize: "12px", color: "#00ff88" }}>Premium member — all lessons unlocked</div>
            </div>
          )}

          {CURRICULUM.map((module) => (
            <div key={module.id} style={{ marginBottom: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <span>{module.icon}</span>
                <span style={{ fontSize: "13px", fontWeight: "bold", color: module.color }}>{module.title}</span>
                <div style={{ flex: 1, height: "1px", background: "#141414" }} />
                <span style={{ fontSize: "11px", color: "#2a2a2a" }}>{module.lessons.filter(l => completed.has(l.id)).length}/{module.lessons.length}</span>
                {MINI_GAMES[module.id] && module.lessons.every(l => completed.has(l.id)) && (
                  <button onClick={() => setShowMiniGame(module)} style={{ background: module.color + "20", color: module.color, border: "1px solid " + module.color + "40", borderRadius: "6px", padding: "3px 10px", cursor: "pointer", fontSize: "10px", fontFamily: "monospace" }}>🎮 PLAY</button>
                )}
              </div>
              {module.lessons.map((lesson, idx) => {
                const done = completed.has(lesson.id);
                const lessonNumber = ALL_LESSONS.findIndex(l => l.id === lesson.id) + 1;
                const paywalled = !premium && lessonNumber > FREE_LESSON_LIMIT;
                const locked = !paywalled && idx > 0 && !completed.has(module.lessons[idx - 1].id);
                const lessonStrikes = strikes.get(lesson.id) || 0;
                return (
                  <div key={lesson.id} onClick={() => {
                    if (paywalled) { setShowPaywall(true); return; }
                    if (!locked) startLesson({ ...lesson, moduleId: module.id, moduleColor: module.color });
                  }}
                    style={{ background: done ? "#0a160e" : paywalled ? "#0d0a00" : "#0d0d0d", border: `1px solid ${done ? "#00ff8825" : paywalled ? "#fbbf2425" : locked ? "#0f0f0f" : lessonStrikes >= 2 ? "#ff6b3530" : "#181818"}`, borderRadius: "10px", padding: "13px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: locked ? "not-allowed" : "pointer", opacity: locked ? 0.3 : 1, marginBottom: "7px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: done ? "#00ff8815" : paywalled ? "#fbbf2415" : "#141414", border: `1px solid ${done ? "#00ff8840" : paywalled ? "#fbbf2440" : "#1f1f1f"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", flexShrink: 0 }}>
                        {done ? "✓" : paywalled ? "⭐" : locked ? "🔒" : lessonStrikes >= 3 ? "⚠️" : "▶"}
                      </div>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: "bold", color: done ? "#00ff88" : paywalled ? "#fbbf24" : "#ccc" }}>{lesson.title}</div>
                        <div style={{ fontSize: "11px", color: "#333", marginTop: "2px" }}>
                          {paywalled ? "Premium lesson" : lesson.analogy} • +{lesson.xp} XP
                          {lessonStrikes > 0 && !done && <span style={{ color: "#ff6b35", marginLeft: "6px" }}>• {lessonStrikes} strike{lessonStrikes > 1 ? "s" : ""}</span>}
                        </div>
                      </div>
                    </div>
                    {paywalled ? (
                      <div style={{ fontSize: "11px", color: "#fbbf24", border: "1px solid #fbbf2430", borderRadius: "5px", padding: "3px 9px", flexShrink: 0 }}>⭐ Premium</div>
                    ) : !locked && (
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <button onClick={(e) => { e.stopPropagation(); toggleBookmark(lesson.id); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", opacity: bookmarks.has(lesson.id) ? 1 : 0.3 }}>🔖</button>
                        <div style={{ fontSize: "11px", color: module.color, border: `1px solid ${module.color}28`, borderRadius: "5px", padding: "3px 9px", flexShrink: 0 }}>{done ? "Redo" : "Start →"}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {view === "lesson" && activeLesson && (
        <div style={{ maxWidth: "720px", margin: "0 auto", padding: "24px 18px" }}>
          {reviewMode && (
            <div style={{ background: "#ff6b3515", border: "1px solid #ff6b3530", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px", fontSize: "13px", color: "#ff6b35" }}>
              🔄 Review Mode — You struggled with this concept. Read through the explanation again before trying the challenge.
            </div>
          )}
          <div style={{ marginBottom: "18px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "10px", color: activeLesson.moduleColor, letterSpacing: "2px", marginBottom: "5px" }}>{activeLesson.moduleTitle?.toUpperCase()}</div>
              <div style={{ fontSize: "20px", fontWeight: "bold" }}>{activeLesson.title}</div>
              <div style={{ fontSize: "12px", color: "#444", marginTop: "3px" }}>💡 {activeLesson.analogy}</div>
            </div>
            <button onClick={() => toggleBookmark(activeLesson.id)} style={{ background: bookmarks.has(activeLesson.id) ? "#a78bfa20" : "#181818", border: `1px solid ${bookmarks.has(activeLesson.id) ? "#a78bfa40" : "#252525"}`, borderRadius: "8px", padding: "8px 12px", cursor: "pointer", fontSize: "14px", color: bookmarks.has(activeLesson.id) ? "#a78bfa" : "#444" }}>🔖</button>
          </div>

          {lessonStrikes >= 3 && !reviewMode && (
            <div style={{ background: "#ff6b3515", border: "1px solid #ff6b3540", borderRadius: "10px", padding: "14px 16px", marginBottom: "16px" }}>
              <div style={{ fontSize: "13px", color: "#ff6b35", fontWeight: "bold", marginBottom: "6px" }}>⚠️ 3 Strikes — Let's review the concept first</div>
              <p style={{ fontSize: "12px", color: "#cc5522", margin: "0 0 10px 0", lineHeight: "1.6" }}>No worries — this happens to everyone. Read through the explanation tab again, then try the challenge fresh.</p>
              <button onClick={() => { setReviewMode(true); setTab("theory"); }} style={{ background: "#ff6b3525", color: "#ff6b35", border: "1px solid #ff6b3540", borderRadius: "6px", padding: "8px 14px", cursor: "pointer", fontSize: "12px", fontFamily: "'Space Mono', monospace" }}>Go Back to Explanation →</button>
            </div>
          )}

          <div style={{ display: "flex", gap: "4px", marginBottom: "18px", background: "#0d0d0d", border: "1px solid #181818", borderRadius: "10px", padding: "4px" }}>
            {["theory", "code"].map((t) => (
              <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "10px", background: tab === t ? "#181818" : "none", border: "none", borderRadius: "7px", color: tab === t ? "#fff" : "#444", cursor: "pointer", fontSize: "12px", fontWeight: tab === t ? "bold" : "normal", fontFamily: "'Space Mono', monospace", letterSpacing: "1px" }}>
                {t === "theory" ? "📖 EXPLANATION" : "▶ RUN CODE"}
              </button>
            ))}
          </div>

          {tab === "theory" ? (
            <div>
              <div style={{ background: "#0d0d0d", border: "1px solid #181818", borderRadius: "12px", padding: "22px", marginBottom: "14px" }}>
                {activeLesson.theory.map((block, i) => <TheoryBlock key={i} block={block} />)}
              </div>
              <button onClick={() => setTab("code")} style={{ width: "100%", background: "#00ff88", color: "#000", border: "none", borderRadius: "10px", padding: "14px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}>Got it — let me try the challenges →</button>
            </div>
          ) : (
            <MultiChallenge
              lesson={activeLesson}
              lessonStrikes={lessonStrikes}
              completed={completed.has(activeLesson.id)}
              onComplete={() => markComplete(activeLesson.id, activeLesson.xp)}
              onCodeChange={setCurrentCode}
              onStrike={(count) => handleStrike(activeLesson.id, count)}
              onReviewNeeded={handleReviewNeeded}
              onShowAI={() => setShowAI(true)}
              onBack={() => setView("curriculum")}
            />
          )}
        </div>
      )}

      {showAI && activeLesson && <AITutor lesson={activeLesson} userCode={currentCode} onClose={() => setShowAI(false)} />}
      {showWeakness && <WeaknessTracker strikes={strikes} onClose={() => setShowWeakness(false)} onReview={(lesson) => { setShowWeakness(false); startLesson(lesson, true); }} />}
      {showEmailCapture && <EmailCapture onClose={() => setShowEmailCapture(false)} onSubmit={(email, name) => { setShowEmailCapture(false); saveEmail(email, name); }} />}
      {showCertificate && <Certificate name={userName} xp={xp} completed={completed.size} total={ALL_LESSONS.length} onClose={() => setShowCertificate(false)} />}
      {showStreakReminder && <StreakReminder streak={streak} onClose={() => setShowStreakReminder(false)} />}
      {showConfetti && <Confetti />}
      {showMilestone && <MilestonePopup milestone={showMilestone} onClose={() => setShowMilestone(null)} onShowPaywall={() => setShowPaywall(true)} isPremiumUser={premium} />}
      {showPaywall && <Paywall onUnlock={() => setPremium(true)} onClose={() => setShowPaywall(false)} />}
      {showMiniGame && <MiniGame moduleId={showMiniGame.id} moduleName={showMiniGame.title} moduleColor={showMiniGame.color} xpReward={MINI_GAMES[showMiniGame.id]?.xpReward || 150} onClose={() => setShowMiniGame(null)} onXpEarned={(earned) => { setXp(prev => { const newXp = prev + earned; saveProgress(newXp, completed, strikes, bookmarks, streak, userEmail); return newXp; }); }} />}
      {cloudLoading && (
        <div style={{ position: "fixed", bottom: "16px", left: "50%", transform: "translateX(-50%)", background: "#0d0d0d", border: "1px solid #00ff8830", borderRadius: "8px", padding: "8px 16px", fontSize: "11px", color: "#00ff88", fontFamily: "'Space Mono', monospace", zIndex: 50, display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "8px", height: "8px", background: "#00ff88", borderRadius: "50%", animation: "glow 1s ease infinite" }} />
          Syncing your progress...
        </div>
      )}
    </div>
  );
}
