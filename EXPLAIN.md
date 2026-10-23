# Celestius website: interview cheat-sheet

A rebuild of celestius.in using only **HTML, CSS and JavaScript**. There are no frameworks, libraries or build tools.
Open `index.html` in any browser to run it.

---

## 1. The big idea (say this first)

> "I built the theme around the **club's own logo colours: black, yellow (#FFCC00) and white**.
> 'Celestius' sounds like *celestial*, so the design is a night sky: twinkling white and yellow stars,
> a glowing yellow planet, and constellations. Yellow is used for everything important
> (buttons, highlights, the call-to-action block), so your eye goes straight to it."

## 2. File structure

| File | What it does |
|---|---|
| `index.html` | Home: hero, about, what we do, stats, featured events, call to action |
| `pages/events.html` | Counters, a scrolling ticker, a "bento" grid of the 3 flagship events, and event "tickets" with filter buttons |
| `pages/team.html` | Team cards (placeholder names). The Domain leads use `.grid-center`: flexbox with `flex-wrap: wrap` and `justify-content: center`, so the 2 cards on the last row sit in the middle (CSS Grid would always put them on the left) |
| `pages/recruitment.html` | 7 role cards that open/close + application form |
| `pages/contact.html` | Contact details + contact form |
| `css/style.css` | **One** stylesheet for all pages, split into 20 numbered sections |
| `js/main.js` | **One** script for all pages, split into 15 small functions |
| `js/events-data.js` | All the event details for the pop-up, as one JavaScript object (`EVENT_DETAILS`). Loaded on Home and Events, **before** `main.js` |

**Folders:** `index.html` stays in the main folder (the browser and web hosts look for it there first). The other 4 pages live in `pages/`, so their paths go **up one folder first** with `../`. For example, `../css/style.css` and `../index.html`. Links from the home page go **into** the folder: `pages/events.html`. In `main.js`, the active nav link compares only the file name (the last part after `/`), and the pop-up's "Join the team" button borrows the Recruitment link from the navbar, so both work from either folder.

**Why one CSS and one JS file?** Every page shares the same navbar, footer and styles, so the code is written once and reused.
Every JS function starts with `if (!element) return;`, so a function quietly does nothing on pages that don't need it.

### Logo images (`images/` folder)
| File | Where it's used |
|---|---|
| `images/logo.png` | The official yellow "celestius" wordmark, in the navbar and footer of every page |
| `images/logo-icon.png` | The round logo mark: the browser tab icon (`<link rel="icon">`), the loader centre, and the floating hero badge on Home |
| `images/hephaestus.png` | Statue of **Hephaestus** (god of the forge), taken from the old website. Right side of the Home hero |
| `images/athena.png` | Statue of **Athena** (goddess of wisdom & strategy), taken from the old website. Left side of the "Want to know more about us?" section |
| `images/hephaestus-gold.png`, `images/athena-gold.png` | **Gold copies** of the two statues, used for the hover effect. I made them by recolouring every white line to the logo yellow `#FFCC00` and keeping the transparent background |
| `images/who-team.jpg`, `who-banner.jpg`, `who-hackathon.jpg`, `who-speak.jpg`, `who-fun.jpg` | **Real event photos** from the old website's gallery, used in the "Who we are" photo constellation. I cropped them to squares and shrank them to about 50 KB each |

**"Who we are": the photo constellation:**
- 5 real Celestius photos are placed like **stars**, joined by glowing yellow lines, like a constellation in the sky.
- **Placing them:** each `<figure>` gets CSS variables in its `style`, like `--x:40%; --y:38%; --size:40%`.
  CSS uses `left: var(--x); top: var(--y); width: var(--size)`, and `translate: -50% -50%` makes that point the photo's *centre*.
  The box is a square (`aspect-ratio: 1`) and the SVG is 500 × 500, so 40% = 200 and the lines meet the photo centres exactly.
- **Round photos:** `.photo-frame` has `border-radius: 50%` + `overflow: hidden`, and the image uses `object-fit: cover`, so it fills the circle without stretching.
- **Theme look:** photos are black and white (`filter: grayscale(1)`) with a yellow layer on top using `mix-blend-mode: color`, which gives them a yellow tint.
- **Entrance:** when you scroll to it, the lines draw themselves. Each line has `pathLength="100"`, so one `stroke-dashoffset: 100 → 0` animation fits all of them.
  Then the photos pop in one by one (`@keyframes photoPop`, delay `calc(var(--i) * 0.15s)`).
