-- English translations of all existing blog posts

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
  'For the past few weeks I kept thinking about finally stopping the talk about what AI can''t do in programming, and actually trying to build something on my own. Over the weekend I put together a paper manual for programming with AI, spent hours talking to Claude Opus 4.6 about tech stacks, installations, hosting, and GitHub. Printed a 30-page handbook and got started. Domain purchase, Vercel, installations, first prompt in Cursor, first commit, deploy — 5.5 hours and nowosielski.ai went live.',
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
),
(
  'deploy...redeploy...',
  'deploy-redeploy',
  $$<p>Managed to add the X feed... I won't lie, it took a while and cost me quite a few nerves yesterday. It was supposed to display, but it didn't. Claude would say it's fine, then when I pasted the next errors, he'd correct himself. I think I needed about 15 iterations... all of it done through Vercel, which yesterday really didn't want to cooperate — the site wouldn't launch at all to do the Redeploy.</p><p>On top of that, it was my first time dealing with Twitter API keys, which could be used in two ways — either through a Developer Account on X, or through a publicly available widget.</p><p>I tried both, and at the end of the day it turned out you have to pay Elon 5 USD to actually use it. At least that's how I understood it.</p><p>Got it done — took about 2-3 hours, but it worked.</p><p>Next up I'm tackling Supabase and the idea of not pasting blog content into Cursor, but doing it in a civilized way through some kind of minimalist CMS.</p><p>new updates soon.</p>$$,
  'I''m facing the reality of being a "programmer" — the frustration when something was supposed to work but doesn''t, hunting for details and bugs in code I leave to AI. At least every error gets interpreted and translated into specific fixes...',
  null,
  'Random',
  'en',
  true,
  '2026-02-25T11:06:34.251+00:00',
  '2026-02-25 11:06:34.251+00',
  '2026-02-25 11:06:34.251+00'
),
(
  'hooked up Supabase',
  'hooked-up-supabase',
  $$<p>It was quite a bit of work. I had to configure it all over again, set up various keys that allow Supabase to communicate with my site where the articles are supposed to land. Plus I had to add new <strong>Environment Variables in Vercel. We already had X, now Supabase joined.</strong></p><p>I didn't even notice when AI improved the design of the admin panel on its own. Before, it looked like someone coded it on a calculator — now it's clean and elegant.</p><p>The next problem was setting up password reset — actually more work than creating the CMS itself. Had to swap out the reset links in Supabase, and apparently I had 2FA set up too.</p><p>For now, every error or log message I consult with Claude, who directly tells me what to change in the code in Cursor — he basically writes the specific commands to paste into Cursor to make changes. Cursor does it and then I just tell it to commit to production. It adds the comment on GitHub itself and gets going.</p><p>So let's move on to the next topic... a mini Airtable-style tool where I can manage my backlog in a more refined way. Let's see how it goes.</p>$$,
  'Created my own mini-CMS with a login panel, password recovery, and content management for blog posts published here. Turned out well. A taste of what you''d call a management system. Most importantly, I''m glad I learned a new tool — Supabase.',
  null,
  'Dziennik',
  'en',
  true,
  '2026-02-25T11:36:05.26+00:00',
  '2026-02-25 11:36:05.26+00',
  '2026-02-25 11:36:05.26+00'
),
(
  'my own Airtable — easier than I thought',
  'my-own-airtable-easier-than-i-thought',
  $$<p>All it took was a well-described initial prompt together with Claude Code for this task, and basically Cursor with Opus did the entire rest in one go. I created a new database with specific columns in Supabase, plus a few visual tweaks afterwards, and just like that — a new mini-project became reality.</p><p>Now anyone can easily track the pace of work I've set for myself, what I've completed, and how long it took.</p><p>P.S. I wrote this post as a test for the next task — newsletter automation, publishing directly from this blog to Substack, pulled in by n8n, which posts the full content to my profile there and then sends out the mailing.</p><p>Let's see if it works... topic in progress... although I'm already tired. These few hours of writing with Claude Code, copying, calibrating, setting up webhooks etc... it's genuinely exhausting.</p><p>I'm starting to understand why programmers like sitting in basements working on complex topics...</p>$$,
  'The next task on my list was building my own private Airtable with all tasks — meant to be my to-do list, but more refined, with difficulty levels and actual completion times. Managed to do it in basically an hour. Zero problems.',
  null,
  'Dziennik',
  'en',
  true,
  '2026-02-25T17:38:49.11+00:00',
  '2026-02-25 17:38:49.11+00',
  '2026-02-25 17:38:49.11+00'
),
(
  'I built two games: Snake and Minesweeper',
  'i-built-two-games-snake-and-minesweeper',
  $$<p>My friend Wojtek Więckiewicz dropped by — he sublets a desk from us (though honestly he's on vacation more than he's at work). Since it was his birthday, we chatted longer and I showed him what I've been up to. Partly for laughs, I wanted to fire up something bigger to demo how Claude Code works, and I said I'd try to make a game.</p><p>Turns out it knocked out Snake in 15 minutes, which really only needed one fix — making sure the screen doesn't scroll when you use the arrow keys. Wow.</p><p>I decided to keep the momentum going — the next game in line was Minesweeper.</p><p>There were more problems here, although initially it did generate the Minesweeper grid. With full logic, but the cells wouldn't reveal. Then when they did reveal, it didn't account for win/lose conditions, and I had to correct it a bit. At the end, some polishing to make it look good, including the win/loss screens.</p><p>And that's how Minesweeper came to be. About an hour.</p>$$,
  'I thought it would take much longer, that Cursor with Claude Code would struggle and sweat, but it turns out these were by far the easiest tasks of all so far. Nothing to configure, zero Supabase setup or API key work.',
  null,
  'AI',
  'en',
  true,
  '2026-02-25T22:24:39.186+00:00',
  '2026-02-25 22:24:39.186+00',
  '2026-02-25 22:24:39.186+00'
),
(
  'chess in 30 minutes',
  'chess-in-30-minutes',
  $$<p>Chess is my thing. I like playing chess online, so I thought maybe I'd be able to create it. I mean, not me — but AI. And it was simple; no configuration needed, no databases. It found a chess engine on its own, assembled the logic, chose the board types, and even suggested time intervals for the chess clock.</p><p>It basically did everything on its own. It took a few iterations in Claude to describe more deeply what it should involve. I also added a certain extravagance — reading quotes from famous chess players that would display somewhere in the background. It handled that too, so overall I'm impressed.</p><p>It came out easily and I think I need to revisit the roadmap, because things are moving way too fast...</p>$$,
  'I thought creating a more complex game like chess would be significantly harder for Cursor and Claude Code. I wanted not just a board and chess pieces, but timed games, play against the computer, and multiple board skins. Turns out it''s simple with a good initial prompt.',
  null,
  'AI',
  'en',
  true,
  '2026-02-26T09:09:34.166+00:00',
  '2026-02-26 09:09:34.166+00',
  '2026-02-26 09:09:34.166+00'
),
(
  'running 3 agents in parallel now',
  'running-3-agents-in-parallel',
  $$<p>Honestly, all the tasks I've set for myself are so simple so far that maybe I just need to raise the bar.</p><p>For now, just by a centimeter — by starting changes in multiple places simultaneously and doing more than one deploy at a time. Vercel handles it.</p><p>We'll see how Claude Code with Cursor does on more complex tasks, but I can't wait to add other agents with different capabilities beyond just changing things in code in parallel. That's the interesting part.</p><p>But easy does it — I'm basically just getting started. Fourth day, it's Thursday, 10:20 AM. So I'll knock out these tasks and then build the next level of abstraction.</p>$$,
  'I''m gaining more and more confidence using Cursor and Claude Code. Running vibe coding in parallel on multiple tasks, not just one at a time, so things simply move faster. Before I was doing one task at a time because I wanted to make sure nothing breaks, but I see it handles it fine — time to pick up the pace.',
  null,
  'Bootstrap',
  'en',
  true,
  '2026-02-26T09:21:36.775+00:00',
  '2026-02-26 09:21:36.775+00',
  '2026-02-26 09:21:36.775+00'
),
(
  'Winamp, solitaire and a new roadmap',
  'winamp-solitaire-and-a-new-roadmap',
  $$<p>Yesterday I built another game for fun — solitaire. Then I also added Winamp to the homepage as a joke, playing only one track — tryb on. The hardest part about Winamp was finding the mp3 with that track; I ended up hooking up the audio from YouTube.</p><p>Today I'll still set up the newsletter connected to my blog posts. I'm dropping Substack because you can't hook automation into it — it effectively blocks it, and you'd have to hack it through cookies. So I'll pick a different provider.</p><p><strong>Which direction am I taking the roadmap?</strong></p><p>I want to start building things that are actually useful for our business. The ceiling is very far away.</p><p><strong>What implications will this have for our business?</strong></p><p>Only good ones. We're starting to talk a lot more about how to code with AI. No more gatekeepers to a black box I don't understand. I expect a several-fold acceleration in building things in our core business within a quarter.</p><p>Coming back to the point — I don't know yet what I'll want to do next with vibe coding. I'll probably use the Snowflake API for our job board data to visualize it for us. I want to see what can be done with it, because I keep hearing there's some problem with extracting data. We'll see...</p><p><strong>Time to switch Tryb:ON not just on Winamp...</strong></p>$$,
  'Basically all the tasks I prepared are so trivial that there''s no point continuing with them. Sounds bold for 4 days of vibe coding experience, but if the hardest part was configuring databases, n8n automations, or checking API keys in Vercel — something''s up. Time to change the plan to something more ambitious.',
  null,
  'Dziennik',
  'en',
  true,
  '2026-02-27T09:01:09.612+00:00',
  '2026-02-27 09:01:09.612+00',
  '2026-02-27 09:01:09.612+00'
);
