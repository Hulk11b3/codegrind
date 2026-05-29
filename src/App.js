import { useState, useEffect, useRef, Component } from "react";
import WEB_DEV_CURRICULUM from './data/webDevCurriculum';
import AI_DEV_CURRICULUM from './data/aiDevCurriculum';
import CAREER_CURRICULUM from './data/careerCurriculum';

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
          { question: "Complete the code: _____('Hello')", answer: "print", choices: ["print", "display", "show", "output"] },
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
            check: (output) => { const nums = output.match(/\d+/g); return nums && nums.some(n => parseInt(n) >= 100); },
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
        id: "f-strings", title: "f-strings — Clean String Formatting", xp: 125, analogy: "Think of a fill-in-the-blank form",
        theory: [
          { type: "plain", text: "A fill-in-the-blank form has fixed text with gaps: 'Dear ___, your invoice total is $___.' f-strings work exactly the same — fixed text with variable slots." },
          { type: "highlight", text: "An f-string lets you embed variables directly inside a string. Put f before the opening quote, then wrap any variable or expression in {curly braces}." },
          { type: "code", label: "PYTHON", color: "#7dd3fc", code: `name = "Marcus"\namt = 1500\nhr_rate = 75\n\nprint(f"Invoice for {name}: {amt}")\nprint(f"Hourly rate: {hr_rate}/hr")\nprint(f"Weekly at 40hrs: {hr_rate * 40}")` },
          { type: "plain", text: "You can also embed math directly: f'Total: {amount * 1.08:.2f}' — the :.2f rounds to 2 decimal places. You will use f-strings in almost every Python program you write." },
        ],
        hints: ["Put f before the opening quote: f'text here'", "Wrap any variable in curly braces: {variable_name}", "You can do math inside the braces: f'Total: {hours * rate}'"],
        challenges: [
          {
            prompt: "GUIDED: Run this code and see how f-strings slot variables into text automatically.",
            starterCode: `name = "Stanley White"\nrole = "Python Developer"\nhr_rate = 75\nhrs = 40\n\nprint(f"Name: {name}")\nprint(f"Role: {role}")\nprint("Rate: $" + str(hr_rate) + "/hr")\nprint("Weekly pay: $" + str(hrs * hr_rate))`,
            whatItDoes: "Each {variable} in an f-string is replaced with its value when printed. Dollar amounts use string concatenation here since $ inside {} can confuse the runner.",
            check: (output) => output.includes("Stanley") && output.includes("3000"),
          },
          {
            prompt: "MODIFY IT: Change name, role, and rate to your own values. Add a fifth line that prints your monthly income using f'Monthly: ${hours * rate * 4}'.",
            starterCode: `name = "Stanley White"\nrole = "Python Developer"\nrate = 75\nhrs = 40\n\nprint(f"Name: {name}")\nprint(f"Role: {role}")\nprint("Rate: $" + str(rate) + "/hr")\nprint("Weekly pay: $" + str(hrs * rate))`,
            whatItDoes: "Replace the values and add a monthly income line: print('Monthly: $' + str(hrs * rate * 4)).",
            check: (output) => !output.includes("Stanley White") && output.split("\n").filter(Boolean).length >= 5,
          },
          {
            prompt: "FROM SCRATCH: Create variables for client_name, project, hours, and rate. Use f-strings to print a 5-line project summary: client, project name, hours, rate, and total cost.",
            starterCode: `# Create your 4 variables\n# Print 5 lines using f-strings\n# Include: client, project, hours, rate, and total (hours * rate)\n`,
            whatItDoes: "Build the whole thing yourself. Every print line must use an f-string with at least one variable.",
            check: (output) => output.split("\n").filter(Boolean).length >= 4 && output.includes("$"),
          },
        ],
        quiz: [
          { question: "What letter goes before the opening quote to make an f-string?", answer: "f", choices: ["f", "s", "r", "b"] },
          { question: "How do you embed a variable called name in an f-string?", answer: "{name}", choices: ["{name}", "(name)", "[name]", "$name"] },
          { question: "f'Total: {5 * 20}' prints _____", answer: "Total: 100", choices: ["Total: 100", "Total: {5 * 20}", "Total: 5 * 20", "Error"] },
          { question: "What does :.2f do inside an f-string expression?", answer: "Rounds to 2 decimal places", choices: ["Rounds to 2 decimal places", "Converts to integer", "Adds a dollar sign", "Counts characters"] },
          { question: "Which is the correct f-string syntax?", answer: 'f"Hello {name}"', choices: ['f"Hello {name}"', '"Hello {name}"', 'f"Hello (name)"', 'f"Hello [name]"'] },
        ],
      },
    ],
  },
  {id: "decisions", title: "Making Decisions", icon: "🧠", color: "#ff6b35",
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
            prompt: "FROM SCRATCH: Write an if/else that checks if hourly_rate is above 50. Print 'Great rate!' if yes, 'Negotiate higher' if no.",
            starterCode: `# Create an hourly_rate variable\n# Write an if/else statement\n`,
            whatItDoes: "Build the condition yourself. Use if hourly_rate > 50: then indented print, then else: then indented print.",
            check: (output) => output.toLowerCase().includes("great") || output.toLowerCase().includes("negotiate"),
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
      {
        id: "elif", title: "Multiple Choices with elif", xp: 125, analogy: "Think of a traffic light",
        theory: [
          { type: "plain", text: "A traffic light has three options: Red = Stop. Yellow = Slow. Green = Go. Life is not always yes or no — sometimes there are multiple choices." },
          { type: "highlight", text: "elif means else if — check multiple conditions in order. The first one that is true runs." },
          { type: "code", label: "PYTHON", color: "#ff9a7d", code: `score = 85\n\nif score >= 90:\n    print("A — Excellent!")\nelif score >= 80:\n    print("B — Good work")\nelif score >= 70:\n    print("C — Keep going")\nelse:\n    print("Keep practicing")` },
        ],
        hints: ["Start with if, then elif, then else.", "Each condition needs a colon at the end.", "Only the first true condition runs — the rest are skipped."],
        challenges: [
          {
            prompt: "GUIDED: Run this code and see how elif checks multiple conditions in order.",
            starterCode: `score = 85\n\nif score >= 90:\n    print("A — Excellent!")\nelif score >= 80:\n    print("B — Good work")\nelif score >= 70:\n    print("C — Keep going")\nelse:\n    print("Keep practicing")`,
            whatItDoes: "Python checks each condition top to bottom. The first true one runs and the rest are skipped.",
            check: (output) => output.includes("Good") || output.includes("Excellent") || output.includes("Keep"),
          },
          {
            prompt: "MODIFY IT: Change score to 95 and run it. Then change to 65 and run again. See how the output changes.",
            starterCode: `score = 85\n\nif score >= 90:\n    print("A — Excellent!")\nelif score >= 80:\n    print("B — Good work")\nelif score >= 70:\n    print("C — Keep going")\nelse:\n    print("Keep practicing")`,
            whatItDoes: "Change the score value and see which condition triggers.",
            check: (output) => output.includes("Excellent") || output.includes("practicing"),
          },
          {
            prompt: "FROM SCRATCH: Write an elif chain that checks hours worked. Over 40: Overtime pay. Over 20: Standard pay. Otherwise: Part time pay.",
            starterCode: `# Create a hours variable\n# Write if/elif/else for the 3 pay rates\n`,
            whatItDoes: "Build the elif chain yourself. Three conditions, three outcomes.",
            check: (output) => output.includes("pay") || output.includes("Pay"),
          },
        ],
        quiz: [
          { question: "What does elif stand for?", answer: "else if", choices: ["else if", "end if", "extra if", "enter if"] },
          { question: "How many elif statements can you have?", answer: "As many as you need", choices: ["As many as you need", "Only 1", "Only 2", "Maximum 3"] },
          { question: "When does the else block run?", answer: "When no other condition is true", choices: ["When no other condition is true", "Always", "First", "Never"] },
          { question: "In an if/elif/else chain, how many blocks actually run?", answer: "Only 1", choices: ["Only 1", "All of them", "2", "Depends on conditions"] },
          { question: "What comes at the end of every if, elif, and else line?", answer: "A colon :", choices: ["A colon :", "A semicolon ;", "Parentheses ()", "Nothing"] },
        ],
      },
      {
        id: "combining-conditions", title: "AND / OR — Combining Conditions", xp: 125, analogy: "Think of a job application",
        theory: [
          { type: "plain", text: "A job posting says: you need 2 years experience AND a portfolio. Both must be true to get the interview." },
          { type: "highlight", text: "AND means both conditions must be true. OR means at least one must be true." },
          { type: "code", label: "PYTHON", color: "#ff9a7d", code: `has_portfolio = True\nhas_skills = True\nyears_exp = 3\n\nif has_portfolio and has_skills and years_exp >= 2:\n    print("You are hireable!")\nelse:\n    print("Keep building your skills")` },
          { type: "plain", text: "OR example: if score >= 90 or bonus_points > 5: — either condition being true is enough." },
        ],
        hints: ["Use the word and between two conditions.", "Use or when either being true is enough.", "True and False must be capitalized in Python."],
        challenges: [
          {
            prompt: "GUIDED: Run this code and see how AND requires both conditions to be true.",
            starterCode: `has_portfolio = True\nhas_skills = True\n\nif has_portfolio and has_skills:\n    print("You are hireable!")\nelse:\n    print("Missing requirements")\n\n# Now test OR\nincome = 2000\nbonus = 500\n\nif income > 3000 or bonus > 400:\n    print("Doing well financially!")\nelse:\n    print("Keep grinding")`,
            whatItDoes: "AND requires both to be true. OR only needs one. Run it and see the difference.",
            check: (output) => output.includes("hireable") || output.includes("financially"),
          },
          {
            prompt: "MODIFY IT: Change has_portfolio to False and run it. Then change has_skills to False too.",
            starterCode: `has_portfolio = True\nhas_skills = True\n\nif has_portfolio and has_skills:\n    print("You are hireable!")\nelse:\n    print("Missing requirements")`,
            whatItDoes: "With AND both must be True. Change one to False and see what happens.",
            check: (output) => output.includes("Missing"),
          },
          {
            prompt: "FROM SCRATCH: A client gets a discount if they have more than 3 projects AND budget over 5000. Write the condition.",
            starterCode: `projects = 4\nbudget = 6000\n\n# Write an if/else using AND\n# Print Discount applied! or No discount\n`,
            whatItDoes: "Both conditions must be true for the discount.",
            check: (output) => output.includes("Discount") || output.includes("discount") || output.includes("No"),
          },
        ],
        quiz: [
          { question: "AND requires _____ conditions to be true", answer: "both", choices: ["both", "one", "neither", "all or none"] },
          { question: "OR requires _____ condition to be true", answer: "at least one", choices: ["at least one", "both", "neither", "exactly two"] },
          { question: "True and False must be _____ in Python", answer: "capitalized", choices: ["capitalized", "lowercase", "in quotes", "in brackets"] },
          { question: "if x > 5 and x < 10 — what range of x passes?", answer: "6 to 9", choices: ["6 to 9", "5 to 10", "Any number", "No number"] },
          { question: "if x < 0 or x > 100 — what does this check?", answer: "x is out of range", choices: ["x is out of range", "x is in range", "x equals 0 or 100", "x is positive"] },
        ],
      },
      {
        id: "while-loops", title: "While Loops — Keep Going Until", xp: 150, analogy: "Think of a vending machine",
        theory: [
          { type: "plain", text: "A vending machine keeps waiting for money. While the amount inserted is less than the price, it keeps waiting. Once you insert enough — it gives you the item." },
          { type: "highlight", text: "A while loop keeps running AS LONG AS a condition is true. When the condition becomes false, it stops." },
          { type: "code", label: "PYTHON", color: "#ff9a7d", code: `counter = 1\n\nwhile counter <= 5:\n    print("Client", counter, "invoiced")\n    counter = counter + 1\n\nprint("All done!")` },
          { type: "plain", text: "Warning: always update your counter inside the loop or it will run forever!" },
        ],
        hints: ["Start with a counter: counter = 1", "while counter <= 5: then indent your code", "Always add counter = counter + 1 inside the loop"],
        challenges: [
          {
            prompt: "GUIDED: Run this code and see how a while loop keeps going until the condition is false.",
            starterCode: `counter = 1\n\nwhile counter <= 5:\n    print("Processing order #", counter)\n    counter = counter + 1\n\nprint("All orders processed!")`,
            whatItDoes: "The loop checks: is counter <= 5? If yes, run. Then counter increases. When counter hits 6 it stops.",
            check: (output) => output.includes("5") && output.includes("All orders"),
          },
          {
            prompt: "MODIFY IT: Change the limit from 5 to 8. Change the message to something about clients.",
            starterCode: `counter = 1\n\nwhile counter <= 5:\n    print("Processing order #", counter)\n    counter = counter + 1\n\nprint("All orders processed!")`,
            whatItDoes: "Change the number in while counter <= and the print message.",
            check: (output) => output.includes("8") || output.split("\n").filter(Boolean).length >= 8,
          },
          {
            prompt: "FROM SCRATCH: Write a while loop that starts at 1 and prints each number up to 10, then prints Done counting!",
            starterCode: `# Create a counter starting at 1\n# Write while counter <= 10:\n# Print the counter\n# Increment counter\n# After loop print Done counting!\n`,
            whatItDoes: "Build the whole loop yourself. Remember to increment counter each time.",
            check: (output) => output.includes("10") && output.includes("Done"),
          },
        ],
        quiz: [
          { question: "A while loop runs as long as the condition is _____", answer: "True", choices: ["True", "False", "Running", "Complete"] },
          { question: "What stops a while loop?", answer: "The condition becomes False", choices: ["The condition becomes False", "A print statement", "The def keyword", "A return value"] },
          { question: "What happens if you forget to update the counter?", answer: "The loop runs forever", choices: ["The loop runs forever", "The loop stops immediately", "Python crashes", "Nothing happens"] },
          { question: "counter = counter + 1 can also be written as _____", answer: "counter += 1", choices: ["counter += 1", "counter++", "counter + 1", "add(counter)"] },
          { question: "What is the difference between for and while loops?", answer: "for repeats a set number of times, while repeats until a condition is false", choices: ["for repeats a set number of times, while repeats until a condition is false", "They are the same", "while is faster", "for is more powerful"] },
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
            prompt: "MODIFY IT: Change the numbers in the existing 3 calls to your own revenue/costs. Then add a 4th call — try calculate_profit(8000, 2500) or your own values.",
            starterCode: `def calculate_profit(revenue, costs):\n    return revenue - costs\n\nprint(calculate_profit(10000, 3000))\nprint(calculate_profit(5000, 1200))\nprint(calculate_profit(25000, 8000))`,
            whatItDoes: "Change the numbers in each call and add a 4th line. The function definition stays the same — only the inputs change.",
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
      {
        id: "function-parameters", title: "Function Parameters and Defaults", xp: 175, analogy: "Think of ordering coffee",
        theory: [
          { type: "plain", text: "At a coffee shop if you do not specify milk they use regular milk by default. You can still ask for oat milk if you want — it overrides the default." },
          { type: "highlight", text: "Default parameters mean a function works even if you do not provide every input. You can always override them." },
          { type: "code", label: "PYTHON", color: "#c4b5fd", code: `def send_invoice(client, amount, currency="USD", tax_rate=0.08):\n    tax = amount * tax_rate\n    total = amount + tax\n    print(f"Invoice for {client}: {currency}{total:.2f}")\n\nsend_invoice("Marcus", 1500)\nsend_invoice("Tamika", 2000, "EUR")\nsend_invoice("DeShawn", 800, tax_rate=0.0)` },
        ],
        hints: ["Default parameters go after required ones: def greet(name, greeting='Hello'):", "Call with just required args or override defaults", "Use keyword args: send_invoice('Marcus', 1500, tax_rate=0.0)"],
        challenges: [
          {
            prompt: "GUIDED: Run this code and see how default parameters work.",
            starterCode: `def send_invoice(client, amount, currency="USD", tax_rate=0.08):\n    tax = amount * tax_rate\n    total = amount + tax\n    print(f"Invoice for {client}: {currency}{total:.2f}")\n\nsend_invoice("Marcus", 1500)\nsend_invoice("Tamika", 2000, "EUR")\nsend_invoice("DeShawn", 800, tax_rate=0.0)`,
            whatItDoes: "The function uses USD and 8% tax by default. You can override either or both.",
            check: (output) => output.split("\n").filter(Boolean).length >= 3,
          },
          {
            prompt: "MODIFY IT: Add a fourth call with your own client name and a custom tax_rate of 0.05.",
            starterCode: `def send_invoice(client, amount, currency="USD", tax_rate=0.08):\n    tax = amount * tax_rate\n    total = amount + tax\n    print(f"Invoice for {client}: {currency}{total:.2f}")\n\nsend_invoice("Marcus", 1500)\nsend_invoice("Tamika", 2000, "EUR")\nsend_invoice("DeShawn", 800, tax_rate=0.0)`,
            whatItDoes: "Add your own call to the function with a custom tax rate.",
            check: (output) => output.split("\n").filter(Boolean).length >= 4,
          },
          {
            prompt: "FROM SCRATCH: Write a function called project_quote that takes client_name and hours with a default rate of 75. Print a formatted quote.",
            starterCode: `# def project_quote(client_name, hours, rate=75):\n#     total = hours * rate\n#     print(...)\n\n# Test with 3 different calls\n`,
            whatItDoes: "Build the function with a default rate. Test it with and without the rate override.",
            check: (output) => output.split("\n").filter(Boolean).length >= 3,
          },
        ],
        quiz: [
          { question: "Default parameters must come _____ required parameters", answer: "after", choices: ["after", "before", "instead of", "mixed with"] },
          { question: "If you call a function without providing a default parameter it uses _____", answer: "the default value", choices: ["the default value", "None", "0", "an error"] },
          { question: "How do you override a default parameter?", answer: "Pass a value when calling the function", choices: ["Pass a value when calling the function", "Delete the default", "Use a loop", "Cannot be overridden"] },
          { question: "def greet(name, greeting='Hello'): — which is required?", answer: "name", choices: ["name", "greeting", "both", "neither"] },
          { question: "Calling send_invoice('Marcus', 1500, tax_rate=0.0) — what does tax_rate=0.0 do?", answer: "Overrides the default tax rate", choices: ["Overrides the default tax rate", "Creates a new variable", "Breaks the function", "Has no effect"] },
        ],
      },
      {
        id: "return-values", title: "Return Values — Getting Results Back", xp: 175, analogy: "Think of a calculator",
        theory: [
          { type: "plain", text: "A calculator does not just display the answer — it gives you a result you can use again. You can take that number and add it to something else." },
          { type: "highlight", text: "return sends a value back from a function so you can use it elsewhere. A function without return gives you nothing back." },
          { type: "code", label: "PYTHON", color: "#c4b5fd", code: `def get_stats(numbers):\n    total = sum(numbers)\n    average = total / len(numbers)\n    highest = max(numbers)\n    return total, average, highest\n\ntotal, avg, high = get_stats([1500, 2200, 900, 3100])\nprint("Total:", total)\nprint("Average:", avg)\nprint("Highest:", high)` },
        ],
        hints: ["return can send back multiple values separated by commas", "Capture multiple returns: total, avg = get_stats(numbers)", "Without return a function gives back None"],
        challenges: [
          {
            prompt: "GUIDED: Run this code and see how a function can return multiple values at once.",
            starterCode: `def get_stats(numbers):\n    total = sum(numbers)\n    average = total / len(numbers)\n    highest = max(numbers)\n    return total, average, highest\n\nsales = [1500, 2200, 900, 3100, 1800]\ntotal, avg, high = get_stats(sales)\nprint("Total sales:", total)\nprint("Average sale:", avg)\nprint("Best sale:", high)`,
            whatItDoes: "The function calculates 3 things and returns all 3 at once.",
            check: (output) => output.split("\n").filter(Boolean).length >= 3,
          },
          {
            prompt: "MODIFY IT: Add a fourth return value — the lowest sale. Capture it and print it.",
            starterCode: `def get_stats(numbers):\n    total = sum(numbers)\n    average = total / len(numbers)\n    highest = max(numbers)\n    return total, average, highest\n\nsales = [1500, 2200, 900, 3100, 1800]\ntotal, avg, high = get_stats(sales)\nprint("Total sales:", total)\nprint("Average sale:", avg)\nprint("Best sale:", high)`,
            whatItDoes: "Add lowest = min(numbers) to the function and return it with the others.",
            check: (output) => output.split("\n").filter(Boolean).length >= 4,
          },
          {
            prompt: "FROM SCRATCH: Write a function called analyze_income that takes a list of monthly incomes and returns total, average, and whether average is above 5000.",
            starterCode: `# def analyze_income(incomes):\n#     total = ...\n#     average = ...\n#     is_good = average > 5000\n#     return total, average, is_good\n\n# Test it\nmonthly = [4500, 5200, 6100, 4800, 5500]\n`,
            whatItDoes: "Return 3 values including a boolean. Print all three results.",
            check: (output) => output.split("\n").filter(Boolean).length >= 3,
          },
        ],
        quiz: [
          { question: "What does return do in a function?", answer: "Sends a value back to the caller", choices: ["Sends a value back to the caller", "Prints the result", "Ends the program", "Creates a variable"] },
          { question: "Can a function return multiple values?", answer: "Yes, separated by commas", choices: ["Yes, separated by commas", "No, only one", "Only if they are the same type", "Only numbers"] },
          { question: "What does a function return if it has no return statement?", answer: "None", choices: ["None", "0", "False", "An error"] },
          { question: "total, avg = get_stats(data) — what is this called?", answer: "Unpacking multiple return values", choices: ["Unpacking multiple return values", "Creating two variables", "A loop", "A condition"] },
          { question: "Why use return instead of print inside a function?", answer: "So you can use the result in other calculations", choices: ["So you can use the result in other calculations", "Print is slower", "Return is required", "No reason"] },
        ],
      },
      {
        id: "scope", title: "Scope — Where Variables Live", xp: 150, analogy: "Think of rooms in a house",
        theory: [
          { type: "plain", text: "A TV in your bedroom is only in your bedroom. Someone in the kitchen cannot use it. Variables inside a function are like that TV — only accessible inside that room." },
          { type: "highlight", text: "Scope determines where a variable can be seen. Local variables live inside functions. Global variables live everywhere." },
          { type: "code", label: "PYTHON", color: "#c4b5fd", code: `company_name = "CodeGrind"  # Global\n\ndef get_client_info(name):\n    greeting = "Hello"  # Local to this function\n    return greeting + " " + name + " from " + company_name\n\nprint(get_client_info("Marcus"))\nprint(company_name)  # Works — it is global\n# print(greeting)  # Would crash — greeting is local` },
        ],
        hints: ["Variables created inside a function are local — only available in that function", "Variables created outside functions are global — available everywhere", "Use global keyword to modify a global variable inside a function"],
        challenges: [
          {
            prompt: "GUIDED: Run this code and see how local and global variables work differently.",
            starterCode: `business_name = "Stanley White Consulting"  # Global\nbase_rate = 75  # Global\n\ndef calculate_quote(hours, client):\n    total = hours * base_rate  # Uses global base_rate\n    message = "Quote for " + client + ": $" + str(total)  # Local variable\n    return message\n\nprint(calculate_quote(20, "Marcus"))\nprint(calculate_quote(40, "Tamika"))\nprint("Business:", business_name)`,
            whatItDoes: "The function uses the global base_rate but message is local to the function.",
            check: (output) => output.split("\n").filter(Boolean).length >= 3,
          },
          {
            prompt: "MODIFY IT: Change base_rate to 100 at the top and run it. Both quotes should update automatically.",
            starterCode: `business_name = "Stanley White Consulting"\nbase_rate = 75\n\ndef calculate_quote(hours, client):\n    total = hours * base_rate\n    message = "Quote for " + client + ": $" + str(total)\n    return message\n\nprint(calculate_quote(20, "Marcus"))\nprint(calculate_quote(40, "Tamika"))\nprint("Business:", business_name)`,
            whatItDoes: "Change base_rate at the top. The function automatically uses the new value.",
            check: (output) => output.includes("2000") || output.includes("4000"),
          },
          {
            prompt: "FROM SCRATCH: Create a global variable called company_rate set to 80. Write a function that uses it to calculate a project cost for any hours input.",
            starterCode: `# Create company_rate = 80 globally\n\n# def project_cost(hours, client_name):\n#     Use company_rate inside\n#     return a formatted string\n\n# Test with 3 different calls\n`,
            whatItDoes: "The function reads the global rate without it being passed as a parameter.",
            check: (output) => output.split("\n").filter(Boolean).length >= 3,
          },
        ],
        quiz: [
          { question: "A local variable is created _____", answer: "inside a function", choices: ["inside a function", "at the top of the file", "in a loop", "anywhere"] },
          { question: "A global variable can be accessed _____", answer: "anywhere in the file", choices: ["anywhere in the file", "only in functions", "only in loops", "only once"] },
          { question: "What happens if you try to use a local variable outside its function?", answer: "Python raises a NameError", choices: ["Python raises a NameError", "It returns None", "It uses the last value", "Nothing happens"] },
          { question: "Why is scope important?", answer: "Prevents variables from accidentally conflicting", choices: ["Prevents variables from accidentally conflicting", "Makes code faster", "Required by Python", "Helps with printing"] },
          { question: "company_name = 'CodeGrind' at the top of a file is a _____ variable", answer: "global", choices: ["global", "local", "function", "parameter"] },
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
          { type: "plain", text: "Sandbox note: in this browser environment files are temporary and won't appear on your computer. In real Python they save to your hard drive permanently." },
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
            check: (output) => !output.includes("Stanley White") && output.toLowerCase().includes("skills"),
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
      {
        id: "csv-files", title: "CSV Files — Working With Spreadsheet Data", xp: 200, analogy: "Think of a spreadsheet export",
        theory: [
          { type: "plain", text: "When a client exports their sales data from Excel or Google Sheets, they get a .csv file — rows of data separated by commas. Python reads and writes these instantly with the built-in csv module." },
          { type: "highlight", text: "CSV = Comma Separated Values. Every spreadsheet can be exported as CSV. Reading and writing CSV is one of the most in-demand freelance automation skills." },
          { type: "code", label: "PYTHON — Writing", color: "#86efac", code: `import csv\n\nrows = [\n    ["Name", "Amount", "Status"],\n    ["Marcus", "1500", "Paid"],\n    ["Tamika", "2200", "Pending"],\n]\n\nwith open("clients.csv", "w", newline="") as file:\n    writer = csv.writer(file)\n    writer.writerows(rows)\nprint("CSV saved!")` },
          { type: "code", label: "PYTHON — Reading", color: "#7dd3fc", code: `import csv\n\nwith open("clients.csv", "r") as file:\n    reader = csv.reader(file)\n    for row in reader:\n        print(row)` },
          { type: "plain", text: "Sandbox note: files are temporary in this browser environment. In real Python they save to your hard drive. Real use: automate monthly reports, process client lists, generate invoices from a spreadsheet." },
        ],
        hints: ["import csv at the top of your file", "Write with csv.writer(file) then writer.writerows(list_of_lists)", "Values read from CSV are always strings — convert numbers with int(row[2]) or float(row[2])"],
        challenges: [
          {
            prompt: "GUIDED: Run this code and see how Python writes a CSV then reads it back row by row.",
            starterCode: `import csv\n\ndata = [\n    ["Name", "Hours", "Rate", "Total"],\n    ["Marcus", "20", "75", "1500"],\n    ["Tamika", "15", "100", "1500"],\n    ["DeShawn", "30", "75", "2250"],\n]\n\nwith open("invoices.csv", "w", newline="") as file:\n    writer = csv.writer(file)\n    writer.writerows(data)\n\nprint("CSV written!")\n\nwith open("invoices.csv", "r") as file:\n    reader = csv.reader(file)\n    for row in reader:\n        print(row)`,
            whatItDoes: "Writes a 4-column table to a CSV file then reads every row back as a list.",
            check: (output) => output.includes("Marcus") && output.includes("written"),
          },
          {
            prompt: "MODIFY IT: Add 2 more clients to the data list. Change Marcus's rate to 100 and total to 2000. Run it and verify the new rows appear.",
            starterCode: `import csv\n\ndata = [\n    ["Name", "Hours", "Rate", "Total"],\n    ["Marcus", "20", "75", "1500"],\n    ["Tamika", "15", "100", "1500"],\n    ["DeShawn", "30", "75", "2250"],\n]\n\nwith open("invoices.csv", "w", newline="") as file:\n    writer = csv.writer(file)\n    writer.writerows(data)\n\nwith open("invoices.csv", "r") as file:\n    reader = csv.reader(file)\n    for row in reader:\n        print(row)`,
            whatItDoes: "Add 2 rows to data and update Marcus's numbers. Should see 7 rows total when read back.",
            check: (output) => output.split("\n").filter(Boolean).length >= 6,
          },
          {
            prompt: "FROM SCRATCH: Create a CSV with 5 client records (name, project, amount). Write it. Read it back and print only rows where amount is over 1000. Hint: amounts come back as strings — use int(row[2]) to compare.",
            starterCode: `import csv\n\n# Create data list with header + 5 rows\n# Write to clients.csv\n# Read back and filter: only rows where int(row[2]) > 1000\n`,
            whatItDoes: "Write, read, and filter CSV data. The int() conversion is a real-world pattern you will use constantly.",
            check: (output) => output.split("\n").filter(Boolean).length >= 2 && /\d{4,}/.test(output),
          },
        ],
        quiz: [
          { question: "What does CSV stand for?", answer: "Comma Separated Values", choices: ["Comma Separated Values", "Computer Stored Variables", "Code Sorted Values", "Column Separated View"] },
          { question: "Which module do you import to work with CSV files?", answer: "csv", choices: ["csv", "file", "data", "spreadsheet"] },
          { question: "Why use newline='' when opening a CSV for writing?", answer: "Prevents extra blank lines between rows on Windows", choices: ["Prevents extra blank lines between rows on Windows", "Makes the file smaller", "Required for reading", "Adds headers automatically"] },
          { question: "Values read from a CSV file are always what type?", answer: "Strings", choices: ["Strings", "Integers", "Floats", "Lists"] },
          { question: "writer.writerows(data) does what?", answer: "Writes every row in the list to the file at once", choices: ["Writes every row in the list to the file at once", "Writes one row", "Reads the file", "Creates headers automatically"] },
        ],
      },
      {
        id: "list-methods", title: "List Methods — Managing Collections", xp: 150, analogy: "Think of managing a team roster",
        theory: [
          { type: "plain", text: "A coach manages a team roster — adding players, removing ones who left, sorting by performance, finding who scored the most." },
          { type: "highlight", text: "List methods are built-in tools for managing your lists. They let you add, remove, sort, search, and count." },
          { type: "code", label: "PYTHON", color: "#67e8f9", code: `clients = ["Marcus", "Tamika", "DeShawn"]\nclients.append("Keisha")        # Add to end\nclients.insert(0, "Jerome")     # Add at position\nclients.remove("DeShawn")       # Remove by value\nclients.sort()                  # Sort alphabetically\nprint(clients)\nprint("Count:", len(clients))\nprint("Index of Tamika:", clients.index("Tamika"))` },
        ],
        hints: [".append() adds to end, .insert(position, value) adds anywhere", ".remove(value) removes by value, .pop() removes last item", ".sort() sorts in place, sorted(list) returns a new sorted list"],
        challenges: [
          {
            prompt: "GUIDED: Run this code and see all the ways you can manage a list.",
            starterCode: `skills = ["Python", "JavaScript", "Excel"]\n\nskills.append("SQL")\nprint("After append:", skills)\n\nskills.insert(0, "Communication")\nprint("After insert:", skills)\n\nskills.remove("Excel")\nprint("After remove:", skills)\n\nskills.sort()\nprint("After sort:", skills)\nprint("Total skills:", len(skills))`,
            whatItDoes: "You used 4 different list methods to manage the same list.",
            check: (output) => output.split("\n").filter(Boolean).length >= 5,
          },
          {
            prompt: "MODIFY IT: Start with your own 4 skills. Add 2 more with append. Remove one. Sort and print the final list.",
            starterCode: `skills = ["Python", "JavaScript", "Excel"]\n\nskills.append("SQL")\nprint("After append:", skills)\n\nskills.remove("Excel")\nprint("After remove:", skills)\n\nskills.sort()\nprint("After sort:", skills)`,
            whatItDoes: "Replace the starter skills with your own and modify the operations.",
            check: (output) => output.toLowerCase().includes("after") && output.split("\n").filter(Boolean).length >= 3,
          },
          {
            prompt: "FROM SCRATCH: Create a client list with 5 names. Sort it. Find the index of one client. Remove the last one with .pop(). Print the final count.",
            starterCode: `# Create clients list with 5 names\n# Sort it\n# Find index of one client\n# Remove last with .pop()\n# Print final count\n`,
            whatItDoes: "Combine multiple list methods in sequence.",
            check: (output) => output.split("\n").filter(Boolean).length >= 4,
          },
        ],
        quiz: [
          { question: "Which method adds an item to the END of a list?", answer: ".append()", choices: [".append()", ".insert()", ".add()", ".push()"] },
          { question: "Which method removes an item by its VALUE?", answer: ".remove()", choices: [".remove()", ".pop()", ".delete()", ".clear()"] },
          { question: "Which method sorts a list in place?", answer: ".sort()", choices: [".sort()", ".order()", ".arrange()", "sorted()"] },
          { question: ".pop() removes and returns _____", answer: "the last item", choices: ["the last item", "the first item", "a random item", "all items"] },
          { question: "How do you find the position of an item in a list?", answer: ".index(value)", choices: [".index(value)", ".find(value)", ".position(value)", ".search(value)"] },
        ],
      },
      {
        id: "dictionary-methods", title: "Dictionary Methods — Working With Data", xp: 150, analogy: "Think of a smart contact book",
        theory: [
          { type: "plain", text: "A smart contact book lets you look up people safely, update their info, add new contacts, and get all names or all numbers at once." },
          { type: "highlight", text: "Dictionary methods let you safely access, update, and loop through your data." },
          { type: "code", label: "PYTHON", color: "#67e8f9", code: `client = {"name": "Marcus", "budget": 2500, "project": "Website"}\n\n# Safe access — returns None instead of crashing\nphone = client.get("phone", "No phone on file")\nprint(phone)\n\n# Update multiple keys at once\nclient.update({"budget": 3000, "status": "active"})\nprint(client)\n\n# Get all keys and values\nprint(list(client.keys()))\nprint(list(client.values()))` },
        ],
        hints: [".get(key, default) is safer than dict[key] — no crash if key missing", ".update({}) adds or updates multiple keys at once", ".keys() and .values() return all keys or values"],
        challenges: [
          {
            prompt: "GUIDED: Run this code and see how dictionary methods make working with data safer and easier.",
            starterCode: `profile = {"name": "Stanley White", "role": "Developer", "rate": 75}\n\n# Safe access\ncity = profile.get("city", "City not set")\nprint("City:", city)\n\n# Update multiple fields\nprofile.update({"city": "Atlanta", "available": True, "rate": 100})\nprint("Updated profile:", profile)\n\n# Loop through keys and values\nfor key, value in profile.items():\n    print(f"  {key}: {value}")`,
            whatItDoes: "You used .get(), .update(), and .items() on the same dictionary.",
            check: (output) => output.includes("Atlanta") && output.split("\n").filter(Boolean).length >= 5,
          },
          {
            prompt: "MODIFY IT: Add your own fields using .update(). Use .get() to safely access a key that does not exist.",
            starterCode: `profile = {"name": "Stanley White", "role": "Developer", "rate": 75}\n\ncity = profile.get("city", "City not set")\nprint("City:", city)\n\nprofile.update({"city": "Atlanta", "available": True})\nprint("Updated:", profile)`,
            whatItDoes: "Add at least 2 new fields with update and safely access a missing key.",
            check: (output) => !output.includes("City not set") || output.includes("Updated"),
          },
          {
            prompt: "FROM SCRATCH: Create a client dictionary. Use .get() to safely check for a missing field. Use .update() to add 3 new fields. Print all keys and all values separately.",
            starterCode: `# Create a client dictionary with 3 fields\n# Use .get() on a missing key\n# Use .update() to add 3 new fields\n# Print list(client.keys())\n# Print list(client.values())\n`,
            whatItDoes: "Practice safe dictionary access and bulk updates.",
            check: (output) => output.split("\n").filter(Boolean).length >= 4,
          },
        ],
        quiz: [
          { question: "What is the advantage of .get() over dict[key]?", answer: "It returns a default value instead of crashing if key is missing", choices: ["It returns a default value instead of crashing if key is missing", "It is faster", "It creates the key automatically", "No difference"] },
          { question: ".update({'rate': 100}) does what?", answer: "Adds or updates the rate key", choices: ["Adds or updates the rate key", "Creates a new dictionary", "Deletes rate", "Prints rate"] },
          { question: "dict.keys() returns _____", answer: "All keys in the dictionary", choices: ["All keys in the dictionary", "All values", "The first key", "The length"] },
          { question: "How do you remove a key from a dictionary?", answer: "del dict[key] or dict.pop(key)", choices: ["del dict[key] or dict.pop(key)", "dict.remove(key)", "dict.delete(key)", "dict[key] = None"] },
          { question: "dict.items() is used for _____", answer: "Looping through key-value pairs", choices: ["Looping through key-value pairs", "Counting items", "Sorting the dictionary", "Finding a key"] },
        ],
      },
      {
        id: "list-comprehensions", title: "List Comprehensions — Power Filtering", xp: 175, analogy: "Think of a smart shopping filter",
        theory: [
          { type: "plain", text: "An online store filter: 'Show me only shoes under $100 in size 10.' One line of criteria, instant filtered results. List comprehensions do the same thing for any Python list — in a single line." },
          { type: "highlight", text: "A list comprehension builds a new list in one line. It can filter items, transform items, or both at once. Pattern: [expression for item in list if condition]" },
          { type: "code", label: "PYTHON — filter and transform", color: "#7dd3fc", code: `invoices = [500, 1200, 300, 2500, 800, 150]\n\n# Filter only\nbig = [n for n in invoices if n > 1000]\nprint(big)  # [1200, 2500]\n\n# Transform only\nwith_tax = [round(n * 1.08, 2) for n in invoices]\nprint(with_tax)\n\n# Filter AND transform\nbig_with_tax = [round(n * 1.08, 2) for n in invoices if n > 1000]\nprint(big_with_tax)` },
          { type: "code", label: "PYTHON — with dictionaries", color: "#67e8f9", code: `clients = [\n    {"name": "Marcus", "paid": True, "amount": 1500},\n    {"name": "Tamika", "paid": False, "amount": 800},\n]\n\nunpaid_names = [c["name"] for c in clients if not c["paid"]]\nprint(unpaid_names)  # ['Tamika']\n\ntotal_paid = sum(c["amount"] for c in clients if c["paid"])\nprint(total_paid)  # 1500` },
        ],
        hints: ["Pattern: [expression for item in list]", "Add a filter: [expression for item in list if condition]", "Use sum() around a comprehension to total filtered values: sum(c['amount'] for c in clients if c['paid'])"],
        challenges: [
          {
            prompt: "GUIDED: Run this code and see how one-line comprehensions replace multi-step loops.",
            starterCode: `invoices = [500, 1200, 300, 2500, 800, 150, 4000]\n\n# Filter: only invoices over 1000\nbig = [inv for inv in invoices if inv > 1000]\nprint("Over $1000:", big)\n\n# Transform: add 8% tax to every invoice\nwith_tax = [round(inv * 1.08, 2) for inv in invoices]\nprint("With tax:", with_tax)\n\n# Filter AND transform together\nbig_taxed = [round(inv * 1.08, 2) for inv in invoices if inv > 1000]\nprint("Big ones with tax:", big_taxed)\n\nprint("Total of big invoices: $", sum(big))`,
            whatItDoes: "Three comprehensions: filter only, transform only, filter + transform. The last line uses sum() to total the filtered list.",
            check: (output) => output.includes("1000") && output.split("\n").filter(Boolean).length >= 4,
          },
          {
            prompt: "MODIFY IT: Change the filter threshold from 1000 to 500. Add a fourth comprehension that collects all invoices under 400. Print the count of small invoices using len().",
            starterCode: `invoices = [500, 1200, 300, 2500, 800, 150, 4000]\n\nbig = [inv for inv in invoices if inv > 1000]\nprint("Over $1000:", big)\n\nwith_tax = [round(inv * 1.08, 2) for inv in invoices]\nprint("With tax:", with_tax)`,
            whatItDoes: "Change the threshold, add a new comprehension going the other direction, and count the results.",
            check: (output) => output.split("\n").filter(Boolean).length >= 3,
          },
          {
            prompt: "FROM SCRATCH: Using the clients list below, write 3 comprehensions: (1) names of unpaid clients, (2) total of all paid invoices using sum(), (3) names of clients who owe more than 1000.",
            starterCode: `clients = [\n    {"name": "Marcus", "amount": 1500, "paid": True},\n    {"name": "Tamika", "amount": 800, "paid": False},\n    {"name": "DeShawn", "amount": 2200, "paid": True},\n    {"name": "Keisha", "amount": 1100, "paid": False},\n    {"name": "Jerome", "amount": 400, "paid": True},\n]\n\n# 1. unpaid_names = [...]\n# 2. paid_total = sum(...)\n# 3. big_debtors = [...]\n\nprint(unpaid_names)\nprint(paid_total)\nprint(big_debtors)`,
            whatItDoes: "Three comprehensions on the same data. #2 uses sum() wrapping the comprehension.",
            check: (output) => output.split("\n").filter(Boolean).length >= 3 && /\d+/.test(output),
          },
        ],
        quiz: [
          { question: "What does [x * 2 for x in numbers] produce?", answer: "A new list with every number doubled", choices: ["A new list with every number doubled", "The original list modified", "The sum of all numbers", "True or False"] },
          { question: "How do you add a filter to a list comprehension?", answer: "Add 'if condition' at the end", choices: ["Add 'if condition' at the end", "Use .filter()", "Add 'where condition'", "Use a separate loop"] },
          { question: "[n for n in nums if n > 0] returns _____", answer: "Only the positive numbers as a new list", choices: ["Only the positive numbers as a new list", "All numbers doubled", "True for each positive", "The count of positives"] },
          { question: "sum(c['amount'] for c in clients if c['paid']) does what?", answer: "Totals the amount field for paid clients only", choices: ["Totals the amount field for paid clients only", "Counts paid clients", "Returns a list of amounts", "Prints each amount"] },
          { question: "A list comprehension is a compressed version of a _____", answer: "for loop", choices: ["for loop", "while loop", "function definition", "if statement"] },
        ],
      },
      {
        id: "nested-data", title: "Nested Data — Lists of Dictionaries", xp: 200, analogy: "Think of a spreadsheet with rows",
        theory: [
          { type: "plain", text: "A spreadsheet has rows. Each row has multiple columns — name, email, amount, status. In Python you can store this as a list of dictionaries." },
          { type: "highlight", text: "Nested data means dictionaries inside lists. This is how real apps store collections of records — users, orders, products, clients." },
          { type: "code", label: "PYTHON", color: "#67e8f9", code: `clients = [\n    {"name": "Marcus", "amount": 1500, "paid": True},\n    {"name": "Tamika", "amount": 2200, "paid": False},\n    {"name": "DeShawn", "amount": 900, "paid": True},\n]\n\nfor client in clients:\n    status = "✓ Paid" if client["paid"] else "⏳ Pending"\n    print(client["name"] + ": $" + str(client["amount"]) + " - " + status)\n\ntotal = sum(c["amount"] for c in clients)\nprint("Total:", total)` },
        ],
        hints: ["Access nested data: clients[0]['name'] gets first client's name", "Loop with for client in clients: then client['key']", "List comprehension: [c['amount'] for c in clients] gets all amounts"],
        challenges: [
          {
            prompt: "GUIDED: Run this code and see how a list of dictionaries works like a database table.",
            starterCode: `clients = [\n    {"name": "Marcus Johnson", "amount": 1500, "paid": True},\n    {"name": "Tamika Williams", "amount": 2200, "paid": False},\n    {"name": "DeShawn Carter", "amount": 900, "paid": True},\n    {"name": "Keisha Brown", "amount": 3100, "paid": False},\n]\n\nprint("=== CLIENT REPORT ===")\nfor client in clients:\n    status = "Paid" if client["paid"] else "Pending"\n    print(client["name"] + ": $" + str(client["amount"]) + " - " + status)\n\ntotal = sum(c["amount"] for c in clients)\npaid_total = sum(c["amount"] for c in clients if c["paid"])\nprint("\nTotal: $", total)\nprint("Collected: $", paid_total)\nprint("Outstanding: $", total - paid_total)`,
            whatItDoes: "You built a mini invoice tracking system using nested data.",
            check: (output) => output.includes("CLIENT REPORT") && output.includes("Total"),
          },
          {
            prompt: "MODIFY IT: Add your own 2 clients to the list. Change one paid status. Run and see the totals update automatically.",
            starterCode: `clients = [\n    {"name": "Marcus Johnson", "amount": 1500, "paid": True},\n    {"name": "Tamika Williams", "amount": 2200, "paid": False},\n    {"name": "DeShawn Carter", "amount": 900, "paid": True},\n]\n\nfor client in clients:\n    status = "Paid" if client["paid"] else "Pending"\n    print(client["name"] + ": $" + str(client["amount"]) + " - " + status)\n\ntotal = sum(c["amount"] for c in clients)\nprint("Total:", total)`,
            whatItDoes: "Add 2 new client dictionaries to the list and see all calculations update.",
            check: (output) => output.split("\n").filter(Boolean).length >= 5,
          },
          {
            prompt: "FROM SCRATCH: Create a list of 4 products with name, price, and in_stock fields. Loop through and print only the ones that are in stock. Calculate total value of all in-stock items.",
            starterCode: `# Create products list with 4 dictionaries\n# Each has: name, price, in_stock (True/False)\n\n# Loop and print only in-stock products\n\n# Calculate total value of in-stock items\n`,
            whatItDoes: "Filter and aggregate nested data — a real-world data skill.",
            check: (output) => output.split("\n").filter(Boolean).length >= 2 && /\d+/.test(output) && (output.toLowerCase().includes("total") || output.toLowerCase().includes("stock")),
          },
        ],
        quiz: [
          { question: "A list of dictionaries is useful for storing _____", answer: "Collections of records with multiple fields", choices: ["Collections of records with multiple fields", "Single values", "Numbers only", "Functions"] },
          { question: "How do you access the name of the first client in clients[0]?", answer: "clients[0]['name']", choices: ["clients[0]['name']", "clients['name'][0]", "clients.name[0]", "clients[0].name"] },
          { question: "sum(c['amount'] for c in clients) does what?", answer: "Adds up all amount values", choices: ["Adds up all amount values", "Counts clients", "Finds the highest amount", "Creates a new list"] },
          { question: "How do you filter a list of dictionaries?", answer: "Use an if condition inside the loop", choices: ["Use an if condition inside the loop", "Use .filter()", "Use .where()", "Use .select()"] },
          { question: "This data structure is similar to what in real apps?", answer: "A database table", choices: ["A database table", "A calculator", "A file system", "A loop"] },
        ],
      },
    ],
  },
  {
    id: "logic2", title: "Logic Level Up", icon: "⚡", color: "#f472b6",
    lessons: [
      {
        id: "break-continue", title: "break and continue — Controlling Loops", xp: 125, analogy: "Think of a fire drill",
        theory: [
          { type: "plain", text: "A fire drill has two commands: evacuate now (stop everything) or stay in place (skip this step and wait). Loops have the same two controls: break stops the loop entirely, continue skips just the current item." },
          { type: "highlight", text: "break exits the loop immediately. continue skips the rest of the current iteration and jumps to the next one. Both work in for and while loops." },
          { type: "code", label: "PYTHON", color: "#f9a8d4", code: `clients = ["Marcus", "Tamika", "STOP", "DeShawn"]\n\nfor client in clients:\n    if client == "STOP":\n        break\n    print("Processing:", client)\n\nprint("---")\n\nfor client in clients:\n    if client == "STOP":\n        continue\n    print("Invoicing:", client)` },
          { type: "plain", text: "Real use: break when you find what you need and can stop scanning. continue to skip blank rows, invalid data, or entries that do not match your criteria." },
        ],
        hints: ["break exits the entire loop — nothing after it in the loop runs for the current or future iterations", "continue only skips the current iteration — the loop keeps going with the next item", "Both work inside for loops and while loops"],
        challenges: [
          {
            prompt: "GUIDED: Run this code. break stops at 47. continue skips 47 and 99 but keeps processing everything else.",
            starterCode: `numbers = [10, 25, 3, 47, 8, 99, 15]\n\nprint("--- BREAK: stop at first number over 40 ---")\nfor n in numbers:\n    if n > 40:\n        print("Found:", n, "— stopping")\n        break\n    print("Checking:", n)\n\nprint("\\n--- CONTINUE: skip numbers over 40 ---")\nfor n in numbers:\n    if n > 40:\n        continue\n    print("Processing:", n)`,
            whatItDoes: "Same list, two different controls. break stops everything. continue skips one item and keeps going.",
            check: (output) => output.includes("stopping") || output.includes("BREAK"),
          },
          {
            prompt: "MODIFY IT: Change the list to client names. Use break to stop at the first client named 'HOLD'. In a second loop, use continue to skip clients whose name starts with 'X'.",
            starterCode: `clients = ["Marcus", "Tamika", "Xavier", "HOLD", "DeShawn"]\n\n# Loop 1: process clients, break when you hit HOLD\nfor client in clients:\n    pass  # replace with your code\n\nprint("---")\n\n# Loop 2: invoice clients, skip names starting with X\nfor client in clients:\n    pass  # replace with your code`,
            whatItDoes: "Loop 1 breaks at HOLD. Loop 2 uses continue to skip Xavier. Both loops iterate the same list.",
            check: (output) => output.split("\n").filter(Boolean).length >= 2,
          },
          {
            prompt: "FROM SCRATCH: Write a while loop that counts from 1 upward. Use continue to skip multiples of 3. Use break to stop when you exceed 20. Print every number that is not skipped.",
            starterCode: `# counter = 1\n# while True:\n#     if counter % 3 == 0:\n#         counter += 1\n#         continue\n#     if counter > 20:\n#         break\n#     print(counter)\n#     counter += 1\n`,
            whatItDoes: "while True with both break and continue. % 3 == 0 checks for multiples of 3.",
            check: (output) => output.split("\n").filter(Boolean).length >= 10 && !output.includes("\n3\n") && !output.includes("\n6\n"),
          },
        ],
        quiz: [
          { question: "What does break do inside a loop?", answer: "Exits the loop immediately", choices: ["Exits the loop immediately", "Skips the current iteration", "Pauses the loop", "Restarts the loop"] },
          { question: "What does continue do inside a loop?", answer: "Skips the rest of the current iteration and moves to the next", choices: ["Skips the rest of the current iteration and moves to the next", "Exits the loop", "Pauses execution", "Starts a new loop"] },
          { question: "When would you use break?", answer: "When you found what you need and do not have to keep searching", choices: ["When you found what you need and do not have to keep searching", "To skip bad data", "To restart from the beginning", "When the loop is too slow"] },
          { question: "When would you use continue?", answer: "To skip invalid or unwanted items without stopping the loop", choices: ["To skip invalid or unwanted items without stopping the loop", "To exit the loop", "To repeat the current item", "To slow the loop down"] },
          { question: "counter % 3 == 0 checks if counter is _____", answer: "Divisible by 3 with no remainder", choices: ["Divisible by 3 with no remainder", "Equal to 3", "Less than 3", "A decimal number"] },
        ],
      },
      {
        id: "nested-loops", title: "Nested Loops — Loops Inside Loops", xp: 150, analogy: "Think of a multiplication table",
        theory: [
          { type: "plain", text: "A multiplication table has rows and columns. For each row you go through every single column. That is a nested loop: for each outer item, repeat all inner items." },
          { type: "highlight", text: "A nested loop puts one loop inside another. The inner loop completes entirely for each single step of the outer loop. Total runs = outer count times inner count." },
          { type: "code", label: "PYTHON", color: "#f9a8d4", code: `services = ["Website", "Automation"]\nclients = ["Marcus", "Tamika", "DeShawn"]\n\nfor service in services:\n    for client in clients:\n        print(f"Pitch {service} to {client}")\n\nprint(f"Total pitches: {len(services) * len(clients)}")` },
          { type: "plain", text: "Real use: pair every product with every client, generate all scheduling combinations, process a grid of data row by row then cell by cell." },
        ],
        hints: ["Indent the inner loop inside the outer loop body", "The inner loop runs completely for each single step of the outer loop", "Total iterations = len(outer_list) * len(inner_list)"],
        challenges: [
          {
            prompt: "GUIDED: Run this and count the output lines. Verify it matches 3 services times 3 clients.",
            starterCode: `services = ["Website", "Automation", "SEO"]\nclients = ["Marcus", "Tamika", "DeShawn"]\n\nfor service in services:\n    print(f"--- {service} pitches ---")\n    for client in clients:\n        print(f"  Pitch {service} to {client}")\n\nprint(f"Total combinations: {len(services) * len(clients)}")`,
            whatItDoes: "3 services x 3 clients = 9 pitch combinations. Inner loop runs 3 times per outer iteration.",
            check: (output) => output.includes("9") || output.split("\n").filter(Boolean).length >= 9,
          },
          {
            prompt: "MODIFY IT: Add a third list called rates = [75, 100, 125]. Add a third nested loop so each service-client pair is shown at each rate. Print the total number of combinations at the end.",
            starterCode: `services = ["Website", "Automation"]\nclients = ["Marcus", "Tamika"]\n\nfor service in services:\n    for client in clients:\n        print(f"Pitch {service} to {client}")\n\nprint(f"Total: {len(services) * len(clients)}")`,
            whatItDoes: "Add rates list and a third for loop inside the second. 2 x 2 x 3 = 12 combinations.",
            check: (output) => output.split("\n").filter(Boolean).length >= 10,
          },
          {
            prompt: "FROM SCRATCH: Build a weekly schedule. days = ['Mon','Tue','Wed']. tasks = ['Email clients','Review invoices','Update portfolio']. Print each task assigned to each day. Print the total task-day count.",
            starterCode: `days = ["Mon", "Tue", "Wed"]\ntasks = ["Email clients", "Review invoices", "Update portfolio"]\n\n# Nested loop: for each day, print each task\n# Print total combinations at the end\n`,
            whatItDoes: "3 days x 3 tasks = 9 assignments. Simple schedule generator — real apps use this exact pattern.",
            check: (output) => output.includes("9") || output.split("\n").filter(Boolean).length >= 8,
          },
        ],
        quiz: [
          { question: "In a nested loop, how many times does the inner loop run total?", answer: "outer count times inner count", choices: ["outer count times inner count", "The same as the outer loop", "Only once", "Independently of the outer loop"] },
          { question: "If the outer loop runs 4 times and inner runs 3 times, total iterations = _____", answer: "12", choices: ["12", "7", "4", "3"] },
          { question: "What is a common real-world use of nested loops?", answer: "Generating all combinations of two lists", choices: ["Generating all combinations of two lists", "Sorting a single list", "Counting items in one list", "Calling a function once"] },
          { question: "The inner loop must be _____ the outer loop", answer: "Indented inside", choices: ["Indented inside", "At the same indentation level as", "Placed before", "Placed after with no indentation"] },
          { question: "len(services) * len(clients) gives you _____", answer: "The total number of iterations the nested loop will run", choices: ["The total number of iterations the nested loop will run", "The sum of both list lengths", "Which list is longer", "The index of the last item"] },
        ],
      },
      {
        id: "boolean-logic", title: "Boolean Logic — True, False, and Everything In Between", xp: 125, analogy: "Think of a logic puzzle",
        theory: [
          { type: "plain", text: "A logic puzzle: The treasure is in Room A OR Room B. It is NOT in Room A. Therefore it is in Room B. That chain of True and False reasoning is exactly what boolean logic is — and Python does it natively." },
          { type: "highlight", text: "Python evaluates everything as True or False. Understanding what is truthy vs falsy lets you write cleaner conditions without extra comparisons." },
          { type: "code", label: "PYTHON — truthy and falsy", color: "#f9a8d4", code: `# Falsy — act like False in conditions\nprint(bool(0))      # False\nprint(bool(""))     # False\nprint(bool([]))     # False\nprint(bool(None))   # False\n\n# Truthy — act like True\nprint(bool(1))      # True\nprint(bool("hi"))   # True\nprint(bool([1]))    # True` },
          { type: "code", label: "PYTHON — not operator", color: "#fda4af", code: `name = ""\nbalance = 0\nclients = ["Marcus"]\n\nif not name:\n    print("Name is missing")   # prints — empty string is falsy\n\nif not balance:\n    print("No balance")        # prints — 0 is falsy\n\nif not clients:\n    print("No clients")        # does NOT print — list has items` },
        ],
        hints: ["0, empty string, empty list, and None are all falsy — they act like False in if statements", "Any non-zero number, non-empty string, or non-empty list is truthy", "Use 'not x' instead of 'x == False' or 'len(x) == 0' — it is cleaner and more Pythonic"],
        challenges: [
          {
            prompt: "GUIDED: Run this code and see what Python considers truthy and falsy for every common type.",
            starterCode: `values = [0, 1, "", "hello", [], [1, 2], None, True, False, 42]\n\nfor v in values:\n    label = "TRUTHY" if v else "falsy"\n    print(str(repr(v)) + " -> " + label)\n\nprint("\\n--- Practical example ---")\nname = ""\nbal = 500\n\nif not name:\n    print("Name required — please fill in")\n\nif not bal:\n    print("No balance")\nelse:\n    print("Balance: $" + str(bal))`,
            whatItDoes: "Iterates through every common type and labels it truthy or falsy. Then shows the practical pattern.",
            check: (output) => output.includes("TRUTHY") && output.includes("falsy") && output.split("\n").filter(Boolean).length >= 8,
          },
          {
            prompt: "MODIFY IT: Add a clients list. If the list is empty print 'No clients yet — go get some!'. If it has items print how many. Use 'if not clients' for the empty check — no len() needed.",
            starterCode: `name = ""\nbal = 500\nclients = []  # Try empty, then add some names\n\nif not name:\n    print("Name required")\n\nif not bal:\n    print("No balance")\nelse:\n    print("Balance: $" + str(bal))\n\n# Add your clients check here using: if not clients:`,
            whatItDoes: "if not clients: checks for an empty list without len(clients) == 0. Cleaner and standard Python style.",
            check: (output) => output.split("\n").filter(Boolean).length >= 2,
          },
          {
            prompt: "FROM SCRATCH: Write a function called is_ready_to_invoice(client_name, hours_worked, rate) that returns True only if: name is not empty AND hours > 0 AND rate > 0. Test it 4 times including edge cases like empty name and zero hours.",
            starterCode: `# def is_ready_to_invoice(client_name, hours_worked, rate):\n#     return bool(client_name) and hours_worked > 0 and rate > 0\n\n# Test 4 times:\n# 1. Valid input\n# 2. Empty name\n# 3. Zero hours\n# 4. Zero rate\n`,
            whatItDoes: "Combines truthy checking with and in one return statement. This pattern guards real-world functions against bad input.",
            check: (output) => output.split("\n").filter(Boolean).length >= 4 && output.includes("True") && output.includes("False"),
          },
        ],
        quiz: [
          { question: "Which of these is falsy in Python?", answer: "0", choices: ["0", "1", "'False'", "[0]"] },
          { question: "What does 'not True' evaluate to?", answer: "False", choices: ["False", "True", "None", "Error"] },
          { question: "if not name: — when does this block run?", answer: "When name is an empty string, None, 0, or empty list", choices: ["When name is an empty string, None, 0, or empty list", "Always", "Never", "When name equals the word not"] },
          { question: "bool([]) evaluates to _____", answer: "False", choices: ["False", "True", "None", "0"] },
          { question: "The most Pythonic way to check if a list is empty is _____", answer: "if not my_list:", choices: ["if not my_list:", "if len(my_list) == 0:", "if my_list == []:", "if my_list is empty:"] },
        ],
      },
      {
        id: "error-handling", title: "Error Handling — When Things Go Wrong", xp: 150, analogy: "Think of a seatbelt",
        theory: [
          { type: "plain", text: "A seatbelt does not stop car crashes. But when a crash happens, it protects you from the worst outcome. Your program can crash too — error handling is your seatbelt." },
          { type: "highlight", text: "try/except lets your code attempt something risky and handle it cleanly if it fails — instead of crashing and losing everything." },
          { type: "code", label: "PYTHON", color: "#f9a8d4", code: `try:\n    result = 100 / 0\n    print(result)\nexcept ZeroDivisionError:\n    print("Cannot divide by zero!")\nexcept Exception as e:\n    print("Something went wrong:", e)\n\nprint("Program keeps running!")` },
          { type: "plain", text: "Real use: any code that reads files, calls APIs, does math with user input, or connects to a database should have error handling. Professional code never crashes silently." },
        ],
        hints: ["Wrap risky code in try: then indent it.", "Under except: write what happens if it fails.", "except Exception as e: catches any error and gives you the message in e."],
        challenges: [
          {
            prompt: "GUIDED: Run this code. It tries to divide by zero — a crash waiting to happen — but error handling catches it and the program keeps running.",
            starterCode: `try:\n    result = 100 / 0\n    print(result)\nexcept ZeroDivisionError:\n    print("Cannot divide by zero!")\n\nprint("Program keeps running!")\n\n# Now test with a valid number\ntry:\n    result = 100 / 4\n    print("Result:", result)\nexcept ZeroDivisionError:\n    print("Cannot divide by zero!")`,
            whatItDoes: "The first try fails. The except catches it. The second try succeeds. In both cases the program keeps running.",
            check: (output) => output.includes("keeps running") || output.includes("Result"),
          },
          {
            prompt: "MODIFY IT: Wrap this JSON parsing in a try/except. If it fails print 'Invalid data received'. If it succeeds print the name from the data. (json.loads converts text into a Python dictionary — if the text is malformed it crashes.)",
            starterCode: `import json\n\nraw_data = '{invalid json here'\n\n# Wrap this in try/except\ndata = json.loads(raw_data)\nprint("Name:", data["name"])`,
            whatItDoes: "json.loads() converts text to a dictionary but crashes on invalid input. Wrap it in try/except to handle the failure gracefully.",
            check: (output) => output.includes("Invalid") || output.includes("wrong") || output.includes("failed"),
          },
          {
            prompt: "FROM SCRATCH: Write a safe_divide function that takes two numbers. If the divisor is zero, return None and print Cannot divide by zero. Otherwise return the result. Test it 3 times — once with zero.",
            starterCode: `# def safe_divide(a, b):\n#     try:\n#         ...\n#     except ZeroDivisionError:\n#         ...\n\n# Test 3 times\n`,
            whatItDoes: "A reusable safe division function. This pattern is used everywhere in professional code.",
            check: (output) => output.split("\n").filter(Boolean).length >= 3,
          },
        ],
        quiz: [
          { question: "What does try/except prevent?", answer: "Your program crashing when an error occurs", choices: ["Your program crashing when an error occurs", "All errors from happening", "Slow code", "Infinite loops"] },
          { question: "What runs inside the except block?", answer: "Code that handles the error gracefully", choices: ["Code that handles the error gracefully", "The normal code", "Nothing", "The try block again"] },
          { question: "except Exception as e: — what is e?", answer: "The error message", choices: ["The error message", "A variable name you must use", "The line number", "The function name"] },
          { question: "What happens to code after a try/except block?", answer: "It always runs whether or not an error occurred", choices: ["It always runs whether or not an error occurred", "It only runs if no error occurred", "It only runs if an error occurred", "It never runs"] },
          { question: "Which is better professional practice?", answer: "Wrapping risky code in try/except", choices: ["Wrapping risky code in try/except", "Hoping the code never fails", "Printing errors and crashing", "Ignoring errors"] },
        ],
      },
    ],
  },
  {
    id: "python-pro", title: "Python Pro Skills", icon: "🐍", color: "#34d399",
    lessons: [
      {
        id: "string-methods", title: "String Methods — Manipulating Text", xp: 150, analogy: "Think of a word processor",
        theory: [
          { type: "plain", text: "Microsoft Word lets you uppercase text, find and replace words, count characters, and trim spaces. Python has all of those built in — available instantly on any string." },
          { type: "highlight", text: "String methods are built-in tools for manipulating text. You call them with a dot after the variable name." },
          { type: "code", label: "PYTHON", color: "#6ee7b7", code: `name = "stanley white"\n\nprint(name.upper())       # STANLEY WHITE\nprint(name.title())       # Stanley White\nprint(name.replace("white", "williams"))\nprint(len(name))          # 13\nprint(name.strip())       # removes leading/trailing spaces` },
          { type: "plain", text: "Real use: cleaning messy data from spreadsheets, formatting client names, processing form inputs, building reports automatically." },
        ],
        hints: ["Call a method with a dot: name.upper()", "Chain methods: name.strip().title()", "len(variable) counts characters — it is a function, not a method"],
        challenges: [
          {
            prompt: "GUIDED: Run this code and see all the string methods in action. Notice how each one transforms the same string differently.",
            starterCode: `name = "  stanley white  "\n\nprint("Original:", repr(name))\nprint("Stripped:", name.strip())\nprint("Upper:", name.strip().upper())\nprint("Title:", name.strip().title())\nprint("Length:", len(name.strip()))\nprint("Replace:", name.strip().title().replace("White", "Williams"))`,
            whatItDoes: "Each method transforms the string. Chaining methods applies them in sequence left to right.",
            check: (output) => output.includes("STANLEY") || output.includes("Stanley"),
          },
          {
            prompt: "MODIFY IT: Take the messy client string below and clean it up — strip spaces, convert to title case, then check if it contains the word 'johnson'. Print all results.",
            starterCode: `client = "  MARCUS johnson   "\n\n# Clean it up\ncleaned = client.strip()\nprint("Stripped:", cleaned)\nprint("Title:", cleaned.title())\nprint("Upper:", cleaned.upper())\nprint("Contains johnson:", "johnson" in client.lower())`,
            whatItDoes: "Process a realistic messy string the way you would with data from a spreadsheet or form.",
            check: (output) => output.includes("Marcus") || output.includes("MARCUS") || output.includes("johnson"),
          },
          {
            prompt: "FROM SCRATCH: Write a function called clean_name that takes any messy string, strips whitespace, converts to title case, and returns it. Test it on 5 different messy inputs.",
            starterCode: `# def clean_name(raw):\n#     # strip, then title case\n#     return ...\n\n# Test on 5 messy inputs\n`,
            whatItDoes: "A reusable text cleaner. This exact function is used in real data processing pipelines.",
            check: (output) => output.split("\n").filter(Boolean).length >= 5,
          },
        ],
        quiz: [
          { question: "How do you call a string method?", answer: "variable.method()", choices: ["variable.method()", "method(variable)", "string.call(method)", "run(method, variable)"] },
          { question: "name.upper() returns _____", answer: "The string in ALL CAPS", choices: ["The string in ALL CAPS", "The string reversed", "The length", "Nothing"] },
          { question: "name.strip() removes _____", answer: "Leading and trailing whitespace", choices: ["Leading and trailing whitespace", "All spaces", "Punctuation", "Numbers"] },
          { question: "name.title() does what?", answer: "Capitalizes the first letter of each word", choices: ["Capitalizes the first letter of each word", "Makes everything uppercase", "Reverses the string", "Counts words"] },
          { question: "How do you chain two methods?", answer: "name.strip().title()", choices: ["name.strip().title()", "name.strip() + title()", "title(name.strip())", "name.(strip)(title)"] },
        ],
      },
      {
        id: "list-methods-pro", title: "List Methods — Managing Collections", xp: 150, analogy: "Think of managing a team roster",
        theory: [
          { type: "plain", text: "A coach manages a roster — adding players, removing ones who left, sorting by performance, counting the team. Python lists have all of these operations built in." },
          { type: "highlight", text: "List methods let you add, remove, sort, search, and count. They are the tools that make lists powerful." },
          { type: "code", label: "PYTHON", color: "#6ee7b7", code: `clients = ["Marcus", "Tamika", "DeShawn"]\nclients.append("Keisha")       # Add to end\nclients.insert(0, "Jerome")    # Add at position 0\nclients.remove("DeShawn")      # Remove by value\nclients.sort()                 # Sort alphabetically\nprint(clients)\nprint("Count:", len(clients))\nprint("Position of Tamika:", clients.index("Tamika"))` },
          { type: "plain", text: "Real use: building client pipelines, filtering lists of data, sorting results, managing queues — essential for any automation script." },
        ],
        hints: [".append() adds to end, .insert(0, value) adds at the front", ".remove(value) removes by value — .pop() removes and returns the last item", ".sort() sorts in place and changes the original list"],
        challenges: [
          {
            prompt: "GUIDED: Run this code and watch how each method changes the list. Pay attention to the order of operations.",
            starterCode: `skills = ["Python", "JavaScript", "Excel"]\n\nskills.append("SQL")\nprint("After append:", skills)\n\nskills.insert(0, "Communication")\nprint("After insert:", skills)\n\nskills.remove("Excel")\nprint("After remove:", skills)\n\nskills.sort()\nprint("After sort:", skills)\nprint("Total skills:", len(skills))`,
            whatItDoes: "Four different methods each transform the list in a different way.",
            check: (output) => output.split("\n").filter(Boolean).length >= 5,
          },
          {
            prompt: "MODIFY IT: Start with your own 5 skills. Add 2 more with append. Remove one by value. Sort and print the final result. Print the index of one specific skill.",
            starterCode: `skills = ["Python", "JavaScript", "Excel"]\n\nskills.append("SQL")\nprint("After append:", skills)\n\nskills.remove("Excel")\nprint("After remove:", skills)\n\nskills.sort()\nprint("Sorted:", skills)`,
            whatItDoes: "Replace with your own skills and demonstrate all four operations.",
            check: (output) => !output.includes("Excel") && output.split("\n").filter(Boolean).length >= 3,
          },
          {
            prompt: "FROM SCRATCH: Create a client waitlist with 6 names. Sort it. Find the index of one client. Move the last client to the front using .pop() and .insert(). Print the final waitlist.",
            starterCode: `# Create waitlist with 6 names\n# Sort it\n# Find index of one client\n# Pop last, insert at front\n# Print final waitlist\n`,
            whatItDoes: "Combine multiple list methods to manage a realistic data set.",
            check: (output) => output.split("\n").filter(Boolean).length >= 4,
          },
        ],
        quiz: [
          { question: "Which method adds an item to the END of a list?", answer: ".append()", choices: [".append()", ".insert()", ".add()", ".push()"] },
          { question: "Which method removes an item by its VALUE?", answer: ".remove()", choices: [".remove()", ".pop()", ".delete()", ".discard()"] },
          { question: ".sort() changes _____", answer: "The original list in place", choices: ["The original list in place", "A copy of the list", "Nothing", "The list type"] },
          { question: ".pop() removes and returns _____", answer: "The last item", choices: ["The last item", "The first item", "A random item", "All items"] },
          { question: "How do you find the position of an item in a list?", answer: ".index(value)", choices: [".index(value)", ".find(value)", ".position(value)", ".where(value)"] },
        ],
      },
      {
        id: "functions-advanced", title: "Functions — Default Values and Multiple Returns", xp: 175, analogy: "Think of a professional calculator",
        theory: [
          { type: "plain", text: "A professional calculator remembers your last settings. When you open it, it defaults to degrees not radians. You can change it — but you do not have to every single time." },
          { type: "highlight", text: "Default parameters mean a function works without every input. Multiple return values mean one function can give you several results at once." },
          { type: "code", label: "PYTHON", color: "#6ee7b7", code: `def project_quote(client, hours, rate=75, tax=0.08):\n    subtotal = hours * rate\n    tax_amount = subtotal * tax\n    total = subtotal + tax_amount\n    return subtotal, tax_amount, total\n\nsub, tax, total = project_quote("Marcus", 20)\nprint("Subtotal: $" + str(sub))\nprint("Tax: $" + str(tax))\nprint("Total: $" + str(total))` },
          { type: "plain", text: "Real use: invoice generators, pricing calculators, data analysis functions — any function that produces multiple related results benefits from this pattern." },
        ],
        hints: ["Default parameters go after required ones: def func(required, optional=default):", "Capture multiple returns: a, b, c = my_function()", "If you only want one return value: result = my_function() gives you a tuple"],
        challenges: [
          {
            prompt: "GUIDED: Run this project quote function. Then call it with a custom rate of 100 and tax of 0.0 and see how the defaults are overridden.",
            starterCode: `def project_quote(client, hours, rate=75, tax=0.08):\n    subtotal = hours * rate\n    tax_amount = subtotal * tax\n    total = subtotal + tax_amount\n    return subtotal, tax_amount, total\n\n# Default rate and tax\nsub, tax_amt, total = project_quote("Marcus", 20)\nprint("Client: Marcus | Hours: 20 | Rate: $75")\nprint("Subtotal:", sub, "| Tax:", tax_amt, "| Total:", total)\n\n# Override both\nsub2, tax2, total2 = project_quote("Tamika", 40, rate=100, tax=0.0)\nprint("Client: Tamika | Hours: 40 | Rate: $100")\nprint("Subtotal:", sub2, "| Tax:", tax2, "| Total:", total2)`,
            whatItDoes: "The same function handles two completely different pricing scenarios without changing the function itself.",
            check: (output) => output.split("\n").filter(Boolean).length >= 4,
          },
          {
            prompt: "MODIFY IT: Add a fourth return value — the profit margin as a percentage assuming costs are 60% of the subtotal. Capture and print all four values.",
            starterCode: `def project_quote(client, hours, rate=75, tax=0.08):\n    subtotal = hours * rate\n    tax_amount = subtotal * tax\n    total = subtotal + tax_amount\n    return subtotal, tax_amount, total\n\nsub, tax_amt, total = project_quote("Marcus", 20)\nprint("Subtotal:", sub, "| Tax:", tax_amt, "| Total:", total)`,
            whatItDoes: "Add margin = subtotal * 0.4 to the function and return it as a fourth value. Capture all four: sub, tax_amt, total, margin = project_quote(...).",
            check: (output) => output.split("\n").filter(Boolean).length >= 3,
          },
          {
            prompt: "FROM SCRATCH: Write a function called analyze_week that takes a list of daily earnings. Return total, average, highest day, and lowest day. Test it with two different weeks of data.",
            starterCode: `# def analyze_week(earnings):\n#     total = sum(earnings)\n#     average = total / len(earnings)\n#     highest = max(earnings)\n#     lowest = min(earnings)\n#     return total, average, highest, lowest\n\n# Test with 2 weeks\nweek1 = [200, 350, 0, 420, 180, 300, 0]\n`,
            whatItDoes: "A real weekly income analyzer. Returns 4 values in one call.",
            check: (output) => output.split("\n").filter(Boolean).length >= 4,
          },
        ],
        quiz: [
          { question: "Default parameters must come _____ required parameters", answer: "after", choices: ["after", "before", "instead of", "anywhere"] },
          { question: "If you do not provide a default parameter when calling a function it uses _____", answer: "the default value", choices: ["the default value", "None", "0", "raises an error"] },
          { question: "a, b, c = my_function() — this is called _____", answer: "unpacking multiple return values", choices: ["unpacking multiple return values", "creating three variables", "calling three functions", "a loop"] },
          { question: "What does a function return if it has no return statement?", answer: "None", choices: ["None", "0", "False", "An empty string"] },
          { question: "Why use return instead of print inside a function?", answer: "So the result can be used in further calculations", choices: ["So the result can be used in further calculations", "Print is deprecated", "Return is faster", "No real reason"] },
        ],
      },
      {
        id: "modules", title: "Modules — Using Other People's Code", xp: 175, analogy: "Think of a professional toolbox",
        theory: [
          { type: "plain", text: "A plumber does not forge their own wrenches. They buy a professional toolbox full of tools built by experts. Python modules are that toolbox — thousands of tools built by experts, free to use." },
          { type: "highlight", text: "A module is a collection of ready-made functions you import and use. Python comes with dozens built in. Thousands more are available via pip." },
          { type: "code", label: "PYTHON", color: "#6ee7b7", code: `import random\nimport datetime\nimport math\n\nprint(random.randint(1, 100))      # Random number\nprint(datetime.date.today())       # Today's date\nprint(math.ceil(4.2))              # Round up = 5\nprint(math.floor(4.9))             # Round down = 4` },
          { type: "plain", text: "Real use: random for unique IDs and passwords, datetime for invoices and scheduling, math for financial calculations, os for file automation." },
        ],
        hints: ["Import at the top: import random", "Use the module name then dot: random.randint(1, 100)", "Import specific tools: from datetime import date — then just use date.today()"],
        challenges: [
          {
            prompt: "GUIDED: Run this code. See how three different modules each provide specialized tools you would otherwise have to build from scratch.",
            starterCode: `import random\nimport datetime\nimport math\n\n# Invoice number generator\ninvoice_num = random.randint(10000, 99999)\nprint("Invoice #:", invoice_num)\n\n# Today's date\ntoday = datetime.date.today()\nprint("Date:", today)\n\n# Financial rounding\nhours = 7.3\nrate = 75\nraw_total = hours * rate\nrounded_total = math.ceil(raw_total)\nprint("Hours:", hours, "| Raw:", raw_total, "| Billed:", rounded_total)`,
            whatItDoes: "Three modules working together to power a real invoice generation workflow.",
            check: (output) => output.includes("Invoice") && output.includes("Date"),
          },
          {
            prompt: "MODIFY IT: Add the os module. Use os.getcwd() to print the current working directory. Use random to generate a 6-digit verification code. Print both.",
            starterCode: `import random\nimport datetime\nimport math\n\ninvoice_num = random.randint(10000, 99999)\nprint("Invoice #:", invoice_num)\n\ntoday = datetime.date.today()\nprint("Date:", today)`,
            whatItDoes: "Add os import and use os.getcwd(). Generate a 6-digit code with random.randint(100000, 999999).",
            check: (output) => output.split("\n").filter(Boolean).length >= 4,
          },
          {
            prompt: "FROM SCRATCH: Build a professional invoice header generator. Use datetime for the date, random for a unique invoice ID, and math to round up any decimal amounts. Print a formatted invoice header.",
            starterCode: `import random\nimport datetime\nimport math\n\n# Generate invoice header\n# invoice_id = random 5-digit number\n# date = today\n# amount = 847.30\n# billed_amount = rounded up\n# Print a formatted header\n`,
            whatItDoes: "Combine three modules into one useful real-world tool.",
            check: (output) => output.split("\n").filter(Boolean).length >= 4,
          },
        ],
        quiz: [
          { question: "How do you import a module?", answer: "import module_name", choices: ["import module_name", "use module_name", "require module_name", "include module_name"] },
          { question: "random.randint(1, 10) returns _____", answer: "A random integer between 1 and 10", choices: ["A random integer between 1 and 10", "Always 5", "A random decimal", "10"] },
          { question: "from datetime import date lets you _____", answer: "Use date directly without writing datetime.date", choices: ["Use date directly without writing datetime.date", "Import all datetime functions", "Create a new date", "Nothing different"] },
          { question: "math.ceil(4.1) returns _____", answer: "5", choices: ["5", "4", "4.1", "4.5"] },
          { question: "What is pip used for?", answer: "Installing third-party modules not built into Python", choices: ["Installing third-party modules not built into Python", "Running Python files", "Debugging code", "Importing modules"] },
        ],
      },
      {
        id: "classes-intro", title: "Classes — Build Your Own Data Types", xp: 225, analogy: "Think of a blueprint",
        theory: [
          { type: "plain", text: "A blueprint defines what a house looks like — rooms, doors, windows. Each actual house built from that blueprint is its own independent building. A class is the blueprint. Each object created from it is its own independent house." },
          { type: "highlight", text: "A class bundles data (attributes) and actions (methods) into one reusable structure. Once defined, you can create as many objects from it as you need." },
          { type: "code", label: "PYTHON", color: "#6ee7b7", code: `class Client:\n    def __init__(self, name, rate):\n        self.name = name\n        self.rate = rate\n\n    def calculate_invoice(self, hours):\n        return self.rate * hours\n\n    def summary(self):\n        return "Client: " + self.name + " | Rate: $" + str(self.rate) + "/hr"\n\nmarcus = Client("Marcus", 75)\ntamika = Client("Tamika", 100)\n\nprint(marcus.summary())\nprint(marcus.calculate_invoice(20))\nprint(tamika.calculate_invoice(15))` },
          { type: "plain", text: "__init__ runs automatically when you create a new object. self refers to the specific object being created. Real use: every major Python library — Flask, Django, requests — uses classes. Understanding them is the door to advanced Python." },
        ],
        hints: ["Define with class ClassName: then indent everything inside", "__init__(self, ...) is the setup method — it runs when you create a new object", "Access attributes with self.name inside the class, and object.name outside"],
        challenges: [
          {
            prompt: "GUIDED: Run this Client class. Create two clients from the same blueprint and see how each one is independent.",
            starterCode: `class Client:\n    def __init__(self, name, rate):\n        self.name = name\n        self.rate = rate\n\n    def calculate_invoice(self, hours):\n        amt = self.rate * hours\n        return "Invoice for " + self.name + ": $" + str(amt)\n\n    def upgrade_rate(self, new_rate):\n        self.rate = new_rate\n        return self.name + "'s rate updated to $" + str(new_rate) + "/hr"\n\nmarcus = Client("Marcus", 75)\ntamika = Client("Tamika", 100)\n\nprint(marcus.calculate_invoice(20))\nprint(tamika.calculate_invoice(15))\nprint(marcus.upgrade_rate(90))\nprint(marcus.calculate_invoice(20))`,
            whatItDoes: "Two Client objects from one class. Each has its own data. Changing marcus does not affect tamika.",
            check: (output) => output.split("\n").filter(Boolean).length >= 4 && output.includes("Invoice"),
          },
          {
            prompt: "MODIFY IT: Add a method called discount_invoice(hours, discount_pct) that applies a percentage discount to the total. Test it on both clients.",
            starterCode: `class Client:\n    def __init__(self, name, rate):\n        self.name = name\n        self.rate = rate\n\n    def calculate_invoice(self, hours):\n        amt = self.rate * hours\n        return "Invoice for " + self.name + ": $" + str(amt)\n\nmarcus = Client("Marcus", 75)\ntamika = Client("Tamika", 100)\n\nprint(marcus.calculate_invoice(20))\nprint(tamika.calculate_invoice(15))`,
            whatItDoes: "Add the new method inside the class. discounted = total * (1 - discount_pct). Call it with marcus.discount_invoice(20, 0.1).",
            check: (output) => output.split("\n").filter(Boolean).length >= 4,
          },
          {
            prompt: "FROM SCRATCH: Build a FreelanceProject class with attributes: client_name, description, and hourly_rate. Add methods: get_quote(hours) that returns the cost, and status_report() that prints a formatted summary. Create 3 projects and call both methods on each.",
            starterCode: `# class FreelanceProject:\n#     def __init__(self, client_name, description, hourly_rate):\n#         ...\n#\n#     def get_quote(self, hours):\n#         ...\n#\n#     def status_report(self):\n#         ...\n\n# Create 3 project objects and test both methods\n`,
            whatItDoes: "Build the full class yourself. Three objects, two methods each.",
            check: (output) => output.split("\n").filter(Boolean).length >= 6,
          },
        ],
        quiz: [
          { question: "What is a class in Python?", answer: "A blueprint for creating objects with shared attributes and methods", choices: ["A blueprint for creating objects with shared attributes and methods", "A type of loop", "A built-in function", "A file format"] },
          { question: "What does __init__ do?", answer: "Runs automatically when a new object is created", choices: ["Runs automatically when a new object is created", "Deletes the object", "Imports a module", "Defines a loop"] },
          { question: "What does self refer to inside a class method?", answer: "The specific object the method is called on", choices: ["The specific object the method is called on", "The class itself", "The first argument", "Python itself"] },
          { question: "If you have class Dog: how do you create a dog object named rex?", answer: "rex = Dog()", choices: ["rex = Dog()", "rex = new Dog()", "Dog rex = ()", "create Dog as rex"] },
          { question: "What is the difference between a class and an object?", answer: "Class is the blueprint, object is the actual thing built from it", choices: ["Class is the blueprint, object is the actual thing built from it", "They are the same", "Object is the blueprint", "Class is used for math only"] },
        ],
      },
      {
        id: "real-project", title: "Mini Project — Client Invoice Generator", xp: 250, analogy: "Think of your first paid deliverable",
        theory: [
          { type: "plain", text: "Every skill you have learned in this module comes together here. Variables, functions, string methods, list methods, modules — all of it combined into one real tool." },
          { type: "highlight", text: "This is how professional coding works. You do not use one skill at a time. You combine them all to solve a real problem." },
          { type: "code", label: "PYTHON", color: "#fbbf24", code: `import datetime, random, math\n\ndef create_invoice(client, services, rate=75):\n    today = datetime.date.today()\n    invoice_id = random.randint(10000, 99999)\n    subtotal = sum(services.values()) * rate\n    tax = math.ceil(subtotal * 0.08)\n    total = subtotal + tax\n    print("=" * 40)\n    print("INVOICE #" + str(invoice_id) + " | " + str(today))\n    print("Client: " + client)\n    for service, hours in services.items():\n        print("  " + service + ": " + str(hours) + "hrs x $" + str(rate) + " = $" + str(hours*rate))\n    print("Tax: $" + str(tax) + " | TOTAL: $" + str(total))\n    print("=" * 40)` },
          { type: "plain", text: "This is billable work. A small business owner who cannot code would pay $200-500 for a tool like this. You just built it." },
        ],
        hints: ["Run the starter code first and understand every line.", "Change the client name and services to your own.", "Try adding a discount parameter — if total > 5000, apply 10% off."],
        challenges: [
          {
            prompt: "GUIDED: Run this invoice generator. Read every line carefully. Understand what each module and function contributes.",
            starterCode: `import datetime, random, math\n\ndef create_invoice(client, services, rate=75):\n    today = datetime.date.today()\n    invoice_id = random.randint(10000, 99999)\n    subtotal = sum(services.values()) * rate\n    tax = math.ceil(subtotal * 0.08)\n    total = subtotal + tax\n    print("=" * 40)\n    print("INVOICE #" + str(invoice_id) + " | " + str(today))\n    print("Client:", client)\n    for service, hours in services.items():\n        print("  " + service + ": " + str(hours) + "hrs x $" + str(rate) + " = $" + str(hours * rate))\n    print("Tax: $" + str(tax) + " | TOTAL: $" + str(total))\n    print("=" * 40)\n\ncreate_invoice("Marcus Johnson", {"Website": 10, "Automation": 5}, rate=75)`,
            whatItDoes: "A complete invoice generator using datetime, random, math, functions, loops, and dictionaries.",
            check: (output) => output.includes("INVOICE") || output.includes("TOTAL"),
          },
          {
            prompt: "MODIFY IT: Call create_invoice with your own client name, your own services, and a different rate. Add a third service.",
            starterCode: `import datetime, random, math\n\ndef create_invoice(client, services, rate=75):\n    today = datetime.date.today()\n    invoice_id = random.randint(10000, 99999)\n    subtotal = sum(services.values()) * rate\n    tax = math.ceil(subtotal * 0.08)\n    total = subtotal + tax\n    print("=" * 40)\n    print("INVOICE #" + str(invoice_id) + " | " + str(today))\n    print("Client:", client)\n    for service, hours in services.items():\n        print("  " + service + ": " + str(hours) + "hrs x $" + str(rate) + " = $" + str(hours * rate))\n    print("Tax: $" + str(tax) + " | TOTAL: $" + str(total))\n    print("=" * 40)\n\ncreate_invoice("Marcus Johnson", {"Website": 10, "Automation": 5}, rate=75)`,
            whatItDoes: "Use your own data. Show that you can adapt this tool to any client.",
            check: (output) => !output.includes("Marcus Johnson") && output.includes("INVOICE"),
          },
          {
            prompt: "FROM SCRATCH: Extend create_invoice to accept a discount percentage parameter (default 0). If discount > 0, apply it to the total and show the savings. Generate two invoices — one with discount, one without.",
            starterCode: `import datetime, random, math\n\n# Add discount parameter to create_invoice\n# Show original total, discount amount, final total\n# Call it twice - one with discount, one without\n`,
            whatItDoes: "Real feature extension. This is how professional code grows — you add capabilities without breaking what already works.",
            check: (output) => output.includes("INVOICE") && output.split("INVOICE").length >= 3,
          },
        ],
        quiz: [
          { question: "What does sum(services.values()) do?", answer: "Adds up all the hours in the services dictionary", choices: ["Adds up all the hours in the services dictionary", "Counts the services", "Returns the service names", "Converts to a list"] },
          { question: "Why use math.ceil() for tax?", answer: "To always round up — you never undercharge tax", choices: ["To always round up — you never undercharge tax", "It is more accurate", "Required by law", "math.ceil is faster"] },
          { question: "What is the benefit of a default rate=75 parameter?", answer: "You can call the function without specifying rate every time", choices: ["You can call the function without specifying rate every time", "Rate is locked at 75", "It prevents errors", "It is required"] },
          { question: "for service, hours in services.items() — what does this loop over?", answer: "Each key-value pair in the services dictionary", choices: ["Each key-value pair in the services dictionary", "Each character in a string", "A range of numbers", "A list of services"] },
          { question: "This project combines how many different Python concepts?", answer: "6 or more — modules, functions, loops, dicts, math, strings", choices: ["6 or more — modules, functions, loops, dicts, math, strings", "1 — just functions", "2 — loops and variables", "3 — math, strings, lists"] },
        ],
      },
    ],
  },
  {
    id: "real-world", title: "Real-World Python", icon: "🌍", color: "#f59e0b",
    lessons: [
      {
        id: "api-calls", title: "API Calls — Get Live Data From the Internet", xp: 225, analogy: "Think of ordering from a menu",
        theory: [
          { type: "plain", text: "A menu tells you what a restaurant offers. You send your order (a request), they process it and bring food back (a response). An API is a menu for data — you send a request to a URL, you get structured data back." },
          { type: "highlight", text: "An API call lets your Python code talk to the internet — pull live prices, weather, user data, anything with a public API. The requests module sends the request. .json() turns the response into a Python dictionary." },
          { type: "code", label: "PYTHON — the pattern", color: "#fcd34d", code: `import requests\n\nurl = "https://api.example.com/data"\nresponse = requests.get(url)\n\nif response.status_code == 200:  # 200 = success\n    data = response.json()       # turns JSON into a dict\n    print(data["key"])\nelse:\n    print("Failed:", response.status_code)` },
          { type: "plain", text: "Note: real API calls require running Python locally (pip install requests). The challenges below use simulated responses so you can practice the pattern in this sandbox. Real use: stock prices, weather apps, social stats, business dashboards — all fetched with this exact pattern." },
        ],
        hints: ["import requests at the top (requires pip install requests locally)", "response.status_code == 200 means success. 404 = not found. 500 = server error.", "response.json() converts the response body into a Python dictionary you can navigate like any dict"],
        challenges: [
          {
            prompt: "GUIDED: This simulates an API response. Run it and see how you navigate a JSON response exactly like a Python dictionary.",
            starterCode: `import json\n\n# Simulated API response (what requests.get().json() would return)\napi_response = json.loads('''{\n  "status": "success",\n  "user": {\n    "name": "Marcus Johnson",\n    "plan": "premium",\n    "invoices": [1500, 2200, 900, 3100]\n  }\n}''')\n\n# Navigate it like a dictionary\nprint("Status:", api_response["status"])\nprint("User:", api_response["user"]["name"])\nprint("Plan:", api_response["user"]["plan"])\nprint("Total invoiced: $", sum(api_response["user"]["invoices"]))\nprint("Invoices:", api_response["user"]["invoices"])`,
            whatItDoes: "A real API returns JSON — this is exactly the same dictionary structure you would get from response.json(). Navigating it is identical to nested dictionaries.",
            check: (output) => output.includes("Marcus") && output.includes("success"),
          },
          {
            prompt: "MODIFY IT: Add code that prints the highest invoice, the count of invoices, and whether the user is on the premium plan (True/False).",
            starterCode: `import json\n\napi_response = json.loads('''{\n  "status": "success",\n  "user": {\n    "name": "Marcus Johnson",\n    "plan": "premium",\n    "invoices": [1500, 2200, 900, 3100]\n  }\n}''')\n\nprint("User:", api_response["user"]["name"])\nprint("Total: $", sum(api_response["user"]["invoices"]))`,
            whatItDoes: "Add max(), len(), and a boolean check on the plan field. All standard dictionary operations.",
            check: (output) => output.split("\n").filter(Boolean).length >= 4 && /\d{3,}/.test(output),
          },
          {
            prompt: "FROM SCRATCH: Write a function called parse_api_response(data) that takes a dictionary response and returns: user's name, total of their invoices, and whether their plan is 'premium'. Test it on 2 different simulated responses.",
            starterCode: `import json\n\n# def parse_api_response(data):\n#     name = data["user"]["name"]\n#     total = sum(data["user"]["invoices"])\n#     is_premium = data["user"]["plan"] == "premium"\n#     return name, total, is_premium\n\nresponse1 = json.loads('{"user": {"name": "Tamika", "plan": "free", "invoices": [500, 800]}}')\nresponse2 = json.loads('{"user": {"name": "DeShawn", "plan": "premium", "invoices": [2000, 3500, 1200]}}')\n\n# Call parse_api_response on both and print results\n`,
            whatItDoes: "A reusable API response parser. This is exactly how real API integration code is structured.",
            check: (output) => output.split("\n").filter(Boolean).length >= 4 && output.includes("True") || output.split("\n").filter(Boolean).length >= 4 && output.includes("False"),
          },
        ],
        quiz: [
          { question: "What does requests.get(url) do?", answer: "Sends a GET request to a URL and returns a response object", choices: ["Sends a GET request to a URL and returns a response object", "Downloads a file to disk", "Opens a browser window", "Reads a local file"] },
          { question: "response.status_code of 200 means _____", answer: "The request succeeded", choices: ["The request succeeded", "An error occurred", "The server is offline", "The response is empty"] },
          { question: "response.json() converts the response into _____", answer: "A Python dictionary or list", choices: ["A Python dictionary or list", "A plain string", "A CSV file", "An integer"] },
          { question: "What is an API?", answer: "An interface that lets programs request data or actions from another service", choices: ["An interface that lets programs request data or actions from another service", "A type of database", "A Python module", "A web browser"] },
          { question: "JSON data from an API is navigated just like _____", answer: "A Python dictionary", choices: ["A Python dictionary", "A Python list", "A CSV file", "A plain string"] },
        ],
      },
      {
        id: "automation-script", title: "Automation Script — Combine Everything", xp: 250, analogy: "Think of your first client deliverable",
        theory: [
          { type: "plain", text: "A client has 50 client names in a messy text format. They need them cleaned up, sorted, deduplicated, and saved to a CSV. That is a 10-minute Python script worth $150–$300 on Fiverr." },
          { type: "highlight", text: "Automation scripts combine everything: string methods to clean data, lists to store it, loops to process it, CSV to save it, functions to organize it. This is the work people pay for." },
          { type: "code", label: "PYTHON — data cleaning pipeline", color: "#fcd34d", code: `import csv\n\ndef clean_name(raw):\n    return raw.strip().title()\n\nraw_clients = ["  marcus johnson ", "TAMIKA WILLIAMS  ", " deShawn carter"]\n\ncleaned = [clean_name(name) for name in raw_clients]\ncleaned.sort()\n\nwith open("cleaned_clients.csv", "w", newline="") as f:\n    writer = csv.writer(f)\n    writer.writerow(["Name"])\n    writer.writerows([[name] for name in cleaned])\n\nprint(f"Processed {len(cleaned)} clients")` },
          { type: "plain", text: "Every line of that script uses a skill you have already learned. The combination is what makes it valuable." },
        ],
        hints: ["Start by writing the clean_name function", "Use a list comprehension to apply it to every item", "Write to CSV last — first get the data right in memory"],
        challenges: [
          {
            prompt: "GUIDED: Run this data cleaning pipeline. Read every line — you have learned every concept in it.",
            starterCode: `import csv\n\ndef clean_entry(raw):\n    return raw.strip().title()\n\nraw_data = [\n    "  marcus johnson | 1500 | paid  ",\n    "TAMIKA WILLIAMS | 2200 | pending  ",\n    "  deShawn carter | 900 | paid",\n    "KEISHA BROWN  | 3100 | pending",\n]\n\nprocessed = []\nfor entry in raw_data:\n    parts = [p.strip() for p in entry.split("|")]\n    processed.append({\n        "name": clean_entry(parts[0]),\n        "amount": int(parts[1]),\n        "status": parts[2].lower()\n    })\n\nprocessed.sort(key=lambda x: x["name"])\n\nprint(f"Processed {len(processed)} records:")\nfor r in processed:\n    print(f"  {r['name']}: $" + str(r['amount']) + " (" + r['status'] + ")")\n\ntotal_amt = sum(r["amount"] for r in processed)\npaid_amt = sum(r["amount"] for r in processed if r["status"] == "paid")\nprint("Total: $" + str(total_amt) + " | Collected: $" + str(paid_amt) + " | Outstanding: $" + str(total_amt - paid_amt))`,
            whatItDoes: "A complete data pipeline: split messy strings, clean each part, build dictionaries, sort, filter, total. Every step uses what you already know.",
            check: (output) => output.includes("Processed") && output.includes("Total"),
          },
          {
            prompt: "MODIFY IT: Add a 5th client to raw_data. Change the clean_entry function to also replace any double spaces with a single space. Run and verify the new client appears sorted correctly.",
            starterCode: `import csv\n\ndef clean_entry(raw):\n    return raw.strip().title()\n\nraw_data = [\n    "  marcus johnson | 1500 | paid  ",\n    "TAMIKA WILLIAMS | 2200 | pending  ",\n    "  deShawn carter | 900 | paid",\n    "KEISHA BROWN  | 3100 | pending",\n]\n\nprocessed = []\nfor entry in raw_data:\n    parts = [p.strip() for p in entry.split("|")]\n    processed.append({"name": clean_entry(parts[0]), "amount": int(parts[1]), "status": parts[2].lower()})\n\nprocessed.sort(key=lambda x: x["name"])\nfor r in processed:\n    print("  " + r['name'] + ": $" + str(r['amount']) + " (" + r['status'] + ")")`,
            whatItDoes: "Add a 5th entry and improve the cleaner with .replace('  ', ' ').",
            check: (output) => output.split("\n").filter(Boolean).length >= 5,
          },
          {
            prompt: "FROM SCRATCH: Write a function called process_sales(raw_list) that takes a list of 'name|amount' strings, cleans and parses each one, and returns a sorted list of dictionaries. Then use it to print a summary and save to CSV.",
            starterCode: `import csv\n\n# def process_sales(raw_list):\n#     results = []\n#     for entry in raw_list:\n#         name, amount = entry.split("|")\n#         results.append({"name": name.strip().title(), "amount": int(amount.strip())})\n#     return sorted(results, key=lambda x: x["name"])\n\nsales_data = [\n    "jerome washington | 2800",\n    "  AALIYAH JONES | 1200",\n    "Brandon Lee  | 3400",\n    "  maya chen | 900",\n]\n\n# Call process_sales, print summary, write to CSV\n`,
            whatItDoes: "Full pipeline function. Clean, parse, sort, summarize, save. This is a real deliverable.",
            check: (output) => output.split("\n").filter(Boolean).length >= 4 && /\d{3,}/.test(output),
          },
        ],
        quiz: [
          { question: "What does .split('|') do to a string?", answer: "Splits it into a list at every | character", choices: ["Splits it into a list at every | character", "Removes all | characters", "Counts the | characters", "Adds | to the string"] },
          { question: "sorted(list, key=lambda x: x['name']) sorts by _____", answer: "The name field of each dictionary", choices: ["The name field of each dictionary", "The list index", "Alphabetically by first character only", "Nothing — lambda is optional"] },
          { question: "Why convert amounts with int() when reading string data?", answer: "So you can do math — strings cannot be added or compared as numbers", choices: ["So you can do math — strings cannot be added or compared as numbers", "It is required by Python", "To save memory", "To sort alphabetically"] },
          { question: "What is the value of building automation scripts?", answer: "They save clients hours of manual work — people pay $150-300+ per script", choices: ["They save clients hours of manual work — people pay $150-300+ per script", "They are only useful in big companies", "They require a CS degree", "Nothing — just for practice"] },
          { question: "In a data pipeline, which step should come first?", answer: "Get the data right in memory before writing to a file", choices: ["Get the data right in memory before writing to a file", "Write to CSV first then clean", "Print everything then process", "Import modules last"] },
        ],
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
        challenges: [
          {
            type: "guided",
            prompt: "Run the code. Then change the name and goal variables to your own values and run it again.",
            starterCode: `let name = "Stanley"\nlet goal = "financial freedom"\nlet year = 2026\n\nconsole.log("Name:", name)\nconsole.log("Goal:", goal)\nconsole.log("Year:", year)\nconsole.log("Let's get it!")`,
            whatItDoes: "JavaScript displays your variables with console.log(). Same concept as Python's print() — just different syntax.",
            check: (output) => output.length > 0 && output.includes("\n"),
          },
          {
            type: "modify",
            prompt: "Add hourlyRate and hoursPerWeek variables. Calculate weeklyIncome = hourlyRate * hoursPerWeek. Log each variable with a label.",
            starterCode: `let name = "Stanley"\nlet hourlyRate = 75\nlet hoursPerWeek = 20\nlet weeklyIncome = hourlyRate * hoursPerWeek\n\nconsole.log("Name:", name)\nconsole.log("Rate: $" + hourlyRate + "/hr")\nconsole.log("Hours per week:", hoursPerWeek)\nconsole.log("Weekly income: $" + weeklyIncome)`,
            whatItDoes: "Math in JavaScript: multiply two variables and store the result. This pattern powers every income calculator, tip tool, and pricing widget on the web.",
            check: (output) => output.includes("income") || output.includes("$") || output.includes("Rate"),
          },
          {
            type: "scratch",
            prompt: "Build a digital business card. Declare variables for name, skill, city, and hourlyRate. Print a formatted card with dividers.",
            starterCode: `let name = "Stanley White"\nlet skill = "Python Developer"\nlet city = "Atlanta, GA"\nlet hourlyRate = 75\n\nconsole.log("================================")\nconsole.log("  Name:  " + name)\nconsole.log("  Skill: " + skill)\nconsole.log("  City:  " + city)\nconsole.log("  Rate:  $" + hourlyRate + "/hr")\nconsole.log("================================")`,
            whatItDoes: "Your first JavaScript business card. This is exactly how Fiverr, Upwork, and every freelance platform displays your profile data.",
            check: (output) => output.includes("=") || output.includes("Name") || output.length > 20,
          },
        ],
        quiz: [
          { question: "How do you create a variable in JavaScript?", answer: "let x = 5", choices: ["var x = 5", "let x = 5", "x = 5", "def x = 5"] },
          { question: "What is JavaScript's version of Python's print()?", answer: "console.log()", choices: ["log()", "console.print()", "console.log()", "display()"] },
          { question: "JavaScript is to a website what ___ is to a house.", answer: "The electricity", choices: ["The walls", "The paint", "The electricity", "The roof"] },
          { question: "What does `let rate = 75` create?", answer: "A variable storing the number 75", choices: ["A function called rate", "A variable storing the number 75", "A class called rate", "An error"] },
          { question: "Where does JavaScript run by default?", answer: ", ", choices: ["Only on servers", "Only in Node.js", ", "] },
        ],
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
        challenges: [
          {
            type: "guided",
            prompt: "Write a JavaScript function called 'greet' that takes a name and returns 'Hello, ' + name. Then call it with your own name.",
            starterCode: `function greet(name) {\n  return "Hello, " + name\n}\n\nconsole.log(greet("Stanley"))\nconsole.log(greet("World"))\n\nfunction weeklyPay(hours, rate) {\n  return hours * rate\n}\n\nconsole.log("Weekly pay: $" + weeklyPay(40, 75))`,
            whatItDoes: "You built two reusable JavaScript functions. Same concept as Python functions — different syntax.",
            check: (output) => output.includes("Hello") || output.length > 0,
          },
          {
            type: "modify",
            prompt: "Add a formatMoney(amount) function that returns the amount formatted as a dollar string like '$75.00'. Use it in the weeklyPay output.",
            starterCode: `function formatMoney(amount) {\n  return "$" + amount.toFixed(2)\n}\n\nfunction weeklyPay(hours, rate) {\n  return hours * rate\n}\n\nconst pay = weeklyPay(40, 75)\nconsole.log("Weekly pay: " + formatMoney(pay))\nconsole.log("Monthly (4 weeks): " + formatMoney(pay * 4))\nconsole.log("Annual (48 weeks): " + formatMoney(pay * 48))`,
            whatItDoes: ".toFixed(2) always shows 2 decimal places — essential for any money display in real apps.",
            check: (output) => output.includes("$") || output.includes("weekly") || output.includes("Monthly"),
          },
          {
            type: "scratch",
            prompt: "Build calculateProjectCost(hours, rate, taxPercent) that returns total with tax. Print an itemized breakdown: base cost, tax amount, and total.",
            starterCode: `function calculateProjectCost(hours, rate, taxPercent) {\n  const base = hours * rate\n  const tax = base * (taxPercent / 100)\n  const total = base + tax\n  return { base, tax, total }\n}\n\nconst project = calculateProjectCost(20, 75, 8)\nconsole.log("=== PROJECT QUOTE ===")\nconsole.log("Base cost: $" + project.base)\nconsole.log("Tax (8%):  $" + project.tax.toFixed(2))\nconsole.log("Total:     $" + project.total.toFixed(2))`,
            whatItDoes: "A real project quote calculator. Swap in client hours and your rate and it's a billable quote.",
            check: (output) => output.includes("QUOTE") || output.includes("Total") || output.includes("$"),
          },
        ],
        quiz: [
          { question: "What keyword defines a function in JavaScript (not an arrow function)?", answer: "function", choices: ["def", "func", "function", "fn"] },
          { question: "What does `return hours * rate` do inside a function?", answer: "Sends the result back to whoever called the function", choices: ["Prints the result", "Ends the program", "Sends the result back to whoever called the function", "Creates a variable"] },
          { question: "How do you call a function named getTotal with argument 5?", answer: "getTotal(5)", choices: ["call getTotal(5)", "getTotal 5", "getTotal(5)", "run getTotal(5)"] },
          { question: "What does .toFixed(2) do to a number?", answer: "Converts to string with exactly 2 decimal places", choices: ["Rounds to nearest integer", "Converts to string with exactly 2 decimal places", "Adds 2 to the number", "Removes decimals"] },
          { question: "Python uses 'def' for functions. JavaScript uses ___.", answer: "function", choices: ["fn", "define", "function", "method"] },
        ],
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
        challenges: [
          {
            type: "guided",
            prompt: "Run this code and see how JavaScript can build interactive content. Then change the message and colors to make it your own.",
            starterCode: `function buildWebpage() {\n  let title = "Welcome to CodeGrind"\n  let color = "green"\n  let buttonText = "Start Learning"\n  \n  console.log("Page Title:", title)\n  console.log("Title Color:", color)\n  console.log("Button:", buttonText)\n  console.log("")\n  console.log("User clicked the button...")\n  console.log("Showing lesson 1!")\n}\n\nbuildWebpage()`,
            whatItDoes: "In a real browser this code would change visible elements on a webpage. The DOM is JavaScript's superpower — it makes static pages come alive.",
            check: (output) => output.includes("Title") || output.includes("Page") || output.length > 0,
          },
          {
            type: "modify",
            prompt: "Add an updateStatus(message) function that logs '[STATUS]: message' in a formatted way. Call it 3 times with different messages like 'Loading...', 'Ready', 'Complete'.",
            starterCode: `function updateStatus(message) {\n  console.log("[STATUS]: " + message)\n}\n\nfunction buildWebpage(title) {\n  updateStatus("Loading...")\n  console.log("Setting title:", title)\n  updateStatus("Rendering content...")\n  console.log("Building page sections...")\n  updateStatus("Complete")\n  console.log("Page is live!")\n}\n\nbuildWebpage("My Freelance Portfolio")`,
            whatItDoes: "Status updates simulate what a real DOM manipulator does — logging each step. Real apps show loading spinners this way.",
            check: (output) => output.includes("STATUS") || output.includes("Loading") || output.includes("Complete"),
          },
          {
            type: "scratch",
            prompt: "Build a renderPage(title, sections, ctaText) function. It should log: the title as a header, each section name with a '•' bullet, and the CTA button text at the bottom.",
            starterCode: `function renderPage(title, sections, ctaText) {\n  console.log("\\n" + "=".repeat(title.length + 4))\n  console.log("  " + title)\n  console.log("=".repeat(title.length + 4))\n  console.log("\\nSECTIONS:")\n  for (let i = 0; i < sections.length; i++) {\n    console.log("  • " + sections[i])\n  }\n  console.log("\\n[ " + ctaText + " ]")\n}\n\nrenderPage(\n  "My Portfolio",\n  ["About Me", "My Skills", "Projects", "Contact"],\n  "Hire Me →"\n)`,
            whatItDoes: "A page layout renderer. In a real browser each console.log becomes an innerHTML update. The logic is identical.",
            check: (output) => output.includes("SECTIONS") || output.includes("•") || output.includes("="),
          },
        ],
        quiz: [
          { question: "What does DOM stand for?", answer: "Document Object Model", choices: ["Digital Object Maker", "Document Object Model", "Data Object Method", "Display Output Mode"] },
          { question: "What is document.getElementById('title') doing?", answer: "Finding an existing element by its id attribute", choices: ["Creating an element", "Deleting an element", "Finding an existing element by its id attribute", "Running JavaScript"] },
          { question: "What makes JavaScript different from Python in terms of where it runs?", answer: "JavaScript runs in the browser and can change what users see in real time", choices: ["Python is faster", "JavaScript runs in the browser and can change what users see in real time", "JavaScript is server-side only", "They run in the same place"] },
          { question: "A client pays $800 for a working contact form. What makes that form work?", answer: "JavaScript event listeners and DOM manipulation", choices: ["HTML structure", "CSS styling", "JavaScript event listeners and DOM manipulation", "A database"] },
          { question: "What does .style.color = 'green' do?", answer: "Changes the text color of the selected element", choices: ["Sets the background color", "Changes the text color of the selected element", "Removes the element", "Adds a CSS class"] },
        ],
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
        challenges: [
          {
            type: "guided",
            prompt: "Create a JavaScript array of your top 3 coding skills. Add one more with .push(). Loop through and print each one.",
            starterCode: `let skills = ["JavaScript", "Python", "Automation"]\n\nskills.push("Web Scraping")\n\nconsole.log("My skills:")\nfor (let i = 0; i < skills.length; i++) {\n  console.log((i + 1) + ".", skills[i])\n}\n\nconsole.log("Total skills:", skills.length)`,
            whatItDoes: "You managed a dynamic JavaScript array — adding items and looping through them. This is how web apps manage shopping carts, user lists, and data.",
            check: (output) => output.split("\n").filter(Boolean).length >= 3,
          },
          {
            type: "modify",
            prompt: "Use .filter() to create a filteredSkills array that only includes skills with the word 'Script' or 'Python' in them. Log the filtered list.",
            starterCode: `let skills = ["JavaScript", "Python", "HTML", "TypeScript", "CSS", "Automation"]\n\nconst codingSkills = skills.filter(function(skill) {\n  return skill.includes("Script") || skill.includes("Python")\n})\n\nconsole.log("All skills:", skills)\nconsole.log("Filtered (" + codingSkills.length + "):", codingSkills)`,
            whatItDoes: ".filter() creates a new array with only items that pass your test. Used in every search feature, tag filter, and product category on the web.",
            check: (output) => output.includes("Filtered") || output.includes("Script") || output.includes("Python"),
          },
          {
            type: "scratch",
            prompt: "Build a client invoice tracker. Create an array of 4 clients (each with name and amount). Loop through, log each invoice line, then log the total amount owed.",
            starterCode: `let clients = [\n  { name: "Marcus Johnson", amount: 1500 },\n  { name: "Tamika Williams", amount: 800 },\n  { name: "DeShawn Carter", amount: 2200 },\n  { name: "Keisha Brown", amount: 600 },\n]\n\nconsole.log("=== OUTSTANDING INVOICES ===")\nlet total = 0\nfor (let i = 0; i < clients.length; i++) {\n  console.log(clients[i].name + ": $" + clients[i].amount)\n  total += clients[i].amount\n}\nconsole.log("----------------------------")\nconsole.log("Total owed: $" + total)`,
            whatItDoes: "A real invoice tracker. Arrays of objects power every CRM, client management tool, and billing system in existence.",
            check: (output) => output.includes("Total") || output.includes("INVOICES") || output.includes("$"),
          },
        ],
        quiz: [
          { question: "How do you access the first item in a JavaScript array called `items`?", answer: "items[0]", choices: ["items[1]", "items.first()", "items[0]", "items.get(0)"] },
          { question: "Which method adds an item to the END of an array?", answer: ".push()", choices: [".add()", ".append()", ".push()", ".insert()"] },
          { question: "What does `items.length` return?", answer: "The total number of items", choices: ["The last item", "The index of the last item", "The total number of items", "Nothing — it's not valid"] },
          { question: "What does .filter() return?", answer: "A new array with only items that pass the test", choices: ["A single item", "True or false", "A new array with only items that pass the test", "The index of matching items"] },
          { question: "Python uses .append() to add to a list. JavaScript uses ___.", answer: ".push()", choices: [".add()", ".push()", ".append()", ".insert()"] },
        ],
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
        challenges: [
          {
            type: "guided",
            prompt: "Simulate an event system. Create a function that handles different user actions and logs what happened.",
            starterCode: `function handleEvent(eventType, data) {\n  if (eventType === "click") {\n    console.log("Button clicked! Data:", data)\n  } else if (eventType === "input") {\n    console.log("User typed:", data)\n  } else if (eventType === "submit") {\n    console.log("Form submitted with:", data)\n  }\n}\n\nhandleEvent("click", "Submit Button")\nhandleEvent("input", "Stanley White")\nhandleEvent("submit", "stanleywhiteiii87@gmail.com")\nhandleEvent("click", "Buy Now Button")`,
            whatItDoes: "You built an event handler system. In a real browser this would respond to actual user interactions — clicks, typing, form submissions.",
            check: (output) => output.split("\n").filter(Boolean).length >= 3,
          },
          {
            type: "modify",
            prompt: "Add a clickCount variable. Increment it every time a 'click' event fires. Log the running total after all events: 'Total clicks: N'.",
            starterCode: `let clickCount = 0\n\nfunction handleEvent(eventType, data) {\n  if (eventType === "click") {\n    clickCount++\n    console.log("Click #" + clickCount + ": " + data)\n  } else if (eventType === "input") {\n    console.log("Typed: " + data)\n  } else if (eventType === "submit") {\n    console.log("Submitted: " + data)\n  }\n}\n\nhandleEvent("click", "Hero Button")\nhandleEvent("input", "Stanley")\nhandleEvent("click", "CTA Button")\nhandleEvent("submit", "Contact Form")\nhandleEvent("click", "Buy Button")\n\nconsole.log("Total clicks: " + clickCount)`,
            whatItDoes: "Click tracking is how every analytics tool (Google Analytics, Mixpanel, Hotjar) works under the hood — event listeners + counters.",
            check: (output) => output.includes("Total clicks") || output.includes("Click #") || output.includes("clicks"),
          },
          {
            type: "scratch",
            prompt: "Build an event log. Create an empty log array. Each event call should push an object {type, data} into the array. After all events, loop through and print each log entry.",
            starterCode: `const eventLog = []\n\nfunction logEvent(eventType, data) {\n  eventLog.push({ type: eventType, data: data })\n}\n\nlogEvent("click", "Sign Up Button")\nlogEvent("input", "user@email.com")\nlogEvent("click", "Submit")\nlogEvent("submit", "Registration Form")\nlogEvent("click", "Dashboard Link")\n\nconsole.log("=== EVENT LOG (" + eventLog.length + " events) ===")\nfor (let i = 0; i < eventLog.length; i++) {\n  console.log((i + 1) + ". [" + eventLog[i].type.toUpperCase() + "] " + eventLog[i].data)\n}`,
            whatItDoes: "An event log is how debugging tools, session replay apps, and audit trails work. You just built the core of a product like FullStory or LogRocket.",
            check: (output) => output.includes("EVENT LOG") || output.includes("CLICK") || output.includes("events"),
          },
        ],
        quiz: [
          { question: "What method attaches an event listener to a DOM element?", answer: ".addEventListener()", choices: [".onEvent()", ".addEventListener()", ".listenFor()", ".attach()"] },
          { question: "Which event fires when a user clicks a button?", answer: "tap", choices: ["press", ", ", "tap", ", ", "click", ", ", "touch"] },
          { question: "What does e.preventDefault() do inside a form submit handler?", answer: "Stops the default browser behavior (e.g. page reload)", choices: ["Deletes the form", "Stops the default browser behavior (e.g. page reload)", "Clears form fields", "Submits the form twice"] },
          { question: "A client pays $800 for a working contact form. The event that handles the submit button is ___.", answer: "change", choices: ["input", ", ", "change", ", ", "submit", ", ", "click"] },
          { question: "Events let JavaScript code ___ to what users do.", answer: "react", choices: ["ignore", "predict", "react", "prevent"] },
        ],
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
        challenges: [
          {
            type: "guided",
            prompt: "Run the tip calculator. Then modify it to also include an 8% tax. Print the tax amount separately. Change the values to a real dinner you've had.",
            starterCode: `def calculate_tip(bill, tip_percent, tax_percent, people):\n    tip_amount = bill * (tip_percent / 100)\n    tax_amount = bill * (tax_percent / 100)\n    total = bill + tip_amount + tax_amount\n    per_person = total / people\n    \n    print("=== BILL BREAKDOWN ===")\n    print("Original bill: $", bill)\n    print("Tip (", tip_percent, "%): $", round(tip_amount, 2))\n    print("Tax (", tax_percent, "%): $", round(tax_amount, 2))\n    print("Total: $", round(total, 2))\n    print("Each person pays: $", round(per_person, 2))\n\ncalculate_tip(\n    bill=85.50,\n    tip_percent=20,\n    tax_percent=8,\n    people=4\n)`,
            whatItDoes: "A complete bill splitting tool with tip and tax. This is a real sellable product — restaurants, event planners, and groups pay for tools like this.",
            check: (output) => (output.includes("$") && output.includes("Total")) || output.includes("bill"),
          },
          {
            type: "modify",
            prompt: "Add a tip_suggestion(service_quality) function that returns the recommended tip percent: 'excellent' → 25, 'good' → 20, 'okay' → 15. Use it before calculating.",
            starterCode: `def tip_suggestion(service_quality):\n    if service_quality == "excellent":\n        return 25\n    elif service_quality == "good":\n        return 20\n    elif service_quality == "okay":\n        return 15\n    else:\n        return 18  # default\n\ndef calculate_tip(bill, service_quality, people):\n    tip_percent = tip_suggestion(service_quality)\n    tip_amount = bill * (tip_percent / 100)\n    total = bill + tip_amount\n    per_person = total / people\n    print("Service: " + service_quality + " -> " + str(tip_percent) + "% tip")\n    print("Tip: $" + str(round(tip_amount, 2)))\n    print("Total: $" + str(round(total, 2)))\n    print("Each: $" + str(round(per_person, 2)))\n\ncalculate_tip(120.00, "excellent", 3)\nprint()\ncalculate_tip(45.50, "okay", 2)`,
            whatItDoes: "Chaining functions: one function feeds input into another. This is how real apps compose small pieces into bigger features.",
            check: (output) => output.includes("Service") || output.includes("tip") || output.includes("Each"),
          },
          {
            type: "scratch",
            prompt: "Build an event catering calculator. Takes: food_cost, bar_cost, num_guests, tip_percent. Prints an itemized breakdown: food, bar, subtotal, gratuity, total, and cost per guest.",
            starterCode: `def catering_quote(food_cost, bar_cost, num_guests, tip_percent):\n    subtotal = food_cost + bar_cost\n    gratuity = subtotal * (tip_percent / 100)\n    total = subtotal + gratuity\n    per_guest = total / num_guests\n    \n    print("=== EVENT CATERING QUOTE ===")\n    print("Food:      $" + str(food_cost))\n    print("Bar:       $" + str(bar_cost))\n    print("Subtotal:  $" + str(subtotal))\n    print("Gratuity (" + str(tip_percent) + "%):" + " $" + str(round(gratuity, 2)))\n    print("Total:     $" + str(round(total, 2)))\n    print("Per guest: $" + str(round(per_guest, 2)))\n\ncatering_quote(2400, 800, 50, 18)`,
            whatItDoes: "Event planners pay $200-500 for this tool. It's the same math, just packaged for a specific industry.",
            check: (output) => output.includes("CATERING") || output.includes("Total") || output.includes("Per guest"),
          },
        ],
        quiz: [
          { question: "Why do we divide tip_percent by 100 in the calculation?", answer: ", ", choices: [", ", ", ", ", "] },
          { question: "What does round(number, 2) do?", answer: "Rounds to 2 decimal places", choices: ["Rounds to nearest integer", "Rounds to 2 decimal places", "Rounds up always", "Removes decimals"] },
          { question: "In calculate_tip(bill, tip_percent, tax_percent, people), what are bill, tip_percent, tax_percent, people called?", answer: "Parameters", choices: ["Return values", "Global variables", "Parameters", "Modules"] },
          { question: "What does per_person = total / people calculate?", answer: ", ", choices: ["The tip per person", ", ", ", "] },
          { question: "A restaurant pays you $300 for this calculator. What did you actually sell them?", answer: "A Python function that solves a real daily problem", choices: ["A website", "A database", "A Python function that solves a real daily problem", "A mobile app"] },
        ],
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
        challenges: [
          {
            type: "guided",
            prompt: "Run this income calculator. Then change the numbers to match your own goals and see what your first year could look like.",
            starterCode: `hourly_rate = 75\nhours_per_week = 20\nweeks_per_year = 48\n\nprojects_per_month = 2\navg_project_price = 800\n\nhourly_annual = hourly_rate * hours_per_week * weeks_per_year\nproject_annual = projects_per_month * avg_project_price * 12\ntotal = hourly_annual + project_annual\n\nprint("=== YOUR FIRST YEAR ESTIMATE ===")\nprint("Hourly work income: $", hourly_annual)\nprint("Project income: $", project_annual)\nprint("TOTAL POTENTIAL: $", total)`,
            whatItDoes: "Real math on real income. Change any variable and re-run to see how your income shifts.",
            check: (output) => output.includes("$") || output.includes("TOTAL"),
          },
          {
            type: "modify",
            prompt: "Add months_to_goal(current_monthly, goal_annual). It calculates how many months to reach the annual goal at the current monthly rate. Print it for both $3k/month and $5k/month scenarios.",
            starterCode: `import math\n\ndef months_to_goal(current_monthly, goal_annual):\n    if current_monthly <= 0:\n        return float('inf')\n    months = goal_annual / current_monthly\n    return math.ceil(months)\n\ngoal = 60000\n\nprint("Goal: $" + str(goal) + "/year")\nprint()\nprint("At $3,000/month:", months_to_goal(3000, goal), "months")\nprint("At $5,000/month:", months_to_goal(5000, goal), "months")\nprint("At $8,000/month:", months_to_goal(8000, goal), "months")`,
            whatItDoes: "math.ceil() rounds up — you can't reach a goal in a fraction of a month. This is how financial planning tools work.",
            check: (output) => output.includes("months") || output.includes("Goal"),
          },
          {
            type: "scratch",
            prompt: "Build a freelance business health check. Given: hourly_rate, billable_hours_week, monthly_expenses. Print: monthly_revenue, monthly_profit, profit_margin_percent, and a status: 'HEALTHY' if margin > 50%, 'TIGHT' if 30-50%, 'DANGER' if below 30%.",
            starterCode: `def business_health(hourly_rate, billable_hours_week, monthly_expenses):\n    monthly_revenue = hourly_rate * billable_hours_week * 4\n    monthly_profit = monthly_revenue - monthly_expenses\n    profit_margin = (monthly_profit / monthly_revenue) * 100\n    \n    if profit_margin > 50:\n        status = "HEALTHY"\n    elif profit_margin >= 30:\n        status = "TIGHT"\n    else:\n        status = "DANGER"\n    \n    print("=== BUSINESS HEALTH CHECK ===")\n    print("Revenue: $" + str(monthly_revenue))\n    print("Expenses: $" + str(monthly_expenses))\n    print("Profit: $" + str(monthly_profit))\n    print("Margin: " + str(round(profit_margin, 1)) + "%")\n    print("Status: " + status)\n\nbusiness_health(75, 20, 800)\nprint()\nbusiness_health(50, 10, 1200)`,
            whatItDoes: "Every real business tracks these numbers. You just built a CFO dashboard in 20 lines of Python.",
            check: (output) => output.includes("HEALTH") || output.includes("Revenue") || output.includes("Margin"),
          },
        ],
        quiz: [
          { question: "What does math.ceil(4.1) return?", answer: "5", choices: ["4", "4.1", "5", "Error"] },
          { question: "If revenue is $5,000 and expenses are $2,000, what is profit margin?", answer: "60%", choices: ["40%", "60%", "30%", "50%"] },
          { question: "Why do freelancers track billable vs non-billable hours?", answer: "To know how much of their time actually earns money", choices: ["For tax reasons only", "To know how much of their time actually earns money", "Clients require it", "To bill more hours"] },
          { question: "In the formula `hourly_rate * hours_per_week * weeks_per_year`, what does the result represent?", answer: "Annual income from hourly work", choices: ["Monthly income", "Weekly income", "Annual income from hourly work", "Tax owed"] },
          { question: "What does float('inf') represent in Python?", answer: "Positive infinity — useful when a goal is unreachable", choices: ["A very large float number", "Positive infinity — useful when a goal is unreachable", "A float error", "The number 0.0"] },
        ],
      },
      {
        id: "first-client", title: "Landing Your First Paying Client", xp: 175, analogy: "Think of a plumber getting their first call",
        theory: [
          { type: "plain", text: "Your first client is not found — they're already around you. Friends, family, former coworkers, local businesses. Every professional started with one person who said yes." },
          { type: "highlight", text: "You don't need Upwork yet. The fastest path to your first $500: tell 10 people what you do and what problem you solve. One will need it." },
          { type: "code", label: "PYTHON — Outreach tracker", color: "#fbbf24", code: `outreach = [\n    {"contact": "Mike (cousin)", "what_you_offered": "Fix his restaurant website", "status": "sent", "follow_up": "Thursday"},\n    {"contact": "Old coworker Lisa", "what_you_offered": "Automate her Excel reports", "status": "interested", "follow_up": "Tuesday"},\n    {"contact": "Barber shop owner", "what_you_offered": "Simple booking page", "status": "no response", "follow_up": "Next week"},\n]\n\nfor lead in outreach:\n    print(lead["contact"] + " -- " + lead["status"].upper())\n    print("  Offer: " + lead["what_you_offered"])\n    print("  Follow up: " + lead["follow_up"])` },
          { type: "plain", text: "Most freelancers fail not from lack of skill — but from lack of outreach. Tracking is the difference between wishing and closing." },
        ],
        hints: ["Each lead is a dictionary with contact, offer, status, and follow-up date", "Loop over the list and print each contact's status", "Change status to 'closed' when they say yes — that's your first client"],
        challenges: [
          {
            type: "guided",
            prompt: "Run the outreach tracker. Add yourself as a 4th entry with a real person you could contact, a specific offer, and a follow-up date.",
            starterCode: `outreach = [\n    {"contact": "Mike (cousin)", "what_you_offered": "Fix his restaurant website", "status": "sent", "follow_up": "Thursday"},\n    {"contact": "Lisa from old job", "what_you_offered": "Automate her Excel reports", "status": "interested", "follow_up": "Tuesday"},\n    {"contact": "Local barber", "what_you_offered": "Simple booking page", "status": "no response", "follow_up": "Next week"},\n    {"contact": "Add your own", "what_you_offered": "Your specific offer here", "status": "not sent", "follow_up": "This week"},\n]\n\nfor lead in outreach:\n    print(lead["contact"] + " -- " + lead["status"].upper())\n    print("  Offer: " + lead["what_you_offered"])\n    print("  Follow up: " + lead["follow_up"])\n    print()`,
            whatItDoes: "A real outreach tracker. The act of tracking forces clarity — you know exactly who you've talked to and what happens next.",
            check: (output) => output.includes("sent") || output.includes("SENT") || output.includes("Follow"),
          },
          {
            type: "modify",
            prompt: "Add a count of how many leads are 'interested' vs 'sent' vs 'closed'. Print a summary at the end: 'Pipeline: X interested, Y sent, Z closed'.",
            starterCode: `outreach = [\n    {"contact": "Mike", "what_you_offered": "Website fix", "status": "interested"},\n    {"contact": "Lisa", "what_you_offered": "Excel automation", "status": "interested"},\n    {"contact": "Barber", "what_you_offered": "Booking page", "status": "sent"},\n    {"contact": "Former boss", "what_you_offered": "Monthly reports", "status": "closed"},\n    {"contact": "Neighbor", "what_you_offered": "Simple website", "status": "sent"},\n]\n\ncounts = {"interested": 0, "sent": 0, "closed": 0}\nfor lead in outreach:\n    if lead["status"] in counts:\n        counts[lead["status"]] += 1\n\nprint("PIPELINE SUMMARY:")\nprint("Interested:", counts["interested"])\nprint("Awaiting response:", counts["sent"])\nprint("Closed (clients):", counts["closed"])`,
            whatItDoes: "Pipeline tracking. Every sales team in the world uses this. You built it yourself in 10 lines.",
            check: (output) => output.includes("PIPELINE") || output.includes("Interested") || output.includes("Closed"),
          },
          {
            type: "scratch",
            prompt: "Write a pitch generator. Given contact_name, their_problem, and your_solution, print a 3-sentence DM/text message pitch you could send right now.",
            starterCode: `def generate_pitch(contact_name, their_problem, your_solution, your_price):\n    pitch = (\n        "Hey " + contact_name + ", I noticed " + their_problem + ". \\n"\n        "I've been learning to code and I can " + your_solution + ". \\n"\n        "I'd do it for $" + str(your_price) + " — want me to show you what it'd look like?"\n    )\n    print("--- PITCH ---")\n    print(pitch)\n    print("--- END ---")\n\ngenerate_pitch(\n    "Mike",\n    "your restaurant website is outdated",\n    "build you a clean new page with your menu and hours",\n    300\n)\n\nprint()\n\ngenerate_pitch(\n    "Lisa",\n    "you spend hours every Friday on those reports",\n    "automate that whole process down to 2 minutes",\n    150\n)`,
            whatItDoes: "A repeatable pitch formula. Copy the output, paste it into a text message, and send it. That's a real client conversation starting.",
            check: (output) => output.includes("PITCH") || output.includes("Hey") || output.includes("$"),
          },
        ],
        quiz: [
          { question: "Where is the fastest place to find your first client?", answer: "People you already know", choices: ["Upwork", "Fiverr", "People you already know", "LinkedIn ads"] },
          { question: "In the outreach tracker, what data structure holds all the leads?", answer: "A list of dictionaries", choices: ["A tuple", "A dictionary", "A list of dictionaries", "A set"] },
          { question: "What does `counts[lead['status']] += 1` do?", answer: "Increments the count for that status key", choices: ["Creates a new status", "Increments the count for that status key", "Deletes the lead", "Prints the count"] },
          { question: "What makes a freelance pitch effective?", answer: "Naming their specific problem and your specific solution", choices: ["Technical jargon", "Naming their specific problem and your specific solution", "Long detailed explanations", "Showing your portfolio first"] },
          { question: "What is `if lead['status'] in counts:` checking?", answer: "If the status key exists in the counts dictionary", choices: ["If the status is True", "If the count is zero", "If the status key exists in the counts dictionary", "If the lead is closed"] },
        ],
      },
      {
        id: "upwork-proposal", title: "Writing a Winning Upwork Proposal", xp: 175, analogy: "Think of a job application that takes 5 minutes",
        theory: [
          { type: "plain", text: "Upwork has millions of freelancers. Most proposals start with 'Hi, I am an experienced developer...' — they all sound the same. The ones that win start with the client's problem." },
          { type: "highlight", text: "The winning formula: address their pain point first, show you understand the work, give one specific relevant example, and end with a low-friction question." },
          { type: "code", label: "PYTHON — Proposal builder", color: "#fbbf24", code: `def build_proposal(job_title, client_pain_point, your_relevant_experience, question):\n    proposal = (\n        "I saw you need " + job_title + ". \\n\\n"\n        "From your description: " + client_pain_point + ". \\n\\n"\n        "I recently " + your_relevant_experience + ". \\n\\n"\n        "Quick question before I send a full quote: " + question\n    )\n    return proposal\n\nprint(build_proposal(\n    job_title="a Python script to clean a CSV file",\n    client_pain_point="you\\'re spending hours fixing data manually every week",\n    your_relevant_experience="built a data cleaner for a client that reduced their prep time from 4 hours to 10 minutes",\n    question="What does the messy data look like — is it duplicate rows, bad formatting, or something else?"\n))` },
          { type: "plain", text: "That ending question is the secret. It shows you're thinking like a professional, not just copying a template. It also starts a conversation — which leads to the job." },
        ],
        hints: ["The proposal starts with THEIR situation, not yours", "One specific example beats five vague claims", "The question at the end shows you're already solving the problem in your head"],
        challenges: [
          {
            type: "guided",
            prompt: "Run the proposal builder. Then call it with a different job type — maybe a web scraping job or a data analysis task.",
            starterCode: `def build_proposal(job_title, client_pain_point, your_relevant_experience, question):\n    proposal = (\n        "I saw you need " + job_title + ".\\n\\n"\n        "From your post: " + client_pain_point + ".\\n\\n"\n        "I recently " + your_relevant_experience + ".\\n\\n"\n        "Before I quote — " + question\n    )\n    return proposal\n\nprint(build_proposal(\n    job_title="a Python script to clean a CSV file",\n    client_pain_point="you\\'re spending hours fixing data manually",\n    your_relevant_experience="built a CSV cleaner that cut a client\\'s prep time from 4 hrs to 10 min",\n    question="What does the messy data look like — duplicates, formatting, or missing values?"\n))\n\nprint("\\n" + "="*50 + "\\n")\n\nprint(build_proposal(\n    job_title="a web scraper for product prices",\n    client_pain_point="you\\'re checking competitor prices manually",\n    your_relevant_experience="scraped 500+ product listings from a retail site for analysis",\n    question="Which sites do you need to track — are they JavaScript-heavy or simple HTML?"\n))`,
            whatItDoes: "Two tailored proposals in seconds. Change the inputs to any job posting and you have a custom proposal ready to send.",
            check: (output) => output.includes("saw you need") || output.includes("Before") || output.includes("="),
          },
          {
            type: "modify",
            prompt: "Add a delivery_time and price parameter. Append a final line: 'I can have this done in X days for $Y. Let me know if you want to move forward.'",
            starterCode: `def build_proposal(job_title, client_pain_point, experience, question, delivery_days, price):\n    proposal = (\n        "I saw you need " + job_title + ".\\n\\n"\n        "From your post: " + client_pain_point + ".\\n\\n"\n        "I recently " + experience + ".\\n\\n"\n        "Before I quote — " + question + "\\n\\n"\n        "I can have this done in " + str(delivery_days) + " days for $" + str(price) + ". Let me know if you want to move forward."\n    )\n    return proposal\n\nprint(build_proposal(\n    job_title="a Python automation script",\n    client_pain_point="this manual process is killing your team\\'s time",\n    experience="automated a similar workflow that saved a client 10 hrs/week",\n    question="Can you share a sample of the data or process?",\n    delivery_days=3,\n    price=350\n))`,
            whatItDoes: "Always include a specific price and timeline. Vague proposals get skipped. Specific ones get responses.",
            check: (output) => output.includes("days for") || output.includes("move forward") || output.includes("$"),
          },
          {
            type: "scratch",
            prompt: "Build a proposal scorecard. Given a job post (as a string), check if it contains: a budget mention, a timeline, and 3+ sentences. Score 1 point each. Print 'APPLY' if score >= 2, 'SKIP' if less.",
            starterCode: `def score_job_post(post_text):\n    score = 0\n    reasons = []\n    \n    budget_words = ["$", "budget", "rate", "pay", "usd"]\n    has_budget = any(word in post_text.lower() for word in budget_words)\n    if has_budget:\n        score += 1\n        reasons.append("Has budget info")\n    \n    timeline_words = ["week", "day", "month", "asap", "urgent", "deadline"]\n    has_timeline = any(word in post_text.lower() for word in timeline_words)\n    if has_timeline:\n        score += 1\n        reasons.append("Has timeline")\n    \n    if post_text.count(".") >= 3:\n        score += 1\n        reasons.append("Detailed description")\n    \n    verdict = "APPLY" if score >= 2 else "SKIP"\n    print("Score: " + str(score) + "/3 -- " + verdict)\n    for r in reasons:\n        print("  + " + r)\n\ngood_post = "I need a Python script to clean my CSV data. Budget is $200-400. Need it done within 1 week. The data has duplicates and missing values that need fixing. I have about 10k rows."\nbad_post = "Need coder for project."\n\nprint("Post 1:")\nscore_job_post(good_post)\nprint("\\nPost 2:")\nscore_job_post(bad_post)`,
            whatItDoes: "A real job filtering tool. Apply only to quality posts and your acceptance rate goes up. This is how top Upwork freelancers stay selective.",
            check: (output) => output.includes("APPLY") || output.includes("SKIP") || output.includes("Score"),
          },
        ],
        quiz: [
          { question: "What is the biggest mistake most freelance proposals make?", answer: "Starting with YOUR background instead of THEIR problem", choices: ["Being too short", "Starting with YOUR background instead of THEIR problem", "Including a price", "Asking questions"] },
          { question: "Why end a proposal with a question?", answer: ", ", choices: ["To seem uncertain", ", ", ", "] },
          { question: "What does `any(word in post.lower() for word in budget_words)` do?", answer: "Returns True if ANY budget word appears in the post", choices: ["Checks if ALL budget words are in the post", "Returns True if ANY budget word appears in the post", "Counts budget mentions", "Converts the post to lowercase"] },
          { question: "In the scorecard, what's the purpose of the `reasons` list?", answer: "To track which criteria passed so the feedback is actionable", choices: ["To store errors", "To track which criteria passed so the feedback is actionable", "Required by Python", "To count total words"] },
          { question: "What's the key difference between a winning proposal and a generic one?", answer: "Addressing the client's specific situation vs. a copy-paste template", choices: ["Length", "Technical vocabulary", "Addressing the client's specific situation vs. a copy-paste template", "Number of attachments"] },
        ],
      },
      {
        id: "build-your-portfolio", title: "Your Portfolio: The Freelancer's Resume", xp: 200, analogy: "Think of a chef's tasting menu",
        theory: [
          { type: "plain", text: "A chef doesn't describe their food — they let you taste it. Your portfolio is the taste. Code projects that solve real problems are worth a hundred words about your skills." },
          { type: "highlight", text: "3 targeted portfolio projects beat 10 random ones. Each project should answer: What problem did I solve? Who would pay for this? How do I prove it works?" },
          { type: "code", label: "PYTHON — Portfolio project tracker", color: "#fbbf24", code: `portfolio = [\n    {\n        "title": "CSV Sales Cleaner",\n        "problem": "Messy sales data wasting 4 hours/week",\n        "solution": "Python script that cleans, deduplicates, and exports in 30 seconds",\n        "client_type": "Small business, e-commerce",\n        "price_range": "$150-400",\n        "proof": "Before/after CSV files, processing speed demo"\n    },\n    {\n        "title": "Invoice Auto-Sender",\n        "problem": "Manually emailing invoices to 50+ clients",\n        "solution": "Python script that reads client list and sends personalized invoices",\n        "client_type": "Freelancers, consultants",\n        "price_range": "$200-500",\n        "proof": "Code + demo video showing 50 emails sent in 10 seconds"\n    }\n]\n\nfor p in portfolio:\n    print("PROJECT: " + p["title"])\n    print("  Problem:", p["problem"])\n    print("  Solution:", p["solution"])\n    print("  Target clients:", p["client_type"])\n    print("  Rate: " + p["price_range"])` },
          { type: "plain", text: "Host your projects on GitHub. Add a README that explains the problem, shows sample output, and includes instructions. That README IS your portfolio page for technical clients." },
        ],
        hints: ["Each portfolio item is a dictionary with problem, solution, client type, and pricing", "3 good projects in one niche beats 10 scattered ones", "Always include proof — code, screenshots, or demo video"],
        challenges: [
          {
            type: "guided",
            prompt: "Run the portfolio tracker. Add a 3rd project that YOU could build right now based on what you've learned. Include all fields.",
            starterCode: `portfolio = [\n    {\n        "title": "CSV Sales Cleaner",\n        "problem": "Messy sales data taking hours to fix",\n        "solution": "Python script: cleans, deduplicates, exports in 30 sec",\n        "client_type": "Small business, e-commerce",\n        "price_range": "$150-400",\n    },\n    {\n        "title": "Invoice Auto-Sender",\n        "problem": "Manually emailing 50+ clients",\n        "solution": "Script reads client list, sends personalized invoices",\n        "client_type": "Freelancers, consultants",\n        "price_range": "$200-500",\n    },\n    {\n        "title": "Your project here",\n        "problem": "Describe the real problem",\n        "solution": "Your Python solution",\n        "client_type": "Who would pay",\n        "price_range": "$XXX-XXX",\n    },\n]\n\nfor i, p in enumerate(portfolio, 1):\n    print(str(i) + ". " + p["title"] + " (" + p["price_range"] + ")")\n    print("   Problem: " + p["problem"])\n    print("   Solution: " + p["solution"])\n    print()`,
            whatItDoes: "A structured portfolio — problem + solution + price + target client. This format answers every question a paying client has.",
            check: (output) => output.includes("Problem") || output.includes("Solution") || output.includes("$"),
          },
          {
            type: "modify",
            prompt: "Add a `total_potential_value` that sums the maximum price range across all 3 projects. Parse the price_range strings to get the max value (hint: split on '-' and take the last number).",
            starterCode: `portfolio = [\n    {"title": "CSV Cleaner", "price_range": "$150-400"},\n    {"title": "Invoice Sender", "price_range": "$200-500"},\n    {"title": "Web Scraper", "price_range": "$300-800"},\n]\n\ntotal_max = 0\nfor p in portfolio:\n    # Parse "$150-400" -> take 400\n    parts = p["price_range"].replace("$", "").split("-")\n    max_val = int(parts[-1])\n    total_max += max_val\n    print(p["title"] + ": up to $" + str(max_val))\n\nprint("\\nMax pipeline value: $" + str(total_max))`,
            whatItDoes: "String parsing: split a string to extract a number. This exact pattern is used in price scrapers and data cleaners you'll build for clients.",
            check: (output) => output.includes("pipeline") || output.includes("Max") || output.includes("$"),
          },
          {
            type: "scratch",
            prompt: "Build a GitHub README generator. Given a project dict with title, problem, solution, and usage_example — print a formatted markdown-style README.",
            starterCode: `def generate_readme(project):\n    print("# " + project["title"])\n    print()\n    print("## Problem")\n    print(project["problem"])\n    print()\n    print("## Solution")\n    print(project["solution"])\n    print()\n    print("## Usage")\n    print("    " + project["usage_example"])\n    print()\n    print("---")\n    print("Built by a CodeGrind graduate. Available on Fiverr.")\n\ngenerate_readme({\n    "title": "CSV Data Cleaner",\n    "problem": "Businesses waste hours manually fixing messy CSV exports. Duplicate rows, inconsistent formatting, missing values.",\n    "solution": "Python script that reads any CSV, removes duplicates, standardizes formatting, and exports clean data in seconds.",\n    "usage_example": "python cleaner.py input.csv output.csv"\n})`,
            whatItDoes: "An actual GitHub README. Copy this output, paste it into a GitHub repo, and you have a live portfolio project. That's how you get hired.",
            check: (output) => output.includes("Problem") || output.includes("Solution") || output.includes("Usage"),
          },
        ],
        quiz: [
          { question: "How many well-chosen portfolio projects does a new freelancer need to start landing clients?", answer: "3 targeted projects", choices: ["10+", "At least 20", "3 targeted projects", "1 massive project"] },
          { question: "What should every portfolio project answer?", answer: "What problem it solves and who would pay for it", choices: ["What language it uses", "What problem it solves and who would pay for it", "How long it took to build", "Which framework you used"] },
          { question: "Where should you host portfolio code to share with clients?", answer: "GitHub", choices: ["Dropbox", "GitHub", "Google Drive", "Email attachments"] },
          { question: "In the price range parser, what does `p['price_range'].replace('$','').split('-')` return for '$150-400'?", answer: "['150', '400']", choices: ["['$150', '400']", "['150', '400']", "['150-400']", "['$', '150', '400']"] },
          { question: "What makes a portfolio README valuable to a technical client?", answer: "It shows you solved a real problem and proves it works", choices: ["Fancy formatting", "It shows you solved a real problem and proves it works", "Length", "Using multiple languages"] },
        ],
      },
    ],
  },
  {
    id: "premium-python", title: "Premium — Python Pro", icon: "🐍", color: "#34d399",
    lessons: [
      {
        id: "csv-files-advanced", title: "Advanced CSV Handling — Filters & Aggregation", xp: 200, analogy: "Think of a supercharged spreadsheet",
        theory: [
          { type: "plain", text: "Almost every business runs on spreadsheets. Sales data, customer lists, inventory — all stored as CSV files. Python can open, read, and process thousands of rows in seconds." },
          { type: "highlight", text: "CSV stands for Comma Separated Values. Python's csv module reads them instantly." },
          { type: "code", label: "PYTHON", color: "#6ee7b7", code: `import csv\n\nwith open("sales.csv", "r") as file:\n    reader = csv.DictReader(file)\n    for row in reader:\n        print(row["name"], row["amount"])` },
          { type: "plain", text: "Real money: A client gives you a 10,000 row sales CSV. They want totals by region. Without Python — 4 hours of manual work. With Python — 10 lines of code, done in 30 seconds. They pay you $150." },
        ],
        hints: ["Import csv at the top: import csv", "Use with open('file.csv', 'r') as file: to open it safely", "csv.DictReader gives you each row as a dictionary with column names as keys"],
        challenges: [
          {
            type: "guided",
            prompt: "Write a script that creates a CSV file with 3 sales records, then reads it back and prints each row with a total.",
            starterCode: `import csv\n\nwith open("sales.csv", "w", newline="") as file:\n    writer = csv.writer(file)\n    writer.writerow(["name", "amount", "region"])\n    writer.writerow(["Marcus", 500, "South"])\n    writer.writerow(["Tamika", 750, "East"])\n    writer.writerow(["DeShawn", 300, "West"])\n\nprint("CSV created!")\n\nwith open("sales.csv", "r") as file:\n    reader = csv.DictReader(file)\n    total = 0\n    for row in reader:\n        print(row["name"], "sold $" + row["amount"])\n        total += int(row["amount"])\n\nprint("Total sales: $", total)`,
            whatItDoes: "You created and read a real CSV file. Processing sales data is one of the most requested Python freelance tasks.",
            check: (output) => output.includes("CSV") || output.includes("sold") || output.includes("Total"),
          },
          {
            type: "modify",
            prompt: "Add filtering: after reading the CSV, print only rows where amount > 400. Add a line showing how many rows were filtered out.",
            starterCode: `import csv\n\nwith open("sales.csv", "w", newline="") as file:\n    writer = csv.writer(file)\n    writer.writerow(["name", "amount", "region"])\n    writer.writerow(["Marcus", 500, "South"])\n    writer.writerow(["Tamika", 750, "East"])\n    writer.writerow(["DeShawn", 300, "West"])\n    writer.writerow(["Keisha", 1200, "East"])\n\nwith open("sales.csv", "r") as file:\n    reader = csv.DictReader(file)\n    rows = list(reader)\n\nhigh_value = [r for r in rows if int(r["amount"]) > 400]\nprint("High-value sales (>$400):")\nfor row in high_value:\n    print("  " + row["name"] + ": $" + row["amount"])\nprint("Filtered " + str(len(rows) - len(high_value)) + " low-value row(s) out")`,
            whatItDoes: "List comprehension filtering: `[x for x in list if condition]`. This is how real data analysts remove noise from datasets.",
            check: (output) => output.includes("High-value") || output.includes("Filtered") || output.includes("$"),
          },
          {
            type: "scratch",
            prompt: "Build an expense tracker. Write 5 expense rows to a CSV (date, category, amount, description). Read them back, calculate total by category, and print the summary.",
            starterCode: `import csv\n\nexpenses = [\n    ["2026-01-05", "Software", 29, "VS Code Pro"],\n    ["2026-01-10", "Marketing", 50, "Facebook ads"],\n    ["2026-01-12", "Software", 15, "Domain name"],\n    ["2026-01-18", "Equipment", 120, "Keyboard"],\n    ["2026-01-20", "Marketing", 30, "LinkedIn Premium"],\n]\n\nwith open("expenses.csv", "w", newline="") as f:\n    writer = csv.writer(f)\n    writer.writerow(["date", "category", "amount", "description"])\n    writer.writerows(expenses)\n\ncategory_totals = {}\nwith open("expenses.csv", "r") as f:\n    reader = csv.DictReader(f)\n    for row in reader:\n        cat = row["category"]\n        category_totals[cat] = category_totals.get(cat, 0) + int(row["amount"])\n\nprint("=== EXPENSE SUMMARY ===")\nfor cat, total in category_totals.items():\n    print(cat + ": $" + str(total))\nprint("Total: $" + str(sum(category_totals.values())))`,
            whatItDoes: "A real business expense tracker. Accountants and small business owners pay $200-500 for tools like this.",
            check: (output) => output.includes("EXPENSE") || output.includes("Total") || output.includes("$"),
          },
        ],
        quiz: [
          { question: "What does csv.DictReader do?", answer: "Reads each row as a dictionary with column headers as keys", choices: ["Writes CSV rows", "Reads each row as a dictionary with column headers as keys", "Creates a new CSV", "Converts JSON to CSV"] },
          { question: "What does `with open('file.csv', 'w') as f:` do?", answer: "Opens the file for writing and auto-closes when done", choices: ["Reads the file", "Opens the file for writing and auto-closes when done", "Deletes the file", "Appends to the file"] },
          { question: "What is the `newline=''` argument for when writing CSVs?", answer: "Prevents Python from adding extra newlines on Windows", choices: ["Adds blank lines between rows", "Prevents Python from adding extra newlines on Windows", "Sets the CSV delimiter", "Required for DictReader"] },
          { question: "How do you get totals by category from rows of data?", answer: "Use a dictionary to accumulate sums by category key", choices: ["Sort the list", "Use a dictionary to accumulate sums by category key", "Filter duplicates", "Use a set"] },
          { question: "Why is CSV processing one of the most requested Python freelance skills?", answer: "Almost every business runs on spreadsheet data that needs processing", choices: ["CSV is hard to learn", "Almost every business runs on spreadsheet data that needs processing", "Python only reads CSV"] },
        ],
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
        challenges: [
          {
            type: "guided",
            prompt: "Write a web scraper that fetches 'https://books.toscrape.com' and prints the page title and first 5 book titles.",
            starterCode: `import requests\nfrom bs4 import BeautifulSoup\n\nurl = "https://books.toscrape.com"\nresponse = requests.get(url)\nsoup = BeautifulSoup(response.text, "html.parser")\n\ntitle = soup.find("title").text\nprint("Page:", title)\n\nbooks = soup.find_all("h3")\nprint("\\nFirst 5 books:")\nfor book in books[:5]:\n    print("-", book.find("a")["title"])`,
            whatItDoes: "You scraped a real website and extracted real data. books.toscrape.com is a practice site made for scraping — safe and legal to use.",
            check: (output) => output.length > 0 && (output.includes("Page") || output.includes("book") || output.includes("-")),
          },
          {
            type: "modify",
            prompt: "Add price extraction. For each of the first 5 books, also print its price. Find the price in the 'p' tag with class 'price_color'.",
            starterCode: `import requests\nfrom bs4 import BeautifulSoup\n\nurl = "https://books.toscrape.com"\nresponse = requests.get(url)\nsoup = BeautifulSoup(response.text, "html.parser")\n\narticles = soup.find_all("article", class_="product_pod")[:5]\n\nprint("TOP 5 BOOKS WITH PRICES:")\nfor article in articles:\n    title = article.find("h3").find("a")["title"]\n    price = article.find("p", class_="price_color").text\n    print("  " + title[:40] + "...")\n    print("  Price: " + price)\n    print()`,
            whatItDoes: "Extracting multiple fields from each scraped item — this is the core of every price monitoring and competitive analysis tool.",
            check: (output) => output.includes("BOOKS") || output.includes("Price") || output.includes("Pound"),
          },
          {
            type: "scratch",
            prompt: "Build a lead scraper simulator. Create a fake HTML string with 3 business listings (name, phone, category). Parse it with BeautifulSoup and extract all 3 businesses into a list of dicts.",
            starterCode: `from bs4 import BeautifulSoup\n\nfake_html = """\n<div class="listings">\n  <div class="business">\n    <h2 class="name">Joe's Plumbing</h2>\n    <span class="phone">404-555-0101</span>\n    <span class="category">Plumbing</span>\n  </div>\n  <div class="business">\n    <h2 class="name">Atlanta Cleaning Co</h2>\n    <span class="phone">404-555-0202</span>\n    <span class="category">Cleaning</span>\n  </div>\n  <div class="business">\n    <h2 class="name">Quick Tax Services</h2>\n    <span class="phone">404-555-0303</span>\n    <span class="category">Accounting</span>\n  </div>\n</div>\n"""\n\nsoup = BeautifulSoup(fake_html, "html.parser")\nleads = []\nfor biz in soup.find_all("div", class_="business"):\n    leads.append({\n        "name": biz.find("h2").text,\n        "phone": biz.find("span", class_="phone").text,\n        "category": biz.find("span", class_="category").text\n    })\n\nprint("SCRAPED LEADS:")\nfor lead in leads:\n    print(lead["name"] + " | " + lead["phone"] + " | " + lead["category"])`,
            whatItDoes: "Lead generation scraping — businesses pay $300-1,000 for scripts that extract their competitors' customer info from directories.",
            check: (output) => output.includes("SCRAPED") || output.includes("Plumbing") || output.includes("404"),
          },
        ],
        quiz: [
          { question: "What does BeautifulSoup do?", answer: "Parses HTML/XML and lets you search it like a document", choices: ["Makes HTTP requests", "Parses HTML/XML and lets you search it like a document", "Sends emails", "Saves data to CSV"] },
          { question: "What does soup.find_all('div', class_='product') return?", answer: "All divs with class product as a list", choices: ["The first div with class product", "All divs with class product as a list", "True if product exists", "The HTML string"] },
          { question: "What is the difference between soup.find() and soup.find_all()?", answer: "find() returns first match; find_all() returns all matches as a list", choices: ["find() is faster", "find() returns first match; find_all() returns all matches as a list", ", "] },
          { question: "Why should you always check a site's terms before scraping?", answer: "Some sites prohibit scraping and you can be legally responsible", choices: ["Python requires it", "Some sites prohibit scraping and you can be legally responsible", "It makes scraping faster", "To get an API key"] },
          { question: "What does response.text contain after requests.get(url)?", answer: "The raw HTML of the webpage as a string", choices: ["A Python dictionary", "The raw HTML of the webpage as a string", "The status code", "A BeautifulSoup object"] },
        ],
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
        challenges: [
          {
            type: "guided",
            prompt: "Call the free joke API at 'https://official-joke-api.appspot.com/random_joke' and print the setup and punchline of a random joke.",
            starterCode: `import requests\n\nurl = "https://official-joke-api.appspot.com/random_joke"\nresponse = requests.get(url)\njoke = response.json()\n\nprint("Setup:", joke["setup"])\nprint("Punchline:", joke["punchline"])\nprint("\\nType:", joke["type"])`,
            whatItDoes: "You called a real live API and got real data back. This exact pattern — request URL, parse JSON, use the data — works with any API in the world.",
            check: (output) => output.includes("Setup") || output.includes("Punchline") || output.length > 0,
          },
          {
            type: "modify",
            prompt: "Add error handling with try/except. If the API is unreachable, print a fallback joke instead of crashing. Also print the HTTP status code on success.",
            starterCode: `import requests\n\ndef get_joke():\n    try:\n        response = requests.get("https://official-joke-api.appspot.com/random_joke", timeout=5)\n        print("Status:", response.status_code)\n        joke = response.json()\n        print("Setup:", joke["setup"])\n        print("Punchline:", joke["punchline"])\n    except Exception as e:\n        print("API unavailable:", str(e))\n        print("Fallback joke:")\n        print("Setup: Why do programmers prefer dark mode?")\n        print("Punchline: Because light attracts bugs.")\n\nget_joke()`,
            whatItDoes: "Always wrap API calls in try/except. Real apps never crash from network errors — they fall back gracefully.",
            check: (output) => output.includes("Status") || output.includes("Setup") || output.includes("Fallback"),
          },
          {
            type: "scratch",
            prompt: "Build a weather widget simulator. Use the Open-Meteo free API: fetch current temperature for latitude=40.71 (New York), longitude=-74.01. Print temp in °F and a status label (hot/warm/cool/cold).",
            starterCode: `import requests\n\ndef get_weather(lat, lon):\n    url = "https://api.open-meteo.com/v1/forecast"\n    params = {\n        "latitude": lat,\n        "longitude": lon,\n        "current_weather": True,\n        "temperature_unit": "fahrenheit"\n    }\n    try:\n        response = requests.get(url, params=params, timeout=5)\n        data = response.json()\n        temp = data["current_weather"]["temperature"]\n        \n        if temp >= 85: status = "HOT"\n        elif temp >= 70: status = "WARM"\n        elif temp >= 55: status = "COOL"\n        else: status = "COLD"\n        \n        print("Location: New York, NY")\n        print("Temperature: " + str(temp) + "F")\n        print("Status: " + status)\n    except Exception as e:\n        print("Weather unavailable:", str(e))\n\nget_weather(40.71, -74.01)`,
            whatItDoes: "A real weather API call — no key needed. This pattern (URL + params dict + JSON parsing) works for every API you'll ever use.",
            check: (output) => output.includes("Temperature") || output.includes("New York") || output.includes("F"),
          },
        ],
        quiz: [
          { question: "What does response.json() return?", answer: "A Python dictionary parsed from the JSON response", choices: ["A string of JSON text", "A Python dictionary parsed from the JSON response", "The raw HTML", "A list of keys"] },
          { question: "What is an API endpoint?", answer: "A specific URL that returns data when you make a request to it", choices: ["A Python package", "A specific URL that returns data when you make a request to it", "A database table", "A function name"] },
          { question: "Why use `requests.get(url, timeout=5)`?", answer: "It limits how long to wait — prevents the program from hanging forever", choices: ["It speeds up the request", "It limits how long to wait — prevents the program from hanging forever", "It's required by the API", "It sets the request type"] },
          { question: "What does status code 200 mean?", answer: "Success — the request worked", choices: ["Error", "Redirect", "Success — the request worked", "Server busy"] },
          { question: "What is the difference between requests.get() and requests.post()?", answer: ", ", choices: [", ", ", ", ", "] },
        ],
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
        challenges: [
          {
            type: "guided",
            prompt: "Write the email sending function and simulate sending to 3 clients by printing what would be sent instead of actually sending.",
            starterCode: `def simulate_email(to_email, subject, body):\n    print("=" * 40)\n    print("TO: " + to_email)\n    print("SUBJECT: " + subject)\n    print("BODY: " + body)\n    print("STATUS: Sent")\n    print("=" * 40)\n\nclients = [\n    {"name": "Marcus", "email": "marcus@example.com", "amount": 500},\n    {"name": "Tamika", "email": "tamika@example.com", "amount": 750},\n    {"name": "DeShawn", "email": "deshawn@example.com", "amount": 300},\n]\n\nfor client in clients:\n    subject = "Invoice from CodeGrind - $" + str(client["amount"]) + " due"\n    body = "Hi " + client["name"] + ", your invoice for $" + str(client["amount"]) + " is ready."\n    simulate_email(client["email"], subject, body)\n\nprint(str(len(clients)) + " invoices sent!")`,
            whatItDoes: "You built an automated invoice system. Replace simulate_email with the real send_email function and you have a script worth $200-500 to any small business.",
            check: (output) => output.includes("TO:") || output.includes("Sent") || output.includes("invoices"),
          },
          {
            type: "modify",
            prompt: "Add an HTML body option. If `html=True`, wrap the body text in `<p>` and `<strong>` tags. Print 'Format: HTML' or 'Format: Plain' in the output.",
            starterCode: `def simulate_email(to_email, subject, body, html=False):\n    formatted_body = "<p>" + body + "</p>" if html else body\n    fmt = "HTML" if html else "Plain"\n    print("TO: " + to_email)\n    print("SUBJECT: " + subject)\n    print("FORMAT: " + fmt)\n    print("BODY: " + formatted_body)\n    print("-" * 30)\n\nsimulate_email(\n    "client@example.com",\n    "Your invoice is ready",\n    "Hi Marcus, your $500 invoice is attached.",\n    html=False\n)\n\nsimulate_email(\n    "vip@example.com",\n    "Special offer just for you",\n    "Hi Tamika, your exclusive deal expires Friday.",\n    html=True\n)`,
            whatItDoes: "HTML emails look professional — logos, bold text, colors. Plain emails feel personal. Choosing the right format is a real copywriting skill.",
            check: (output) => output.includes("FORMAT") || output.includes("HTML") || output.includes("Plain"),
          },
          {
            type: "scratch",
            prompt: "Build a follow-up email sequence. Create a list of 3 follow-up emails (day, subject, body). Print each one in order with its send day and a preview of the body.",
            starterCode: `follow_up_sequence = [\n    {\n        "day": 1,\n        "subject": "Quick question about your project",\n        "body": "Hi [name], I sent over a proposal yesterday. Do you have 10 minutes to chat this week?"\n    },\n    {\n        "day": 4,\n        "subject": "Still interested in automating your reports?",\n        "body": "Hi [name], following up on my Python automation proposal. Happy to adjust scope or price."\n    },\n    {\n        "day": 10,\n        "subject": "Last check-in",\n        "body": "Hi [name], last message from me on this. If timing isn't right, no worries — keep my contact for later."\n    }\n]\n\nprint("=== FOLLOW-UP SEQUENCE ===")\nfor email in follow_up_sequence:\n    print("Day " + str(email["day"]) + ": " + email["subject"])\n    preview = email["body"][:60] + "..."\n    print("  Preview: " + preview)\n    print()`,
            whatItDoes: "An automated follow-up sequence. Top freelancers close 80% of their deals in follow-ups, not the first message. This is that system.",
            check: (output) => output.includes("SEQUENCE") || output.includes("Day") || output.includes("Preview"),
          },
        ],
        quiz: [
          { question: "What Python module handles sending emails via Gmail's SMTP server?", answer: "smtplib", choices: ["email", "gmail", "smtplib", "mail"] },
          { question: "Why should you use an App Password instead of your real Gmail password in code?", answer: ", ", choices: [", ", ", ", ", "] },
          { question: "What does `MIMEText(body, 'html')` create?", answer: "An HTML-formatted email message", choices: ["A plain text email", "An HTML-formatted email message", "A PDF attachment", "An email subject"] },
          { question: "What does a follow-up email sequence do for freelance income?", answer: "Most clients decide after 2-3 touches, so sequences close deals that first messages miss", choices: ["Nothing significant", "Most clients decide after 2-3 touches, so sequences close deals that first messages miss", "Annoys clients", "Reduces your rate"] },
          { question: "In the simulation, why loop over a clients list instead of writing 3 separate calls?", answer: "Loops scale — the same code handles 3 clients or 3,000", choices: ["Python requires it", "Loops scale — the same code handles 3 clients or 3,000", "Lists are faster"] },
        ],
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
        challenges: [
          {
            type: "guided",
            prompt: "Create a FreelanceProject class with name, client, and rate properties. Add a calculate_cost method that takes hours and returns rate * hours. Create 2 projects and call the method.",
            starterCode: `class FreelanceProject:\n    def __init__(self, name, client, rate):\n        self.name = name\n        self.client = client\n        self.rate = rate\n    \n    def calculate_cost(self, hours):\n        total = self.rate * hours\n        print("Project:", self.name)\n        print("Client:", self.client)\n        print("Hours:", hours, "@ $" + str(self.rate) + "/hr")\n        print("Total: $" + str(total))\n        return total\n\nproject1 = FreelanceProject("Website Redesign", "Marcus Johnson", 75)\nproject2 = FreelanceProject("Automation Script", "Tamika Williams", 100)\n\nproject1.calculate_cost(20)\nprint()\nproject2.calculate_cost(8)`,
            whatItDoes: "You built a class that models real freelance work. This is how professional project management software works at its core.",
            check: (output) => output.includes("Project") || output.includes("Total") || output.includes("$"),
          },
          {
            type: "modify",
            prompt: "Add a to_dict() method that returns a dictionary representation of the project (name, client, rate). Then create 2 projects, call to_dict() on each, and print the results.",
            starterCode: `class FreelanceProject:\n    def __init__(self, name, client, rate):\n        self.name = name\n        self.client = client\n        self.rate = rate\n    \n    def calculate_cost(self, hours):\n        return self.rate * hours\n    \n    def to_dict(self):\n        return {"name": self.name, "client": self.client, "rate": self.rate}\n\nprojects = [\n    FreelanceProject("Website Redesign", "Marcus Johnson", 75),\n    FreelanceProject("Automation Script", "Tamika Williams", 100),\n]\n\nfor p in projects:\n    d = p.to_dict()\n    print(d["name"] + " for " + d["client"] + " @ $" + str(d["rate"]) + "/hr")`,
            whatItDoes: "to_dict() is used everywhere — saving objects to JSON, databases, and APIs. A class that can serialize itself is a professional class.",
            check: (output) => output.includes("for") || output.includes("/hr") || output.includes("$"),
          },
          {
            type: "scratch",
            prompt: "Build a Client class with name, email, and budget. Add methods: can_afford(amount) that returns True if amount <= budget, and get_summary() that prints their full profile.",
            starterCode: `class Client:\n    def __init__(self, name, email, budget):\n        self.name = name\n        self.email = email\n        self.budget = budget\n    \n    def can_afford(self, amount):\n        return amount <= self.budget\n    \n    def get_summary(self):\n        print("Client: " + self.name)\n        print("Email: " + self.email)\n        print("Budget: $" + str(self.budget))\n\nclient1 = Client("Marcus Johnson", "marcus@gmail.com", 1500)\nclient2 = Client("Tamika Williams", "tamika@gmail.com", 400)\n\nclient1.get_summary()\nprint("Can afford $800?", client1.can_afford(800))\nprint()\nclient2.get_summary()\nprint("Can afford $800?", client2.can_afford(800))`,
            whatItDoes: "A real CRM model. Every app that manages users, clients, or customers uses a class like this.",
            check: (output) => output.includes("Client") || output.includes("Budget") || output.includes("afford"),
          },
        ],
        quiz: [
          { question: "What does __init__ do in a Python class?", answer: "Runs automatically when you create a new object", choices: ["Imports the class", "Runs automatically when you create a new object", "Deletes the object", "Returns a value"] },
          { question: "What does `self` refer to in a class method?", answer: "The specific object instance that called the method", choices: ["The class itself", "The specific object instance that called the method", "The parent class", "Python's interpreter"] },
          { question: "How do you create an object from a class called Client?", answer: "name", choices: ["name", ", ", "name", ", ", "name", "email", ", ", "name"] },
          { question: "Why add a to_dict() method to a class?", answer: ", ", choices: [", ", ", ", ", "] },
          { question: "What's the advantage of using a class over separate variables for client data?", answer: "Classes bundle related data and behavior together — one object instead of 3 separate vars", choices: ["Classes use less memory", "Classes bundle related data and behavior together — one object instead of 3 separate vars", "Classes are required for client data", "Variables can't store email"] },
        ],
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
        challenges: [
          {
            type: "guided",
            prompt: "Write a script that takes a contact list string and extracts all valid email addresses from it.",
            starterCode: `import re\n\nraw_data = "Contact list: John Smith jsmith@company.com, Tamika Jones tjones@business.net, Marcus Brown mbrown@startup.io, Invalid notanemail"\n\nemail_pattern = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}"\nemails = re.findall(email_pattern, raw_data)\n\nprint("Found", len(emails), "email addresses:")\nfor email in emails:\n    print(" -", email)`,
            whatItDoes: "You extracted structured data from messy text automatically. This exact task — cleaning client data — is one of the most requested Python freelance jobs.",
            check: (output) => output.includes("@") || output.includes("email") || output.includes("Found"),
          },
          {
            type: "modify",
            prompt: "Add US phone number extraction. Use the pattern for formats like 404-555-1234 or (404) 555-1234. Extract both emails and phones from the test string.",
            starterCode: `import re\n\ncontact_dump = "Call Mike at 404-555-0101 or email mike@business.com. For Tamika: (678) 555-0202, tamika@startup.io. Also try 770.555.0303"\n\nemail_pat = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}"\nphone_pat = r"\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}"\n\nemails = re.findall(email_pat, contact_dump)\nphones = re.findall(phone_pat, contact_dump)\n\nprint("Emails found:", emails)\nprint("Phones found:", phones)`,
            whatItDoes: "Extracting multiple pattern types from one string. This is how lead list cleaners, CRM importers, and data pipelines work.",
            check: (output) => output.includes("Emails") || output.includes("Phones") || output.includes("@"),
          },
          {
            type: "scratch",
            prompt: "Build a data cleaner. Given messy_text with prices like '$1,200' or '$45.99', extract all prices, convert them to floats (remove $, commas), and print the total.",
            starterCode: `import re\n\nmessy_text = "Project costs: website $1,200, automation script $450.00, monthly maintenance $89.99 and setup fee $250"\n\nprice_pattern = r"\\$[\\d,]+\\.?\\d*"\nraw_prices = re.findall(price_pattern, messy_text)\n\nprices = []\nfor raw in raw_prices:\n    cleaned = raw.replace("$", "").replace(",", "")\n    prices.append(float(cleaned))\n\nprint("Found prices:", raw_prices)\nprint("Cleaned:", prices)\nprint("Total: $" + str(sum(prices)))`,
            whatItDoes: "Price extraction from unstructured text. This exact pattern powers invoice parsers, receipt scanners, and financial data tools.",
            check: (output) => output.includes("Total") || output.includes("prices") || output.includes("$"),
          },
        ],
        quiz: [
          { question: "What does `re.findall(pattern, text)` return?", answer: "A list of all non-overlapping matches", choices: ["True/False", "The first match", "A list of all non-overlapping matches", "The match position"] },
          { question: "What does `\\d` match in a regex pattern?", answer: "Any digit (0-9)", choices: ["Any letter", "Any digit (0-9)", "A whitespace character", "Any character"] },
          { question: "What does `{3}` mean in the pattern `\\d{3}`?", answer: "Exactly 3 digits", choices: ["At least 3 digits", "Exactly 3 digits", "Up to 3 digits", "3 or more digits"] },
          { question: "Why is `import re` needed?", answer: "Regex is in the standard library but must be imported", choices: ["re is a built-in function", "Regex is in the standard library but must be imported", "It downloads regex from the internet", "Python requires all imports"] },
          { question: "What is the real business value of regex skills for a freelancer?", answer: ", ", choices: [", ", ", ", ", "] },
        ],
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
        challenges: [
          {
            type: "guided",
            prompt: "Write a script that creates 3 folders (reports, invoices, misc) and simulates sorting 5 files into them based on their names.",
            starterCode: `import os\n\nfolders = ["reports", "invoices", "misc"]\nfor folder in folders:\n    os.makedirs(folder, exist_ok=True)\n    print("Created folder:", folder)\n\nfiles = [\n    "report_jan_2026.pdf",\n    "invoice_marcus_001.pdf",\n    "notes.txt",\n    "report_feb_2026.pdf",\n    "invoice_tamika_002.pdf"\n]\n\nfor filename in files:\n    if "report" in filename:\n        destination = "reports/" + filename\n    elif "invoice" in filename:\n        destination = "invoices/" + filename\n    else:\n        destination = "misc/" + filename\n    print("Sorted:", filename, "->", destination)`,
            whatItDoes: "You built a file sorting system. Connect this to shutil.move() and it physically moves real files. This script alone is worth $150-300 to any disorganized small business.",
            check: (output) => output.includes("folder") || output.includes("Sorted") || output.includes("Created"),
          },
          {
            type: "modify",
            prompt: "Add a date prefix to each sorted filename. Extract the year from filenames containing a year (like '2026') and prepend it: '2026_invoice_marcus_001.pdf'. Files without a year get 'undated_' prefix.",
            starterCode: `import re\n\nfiles = [\n    "report_jan_2026.pdf",\n    "invoice_marcus_001.pdf",\n    "notes.txt",\n    "report_feb_2026.pdf",\n    "invoice_tamika_002.pdf"\n]\n\nfor filename in files:\n    year_match = re.search(r"\\d{4}", filename)\n    if year_match:\n        year = year_match.group()\n        new_name = year + "_" + filename\n    else:\n        new_name = "undated_" + filename\n    print(filename + "  ->  " + new_name)`,
            whatItDoes: "Automated file renaming with date extraction. Businesses pay for scripts that rename thousands of legacy files with consistent naming conventions.",
            check: (output) => output.includes("->") || output.includes("2026") || output.includes("undated"),
          },
          {
            type: "scratch",
            prompt: "Build an invoice batch renamer. Given a list of files like 'inv_marcus_jan.pdf', rename them to 'INVOICE_2026_01_MARCUS.pdf' format. Print old name -> new name for each.",
            starterCode: `files = [\n    "inv_marcus_jan.pdf",\n    "inv_tamika_feb.pdf",\n    "inv_deshawn_jan.pdf",\n    "inv_keisha_mar.pdf",\n]\n\nmonth_map = {"jan": "01", "feb": "02", "mar": "03", "apr": "04", "may": "05", "jun": "06"}\n\nfor filename in files:\n    parts = filename.replace(".pdf", "").split("_")\n    client = parts[1].upper()\n    month_key = parts[2].lower()\n    month_num = month_map.get(month_key, "00")\n    new_name = "INVOICE_2026_" + month_num + "_" + client + ".pdf"\n    print(filename + "  ->  " + new_name)`,
            whatItDoes: "A real file naming standardizer. Every accounting firm, law office, and logistics company has this problem. You just solved it.",
            check: (output) => output.includes("INVOICE") || output.includes("->") || output.includes("2026"),
          },
        ],
        quiz: [
          { question: "What does `os.makedirs('folder', exist_ok=True)` do?", answer: "Creates a folder and ignores the error if it already exists", choices: ["Creates a folder and raises an error if it exists", "Creates a folder and ignores the error if it already exists", "Lists folder contents", "Renames a folder"] },
          { question: "What does `os.listdir('.')` return?", answer: "A list of all files and folders in the current directory", choices: ["A single file path", "A list of all files and folders in the current directory", "The current working directory path", "True if the folder exists"] },
          { question: "What does `shutil.move(source, destination)` do?", answer: "Moves the file to a new location", choices: ["Copies the file", "Deletes the file", "Moves the file to a new location", "Renames the folder"] },
          { question: "Why use `exist_ok=True` when creating folders?", answer: "Prevents an error if the folder already exists", choices: ["Required by Python", "It speeds up folder creation", "Prevents an error if the folder already exists", "It creates nested folders"] },
          { question: "What kind of client would pay $200 for a file automation script?", answer: "Any small business with years of unsorted files — a very common problem", choices: ["Large enterprise IT teams only", "Any small business with years of unsorted files — a very common problem", "Only law firms"] },
        ],
      },

      {
        id: "json-data", title: "Working with JSON", xp: 200, analogy: "Think of a digital form",
        theory: [
          { type: "plain", text: "Every time you use an app that loads data from the internet that data comes back as JSON. It is the universal language apps use to talk to each other." },
          { type: "highlight", text: "JSON is the universal language apps use to talk to each other. Python reads and writes it instantly." },
          { type: "code", label: "PYTHON", color: "#6ee7b7", code: `import json\n\ndata = {"name": "Stanley", "skills": ["Python", "JavaScript"]}\njson_string = json.dumps(data)\nprint("JSON:", json_string)\nparsed = json.loads(json_string)\nprint("Name:", parsed["name"])` },
        ],
        hints: ["import json at the top", "json.dumps() converts a dict to JSON string", "json.loads() converts JSON string back to dict"],
        challenges: [
          {
            type: "guided",
            prompt: "Create a profile dictionary, save it as JSON to a file, read it back, and print your name and goal.",
            starterCode: `import json\n\nprofile = {\n    "name": "Stanley White",\n    "goal": "Financial Freedom",\n    "skills": ["Python", "JavaScript"],\n    "target": 100000\n}\n\nwith open("profile.json", "w") as f:\n    json.dump(profile, f)\nprint("Saved!")\n\nwith open("profile.json", "r") as f:\n    loaded = json.load(f)\nprint("Name:", loaded["name"])\nprint("Goal:", loaded["goal"])`,
            whatItDoes: "You saved and loaded real JSON data exactly how apps store user profiles.",
            check: (output) => output.includes("Name:") || output.includes("Saved"),
          },
          {
            type: "modify",
            prompt: "Add a `config.json` file with app settings (theme, language, notifications). Load it on startup and print each setting. Update one setting and save it back.",
            starterCode: `import json\n\ndefault_config = {\n    "theme": "dark",\n    "language": "en",\n    "notifications": True,\n    "currency": "USD"\n}\n\nwith open("config.json", "w") as f:\n    json.dump(default_config, f, indent=2)\n\nwith open("config.json", "r") as f:\n    config = json.load(f)\n\nprint("=== APP SETTINGS ===")\nfor key, value in config.items():\n    print(key + ": " + str(value))\n\nconfig["theme"] = "light"\nwith open("config.json", "w") as f:\n    json.dump(config, f, indent=2)\nprint("\\nTheme updated to: " + config["theme"])`,
            whatItDoes: "A config file system — how every app saves user preferences. Used in VS Code, Sublime Text, and every professional tool.",
            check: (output) => output.includes("SETTINGS") || output.includes("theme") || output.includes("updated"),
          },
          {
            type: "scratch",
            prompt: "Build a JSON data pipeline. Create a list of 3 client records, save as JSON, load it back, add a 'status: active' field to each record, and save the updated version.",
            starterCode: `import json\n\nclients = [\n    {"id": 1, "name": "Marcus Johnson", "email": "marcus@example.com", "budget": 2500},\n    {"id": 2, "name": "Tamika Williams", "email": "tamika@example.com", "budget": 1500},\n    {"id": 3, "name": "DeShawn Carter", "email": "deshawn@example.com", "budget": 800},\n]\n\nwith open("clients.json", "w") as f:\n    json.dump(clients, f, indent=2)\nprint("Saved", len(clients), "clients")\n\nwith open("clients.json", "r") as f:\n    loaded = json.load(f)\n\nfor client in loaded:\n    client["status"] = "active"\n\nwith open("clients.json", "w") as f:\n    json.dump(loaded, f, indent=2)\n\nprint("Updated all clients to status: active")\nfor c in loaded:\n    print(c["name"] + " -- " + c["status"])`,
            whatItDoes: "A data migration pipeline: load → transform → save. This is how ETL (Extract-Transform-Load) processes work in real data engineering.",
            check: (output) => output.includes("active") || output.includes("Saved") || output.includes("Updated"),
          },
        ],
        quiz: [
          { question: "What does json.dumps(data) return?", answer: "A JSON string", choices: ["A file object", "A Python dict", "A JSON string", "Nothing — it saves to a file"] },
          { question: "What is the difference between json.dump() and json.dumps()?", answer: ", ", choices: [", ", ", ", ", "] },
          { question: "What format does JSON use for arrays?", answer: "Square brackets []", choices: ["Parentheses ()", "Curly braces {}", "Square brackets []", "Angle brackets <>"] },
          { question: "Why is JSON the 'universal language' for apps?", answer: "Every programming language can read and write it — perfect for APIs and data exchange", choices: ["It's the fastest format", "Every programming language can read and write it — perfect for APIs and data exchange", "It's smaller than CSV", "JSON is required by browsers"] },
          { question: "What does `indent=2` do in `json.dump(data, f, indent=2)`?", answer: "Pretty-prints with 2-space indentation (human readable)", choices: ["Adds 2 extra fields", "Pretty-prints with 2-space indentation (human readable)", "Compresses the JSON", "Adds 2 to all numbers"] },
        ],
      },
      {
        id: "flask-basics", title: "Flask — Build Your First Web Server", xp: 275, analogy: "Think of a restaurant kitchen",
        theory: [
          { type: "plain", text: "A restaurant kitchen receives orders, prepares food, and sends it back out. A web server does the exact same thing." },
          { type: "highlight", text: "Flask is a Python library that lets you build web servers and APIs in just a few lines of code." },
          { type: "code", label: "PYTHON", color: "#6ee7b7", code: `from flask import Flask, jsonify\n\napp = Flask(__name__)\n\n@app.route("/")\ndef home():\n    return "Hello from your Python server!"\n\n@app.route("/api/profile")\ndef profile():\n    return jsonify({"name": "Stanley", "rate": "$75/hr"})` },
        ],
        hints: ["Install Flask: pip install flask", "@app.route() defines a URL endpoint", "jsonify() converts a Python dict to a JSON response"],
        challenges: [
          {
            type: "guided",
            prompt: "Simulate a Flask app with 3 routes. Call each function and print the responses.",
            starterCode: `def home():\n    return "Hello from your Python server!"\n\ndef api_profile():\n    return {"name": "Stanley White", "skills": ["Python", "Flask"], "rate": "$75/hr"}\n\ndef api_services():\n    return {"services": ["Websites", "Automation", "Chatbots"], "starting_at": "$200"}\n\nroutes = {"/": home, "/api/profile": api_profile, "/api/services": api_services}\n\nprint("=== FLASK SERVER SIMULATION ===")\nfor route, handler in routes.items():\n    print("\\nGET", route)\n    print("Response:", handler())`,
            whatItDoes: "You simulated a real Flask web server with multiple routes.",
            check: (output) => output.includes("FLASK") || output.includes("profile"),
          },
          {
            type: "modify",
            prompt: "Add a 404 handler. If a route is not in the routes dict, return {'error': 'Route not found', 'status': 404}. Test it by looking up '/api/missing'.",
            starterCode: `def home():\n    return {"message": "Welcome", "status": 200}\n\ndef api_profile():\n    return {"name": "Stanley White", "rate": "$75/hr", "status": 200}\n\nroutes = {"/": home, "/api/profile": api_profile}\n\ndef handle_request(path):\n    if path in routes:\n        return routes[path]()\n    else:\n        return {"error": "Route not found", "status": 404}\n\nfor path in ["/", "/api/profile", "/api/missing", "/dashboard"]:\n    result = handle_request(path)\n    print("GET " + path + " ->", result["status"])\n    print("  ", result)`,
            whatItDoes: "404 handling: never let an unknown route crash your server. This is the #1 production issue new Flask developers encounter.",
            check: (output) => output.includes("404") || output.includes("not found") || output.includes("GET"),
          },
          {
            type: "scratch",
            prompt: "Build a REST API simulator. Create endpoints: GET /products (returns a list), GET /products/1 (returns product by id), POST /products (adds a product). Simulate all 3 requests.",
            starterCode: `products = [\n    {"id": 1, "name": "CSV Cleaner Script", "price": 299},\n    {"id": 2, "name": "Invoice Automation", "price": 499},\n]\n\ndef get_products():\n    return {"products": products, "count": len(products)}\n\ndef get_product(product_id):\n    for p in products:\n        if p["id"] == product_id:\n            return p\n    return {"error": "Not found"}\n\ndef create_product(name, price):\n    new_id = max(p["id"] for p in products) + 1\n    new_product = {"id": new_id, "name": name, "price": price}\n    products.append(new_product)\n    return {"created": new_product}\n\nprint("GET /products:", get_products())\nprint("GET /products/1:", get_product(1))\nprint("POST /products:", create_product("Web Scraper", 399))\nprint("GET /products:", get_products())`,
            whatItDoes: "A complete REST API — GET all, GET one, POST new. This is the pattern behind every API you've ever used.",
            check: (output) => output.includes("products") || output.includes("GET") || output.includes("created"),
          },
        ],
        quiz: [
          { question: "What does `@app.route('/')` do in Flask?", answer: "Maps a URL path to a Python function", choices: ["Creates a database table", "Maps a URL path to a Python function", "Imports Flask", "Starts the server"] },
          { question: "What does `jsonify(data)` do in Flask?", answer: "Returns a JSON HTTP response with correct headers", choices: ["Converts data to a CSV", "Returns a JSON HTTP response with correct headers", "Prints data", "Saves data to a file"] },
          { question: "What HTTP method do you use to retrieve data from a server?", answer: "GET", choices: ["POST", "PUT", "DELETE", "GET"] },
          { question: "What does a 404 status code mean?", answer: "Resource not found", choices: ["Server error", "Success", "Redirect", "Resource not found"] },
          { question: "Flask is described as 'micro' framework. What does that mean?", answer: "It provides minimal setup — you add what you need", choices: ["It only runs on small computers", "It includes everything you need out of the box", "It provides minimal setup — you add what you need", "It's slower than other frameworks"] },
        ],
      },
      {
        id: "sqlite-basics", title: "SQLite — Simple Databases", xp: 250, analogy: "Think of a permanent spreadsheet",
        theory: [
          { type: "plain", text: "A spreadsheet breaks when you have thousands of rows. A database does everything faster and automatically." },
          { type: "highlight", text: "SQLite is built into Python. No setup needed. Just import and start storing data permanently." },
          { type: "code", label: "PYTHON", color: "#6ee7b7", code: `import sqlite3\n\nconn = sqlite3.connect("clients.db")\ncursor = conn.cursor()\ncursor.execute("CREATE TABLE IF NOT EXISTS clients (id INTEGER PRIMARY KEY, name TEXT, budget INTEGER)")\ncursor.execute("INSERT INTO clients (name, budget) VALUES (?, ?)", ("Marcus", 2500))\nconn.commit()\ncursor.execute("SELECT * FROM clients")\nprint(cursor.fetchall())\nconn.close()` },
        ],
        hints: ["sqlite3 is built into Python", "CREATE TABLE makes a table. INSERT adds data. SELECT retrieves it.", "Always commit() after inserting and close() when done"],
        challenges: [
          {
            type: "guided",
            prompt: "Create a freelance.db with a projects table. Insert 3 projects and print them all.",
            starterCode: `import sqlite3\n\nconn = sqlite3.connect("freelance.db")\ncursor = conn.cursor()\ncursor.execute("CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY, client TEXT, service TEXT, amount INTEGER, status TEXT)")\n\nprojects = [("Marcus", "Website", 1500, "completed"), ("Tamika", "Automation", 800, "in progress"), ("DeShawn", "Chatbot", 1200, "completed")]\n\nfor p in projects:\n    cursor.execute("INSERT INTO projects (client, service, amount, status) VALUES (?, ?, ?, ?)", p)\nconn.commit()\n\nprint("=== FREELANCE DATABASE ===")\ncursor.execute("SELECT * FROM projects")\nfor row in cursor.fetchall():\n    print("Client:", row[1], "| Service:", row[2], "| $" + str(row[3]), "| Status:", row[4])\n\ncursor.execute("SELECT SUM(amount) FROM projects WHERE status = 'completed'")\nprint("Total earned: $", cursor.fetchone()[0])\nconn.close()`,
            whatItDoes: "You built a real database that stores freelance project data permanently.",
            check: (output) => output.includes("DATABASE") || output.includes("Client:") || output.includes("Total"),
          },
          {
            type: "modify",
            prompt: "Add UPDATE and DELETE operations. Update the 'in progress' project to 'completed'. Delete any project with amount < 1000. Print the final database state.",
            starterCode: `import sqlite3\n\nconn = sqlite3.connect("freelance2.db")\ncursor = conn.cursor()\ncursor.execute("CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY, client TEXT, amount INTEGER, status TEXT)")\n\ndata = [("Marcus", 1500, "completed"), ("Tamika", 800, "in progress"), ("DeShawn", 500, "completed")]\nfor d in data:\n    cursor.execute("INSERT INTO projects (client, amount, status) VALUES (?, ?, ?)", d)\nconn.commit()\n\ncursor.execute("UPDATE projects SET status = 'completed' WHERE status = 'in progress'")\nprint("Updated in-progress to completed")\n\ncursor.execute("DELETE FROM projects WHERE amount < 1000")\nprint("Deleted low-value projects")\nconn.commit()\n\nprint("\\n=== FINAL DATABASE ===")\ncursor.execute("SELECT * FROM projects")\nfor row in cursor.fetchall():\n    print(row[1], "| $" + str(row[2]) + " | " + row[3])\nconn.close()`,
            whatItDoes: "Full CRUD: Create, Read, Update, Delete. This is the foundation of every app with persistent data.",
            check: (output) => output.includes("Updated") || output.includes("FINAL") || output.includes("Deleted"),
          },
          {
            type: "scratch",
            prompt: "Build a client tracker database. Create a clients table with name, email, total_paid, and active columns. Insert 3 clients, query total revenue from active clients, and list them sorted by total_paid.",
            starterCode: `import sqlite3\n\nconn = sqlite3.connect("clients.db")\ncursor = conn.cursor()\n\ncursor.execute("""\n    CREATE TABLE IF NOT EXISTS clients (\n        id INTEGER PRIMARY KEY,\n        name TEXT,\n        email TEXT,\n        total_paid INTEGER,\n        active INTEGER\n    )\n""")\n\nclients = [\n    ("Marcus Johnson", "marcus@ex.com", 4500, 1),\n    ("Tamika Williams", "tamika@ex.com", 1200, 1),\n    ("DeShawn Carter", "deshawn@ex.com", 800, 0),\n]\nfor c in clients:\n    cursor.execute("INSERT INTO clients (name, email, total_paid, active) VALUES (?, ?, ?, ?)", c)\nconn.commit()\n\ncursor.execute("SELECT SUM(total_paid) FROM clients WHERE active = 1")\nrevenue = cursor.fetchone()[0]\nprint("Active client revenue: $" + str(revenue))\n\nprint("\\nClients by revenue:")\ncursor.execute("SELECT name, total_paid, active FROM clients ORDER BY total_paid DESC")\nfor row in cursor.fetchall():\n    status = "Active" if row[2] else "Inactive"\n    print(row[0] + ": $" + str(row[1]) + " -- " + status)\n\nconn.close()`,
            whatItDoes: "A real CRM database with filtering and sorting. This is the data layer behind every client management tool.",
            check: (output) => output.includes("revenue") || output.includes("Active") || output.includes("$"),
          },
        ],
        quiz: [
          { question: "What does sqlite3 need to run?", answer: ", ", choices: ["A separate installation", "An internet connection", ", "] },
          { question: "What is the purpose of `conn.commit()` after inserting data?", answer: "Saves the changes permanently to the database", choices: ["Closes the connection", "Saves the changes permanently to the database", "Returns the inserted data", "Creates an index"] },
          { question: "What does `cursor.fetchall()` return?", answer: "All rows from the last SELECT query as a list of tuples", choices: ["The number of rows", "The first row", "All rows from the last SELECT query as a list of tuples", "A dictionary"] },
          { question: "Why use `?` placeholders in SQL queries instead of string formatting?", answer: "Prevents SQL injection attacks", choices: ["It's required by SQLite", "Prevents SQL injection attacks", "Makes queries faster", "Works with any database"] },
          { question: "What SQL keyword filters rows by a condition?", answer: "WHERE", choices: ["FILTER", "WHERE", "FIND", "SELECT"] },
        ],
      },
      {
        id: "virtual-environments", title: "Virtual Environments — Professional Python Setup", xp: 175, analogy: "Think of separate toolboxes for each job",
        theory: [
          { type: "plain", text: "A plumber keeps different toolboxes for different jobs. Virtual environments do the same for Python projects." },
          { type: "highlight", text: "A virtual environment is an isolated Python setup for each project. Professional developers always use them." },
          { type: "code", label: "TERMINAL", color: "#6ee7b7", code: `python3 -m venv myproject\nsource myproject/bin/activate\npip install flask requests pandas\npip freeze > requirements.txt\ndeactivate` },
        ],
        hints: ["python3 -m venv name creates the environment", "source name/bin/activate turns it on", "pip freeze > requirements.txt saves all your packages"],
        challenges: [
          {
            type: "guided",
            prompt: "Simulate a virtual environment setup by printing each step and what it does.",
            starterCode: `steps = [\n    ("python3 -m venv codegrind_env", "Creates an isolated Python environment"),\n    ("source codegrind_env/bin/activate", "Activates the environment"),\n    ("pip install flask requests pandas", "Installs packages only in this environment"),\n    ("pip freeze > requirements.txt", "Saves package list so others can replicate"),\n    ("deactivate", "Turns off the environment when done")\n]\n\nprint("=== VIRTUAL ENVIRONMENT SETUP ===")\nfor command, explanation in steps:\n    print("$ " + command)\n    print("  ->", explanation)\n    print()\n\nprint("Your project is now professionally set up!")`,
            whatItDoes: "Virtual environments are standard practice in professional Python development.",
            check: (output) => output.includes("VIRTUAL") || output.includes("professionally"),
          },
          {
            type: "modify",
            prompt: "Add version numbers to the install step. Print 'Installed: flask==3.0.0, requests==2.31.0, pandas==2.1.0' after each package install. Simulate pip freeze output with those versions.",
            starterCode: `packages = [\n    ("flask", "3.0.0"),\n    ("requests", "2.31.0"),\n    ("pandas", "2.1.0"),\n    ("python-dotenv", "1.0.0"),\n]\n\nprint("=== INSTALLING PACKAGES ===")\nfor name, version in packages:\n    print("Installing " + name + "==" + version + "...")\n    print("  Installed: " + name + "-" + version)\n    print()\n\nprint("=== requirements.txt ===")\nfor name, version in packages:\n    print(name + "==" + version)`,
            whatItDoes: "requirements.txt with pinned versions is how professional Python projects are shared. Any developer can replicate your setup exactly.",
            check: (output) => output.includes("==") || output.includes("requirements") || output.includes("Installing"),
          },
          {
            type: "scratch",
            prompt: "Build a project scaffolder. Given a project name, print the commands to: create a folder, create a venv, activate it, create a main.py file, and create a requirements.txt. Include the exact bash commands.",
            starterCode: `def scaffold_project(project_name):\n    print("=== SCAFFOLD: " + project_name + " ===")\n    print()\n    commands = [\n        ("mkdir " + project_name, "Create project folder"),\n        ("cd " + project_name, "Enter folder"),\n        ("python3 -m venv venv", "Create virtual environment"),\n        ("source venv/bin/activate", "Activate environment"),\n        ("touch main.py requirements.txt .env", "Create starter files"),\n        ("echo '# " + project_name + "' > README.md", "Create README"),\n    ]\n    for cmd, desc in commands:\n        print("$ " + cmd)\n        print("  # " + desc)\n        print()\n    print("Project ready! Start coding in main.py")\n\nscaffold_project("my_automation_tool")`,
            whatItDoes: "A project scaffolder. Run these commands in a real terminal and you have a professional Python project in 60 seconds.",
            check: (output) => output.includes("SCAFFOLD") || output.includes("mkdir") || output.includes("venv"),
          },
        ],
        quiz: [
          { question: "What is the main benefit of a virtual environment?", answer: "Isolated dependencies — each project has its own packages without conflicts", choices: ["Faster code execution", "Isolated dependencies — each project has its own packages without conflicts", "Automatic testing", "Online code sharing"] },
          { question: "What command creates a virtual environment named 'venv'?", answer: "python3 -m venv venv", choices: ["virtualenv create venv", "python3 -m venv venv", "pip create venv", "create-venv venv"] },
          { question: "What does `pip freeze > requirements.txt` do?", answer: "Saves the current environment's packages and versions to a file", choices: ["Installs packages from requirements.txt", "Saves the current environment's packages and versions to a file", "Deletes unused packages", "Upgrades all packages"] },
          { question: "How does another developer replicate your exact environment from requirements.txt?", answer: "pip install -r requirements.txt", choices: ["pip install", "pip install -r requirements.txt", "python setup.py install", "pip freeze"] },
          { question: "Why do professional Python developers always use virtual environments?", answer: ", ", choices: [", ", ", ", ", "] },
        ],
      },
      {
        id: "pandas-intro", title: "Pandas — Data Analysis Like a Pro", xp: 275, analogy: "Think of a supercharged spreadsheet",
        theory: [
          { type: "plain", text: "Excel crashes with large datasets. Pandas handles millions of rows in seconds." },
          { type: "highlight", text: "Pandas is the most in-demand Python library for data work. It reads CSVs, Excel files, and databases instantly." },
          { type: "code", label: "PYTHON", color: "#6ee7b7", code: `import pandas as pd\n\ndf = pd.read_csv("sales.csv")\nprint(df.head())\nprint("Total:", df["amount"].sum())\nprint("Average:", df["amount"].mean())` },
        ],
        hints: ["Install: pip install pandas", "pd.read_csv() loads a CSV into a DataFrame", "Use .sum(), .mean(), .groupby() to analyze"],
        challenges: [
          {
            type: "guided",
            prompt: "Create a pandas DataFrame with sales data, calculate totals and averages, and find the top performer.",
            starterCode: `import pandas as pd\n\ndata = {\n    "name": ["Marcus", "Tamika", "DeShawn", "Keisha", "Jerome"],\n    "sales": [1500, 2200, 900, 3100, 1800],\n    "region": ["South", "East", "West", "East", "South"]\n}\n\ndf = pd.DataFrame(data)\nprint("=== SALES REPORT ===")\nprint(df.to_string(index=False))\nprint("\\nTotal sales: $", df["sales"].sum())\nprint("Average sale: $", df["sales"].mean())\nprint("Top performer:", df.loc[df["sales"].idxmax(), "name"])`,
            whatItDoes: "You analyzed a sales dataset with pandas exactly what data freelancers get paid for.",
            check: (output) => output.includes("SALES") || output.includes("Total") || output.includes("performer"),
          },
          {
            type: "modify",
            prompt: "Add groupby analysis: group sales by region and print total sales per region, sorted highest to lowest.",
            starterCode: `import pandas as pd\n\ndata = {\n    "name": ["Marcus", "Tamika", "DeShawn", "Keisha", "Jerome"],\n    "sales": [1500, 2200, 900, 3100, 1800],\n    "region": ["South", "East", "West", "East", "South"]\n}\n\ndf = pd.DataFrame(data)\n\nregional = df.groupby("region")["sales"].sum().sort_values(ascending=False)\n\nprint("=== SALES BY REGION ===")\nfor region, total in regional.items():\n    print(region + ": $" + str(total))\n\nprint("\\nTop region:", regional.idxmax())`,
            whatItDoes: "groupby() is pandas' superpower for business reporting. This exact pattern generates the regional breakdowns in every sales dashboard.",
            check: (output) => output.includes("REGION") || output.includes("East") || output.includes("South"),
          },
          {
            type: "scratch",
            prompt: "Build a monthly P&L report. Create a DataFrame with months (Jan-Jun), revenue, and expenses. Calculate profit per month, total profit, and the best month. Print a formatted table.",
            starterCode: `import pandas as pd\n\ndata = {\n    "month": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],\n    "revenue": [2000, 3500, 2800, 4200, 5100, 3900],\n    "expenses": [800, 1200, 900, 1400, 1600, 1100]\n}\n\ndf = pd.DataFrame(data)\ndf["profit"] = df["revenue"] - df["expenses"]\ndf["margin"] = (df["profit"] / df["revenue"] * 100).round(1)\n\nprint("=== P&L REPORT ===")\nprint(df.to_string(index=False))\nprint()\nprint("Total revenue: $" + str(df["revenue"].sum()))\nprint("Total profit:  $" + str(df["profit"].sum()))\nbest_idx = df["profit"].idxmax()\nprint("Best month: " + df.loc[best_idx, "month"] + " ($" + str(df.loc[best_idx, "profit"]) + ")")`,
            whatItDoes: "A real P&L report. Every small business needs this monthly. Freelancers charge $150-500 for automated financial reports like this.",
            check: (output) => output.includes("P&L") || output.includes("profit") || output.includes("revenue"),
          },
        ],
        quiz: [
          { question: "What does pd.DataFrame(data) do?", answer: "Creates a 2D table structure from a dictionary or list", choices: ["Creates a CSV file", "Creates a 2D table structure from a dictionary or list", "Imports pandas", "Plots a chart"] },
          { question: "What does df['sales'].sum() return?", answer: "The total sum of all values in the sales column", choices: ["The count of sales rows", "The total sum of all values in the sales column", "The average sale", "The max value"] },
          { question: "What does groupby('region')['sales'].sum() do?", answer: "Groups rows by region and sums sales for each group", choices: ["Filters by region", "Groups rows by region and sums sales for each group", "Sorts by region", "Deletes duplicate regions"] },
          { question: "Why is pandas better than Excel for large datasets?", answer: ", ", choices: [", ", ", ", ", "] },
          { question: "What does df.loc[df['sales'].idxmax(), 'name'] return?", answer: "The name of the row with the highest sales value", choices: ["The max sale amount", "The name of the row with the highest sales value", "All names sorted by sales", "The index of the max row"] },
        ],
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
        challenges: [
          {
            type: "guided",
            prompt: "Build the price tracker. Simulate checking 3 products and saving their prices to a CSV file. Print a summary at the end.",
            starterCode: `import csv\nfrom datetime import date\n\ndef save_price(product, price, url):\n    with open("price_history.csv", "a", newline="") as f:\n        writer = csv.writer(f)\n        writer.writerow([date.today(), product, price, url])\n\ndef check_prices(products):\n    print("=== PRICE TRACKER RUNNING ===")\n    print("Date:", str(date.today()))\n    print()\n    for product in products:\n        print("Checking:", product["name"])\n        print("  URL:", product["url"])\n        print("  Price:", product["simulated_price"])\n        save_price(product["name"], product["simulated_price"], product["url"])\n        print("  Saved to CSV")\n        print()\n    print("Tracked", len(products), "products.")\n\nmy_products = [\n    {"name": "Python Book", "url": "amazon.com/python-book", "simulated_price": "$29.99"},\n    {"name": "Mechanical Keyboard", "url": "amazon.com/keyboard", "simulated_price": "$89.99"},\n    {"name": "Monitor Stand", "url": "amazon.com/stand", "simulated_price": "$45.00"},\n]\n\ncheck_prices(my_products)`,
            whatItDoes: "A complete price tracking system. Add real web scraping and schedule it to run daily and you have a $500 Fiverr product.",
            check: (output) => output.includes("TRACKER") || output.includes("Tracked") || output.includes("Price"),
          },
          {
            type: "modify",
            prompt: "Add price comparison. Track each product's previous price in a dict. After 'checking', compare new vs old price and print 'PRICE DROP!' if it went down or 'INCREASED' if it went up.",
            starterCode: `from datetime import date\n\nprevious_prices = {\n    "Python Book": "$34.99",\n    "Keyboard": "$99.99",\n    "Monitor Stand": "$45.00"\n}\n\ncurrent_prices = {\n    "Python Book": "$29.99",\n    "Keyboard": "$89.99",\n    "Monitor Stand": "$47.00"\n}\n\nprint("=== PRICE COMPARISON ===")\nfor product, new_price in current_prices.items():\n    old = float(previous_prices[product].replace("$", ""))\n    new = float(new_price.replace("$", ""))\n    diff = new - old\n    if diff < 0:\n        status = "PRICE DROP! Save $" + str(abs(round(diff, 2)))\n    elif diff > 0:\n        status = "INCREASED by $" + str(round(diff, 2))\n    else:\n        status = "No change"\n    print(product + ": " + new_price + " -- " + status)`,
            whatItDoes: "Automated price comparison — the core logic of every deal alert and price history service like CamelCamelCamel.",
            check: (output) => output.includes("PRICE DROP") || output.includes("INCREASED") || output.includes("COMPARISON"),
          },
          {
            type: "scratch",
            prompt: "Build the complete price alert system. Simulate 5 days of price checks for 3 products (use a list of daily prices). When a price drops below the target, print 'ALERT: Buy now!' with the savings.",
            starterCode: `products = [\n    {"name": "Python Book", "target": 25.00, "daily_prices": [34.99, 32.99, 29.99, 27.50, 24.99]},\n    {"name": "Keyboard", "target": 85.00, "daily_prices": [99.99, 99.99, 94.99, 89.99, 87.00]},\n    {"name": "Monitor Stand", "target": 40.00, "daily_prices": [45.00, 45.00, 42.00, 43.00, 39.99]},\n]\n\nfor product in products:\n    print("Tracking: " + product["name"] + " (target: $" + str(product["target"]) + ")")\n    for day, price in enumerate(product["daily_prices"], 1):\n        if price <= product["target"]:\n            savings = round(product["daily_prices"][0] - price, 2)\n            print("  Day " + str(day) + ": $" + str(price) + " -- ALERT: Buy now! Save $" + str(savings))\n        else:\n            print("  Day " + str(day) + ": $" + str(price))\n    print()`,
            whatItDoes: "A complete price alert system. Schedule this to run daily, connect to real scraping, and it's a product worth $500+ on Fiverr.",
            check: (output) => output.includes("ALERT") || output.includes("target") || output.includes("Tracking"),
          },
        ],
        quiz: [
          { question: "What does the 'a' mode do in `open('file.csv', 'a')`?", answer: "Appends new data to the end without erasing existing content", choices: ["Opens for reading only", "Overwrites the file each time", "Appends new data to the end without erasing existing content", "Creates a new file always"] },
          { question: "Why use `date.today()` when logging prices?", answer: "To know WHEN each price was recorded — price history is useless without timestamps", choices: ["Required by the csv module", "To know WHEN each price was recorded — price history is useless without timestamps", "Python requires dates in CSVs", "To sort the data"] },
          { question: "What's the real business value of a price tracker?", answer: "Businesses pay $300-1,000 for automated competitor price monitoring", choices: ["It's mainly educational", "Businesses pay $300-1,000 for automated competitor price monitoring", "Only Amazon uses price trackers", "It replaces buying products"] },
          { question: "How would you schedule a Python script to run every day automatically?", answer: "Cron jobs (Linux/Mac) or Task Scheduler (Windows)", choices: ["Use time.sleep(86400) in a loop", "Cron jobs (Linux/Mac) or Task Scheduler (Windows)", "Email yourself to remember", "Flask handles scheduling"] },
          { question: "What does `float('$29.99'.replace('$',''))` return?", answer: "29.99 as a float", choices: ["'29.99'", "Error", "29.99 as a float", "29"] },
        ],
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
        challenges: [
          {
            type: "guided",
            prompt: "Create a JavaScript object called 'myBusiness' with your name, service, rate, and a method called 'getQuote' that takes hours and logs the total cost.",
            starterCode: `const myBusiness = {\n  owner: "Stanley White",\n  service: "Web Development",\n  hourlyRate: 75,\n  \n  getQuote: function(hours) {\n    const total = this.hourlyRate * hours\n    console.log("Quote for " + this.service)\n    console.log("Hours: " + hours + " @ $" + this.hourlyRate + "/hr")\n    console.log("Total: $" + total)\n    return total\n  }\n}\n\nconsole.log("Business:", myBusiness.owner)\nconsole.log("Service:", myBusiness.service)\nconsole.log("")\nmyBusiness.getQuote(20)\nconsole.log("")\nmyBusiness.getQuote(40)`,
            whatItDoes: "You built a business object with a quote generator method. This is how real apps model data — users, products, orders are all objects like this.",
            check: (output) => output.includes("Quote") || output.includes("Total") || output.includes("$"),
          },
          {
            type: "modify",
            prompt: "Add a toString() method that returns a formatted string: 'Stanley White | Web Development | $75/hr'. Call it and log the result.",
            starterCode: `const myBusiness = {\n  owner: "Stanley White",\n  service: "Web Development",\n  hourlyRate: 75,\n  \n  getQuote: function(hours) {\n    return this.hourlyRate * hours\n  },\n  \n  toString: function() {\n    return this.owner + " | " + this.service + " | $" + this.hourlyRate + "/hr"\n  }\n}\n\nconsole.log("Profile:", myBusiness.toString())\nconsole.log("20hr quote: $" + myBusiness.getQuote(20))\nconsole.log("40hr quote: $" + myBusiness.getQuote(40))`,
            whatItDoes: "A toString() method makes objects human-readable. Used in logging, display, and APIs everywhere.",
            check: (output) => output.includes("Profile") || output.includes("|") || output.includes("quote"),
          },
          {
            type: "scratch",
            prompt: "Build a Project object with title, client, hourlyRate, and hoursWorked. Add methods: getTotal() (rate × hours), getStatus() (returns 'In progress' or 'Complete' based on hoursWorked > 0). Log all details.",
            starterCode: `const project = {\n  title: "Website Redesign",\n  client: "Marcus Johnson",\n  hourlyRate: 75,\n  hoursWorked: 15,\n  \n  getTotal: function() {\n    return this.hourlyRate * this.hoursWorked\n  },\n  \n  getStatus: function() {\n    return this.hoursWorked > 0 ? "In progress" : "Not started"\n  },\n  \n  getSummary: function() {\n    console.log("Project: " + this.title)\n    console.log("Client: " + this.client)\n    console.log("Status: " + this.getStatus())\n    console.log("Earned so far: $" + this.getTotal())\n  }\n}\n\nproject.getSummary()`,
            whatItDoes: "A complete project model. Every project management tool — Trello, Asana, Jira — stores projects as objects like this.",
            check: (output) => output.includes("Project") || output.includes("Status") || output.includes("Earned"),
          },
        ],
        quiz: [
          { question: "How do you access a property called 'name' on an object called 'user'?", answer: "user.name", choices: ["user->name", "user[name]", "user.name", "get(user, name)"] },
          { question: "What is `this` inside an object method?", answer: "The object that owns the method", choices: ["The window object", "The function itself", "The object that owns the method", "Undefined"] },
          { question: "What is the difference between an object and an array in JavaScript?", answer: "Arrays are ordered lists; objects are labeled collections of key-value pairs", choices: ["Objects are faster", "Arrays are ordered lists; objects are labeled collections of key-value pairs", ", "] },
          { question: "How do you add a method to an object literal?", answer: "Include it as a key with a function value: method: function() {}", choices: ["object.method = def() {}", "Include it as a key with a function value: method: function() {}", "object.prototype.method = function()"] },
          { question: "JavaScript objects are most similar to which Python data structure?", answer: "Dictionaries", choices: ["Lists", "Tuples", "Dictionaries", "Sets"] },
        ],
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
        challenges: [
          {
            type: "guided",
            prompt: "Use fetch() to get a random joke from the joke API and log the setup and punchline.",
            starterCode: `fetch("https://official-joke-api.appspot.com/random_joke")\n  .then(response => response.json())\n  .then(joke => {\n    console.log("Type:", joke.type)\n    console.log("Setup:", joke.setup)\n    console.log("Punchline:", joke.punchline)\n    console.log("---")\n    console.log("Joke ID:", joke.id)\n  })\n  .catch(error => {\n    console.log("Fetch failed:", error.message)\n  })`,
            whatItDoes: "You fetched live data from a real API using JavaScript. This exact pattern powers Twitter feeds, weather apps, stock tickers — everything dynamic on the web.",
            check: (output) => output.includes("Setup") || output.includes("Punchline") || output.length > 5,
          },
          {
            type: "modify",
            prompt: "Add a loading state. Log 'Fetching joke...' before the fetch starts and 'Done!' when it completes (in .finally()). Also log the response status code.",
            starterCode: `console.log("Fetching joke...")\n\nfetch("https://official-joke-api.appspot.com/random_joke")\n  .then(response => {\n    console.log("Status:", response.status)\n    return response.json()\n  })\n  .then(joke => {\n    console.log("Setup:", joke.setup)\n    console.log("Punchline:", joke.punchline)\n  })\n  .catch(error => {\n    console.log("Error:", error.message)\n  })\n  .finally(() => {\n    console.log("Done!")\n  })`,
            whatItDoes: ".finally() runs regardless of success or failure — perfect for hiding loading spinners in real apps.",
            check: (output) => output.includes("Fetching") || output.includes("Done") || output.includes("Status"),
          },
          {
            type: "scratch",
            prompt: "Build a multi-fetch function. Fetch 3 jokes sequentially using .then() chaining — each .then() should get one joke and log it, then trigger the next fetch.",
            starterCode: `const url = "https://official-joke-api.appspot.com/random_joke"\n\nconsole.log("Getting 3 jokes...")\n\nfetch(url)\n  .then(r => r.json())\n  .then(joke1 => {\n    console.log("Joke 1:", joke1.setup)\n    return fetch(url)\n  })\n  .then(r => r.json())\n  .then(joke2 => {\n    console.log("Joke 2:", joke2.setup)\n    return fetch(url)\n  })\n  .then(r => r.json())\n  .then(joke3 => {\n    console.log("Joke 3:", joke3.setup)\n    console.log("All 3 fetched!")\n  })\n  .catch(err => console.log("Error:", err.message))`,
            whatItDoes: "Sequential chained fetches — the foundation of multi-step API flows like OAuth, checkout flows, and wizard-style forms.",
            check: (output) => output.includes("Joke") || output.includes("fetched") || output.length > 5,
          },
        ],
        quiz: [
          { question: "What does fetch(url) return?", answer: "A Promise that resolves to a Response object", choices: ["The data directly", "A Promise that resolves to a Response object", "JSON data", "A string"] },
          { question: "Why do you need `.then(response => response.json())` after fetch?", answer: "To convert the Response object to usable JavaScript data", choices: ["To validate the JSON", "To convert the Response object to usable JavaScript data", "To catch errors", "To log the response"] },
          { question: "What does .catch() handle in a fetch chain?", answer: "Network errors and rejected Promises", choices: ["Successful responses", "JSON parsing only", "Network errors and rejected Promises", "Response headers"] },
          { question: "What does .finally() do?", answer: "Runs after the Promise settles regardless of success or failure", choices: ["Only runs on success", "Only runs on error", "Runs after the Promise settles regardless of success or failure", "Retries the fetch"] },
          { question: "Which HTTP verb does fetch() use by default?", answer: "GET", choices: ["POST", "PUT", "DELETE", "GET"] },
        ],
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
        challenges: [
          {
            type: "guided",
            prompt: "Rewrite a fetch call using async/await. Create an async function that gets a joke and logs both the setup and punchline with try/catch error handling.",
            starterCode: `async function getRandomJoke() {\n  try {\n    const response = await fetch("https://official-joke-api.appspot.com/random_joke")\n    const joke = await response.json()\n    \n    console.log("Got a joke!")\n    console.log("Setup:", joke.setup)\n    console.log("Punchline:", joke.punchline)\n    \n    return joke\n  } catch (error) {\n    console.log("Something went wrong:", error.message)\n  }\n}\n\ngetRandomJoke()`,
            whatItDoes: "async/await makes asynchronous code readable. This is the standard way to write JavaScript in 2026 — every job posting expects you to know this.",
            check: (output) => output.includes("joke") || output.includes("Setup") || output.length > 5,
          },
          {
            type: "modify",
            prompt: "Modify getRandomJoke() to fetch 3 jokes using a loop. Use await inside the loop to fetch one at a time. Log each joke's setup and number (Joke 1, Joke 2, Joke 3).",
            starterCode: `async function getMultipleJokes(count) {\n  console.log("Getting " + count + " jokes...")\n  \n  for (let i = 1; i <= count; i++) {\n    try {\n      const response = await fetch("https://official-joke-api.appspot.com/random_joke")\n      const joke = await response.json()\n      console.log("\\nJoke " + i + ":")\n      console.log("  " + joke.setup)\n      console.log("  " + joke.punchline)\n    } catch (error) {\n      console.log("Joke " + i + " failed:", error.message)\n    }\n  }\n  \n  console.log("\\nAll done!")\n}\n\ngetMultipleJokes(3)`,
            whatItDoes: "await inside a loop — sequential async operations. Used in pagination, multi-step forms, and anywhere you process items one at a time.",
            check: (output) => output.includes("Joke") || output.includes("done") || output.length > 5,
          },
          {
            type: "scratch",
            prompt: "Build a data loader function. Given an array of user IDs, fetch each user from 'https://jsonplaceholder.typicode.com/users/{id}' and log their name and email. Handle errors per-user.",
            starterCode: `async function loadUsers(userIds) {\n  console.log("Loading " + userIds.length + " users...")\n  const results = []\n  \n  for (const id of userIds) {\n    try {\n      const response = await fetch("https://jsonplaceholder.typicode.com/users/" + id)\n      const user = await response.json()\n      results.push(user)\n      console.log("Loaded: " + user.name + " (" + user.email + ")")\n    } catch (error) {\n      console.log("Failed to load user " + id + ": " + error.message)\n    }\n  }\n  \n  console.log("\\nLoaded " + results.length + " of " + userIds.length + " users")\n  return results\n}\n\nloadUsers([1, 2, 3])`,
            whatItDoes: "A real data loader with per-item error handling. This pattern is in every dashboard that loads multiple API resources.",
            check: (output) => output.includes("Loading") || output.includes("Loaded") || output.length > 5,
          },
        ],
        quiz: [
          { question: "What keyword makes a function asynchronous?", answer: "async", choices: ["defer", "wait", "async", "promise"] },
          { question: "What does `await` do inside an async function?", answer: "Pauses that function until the Promise resolves, without blocking other code", choices: ["Makes the whole app wait", "Pauses that function until the Promise resolves, without blocking other code", "Creates a Promise", "Runs code in parallel"] },
          { question: "async/await vs .then() chains — which is preferred in modern JavaScript?", answer: "async/await for readability; both work", choices: [".then() is always preferred", "async/await for readability; both work", ", "] },
          { question: "What replaces .catch() in async/await syntax?", answer: "try/catch block", choices: [".error()", "onError()", "try/catch block", "catch()"] },
          { question: "Can you use `await` outside of an async function?", answer: "No — await must be inside an async function (or top-level module)", choices: ["Yes, anywhere", "Only in .js files", "No — await must be inside an async function (or top-level module)", "Only in browsers"] },
        ],
      },

      {
        id: "js-local-storage", title: "Local Storage — Save Data in the Browser", xp: 175, analogy: "Think of a notepad the browser keeps", language: "javascript",
        theory: [
          { type: "plain", text: "When you close a tab and come back to a website and it still remembers you — that is Local Storage." },
          { type: "highlight", text: "Local Storage lets JavaScript save data permanently in the browser. No server needed." },
          { type: "code", label: "JAVASCRIPT", color: "#fcd34d", code: `localStorage.setItem("username", "Stanley")\nconst name = localStorage.getItem("username")\nconsole.log("Welcome back,", name)` },
        ],
        hints: ["localStorage.setItem('key', 'value') saves data", "localStorage.getItem('key') retrieves it", "Data is always stored as strings"],
        challenges: [
          {
            type: "guided",
            prompt: "Simulate a Local Storage system that saves a user profile and updates the visit count.",
            starterCode: `const storage = {}\nfunction setItem(key, value) { storage[key] = String(value) }\nfunction getItem(key) { return storage[key] || null }\n\nsetItem("username", "Stanley White")\nsetItem("visits", "1")\nconsole.log("=== LOCAL STORAGE ===")\nconsole.log("User:", getItem("username"))\nconsole.log("Visits:", getItem("visits"))\nconst visits = parseInt(getItem("visits")) + 1\nsetItem("visits", visits)\nconsole.log("Updated visits:", getItem("visits"))`,
            whatItDoes: "You simulated browser Local Storage — the same system CodeGrind uses to save your XP.",
            check: (output) => output.includes("LOCAL") || output.includes("User:") || output.includes("visits"),
          },
          {
            type: "modify",
            prompt: "Add expiration support. Store items as JSON objects with a value and expiresAt timestamp. Add a getItemSafe(key) function that returns null if the item has expired.",
            starterCode: `const storage = {}\n\nfunction setItemWithExpiry(key, value, ttlSeconds) {\n  const expires = Date.now() + ttlSeconds * 1000\n  storage[key] = JSON.stringify({ value, expires })\n}\n\nfunction getItemSafe(key) {\n  const raw = storage[key]\n  if (!raw) return null\n  const item = JSON.parse(raw)\n  if (Date.now() > item.expires) {\n    delete storage[key]\n    console.log(key + " expired")\n    return null\n  }\n  return item.value\n}\n\nsetItemWithExpiry("session", "abc123", 3600)  // 1 hour\nsetItemWithExpiry("promo", "SAVE20", 1)       // expires in 1ms (already expired)\n\nconsole.log("Session:", getItemSafe("session"))\nconsole.log("Promo:", getItemSafe("promo"))`,
            whatItDoes: "Time-based expiry is how sessions, auth tokens, and promo codes work. This is the real implementation pattern.",
            check: (output) => output.includes("Session") || output.includes("expired") || output.includes("Promo"),
          },
          {
            type: "scratch",
            prompt: "Build a user settings manager. Create getSettings(), updateSetting(key, value), and resetSettings() functions using the storage simulation. Store and retrieve: theme, language, and fontSize.",
            starterCode: `const storage = {}\nconst setItem = (k, v) => storage[k] = String(v)\nconst getItem = (k) => storage[k] || null\n\nconst DEFAULT_SETTINGS = { theme: "dark", language: "en", fontSize: "14px" }\n\nfunction getSettings() {\n  const saved = getItem("settings")\n  return saved ? JSON.parse(saved) : { ...DEFAULT_SETTINGS }\n}\n\nfunction updateSetting(key, value) {\n  const settings = getSettings()\n  settings[key] = value\n  setItem("settings", JSON.stringify(settings))\n  console.log("Updated " + key + " to: " + value)\n}\n\nfunction resetSettings() {\n  setItem("settings", JSON.stringify(DEFAULT_SETTINGS))\n  console.log("Settings reset to defaults")\n}\n\nconsole.log("Initial:", getSettings())\nupdateSetting("theme", "light")\nupdateSetting("fontSize", "16px")\nconsole.log("Updated:", getSettings())\nresetSettings()\nconsole.log("After reset:", getSettings())`,
            whatItDoes: "A full settings persistence system. VS Code, Figma, and every browser save settings exactly this way.",
            check: (output) => output.includes("theme") || output.includes("settings") || output.includes("reset"),
          },
        ],
        quiz: [
          { question: "What does localStorage.setItem('key', 'value') do?", answer: "Stores a string value that persists across page reloads", choices: ["Reads a value", "Deletes a key", "Stores a string value that persists across page reloads", "Creates a cookie"] },
          { question: "What data type does localStorage always store?", answer: "Strings — everything must be converted to/from string", choices: ["Numbers", "Arrays", "Objects", "Strings — everything must be converted to/from string"] },
          { question: "How do you store an object in localStorage?", answer: "localStorage.setItem(key, JSON.stringify(obj))", choices: ["localStorage.setItem(key, obj)", "localStorage.setObject(key, obj)", "localStorage.setItem(key, JSON.stringify(obj))"] },
          { question: "What is the difference between localStorage and sessionStorage?", answer: "sessionStorage clears when the tab closes; localStorage persists until manually cleared", choices: ["localStorage is faster", "sessionStorage clears when the tab closes; localStorage persists until manually cleared", ", "] },
          { question: "What does `localStorage.removeItem('key')` do?", answer: "Permanently removes that key from storage", choices: ["Clears all storage", "Sets the value to null", "Permanently removes that key from storage", "Hides the item"] },
        ],
      },
      {
        id: "js-form-validation", title: "Form Validation — Making Forms That Work", xp: 200, analogy: "Think of a bouncer checking IDs", language: "javascript",
        theory: [
          { type: "plain", text: "A bouncer checks every person before letting them in. Form validation checks every input before accepting it." },
          { type: "highlight", text: "Form validation is one of the most requested freelance JavaScript skills." },
          { type: "code", label: "JAVASCRIPT", color: "#fcd34d", code: `function validateForm(name, email, password) {\n  const errors = []\n  if (!name || name.length < 2) errors.push("Name too short")\n  if (!email.includes("@")) errors.push("Invalid email")\n  if (!password || password.length < 8) errors.push("Password too short")\n  return errors\n}` },
        ],
        hints: ["Check if fields are empty with !value", "Use .includes('@') to check email", "Return an array of errors — empty means valid"],
        challenges: [
          {
            type: "guided",
            prompt: "Build a form validator that checks name, email, and password. Test with valid and invalid data.",
            starterCode: `function validateForm(name, email, password) {\n  const errors = []\n  if (!name || name.trim().length < 2) errors.push("Name must be at least 2 characters")\n  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/\n  if (!emailRegex.test(email)) errors.push("Please enter a valid email")\n  if (!password || password.length < 8) errors.push("Password must be at least 8 characters")\n  return errors\n}\n\nconst test1 = validateForm("Stanley White", "stanley@gmail.com", "mypassword123")\nconsole.log("Test 1:", test1.length === 0 ? "VALID" : test1)\n\nconst test2 = validateForm("S", "notanemail", "short")\nconsole.log("Test 2:", test2)`,
            whatItDoes: "A reusable form validator. Plug this into any website contact form.",
            check: (output) => output.includes("VALID") || output.includes("Test"),
          },
          {
            type: "modify",
            prompt: "Add phone number validation. A valid US phone has 10 digits (after removing non-digits). Add it to the validator and test with '(404) 555-1234' and 'not-a-phone'.",
            starterCode: `function validateForm(name, email, password, phone) {\n  const errors = []\n  \n  if (!name || name.trim().length < 2)\n    errors.push("Name must be at least 2 characters")\n  \n  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email))\n    errors.push("Invalid email")\n  \n  if (!password || password.length < 8)\n    errors.push("Password must be 8+ characters")\n  \n  if (phone) {\n    const digits = phone.replace(/\\D/g, "")\n    if (digits.length !== 10)\n      errors.push("Phone must be 10 digits")\n  }\n  \n  return errors\n}\n\nconsole.log("Valid:", validateForm("Stan White", "stan@gmail.com", "pass1234", "(404) 555-1234"))\nconsole.log("Invalid phone:", validateForm("Stan White", "stan@gmail.com", "pass1234", "not-a-phone"))`,
            whatItDoes: "`replace(/\\D/g, '')` strips non-digits — the cleanest way to normalize phone numbers. Used in every registration form.",
            check: (output) => output.includes("Valid") || output.includes("Phone") || output.includes("digits"),
          },
          {
            type: "scratch",
            prompt: "Build a contact form validator. Validate: name (2-50 chars), email (valid format), message (10-500 chars), and a required checkbox (must be true). Return an object with `valid: bool` and `errors: []`.",
            starterCode: `function validateContact(name, email, message, agreedToTerms) {\n  const errors = []\n  \n  if (!name || name.trim().length < 2 || name.trim().length > 50)\n    errors.push("Name must be 2-50 characters")\n  \n  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email))\n    errors.push("Invalid email address")\n  \n  if (!message || message.length < 10 || message.length > 500)\n    errors.push("Message must be 10-500 characters")\n  \n  if (!agreedToTerms)\n    errors.push("You must agree to the terms")\n  \n  return { valid: errors.length === 0, errors }\n}\n\nconst r1 = validateContact("Stan White", "stan@gmail.com", "I want to hire you for a Python project.", true)\nconsole.log("Valid form:", r1)\n\nconst r2 = validateContact("S", "bad", "Short.", false)\nconsole.log("Invalid form:", r2)`,
            whatItDoes: "A full contact form validator with structured output. Drop this into any React or plain JS form and it's production-ready.",
            check: (output) => output.includes("valid") || output.includes("errors") || output.includes("Valid form"),
          },
        ],
        quiz: [
          { question: "What does `/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)` do?", answer: "Tests if email matches the basic email pattern, returning true/false", choices: ["Finds all @ signs", "Tests if email matches the basic email pattern, returning true/false", "Extracts the domain", "Counts @ characters"] },
          { question: "Why return an errors array instead of just true/false from a validator?", answer: "An array lets you show specific messages for each failed field", choices: ["Arrays are required", "An array lets you show specific messages for each failed field", "True/false is not valid JavaScript", "Booleans are slow"] },
          { question: "What does `name.trim().length` do?", answer: "Gets the length after removing leading/trailing spaces", choices: ["Removes all characters", "Gets the length after removing leading/trailing spaces", "Converts to lowercase", "Counts spaces"] },
          { question: "Why validate forms in JavaScript (client-side) AND on the server?", answer: "Client-side is for UX speed; server-side is for security — client validation can be bypassed", choices: ["Double validation is required by law", "Client-side is for UX speed; server-side is for security — client validation can be bypassed", "Server-side validation is optional"] },
          { question: "What does `replace(/\\D/g, '')` do to a phone number string?", answer: "Removes all non-digit characters", choices: ["Adds dashes", "Formats as (XXX) XXX-XXXX", "Removes all non-digit characters", "Validates the number"] },
        ],
      },
      {
        id: "js-promises", title: "Promises — Handling Future Results", xp: 200, analogy: "Think of a restaurant buzzer", language: "javascript",
        theory: [
          { type: "plain", text: "When you get a buzzer at a restaurant the kitchen is making a promise — your food will be ready eventually." },
          { type: "highlight", text: "A Promise represents a value that will be available in the future. It is the foundation of all async JavaScript." },
          { type: "code", label: "JAVASCRIPT", color: "#fcd34d", code: `const myPromise = new Promise((resolve, reject) => {\n  const success = true\n  if (success) { resolve("Data loaded!") }\n  else { reject("Something went wrong") }\n})\nmyPromise.then(result => console.log(result)).catch(error => console.log("Error:", error))` },
        ],
        hints: ["new Promise((resolve, reject) => {}) creates a promise", "resolve() means success — reject() means failure", ".then() handles success — .catch() handles errors"],
        challenges: [
          {
            type: "guided",
            prompt: "Create a Promise that loads user data by ID. Resolve if user exists, reject if not.",
            starterCode: `function loadUser(userId) {\n  return new Promise((resolve, reject) => {\n    const users = { 1: { name: "Stanley White", role: "Developer" }, 2: { name: "Marcus Johnson", role: "Designer" } }\n    const user = users[userId]\n    if (user) { resolve(user) } else { reject("User not found") }\n  })\n}\n\nloadUser(1).then(user => { console.log("Loaded:", user.name); console.log("Role:", user.role) }).catch(error => console.log("Error:", error))\nloadUser(99).then(user => console.log(user)).catch(error => console.log("Error:", error))`,
            whatItDoes: "You built a Promise-based data loader — the same pattern used in every real web app.",
            check: (output) => output.includes("Loaded:") || output.includes("Error:"),
          },
          {
            type: "modify",
            prompt: "Use Promise.all() to load users 1 and 2 simultaneously. Log 'Both loaded!' when both resolve. Handle the case where one doesn't exist.",
            starterCode: `function loadUser(userId) {\n  return new Promise((resolve, reject) => {\n    const users = { 1: { name: "Stanley White" }, 2: { name: "Marcus Johnson" } }\n    const user = users[userId]\n    setTimeout(() => {\n      if (user) resolve(user)\n      else reject("User " + userId + " not found")\n    }, 0)\n  })\n}\n\nPromise.all([loadUser(1), loadUser(2)])\n  .then(([user1, user2]) => {\n    console.log("User 1:", user1.name)\n    console.log("User 2:", user2.name)\n    console.log("Both loaded!")\n  })\n  .catch(error => console.log("Failed:", error))`,
            whatItDoes: "Promise.all() runs multiple async operations in parallel — much faster than sequential. Used whenever you need multiple data sources at once.",
            check: (output) => output.includes("Both loaded") || output.includes("User 1") || output.includes("Failed"),
          },
          {
            type: "scratch",
            prompt: "Build a multi-step checkout Promise chain. Create 3 Promises: validateCart(), processPayment(amount), and sendConfirmation(email). Chain them so each step runs after the previous succeeds.",
            starterCode: `function validateCart(items) {\n  return new Promise((resolve, reject) => {\n    if (items.length > 0) resolve({ items, total: items.reduce((s, i) => s + i.price, 0) })\n    else reject("Cart is empty")\n  })\n}\n\nfunction processPayment(cart) {\n  return new Promise((resolve, reject) => {\n    console.log("Processing $" + cart.total + "...")\n    if (cart.total > 0) resolve({ ...cart, orderId: "ORD-" + Date.now() })\n    else reject("Invalid total")\n  })\n}\n\nfunction sendConfirmation(order) {\n  return new Promise(resolve => {\n    console.log("Confirmation sent for order:", order.orderId)\n    resolve("Done")\n  })\n}\n\nconst cartItems = [{ name: "Course", price: 4.99 }, { name: "Bonus", price: 0 }]\n\nvalidateCart(cartItems)\n  .then(cart => { console.log("Cart valid:", cart.items.length, "items"); return processPayment(cart) })\n  .then(order => { console.log("Payment OK, order:", order.orderId); return sendConfirmation(order) })\n  .then(() => console.log("Checkout complete!"))\n  .catch(err => console.log("Checkout failed:", err))`,
            whatItDoes: "A real checkout flow — validate → charge → confirm. Every e-commerce site's checkout is this Promise chain pattern.",
            check: (output) => output.includes("complete") || output.includes("Confirmation") || output.includes("ORD"),
          },
        ],
        quiz: [
          { question: "What are the 3 states a Promise can be in?", answer: "pending, fulfilled, rejected", choices: ["loading, done, error", "pending, fulfilled, rejected", "waiting, success, failure", "new, active, closed"] },
          { question: "What does Promise.all([p1, p2]) do?", answer: "Runs p1 and p2 in parallel and resolves when BOTH complete", choices: ["Runs p1 and p2 sequentially", "Runs p1 and p2 in parallel and resolves when BOTH complete", "Runs whichever completes first", "Merges the two Promises"] },
          { question: "If one Promise in Promise.all() rejects, what happens?", answer: "The whole Promise.all() rejects immediately", choices: ["Other Promises keep running", "The whole Promise.all() rejects immediately", "The rejected Promise is skipped", "An error is thrown"] },
          { question: "What is the difference between resolve and reject?", answer: ", ", choices: [", ", ", ", ", "] },
          { question: "When would you use Promise chaining (.then().then()) vs async/await?", answer: ", ", choices: [", ", ", ", ", "] },
        ],
      },
      {
        id: "js-classes", title: "JavaScript Classes", xp: 225, analogy: "Think of a blueprint", language: "javascript",
        theory: [
          { type: "plain", text: "You learned Python classes already. JavaScript has them too — same concept, different syntax." },
          { type: "highlight", text: "JavaScript classes are used everywhere in modern web development." },
          { type: "code", label: "JAVASCRIPT", color: "#fcd34d", code: `class FreelanceClient {\n  constructor(name, budget) {\n    this.name = name\n    this.budget = budget\n  }\n  getQuote(hours) { return hours * 75 }\n}\nconst client = new FreelanceClient("Marcus", 2500)\nconsole.log(client.getQuote(20))` },
        ],
        hints: ["class Name { constructor() {} } creates a class", "this refers to the current object", "new ClassName() creates an instance"],
        challenges: [
          {
            type: "guided",
            prompt: "Create a ShoppingCart class with addItem and getTotal methods. Test with 3 items.",
            starterCode: `class ShoppingCart {\n  constructor(owner) { this.owner = owner; this.items = [] }\n  addItem(name, price) { this.items.push({ name, price }); console.log("Added:", name, "- $" + price) }\n  getTotal() { return this.items.reduce((sum, item) => sum + item.price, 0) }\n  printReceipt() {\n    console.log("\\n=== RECEIPT FOR", this.owner, "===")\n    this.items.forEach(item => console.log(item.name + ": $" + item.price))\n    console.log("TOTAL: $" + this.getTotal())\n  }\n}\n\nconst cart = new ShoppingCart("Stanley White")\ncart.addItem("Python Course", 49)\ncart.addItem("VS Code Theme", 9)\ncart.addItem("Domain Name", 12)\ncart.printReceipt()`,
            whatItDoes: "You built a shopping cart class — the same pattern used in every e-commerce website.",
            check: (output) => output.includes("RECEIPT") || output.includes("TOTAL") || output.includes("Added:"),
          },
          {
            type: "modify",
            prompt: "Add a discount(percent) method that reduces all item prices by the given percentage. Call it with 10% discount and print the receipt before and after.",
            starterCode: `class ShoppingCart {\n  constructor(owner) {\n    this.owner = owner\n    this.items = []\n  }\n  addItem(name, price) {\n    this.items.push({ name, price })\n  }\n  getTotal() {\n    return this.items.reduce((sum, item) => sum + item.price, 0)\n  }\n  discount(percent) {\n    const multiplier = 1 - percent / 100\n    this.items = this.items.map(item => ({\n      ...item,\n      price: Math.round(item.price * multiplier * 100) / 100\n    }))\n    console.log("Applied " + percent + "% discount")\n  }\n  printReceipt() {\n    this.items.forEach(item => console.log("  " + item.name + ": $" + item.price))\n    console.log("  Total: $" + this.getTotal())\n  }\n}\n\nconst cart = new ShoppingCart("Marcus")\ncart.addItem("Course", 49)\ncart.addItem("Bonus", 20)\nconsole.log("Before discount:")\ncart.printReceipt()\ncart.discount(10)\nconsole.log("After 10% discount:")\ncart.printReceipt()`,
            whatItDoes: "Discount logic on a class — promo codes, membership discounts, and seasonal sales all work this way.",
            check: (output) => output.includes("discount") || output.includes("Before") || output.includes("After"),
          },
          {
            type: "scratch",
            prompt: "Build an OrderSystem class. It should track orders in an array. Add methods: placeOrder(product, amount), getOrders(), and getTotalRevenue(). Test with 3 orders.",
            starterCode: `class OrderSystem {\n  constructor() {\n    this.orders = []\n  }\n  \n  placeOrder(product, amount) {\n    const order = {\n      id: this.orders.length + 1,\n      product,\n      amount,\n      date: new Date().toLocaleDateString()\n    }\n    this.orders.push(order)\n    console.log("Order #" + order.id + " placed: " + product + " $" + amount)\n    return order\n  }\n  \n  getOrders() {\n    return this.orders\n  }\n  \n  getTotalRevenue() {\n    return this.orders.reduce((sum, order) => sum + order.amount, 0)\n  }\n}\n\nconst system = new OrderSystem()\nsystem.placeOrder("Python Automation Script", 350)\nsystem.placeOrder("Website Design", 1200)\nsystem.placeOrder("Data Analysis Report", 500)\n\nconsole.log("\\nAll orders:", system.getOrders().length)\nconsole.log("Total revenue: $" + system.getTotalRevenue())`,
            whatItDoes: "A complete order management system. Shopify, WooCommerce, and every e-commerce platform is built on patterns exactly like this.",
            check: (output) => output.includes("Order #") || output.includes("revenue") || output.includes("placed"),
          },
        ],
        quiz: [
          { question: "What does `constructor` do in a JavaScript class?", answer: "Runs automatically when a new instance is created", choices: ["Destroys the object", "Runs automatically when a new instance is created", "Defines class methods", "Sets class properties after creation"] },
          { question: "What does `this.items.reduce((sum, item) => sum + item.price, 0)` do?", answer: "Sums all item prices starting from 0", choices: ["Filters items by price", "Counts items", "Sums all item prices starting from 0", "Finds the max price"] },
          { question: "What is the difference between a class and an instance?", answer: ", ", choices: [", ", ", ", ", "] },
          { question: "What does `new ShoppingCart('Stanley')` do?", answer: "Creates a new instance of ShoppingCart with 'Stanley' as owner", choices: ["Calls the class as a function", "Creates a new instance of ShoppingCart with 'Stanley' as owner", "Copies an existing cart", "Imports the ShoppingCart class"] },
          { question: "What does `this.items.map(item => ({...item, price: item.price * 0.9}))` create?", answer: "A new array with all items but prices reduced by 10%", choices: ["Modifies items in place", "A new array with all items but prices reduced by 10%", "Filters items", "Sorts by price"] },
        ],
      },
      {
        id: "js-error-handling", title: "Error Handling in JavaScript", xp: 175, analogy: "Think of a safety net", language: "javascript",
        theory: [
          { type: "plain", text: "A trapeze artist always has a safety net. JavaScript error handling is that safety net for your code." },
          { type: "highlight", text: "try/catch in JavaScript works just like Python. Professional code always handles errors gracefully." },
          { type: "code", label: "JAVASCRIPT", color: "#fcd34d", code: `try {\n  const data = JSON.parse("invalid json")\n  console.log(data)\n} catch (error) {\n  console.log("Caught error:", error.message)\n}\nconsole.log("Program keeps running!")` },
        ],
        hints: ["Wrap risky code in try { }", "Handle errors in catch (error) { }", "error.message gives you a readable description"],
        challenges: [
          {
            type: "guided",
            prompt: "Write a function that safely parses JSON and returns null if it fails. Test with valid and invalid strings.",
            starterCode: `function safeParseJSON(jsonString) {\n  try {\n    const result = JSON.parse(jsonString)\n    console.log("Parsed successfully")\n    return result\n  } catch (error) {\n    console.log("Parse failed:", error.message)\n    return null\n  }\n}\n\nconst valid = safeParseJSON('{"name": "Stanley", "goal": "Financial Freedom"}')\nconsole.log("Valid result:", valid ? valid.name : "null")\n\nconst invalid = safeParseJSON("this is not json")\nconsole.log("Invalid result:", invalid)`,
            whatItDoes: "A safe JSON parser that never crashes your app.",
            check: (output) => output.includes("Parsed") || output.includes("failed") || output.includes("Stanley"),
          },
          {
            type: "modify",
            prompt: "Add custom error types. Create a ValidationError class that extends Error. Throw it when data doesn't have a required 'name' field. Catch it specifically.",
            starterCode: `class ValidationError extends Error {\n  constructor(message) {\n    super(message)\n    this.name = "ValidationError"\n  }\n}\n\nfunction processUser(data) {\n  try {\n    if (!data || !data.name) {\n      throw new ValidationError("User must have a name")\n    }\n    if (!data.email) {\n      throw new ValidationError("User must have an email")\n    }\n    console.log("User valid:", data.name, data.email)\n    return data\n  } catch (error) {\n    if (error instanceof ValidationError) {\n      console.log("Validation error:", error.message)\n    } else {\n      console.log("Unexpected error:", error.message)\n    }\n    return null\n  }\n}\n\nprocessUser({ name: "Stanley", email: "stanley@gmail.com" })\nprocessUser({ name: "Marcus" })\nprocessUser(null)`,
            whatItDoes: "Custom error classes let you catch specific error types. This is how professional apps distinguish between user errors and system errors.",
            check: (output) => output.includes("ValidationError") || output.includes("Validation error") || output.includes("valid"),
          },
          {
            type: "scratch",
            prompt: "Build a safe API wrapper. Create safeApiCall(url) that fetches data and returns {data, error}. Never throws — always returns one of those two fields. Test with a valid and invalid URL.",
            starterCode: `async function safeApiCall(url) {\n  try {\n    const response = await fetch(url)\n    if (!response.ok) {\n      return { data: null, error: "HTTP " + response.status }\n    }\n    const data = await response.json()\n    return { data, error: null }\n  } catch (error) {\n    return { data: null, error: error.message }\n  }\n}\n\nasync function run() {\n  const success = await safeApiCall("https://official-joke-api.appspot.com/random_joke")\n  if (success.error) {\n    console.log("Error:", success.error)\n  } else {\n    console.log("Got joke:", success.data.setup)\n  }\n  \n  const fail = await safeApiCall("https://this-does-not-exist-12345.com/api")\n  console.log("Bad URL result:", fail.error ? "Error: " + fail.error : "Unexpectedly succeeded")\n}\n\nrun()`,
            whatItDoes: "The {data, error} return pattern is used in Go, React Query, and modern JavaScript everywhere. It forces callers to handle errors explicitly.",
            check: (output) => output.includes("joke") || output.includes("Error") || output.length > 5,
          },
        ],
        quiz: [
          { question: "What does a try/catch block do?", answer: "Catches errors so the program keeps running instead of crashing", choices: ["Speeds up code", "Catches errors so the program keeps running instead of crashing", "Retries failed code", "Validates data types"] },
          { question: "What does `error.message` contain?", answer: "A human-readable description of what went wrong", choices: ["The error type", "A human-readable description of what went wrong", "The line number", "The stack trace"] },
          { question: "When should you use try/catch?", answer: "Around code that might fail: JSON parsing, API calls, file reads, user input", choices: ["Around every function", "Only in Node.js", "Around code that might fail: JSON parsing, API calls, file reads, user input", "Only for network errors"] },
          { question: "What does `error instanceof ValidationError` check?", answer: "If error was created from the ValidationError class", choices: ["If error equals ValidationError", "If error was created from the ValidationError class", "If error has a message property", "If error is null"] },
          { question: "Why return {data, error} instead of throwing?", answer: "It forces the caller to explicitly handle both success and failure without try/catch everywhere", choices: ["Throwing is slower", "It forces the caller to explicitly handle both success and failure without try/catch everywhere", ", "] },
        ],
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
        challenges: [
          {
            type: "guided",
            prompt: "Run the quote generator. Then modify it to also show the quote length and tags. Add a second function that gets a quote by a specific author.",
            starterCode: `async function getQuote(author = null) {\n  try {\n    const url = author \n      ? "https://api.quotable.io/random?author=" + author\n      : "https://api.quotable.io/random"\n    \n    const response = await fetch(url)\n    const data = await response.json()\n    \n    console.log("\\n" + "─".repeat(50))\n    console.log('"' + data.content + '"')\n    console.log("  — " + data.author)\n    console.log("  Length:", data.length, "characters")\n    if (data.tags && data.tags.length > 0) {\n      console.log("  Tags:", data.tags.join(", "))\n    }\n    console.log("─".repeat(50))\n    \n  } catch (error) {\n    console.log("API unavailable — here\\'s a free one:")\n    console.log('"The secret of getting ahead is getting started."')\n    console.log("  — Mark Twain")\n  }\n}\n\nconsole.log("QUOTE GENERATOR")\ngetQuote()\ngetQuote()`,
            whatItDoes: "A real API-powered quote generator. In a browser this updates live HTML. On a server this powers an API endpoint. The logic is identical — only the output changes.",
            check: (output) => output.includes("GENERATOR") || output.includes("─") || output.length > 20,
          },
          {
            type: "modify",
            prompt: "Add a filterByTag(tag) function that fetches 5 quotes from '/tags/{tag}' and prints only those under 100 characters. Use the endpoint: 'https://api.quotable.io/quotes?tags={tag}&limit=5'.",
            starterCode: `async function filterByTag(tag) {\n  try {\n    const response = await fetch("https://api.quotable.io/quotes?tags=" + tag + "&limit=5")\n    const data = await response.json()\n    const quotes = data.results || []\n    const short = quotes.filter(q => q.length < 100)\n    \n    console.log("Tag: " + tag + " | Found: " + quotes.length + " | Short (<100 chars): " + short.length)\n    short.forEach(q => {\n      console.log('"' + q.content + '"')\n      console.log("  — " + q.author + " (" + q.length + " chars)")\n    })\n    \n  } catch (error) {\n    console.log("Filter failed:", error.message)\n    console.log("(API may have changed — this pattern still applies to any quotes API)")\n  }\n}\n\nfilterByTag("success")\nfilterByTag("motivation")`,
            whatItDoes: "Filtering API results by property — used in every search feature, content filter, and recommendation system.",
            check: (output) => output.includes("Tag:") || output.includes("Short") || output.includes("Filter"),
          },
          {
            type: "scratch",
            prompt: "Build a complete quote app. Create a QuoteApp class with: fetchQuote(), saveToFavorites(quote), getFavorites(), and printDashboard(). Test all methods.",
            starterCode: `class QuoteApp {\n  constructor() {\n    this.favorites = []\n    this.fetchCount = 0\n  }\n  \n  async fetchQuote() {\n    try {\n      const response = await fetch("https://official-joke-api.appspot.com/random_joke")\n      const joke = await response.json()\n      this.fetchCount++\n      return { content: joke.setup + " " + joke.punchline, author: "Random" }\n    } catch (error) {\n      return { content: "Work hard in silence. Let success make the noise.", author: "Stan White" }\n    }\n  }\n  \n  saveToFavorites(quote) {\n    this.favorites.push(quote)\n    console.log("Saved:", quote.content.substring(0, 40) + "...")\n  }\n  \n  getFavorites() {\n    return this.favorites\n  }\n  \n  printDashboard() {\n    console.log("=== QUOTE APP DASHBOARD ===")\n    console.log("Quotes fetched:", this.fetchCount)\n    console.log("Favorites saved:", this.favorites.length)\n    this.favorites.forEach((q, i) => {\n      console.log((i+1) + ". " + q.content.substring(0, 50) + "...")\n    })\n  }\n}\n\nasync function run() {\n  const app = new QuoteApp()\n  const q1 = await app.fetchQuote()\n  app.saveToFavorites(q1)\n  const q2 = await app.fetchQuote()\n  app.saveToFavorites(q2)\n  await app.fetchQuote() // fetch but don't save\n  app.printDashboard()\n}\n\nrun()`,
            whatItDoes: "A complete mini-app with state management. This class architecture — fetch, save, retrieve, display — is how every React component, Vue store, and mobile app is structured.",
            check: (output) => output.includes("DASHBOARD") || output.includes("Saved") || output.includes("fetched"),
          },
        ],
        quiz: [
          { question: "What is the main architectural skill this mini project teaches?", answer: "Combining classes, async/await, fetch, arrays, and error handling into one working app", choices: ["CSS animations", "Combining classes, async/await, fetch, arrays, and error handling into one working app", "DOM manipulation", "Server routing"] },
          { question: "Why is a JavaScript quote generator the same logic as a Twitter feed?", answer: "Both fetch JSON from an API and display it — the data changes but the pattern is identical", choices: ["They both use quotes", "Both fetch JSON from an API and display it — the data changes but the pattern is identical", "Twitter uses the same API", "Both require login"] },
          { question: "What does `data.tags.join(', ')` do?", answer: "Converts an array of tags into a comma-separated string", choices: ["Adds a tag", "Converts an array of tags into a comma-separated string", "Filters empty tags", "Sorts tags alphabetically"] },
          { question: "What happens when API data has a different structure than expected?", answer: "The code throws an error — always check the API docs and use optional chaining or defaults", choices: ["JavaScript auto-corrects it", "The code throws an error — always check the API docs and use optional chaining or defaults", "fetch() retries automatically", "The Promise resolves to null"] },
          { question: "In a real browser, what would replace `console.log(quote.content)` to show the quote on screen?", answer: "document.getElementById('quote').textContent = quote.content", choices: ["console.display()", "document.getElementById('quote').textContent = quote.content", "print(quote.content)", "window.alert(quote.content)"] },
        ],
      },
    ],
  },
  {
    id: "ai-tools", title: "AI Tools for Freelancers", icon: "🤖", color: "#a78bfa",
    lessons: [
      {
        id: "what-is-ai", title: "What AI Actually Is (And What It Can't Do)", xp: 100, analogy: "AI is a very fast intern who never gets tired", language: "python",
        theory: [
          { type: "plain", text: "AI models like Claude and ChatGPT are pattern-matching machines trained on billions of documents. They predict the most useful next word — but they don't 'think' like humans." },
          { type: "highlight", text: "The freelancer edge: most people treat AI like Google. You'll learn to treat it like a tireless assistant that drafts, edits, summarizes, and codes on command." },
          { type: "code", label: "PYTHON — Map your AI capabilities", color: "#a78bfa", code: `# What AI can and can't do — map your business\ncapabilities = {\n    "AI crushes it": [\n        "First drafts of anything",\n        "Summarizing long documents",\n        "Translating ideas into code",\n        "Brainstorming 20 options fast",\n        "Rewriting text at any reading level",\n    ],\n    "AI needs supervision": [\n        "Factual accuracy (always verify)",\n        "Recent events (knowledge cutoff)",\n        "Math with large numbers",\n        "Reading images without vision models",\n    ],\n    "AI cannot replace": [\n        "Your relationships with clients",\n        "Final judgment calls",\n        "Creative vision and taste",\n        "Real-world accountability",\n    ]\n}\n\nfor category, items in capabilities.items():\n    print("\\n" + category.upper())\n    for item in items:\n        print("  • " + item)` },
          { type: "plain", text: "Freelancers who understand AI limits charge MORE — because clients trust them to get it right, not just generate slop and deliver it." },
        ],
        hints: ["Use a dictionary with list values to group items by category", "Nested loops: outer loop over categories, inner loop over items", "String concatenation: '  • ' + item prints each bullet"],
        challenges: [
          {
            type: "guided",
            prompt: "Run the capability map. Add a 4th category called 'your secret weapon' and add 3 items that combine YOUR skills with AI.",
            starterCode: `capabilities = {\n    "AI crushes it": [\n        "First drafts of anything",\n        "Summarizing long documents",\n        "Translating ideas into code",\n    ],\n    "AI needs supervision": [\n        "Factual accuracy (always verify)",\n        "Recent events (knowledge cutoff)",\n    ],\n    "AI cannot replace": [\n        "Your relationships with clients",\n        "Final judgment calls",\n        "Creative vision and taste",\n    ],\n    "your secret weapon": [\n        "Your skill + AI speed",\n        "Your judgment + AI output",\n        "Your network + AI content",\n    ]\n}\n\nfor category, items in capabilities.items():\n    print("\\n" + category.upper())\n    for item in items:\n        print("  * " + item)`,
            whatItDoes: "Maps what AI is good and bad at. Understanding this lets you confidently tell clients exactly how you'll use AI to deliver faster.",
            check: (output) => output.includes("SECRET") || output.includes("WEAPON") || output.includes("*"),
          },
          {
            type: "modify",
            prompt: "Add a variable called `my_advantage` that stores your top skill (e.g. 'Python automation'). Print a final line: 'My edge: [my_advantage] + AI speed = unstoppable'",
            starterCode: `my_advantage = "Python automation"\n\ncapabilities = {\n    "AI crushes it": ["First drafts", "Summarizing", "Code translation"],\n    "your secret weapon": [my_advantage + " + AI = faster results"]\n}\n\nfor category, items in capabilities.items():\n    print("\\n" + category.upper())\n    for item in items:\n        print("  * " + item)\n\nprint("\\nMy edge: " + my_advantage + " + AI speed = unstoppable")`,
            whatItDoes: "Personalizes the framework to your skills — practice for client pitches.",
            check: (output) => output.includes("unstoppable") || output.includes("edge"),
          },
          {
            type: "scratch",
            prompt: "Build a 'client pitch generator'. Store your skill, your rate, and 3 AI-powered benefits in variables. Print a formatted pitch: 'I do [skill] at [rate]/hr. With AI I deliver: [benefit1], [benefit2], [benefit3].'",
            starterCode: `# Build a client pitch generator\nskill = "Python automation"\nrate = 75\nbenefits = [\n    "2x faster delivery",\n    "fewer errors with AI review",\n    "bonus documentation included"\n]\n\nprint("I do " + skill + " at $" + str(rate) + "/hr.")\nprint("With AI I deliver:")\nfor benefit in benefits:\n    print("  - " + benefit)`,
            whatItDoes: "You just built a pitch. This exact format — skill, rate, 3 benefits — is what wins Upwork proposals.",
            check: (output) => output.includes("/hr") || output.includes("deliver") || output.length > 20,
          },
        ],
        quiz: [
          { question: "What are AI models fundamentally doing when they generate text?", answer: "Predicting the most useful next word based on patterns", choices: ["Searching the internet in real time", "Predicting the most useful next word based on patterns", "Running logical reasoning algorithms", "Looking up facts in a database"] },
          { question: "Which of these is something AI consistently struggles with?", answer: "Factual accuracy and recent events", choices: ["Writing first drafts", "Brainstorming ideas", "Factual accuracy and recent events", "Summarizing documents"] },
          { question: "Why do freelancers who understand AI limits charge MORE?", answer: "Clients trust them to verify and get it right", choices: ["They use more expensive tools", "Clients trust them to verify and get it right", "They work slower and bill more hours", "They refuse to use AI"] },
          { question: "In the capability map code, what data structure holds the categories and items?", answer: "A dictionary with list values", choices: ["A list of lists", "A dictionary with list values", "A tuple", "A set"] },
          { question: "Which loop pattern prints each item in each category?", answer: "Outer loop over categories, inner loop over items", choices: ["Single loop over all items", "Outer loop over categories, inner loop over items", "While loop with counter", "Recursion"] },
        ],
      },
      {
        id: "ai-for-freelancers", title: "AI as Your Business Partner", xp: 125, analogy: "Running a one-person agency with a 10-person team", language: "python",
        theory: [
          { type: "plain", text: "Solo freelancers who use AI effectively can compete with agencies. You become the strategist. AI handles drafts, research, and repetitive work." },
          { type: "highlight", text: "The real unlock: use AI to do client work faster, then use the freed time to land more clients. It compounds." },
          { type: "code", label: "PYTHON — Freelance proposal generator", color: "#a78bfa", code: `def generate_proposal(client_name, project_type, budget, timeline):\n    """Generate a client proposal outline with AI talking points."""\n    \n    proposal = [\n        "Subject: " + project_type + " Proposal for " + client_name,\n        "",\n        "Hi " + client_name + ",",\n        "",\n        "I specialize in " + project_type + " and can deliver",\n        "within " + str(timeline) + " days for $" + str(budget) + ".",\n        "",\n        "What you get:",\n        "  • Professional " + project_type + " tailored to your goals",\n        "  • 2 revision rounds included",\n        "  • Fast delivery using proven systems",\n        "",\n        "Ready to start? Reply to this message.",\n        "",\n        "Best,",\n        "Stan",\n    ]\n    \n    return "\\n".join(proposal)\n\n# Generate a proposal\nprint(generate_proposal(\n    client_name="Mike at StartupCo",\n    project_type="Python automation script",\n    budget=500,\n    timeline=5\n))` },
          { type: "plain", text: "In real freelancing you'd paste this template into Claude and say 'make this sound more compelling for a $500 automation gig.' AI polishes it in 10 seconds." },
        ],
        hints: ["Functions that return strings are easy to reuse and test", "Use str() to convert numbers to strings for concatenation", "'\\n'.join(list) turns a list of lines into a single string"],
        challenges: [
          {
            type: "guided",
            prompt: "Run the proposal generator. Then call it again with different client name, project type, budget, and timeline.",
            starterCode: `def generate_proposal(client_name, project_type, budget, timeline):\n    proposal = [\n        "Subject: " + project_type + " Proposal for " + client_name,\n        "",\n        "Hi " + client_name + ",",\n        "",\n        "I specialize in " + project_type + " and can deliver",\n        "within " + str(timeline) + " days for $" + str(budget) + ".",\n        "",\n        "What you get:",\n        "  * Professional " + project_type + " tailored to your goals",\n        "  * 2 revision rounds included",\n        "  * Fast delivery using proven systems",\n        "",\n        "Ready to start? Reply to this message.",\n    ]\n    return "\\n".join(proposal)\n\nprint(generate_proposal("Mike", "Python script", 500, 5))\nprint("\\n" + "="*40 + "\\n")\nprint(generate_proposal("Lisa", "data analysis report", 800, 7))`,
            whatItDoes: "A reusable proposal generator. Change the inputs, get a new proposal every time.",
            check: (output) => output.includes("Proposal") || output.includes("deliver") || output.includes("="),
          },
          {
            type: "modify",
            prompt: "Add a `upsell` parameter to the function. If upsell is True, add a line: 'BONUS: I'll include a 30-minute walkthrough call at no extra charge.'",
            starterCode: `def generate_proposal(client_name, project_type, budget, timeline, upsell=False):\n    proposal = [\n        "Hi " + client_name + ",",\n        "I deliver " + project_type + " in " + str(timeline) + " days for $" + str(budget) + ".",\n    ]\n    if upsell:\n        proposal.append("BONUS: I'll include a 30-minute walkthrough call at no extra charge.")\n    proposal.append("Reply to get started.")\n    return "\\n".join(proposal)\n\nprint(generate_proposal("Mike", "Python script", 500, 5, upsell=True))\nprint()\nprint(generate_proposal("Lisa", "data report", 800, 7, upsell=False))`,
            whatItDoes: "The upsell line increases close rate. You're building persuasion mechanics into your proposal tool.",
            check: (output) => output.includes("BONUS") || output.includes("walkthrough"),
          },
          {
            type: "scratch",
            prompt: "Build an invoice generator function. It takes: client_name, service, hours, rate. It prints: client name, service, hours x rate = total, and a 'Payment due in 14 days' line.",
            starterCode: `def generate_invoice(client_name, service, hours, rate):\n    total = hours * rate\n    print("INVOICE")\n    print("Client: " + client_name)\n    print("Service: " + service)\n    print("Hours: " + str(hours) + " x $" + str(rate) + "/hr")\n    print("Total: $" + str(total))\n    print("Payment due in 14 days")\n\ngenerate_invoice("Mike", "Python automation", 5, 75)\nprint()\ngenerate_invoice("Lisa", "Data analysis", 3, 90)`,
            whatItDoes: "A real invoice generator. Wrap this in a web form and you have a billable product.",
            check: (output) => output.includes("INVOICE") || output.includes("Total") || output.includes("due"),
          },
        ],
        quiz: [
          { question: "What is the core business advantage of a solo freelancer using AI?", answer: "Compete with agencies by doing more in less time", choices: ["Lower taxes", "Compete with agencies by doing more in less time", "Access to better clients", "No need for a portfolio"] },
          { question: "In the proposal generator, what does '\\n'.join(proposal) do?", answer: "Joins all list items into one string with newlines between them", choices: ["Splits the proposal into a list", "Joins all list items into one string with newlines between them", "Removes blank lines", "Counts the lines"] },
          { question: "What does adding a default parameter like upsell=False do?", answer: "Makes the parameter optional with a fallback value", choices: ["Makes the parameter required", "Raises an error if not passed", "Makes the parameter optional with a fallback value", "Disables the feature"] },
          { question: "What's the total for 4 hours at $85/hr?", answer: "$340", choices: ["$320", "$340", "$360", "$380"] },
          { question: "Why return a string from a function instead of printing inside it?", answer: ", ", choices: [", ", ", ", ", "] },
        ],
      },
      {
        id: "prompt-engineering", title: "Prompt Engineering: Get Pro Results from AI", xp: 150, analogy: "Learning to give clear instructions to the world's fastest employee", language: "python",
        theory: [
          { type: "plain", text: "Vague prompts get vague results. Specific prompts get specific results. Prompt engineering is just learning to be precise." },
          { type: "highlight", text: "The CRAFT framework: Context, Role, Action, Format, Tone. Use it and your AI outputs will immediately beat 90% of what other freelancers produce." },
          { type: "code", label: "PYTHON — CRAFT prompt builder", color: "#a78bfa", code: `def build_craft_prompt(context, role, action, fmt, tone):\n    """Build a structured CRAFT prompt for any AI task."""\n    prompt = (\n        "Context: " + context + "\\n"\n        "Role: You are a " + role + "\\n"\n        "Action: " + action + "\\n"\n        "Format: " + fmt + "\\n"\n        "Tone: " + tone\n    )\n    return prompt\n\n# Example: writing a cold email\nresult = build_craft_prompt(\n    context="I'm a freelance Python developer targeting small e-commerce businesses",\n    role="senior copywriter who specializes in B2B outreach",\n    action="Write a cold email offering automation services to reduce manual data entry",\n    fmt="Subject line + 4 short paragraphs + clear CTA, under 150 words",\n    tone="confident but not pushy, peer-to-peer not salesy"\n)\n\nprint("YOUR CRAFT PROMPT:")\nprint("=" * 50)\nprint(result)\nprint("=" * 50)\nprint("\\nCopy this into Claude or ChatGPT for a pro-level result.")` },
          { type: "plain", text: "Freelancers who sell 'prompt engineering as a service' charge $50–150/hr just to help businesses write better AI prompts. This is a real gig right now." },
        ],
        hints: ["String concatenation with '\\n' between lines builds multi-line output", "Parentheses let you split long strings across multiple lines", "The CRAFT parts are just labeled strings — swap in any values"],
        challenges: [
          {
            type: "guided",
            prompt: "Run the CRAFT prompt builder. Then create a new prompt for a different use case: generating a LinkedIn post about your coding journey.",
            starterCode: `def build_craft_prompt(context, role, action, fmt, tone):\n    prompt = (\n        "Context: " + context + "\\n"\n        "Role: You are a " + role + "\\n"\n        "Action: " + action + "\\n"\n        "Format: " + fmt + "\\n"\n        "Tone: " + tone\n    )\n    return prompt\n\ncold_email = build_craft_prompt(\n    context="Freelance Python developer targeting small businesses",\n    role="senior B2B copywriter",\n    action="Write a cold email offering automation services",\n    fmt="Subject + 4 paragraphs + CTA, under 150 words",\n    tone="confident, peer-to-peer"\n)\n\nlinkedin_post = build_craft_prompt(\n    context="I just finished a Python course after 3 months of learning",\n    role="authentic LinkedIn creator in the tech space",\n    action="Write a post about my coding journey and what I learned",\n    fmt="Hook line + 3 short paragraphs + 3 hashtags",\n    tone="real and relatable, not braggy"\n)\n\nprint("COLD EMAIL PROMPT:")\nprint(cold_email)\nprint("\\nLINKEDIN PROMPT:")\nprint(linkedin_post)`,
            whatItDoes: "Two complete prompts for two different deliverables. Swap any variable and regenerate instantly.",
            check: (output) => output.includes("CRAFT") || output.includes("Context") || output.includes("Role"),
          },
          {
            type: "modify",
            prompt: "Add a `task_type` parameter to the function. Print a header that says '--- CRAFT PROMPT: [task_type] ---' before the prompt.",
            starterCode: `def build_craft_prompt(context, role, action, fmt, tone, task_type="General"):\n    header = "--- CRAFT PROMPT: " + task_type + " ---"\n    prompt = (\n        "Context: " + context + "\\n"\n        "Role: You are a " + role + "\\n"\n        "Action: " + action + "\\n"\n        "Format: " + fmt + "\\n"\n        "Tone: " + tone\n    )\n    return header + "\\n" + prompt + "\\n" + "-" * len(header)\n\nresult = build_craft_prompt(\n    context="I'm a freelancer looking for clients",\n    role="expert cold outreach specialist",\n    action="Write a Upwork proposal for a data scraping job",\n    fmt="3 short paragraphs, include relevant experience, end with question",\n    tone="direct and confident",\n    task_type="Upwork Proposal"\n)\nprint(result)`,
            whatItDoes: "Named sections make it easy to save and reuse prompts for different deliverable types.",
            check: (output) => output.includes("CRAFT PROMPT") || output.includes("---"),
          },
          {
            type: "scratch",
            prompt: "Build a prompt library. Store 3 CRAFT prompts in a dictionary with keys like 'cold_email', 'proposal', 'linkedin_post'. Let the user pick one by index (0, 1, 2) using a variable called `choice`, then print that prompt.",
            starterCode: `library = {\n    "cold_email": "Context: freelance dev\\nRole: copywriter\\nAction: write cold email\\nFormat: under 150 words\\nTone: confident",\n    "proposal": "Context: applying to Upwork job\\nRole: expert freelancer\\nAction: write winning proposal\\nFormat: 3 paragraphs\\nTone: direct",\n    "linkedin_post": "Context: sharing a win\\nRole: authentic creator\\nAction: write post about a project\\nFormat: hook + 3 lines + hashtags\\nTone: real"\n}\n\nchoice = "proposal"\n\nprint("SELECTED PROMPT: " + choice.upper())\nprint(library[choice])`,
            whatItDoes: "A personal prompt library. This is literally a product you could sell to other freelancers.",
            check: (output) => output.includes("SELECTED") || output.includes("Context") || output.length > 30,
          },
        ],
        quiz: [
          { question: "What does the C in CRAFT stand for?", answer: "Context", choices: ["Code", "Context", "Client", "Command"] },
          { question: "Why is prompt engineering a real freelance skill right now?", answer: "Businesses pay $50-150/hr for help getting pro-level AI output", choices: ["AI companies hire prompt engineers only", "Businesses pay $50-150/hr for help getting pro-level AI output", "Only prompt engineers can use AI tools", "It replaces coding entirely"] },
          { question: "In the CRAFT builder, why use parentheses to split the string across lines?", answer: "Improves readability without breaking functionality", choices: ["Required Python syntax", "Makes the string shorter", "Improves readability without breaking functionality", "Prevents errors"] },
          { question: "What does `library[choice]` do when `choice = 'proposal'`?", answer: "Returns the value stored at key 'proposal'", choices: ["Creates a new key", "Returns the value stored at key 'proposal'", "Deletes the proposal", "Returns the index number"] },
          { question: "What separates a vague prompt from a useful one?", answer: "Specifying context, role, action, format, and tone", choices: ["Length", "Specifying context, role, action, format, and tone", "Using formal language", "Asking nicely"] },
        ],
      },
      {
        id: "automate-with-ai", title: "Automate Your Freelance Workflow", xp: 175, analogy: "Building systems so your business runs while you sleep", language: "python",
        theory: [
          { type: "plain", text: "Top freelancers don't just sell time — they sell systems. Automation means you can handle more clients without working more hours." },
          { type: "highlight", text: "The highest-value automation: anything a client currently does manually in a spreadsheet. Find those tasks, script them, charge for the saved time." },
          { type: "code", label: "PYTHON — Lead scoring automation", color: "#a78bfa", code: `def score_lead(budget, timeline_days, has_clear_spec, responded_fast):\n    """Score a freelance lead 0-100. Higher = better client."""\n    score = 0\n    \n    # Budget signals\n    if budget >= 1000: score += 40\n    elif budget >= 500: score += 25\n    elif budget >= 200: score += 10\n    \n    # Timeline (rushed = harder, but urgent = serious)\n    if 7 <= timeline_days <= 30: score += 20\n    elif timeline_days > 30: score += 15\n    else: score += 5  # under 7 days is rough\n    \n    # Clear spec = they know what they want\n    if has_clear_spec: score += 25\n    \n    # Fast response = serious buyer\n    if responded_fast: score += 15\n    \n    return min(score, 100)\n\nleads = [\n    {"name": "Mike", "budget": 800, "days": 14, "spec": True, "fast": True},\n    {"name": "Anonymous", "budget": 150, "days": 3, "spec": False, "fast": False},\n    {"name": "Sarah", "budget": 2000, "days": 21, "spec": True, "fast": False},\n]\n\nprint("LEAD SCORES:")\nfor lead in leads:\n    score = score_lead(lead["budget"], lead["days"], lead["spec"], lead["fast"])\n    status = "PURSUE" if score >= 60 else "SKIP"\n    print(lead["name"] + ": " + str(score) + "/100 — " + status)` },
          { type: "plain", text: "This is a real tool. Every consulting firm has a version of this. You just built yours from scratch in Python." },
        ],
        hints: ["score += value adds to the running total", "min(score, 100) caps the score at 100 no matter what", "Boolean parameters like has_clear_spec are True or False directly in if statements"],
        challenges: [
          {
            type: "guided",
            prompt: "Run the lead scorer. Add a 4th lead of your own (make up a name, budget, timeline, and spec/response booleans) and see their score.",
            starterCode: `def score_lead(budget, timeline_days, has_clear_spec, responded_fast):\n    score = 0\n    if budget >= 1000: score += 40\n    elif budget >= 500: score += 25\n    elif budget >= 200: score += 10\n    if 7 <= timeline_days <= 30: score += 20\n    elif timeline_days > 30: score += 15\n    else: score += 5\n    if has_clear_spec: score += 25\n    if responded_fast: score += 15\n    return min(score, 100)\n\nleads = [\n    {"name": "Mike", "budget": 800, "days": 14, "spec": True, "fast": True},\n    {"name": "Anonymous", "budget": 150, "days": 3, "spec": False, "fast": False},\n    {"name": "Sarah", "budget": 2000, "days": 21, "spec": True, "fast": False},\n    {"name": "Your lead", "budget": 600, "days": 10, "spec": True, "fast": True},\n]\n\nprint("LEAD SCORES:")\nfor lead in leads:\n    score = score_lead(lead["budget"], lead["days"], lead["spec"], lead["fast"])\n    status = "PURSUE" if score >= 60 else "SKIP"\n    print(lead["name"] + ": " + str(score) + "/100 -- " + status)`,
            whatItDoes: "A live lead qualification tool. No more guessing which clients are worth chasing.",
            check: (output) => output.includes("PURSUE") || output.includes("SKIP") || output.includes("/100"),
          },
          {
            type: "modify",
            prompt: "Add a 'NEGOTIATE' status for scores between 40-59 (not good enough to fully pursue, not bad enough to skip). Update the status logic.",
            starterCode: `def score_lead(budget, timeline_days, has_clear_spec, responded_fast):\n    score = 0\n    if budget >= 1000: score += 40\n    elif budget >= 500: score += 25\n    elif budget >= 200: score += 10\n    if 7 <= timeline_days <= 30: score += 20\n    elif timeline_days > 30: score += 15\n    else: score += 5\n    if has_clear_spec: score += 25\n    if responded_fast: score += 15\n    return min(score, 100)\n\nleads = [\n    {"name": "Mike", "budget": 800, "days": 14, "spec": True, "fast": True},\n    {"name": "Borderline Bob", "budget": 300, "days": 14, "spec": False, "fast": True},\n    {"name": "Anonymous", "budget": 150, "days": 3, "spec": False, "fast": False},\n]\n\nfor lead in leads:\n    score = score_lead(lead["budget"], lead["days"], lead["spec"], lead["fast"])\n    if score >= 60:\n        status = "PURSUE"\n    elif score >= 40:\n        status = "NEGOTIATE"\n    else:\n        status = "SKIP"\n    print(lead["name"] + ": " + str(score) + "/100 -- " + status)`,
            whatItDoes: "Three-tier scoring is how real sales teams qualify leads. You just implemented it.",
            check: (output) => output.includes("NEGOTIATE") || output.includes("PURSUE"),
          },
          {
            type: "scratch",
            prompt: "Build a daily rate calculator. Given: desired annual income, weeks of vacation (off), and billable hours per week — calculate your minimum daily and hourly rate. Print both clearly.",
            starterCode: `def calc_rates(annual_income, vacation_weeks, billable_hours_per_week):\n    work_weeks = 52 - vacation_weeks\n    total_hours = work_weeks * billable_hours_per_week\n    hourly = annual_income / total_hours\n    daily = hourly * 8\n    print("Target income: $" + str(annual_income))\n    print("Work weeks: " + str(work_weeks))\n    print("Total billable hours: " + str(total_hours))\n    print("Minimum hourly rate: $" + str(round(hourly, 2)))\n    print("Minimum daily rate: $" + str(round(daily, 2)))\n\ncalc_rates(60000, 4, 30)\nprint()\ncalc_rates(100000, 6, 25)`,
            whatItDoes: "Never guess your rate again. Plug in your number and know exactly what to charge.",
            check: (output) => output.includes("hourly") || output.includes("daily") || output.includes("$"),
          },
        ],
        quiz: [
          { question: "What does `min(score, 100)` do in the lead scorer?", answer: "Returns the lower of score and 100", choices: ["Returns the lower of score and 100", "Sets score to 100", "Raises an error if score exceeds 100", "Compares two leads"] },
          { question: "Why is automation valuable to freelancers beyond just personal productivity?", answer: "You can handle more clients without more hours — systems scale", choices: ["AI tools are free", "You can handle more clients without more hours — systems scale", ", "] },
          { question: "In the lead scorer, what does `score += 25` do?", answer: "Adds 25 to the current score value", choices: ["Sets score to 25", "Adds 25 to the current score value", "Subtracts 25", "Resets the score"] },
          { question: "What kind of client task is highest-value to automate?", answer: "Anything done manually in a spreadsheet", choices: ["Tasks that are already digital", "Anything done manually in a spreadsheet", "Tasks that only take 5 minutes", "Work only you can do"] },
          { question: "How do you calculate minimum hourly rate from annual income?", answer: "Annual income divided by total billable hours", choices: ["Annual income divided by 52", "Annual income divided by total billable hours", "Annual income divided by 12", "Daily rate times 5"] },
        ],
      },
      {
        id: "build-ai-tool", title: "Build a Sellable AI-Powered Tool", xp: 200, analogy: "Your first product that earns while you sleep", language: "python",
        theory: [
          { type: "plain", text: "The final evolution: stop selling time, start selling tools. A Python script wrapped in a simple interface can be a product charging $20–100/month per user." },
          { type: "highlight", text: "You don't need a web app yet. A well-documented Python script with clear inputs and outputs IS a product. Sell it on Gumroad, Fiverr, or your own site." },
          { type: "code", label: "PYTHON — AI content brief generator (sellable tool pattern)", color: "#a78bfa", code: `def ai_content_brief(business_type, target_audience, goal, num_ideas=5):\n    """\n    Generate a content brief for AI-assisted content creation.\n    Returns a structured brief ready to paste into Claude or ChatGPT.\n    """\n    brief = [\n        "=== AI CONTENT BRIEF ===",\n        "Business: " + business_type,\n        "Audience: " + target_audience,\n        "Goal: " + goal,\n        "",\n        "CONTENT IDEAS (" + str(num_ideas) + " posts):",\n    ]\n    \n    # Generate placeholder ideas (in production: call Claude API)\n    topics = [\n        "How " + business_type + " businesses save time with automation",\n        "Top 3 mistakes " + target_audience + " make and how to avoid them",\n        "The truth about " + goal.lower() + " nobody tells you",\n        "Step-by-step: " + goal + " for beginners",\n        "Why most " + target_audience + " fail at " + goal.lower(),\n        "Quick wins: " + goal + " in 30 minutes or less",\n    ]\n    \n    for i, topic in enumerate(topics[:num_ideas], 1):\n        brief.append(str(i) + ". " + topic)\n    \n    brief.extend([\n        "",\n        "PASTE INTO AI: Write a 500-word post about idea #[choose one].",\n        "Tone: helpful expert. Include real examples. CTA at end.",\n    ])\n    \n    return "\\n".join(brief)\n\nprint(ai_content_brief(\n    business_type="freelance Python developer",\n    target_audience="small business owners",\n    goal="automating repetitive tasks",\n    num_ideas=4\n))` },
          { type: "plain", text: "Package this as a script, add a README, and sell it for $29 on Gumroad. That's a real product launch. You built the whole thing in Python." },
        ],
        hints: ["enumerate(list, 1) gives you index starting at 1 instead of 0", "list.extend(other_list) adds all items from other_list to list", "The [:num_ideas] slice limits ideas to the requested count"],
        challenges: [
          {
            type: "guided",
            prompt: "Run the content brief generator. Then call it with your own business type, audience, and goal. Try num_ideas=3.",
            starterCode: `def ai_content_brief(business_type, target_audience, goal, num_ideas=5):\n    brief = [\n        "=== AI CONTENT BRIEF ===",\n        "Business: " + business_type,\n        "Audience: " + target_audience,\n        "Goal: " + goal,\n        "",\n        "CONTENT IDEAS:",\n    ]\n    topics = [\n        "How " + business_type + " saves time with AI",\n        "3 mistakes " + target_audience + " make",\n        "The truth about " + goal.lower(),\n        "Beginner guide to " + goal,\n        "Quick wins: " + goal + " in 30 min",\n    ]\n    for i, topic in enumerate(topics[:num_ideas], 1):\n        brief.append(str(i) + ". " + topic)\n    brief.append("")\n    brief.append("PASTE INTO AI: Write 500 words on idea #[choose one].")\n    return "\\n".join(brief)\n\nprint(ai_content_brief("freelance developer", "small businesses", "automating spreadsheets", 3))\nprint("\\n" + "="*40 + "\\n")\nprint(ai_content_brief("web designer", "restaurant owners", "getting more customers online", 4))`,
            whatItDoes: "A structured content brief generator. The output is ready to paste into any AI tool for instant blog posts.",
            check: (output) => output.includes("CONTENT BRIEF") || output.includes("CONTENT IDEAS") || output.includes("PASTE"),
          },
          {
            type: "modify",
            prompt: "Add an `include_hashtags` parameter (default False). If True, append a line with 5 relevant hashtags at the end of the brief.",
            starterCode: `def ai_content_brief(business_type, target_audience, goal, num_ideas=3, include_hashtags=False):\n    brief = [\n        "=== AI CONTENT BRIEF ===",\n        "Business: " + business_type,\n        "Audience: " + target_audience,\n    ]\n    topics = [\n        "How " + business_type + " saves time with AI",\n        "3 mistakes " + target_audience + " make",\n        "Quick wins: " + goal + " today",\n    ]\n    for i, topic in enumerate(topics[:num_ideas], 1):\n        brief.append(str(i) + ". " + topic)\n    if include_hashtags:\n        tags = "#" + business_type.split()[0] + " #freelance #AI #automation #productivity"\n        brief.append("")\n        brief.append("HASHTAGS: " + tags)\n    return "\\n".join(brief)\n\nprint(ai_content_brief("Python developer", "e-commerce owners", "saving time", include_hashtags=True))\nprint()\nprint(ai_content_brief("copywriter", "startup founders", "growing on LinkedIn", include_hashtags=False))`,
            whatItDoes: "Hashtags make social content ready to post. Optional parameters make your tool flexible without breaking old usage.",
            check: (output) => output.includes("HASHTAGS") || output.includes("#"),
          },
          {
            type: "scratch",
            prompt: "Build a 'service package builder'. Given a service name, 3 deliverables (as a list), a price, and a turnaround in days — print a formatted service package card like you'd put on Fiverr or your website.",
            starterCode: `def service_package(service_name, deliverables, price, turnaround_days):\n    print("=" * 40)\n    print("  " + service_name.upper())\n    print("=" * 40)\n    print("WHAT YOU GET:")\n    for item in deliverables:\n        print("  + " + item)\n    print("")\n    print("Price: $" + str(price))\n    print("Delivery: " + str(turnaround_days) + " business days")\n    print("=" * 40)\n\nservice_package(\n    "Python Automation Script",\n    ["Custom script built to your specs", "Code walkthrough video", "30-day support"],\n    497,\n    5\n)\nprint()\nservice_package(\n    "AI Content Package",\n    ["10 AI-generated blog posts", "SEO keywords included", "Ready to publish"],\n    299,\n    3\n)`,
            whatItDoes: "A real service card generator. Put your numbers in, screenshot it, and it's a Fiverr gig listing.",
            check: (output) => output.includes("Price") || output.includes("Delivery") || output.includes("+"),
          },
        ],
        quiz: [
          { question: "What does `enumerate(topics[:num_ideas], 1)` do?", answer: "Iterates over a slice of topics with index starting at 1", choices: ["Counts all topics starting from 0", "Iterates over a slice of topics with index starting at 1", "Removes topics beyond num_ideas", "Reverses the list"] },
          { question: "What's the key difference between selling time vs selling tools?", answer: "Tools scale — they earn without requiring more of your hours", choices: ["Tools require a team", "Tools scale — they earn without requiring more of your hours", "Time is more valuable than tools", "Clients prefer hourly work"] },
          { question: "What does `list.extend(other_list)` do?", answer: "Appends all items from other_list individually", choices: ["Adds other_list as a single nested element", "Appends all items from other_list individually", "Overwrites the list", "Returns a combined list without modifying the original"] },
          { question: "Why is a well-documented Python script a sellable product?", answer: "If it saves people time, the value is in the output — not the format", choices: ["Python scripts are rare", "If it saves people time, the value is in the output — not the format", "Scripts are harder to copy than apps", "Gumroad requires Python"] },
          { question: "In the service package builder, what does `str(price)` do?", answer: "Converts the number to a string so it can be concatenated", choices: ["Converts price to a float", "Converts the number to a string so it can be concatenated", "Rounds the price", "Prints the price"] },
        ],
      },
    ],
  },
];

const ALL_PYTHON_LESSONS = CURRICULUM.flatMap((m) =>
  m.lessons.map((l) => ({ ...l, moduleId: m.id, moduleTitle: m.title, moduleColor: m.color, trackId: "python" }))
);
const ALL_WEBDEV_LESSONS = WEB_DEV_CURRICULUM.flatMap((m) =>
  m.lessons.map((l) => ({ ...l, moduleId: m.id, moduleTitle: m.title, moduleColor: m.color, trackId: "webdev" }))
);
const ALL_AI_LESSONS = AI_DEV_CURRICULUM.flatMap((m) =>
  m.lessons.map((l) => ({ ...l, moduleId: m.id, moduleTitle: m.title, moduleColor: m.color, trackId: "ai" }))
);
const ALL_CAREER_LESSONS = CAREER_CURRICULUM.flatMap((m) =>
  m.lessons.map((l) => ({ ...l, moduleId: m.id, moduleTitle: m.title, moduleColor: m.color, trackId: "career" }))
);
const ALL_LESSONS = [...ALL_PYTHON_LESSONS, ...ALL_WEBDEV_LESSONS, ...ALL_AI_LESSONS, ...ALL_CAREER_LESSONS];

// First 24 lessons globally are free; lesson 25+ requires Pro ($5/month)
const FREE_LESSON_IDS = new Set(ALL_LESSONS.slice(0, 24).map(l => l.id));
const FREE_LESSON_COUNT = 24;

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
  if (block.type === "plain") return <p style={{ fontSize: "13px", color: "#aaa", lineHeight: "1.85", margin: "0 0 14px 0" }}>{block.text}</p>;
  if (block.type === "highlight") return <div style={{ background: "#111", borderLeft: "3px solid #00ff88", borderRadius: "0 8px 8px 0", padding: "10px 14px", margin: "12px 0", fontSize: "13px", color: "#e0e0e0", lineHeight: "1.7", fontWeight: "bold" }}>{block.text}</div>;
  if (block.type === "code") return (
    <div style={{ margin: "12px 0" }}>
      <div style={{ fontSize: "10px", color: block.color, marginBottom: "6px", letterSpacing: "1px" }}>{block.label}</div>
      <pre style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: "8px", padding: "12px", fontSize: "11.5px", color: block.color, margin: 0, overflowX: "auto", whiteSpace: "pre", lineHeight: "1.65", maxWidth: "100%", wordBreak: "normal" }}>{block.code}</pre>
    </div>
  );
  if (block.type === "list") return (
    <ul style={{ margin: "8px 0 14px 0", paddingLeft: "4px", listStyle: "none" }}>
      {block.items.map((item, i) => <li key={i} style={{ fontSize: "12px", color: "#999", lineHeight: "1.75", padding: "5px 0 5px 10px", borderLeft: "2px solid #222" }}>{item}</li>)}
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

function RoadmapView({ completedLessons, isMobile }) {
  const progress = Math.floor((completedLessons / ALL_LESSONS.length) * ROADMAP.length);
  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: isMobile ? "16px 14px" : "32px 20px" }}>
      <div style={{ marginBottom: isMobile ? "20px" : "32px" }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: isMobile ? "28px" : "38px", letterSpacing: "3px", marginBottom: "10px" }}>YOUR MONEY <span style={{ color: "#fbbf24" }}>ROADMAP</span></div>
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

function EmailCapture({ onClose, onSubmit, restoreMode }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const submit = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { setError("Please enter a valid email address."); return; }
    if (!restoreMode && name.trim().length === 0) { setError("Please enter your first name."); return; }
    onSubmit(email, name || email.split("@")[0]);
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "#0d0d0d", border: "1px solid #00ff8830", borderRadius: "16px", width: "100%", maxWidth: "440px", padding: "28px 24px", fontFamily: "'Space Mono', monospace" }}>
        <div style={{ fontSize: "28px", marginBottom: "8px" }}>{restoreMode ? "☁️" : "🚀"}</div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "26px", letterSpacing: "2px", color: "#00ff88", marginBottom: "8px" }}>
          {restoreMode ? "RESTORE PROGRESS" : "FREE ACCESS"}
        </div>
        <p style={{ fontSize: "13px", color: "#888", lineHeight: "1.8", marginBottom: "20px" }}>
          {restoreMode
            ? "Enter the email you used before to restore your progress across all devices."
            : "Get free access to 24 lessons, the AI tutor, and your personal money roadmap. No credit card. No catch."}
        </p>
        {!restoreMode && (
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your first name"
            style={{ width: "100%", background: "#181818", border: "1px solid #252525", borderRadius: "8px", padding: "12px 14px", color: "#ddd", fontSize: "13px", outline: "none", fontFamily: "'Space Mono', monospace", marginBottom: "10px", boxSizing: "border-box" }} />
        )}
        <input value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="Your email address" type="email"
          style={{ width: "100%", background: "#181818", border: `1px solid ${error ? "#ff444460" : "#252525"}`, borderRadius: "8px", padding: "12px 14px", color: "#ddd", fontSize: "13px", outline: "none", fontFamily: "'Space Mono', monospace", marginBottom: "10px", boxSizing: "border-box" }} />
        {error && <p style={{ fontSize: "12px", color: "#ff6b6b", marginBottom: "10px" }}>{error}</p>}
        <button onClick={submit} style={{ width: "100%", background: "#00ff88", color: "#000", border: "none", borderRadius: "8px", padding: "13px", cursor: "pointer", fontWeight: "bold", fontSize: "14px", fontFamily: "'Space Mono', monospace", marginBottom: "10px" }}>
          {restoreMode ? "Restore My Progress →" : "Start Learning Free →"}
        </button>
        <button onClick={onClose} style={{ width: "100%", background: "none", color: "#444", border: "none", cursor: "pointer", fontSize: "12px", fontFamily: "'Space Mono', monospace" }}>
          {restoreMode ? "Cancel" : "Skip for now"}
        </button>
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

// ─── HTML RUNNER ──────────────────────────────────────────────────────────────
function HTMLRunner({ starterCode, whatItDoes, onPass, check, hints, onCodeChange, strikes, onStrike, onReviewNeeded }) {
  const [code, setCode] = useState(starterCode);
  const [preview, setPreview] = useState(null);
  const [passed, setPassed] = useState(false);
  const [error, setError] = useState("");

  const handleCodeChange = (val) => { setCode(val); if (onCodeChange) onCodeChange(val); };

  const runCode = () => {
    setError("");
    try {
      const blob = new Blob([code], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setPreview(url);
      const didPass = check(code);
      if (didPass && !passed) { setPassed(true); onPass(); }
      else if (!didPass) {
        const newStrikes = (strikes || 0) + 1;
        if (onStrike) onStrike(newStrikes);
        if (newStrikes >= 3 && onReviewNeeded) onReviewNeeded();
      }
    } catch (e) { setError("Error: " + e.message); }
  };

  return (
    <div>
      <div style={{ background: "#0f140f", border: "1px solid #1a2a1a", borderRadius: "10px", padding: "14px", marginBottom: "12px" }}>
        <div style={{ fontSize: "10px", color: "#555", marginBottom: "6px", letterSpacing: "1px" }}>WHAT THIS CODE DOES:</div>
        <p style={{ fontSize: "12px", color: "#777", margin: 0, lineHeight: "1.7" }}>{whatItDoes}</p>
      </div>
      {strikes > 0 && strikes < 3 && (
        <div style={{ background: "#fbbf2410", border: "1px solid #fbbf2430", borderRadius: "8px", padding: "12px 14px", marginBottom: "10px" }}>
          <div style={{ fontSize: "11px", color: "#fbbf24", marginBottom: "4px" }}>⚠️ ATTEMPT {strikes}/3 — Hint:</div>
          <p style={{ fontSize: "13px", color: "#d4a500", margin: 0 }}>{hints && hints[strikes - 1]}</p>
        </div>
      )}
      <div style={{ fontSize: "10px", color: "#e34c26", marginBottom: "6px", letterSpacing: "1px" }}>🌐 HTML CODE:</div>
      <textarea value={code} onChange={(e) => handleCodeChange(e.target.value)}
        style={{ width: "100%", minHeight: "180px", background: "#0d0d0d", border: `1px solid ${strikes >= 2 ? "#ff444440" : "#1f2937"}`, borderRadius: "8px", padding: "14px", color: "#e06c75", fontSize: "13px", fontFamily: "'Space Mono', monospace", outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: "1.7" }} />
      <button onClick={runCode}
        style={{ width: "100%", background: "#e34c26", color: "#fff", border: "none", borderRadius: "8px", padding: "13px", cursor: "pointer", fontWeight: "bold", fontSize: "14px", fontFamily: "'Space Mono', monospace", marginBottom: "10px", marginTop: "10px" }}>
        ▶ PREVIEW HTML
      </button>
      {error && <div style={{ color: "#ff6b6b", fontSize: "12px", marginBottom: "10px" }}>{error}</div>}
      {preview && (
        <div style={{ marginBottom: "10px" }}>
          <div style={{ fontSize: "10px", color: "#e34c26", marginBottom: "6px", letterSpacing: "1px" }}>LIVE PREVIEW:</div>
          <iframe src={preview} title="HTML Preview" sandbox="allow-scripts"
            style={{ width: "100%", height: "220px", border: "1px solid #e34c2630", borderRadius: "8px", background: "#fff" }} />
        </div>
      )}
      {passed && <div style={{ marginTop: "12px", padding: "14px", background: "#00ff8815", border: "1px solid #00ff8840", borderRadius: "8px", fontSize: "13px", color: "#00ff88", textAlign: "center", fontWeight: "bold" }}>✅ Challenge complete! XP earned.</div>}
    </div>
  );
}

// ─── REACT RUNNER ─────────────────────────────────────────────────────────────
function ReactRunner({ starterCode, whatItDoes, onPass, check, hints, onCodeChange, strikes, onStrike, onReviewNeeded }) {
  const [code, setCode] = useState(starterCode);
  const [preview, setPreview] = useState(null);
  const [passed, setPassed] = useState(false);

  const handleCodeChange = (val) => { setCode(val); if (onCodeChange) onCodeChange(val); };

  const runCode = () => {
    const html = `<!DOCTYPE html><html><head>
      <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
      <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
      <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
      <style>*{box-sizing:border-box;margin:0;padding:0}body{background:#0d0d0d;color:#e0e0e0;font-family:sans-serif;padding:16px}</style>
    </head><body>
      <div id="root"></div>
      <script type="text/babel">
        const { useState, useEffect, useRef } = React;
        ${code}
        const container = document.getElementById('root');
        const root = ReactDOM.createRoot(container);
        root.render(React.createElement(App));
      </script>
    </body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    setPreview(URL.createObjectURL(blob));
    const didPass = check(code);
    if (didPass && !passed) { setPassed(true); onPass(); }
    else if (!didPass) {
      const newStrikes = (strikes || 0) + 1;
      if (onStrike) onStrike(newStrikes);
      if (newStrikes >= 3 && onReviewNeeded) onReviewNeeded();
    }
  };

  return (
    <div>
      <div style={{ background: "#070d17", border: "1px solid #0d2030", borderRadius: "10px", padding: "14px", marginBottom: "12px" }}>
        <div style={{ fontSize: "10px", color: "#555", marginBottom: "6px", letterSpacing: "1px" }}>WHAT THIS CODE DOES:</div>
        <p style={{ fontSize: "12px", color: "#777", margin: 0, lineHeight: "1.7" }}>{whatItDoes}</p>
      </div>
      {strikes > 0 && strikes < 3 && (
        <div style={{ background: "#fbbf2410", border: "1px solid #fbbf2430", borderRadius: "8px", padding: "12px 14px", marginBottom: "10px" }}>
          <div style={{ fontSize: "11px", color: "#fbbf24", marginBottom: "4px" }}>⚠️ ATTEMPT {strikes}/3 — Hint:</div>
          <p style={{ fontSize: "13px", color: "#d4a500", margin: 0 }}>{hints && hints[strikes - 1]}</p>
        </div>
      )}
      <div style={{ fontSize: "10px", color: "#61dafb", marginBottom: "6px", letterSpacing: "1px" }}>⚛️ REACT CODE:</div>
      <textarea value={code} onChange={(e) => handleCodeChange(e.target.value)}
        style={{ width: "100%", minHeight: "200px", background: "#0d0d0d", border: `1px solid ${strikes >= 2 ? "#ff444440" : "#1f2937"}`, borderRadius: "8px", padding: "14px", color: "#61dafb", fontSize: "13px", fontFamily: "'Space Mono', monospace", outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: "1.7" }} />
      <button onClick={runCode}
        style={{ width: "100%", background: "#61dafb", color: "#000", border: "none", borderRadius: "8px", padding: "13px", cursor: "pointer", fontWeight: "bold", fontSize: "14px", fontFamily: "'Space Mono', monospace", marginBottom: "10px", marginTop: "10px" }}>
        ▶ RUN REACT
      </button>
      {preview && (
        <div style={{ marginBottom: "10px" }}>
          <div style={{ fontSize: "10px", color: "#61dafb", marginBottom: "6px", letterSpacing: "1px" }}>LIVE PREVIEW:</div>
          <iframe src={preview} title="React Preview" sandbox="allow-scripts allow-same-origin"
            style={{ width: "100%", height: "250px", border: "1px solid #61dafb30", borderRadius: "8px", background: "#0d0d0d" }} />
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
          system: `You are a patient, expert coding tutor. The student is motivated and smart but needs plain English — no assumed knowledge. Track: ${lesson.trackId === "webdev" ? "Web Development" : lesson.trackId === "ai" ? "AI & Modern Dev" : lesson.trackId === "career" ? "Career" : "Python"} (${lesson.language === "html" ? "HTML/CSS" : lesson.language === "react" ? "React/JSX" : lesson.language === "javascript" ? "JavaScript" : "Python"}). Module: "${lesson.moduleTitle || ""}". Lesson: "${lesson.title}". Analogy for this lesson: "${lesson.analogy || ""}". Student's current code: ${userCode || "(none yet)"}. Rules: explain every term in plain English before using it; use real-world analogies; be warm, direct, and encouraging; connect skills to earning money as a freelancer; keep answers to 3-5 sentences max unless more depth is asked for; never write the full solution — guide with hints and examples.`,
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
const FREE_LESSON_LIMIT = 30; // kept for legacy milestone checks

function isPremium() { return localStorage.getItem("cg_premium") === "true"; }

function activatePremium(code) {
  if (PREMIUM_CODES.includes(code.toUpperCase().trim())) {
    localStorage.setItem("cg_premium", "true");
    return true;
  }
  return false;
}

function Paywall({ onUnlock, onClose, completedFree }) {
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
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "16px", overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
      <div style={{ marginTop: "16px", marginBottom: "16px", background: "#0d0d0d", border: "2px solid #fbbf2440", borderRadius: "16px", width: "100%", maxWidth: "480px", padding: "28px 22px", fontFamily: "'Space Mono', monospace" }}>
        {completedFree >= FREE_LESSON_COUNT && (
          <div style={{ background: "#0a160e", border: "1px solid #00ff8840", borderRadius: "10px", padding: "14px 16px", marginBottom: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "28px", marginBottom: "6px" }}>🎉</div>
            <div style={{ fontSize: "14px", color: "#00ff88", fontWeight: "bold", marginBottom: "4px" }}>You've completed {FREE_LESSON_COUNT} free lessons!</div>
            <div style={{ fontSize: "12px", color: "#555", lineHeight: "1.6" }}>Unlock the rest for $5/month and keep building.</div>
          </div>
        )}
        {!completedFree && (
          <div style={{ fontSize: "36px", textAlign: "center", marginBottom: "12px" }}>🔐</div>
        )}
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "28px", letterSpacing: "3px", color: "#fbbf24", textAlign: "center", marginBottom: "8px" }}>UNLOCK PRO</div>
        <p style={{ fontSize: "12px", color: "#888", lineHeight: "1.8", textAlign: "center", marginBottom: "20px" }}>
          All 4 tracks unlocked. Every lesson. Unlimited AI tutor.
        </p>
        <div style={{ background: "#111", border: "1px solid #fbbf2430", borderRadius: "10px", padding: "14px", marginBottom: "16px" }}>
          <div style={{ fontSize: "11px", color: "#fbbf24", fontWeight: "bold", marginBottom: "8px" }}>✅ What you unlock:</div>
          <div style={{ fontSize: "12px", color: "#888", lineHeight: "1.9" }}>
            🐍 Full Python track — scripting, automation, APIs, classes<br/>
            🌐 Web Dev track — HTML, CSS, React, Deployment<br/>
            🤖 AI & Dev track — Prompt engineering, Claude API, agents<br/>
            💼 Career track — Interviews, portfolio, landing clients<br/>
            🤖 Unlimited AI coding partner — per lesson<br/>
            🏆 Completion certificate
          </div>
        </div>
        <div style={{ background: "#0a160e", border: "1px solid #00ff8830", borderRadius: "10px", padding: "14px", marginBottom: "16px", textAlign: "center" }}>
          <div style={{ fontSize: "24px", color: "#00ff88", fontWeight: "bold", marginBottom: "2px" }}>$5/month</div>
          <div style={{ fontSize: "11px", color: "#555" }}>Cancel anytime. All 4 tracks, every lesson.</div>
        </div>
        <div style={{ background: "#0a100d", border: "1px solid #00ff8830", borderRadius: "10px", padding: "14px", marginBottom: "14px" }}>
          <div style={{ fontSize: "11px", color: "#00ff88", fontWeight: "bold", marginBottom: "8px" }}>How to unlock:</div>
          <div style={{ fontSize: "12px", color: "#888", lineHeight: "2" }}>
            <span style={{ color: "#fbbf24" }}>1.</span> Send $5 to Cash App <span style={{ color: "#fbbf24", fontWeight: "bold" }}>$champ11b</span><br/>
            <span style={{ color: "#fbbf24" }}>2.</span> Email <span style={{ color: "#00ff88" }}>codegrind.app@gmail.com</span><br/>
            &nbsp;&nbsp;&nbsp;&nbsp;Subject: <em style={{ color: "#ccc" }}>CodeGrind Pro</em><br/>
            &nbsp;&nbsp;&nbsp;&nbsp;Include your Cash App username<br/>
            <span style={{ color: "#fbbf24" }}>3.</span> Get your code within 24 hours
          </div>
        </div>
        <a href="mailto:codegrind.app@gmail.com?subject=CodeGrind%20Pro&body=Hi%20Stanley%2C%20I%20just%20sent%20%245%20to%20Cash%20App%20%24champ11b.%20My%20Cash%20App%20username%20is%3A%20%5Byour%20username%5D.%20Please%20send%20my%20access%20code."
          style={{ display: "block", background: "#00ff88", color: "#000", textDecoration: "none", borderRadius: "8px", padding: "13px", textAlign: "center", fontWeight: "bold", fontSize: "14px", marginBottom: "14px" }}>
          📧 Email to Get Your Code →
        </a>
        <div style={{ height: "1px", background: "#1a1a1a", marginBottom: "14px" }} />
        <div style={{ fontSize: "11px", color: "#666", marginBottom: "8px" }}>Already have a code?</div>
        <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
          <input value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && tryCode()} placeholder="Enter access code..."
            style={{ flex: 1, background: "#181818", border: `1px solid ${error ? "#ff444460" : success ? "#00ff8860" : "#252525"}`, borderRadius: "8px", padding: "10px 14px", color: "#ddd", fontSize: "13px", outline: "none", fontFamily: "'Space Mono', monospace" }} />
          <button onClick={tryCode} style={{ background: "#fbbf24", color: "#000", border: "none", borderRadius: "8px", padding: "10px 16px", cursor: "pointer", fontWeight: "bold", fontSize: "13px", fontFamily: "'Space Mono', monospace" }}>Unlock</button>
        </div>
        {error && <p style={{ fontSize: "12px", color: "#ff6b6b", margin: "0 0 8px 0" }}>{error}</p>}
        {success && <p style={{ fontSize: "12px", color: "#00ff88", margin: "0 0 8px 0" }}>✅ Code accepted! Unlocking Pro...</p>}
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
            ⭐ Unlock Pro — $5/month →
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
    if (!SUPABASE_URL || !SUPABASE_KEY) return [];
    const res = await fetch(`${SUPABASE_URL}/rest/v1/leaderboard?order=xp.desc&limit=10`, {
      headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

function LeaderboardView({ isMobile }) {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchLeaderboard().then(data => { setLeaders(Array.isArray(data) ? data : []); setLoading(false); }).catch(() => setLoading(false));
  }, []);
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", padding: isMobile ? "16px 14px" : "32px 18px" }}>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: isMobile ? "32px" : "44px", letterSpacing: "3px", marginBottom: "8px" }}>
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
            <div key={idx} style={{ background: idx === 0 ? "#0a0d00" : "#0d0d0d", border: "1px solid " + (idx === 0 ? "#fbbf2430" : "#1a1a1a"), borderRadius: "12px", padding: isMobile ? "12px 14px" : "16px 20px", marginBottom: "8px", display: "flex", alignItems: "center", gap: isMobile ? "10px" : "16px" }}>
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
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "20px", overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
      <div style={{ marginTop: "20px", marginBottom: "20px", background: "#0d0d0d", border: "1px solid " + moduleColor + "40", borderRadius: "16px", width: "100%", maxWidth: "520px", fontFamily: "monospace", overflow: "hidden" }}>
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
  const stepLabels = [...challenges.map((c, i) => ({ label: i === 0 ? "Guided" : i === 1 ? "Modify" : "Build", icon: i === 0 ? "🟢" : i === 1 ? "🟡" : "🔴" })), ...(quiz ? [{ label: "Quiz", icon: "🧠" }] : [])];
  return (
    <div>
      <div style={{ background: "#0d0d0d", border: "1px solid #181818", borderRadius: "12px", padding: "14px 16px", marginBottom: "14px" }}>
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
        <div style={{ background: "#0d0d0d", border: "1px solid #181818", borderRadius: "12px", padding: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <div style={{ fontSize: "10px", color: "#ff6b35", letterSpacing: "1px" }}>{step === 0 ? "CHALLENGE 1 — GUIDED" : step === 1 ? "CHALLENGE 2 — MODIFY" : "CHALLENGE 3 — BUILD IT"}</div>
            <div style={{ fontSize: "10px", color: "#444" }}>{step + 1} of {challenges.length}</div>
          </div>
          <p style={{ fontSize: "13px", color: "#ccc", lineHeight: "1.75", marginBottom: "14px" }}>{currentChallenge.prompt}</p>
          {lesson.language === "html" ? (
            <HTMLRunner key={step} starterCode={currentChallenge.starterCode} whatItDoes={currentChallenge.whatItDoes} check={currentChallenge.check} hints={lesson.hints} strikes={lessonStrikes} onPass={handleChallengePass} onCodeChange={onCodeChange} onStrike={onStrike} onReviewNeeded={onReviewNeeded} />
          ) : lesson.language === "react" ? (
            <ReactRunner key={step} starterCode={currentChallenge.starterCode} whatItDoes={currentChallenge.whatItDoes} check={currentChallenge.check} hints={lesson.hints} strikes={lessonStrikes} onPass={handleChallengePass} onCodeChange={onCodeChange} onStrike={onStrike} onReviewNeeded={onReviewNeeded} />
          ) : lesson.language === "javascript" ? (
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
                style={{ background: quizResult ? (choice === quiz[quizStep].answer ? "#00ff8820" : choice === quizSelected ? "#ff444420" : "#111") : "#111", border: "1px solid " + (quizResult ? (choice === quiz[quizStep].answer ? "#00ff8860" : choice === quizSelected ? "#ff444460" : "#1f1f1f") : "#1f1f1f"), borderRadius: "8px", padding: "13px 14px", cursor: quizResult ? "default" : "pointer", color: quizResult ? (choice === quiz[quizStep].answer ? "#00ff88" : choice === quizSelected ? "#ff4444" : "#555") : "#ccc", fontSize: "13px", textAlign: "left", lineHeight: "1.5" }}>
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
            ["02", "THE ADVANTAGE", "The knowledge people pay $15,000 tuition for. You get it here for $5/month — or completely free to start."],
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
        <h2 style={s.sectionTitle}>START FREE.<br /><span style={{ color: "#b22222" }}>GO FURTHER FOR $5.</span></h2>
        <div style={s.priceGrid}>
          <div style={{ ...s.card, padding: "40px 32px" }}>
            <div style={{ fontSize: "9px", color: "#664444", letterSpacing: "4px", marginBottom: "18px" }}>FREE FOREVER</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "60px", letterSpacing: "2px", lineHeight: "1", marginBottom: "6px" }}>$0</div>
            <div style={{ fontSize: "10px", color: "#664444", letterSpacing: "2px", marginBottom: "28px" }}>NO CREDIT CARD — NO CATCH</div>
            {["First 24 lessons free","Live Python code runner","AI tutor (10 msgs/day)","Streak & XP tracking","Cloud progress sync"].map(item => (
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
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "60px", color: "#b22222", letterSpacing: "2px", lineHeight: "1", marginBottom: "6px" }}>$5</div>
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

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", background: "#07070F", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px", fontFamily: "'Space Mono', monospace" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
          <div style={{ color: "#fbbf24", fontSize: "18px", fontWeight: "bold", marginBottom: "8px" }}>Something went wrong</div>
          <div style={{ color: "#666", fontSize: "12px", marginBottom: "24px", textAlign: "center" }}>CodeGrind hit an unexpected error.</div>
          <button onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
            style={{ background: "#00ff88", color: "#000", border: "none", borderRadius: "8px", padding: "12px 24px", cursor: "pointer", fontWeight: "bold", fontSize: "14px", fontFamily: "'Space Mono', monospace" }}>
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
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

function SafeApp() { return <ErrorBoundary><AppWrapper /></ErrorBoundary>; }
export { SafeApp as default };

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
  const [emailCaptureRestoreMode, setEmailCaptureRestoreMode] = useState(false);
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
  const [activeTrack, setActiveTrack] = useState("python");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

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
        setTimeout(() => { setEmailCaptureRestoreMode(false); setShowEmailCapture(true); }, 3000);
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

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
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
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          {view !== "curriculum" && <button onClick={() => { setView("curriculum"); window.scrollTo(0,0); }} style={{ background: "none", border: "1px solid #1f1f1f", color: "#666", cursor: "pointer", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontFamily: "'Space Mono', monospace" }}>← Menu</button>}
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "24px", letterSpacing: "3px", color: "#00ff88" }}>CODE<span style={{ color: "#ff6b35" }}>GRIND</span></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "5px" : "8px", flexWrap: "nowrap", justifyContent: "flex-end", overflow: "hidden" }}>
          {streak.count > 0 && <div style={{ fontSize: "11px", color: "#fbbf24", background: "#fbbf2415", border: "1px solid #fbbf2430", borderRadius: "6px", padding: "3px 8px", whiteSpace: "nowrap" }}>{isMobile ? `🔥${streak.count}` : `🔥 ${streak.count} day streak`}</div>}
          {!userEmail && <button onClick={() => { setEmailCaptureRestoreMode(true); setShowEmailCapture(true); }} style={{ background: "none", border: "1px solid #1f1f1f", color: "#00ff88", cursor: "pointer", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontFamily: "'Space Mono', monospace", flexShrink: 0, whiteSpace: "nowrap" }}>{isMobile ? "👤" : "Sign In"}</button>}
          <button onClick={() => setShowWeakness(true)} style={{ background: "none", border: "1px solid #1f1f1f", color: "#ff6b35", cursor: "pointer", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontFamily: "'Space Mono', monospace", flexShrink: 0 }}>🎯</button>
          {completed.size === ALL_LESSONS.length && <button onClick={() => setShowCertificate(true)} style={{ background: "none", border: "1px solid #fbbf2440", color: "#fbbf24", cursor: "pointer", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontFamily: "'Space Mono', monospace", flexShrink: 0 }}>🏆</button>}
          <button onClick={() => { setView(view === "hire" ? "curriculum" : "hire"); window.scrollTo(0,0); }} style={{ background: view === "hire" ? "#00ff8820" : "none", border: `1px solid ${view === "hire" ? "#00ff8840" : "#1f1f1f"}`, color: view === "hire" ? "#00ff88" : "#888", cursor: "pointer", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontFamily: "'Space Mono', monospace", flexShrink: 0, whiteSpace: "nowrap" }}>{isMobile ? "💼" : "💼 Hire"}</button>
          {!isMobile && <button onClick={() => { setView("roadmap"); window.scrollTo(0,0); }} style={{ background: "none", border: "1px solid #1f1f1f", color: view === "roadmap" ? "#fbbf24" : "#555", cursor: "pointer", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontFamily: "'Space Mono', monospace" }}>💰</button>}
          <button onClick={() => { setView("leaderboard"); window.scrollTo(0,0); }} style={{ background: view === "leaderboard" ? "#fbbf2420" : "none", border: "1px solid #1f1f1f", color: view === "leaderboard" ? "#fbbf24" : "#555", cursor: "pointer", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", flexShrink: 0, whiteSpace: "nowrap" }}>{isMobile ? "🏆" : "🏆 Board"}</button>
          <span style={{ fontSize: "11px", color: "#444", whiteSpace: "nowrap", flexShrink: 0 }}>LVL {level}</span>
          {!isMobile && <div style={{ width: "50px", height: "4px", background: "#181818", borderRadius: "2px", flexShrink: 0 }}>
            <div style={{ width: `${((xp % 200) / 200) * 100}%`, height: "100%", background: "#00ff88", borderRadius: "2px", transition: "width 0.5s" }} />
          </div>}
          <span style={{ fontSize: "12px", color: "#00ff88", fontWeight: "bold", whiteSpace: "nowrap", flexShrink: 0 }}>{xp} XP</span>
        </div>
      </div>

      {view === "roadmap" && <RoadmapView completedLessons={completed.size} isMobile={isMobile} />}
      {view === "leaderboard" && <LeaderboardView isMobile={isMobile} />}

      {view === "hire" && (
        <div style={{ maxWidth: "680px", margin: "0 auto", padding: isMobile ? "16px 14px" : "32px 18px" }}>
          <div style={{ marginBottom: "28px" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: isMobile ? "32px" : "44px", letterSpacing: "3px", lineHeight: 1.05, marginBottom: "12px" }}>HIRE <span style={{ color: "#00ff88" }}>STANLEY</span></div>
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
        <div style={{ maxWidth: "680px", margin: "0 auto", padding: isMobile ? "16px 14px" : "32px 18px" }}>

          {/* ── TRACK SELECTOR ── */}
          {(() => {
            const tracks = [
              { id: "python", label: "🐍 Python", color: "#00ff88" },
              { id: "webdev", label: "🌐 Web Dev", color: "#e34c26" },
              { id: "ai", label: "🤖 AI & Dev", color: "#a78bfa" },
              { id: "career", label: "💼 Career", color: "#fbbf24" },
            ];
            return (
              <div style={{ marginBottom: "24px" }}>
                <div style={{ fontSize: "10px", color: "#444", letterSpacing: "2px", marginBottom: "10px" }}>LEARNING TRACK</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {tracks.map(t => (
                    <button key={t.id} onClick={() => setActiveTrack(t.id)}
                      style={{ background: activeTrack === t.id ? t.color + "20" : "#0d0d0d", border: `1px solid ${activeTrack === t.id ? t.color : "#1f1f1f"}`, color: activeTrack === t.id ? t.color : "#555", borderRadius: "8px", padding: "10px 12px", cursor: "pointer", fontSize: "12px", fontFamily: "'Space Mono', monospace", fontWeight: activeTrack === t.id ? "bold" : "normal", transition: "all 0.2s", textAlign: "center" }}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}

          <div style={{ marginBottom: "36px" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: isMobile ? "36px" : "44px", letterSpacing: "2px", lineHeight: 1.05, marginBottom: "14px" }}>LEARN TO CODE.<br /><span style={{ color: "#00ff88" }}>GET PAID.</span></div>
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
            <div onClick={() => setShowPaywall(true)} style={{ background: "#0a0800", border: "1px solid #fbbf2430", borderRadius: "10px", padding: "14px 16px", marginBottom: "20px", cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "12px", color: "#fbbf24", fontWeight: "bold", marginBottom: "3px" }}>⭐ First 24 lessons are free for everyone</div>
                  <div style={{ fontSize: "11px", color: "#555", lineHeight: "1.5" }}>Unlock all 4 tracks — Python, Web Dev, AI & Dev, Career — $5/month</div>
                </div>
                <div style={{ fontSize: "11px", color: "#fbbf24", border: "1px solid #fbbf2440", borderRadius: "6px", padding: "6px 10px", flexShrink: 0, whiteSpace: "nowrap" }}>Unlock Pro →</div>
              </div>
            </div>
          )}
          {premium && (
            <div style={{ background: "#0a160e", border: "1px solid #00ff8830", borderRadius: "10px", padding: "12px 18px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "16px" }}>⭐</span>
              <div style={{ fontSize: "12px", color: "#00ff88" }}>Premium member — all lessons unlocked</div>
            </div>
          )}

          {(activeTrack === "python" ? CURRICULUM : activeTrack === "webdev" ? WEB_DEV_CURRICULUM : activeTrack === "ai" ? AI_DEV_CURRICULUM : CAREER_CURRICULUM).map((module) => (
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
                const paywalled = !premium && !FREE_LESSON_IDS.has(lesson.id);
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
                        <div style={{ fontSize: "11px", color: "#333", marginTop: "2px", display: "flex", alignItems: "center", gap: "4px", minWidth: 0 }}>
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0, flex: "1 1 0" }}>{paywalled ? "Premium lesson" : lesson.analogy}</span>
                          <span style={{ flexShrink: 0, whiteSpace: "nowrap" }}>• +{lesson.xp} XP</span>
                          {lessonStrikes > 0 && !done && <span style={{ color: "#ff6b35", flexShrink: 0 }}>• {lessonStrikes}⚡</span>}
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
        <div style={{ maxWidth: "720px", margin: "0 auto", padding: isMobile ? "14px 12px" : "24px 18px" }}>
          {reviewMode && (
            <div style={{ background: "#ff6b3515", border: "1px solid #ff6b3530", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px", fontSize: "13px", color: "#ff6b35" }}>
              🔄 Review Mode — You struggled with this concept. Read through the explanation again before trying the challenge.
            </div>
          )}
          <div style={{ marginBottom: "18px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "10px", color: activeLesson.moduleColor, letterSpacing: "2px", marginBottom: "5px" }}>{activeLesson.moduleTitle?.toUpperCase()}</div>
              <div style={{ fontSize: isMobile ? "17px" : "20px", fontWeight: "bold", lineHeight: "1.3" }}>{activeLesson.title}</div>
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
              <div style={{ background: "#0d0d0d", border: "1px solid #181818", borderRadius: "12px", padding: isMobile ? "16px 14px" : "22px", marginBottom: "14px" }}>
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
      {showEmailCapture && <EmailCapture restoreMode={emailCaptureRestoreMode} onClose={() => { setShowEmailCapture(false); setEmailCaptureRestoreMode(false); }} onSubmit={(email, name) => { setShowEmailCapture(false); setEmailCaptureRestoreMode(false); saveEmail(email, name); }} />}
      {showCertificate && <Certificate name={userName} xp={xp} completed={completed.size} total={ALL_LESSONS.length} onClose={() => setShowCertificate(false)} />}
      {showStreakReminder && <StreakReminder streak={streak} onClose={() => setShowStreakReminder(false)} />}
      {showConfetti && <Confetti />}
      {showMilestone && <MilestonePopup milestone={showMilestone} onClose={() => setShowMilestone(null)} onShowPaywall={() => setShowPaywall(true)} isPremiumUser={premium} />}
      {showPaywall && <Paywall onUnlock={() => setPremium(true)} onClose={() => setShowPaywall(false)} completedFree={[...completed].filter(id => FREE_LESSON_IDS.has(id)).length} />}
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