- **Idle:** a dashed ring slowly spins around each photo, like an orbit (`::before` + `@keyframes spin`).
- **Hover:** the photo comes to the front, grows (`scale(1.12)`), glows, turns **full colour** (the filter and the yellow layer are removed),
  zooms in slightly inside its circle, and shows a caption. The other photos get darker using
  `.constellation:has(.sky-photo:hover) .sky-photo:not(:hover) img`. `:has()` means "the box that has a hovered photo inside it".

**The statues:**
- **Layout:** CSS Grid with columns `7fr 5fr` (hero: text, then Hephaestus) and `5fr 7fr` (Athena, then text).
  On phones it becomes one column, and Athena gets `order: 2` so she moves *below* her text.
- **Transparent PNGs:** white line drawings with no background, so they sit straight on the black page.
  I shrank them from 2 MB to about 330 KB each so the page loads fast.
- **The key trick is `clip-path: inset(top right bottom left)`.** It cuts away part of an element.
  `inset(100% 0 0 0)` cuts away 100% from the top, so nothing shows. `inset(0 0 0 0)` cuts nothing, so everything shows.
  Animating between the two uncovers the image **from the bottom up**.
- **Entrance, the "scan":** each statue starts fully cut away. When it comes on screen, `revealOnScroll()` adds the `visible` class.
  `@keyframes scanReveal` then animates the clip-path to uncover it, while a glowing yellow line (`::after`, `@keyframes scanLine`)
  moves from `bottom: 0` to `bottom: 100%` at exactly the same speed, so it looks like it's being scanned in.
  Hephaestus has `.scan-late`, which sets the variable `--scan-delay: 0.5s` so he starts just after the intro doors open.
- **Idle:** the statue floats gently (`@keyframes statueFloat`), and a yellow aura behind it (`::before` with a `radial-gradient`) grows and shrinks (`@keyframes auraPulse`).
- **Hover: the gold fill.** Two images are stacked: the white statue, and the gold copy exactly on top (`position: absolute; top: 0; left: 0`).
  The gold one starts at `clip-path: inset(100% 0 0 0)`, and on hover it changes to `inset(0 0 0 0)` with a `transition`,
  so the gold fills up from the feet to the head. At the same time:
  - the images lift up (`translateY(-12px)`)
  - the aura glows brighter
  - a name plate ("Athena · Goddess of Wisdom") fades in and slides up. On touch screens it's always shown, because there's no hover.
- **No JavaScript is needed for the hover.** It's all CSS (`:hover` + `transition`). JavaScript only adds `visible` for the entrance.

> "I kept the club's real logo so the brand stays the same. Only the theme around it is new.
> On the Home page the logo mark floats (`@keyframes float`) while a yellow planet in the logo's own colour
> (`#FFCC00`) orbits it. That's a dashed ring that spins (`@keyframes spin`), with a dot drawn by `::before`."

### Footer social icons (LinkedIn, Instagram, GitHub, WhatsApp)
- The icons are **inline SVGs** written straight into the HTML (LinkedIn "in", Instagram camera, GitHub cat, WhatsApp bubble).
- The SVGs use `fill="currentColor"` / `stroke="currentColor"`, which means "use the CSS `color` of my parent".
  So changing `color` on the link recolours the icon. They're grey normally (`color: var(--text-soft)`).
- **On hover each button turns into the brand's real logo.** Each link stores its real logo colours in 3 CSS variables:

  | Icon | `--brand-bg` (background) | `--brand-icon` (symbol) |
  |---|---|---|
  | LinkedIn | `#0A66C2` blue | white |
  | Instagram | `radial-gradient(...)` yellow, orange, pink, purple, blue | white |
  | GitHub | white | `#181717` black |
  | WhatsApp | `#25D366` green | white |

  One shared hover rule uses them: `background: var(--brand-bg); color: var(--brand-icon);`.
  I used `background` (not `background-color`) so it also accepts Instagram's gradient.
  `background-origin: border-box` makes the gradient fill under the border too, so there are no thin lines at the edges.
- On hover the button also glows in the brand colour (`box-shadow`), bounces up (`translateY(-4px)`), and the symbol grows (`scale(1.12)`).

### Events page design
The page has 4 parts, from top to bottom:

1. **Title + counters.** The counters reuse the Home page's `animateCounters()`: 3 flagship events, 8 events, 2 Takshashila editions.
2. **Ticker.** A strip of event names sliding sideways forever.
   - The names are written **twice** in the HTML. The track moves left by exactly `-50%` (one copy) and then restarts, so the loop has no visible jump.
   - `mask-image` with a gradient fades the names out at the edges.
   - Every other name is an outline, using `-webkit-text-stroke`.
   - Hovering pauses it (`animation-play-state: paused`).
