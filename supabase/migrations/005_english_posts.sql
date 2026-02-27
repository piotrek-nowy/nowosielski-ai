-- English translations of existing blog posts

insert into public.posts (
  title,
  slug,
  content,
  excerpt,
  cover_image_url,
  category,
  lang,
  published,
  published_at,
  created_at,
  updated_at
) values
(
  'Vibe coding — day 1',
  'vibe-coding-day-1',
  $$<p>For the past few weeks I kept thinking about finally stopping the talk about what AI can and can't do in programming, and actually trying to build something "on my own."</p>
<p>Over the weekend I put together a paper manual/handbook called "programming with AI" to finally prepare for launching my first solo online project using an AI-native tech stack.</p>
<p>Essentially, I spent several hours talking to Claude Opus 4.6, asking how to start coding with AI, what tech stack to pick, how to install everything, set up hosting, connect a domain, use GitHub, and what a repository even is.</p>
<p>He explained, and I kept asking, digging deeper, trying to make sense of it all.</p>
<p>I asked about the best possible AI tech stack. Plus a dead-simple, explain-it-like-I'm-five guide on how to use all these tools, with a glossary of several dozen terms at the end (including what HTML is, what a commit is, pull request, git, GitHub, library… there's quite a lot of it… let's say I'm taking a very school-like approach. Back to basics. :)</p>
<p>And so the manual came together — over 30 pages. I printed it out, started reading and following it step by step, asking Claude about everything along the way.</p>
<h2>What I got done on day one, in a few steps</h2>
<ol>
<li><strong>Buying a domain: Cloudflare</strong> — enough of home.pl… I went with the extravagant nowosielski.ai, mainly because other combinations of my name were already on company hosting and I didn't feel like using those.</li>
<li><strong>Hosting: Vercel</strong> — gives off a strong AI/startup vibe. Still had to sort out DNS etc.</li>
<li><strong>Installations: git, Node.js, Cursor IDE, Claude Code</strong> — had to do it from the Mac terminal, which wasn't the easiest thing for me, especially since I'd never launched stuff like this before, except maybe when I accidentally hit some random key combo.</li>
<li><strong>GitHub account</strong> — stores code in the cloud, manages versions (I still don't fully know what that means), and serves as the source for Vercel. What's more, everything connected so that I got automatic deploys from GitHub.</li>
<li><strong>Launching Cursor on Mac and connecting all these tools together</strong> (Vercel, GitHub, Cloudflare) — turns out they're already so well integrated that everything basically works with a single click.</li>
<li><strong>Creating an "initial prompt"</strong> defining what I want to build — which Claude also helped prepare. I described what sections I want on the site and what it should be — in short, just a homepage.</li>
<li><strong>Dropped that initial prompt into an agent running in Cursor</strong> — this was actually funny, because I was a bit hesitant to paste it in for the first time and see how it all works. It took a few good minutes, but it spat out the first version of the site. I pushed it a bit with changes, then learned my first commands: <code>git add</code> + <code>git commit</code> with a description of the change + <code>git push</code> to send it off.</li>
<li><strong>At this point I finally connected the live domain to Vercel.</strong> Waited a moment and nowosielski.ai went live.</li>
<li><strong>My first commit appeared</strong> in my GitHub repository under the profile piotrek_nowy.</li>
<li><strong>I tweaked the site a bit</strong> — played with the visual layer, moved columns around, changed the font, simplified the concept, and at the end added a blog section — but without Supabase yet. And that wrapped up day 1. 5.5 hours total.</li>
</ol>
<p>—</p>
<p>I'd call it a successful and fairly smooth start. I don't understand much about the tools I'm using, but thanks to AI it went like reading IKEA instructions for a moderately complex piece of furniture.</p>$$,
  'For the past few weeks I kept thinking about finally stopping the talk about what AI can and can''t do in programming, and actually trying to build something on my own. Over the weekend I put together a paper manual for programming with AI, spent hours talking to Claude Opus 4.6 about tech stacks, installations, hosting, and GitHub. Printed a 30-page handbook and got started. Domain purchase, Vercel, installations, first prompt in Cursor, first commit, deploy — 5.5 hours and nowosielski.ai went live.',
  null,
  'Dziennik',
  'en',
  true,
  '2026-02-23T12:00:00+00:00',
  '2026-02-23 12:00:00+00',
  '2026-02-23 12:00:00+00'
),
(
  'Projects on the agenda',
  'projects-on-the-agenda',
  $$<p>Overnight my brain kept working and I was thinking about what else I'd like to build, to test various possibilities of vibe coding and how everything connects — integrating external tools or creating them "on my own." Woke up in the morning and wrote down a dozen or so topics. Some seem simple, some a bit more complex, but everything looks achievable. We'll see.</p>
<h2>What I'd like to build next</h2>
<ol>
<li>Hook up a feed from my X after setting up a developer account on the platform</li>
<li>Set up a blog on Supabase with login and a text editor — figure out what that's all about</li>
<li>A notebook (behind login) in Airtable style: what I worked on, task duration, and difficulty level</li>
<li>Connect the blog to a newsletter that auto-sends every new post — build the automation</li>
<li>A simple Calendly for scheduling a call with me, with automatic Google Calendar integration</li>
<li>Some simple games: snake, minesweeper, solitaire</li>
<li>Maybe more complex games like chess with different board skins</li>
<li>Chess with the option to play against me online asynchronously (after registration)</li>
<li>Integrate with some external API</li>
<li>Add payments for purchasing something</li>
</ol>
<h2>Industry-specific ideas</h2>
<ol>
<li>Data visualizations based on data from our job boards via the Snowflake API</li>
<li>Build my own browser extension for something, e.g. scraping job listings</li>
<li>Something for e-learning, like a mini-course generator from a YouTube link</li>
<li>Build a job market news aggregator</li>
<li>Build a simple CV generator</li>
</ol>
<h2>Much more complex structures</h2>
<ol>
<li>Our internal TomHRM — leave management for the company</li>
<li>A mini educational platform with courses based on provided materials</li>
</ol>
<p>That's all that comes to mind for now. I'll keep updating this list in future versions of this file.</p>
<h2>Expectations for the pace</h2>
<p>If I could spend 1 day (5h) on each topic from list 1–10 (so 10 topics × 5h = 50h) and three working days on industry topics (5 topics × 15h = 75h), I'd need about 125h total. I'm not even counting the much larger projects here time-wise — that's just too big a scope.</p>
<p>So we're looking at roughly end of quarter, assuming an optimistic and very ambitious pace of 5h per day. If I could learn a decent amount in 130h then why not. Given that I'll probably get stuck on some topics for hours — I already got frustrated when I mistyped a command because I didn't use the right number of dashes — I suspect the problems will grow exponentially with these tasks. If I finish list 1–10 by end of quarter, I'll be satisfied. I'll chronicle everything here and add it to the notebook (point 3) regarding time tracking.</p>
<p>—</p>
<p>I'm curious how I'll need to build this to connect all these elements directly on one site. I want to create everything in one place, to better understand how to build somewhat more complex structures and how to do vibe coding that makes sense even for more complex topics. So we're building this Frankenstein… :)</p>
<p>Stay tuned!</p>$$,
  'Overnight my brain kept working and in the morning I wrote down a dozen projects I want to build while learning vibe coding. From hooking up an X feed, through a Supabase blog, newsletter, games, online chess, payments, to data visualizations from job boards and a CV generator. All on one site — we''re building a Frankenstein.',
  null,
  'AI',
  'en',
  true,
  '2026-02-24T12:00:00+00:00',
  '2026-02-24 12:00:00+00',
  '2026-02-24 12:00:00+00'
);
