import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { email, name } = await req.json()
  
  await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${Deno.env.get("SENDGRID_KEY")}`,
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email, name: name || "Student" }] }],
      from: { email: "stanleywhiteiii87@gmail.com", name: "CodeGrind" },
      subject: "Welcome to CodeGrind 🚀",
      content: [{
        type: "text/html",
        value: `<div style="font-family:monospace;max-width:600px;margin:0 auto;background:#080808;color:#e0e0e0;padding:40px;border-radius:12px"><h1 style="color:#00ff88">CODEGRIND</h1><h2>Welcome${name ? ", " + name : ""}! 🎉</h2><p style="color:#aaa">Your progress is saved to the cloud. Pick up where you left off on any device.</p><a href="https://Hulk11b3.github.io/codegrind" style="display:inline-block;background:#00ff88;color:#000;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:bold;margin:16px 0">Continue Learning →</a><p style="color:#444;font-size:12px;margin-top:32px">Built by Stanley White — Griffin, GA</p></div>`
      }]
    })
  })

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
  })
})