3. **"The big three": a bento grid.**
   - `grid-template-columns: 1.3fr 1fr`, and the PromptVerse tile has `grid-row: span 2`, so it's tall and the other two stack beside it.
   - The tiles use real artwork from the old website: the PromptVerse logo, the Deadlock cover, and a stage photo for Takshashila.
   - The PromptVerse cover stacks 4 layers: a darkened photo, a sliding yellow grid (two repeating `linear-gradient` lines with `@keyframes gridMove`), a yellow glow, and the floating logo.
   - **Hover:** the tile lifts and glows, the cover zooms (`scale(1.08)` inside `overflow: hidden`), and a **beam of light sweeps across**. The beam is a see-through white stripe (`::after`, tilted with `skewX`) that moves from `left: -75%` to `left: 125%`.
4. **Workshops & competitions: event tickets.**
   - Each ticket has a **stub** with the icon and a sideways label (`writing-mode: vertical-rl`), a **dashed tear line** (`border-right: 2px dashed`), and two round **notches**. The notches are `::before` / `::after` circles in the page's background colour, sitting half outside the ticket.
   - **Hover:** the stub fills with yellow, the icon jumps (a "bouncy" `cubic-bezier`), and the ticket lifts and tilts slightly.
   - The filter buttons (All / Workshops / Competitions) still use `filterEvents()`.

Every tile and ticket has `data-event`, so clicking it opens the same event pop-up (`setupEventModal()`).

## 3. CSS concepts to mention

- **CSS variables** (`:root { --bg: #0A0A0A; --accent: #FFCC00; }`). The whole colour theme lives in one place.
  The names describe the colour's *job* (background, text, accent), not the colour itself. That's why I could
  switch the whole site from a light theme to this dark one mostly by changing these values.
- **Fonts:** *Unbounded* (bold, wide, techy) for headings and *Poppins* for body text, both from Google Fonts.
- **Flexbox** for the navbar and buttons. **Grid** for card layouts.
  `grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))` fits as many columns as there is room for, so it's responsive without extra code.
- **`clamp()`** for font sizes, so headings grow with the screen but have a minimum and a maximum.
- **`position: sticky`** keeps the navbar at the top. **`backdrop-filter: blur()`** gives it the frosted-glass look.
- **Pseudo-elements `::before` / `::after`** draw decorations without extra HTML: the nav underline, the card top bar, the planet ring and the avatar ring.
- **Media queries** (`@media (max-width: 720px)`) switch to the mobile layout and the hamburger menu.
- **`prefers-reduced-motion`** turns animations off for people who get motion sickness (accessibility).

## 4. Animations: how each one works

### Pure CSS
| Animation | How |
|---|---|
| Loader ring orbit | A dashed circle (`::before`) spins around the loading ring with `@keyframes spin` |
| Title letters rising | Each letter is a `<span style="--i:3">`. `animation-delay: calc(var(--i) * 0.08s)` makes them rise one after another |
| Moving background | The gradient is 4× bigger than the screen (`background-size: 400%`), and `background-position` is animated |
| Floating planets | `@keyframes float` moves them up and down with `translateY`. Different delays stop them moving together |
| Card hover | `transition` + `transform: translateY(-8px) rotate(-1deg)` and a bigger shadow |
| Nav underline | The `::after` line goes from `width: 0` to `width: 100%` on hover |
| Button "ink drop" hover | Colour spreads out like a drop of ink **from the exact point where the mouse enters**, and shrinks back towards where it leaves. `::before` is a big circle at `left: var(--x); top: var(--y)` that grows from `scale(0)` to `scale(1)`. `overflow: hidden` cuts it to the button shape, and `z-index: -1` with `isolation: isolate` keeps it behind the text. `buttonInkDrop()` in main.js uses `getBoundingClientRect()` to save the mouse point as `--x`/`--y`. It listens on the whole `document`, so buttons made later by JS (in the pop-up) work too. `::after` is a slanted white shine that sweeps across, the button lifts on hover and squeezes (`scale(0.95)`) on click. Each kind of button only sets 2 variables: `--fill` (ink colour) and `--fill-text`. Yellow button → black ink with yellow text; outline and filter buttons → yellow ink with black text; the black button in the yellow box → white ink. The back-to-top button glows and keeps jumping (`@keyframes arrowJump`) |
| Photo constellation lines | SVG lines use `stroke-dasharray` / `stroke-dashoffset` with `pathLength="100"`. The offset animates from 100 to 0, so the line looks like it's being drawn |
| Form error shake | `@keyframes shake` moves the field left and right |

