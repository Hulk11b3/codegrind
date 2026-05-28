// Web Development Track — Full Curriculum
// language: "html" → HTMLRunner (iframe preview)
// language: "javascript" → JSRunner (console.log output)
// language: "react" → ReactRunner (React + Babel in iframe)

const WEB_DEV_CURRICULUM = [

  // ─── MODULE 1: HTML FUNDAMENTALS ────────────────────────────────────────────
  {
    id: "html-fundamentals",
    title: "HTML Fundamentals",
    icon: "🌐",
    color: "#e34c26",
    trackId: "webdev",
    lessons: [
      {
        id: "what-is-html",
        title: "What Is HTML?",
        xp: 100,
        language: "html",
        analogy: "Think of a skeleton",
        theory: [
          { type: "plain", text: "Every webpage you've ever visited is built with HTML. It stands for HyperText Markup Language, and it's the skeleton of the web — it defines the structure of what you see." },
          { type: "highlight", text: "HTML = the bones. CSS = the skin. JavaScript = the muscles." },
          { type: "plain", text: "HTML uses tags — words wrapped in angle brackets like <h1> and </h1>. Tags come in pairs: an opening tag and a closing tag. Everything between them is the content." },
          { type: "code", label: "HTML", color: "#e34c26", code: `<!DOCTYPE html>\n<html>\n  <head>\n    <title>My First Page</title>\n  </head>\n  <body>\n    <h1>Hello, World!</h1>\n    <p>This is a paragraph.</p>\n  </body>\n</html>` },
          { type: "list", items: ["<!DOCTYPE html> — tells the browser this is HTML5", "<html> — the root of the entire page", "<head> — invisible settings (title, fonts, etc.)", "<body> — everything visible on the page", "<h1> — the biggest heading. h2–h6 are smaller.", "<p> — a paragraph of text"] },
        ],
        hints: [
          "Every opening tag like <h1> needs a closing tag like </h1>.",
          "The <body> tag holds everything the user actually sees.",
          "Try changing the text between the <h1> tags.",
        ],
        challenges: [
          {
            prompt: "GUIDED: Click PREVIEW HTML and see your first webpage load in the browser.",
            starterCode: `<!DOCTYPE html>\n<html>\n<head>\n  <title>My First Page</title>\n</head>\n<body>\n  <h1>Hello, Web!</h1>\n  <p>I am learning HTML and this is my first page.</p>\n</body>\n</html>`,
            whatItDoes: "This is a complete HTML page. The h1 is a big heading, p is a paragraph, and they both show up in the browser.",
            check: (code) => code.toLowerCase().includes("<h1>") && code.toLowerCase().includes("<p>"),
          },
          {
            prompt: "MODIFY IT: Change the heading to your name and the paragraph to something about yourself. Then preview.",
            starterCode: `<!DOCTYPE html>\n<html>\n<head>\n  <title>My First Page</title>\n</head>\n<body>\n  <h1>Hello, Web!</h1>\n  <p>I am learning HTML and this is my first page.</p>\n</body>\n</html>`,
            whatItDoes: "Change the text inside the tags. The tags stay the same — just swap out the words.",
            check: (code) => {
              const lower = code.toLowerCase();
              return lower.includes("<h1>") && lower.includes("<p>") && !lower.includes("hello, web!");
            },
          },
          {
            prompt: "FROM SCRATCH: Write a full HTML page with a heading that says your goal and two paragraphs about why you want to code.",
            starterCode: `<!DOCTYPE html>\n<html>\n<head>\n  <title>My Goal</title>\n</head>\n<body>\n  <!-- Write your heading and two paragraphs below -->\n\n</body>\n</html>`,
            whatItDoes: "You write the content this time. Add one <h1> and two <p> tags inside the body.",
            check: (code) => {
              const lower = code.toLowerCase();
              const pCount = (lower.match(/<p>/g) || []).length;
              return lower.includes("<h1>") && pCount >= 2;
            },
          },
        ],
        quiz: [
          { question: "What does HTML stand for?", answer: "HyperText Markup Language", choices: ["HyperText Markup Language", "High-Tech Modern Layout", "Home Tool Markup Language", "HyperTransfer Media Link"] },
          { question: "Which tag creates the biggest heading?", answer: "<h1>", choices: ["<h1>", "<h6>", "<title>", "<header>"] },
          { question: "Which tag creates a paragraph?", answer: "<p>", choices: ["<p>", "<para>", "<text>", "<block>"] },
          { question: "What goes inside the <body> tag?", answer: "Everything the user sees", choices: ["Everything the user sees", "The page title only", "Invisible settings", "CSS styles"] },
          { question: "How do you close an opening <h1> tag?", answer: "</h1>", choices: ["</h1>", "<h1/>", "end<h1>", "<close h1>"] },
        ],
      },

      {
        id: "text-links-images",
        title: "Text, Links & Images",
        xp: 120,
        language: "html",
        analogy: "Think of a newspaper",
        theory: [
          { type: "plain", text: "A newspaper has headlines, body text, photos, and links to related stories. HTML has tags for all of these. Once you learn these 8 tags, you can build 80% of any webpage." },
          { type: "code", label: "HTML", color: "#e34c26", code: `<!-- Text formatting -->\n<strong>This is bold</strong>\n<em>This is italic</em>\n<br> <!-- line break, no closing tag -->\n\n<!-- Links -->\n<a href="https://google.com">Click me</a>\n\n<!-- Images -->\n<img src="photo.jpg" alt="A photo">` },
          { type: "highlight", text: "href= is where the link goes. src= is where the image file is. alt= is the text if the image can't load." },
          { type: "list", items: ["<strong> — bold text (important content)", "<em> — italic text (emphasis)", "<br> — line break (no closing tag needed)", "<a href='url'> — a clickable link", "<img src='url' alt='description'> — an image"] },
          { type: "plain", text: "Images and line breaks are self-closing — they don't wrap content, so there's no closing tag needed." },
        ],
        hints: [
          "For links: <a href=\"https://...\">Link text</a> — the text between the tags is what users click.",
          "For images: <img src=\"url\" alt=\"description\"> — no closing tag needed.",
          "Make sure your href starts with https:// for external links.",
        ],
        challenges: [
          {
            prompt: "GUIDED: Preview this page with text formatting, a link, and an image.",
            starterCode: `<!DOCTYPE html>\n<html>\n<body>\n  <h1>My Favorite Website</h1>\n  <p>I use <strong>Google</strong> every day.</p>\n  <p>It is <em>incredibly</em> useful for learning.</p>\n  <p>Visit it here: <a href="https://google.com">Go to Google</a></p>\n  <img src="https://via.placeholder.com/200x100" alt="Placeholder image">\n</body>\n</html>`,
            whatItDoes: "Shows bold, italic, a clickable link, and an image all on one page.",
            check: (code) => {
              const lower = code.toLowerCase();
              return lower.includes("<strong>") && lower.includes("<a ") && lower.includes("<img ");
            },
          },
          {
            prompt: "MODIFY IT: Add a second paragraph with a link to your favorite website. Use <strong> to make the site name bold.",
            starterCode: `<!DOCTYPE html>\n<html>\n<body>\n  <h1>My Favorite Website</h1>\n  <p>I use <strong>Google</strong> every day.</p>\n  <p>It is <em>incredibly</em> useful for learning.</p>\n  <p>Visit it here: <a href="https://google.com">Go to Google</a></p>\n</body>\n</html>`,
            whatItDoes: "Add a <p> with a <a> link and <strong> text inside it.",
            check: (code) => {
              const lower = code.toLowerCase();
              const pCount = (lower.match(/<p>/g) || []).length;
              return pCount >= 3 && lower.includes("<strong>") && (lower.match(/<a /g) || []).length >= 2;
            },
          },
          {
            prompt: "FROM SCRATCH: Build a mini bio page with your name in h1, a bold job title, an italic tagline, and a link to any website you like.",
            starterCode: `<!DOCTYPE html>\n<html>\n<body>\n  <!-- Your name as h1 -->\n  <!-- Bold job title in a paragraph -->\n  <!-- Italic tagline in a paragraph -->\n  <!-- A link to any website -->\n</body>\n</html>`,
            whatItDoes: "Use h1, p, strong, em, and a tags together to build a simple bio.",
            check: (code) => {
              const lower = code.toLowerCase();
              return lower.includes("<h1>") && lower.includes("<strong>") && lower.includes("<em>") && lower.includes("<a ");
            },
          },
        ],
        quiz: [
          { question: "Which tag makes text bold?", answer: "<strong>", choices: ["<strong>", "<bold>", "<b1>", "<thick>"] },
          { question: "What attribute does <a> use to set where the link goes?", answer: "href", choices: ["href", "src", "link", "url"] },
          { question: "Which tag adds an image?", answer: "<img>", choices: ["<img>", "<image>", "<photo>", "<pic>"] },
          { question: "What does the alt attribute on an <img> do?", answer: "Describes the image if it can't load", choices: ["Describes the image if it can't load", "Sets the image size", "Links to another image", "Makes the image clickable"] },
          { question: "Which tag does NOT need a closing tag?", answer: "<br>", choices: ["<br>", "<p>", "<h1>", "<strong>"] },
        ],
      },

      {
        id: "lists-structure",
        title: "Lists & Page Structure",
        xp: 130,
        language: "html",
        analogy: "Think of a grocery list vs. a recipe",
        theory: [
          { type: "plain", text: "There are two kinds of lists: unordered (bullets — for items with no order) and ordered (numbers — for steps that have a sequence). Think grocery list vs. recipe steps." },
          { type: "code", label: "HTML", color: "#e34c26", code: `<!-- Unordered list (bullets) -->\n<ul>\n  <li>Python</li>\n  <li>JavaScript</li>\n  <li>HTML</li>\n</ul>\n\n<!-- Ordered list (numbered steps) -->\n<ol>\n  <li>Learn HTML</li>\n  <li>Learn CSS</li>\n  <li>Build something</li>\n</ol>` },
          { type: "highlight", text: "<ul> = unordered bullets. <ol> = ordered numbers. <li> = each list item inside either." },
          { type: "plain", text: "You can also add structure to your page using headers. Use <h2> for section titles, <h3> for sub-sections. Think of them like chapter titles and sub-chapter titles." },
          { type: "code", label: "HTML", color: "#e34c26", code: `<h1>My Coding Journey</h1>\n<h2>What I'm Learning</h2>\n<ul>\n  <li>HTML</li>\n  <li>CSS</li>\n</ul>\n<h2>My Goals</h2>\n<ol>\n  <li>Build a website</li>\n  <li>Land my first client</li>\n</ol>` },
        ],
        hints: [
          "<li> items go INSIDE <ul> or <ol> — never outside.",
          "Use <ul> when the order doesn't matter. Use <ol> when steps must be in order.",
          "You can nest lists inside lists, but keep it simple at first.",
        ],
        challenges: [
          {
            prompt: "GUIDED: Preview this page with two types of lists and multiple headings.",
            starterCode: `<!DOCTYPE html>\n<html>\n<body>\n  <h1>My Skills Plan</h1>\n\n  <h2>Languages to Learn (any order)</h2>\n  <ul>\n    <li>HTML</li>\n    <li>CSS</li>\n    <li>JavaScript</li>\n    <li>Python</li>\n  </ul>\n\n  <h2>Steps to First Client (in order)</h2>\n  <ol>\n    <li>Learn the basics</li>\n    <li>Build a portfolio project</li>\n    <li>Create a profile on Upwork</li>\n    <li>Send 5 proposals per week</li>\n  </ol>\n</body>\n</html>`,
            whatItDoes: "Shows a page with h1, h2, ul, and ol all working together.",
            check: (code) => code.toLowerCase().includes("<ul>") && code.toLowerCase().includes("<ol>"),
          },
          {
            prompt: "MODIFY IT: Add a third section with the heading 'Tools I Need' and an unordered list with at least 3 items.",
            starterCode: `<!DOCTYPE html>\n<html>\n<body>\n  <h1>My Skills Plan</h1>\n\n  <h2>Languages to Learn</h2>\n  <ul>\n    <li>HTML</li>\n    <li>CSS</li>\n    <li>JavaScript</li>\n  </ul>\n\n  <h2>Steps to First Client</h2>\n  <ol>\n    <li>Learn the basics</li>\n    <li>Build a portfolio</li>\n    <li>Send proposals</li>\n  </ol>\n\n  <!-- Add your third section below -->\n\n</body>\n</html>`,
            whatItDoes: "Add a new h2, then a ul with li items below the existing content.",
            check: (code) => {
              const lower = code.toLowerCase();
              const ulCount = (lower.match(/<ul>/g) || []).length;
              const h2Count = (lower.match(/<h2>/g) || []).length;
              return ulCount >= 2 && h2Count >= 3;
            },
          },
          {
            prompt: "FROM SCRATCH: Build a 'Top 5 Reasons I'm Learning to Code' page with an ordered list and at least 5 items. Add an h1 title.",
            starterCode: `<!DOCTYPE html>\n<html>\n<body>\n  <!-- h1 title -->\n  <!-- ordered list with 5+ reasons -->\n</body>\n</html>`,
            whatItDoes: "Create your own ordered list. Use <ol> with at least 5 <li> items.",
            check: (code) => {
              const lower = code.toLowerCase();
              const liCount = (lower.match(/<li>/g) || []).length;
              return lower.includes("<h1>") && lower.includes("<ol>") && liCount >= 5;
            },
          },
        ],
        quiz: [
          { question: "Which tag creates an unordered (bullet) list?", answer: "<ul>", choices: ["<ul>", "<ol>", "<list>", "<bl>"] },
          { question: "What does <li> stand for?", answer: "List item", choices: ["List item", "Line item", "Link info", "Layer index"] },
          { question: "When should you use <ol> instead of <ul>?", answer: "When the order matters (like numbered steps)", choices: ["When the order matters (like numbered steps)", "When you have more than 5 items", "When using CSS", "When items are short words"] },
          { question: "Where do <li> tags go?", answer: "Inside <ul> or <ol>", choices: ["Inside <ul> or <ol>", "Directly inside <body>", "Inside <p>", "After <h1>"] },
          { question: "What heading tag is best for a main page title?", answer: "<h1>", choices: ["<h1>", "<h6>", "<title>", "<header>"] },
        ],
      },

      {
        id: "html-forms",
        title: "HTML Forms: Getting User Input",
        xp: 150,
        language: "html",
        analogy: "Think of a paper form at the doctor's office",
        theory: [
          { type: "plain", text: "Every login page, signup form, and search box is built with HTML form elements. A form is like a paper form at the doctor's office — it has fields you fill in and a submit button." },
          { type: "code", label: "HTML", color: "#e34c26", code: `<form>\n  <!-- Text input -->\n  <label>Name:</label>\n  <input type="text" placeholder="Enter your name">\n\n  <!-- Email input -->\n  <label>Email:</label>\n  <input type="email" placeholder="your@email.com">\n\n  <!-- Password input -->\n  <input type="password" placeholder="Password">\n\n  <!-- Dropdown -->\n  <select>\n    <option>Beginner</option>\n    <option>Intermediate</option>\n  </select>\n\n  <!-- Submit button -->\n  <button type="submit">Sign Up</button>\n</form>` },
          { type: "highlight", text: "type='text' = regular input. type='email' = email validation. type='password' = hidden text. Each input needs a label so users know what to fill in." },
          { type: "list", items: ["<form> — wraps all your form fields", "<input type='text'> — single-line text field", "<input type='email'> — validates email format", "<input type='password'> — hides what you type", "<select> with <option> — dropdown menu", "<textarea> — multi-line text box", "<button type='submit'> — submit button"] },
        ],
        hints: [
          "The placeholder attribute adds grey hint text inside the input box.",
          "Use <label> before each input so users know what to type.",
          "Wrapping everything in <form> keeps your inputs organized.",
        ],
        challenges: [
          {
            prompt: "GUIDED: Preview this sign-up form with multiple input types.",
            starterCode: `<!DOCTYPE html>\n<html>\n<body style="font-family: sans-serif; padding: 20px; background: #f5f5f5;">\n  <h2>Create Your Account</h2>\n  <form style="background: white; padding: 20px; border-radius: 8px; max-width: 400px;">\n    <p>\n      <label>Full Name:</label><br>\n      <input type="text" placeholder="John Doe" style="width: 100%; padding: 8px; margin-top: 4px;">\n    </p>\n    <p>\n      <label>Email:</label><br>\n      <input type="email" placeholder="john@example.com" style="width: 100%; padding: 8px; margin-top: 4px;">\n    </p>\n    <p>\n      <label>Skill Level:</label><br>\n      <select style="width: 100%; padding: 8px; margin-top: 4px;">\n        <option>Complete Beginner</option>\n        <option>Some Experience</option>\n        <option>Intermediate</option>\n      </select>\n    </p>\n    <button type="submit" style="background: #e34c26; color: white; border: none; padding: 10px 24px; cursor: pointer; border-radius: 4px; font-size: 14px;">Create Account</button>\n  </form>\n</body>\n</html>`,
            whatItDoes: "A styled sign-up form with text, email, dropdown, and submit button.",
            check: (code) => {
              const lower = code.toLowerCase();
              return lower.includes('<input') && lower.includes('<select') && lower.includes('<button');
            },
          },
          {
            prompt: "MODIFY IT: Add a password field and a multi-line textarea for 'Your coding goal' to the form.",
            starterCode: `<!DOCTYPE html>\n<html>\n<body style="font-family: sans-serif; padding: 20px;">\n  <h2>Create Your Account</h2>\n  <form>\n    <p>\n      <label>Full Name:</label><br>\n      <input type="text" placeholder="John Doe">\n    </p>\n    <p>\n      <label>Email:</label><br>\n      <input type="email" placeholder="john@example.com">\n    </p>\n    <!-- Add a password input here -->\n    <!-- Add a textarea for coding goal here -->\n    <button type="submit">Create Account</button>\n  </form>\n</body>\n</html>`,
            whatItDoes: "Add a password <input> and a <textarea> inside the form.",
            check: (code) => {
              const lower = code.toLowerCase();
              return lower.includes('type="password"') || lower.includes("type='password'") && lower.includes('<textarea');
            },
          },
          {
            prompt: "FROM SCRATCH: Build a contact form with fields for Name, Email, Subject (dropdown with 3 options), Message (textarea), and a Send button.",
            starterCode: `<!DOCTYPE html>\n<html>\n<body style="font-family: sans-serif; padding: 20px;">\n  <h2>Contact Us</h2>\n  <form>\n    <!-- Name, Email, Subject dropdown, Message textarea, Send button -->\n  </form>\n</body>\n</html>`,
            whatItDoes: "Build the whole form yourself using text input, email input, select, textarea, and button.",
            check: (code) => {
              const lower = code.toLowerCase();
              return lower.includes('<input') && lower.includes('<select') && lower.includes('<textarea') && lower.includes('<button');
            },
          },
        ],
        quiz: [
          { question: "What tag wraps all form fields together?", answer: "<form>", choices: ["<form>", "<group>", "<inputs>", "<container>"] },
          { question: "Which input type hides the text you type?", answer: "password", choices: ["password", "hidden", "secret", "mask"] },
          { question: "What does the placeholder attribute do?", answer: "Shows hint text inside the input box", choices: ["Shows hint text inside the input box", "Sets the input's value", "Labels the input", "Validates the input"] },
          { question: "Which tag creates a dropdown menu?", answer: "<select>", choices: ["<select>", "<dropdown>", "<menu>", "<choose>"] },
          { question: "What type attribute makes an input validate email format?", answer: "email", choices: ["email", "mail", "address", "contact"] },
        ],
      },

      {
        id: "semantic-html",
        title: "Semantic HTML: Structure That Makes Sense",
        xp: 140,
        language: "html",
        analogy: "Think of a newspaper layout",
        theory: [
          { type: "plain", text: "Semantic HTML uses tags that describe the role of the content — not just how it looks. A <header> tells browsers (and screen readers and Google) 'this is the top of the page.' A <div> just says 'this is a box.' Semantic HTML makes your code readable and helps SEO." },
          { type: "code", label: "HTML", color: "#e34c26", code: `<header>\n  <h1>My Portfolio</h1>\n  <nav>\n    <a href="#about">About</a>\n    <a href="#work">Work</a>\n    <a href="#contact">Contact</a>\n  </nav>\n</header>\n\n<main>\n  <section id="about">\n    <h2>About Me</h2>\n    <p>I build websites and automation tools.</p>\n  </section>\n\n  <section id="work">\n    <h2>My Work</h2>\n    <article>\n      <h3>Project 1</h3>\n      <p>A price tracker built with Python.</p>\n    </article>\n  </section>\n</main>\n\n<footer>\n  <p>© 2025 My Portfolio</p>\n</footer>` },
          { type: "highlight", text: "<header> = top section. <nav> = navigation links. <main> = primary content. <section> = a thematic group. <article> = self-contained content. <footer> = bottom section." },
        ],
        hints: [
          "<nav> goes inside <header> — it holds your navigation links.",
          "Use <section> for different topics and <article> for things that could stand alone (like a blog post).",
          "There should only be one <main> per page.",
        ],
        challenges: [
          {
            prompt: "GUIDED: Preview a semantic portfolio page with header, nav, main, sections, and footer.",
            starterCode: `<!DOCTYPE html>\n<html>\n<head><title>My Portfolio</title></head>\n<body style="font-family: sans-serif; margin: 0;">\n  <header style="background: #1a1a2e; color: white; padding: 20px 40px; display: flex; justify-content: space-between; align-items: center;">\n    <h1 style="margin: 0; font-size: 24px;">DEV<span style="color: #e34c26;">PORTFOLIO</span></h1>\n    <nav>\n      <a href="#about" style="color: white; text-decoration: none; margin-left: 20px;">About</a>\n      <a href="#projects" style="color: white; text-decoration: none; margin-left: 20px;">Projects</a>\n      <a href="#contact" style="color: white; text-decoration: none; margin-left: 20px;">Contact</a>\n    </nav>\n  </header>\n\n  <main style="max-width: 800px; margin: 40px auto; padding: 0 20px;">\n    <section id="about">\n      <h2>About Me</h2>\n      <p>I build websites, automation tools, and AI applications for small businesses.</p>\n    </section>\n    <section id="projects" style="margin-top: 40px;">\n      <h2>Projects</h2>\n      <article style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin-bottom: 12px;">\n        <h3>Price Tracker Bot</h3>\n        <p>Python script that monitors Amazon prices and sends email alerts.</p>\n      </article>\n    </section>\n  </main>\n\n  <footer style="background: #1a1a2e; color: #888; text-align: center; padding: 20px; margin-top: 60px;">\n    <p>© 2025 My Portfolio</p>\n  </footer>\n</body>\n</html>`,
            whatItDoes: "A real-looking portfolio page using semantic HTML5 elements.",
            check: (code) => {
              const lower = code.toLowerCase();
              return lower.includes('<header') && lower.includes('<main') && lower.includes('<footer');
            },
          },
          {
            prompt: "MODIFY IT: Add a second <article> inside the projects section with a new project name and description.",
            starterCode: `<!DOCTYPE html>\n<html>\n<body style="font-family: sans-serif; padding: 20px;">\n  <header><h1>My Portfolio</h1></header>\n  <main>\n    <section id="projects">\n      <h2>Projects</h2>\n      <article style="background: #f0f0f0; padding: 16px; border-radius: 8px; margin-bottom: 12px;">\n        <h3>Price Tracker</h3>\n        <p>Monitors prices and sends alerts.</p>\n      </article>\n      <!-- Add your second project article here -->\n    </section>\n  </main>\n  <footer><p>© 2025</p></footer>\n</body>\n</html>`,
            whatItDoes: "Add another <article> with an h3 title and a p description.",
            check: (code) => (code.toLowerCase().match(/<article/g) || []).length >= 2,
          },
          {
            prompt: "FROM SCRATCH: Build a semantic blog page with: header (with h1 and nav), main with a section containing two articles (each with h2, p, and a 'Read more' link), and a footer.",
            starterCode: `<!DOCTYPE html>\n<html>\n<body style="font-family: sans-serif;">\n  <!-- header with h1 and nav -->\n  <!-- main > section > two articles -->\n  <!-- footer -->\n</body>\n</html>`,
            whatItDoes: "Use header, nav, main, section, article, footer together — the full semantic HTML toolkit.",
            check: (code) => {
              const lower = code.toLowerCase();
              return lower.includes('<header') && lower.includes('<nav') && lower.includes('<main') &&
                (lower.match(/<article/g) || []).length >= 2 && lower.includes('<footer');
            },
          },
        ],
        quiz: [
          { question: "What is semantic HTML?", answer: "HTML tags that describe the role of the content", choices: ["HTML tags that describe the role of the content", "HTML with extra styling", "HTML for mobile devices", "HTML without JavaScript"] },
          { question: "Which tag should hold your navigation links?", answer: "<nav>", choices: ["<nav>", "<links>", "<menu>", "<ul>"] },
          { question: "How many <main> tags should a page have?", answer: "One", choices: ["One", "Two", "As many as needed", "None — use <div> instead"] },
          { question: "What tag wraps self-contained content like a blog post?", answer: "<article>", choices: ["<article>", "<section>", "<div>", "<content>"] },
          { question: "Why does semantic HTML help SEO?", answer: "Search engines understand the structure and purpose of the content", choices: ["Search engines understand the structure and purpose of the content", "It loads faster", "It uses less code", "It adds keywords automatically"] },
        ],
      },
    ],
  },

  // ─── MODULE 2: CSS STYLING ───────────────────────────────────────────────────
  {
    id: "css-styling",
    title: "CSS: Make It Beautiful",
    icon: "🎨",
    color: "#264de4",
    trackId: "webdev",
    lessons: [
      {
        id: "css-basics",
        title: "CSS Basics: Colors & Fonts",
        xp: 130,
        language: "html",
        analogy: "Think of CSS as the outfit your HTML wears",
        theory: [
          { type: "plain", text: "HTML builds the structure. CSS makes it look good. Think of HTML as your skeleton and CSS as your clothes, colors, and style. You write CSS inside a <style> tag or a separate .css file." },
          { type: "code", label: "CSS", color: "#264de4", code: `<style>\n  /* Select an element and set its properties */\n  h1 {\n    color: #e34c26;\n    font-size: 48px;\n    font-family: Arial, sans-serif;\n  }\n\n  p {\n    color: #555;\n    font-size: 16px;\n    line-height: 1.6;\n  }\n\n  body {\n    background-color: #0d0d0d;\n    color: white;\n    padding: 20px;\n  }\n</style>` },
          { type: "highlight", text: "selector { property: value; } — that's the whole syntax. Pick what to style, then say how to style it." },
          { type: "list", items: ["color — text color (#hex, rgb(), or name like 'red')", "background-color — background fill", "font-size — text size in px, em, or rem", "font-family — the typeface ('Arial', 'monospace', etc.)", "font-weight — bold or normal", "line-height — spacing between lines"] },
        ],
        hints: [
          "Colors can be hex (#264de4), rgb(38, 77, 228), or names like 'blue'.",
          "font-family: Arial, sans-serif — the comma fallback means 'if Arial fails, use any sans-serif'.",
          "Everything goes inside curly braces: h1 { ... }",
        ],
        challenges: [
          {
            prompt: "GUIDED: Preview this dark-themed styled page. Notice how CSS transforms plain HTML.",
            starterCode: `<!DOCTYPE html>\n<html>\n<head>\n<style>\n  body {\n    background: #0d0d0d;\n    color: #e0e0e0;\n    font-family: 'Segoe UI', sans-serif;\n    padding: 40px;\n    max-width: 600px;\n    margin: 0 auto;\n  }\n  h1 {\n    color: #00ff88;\n    font-size: 42px;\n    letter-spacing: 2px;\n  }\n  h2 { color: #fbbf24; font-size: 20px; }\n  p { color: #aaa; line-height: 1.8; }\n  .highlight { color: #00ff88; font-weight: bold; }\n</style>\n</head>\n<body>\n  <h1>CODEGRIND</h1>\n  <h2>Learn to Code. Get Paid.</h2>\n  <p>Plain English. Real analogies. <span class="highlight">Live code runner.</span> Progress saves automatically.</p>\n  <p>No computer science degree. No bootcamp. Just you, the lessons, and the work.</p>\n</body>\n</html>`,
            whatItDoes: "A styled page with background color, custom fonts, heading colors, and a highlight class.",
            check: (code) => code.toLowerCase().includes('<style>') && code.toLowerCase().includes('color'),
          },
          {
            prompt: "MODIFY IT: Change the h1 color to #e34c26 (orange-red), make the body background #ffffff (white), and change the paragraph text color to #333.",
            starterCode: `<!DOCTYPE html>\n<html>\n<head>\n<style>\n  body {\n    background: #0d0d0d;\n    color: #e0e0e0;\n    font-family: sans-serif;\n    padding: 40px;\n  }\n  h1 { color: #00ff88; font-size: 40px; }\n  p { color: #aaa; line-height: 1.8; }\n</style>\n</head>\n<body>\n  <h1>My Styled Page</h1>\n  <p>Change the colors in the CSS above to see the difference.</p>\n</body>\n</html>`,
            whatItDoes: "Change the color values in the CSS section. The structure stays the same.",
            check: (code) => code.includes('#e34c26') && (code.includes('#ffffff') || code.includes('white')),
          },
          {
            prompt: "FROM SCRATCH: Write a styled page for yourself. Use CSS to set: body background (dark), h1 color and font-size, p line-height and color. Add at least one class with a custom style.",
            starterCode: `<!DOCTYPE html>\n<html>\n<head>\n<style>\n  /* Style your page here */\n  body { }\n  h1 { }\n  p { }\n  /* Add a custom class */\n</style>\n</head>\n<body>\n  <h1>Your Name Here</h1>\n  <p>Your description here.</p>\n</body>\n</html>`,
            whatItDoes: "Write your own CSS rules. You decide the colors, sizes, and custom class.",
            check: (code) => {
              const styleMatch = code.match(/<style>([\s\S]*?)<\/style>/i);
              if (!styleMatch) return false;
              const css = styleMatch[1];
              return css.includes('color') && css.includes('font-size') && css.includes('.');
            },
          },
        ],
        quiz: [
          { question: "What is the correct CSS syntax?", answer: "selector { property: value; }", choices: ["selector { property: value; }", "selector: property = value", "property(selector) = value", "selector > property: value"] },
          { question: "Which CSS property sets the text color?", answer: "color", choices: ["color", "text-color", "font-color", "foreground"] },
          { question: "How do you write a hex color code?", answer: "#followed by 6 hex digits (e.g., #264de4)", choices: ["#followed by 6 hex digits (e.g., #264de4)", "hex(38, 77, 228)", "0x264de4", "rgb#264de4"] },
          { question: "Which tag goes inside <head> to add CSS to an HTML file?", answer: "<style>", choices: ["<style>", "<css>", "<design>", "<link>"] },
          { question: "What does line-height control?", answer: "Spacing between lines of text", choices: ["Spacing between lines of text", "The font size", "The margin around a block", "The border thickness"] },
        ],
      },

      {
        id: "css-box-model",
        title: "The Box Model: Spacing & Borders",
        xp: 150,
        language: "html",
        analogy: "Think of a picture frame",
        theory: [
          { type: "plain", text: "Every HTML element is a box. The box model describes the space around and inside that box. Think of a picture frame: the content is the photo, padding is the mat inside the frame, border is the frame itself, and margin is the space on the wall around the frame." },
          { type: "code", label: "CSS", color: "#264de4", code: `.card {\n  /* Content size */\n  width: 300px;\n\n  /* Padding: space inside the box */\n  padding: 20px;\n\n  /* Border: the outline */\n  border: 2px solid #264de4;\n  border-radius: 8px;\n\n  /* Margin: space outside the box */\n  margin: 16px auto;\n\n  /* Important: includes padding in width */\n  box-sizing: border-box;\n}` },
          { type: "highlight", text: "margin = outside space. padding = inside space. border = the visible outline. Always add box-sizing: border-box to avoid size surprises." },
          { type: "list", items: ["padding: 20px — space on all sides", "padding: 10px 20px — 10px top/bottom, 20px left/right", "margin: 0 auto — center a block horizontally", "border: 2px solid #color — solid border", "border-radius: 8px — rounded corners", "box-shadow: 0 4px 12px rgba(0,0,0,0.1) — drop shadow"] },
        ],
        hints: [
          "margin: 0 auto centers a block — but the element needs a fixed width.",
          "border-radius: 50% makes a perfect circle.",
          "box-sizing: border-box makes sizing predictable — always add it.",
        ],
        challenges: [
          {
            prompt: "GUIDED: Preview these styled cards showing the box model in action.",
            starterCode: `<!DOCTYPE html>\n<html>\n<head>\n<style>\n  * { box-sizing: border-box; margin: 0; padding: 0; }\n  body { background: #111; font-family: sans-serif; padding: 30px; }\n  .card {\n    background: #1a1a2e;\n    border: 1px solid #264de4;\n    border-radius: 12px;\n    padding: 24px;\n    margin-bottom: 16px;\n    max-width: 400px;\n    box-shadow: 0 4px 20px rgba(38, 77, 228, 0.2);\n  }\n  .card h3 { color: #fff; margin-bottom: 8px; }\n  .card p { color: #888; line-height: 1.6; }\n  .badge {\n    display: inline-block;\n    background: #264de4;\n    color: white;\n    padding: 4px 12px;\n    border-radius: 20px;\n    font-size: 12px;\n    margin-top: 12px;\n  }\n</style>\n</head>\n<body>\n  <div class="card">\n    <h3>Box Model Demo</h3>\n    <p>This card uses padding, border, border-radius, and box-shadow to look polished.</p>\n    <span class="badge">CSS Card</span>\n  </div>\n  <div class="card">\n    <h3>Spacing Matters</h3>\n    <p>Margin keeps cards apart. Padding keeps text away from the edges. Both matter.</p>\n    <span class="badge">Spacing</span>\n  </div>\n</body>\n</html>`,
            whatItDoes: "Two styled cards showing padding, border-radius, box-shadow, and margin working together.",
            check: (code) => code.includes('border-radius') && code.includes('padding'),
          },
          {
            prompt: "MODIFY IT: Give the cards a thicker border (3px), more border-radius (20px), and add a red color variant by duplicating one card with class 'card card-red' and adding a CSS rule for .card-red with a red border.",
            starterCode: `<!DOCTYPE html>\n<html>\n<head>\n<style>\n  body { background: #111; font-family: sans-serif; padding: 30px; }\n  .card {\n    background: #1a1a2e;\n    border: 1px solid #264de4;\n    border-radius: 12px;\n    padding: 24px;\n    margin-bottom: 16px;\n    max-width: 400px;\n  }\n  .card h3 { color: #fff; margin-bottom: 8px; }\n  .card p { color: #888; }\n  /* Add .card-red rule here */\n</style>\n</head>\n<body>\n  <div class="card">\n    <h3>Blue Card</h3>\n    <p>This has a blue border from the .card class.</p>\n  </div>\n  <!-- Add a red card variant here -->\n</body>\n</html>`,
            whatItDoes: "Modify the border width and radius, then add a color variant class.",
            check: (code) => code.includes('3px') && code.includes('card-red') && (code.includes('#e34c26') || code.includes('red')),
          },
          {
            prompt: "FROM SCRATCH: Build a profile card with: name in h3, a short bio in p, a 'View Work' button styled with padding/border-radius/background, and a card container with border-radius, padding, and a subtle box-shadow.",
            starterCode: `<!DOCTYPE html>\n<html>\n<head>\n<style>\n  body { background: #111; font-family: sans-serif; padding: 40px; }\n  /* Style .profile-card, h3, p, button */\n</style>\n</head>\n<body>\n  <div class="profile-card">\n    <!-- Name, bio, button -->\n  </div>\n</body>\n</html>`,
            whatItDoes: "Create your own CSS card component with spacing, borders, and a button.",
            check: (code) => code.includes('border-radius') && code.includes('padding') && code.toLowerCase().includes('<button'),
          },
        ],
        quiz: [
          { question: "What does padding do?", answer: "Adds space INSIDE the element, between content and border", choices: ["Adds space INSIDE the element, between content and border", "Adds space OUTSIDE the element", "Creates a visible border", "Sets the element's width"] },
          { question: "What does margin do?", answer: "Adds space OUTSIDE the element, pushing other elements away", choices: ["Adds space OUTSIDE the element, pushing other elements away", "Adds space inside the element", "Creates a visible border", "Changes the background color"] },
          { question: "What does border-radius do?", answer: "Rounds the corners of an element", choices: ["Rounds the corners of an element", "Adds a glow effect", "Sets the border thickness", "Rounds numbers in CSS"] },
          { question: "Why should you add box-sizing: border-box?", answer: "So padding doesn't add to the total width", choices: ["So padding doesn't add to the total width", "To center the element", "To add a box shadow", "To make the border thicker"] },
          { question: "How do you center a block element horizontally with CSS?", answer: "margin: 0 auto (with a fixed width)", choices: ["margin: 0 auto (with a fixed width)", "padding: auto", "align: center", "position: middle"] },
        ],
      },

      {
        id: "flexbox",
        title: "Flexbox: The Layout Superpower",
        xp: 170,
        language: "html",
        analogy: "Think of flex items as books on a shelf",
        theory: [
          { type: "plain", text: "Flexbox is how modern websites lay out their content. Before flexbox, centering something vertically was a nightmare. Now it's one line of code. Think of a shelf: flexbox is the shelf, and your HTML elements are the books on it." },
          { type: "code", label: "CSS", color: "#264de4", code: `.container {\n  display: flex;\n\n  /* Direction: row (left-right) or column (top-bottom) */\n  flex-direction: row;\n\n  /* Align along main axis (horizontal by default) */\n  justify-content: space-between;\n  /* Options: flex-start, flex-end, center, space-between, space-around */\n\n  /* Align along cross axis (vertical by default) */\n  align-items: center;\n  /* Options: flex-start, flex-end, center, stretch */\n\n  /* Wrap to next line if no space */\n  flex-wrap: wrap;\n  gap: 16px;\n}` },
          { type: "highlight", text: "justify-content controls horizontal alignment. align-items controls vertical alignment. Both only work if display: flex is set on the parent." },
          { type: "list", items: ["display: flex — turns on flexbox", "justify-content: center — center horizontally", "justify-content: space-between — items at both ends, space in middle", "align-items: center — center vertically", "flex: 1 — item takes remaining space", "gap: 16px — space between items (no margin needed)"] },
        ],
        hints: [
          "display: flex goes on the PARENT container, not the children.",
          "To perfectly center something: display: flex; justify-content: center; align-items: center;",
          "gap is modern and cleaner than margins between flex children.",
        ],
        challenges: [
          {
            prompt: "GUIDED: Preview this navbar and card grid built entirely with flexbox.",
            starterCode: `<!DOCTYPE html>\n<html>\n<head>\n<style>\n  * { box-sizing: border-box; margin: 0; padding: 0; }\n  body { background: #0d0d0d; color: white; font-family: sans-serif; }\n\n  /* Navbar */\n  nav {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    padding: 16px 32px;\n    background: #1a1a2e;\n    border-bottom: 1px solid #264de4;\n  }\n  .logo { font-size: 20px; font-weight: bold; color: #264de4; }\n  .nav-links { display: flex; gap: 24px; }\n  .nav-links a { color: #aaa; text-decoration: none; }\n\n  /* Card Grid */\n  .grid {\n    display: flex;\n    flex-wrap: wrap;\n    gap: 16px;\n    padding: 32px;\n  }\n  .card {\n    flex: 1;\n    min-width: 200px;\n    background: #1a1a2e;\n    border: 1px solid #264de4;\n    border-radius: 12px;\n    padding: 24px;\n  }\n  .card h3 { color: #264de4; margin-bottom: 8px; }\n  .card p { color: #888; font-size: 14px; }\n</style>\n</head>\n<body>\n  <nav>\n    <div class="logo">FLEXBOX</div>\n    <div class="nav-links">\n      <a href="#">Home</a>\n      <a href="#">About</a>\n      <a href="#">Work</a>\n    </div>\n  </nav>\n  <div class="grid">\n    <div class="card"><h3>HTML</h3><p>The structure of the web.</p></div>\n    <div class="card"><h3>CSS</h3><p>The style of the web.</p></div>\n    <div class="card"><h3>JavaScript</h3><p>The behavior of the web.</p></div>\n  </div>\n</body>\n</html>`,
            whatItDoes: "A navbar with space-between and a responsive card grid — all with flexbox.",
            check: (code) => (code.match(/display:\s*flex/g) || []).length >= 2,
          },
          {
            prompt: "MODIFY IT: Add a fourth card to the grid, and center the grid horizontally by adding justify-content: center to the .grid CSS rule.",
            starterCode: `<!DOCTYPE html>\n<html>\n<head>\n<style>\n  * { box-sizing: border-box; margin: 0; padding: 0; }\n  body { background: #0d0d0d; color: white; font-family: sans-serif; padding: 32px; }\n  .grid {\n    display: flex;\n    flex-wrap: wrap;\n    gap: 16px;\n    /* Add justify-content: center here */\n  }\n  .card {\n    flex: 1;\n    min-width: 180px;\n    background: #1a1a2e;\n    border: 1px solid #264de4;\n    border-radius: 12px;\n    padding: 20px;\n  }\n  .card h3 { color: #264de4; }\n  .card p { color: #888; font-size: 13px; margin-top: 6px; }\n</style>\n</head>\n<body>\n  <div class="grid">\n    <div class="card"><h3>HTML</h3><p>Structure</p></div>\n    <div class="card"><h3>CSS</h3><p>Style</p></div>\n    <div class="card"><h3>JavaScript</h3><p>Behavior</p></div>\n    <!-- Add a fourth card here -->\n  </div>\n</body>\n</html>`,
            whatItDoes: "Add a card and update the grid to center-justify its items.",
            check: (code) => code.includes('justify-content: center') && (code.match(/<div class="card">/g) || []).length >= 4,
          },
          {
            prompt: "FROM SCRATCH: Build a hero section (full-width div) that is perfectly centered — both horizontally and vertically — with display: flex. Add a big h1 and a subtitle p inside it. Make the height 300px.",
            starterCode: `<!DOCTYPE html>\n<html>\n<head>\n<style>\n  * { box-sizing: border-box; margin: 0; padding: 0; }\n  body { background: #0d0d0d; font-family: sans-serif; }\n  .hero {\n    height: 300px;\n    background: linear-gradient(135deg, #1a1a2e, #264de4);\n    /* Center everything using flexbox */\n  }\n  /* Style your h1 and p */\n</style>\n</head>\n<body>\n  <div class="hero">\n    <!-- h1 and subtitle p -->\n  </div>\n</body>\n</html>`,
            whatItDoes: "Center content perfectly using flex with justify-content and align-items.",
            check: (code) => {
              return code.includes('display: flex') && code.includes('align-items: center') && code.includes('justify-content: center');
            },
          },
        ],
        quiz: [
          { question: "Which property activates flexbox?", answer: "display: flex", choices: ["display: flex", "flex: true", "layout: flex", "flex-mode: on"] },
          { question: "Which property aligns items horizontally in a flex container?", answer: "justify-content", choices: ["justify-content", "align-items", "flex-direction", "flex-wrap"] },
          { question: "How do you center items both horizontally and vertically with flexbox?", answer: "justify-content: center AND align-items: center", choices: ["justify-content: center AND align-items: center", "margin: auto", "text-align: center AND vertical-align: middle", "position: absolute; top: 50%; left: 50%"] },
          { question: "What does flex-wrap: wrap do?", answer: "Lets items wrap to the next line if there's not enough space", choices: ["Lets items wrap to the next line if there's not enough space", "Makes text bold", "Hides overflow content", "Applies flex to children"] },
          { question: "What does gap: 16px do on a flex container?", answer: "Adds 16px of space between flex items", choices: ["Adds 16px of space between flex items", "Adds 16px padding to all items", "Sets the flex container width", "Creates a 16px border"] },
        ],
      },
    ],
  },

  // ─── MODULE 3: JAVASCRIPT FOR THE WEB ────────────────────────────────────────
  {
    id: "js-for-the-web",
    title: "JavaScript: Make It Interactive",
    icon: "⚡",
    color: "#f7df1e",
    trackId: "webdev",
    lessons: [
      {
        id: "js-variables-functions",
        title: "JS Variables, Functions & Logic",
        xp: 140,
        language: "javascript",
        analogy: "Think of variables as labeled boxes",
        theory: [
          { type: "plain", text: "JavaScript is the language that makes websites respond to you — clicking buttons, submitting forms, showing popups. It runs in the browser, unlike Python which runs on a server. You already know the concepts from Python — variables, functions, conditions — the syntax is just slightly different." },
          { type: "code", label: "JAVASCRIPT", color: "#f7df1e", code: `// Variables (use const or let, not var)\nconst name = "Stanley";  // never changes\nlet age = 35;            // can change\nage = 36;                // reassigned\n\n// Functions\nfunction greet(name) {\n  return "Hello, " + name + "!";\n}\n\n// Arrow functions (modern style)\nconst greet2 = (name) => \`Hello, \${name}!\`;\n\n// Conditions\nif (age >= 18) {\n  console.log("Adult");\n} else {\n  console.log("Minor");\n}` },
          { type: "highlight", text: "const = won't change. let = might change. Never use var. Template literals use backticks: `Hello ${name}` instead of 'Hello ' + name." },
          { type: "list", items: ["const — declare a value that won't be reassigned", "let — declare a value that can change", "Arrow function: const fn = (x) => x * 2", "Template literal: `Hello ${name}`", "=== not == for comparison (checks type too)", "&&, ||, ! for and, or, not"] },
        ],
        hints: [
          "Use console.log() to see values — like Python's print().",
          "Template literals use backtick ` not regular quote. Press the key to the left of 1.",
          "=== is strict equality in JS. Use it instead of == always.",
        ],
        challenges: [
          {
            prompt: "GUIDED: Run this code. See how const, let, functions, and template literals work in JS.",
            starterCode: `const firstName = "Stanley";\nconst lastName = "White";\nlet age = 35;\n\nconst fullName = () => \`\${firstName} \${lastName}\`;\n\nconst introduce = (name, age) => {\n  if (age >= 18) {\n    return \`Hi, I'm \${name} and I'm an adult (\${age} years old).\`;\n  } else {\n    return \`Hi, I'm \${name} and I'm \${age} years old.\`;\n  }\n};\n\nconsole.log(fullName());\nconsole.log(introduce("Stanley", 35));\nconsole.log(introduce("Tom", 15));`,
            whatItDoes: "Shows const, template literals, arrow functions, and if/else all working together.",
            check: (output) => output.includes("Stanley") && output.includes("adult"),
          },
          {
            prompt: "MODIFY IT: Change the firstName and lastName to your name. Then add a third console.log that calls introduce() with a friend's name and age.",
            starterCode: `const firstName = "Stanley";\nconst lastName = "White";\n\nconst fullName = () => \`\${firstName} \${lastName}\`;\n\nconst introduce = (name, age) => {\n  if (age >= 18) {\n    return \`Hi, I'm \${name}, an adult (\${age}).\`;\n  } else {\n    return \`Hi, I'm \${name}, aged \${age}.\`;\n  }\n};\n\nconsole.log(fullName());\nconsole.log(introduce("Stanley", 35));\n// Add your third console.log here`,
            whatItDoes: "Update the variables and add a third function call.",
            check: (output) => {
              const lines = output.split('\n').filter(l => l.trim());
              return lines.length >= 3;
            },
          },
          {
            prompt: "FROM SCRATCH: Write a function called calcTip that takes a bill amount and tip percentage, then returns a template literal string like: 'Bill: $100 | Tip (20%): $20 | Total: $120'. Call it twice with different values.",
            starterCode: `// Write calcTip function here\n\n// Call it twice\nconsole.log(calcTip(100, 20));\nconsole.log(calcTip(75, 15));`,
            whatItDoes: "Build a function that takes two numbers and returns a formatted string.",
            check: (output) => {
              const lines = output.split('\n').filter(l => l.trim());
              return lines.length >= 2 && output.includes('$') && output.includes('%');
            },
          },
        ],
        quiz: [
          { question: "What's the difference between const and let?", answer: "const can't be reassigned; let can", choices: ["const can't be reassigned; let can", "const is faster; let is slower", "const is for strings; let is for numbers", "There is no difference"] },
          { question: "What symbol do you use for strict equality in JavaScript?", answer: "===", choices: ["===", "==", "=", "equals()"] },
          { question: "How do you write a template literal?", answer: "Using backticks: `Hello ${name}`", choices: ["Using backticks: `Hello ${name}`", "Using quotes: 'Hello {name}'", "Using brackets: 'Hello [name]'", "Using plus: 'Hello' + name"] },
          { question: "What is an arrow function?", answer: "A shorter way to write a function: (x) => x * 2", choices: ["A shorter way to write a function: (x) => x * 2", "A function that runs immediately", "A function that never returns", "A function for arrays only"] },
          { question: "What does console.log() do?", answer: "Prints a value to the browser console", choices: ["Prints a value to the browser console", "Saves data to the server", "Sends an email", "Alerts the user"] },
        ],
      },

      {
        id: "dom-manipulation",
        title: "DOM Manipulation: Control the Page",
        xp: 170,
        language: "html",
        analogy: "Think of the DOM as a live document you can edit with code",
        theory: [
          { type: "plain", text: "The DOM (Document Object Model) is how JavaScript sees your HTML. Every tag becomes an object you can grab, change, add, or delete with code. This is how buttons change color when you click them, how forms validate in real time, and how every interactive website works." },
          { type: "code", label: "JAVASCRIPT", color: "#f7df1e", code: `// Grab elements\nconst heading = document.getElementById("title");\nconst btn = document.querySelector(".my-button");\nconst allItems = document.querySelectorAll("li");\n\n// Change content\nheading.textContent = "New Title";\nheading.innerHTML = "<em>New Title</em>";\n\n// Change styles\nheading.style.color = "#00ff88";\nheading.style.fontSize = "32px";\n\n// Change classes\nheading.classList.add("active");\nheading.classList.remove("hidden");\nheading.classList.toggle("highlighted");` },
          { type: "highlight", text: "getElementById grabs one element by ID. querySelector grabs one by any CSS selector. querySelectorAll grabs all matches as a list." },
          { type: "list", items: ["document.getElementById('id') — find by ID", "document.querySelector('.class') — find by CSS selector", "element.textContent = '...' — change text", "element.style.color = '...' — change inline style", "element.classList.toggle('name') — add or remove a class", "element.remove() — delete the element from the page"] },
        ],
        hints: [
          "Put your <script> at the bottom of <body> so the HTML loads before JS runs.",
          "querySelector uses CSS selector syntax: '#id', '.class', 'tag'.",
          "textContent is safer than innerHTML — use innerHTML only when you need actual HTML tags.",
        ],
        challenges: [
          {
            prompt: "GUIDED: Preview this interactive page. Click the button to see JS manipulate the DOM live.",
            starterCode: `<!DOCTYPE html>\n<html>\n<head>\n<style>\n  body { background: #111; color: white; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }\n  h1 { font-size: 40px; transition: all 0.3s; }\n  button { background: #f7df1e; color: #000; border: none; padding: 12px 28px; border-radius: 8px; font-size: 16px; cursor: pointer; font-weight: bold; margin-top: 20px; }\n  .glow { color: #f7df1e; text-shadow: 0 0 20px #f7df1e; }\n</style>\n</head>\n<body>\n  <h1 id="title">Click the Button</h1>\n  <p id="counter">Times clicked: 0</p>\n  <button onclick="handleClick()">Click Me!</button>\n\n  <script>\n    let count = 0;\n    const title = document.getElementById('title');\n    const counter = document.getElementById('counter');\n\n    function handleClick() {\n      count++;\n      counter.textContent = 'Times clicked: ' + count;\n      title.textContent = count % 2 === 0 ? 'Click the Button' : 'You Did It!';\n      title.classList.toggle('glow');\n    }\n  </script>\n</body>\n</html>`,
            whatItDoes: "Clicking the button changes the heading text, toggles a glow class, and updates a counter — all DOM manipulation.",
            check: (code) => code.includes('getElementById') && code.includes('textContent'),
          },
          {
            prompt: "MODIFY IT: Add a second button that changes the page background color when clicked. Give it an onclick that runs a function called changeBackground() which sets document.body.style.background to a random color from an array.",
            starterCode: `<!DOCTYPE html>\n<html>\n<head>\n<style>\n  body { background: #111; color: white; font-family: sans-serif; padding: 40px; transition: background 0.5s; }\n  button { background: #f7df1e; color: #000; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; cursor: pointer; margin: 8px; font-weight: bold; }\n</style>\n</head>\n<body>\n  <h1 id="title">DOM Manipulation</h1>\n  <button onclick="changeTitle()">Change Title</button>\n  <!-- Add your second button here -->\n\n  <script>\n    function changeTitle() {\n      document.getElementById('title').textContent = 'Title Changed!';\n    }\n    // Add changeBackground function here\n    const colors = ['#1a1a2e', '#0a1628', '#2d1b69', '#1a2e1a', '#2e1a1a'];\n  </script>\n</body>\n</html>`,
            whatItDoes: "Add a button and a function that picks a random color from the array for the background.",
            check: (code) => code.includes('changeBackground') && code.includes('body.style.background'),
          },
          {
            prompt: "FROM SCRATCH: Build a simple todo list. An input + button to add items, and each item shows up as a <li> in a <ul>. When you click a list item, it gets a line-through style (strikethrough). Use DOM manipulation throughout.",
            starterCode: `<!DOCTYPE html>\n<html>\n<head>\n<style>\n  body { background: #111; color: white; font-family: sans-serif; padding: 30px; max-width: 400px; }\n  input { width: 70%; padding: 10px; background: #1a1a1a; border: 1px solid #333; color: white; border-radius: 6px; }\n  button { background: #f7df1e; color: #000; border: none; padding: 10px 16px; border-radius: 6px; cursor: pointer; font-weight: bold; margin-left: 8px; }\n  ul { list-style: none; padding: 0; margin-top: 20px; }\n  li { padding: 10px; background: #1a1a1a; border-radius: 6px; margin-bottom: 8px; cursor: pointer; }\n  .done { text-decoration: line-through; color: #555; }\n</style>\n</head>\n<body>\n  <h2>Todo List</h2>\n  <input id="task-input" type="text" placeholder="Add a task...">\n  <button onclick="addTask()">Add</button>\n  <ul id="task-list"></ul>\n\n  <script>\n    function addTask() {\n      // Get input value\n      // Create a new li element\n      // Set its textContent\n      // Add a click listener to toggle 'done' class\n      // Append to the ul\n      // Clear the input\n    }\n  </script>\n</body>\n</html>`,
            whatItDoes: "Build a full interactive todo list using createElement, appendChild, classList.toggle, and event listeners.",
            check: (code) => code.includes('createElement') && code.includes('appendChild') && code.includes('toggle'),
          },
        ],
        quiz: [
          { question: "What does the DOM stand for?", answer: "Document Object Model", choices: ["Document Object Model", "Dynamic Output Method", "Data Object Manager", "Design Output Mode"] },
          { question: "How do you select an element by its CSS class in JavaScript?", answer: "document.querySelector('.className')", choices: ["document.querySelector('.className')", "document.getClass('className')", "document.findByClass('className')", "document.select('.className')"] },
          { question: "What does element.textContent = 'new' do?", answer: "Replaces the text content of the element", choices: ["Replaces the text content of the element", "Adds new text after the element", "Changes the element's class", "Deletes the element"] },
          { question: "What does classList.toggle('active') do?", answer: "Adds 'active' if it's not there; removes it if it is", choices: ["Adds 'active' if it's not there; removes it if it is", "Always adds 'active'", "Always removes 'active'", "Checks if 'active' exists and returns true/false"] },
          { question: "Why should script tags be placed at the bottom of the body?", answer: "So the HTML elements load before the JavaScript tries to access them", choices: ["So the HTML elements load before the JavaScript tries to access them", "Because JavaScript is always slower", "To make the page render faster always", "It doesn't matter where they go"] },
        ],
      },

      {
        id: "fetch-api",
        title: "Fetch & APIs: Get Live Data",
        xp: 200,
        language: "javascript",
        analogy: "Think of an API like a restaurant menu",
        theory: [
          { type: "plain", text: "An API is like a restaurant menu — you ask for something specific (a request), the kitchen makes it (the server processes it), and you get exactly what you ordered (a response). JavaScript's fetch() lets your webpage order data from any API on the internet." },
          { type: "code", label: "JAVASCRIPT", color: "#f7df1e", code: `// Basic fetch with .then() chaining\nfetch('https://api.example.com/data')\n  .then(response => response.json())\n  .then(data => console.log(data))\n  .catch(error => console.log('Error:', error));\n\n// Modern: async/await (cleaner)\nasync function getData() {\n  try {\n    const response = await fetch('https://api.example.com/data');\n    const data = await response.json();\n    console.log(data);\n  } catch (error) {\n    console.log('Error:', error.message);\n  }\n}\n\n// POST request (sending data)\nasync function postData(payload) {\n  const res = await fetch('/api/submit', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify(payload)\n  });\n  return res.json();\n}` },
          { type: "highlight", text: "await only works inside async functions. Always wrap fetch in try/catch to handle network errors. response.json() also returns a Promise — await it too." },
          { type: "list", items: ["fetch(url) — makes an HTTP request", "await response.json() — parses JSON response", "async function — enables await inside it", "try { } catch(e) { } — handles errors", "method: 'POST' + body: JSON.stringify(data) — for sending data", "headers: { 'Content-Type': 'application/json' } — tell server you're sending JSON"] },
        ],
        hints: [
          "fetch() is async — it takes time. Use await or .then() to get the actual data.",
          "response.json() is also async — you need to await it too.",
          "For real APIs, you often need an API key in the headers: 'x-api-key': 'your-key'.",
        ],
        challenges: [
          {
            prompt: "GUIDED: Run this code to fetch a random dad joke from a real public API. No API key needed.",
            starterCode: `async function getJoke() {\n  try {\n    const response = await fetch('https://icanhazdadjoke.com/', {\n      headers: { 'Accept': 'application/json' }\n    });\n    const data = await response.json();\n    console.log('Joke:', data.joke);\n    console.log('Status:', response.status);\n  } catch (error) {\n    console.log('Network error:', error.message);\n    // If CORS blocks it in this runner, that is expected\n    console.log('(API call blocked by sandbox — this is normal)');\n  }\n}\n\ngetJoke();`,
            whatItDoes: "Fetches a random dad joke from a public API using async/await. Shows the joke and HTTP status code.",
            check: (output) => output.toLowerCase().includes('joke') || output.toLowerCase().includes('error') || output.toLowerCase().includes('blocked'),
          },
          {
            prompt: "MODIFY IT: Change the getJoke function to also log 'Fetching joke...' before the fetch, and 'Done!' after. Then call getJoke() 3 times to show it works repeatedly.",
            starterCode: `async function getJoke() {\n  // Add 'Fetching joke...' console.log here\n  try {\n    const response = await fetch('https://icanhazdadjoke.com/', {\n      headers: { 'Accept': 'application/json' }\n    });\n    const data = await response.json();\n    console.log('Joke:', data.joke);\n    // Add 'Done!' console.log here\n  } catch (error) {\n    console.log('Error or CORS block (normal in sandbox)');\n  }\n}\n\n// Call it 3 times\ngetJoke();`,
            whatItDoes: "Add log statements and multiple calls to see the async flow.",
            check: (output) => output.toLowerCase().includes('fetching') && output.toLowerCase().includes('done'),
          },
          {
            prompt: "FROM SCRATCH: Write an async function called buildProfile that accepts a username string, logs 'Looking up: [username]...', then simulates an API response by returning an object { name: username, joined: '2025', level: 'Beginner' } after a fake delay using await new Promise(r => setTimeout(r, 500)), then logs the profile details.",
            starterCode: `async function buildProfile(username) {\n  // Log 'Looking up: [username]...'\n  // Simulate delay: await new Promise(r => setTimeout(r, 500));\n  // Create and return a profile object\n  // Log the profile details\n}\n\nbuildProfile("stanley");\nbuildProfile("coder99");`,
            whatItDoes: "Practice async/await pattern without a real API — simulates async behavior with setTimeout.",
            check: (output) => {
              const lines = output.split('\n').filter(l => l.trim());
              return output.toLowerCase().includes('looking up') && lines.length >= 4;
            },
          },
        ],
        quiz: [
          { question: "What does fetch() return?", answer: "A Promise that resolves to a Response object", choices: ["A Promise that resolves to a Response object", "The JSON data immediately", "A string", "An HTML element"] },
          { question: "Why do you need to call response.json()?", answer: "To parse the response body as JSON (it's also async)", choices: ["To parse the response body as JSON (it's also async)", "To send the data back", "To display it in the browser automatically", "To close the connection"] },
          { question: "What keyword makes a function asynchronous?", answer: "async", choices: ["async", "await", "promise", "fetch"] },
          { question: "What does try/catch do in async code?", answer: "Handles errors from failed fetch calls or other async failures", choices: ["Handles errors from failed fetch calls or other async failures", "Makes the code run faster", "Converts a promise to sync", "Retries failed requests automatically"] },
          { question: "How do you send JSON data in a POST request?", answer: "Set method: 'POST', headers Content-Type: application/json, body: JSON.stringify(data)", choices: ["Set method: 'POST', headers Content-Type: application/json, body: JSON.stringify(data)", "Just add data= to the URL", "Use fetch.post() instead", "Set data: JSON.parse(data)"] },
        ],
      },
    ],
  },

  // ─── MODULE 4: REACT BASICS ──────────────────────────────────────────────────
  {
    id: "react-basics",
    title: "React: Build Modern UIs",
    icon: "⚛️",
    color: "#61dafb",
    trackId: "webdev",
    lessons: [
      {
        id: "react-components",
        title: "React Components & JSX",
        xp: 180,
        language: "react",
        analogy: "Think of components like custom LEGO blocks",
        theory: [
          { type: "plain", text: "React is a JavaScript library for building UIs. Instead of writing one giant HTML file, you break everything into components — small, reusable pieces. A Navbar is a component. A Card is a component. A Button is a component. You snap them together like LEGO." },
          { type: "code", label: "REACT JSX", color: "#61dafb", code: `// A component is a function that returns JSX\nfunction Card({ title, description, color }) {\n  return (\n    <div style={{\n      background: '#1a1a2e',\n      border: \`1px solid \${color}\`,\n      borderRadius: '12px',\n      padding: '20px',\n      marginBottom: '12px'\n    }}>\n      <h3 style={{ color: color }}>{title}</h3>\n      <p style={{ color: '#aaa' }}>{description}</p>\n    </div>\n  );\n}\n\n// App is the root component\nfunction App() {\n  return (\n    <div style={{ padding: '30px', background: '#111', minHeight: '100vh' }}>\n      <h1 style={{ color: '#61dafb' }}>My App</h1>\n      <Card title="HTML" description="Structure" color="#e34c26" />\n      <Card title="CSS" description="Style" color="#264de4" />\n      <Card title="React" description="Interactivity" color="#61dafb" />\n    </div>\n  );\n}` },
          { type: "highlight", text: "JSX looks like HTML inside JavaScript. Components are just functions that return JSX. Props are the inputs you pass to a component — like function arguments." },
          { type: "list", items: ["Component = a function that returns JSX", "JSX = HTML-like syntax inside JavaScript", "Props = the inputs you pass to a component", "{ } in JSX = run JavaScript expressions", "style={{ }} = inline styles as a JS object (camelCase: fontSize, not font-size)", "The App function is the entry point"] },
        ],
        hints: [
          "In JSX, className is used instead of class (class is a reserved word in JS).",
          "Props are destructured in the function signature: function Card({ title, color })",
          "Every component must return a single root element. Wrap in a <div> or <> fragment if needed.",
        ],
        challenges: [
          {
            prompt: "GUIDED: Preview these React components. Notice how one Card component is reused 3 times with different props.",
            starterCode: `function Card({ title, description, icon, color }) {\n  return (\n    <div style={{\n      background: '#1a1a2e',\n      border: \`2px solid \${color}\`,\n      borderRadius: '12px',\n      padding: '20px',\n      marginBottom: '12px',\n      fontFamily: 'sans-serif'\n    }}>\n      <div style={{ fontSize: '28px', marginBottom: '8px' }}>{icon}</div>\n      <h3 style={{ color: color, margin: '0 0 8px 0' }}>{title}</h3>\n      <p style={{ color: '#888', margin: 0, fontSize: '14px' }}>{description}</p>\n    </div>\n  );\n}\n\nfunction App() {\n  return (\n    <div style={{ background: '#0d0d0d', minHeight: '100vh', padding: '30px', maxWidth: '400px', margin: '0 auto' }}>\n      <h1 style={{ color: '#61dafb', fontFamily: 'sans-serif', marginBottom: '20px' }}>My Skills</h1>\n      <Card icon="🌐" title="HTML" description="Structure of the web" color="#e34c26" />\n      <Card icon="🎨" title="CSS" description="Style and layout" color="#264de4" />\n      <Card icon="⚛️" title="React" description="Modern UI components" color="#61dafb" />\n    </div>\n  );\n}`,
            whatItDoes: "Three Card components with different props — same component, different data.",
            check: (code) => code.includes('function Card') && code.includes('function App'),
          },
          {
            prompt: "MODIFY IT: Add a fourth Card with your own title, description, icon emoji, and color. Also add a subtitle below the h1 — a small p tag that says 'My Coding Progress'.",
            starterCode: `function Card({ title, description, icon, color }) {\n  return (\n    <div style={{ background: '#1a1a2e', border: \`2px solid \${color}\`, borderRadius: '12px', padding: '20px', marginBottom: '12px', fontFamily: 'sans-serif' }}>\n      <div style={{ fontSize: '28px', marginBottom: '8px' }}>{icon}</div>\n      <h3 style={{ color: color, margin: '0 0 8px 0' }}>{title}</h3>\n      <p style={{ color: '#888', margin: 0, fontSize: '14px' }}>{description}</p>\n    </div>\n  );\n}\n\nfunction App() {\n  return (\n    <div style={{ background: '#0d0d0d', minHeight: '100vh', padding: '30px' }}>\n      <h1 style={{ color: '#61dafb', fontFamily: 'sans-serif' }}>My Skills</h1>\n      {/* Add a subtitle p here */}\n      <Card icon="🌐" title="HTML" description="Structure" color="#e34c26" />\n      <Card icon="🎨" title="CSS" description="Style" color="#264de4" />\n      <Card icon="⚛️" title="React" description="UI Components" color="#61dafb" />\n      {/* Add your fourth Card here */}\n    </div>\n  );\n}`,
            whatItDoes: "Add a fourth Card and a subtitle to the App component.",
            check: (code) => (code.match(/<Card/g) || []).length >= 4 && code.includes('<p'),
          },
          {
            prompt: "FROM SCRATCH: Write a ProfileCard component that takes name, role, and tagline as props, and displays them styled. Then use it in App with your own details.",
            starterCode: `// Write the ProfileCard component\nfunction ProfileCard({ name, role, tagline }) {\n  // Return JSX with all three props displayed\n  // Style it with a dark background, border, and padding\n}\n\nfunction App() {\n  return (\n    <div style={{ background: '#0d0d0d', minHeight: '100vh', padding: '30px' }}>\n      {/* Use ProfileCard with your own data */}\n    </div>\n  );\n}`,
            whatItDoes: "Build your own component from scratch with props and inline styles.",
            check: (code) => code.includes('function ProfileCard') && code.includes('name') && code.includes('<ProfileCard'),
          },
        ],
        quiz: [
          { question: "What is a React component?", answer: "A JavaScript function that returns JSX", choices: ["A JavaScript function that returns JSX", "An HTML file", "A CSS class", "A database record"] },
          { question: "What are props?", answer: "Inputs passed to a component from its parent", choices: ["Inputs passed to a component from its parent", "Internal component state", "CSS properties", "HTML attributes"] },
          { question: "In JSX, how do you add CSS classes?", answer: "className instead of class", choices: ["className instead of class", "class= like regular HTML", "cssClass=", "style='class-name'"] },
          { question: "How do you output a JavaScript variable inside JSX?", answer: "Wrap it in curly braces: {variableName}", choices: ["Wrap it in curly braces: {variableName}", "Use $ like template literals: $variableName", "Use [[variableName]]", "Use <js>variableName</js>"] },
          { question: "Why are components reusable?", answer: "Because they accept different data via props each time they're used", choices: ["Because they accept different data via props each time they're used", "Because they're written in TypeScript", "Because they use CSS modules", "Because React copies the component automatically"] },
        ],
      },

      {
        id: "react-state",
        title: "useState: Making Things Interactive",
        xp: 190,
        language: "react",
        analogy: "Think of state like a whiteboard that re-draws the screen when you erase and rewrite",
        theory: [
          { type: "plain", text: "Props are read-only — a Card component can't change its own title. But state can change. useState is React's way of remembering things that can update. When state changes, React automatically re-renders the component to show the new value." },
          { type: "code", label: "REACT JSX", color: "#61dafb", code: `import { useState } from 'react';\n// (in this runner, useState comes from React global)\n\nfunction Counter() {\n  // useState returns [currentValue, setterFunction]\n  const [count, setCount] = useState(0);\n  const [name, setName] = useState("World");\n\n  return (\n    <div>\n      <h1>Hello, {name}!</h1>\n      <p>Count: {count}</p>\n\n      <button onClick={() => setCount(count + 1)}>\n        Increment\n      </button>\n\n      <input\n        value={name}\n        onChange={(e) => setName(e.target.value)}\n        placeholder="Enter your name"\n      />\n    </div>\n  );\n}` },
          { type: "highlight", text: "const [value, setValue] = useState(initialValue) — the pattern every React developer uses every day. Never modify state directly — always use the setter function." },
          { type: "list", items: ["useState(0) — initial value is 0", "[count, setCount] — destructuring the array useState returns", "setCount(count + 1) — update state with new value", "Never do: count = count + 1 — this bypasses React", "onChange={(e) => setValue(e.target.value)} — input handling pattern", "State change → React re-renders the component automatically"] },
        ],
        hints: [
          "useState always returns an array of two items: [currentValue, setterFunction].",
          "setCount(prev => prev + 1) is safer than setCount(count + 1) when doing rapid updates.",
          "One component can have multiple useState calls — one for each piece of state.",
        ],
        challenges: [
          {
            prompt: "GUIDED: Preview this counter with three different state variables. Click the buttons to see React re-render on each state change.",
            starterCode: `const { useState } = React;\n\nfunction App() {\n  const [count, setCount] = useState(0);\n  const [name, setName] = useState('Coder');\n  const [darkMode, setDarkMode] = useState(true);\n\n  const theme = {\n    background: darkMode ? '#0d0d0d' : '#f5f5f5',\n    color: darkMode ? '#e0e0e0' : '#111',\n    padding: '30px',\n    minHeight: '100vh',\n    fontFamily: 'sans-serif',\n    transition: 'all 0.3s'\n  };\n\n  return (\n    <div style={theme}>\n      <button\n        onClick={() => setDarkMode(!darkMode)}\n        style={{ background: darkMode ? '#fbbf24' : '#1a1a2e', color: darkMode ? '#000' : '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', marginBottom: '20px' }}>\n        {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}\n      </button>\n\n      <h1>Hello, {name}! 👋</h1>\n      <input\n        value={name}\n        onChange={(e) => setName(e.target.value)}\n        placeholder="Enter your name"\n        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #333', background: darkMode ? '#1a1a1a' : '#fff', color: darkMode ? '#fff' : '#111', marginBottom: '20px', display: 'block' }}\n      />\n\n      <div style={{ fontSize: '48px', marginBottom: '12px' }}>{count}</div>\n      <div style={{ display: 'flex', gap: '8px' }}>\n        <button onClick={() => setCount(c => c - 1)} style={{ background: '#e34c26', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '18px' }}>−</button>\n        <button onClick={() => setCount(0)} style={{ background: '#555', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>Reset</button>\n        <button onClick={() => setCount(c => c + 1)} style={{ background: '#00ff88', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '18px' }}>+</button>\n      </div>\n    </div>\n  );\n}`,
            whatItDoes: "Three state variables: count (number), name (string), darkMode (boolean). Each updates independently on user interaction.",
            check: (code) => (code.match(/useState/g) || []).length >= 3,
          },
          {
            prompt: "MODIFY IT: Add a fourth state variable called message (initially 'Keep going!'). Add a button that changes message to 'You're doing great!' when count reaches 10. Display the message below the counter.",
            starterCode: `const { useState } = React;\n\nfunction App() {\n  const [count, setCount] = useState(0);\n  const [name, setName] = useState('Coder');\n  // Add message state here\n\n  return (\n    <div style={{ background: '#0d0d0d', color: '#e0e0e0', padding: '30px', fontFamily: 'sans-serif', minHeight: '100vh' }}>\n      <h1>Hello, {name}!</h1>\n      <input value={name} onChange={(e) => setName(e.target.value)} style={{ padding: '8px', background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '6px', marginBottom: '20px', display: 'block' }} />\n      <div style={{ fontSize: '48px', marginBottom: '12px' }}>{count}</div>\n      {/* Display message here */}\n      <div style={{ display: 'flex', gap: '8px' }}>\n        <button onClick={() => setCount(c => c - 1)} style={{ background: '#e34c26', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>−</button>\n        <button onClick={() => setCount(c => c + 1)} style={{ background: '#00ff88', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>+</button>\n      </div>\n      {/* Button to change message */}\n    </div>\n  );\n}`,
            whatItDoes: "Add a new state variable and a button that conditionally updates it.",
            check: (code) => (code.match(/useState/g) || []).length >= 3 && code.includes('message'),
          },
          {
            prompt: "FROM SCRATCH: Build a tip calculator component. State: billAmount (number input), tipPercent (buttons for 10%, 15%, 20%). Display: tip amount, total. Format: 'Tip: $X.XX | Total: $X.XX'.",
            starterCode: `const { useState } = React;\n\nfunction App() {\n  // bill state (number, start at 0)\n  // tipPercent state (number, start at 15)\n\n  // Calculate tip and total\n\n  return (\n    <div style={{ background: '#0d0d0d', color: '#e0e0e0', padding: '30px', fontFamily: 'sans-serif', minHeight: '100vh', maxWidth: '400px', margin: '0 auto' }}>\n      <h2 style={{ color: '#00ff88' }}>Tip Calculator</h2>\n      {/* Bill input */}\n      {/* Tip % buttons: 10, 15, 20 */}\n      {/* Display tip amount and total */}\n    </div>\n  );\n}`,
            whatItDoes: "Build a real-world calculator using multiple useState hooks and derived values.",
            check: (code) => (code.match(/useState/g) || []).length >= 2 && code.includes('tip') && code.toLowerCase().includes('total'),
          },
        ],
        quiz: [
          { question: "What does useState return?", answer: "An array with [currentValue, setterFunction]", choices: ["An array with [currentValue, setterFunction]", "Just the current value", "An object with value and update", "A Promise"] },
          { question: "Why should you use the setter function instead of directly modifying state?", answer: "So React knows to re-render the component", choices: ["So React knows to re-render the component", "Because it's faster", "Because directly modifying causes syntax errors", "Because setter functions encrypt the data"] },
          { question: "What is the initial value of useState(false)?", answer: "false (boolean)", choices: ["false (boolean)", "null", "0", "undefined"] },
          { question: "Which pattern correctly increments a count safely?", answer: "setCount(prev => prev + 1)", choices: ["setCount(prev => prev + 1)", "count = count + 1", "setCount(count++)", "count.update(+1)"] },
          { question: "When does React re-render a component?", answer: "When its state or props change", choices: ["When its state or props change", "Every second automatically", "Only when the page reloads", "Only when the user clicks"] },
        ],
      },
    ],
  },

  // ─── MODULE 5: DEPLOYMENT ───────────────────────────────────────────────────
  {
    id: "deployment",
    title: "Deploy & Ship It Live",
    icon: "🚀",
    color: "#00c896",
    trackId: "webdev",
    lessons: [
      {
        id: "git-basics",
        title: "Git & GitHub: Track Your Code",
        xp: 140,
        language: "javascript",
        analogy: "Think of Git like a save system in a video game",
        theory: [
          { type: "plain", text: "Git is a version control system — it tracks every change you make to your code. Think of it as a video game save system. Every commit is a save point. If you break something, you can rewind to any earlier save. GitHub is where you store those saves online and share them." },
          { type: "code", label: "TERMINAL", color: "#00c896", code: `# Initialize a new Git repo in your project folder\ngit init\n\n# See what's changed since last commit\ngit status\n\n# Stage files for commit\ngit add .           # all files\ngit add index.html  # specific file\n\n# Save a commit (a snapshot)\ngit commit -m "Add homepage with nav and hero section"\n\n# Connect to GitHub and push\ngit remote add origin https://github.com/you/project.git\ngit push -u origin main` },
          { type: "highlight", text: "The workflow is always: git add → git commit → git push. Every commit message should describe WHAT you did in plain English." },
          { type: "list", items: ["git init — start tracking a folder", "git status — see what changed", "git add . — stage all changes", "git commit -m 'message' — save a snapshot", "git push — upload to GitHub", "git pull — download latest from GitHub", "git log — see all past commits"] },
        ],
        hints: [
          "Commit messages should explain WHAT changed, not HOW: 'Add contact form' not 'Updated code'.",
          "git add . stages everything. For precision, name specific files: git add index.html style.css",
          "Never commit .env files or API keys — they contain secrets.",
        ],
        challenges: [
          {
            prompt: "GUIDED: Run these simulated Git commands and see the workflow output.",
            starterCode: `// Simulate a Git workflow\nconst gitWorkflow = () => {\n  const steps = [\n    { cmd: 'git init', output: 'Initialized empty Git repository in /my-project/.git/' },\n    { cmd: 'git status', output: 'Untracked files:\\n  index.html\\n  style.css\\n  script.js' },\n    { cmd: 'git add .', output: 'Files staged for commit.' },\n    { cmd: 'git commit -m "Initial commit: homepage with nav and hero"', output: '[main (root-commit) a3f7c91] Initial commit: homepage with nav and hero\\n 3 files changed, 142 insertions(+)' },\n    { cmd: 'git push origin main', output: 'Enumerating objects: 4, done.\\nCounting objects: 100%\\nWriting objects: 100%\\nBranch main set up to track remote branch main from origin.' },\n  ];\n\n  steps.forEach(({ cmd, output }) => {\n    console.log('$ ' + cmd);\n    console.log(output);\n    console.log('');\n  });\n};\n\ngitWorkflow();`,
            whatItDoes: "Shows the complete init → add → commit → push workflow with realistic terminal output.",
            check: (output) => output.includes('git init') && output.includes('git commit'),
          },
          {
            prompt: "MODIFY IT: Add a 6th step to the workflow array simulating a second commit: run git add, then git commit -m 'Add contact form and footer' after making changes.",
            starterCode: `const gitWorkflow = () => {\n  const steps = [\n    { cmd: 'git init', output: 'Initialized empty Git repository.' },\n    { cmd: 'git add .', output: 'Files staged.' },\n    { cmd: 'git commit -m "Initial commit"', output: '[main a3f7c91] Initial commit\\n3 files changed' },\n    { cmd: 'git push origin main', output: 'Branch set up to track origin/main.' },\n    // Add step 5: git add for new changes\n    // Add step 6: git commit with new message\n  ];\n\n  steps.forEach(({ cmd, output }) => {\n    console.log('$ ' + cmd);\n    console.log(output);\n  });\n};\n\ngitWorkflow();`,
            whatItDoes: "Add a second commit to show the ongoing commit workflow.",
            check: (output) => {
              const commitCount = (output.match(/git commit/g) || []).length;
              return commitCount >= 2;
            },
          },
          {
            prompt: "FROM SCRATCH: Write a function that takes a list of file changes and 'generates' a git status summary, then logs what you'd need to run. Input: ['index.html modified', 'style.css new', 'old-code.js deleted']. Output: the git commands to run.",
            starterCode: `function generateGitPlan(changes) {\n  // Log the changes\n  console.log('Changes detected:');\n  // For each change, log it\n\n  // Log the git commands to run\n  console.log('\\nRun these commands:');\n  // git add .\n  // git commit -m with a message describing the changes\n  // git push\n}\n\ngenerateGitPlan(['index.html modified', 'style.css new', 'old-code.js deleted']);`,
            whatItDoes: "Build a function that reads change descriptions and outputs a git workflow plan.",
            check: (output) => output.includes('git add') && output.includes('git commit') && output.includes('git push'),
          },
        ],
        quiz: [
          { question: "What does git commit do?", answer: "Saves a snapshot of your staged changes", choices: ["Saves a snapshot of your staged changes", "Uploads to GitHub immediately", "Creates a new branch", "Deletes old files"] },
          { question: "What does git add . do?", answer: "Stages all changed files for the next commit", choices: ["Stages all changed files for the next commit", "Uploads everything to GitHub", "Creates a commit", "Shows what changed"] },
          { question: "What is GitHub used for?", answer: "Storing your Git repos online and sharing code", choices: ["Storing your Git repos online and sharing code", "Running your code on a server", "A code editor", "A database"] },
          { question: "Why should you write descriptive commit messages?", answer: "To easily understand what changed when reviewing history", choices: ["To easily understand what changed when reviewing history", "Because GitHub requires it for billing", "To increase your commit count", "Because it speeds up the push"] },
          { question: "What should you NEVER commit to GitHub?", answer: "API keys and .env files containing secrets", choices: ["API keys and .env files containing secrets", "CSS files", "README files", "Images"] },
        ],
      },

      {
        id: "deploy-vercel",
        title: "Deploy to Vercel: Your Site Goes Live",
        xp: 160,
        language: "javascript",
        analogy: "Think of Vercel as a parking lot for your website",
        theory: [
          { type: "plain", text: "Building locally is only half the job. Your clients and users can't visit localhost:3000 on their phone. Vercel is a hosting platform — it takes your code from GitHub and puts it on the actual internet, on a real URL, in under 2 minutes. For free." },
          { type: "code", label: "TERMINAL", color: "#00c896", code: `# Option 1: Deploy via Vercel CLI\nnpm install -g vercel\nvercel         # login and deploy\n               # → https://your-project.vercel.app\n\n# Option 2: GitHub auto-deploy (recommended)\n# 1. Push your code to GitHub\n# 2. Go to vercel.com → Import Project\n# 3. Connect your GitHub repo\n# 4. Click Deploy\n# Every future git push auto-deploys!\n\n# Environment variables (API keys, etc.)\n# → Vercel Dashboard → Settings → Environment Variables\n# NEVER put secrets in your code — use env vars` },
          { type: "highlight", text: "The best workflow: code locally → git push to GitHub → Vercel auto-deploys. Every push = new deployment. No extra steps." },
          { type: "list", items: ["vercel.com — free hosting for frontend + serverless functions", "vercel.json — configure build commands and redirects", "Environment variables — set secret keys in Vercel dashboard, never in code", "Preview deployments — every PR gets its own preview URL", "Custom domain — connect your own domain for free", "Vercel Functions — serverless API endpoints (like api/chat.js)"] },
        ],
        hints: [
          "Set environment variables in Vercel dashboard, never commit them to code.",
          "vercel.json controls build settings. For React: buildCommand: 'npm run build', outputDirectory: 'build'",
          "Every git push to main triggers a new deployment automatically once connected.",
        ],
        challenges: [
          {
            prompt: "GUIDED: Run this to see what a typical Vercel deployment log looks like and understand what each step means.",
            starterCode: `const deploymentLog = [\n  { time: '0.0s', event: 'Building...', detail: 'npm ci --legacy-peer-deps' },\n  { time: '12.3s', event: 'Build succeeded', detail: 'npm run build → dist/ (892 KB)' },\n  { time: '12.4s', event: 'Uploading assets', detail: '47 static files' },\n  { time: '13.1s', event: 'Deploying functions', detail: 'api/chat.js, api/test.js' },\n  { time: '14.2s', event: '✅ Deployment complete', detail: 'https://my-app.vercel.app' },\n];\n\nconsole.log('=== VERCEL DEPLOYMENT LOG ===\\n');\ndeploymentLog.forEach(({ time, event, detail }) => {\n  console.log(\`[\${time}] \${event}\`);\n  console.log(\`        → \${detail}\`);\n});\n\nconsole.log('\\nDeployment took 14.2 seconds.');\nconsole.log('Your app is live at: https://my-app.vercel.app');`,
            whatItDoes: "Shows what a real Vercel deployment sequence looks like — build, upload, deploy, live URL.",
            check: (output) => output.includes('Deployment complete') && output.includes('vercel.app'),
          },
          {
            prompt: "MODIFY IT: Add environment variable validation to the log. After the deployment log, write a function that checks if required env vars are set and logs warnings for missing ones. Test with: checkEnvVars(['ANTHROPIC_API_KEY', 'SUPABASE_URL', 'STRIPE_SECRET'])",
            starterCode: `const deployLog = ['Build succeeded', '✅ Deployed to https://my-app.vercel.app'];\n\ndeployLog.forEach(msg => console.log(msg));\n\n// Write checkEnvVars function here\n// It receives an array of required variable names\n// Simulate: ANTHROPIC_API_KEY is set, others are not\n// Log: '✅ ANTHROPIC_API_KEY found' or '❌ SUPABASE_URL missing — add in Vercel dashboard'\n\ncheckEnvVars(['ANTHROPIC_API_KEY', 'SUPABASE_URL', 'STRIPE_SECRET']);`,
            whatItDoes: "Build an env var checker that logs pass/fail for each required variable.",
            check: (output) => output.includes('✅') && output.includes('❌') && output.includes('missing'),
          },
          {
            prompt: "FROM SCRATCH: Write a function called prepareForDeploy(projectName, envVars, hasTests) that logs a pre-deployment checklist: project name, whether tests pass, whether env vars are configured, a generated vercel.json config, and the git commands to run.",
            starterCode: `function prepareForDeploy(projectName, envVars, hasTests) {\n  // Log: '=== Deploy Checklist: [projectName] ==='\n  // Log: tests status\n  // Log: env var count\n  // Log: the vercel.json you'd create (as a string)\n  // Log: the git commands to run\n}\n\nprepareForDeploy('my-portfolio', ['ANTHROPIC_API_KEY', 'SUPABASE_URL'], true);`,
            whatItDoes: "Generate a complete deployment checklist programmatically.",
            check: (output) => output.toLowerCase().includes('checklist') && output.includes('vercel') && output.includes('git push'),
          },
        ],
        quiz: [
          { question: "What happens when you push to GitHub after connecting your repo to Vercel?", answer: "Vercel automatically deploys the new version", choices: ["Vercel automatically deploys the new version", "You need to manually trigger a deploy", "The site goes offline temporarily", "Nothing happens until you pay"] },
          { question: "Where should you store API keys when deploying to Vercel?", answer: "In Vercel's Environment Variables dashboard — never in code", choices: ["In Vercel's Environment Variables dashboard — never in code", "In a .env file committed to GitHub", "Hardcoded in the JavaScript source", "In the URL parameters"] },
          { question: "What is a serverless function on Vercel?", answer: "A file in the api/ folder that runs as a backend endpoint", choices: ["A file in the api/ folder that runs as a backend endpoint", "A function that runs without electricity", "A JavaScript class with no methods", "A React component with no state"] },
          { question: "What does vercel.json configure?", answer: "Build commands, output directory, rewrites, and headers", choices: ["Build commands, output directory, rewrites, and headers", "The site's color scheme", "User authentication rules", "The database schema"] },
          { question: "What is the main advantage of Vercel's free tier?", answer: "Free hosting with automatic HTTPS, CDN, and auto-deploys from GitHub", choices: ["Free hosting with automatic HTTPS, CDN, and auto-deploys from GitHub", "Unlimited server CPU forever", "Built-in database storage", "Free domain names"] },
        ],
      },
    ],
  },
];

export default WEB_DEV_CURRICULUM;