### JavaScript (`js/main.js`)
| Function | How it works |
|---|---|
| `runIntroLoader()` | The **"launch sequence"** intro. (1) **Warp stars** on a `<canvas>`: each star has x, y and a depth z. Every frame z gets smaller (the star comes closer), and dividing x and y by z pushes close stars out to the edges. A line from the old position to the new one draws the speed streak. (2) A **percentage** goes up by 1 every 20ms with `setInterval`. It stops at 90% until the real `load` event fires, so it never says 100% too early. The ring fills using `stroke-dashoffset = 100 - percent` (`pathLength="100"`), and the status message changes every 30%. (3) At 100% it adds `launch` (logo grows, stars go to hyper-speed), then `open`: a yellow line flashes across the middle and two half-screen "doors" slide up and down (`translateY(±100%)`), then the loader is removed. **Full intro only once per visit:** `sessionStorage` remembers it until the tab is closed, so other pages only open the doors. **Click or any key skips it.** While `<body>` has `is-loading`, a CSS rule pauses every other animation (`animation-play-state: paused`). The loader then fires a custom `loaderdone` event, and `whenIntroDone()` starts the typewriter, counters and scroll reveals only after it |
| `createStarCanvas()` | Draws stars on a `<canvas>`. Each star has x, y, size and alpha. `requestAnimationFrame` redraws about 60 times a second. Alpha going up and down makes the twinkle. It measures each star's distance from the mouse (Pythagoras), and stars closer than 140px get a line, like a constellation |
| `revealOnScroll()` | An `IntersectionObserver` notices when an element enters the screen and adds `visible`. A CSS transition fades it in. Once it has appeared, the reveal classes are removed so hover effects work normally |
| `animateCounters()` | Reads `data-target="7"` and counts from 0 to the target over 1.5 seconds |
| `typeWriter()` | Shows `word.substring(0, charIndex)`, adds a letter each step, pauses, deletes, then moves to the next word. `%` loops back to the first word |
| `cursorSparkle()` | On `mousemove`, creates a `✦` span at the mouse position (at most one every 50ms). CSS fades it out, then JS removes it |
| `setupMobileMenu()` | Toggles the `open` class on the hamburger and the links. It also updates `aria-expanded` for screen readers |
| `highlightActiveNav()` | Reads the file name from `location.pathname` and marks the matching link `active` |
| `filterEvents()` | Each button has `data-filter`, each ticket has `data-category` (`workshop` or `competition`). Tickets that don't match get the `hide` class |
| `toggleRoleCards()` | Clicking a card closes all the others and opens it. CSS animates `max-height` from 0 |
| `validateForms()` | `preventDefault()` stops the page reloading. It checks for empty fields, then the email (regex) and phone (10 digits). It shows an error under each wrong field, or a success message |
| `scrollProgressBar()` | `scrollY / (scrollHeight - innerHeight) * 100` becomes the bar width |
| `backToTop()` | Shows after 400px of scrolling. `scrollTo({ top: 0, behavior: "smooth" })` |
| `setupEventModal()` | The event pop-up. Each event card has `data-event="deadlock"`, and that key looks up the details in `EVENT_DETAILS` (in `js/events-data.js`). It builds the pop-up HTML with template strings, puts it in `.modal-content`, and adds the `open` class, so CSS fades in the dark background and springs the box up (`translateY` + `scale`). The timeline steps slide in one by one using `--i` for the delay. It closes with the ×, a click on the background, or Esc (`keydown` + `e.key === "Escape"`). `body.modal-open` stops the page behind from scrolling. Cards also get `tabindex="0"` and `role="button"`, so keyboard users can open them with Enter or Space, and focus goes back to the card on close |

## 5. Likely questions & answers

- **Why no React or Bootstrap?** "To show I understand the basics that every framework is built on: the DOM, events, CSS layout and animation."
- **How is it responsive?** "Grid `auto-fit`, `clamp()` font sizes, and media queries at 860px and 720px for the hamburger menu."
- **Does the form send data?** "Not yet. It's front-end validation only. The next step would be connecting it to a backend API or a service like Google Forms."
- **Why IntersectionObserver and not a scroll event?** "The browser tells us when an element appears, so we don't run code on every scroll pixel. It's faster."
- **Accessibility?** "Semantic tags (`header`, `nav`, `main`, `footer`), `aria-label`s on icon buttons, `aria-expanded` on the menu, labels on every input, and reduced-motion support."
- **What would you improve?** "Real team photos, real event dates, a backend for the forms, and a dark-mode toggle."

## 6. Things to update with real info

- `pages/team.html`: replace "Member Name" / "MN" with real names and initials.
- `index.html`: the "100+ Active members" stat (`data-target="100"`) is a placeholder.
- `pages/events.html` / `js/events-data.js`: all 8 events and their pop-up details come from the old celestius.in website. Add new events by adding a card with a new `data-event` key and a matching entry in `EVENT_DETAILS`.
