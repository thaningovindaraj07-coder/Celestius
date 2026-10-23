/* =========================================================
   CELESTIUS - main.js
   One JavaScript file shared by every page.

   Every feature is written as its own small function.
   Each function first checks if the element it needs exists
   on the current page. If not, it simply stops (return).
   That is why the same file works on all 5 pages.

   Features:
    1. runIntroLoader()      - "launch sequence" intro while the site loads
    2. createStarCanvas()    - twinkling stars + constellation lines
    3. revealOnScroll()      - sections fade in when scrolled to
    4. animateCounters()     - numbers count up (Home page)
    5. typeWriter()          - typing text effect (Home page)
    6. cursorSparkle()       - little stars follow the mouse
    7. setupMobileMenu()     - hamburger menu on phones
    8. highlightActiveNav()  - underlines the current page link
    9. filterEvents()        - category buttons (Events page)
   10. toggleRoleCards()     - open/close role cards (Recruitment page)
   11. validateForms()       - checks form inputs (Contact & Recruitment)
   12. scrollProgressBar()   - bar at the top shows scroll progress
   13. backToTop()           - button to jump back to the top
   14. setupEventModal()     - click an event card to see its details in a pop-up
  15. buttonInkDrop()       - button hover colour grows from the mouse point
   ========================================================= */


/* This is true if the user turned on "reduce motion" in their
   device settings. We use it to skip heavy animations. */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


/* Runs "callback" once the intro loader has finished (right away if it already has).
   Used so animations at the top of the page don't play hidden behind the loader. */
function whenIntroDone(callback) {
  if (document.body.classList.contains("is-loading")) {
    document.addEventListener("loaderdone", callback, { once: true });
  } else {
    callback();
  }
}


/* ---------- 1. INTRO LOADER ("launch sequence") ----------
   1. Warp-speed stars fly out from the middle of the screen (canvas).
   2. A percentage counts up and fills the ring around the logo.
      It only goes up to 90% until the page has REALLY loaded ("load" event),
      so it never says 100% too early.
   3. At 100%: "launch" (stars speed up), then "open" (the doors slide away).
   The full intro plays once per visit. On the next pages only the doors open.
   Clicking or pressing a key skips the intro. */
function runIntroLoader() {
  const loader = document.querySelector(".loader");
  if (!loader) {
    document.body.classList.remove("is-loading");
    return;
  }

  const numberEl = loader.querySelector(".loader-number");
  const ring = loader.querySelector(".ring-progress");
  const statusEl = loader.querySelector(".loader-status");
  const canvas = loader.querySelector(".loader-warp");

  let pageLoaded = document.readyState === "complete";
  let progress = 0;
  let launched = false;
  let warpSpeed = 4;      // how fast the stars fly towards us
  let warpRunning = true;

  window.addEventListener("load", function () {
    pageLoaded = true;
  });

  // sessionStorage remembers things until the browser tab is closed.
  // (try/catch: some browsers block it in private mode)
  let seenIntro = false;
  try {
    seenIntro = sessionStorage.getItem("celestiusIntro") === "seen";
    sessionStorage.setItem("celestiusIntro", "seen");
  } catch (error) {
    // storage not available: just show the full intro
  }

  // --- Last step: open the doors and show the website ---
  function openDoors() {
    loader.classList.add("open");
    document.body.classList.remove("is-loading"); // un-pause the page animations

    // Tell other functions (like typeWriter) that the intro is finished
    document.dispatchEvent(new Event("loaderdone"));

    // After the doors have slid away, remove the loader completely
    setTimeout(function () {
      warpRunning = false;
      loader.remove();
    }, 1300);
  }

  // --- QUICK mode: already seen the intro, or "reduce motion" is on ---
  if (seenIntro || reduceMotion) {
    loader.classList.add("quick");
    if (pageLoaded) {
      openDoors();
    } else {
      window.addEventListener("load", openDoors);
    }
    return;
  }

  // --- Warp-speed stars ---
  // Each star has a position (x, y) and a depth (z). Every frame z gets smaller,
  // so the star comes closer. Dividing x and y by z makes close stars spread out
  // towards the edges, which looks like flying through space.
  const ctx = canvas.getContext("2d");
  let stars = [];

  function resizeWarp() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function newStar() {
    return {
      x: (Math.random() - 0.5) * canvas.width,
      y: (Math.random() - 0.5) * canvas.height,
      z: Math.random() * canvas.width,
      yellow: Math.random() < 0.25   // 1 in 4 stars is yellow
    };
  }

  resizeWarp();
  window.addEventListener("resize", resizeWarp);
  for (let i = 0; i < 300; i++) {
    stars.push(newStar());
  }

  function drawWarp() {
    if (!warpRunning) return;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stars.forEach(function (star, index) {
      const oldZ = star.z;
      star.z -= warpSpeed;

      // The star flew past us: start a new one far away
      if (star.z <= 1) {
        stars[index] = newStar();
        stars[index].z = canvas.width;
        return;
      }

      // Where the star is on screen now, and where it was a moment ago.
      // Drawing a line between them gives the "speed streak".
      const x = cx + (star.x / star.z) * cx;
      const y = cy + (star.y / star.z) * cy;
      const oldX = cx + (star.x / (oldZ + warpSpeed * 2)) * cx;
      const oldY = cy + (star.y / (oldZ + warpSpeed * 2)) * cy;

      const closeness = 1 - star.z / canvas.width; // 0 = far away, 1 = very close
      ctx.strokeStyle = star.yellow
        ? "rgba(255, 204, 0, " + closeness + ")"
        : "rgba(255, 255, 255, " + closeness + ")";
      ctx.lineWidth = closeness * 2.5;
      ctx.beginPath();
      ctx.moveTo(oldX, oldY);
      ctx.lineTo(x, y);
      ctx.stroke();
    });

    requestAnimationFrame(drawWarp);
  }

  drawWarp();

  // --- Percentage counter ---
  const messages = [
    "Loading the stars...",
    "Aligning the constellations...",
    "Waking up the builders...",
    "Ready for launch!"
  ];

  function showProgress() {
    numberEl.textContent = progress;
    ring.style.strokeDashoffset = 100 - progress; // fills the ring (it is 100 long)
    // 0-29% = message 0, 30-59% = message 1, 60-89% = message 2, 90%+ = message 3
    statusEl.textContent = messages[Math.min(Math.floor(progress / 30), 3)];
  }

  // --- 100%: launch! ---
  function launch() {
    if (launched) return; // only once
    launched = true;
    clearInterval(timer);

    progress = 100;
    showProgress();
    loader.classList.add("launch");
    warpSpeed = 40;  // hyper-speed!

    setTimeout(openDoors, 600);
  }

  // Every 20ms add 1%. Stop at 90% until the page has finished loading.
  const timer = setInterval(function () {
    if (progress >= 90 && !pageLoaded) return; // wait for the real page
    progress++;
    showProgress();
    if (progress >= 100) launch();
  }, 20);

  // Skip: click anywhere or press any key
  loader.addEventListener("click", launch);
  document.addEventListener("keydown", function skipOnKey() {
    launch();
    document.removeEventListener("keydown", skipOnKey);
  });
}


/* ---------- 2. STAR CANVAS ----------
   A <canvas> is like a drawing board. We draw small dots (stars)
   on it many times per second to create animation.
   - Each star slowly fades in and out (twinkles)
   - Each star drifts slowly
   - Stars close to the mouse get joined with lines,
     like a constellation in the sky */
function createStarCanvas() {
  const canvas = document.getElementById("star-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d"); // the "pen" we draw with
  let stars = [];
  const mouse = { x: null, y: null };   // mouse position (null = not on page)

  // Make the canvas the same size as the browser window
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    makeStars();
  }

  // Create a list of star objects with random positions
  function makeStars() {
    stars = [];
    // Fewer stars on small screens so phones stay fast
    const count = Math.floor((canvas.width * canvas.height) / 9000);

    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.6 + 0.4,     // size between 0.4 and 2
        alpha: Math.random(),                  // transparency (0 to 1)
        twinkleSpeed: Math.random() * 0.015 + 0.003,
        dx: (Math.random() - 0.5) * 0.15,      // slow sideways drift
        dy: (Math.random() - 0.5) * 0.15,      // slow up/down drift
        // About 1 in 4 stars is yellow (logo colour), the rest are white
        color: Math.random() < 0.25 ? "255, 204, 0" : "255, 255, 255"
      });
    }
  }

  // Draw one frame of the animation
  function draw() {
    // Clear the old frame first
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < stars.length; i++) {
      const star = stars[i];

      // Twinkle: change transparency, reverse direction at 0 and 1
      star.alpha += star.twinkleSpeed;
      if (star.alpha >= 1 || star.alpha <= 0.1) {
        star.twinkleSpeed = -star.twinkleSpeed;
      }

      // Move the star, and wrap around when it leaves the screen
      star.x += star.dx;
      star.y += star.dy;
      if (star.x < 0) star.x = canvas.width;
      if (star.x > canvas.width) star.x = 0;
      if (star.y < 0) star.y = canvas.height;
      if (star.y > canvas.height) star.y = 0;

      // Draw the star as a small circle
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(" + star.color + ", " + star.alpha * 0.8 + ")";
      ctx.fill();

      // Constellation: draw a line from the mouse to nearby stars
      if (mouse.x !== null) {
        const distX = star.x - mouse.x;
        const distY = star.y - mouse.y;
        const distance = Math.sqrt(distX * distX + distY * distY); // Pythagoras

        if (distance < 140) {
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(star.x, star.y);
          // Closer stars get a stronger line
          ctx.strokeStyle = "rgba(255, 204, 0, " + (1 - distance / 140) * 0.6 + ")";
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // Ask the browser to call draw() again before the next screen refresh (~60 times/second)
    requestAnimationFrame(draw);
  }

  // Keep track of the mouse
  window.addEventListener("mousemove", function (event) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  });

  window.addEventListener("mouseout", function () {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener("resize", resizeCanvas);

  resizeCanvas();

  if (reduceMotion) {
    // Draw the stars once, but don't animate them
    mouse.x = null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(function (star) {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(" + star.color + ", 0.5)";
      ctx.fill();
    });
  } else {
    draw();
  }
}


/* ---------- 3. REVEAL ON SCROLL ----------
   IntersectionObserver tells us when an element enters the screen.
   Then we add the "visible" class, and the CSS transition plays.
   This is much better than checking the scroll position all the time. */
function revealOnScroll() {
  // .scan-reveal = the statues on the Home page (their "scan" animation starts on "visible")
  const elements = document.querySelectorAll(".reveal, .constellation, .scan-reveal");
  if (elements.length === 0) return;

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const el = entry.target;
        el.classList.add("visible");
        observer.unobserve(el); // only animate once

        // After the reveal is finished, remove the reveal classes.
        // This lets the card's own hover animation work normally.
        if (el.classList.contains("reveal")) {
          el.addEventListener("transitionend", function () {
            el.classList.remove("reveal", "reveal-left", "reveal-right", "visible");
          }, { once: true });
        }
      }
    });
  }, { threshold: 0.15 }); // 15% of the element must be visible

  // Start watching after the intro loader, so things at the top of the page
  // don't reveal themselves hidden behind it
  whenIntroDone(function () {
    elements.forEach(function (el) {
      observer.observe(el);
    });
  });
}


/* ---------- 4. COUNTERS ----------
   Numbers like "7" start at 0 and count up when they appear.
   The final number is stored in the HTML: data-target="7" */
function animateCounters() {
  const counters = document.querySelectorAll(".stat-number");
  if (counters.length === 0) return;

  function countUp(counter) {
    const target = Number(counter.dataset.target); // reads data-target
    const suffix = counter.dataset.suffix || "";   // e.g. "+"
    const duration = 1500;                         // milliseconds
    const startTime = performance.now();

    function update(now) {
      // progress goes from 0 to 1 over the duration
      const progress = Math.min((now - startTime) / duration, 1);
      counter.textContent = Math.floor(progress * target) + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        countUp(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  // Wait for the intro loader, so the counting isn't hidden behind it
  whenIntroDone(function () {
    counters.forEach(function (counter) {
      observer.observe(counter);
    });
  });
}


/* ---------- 5. TYPEWRITER ----------
   Types a word letter by letter, waits, deletes it,
   then moves to the next word. Repeats forever. */
function typeWriter() {
  const element = document.querySelector(".typewriter");
  if (!element) return;

  const words = ["Innovate.", "Build.", "Collaborate."];
  let wordIndex = 0;   // which word we are on
  let charIndex = 0;   // how many letters are showing
  let deleting = false;

  function step() {
    const currentWord = words[wordIndex];

    if (deleting) {
      charIndex--;
    } else {
      charIndex++;
    }

    // Show only the first "charIndex" letters of the word
    element.textContent = currentWord.substring(0, charIndex);

    let delay = deleting ? 60 : 120; // deleting is faster than typing

    if (!deleting && charIndex === currentWord.length) {
      // Finished typing: pause, then start deleting
      deleting = true;
      delay = 1400;
    } else if (deleting && charIndex === 0) {
      // Finished deleting: go to the next word (loop back with %)
      deleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      delay = 300;
    }

    setTimeout(step, delay);
  }

  if (reduceMotion) {
    element.textContent = words.join(" ");
  } else {
    // Start typing after the intro loader, once the title letters have risen
    whenIntroDone(function () {
      setTimeout(step, 1600);
    });
  }
}


/* ---------- 6. CURSOR SPARKLE ----------
   When the mouse moves, we create a small "✦" at its position.
   CSS makes it fall and fade, then we remove it from the page. */
function cursorSparkle() {
  // Skip on touch screens (no mouse) and for reduced motion
  if (reduceMotion || window.matchMedia("(hover: none)").matches) return;

  let lastTime = 0;

  window.addEventListener("mousemove", function (event) {
    // Only make a sparkle every 50ms, otherwise there would be too many
    const now = Date.now();
    if (now - lastTime < 50) return;
    lastTime = now;

    const sparkle = document.createElement("span");
    sparkle.className = "sparkle";
    sparkle.textContent = "✦";
    sparkle.style.left = event.clientX + "px";
    sparkle.style.top = event.clientY + "px";
    document.body.appendChild(sparkle);

    // Remove it after its animation (0.9s) so the page doesn't fill up
    setTimeout(function () {
      sparkle.remove();
    }, 900);
  });
}


/* ---------- 7. MOBILE MENU ----------
   On small screens the links are hidden. Clicking the hamburger
   button toggles the "open" class, which slides the menu down. */
function setupMobileMenu() {
  const button = document.querySelector(".menu-toggle");
  const links = document.querySelector(".nav-links");
  if (!button || !links) return;

  button.addEventListener("click", function () {
    button.classList.toggle("open");
    links.classList.toggle("open");

    // Tell screen readers if the menu is open or closed
    const isOpen = links.classList.contains("open");
    button.setAttribute("aria-expanded", isOpen);
  });
}


/* ---------- 8. ACTIVE NAV LINK ----------
   Finds which page we are on (e.g. "events.html")
   and adds the "active" class to that link. */
function highlightActiveNav() {
  // location.pathname is like "/Celestius/events.html"
  let currentPage = window.location.pathname.split("/").pop();
  if (currentPage === "") currentPage = "index.html";

  const links = document.querySelectorAll(".nav-links a");
  links.forEach(function (link) {
    // The href can be "pages/events.html" or "../index.html",
    // so we only compare the last part (the file name)
    const linkPage = link.getAttribute("href").split("/").pop();
    if (linkPage === currentPage) {
      link.classList.add("active");
    }
  });
}


/* ---------- 9. EVENT FILTER ----------
   Each button has data-filter="hackathon" (or "all").
   Each event card has data-category="hackathon".
   We hide the cards that don't match the clicked button. */
function filterEvents() {
  const buttons = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".event-card");
  if (buttons.length === 0) return;

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      // Move the "active" style to the clicked button
      buttons.forEach(function (b) {
        b.classList.remove("active");
      });
      button.classList.add("active");

      const filter = button.dataset.filter;

      cards.forEach(function (card) {
        if (filter === "all" || card.dataset.category === filter) {
          card.classList.remove("hide");
          // Small pop-in animation for cards that appear
          card.style.animation = "none";
          card.offsetHeight; // forces the browser to restart the animation
          card.style.animation = "popIn 0.5s ease";
        } else {
          card.classList.add("hide");
        }
      });
    });
  });
}


/* ---------- 10. ROLE CARDS ----------
   Clicking a role card opens it to show details.
   Only one card stays open at a time. */
function toggleRoleCards() {
  const cards = document.querySelectorAll(".role-card");
  if (cards.length === 0) return;

  cards.forEach(function (card) {
    card.addEventListener("click", function () {
      const wasOpen = card.classList.contains("open");

      // Close all cards
      cards.forEach(function (c) {
        c.classList.remove("open");
      });

      // Open the clicked card (unless it was already open)
      if (!wasOpen) {
        card.classList.add("open");
      }
    });
  });
}


/* ---------- 11. FORM VALIDATION ----------
   Works for any <form class="form">.
   - Every field with the "required" attribute must be filled in
   - Email fields must look like an email
   - Phone fields must have 10 digits
   If everything is fine we show a success message.
   (There is no server, so nothing is actually sent.) */
function validateForms() {
  const forms = document.querySelectorAll(".form");
  if (forms.length === 0) return;

  // A simple pattern for emails: something@something.something
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^[0-9]{10}$/;

  // Shows or clears the error message under one field
  function setError(field, message) {
    const group = field.closest(".form-group");
    const errorText = group.querySelector(".error-text");

    if (message) {
      group.classList.add("error");
      errorText.textContent = message;
    } else {
      group.classList.remove("error");
      errorText.textContent = "";
    }
  }

  forms.forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault(); // stop the page from reloading

      let isValid = true;
      const fields = form.querySelectorAll("[required]");

      fields.forEach(function (field) {
        const value = field.value.trim(); // trim removes extra spaces

        if (value === "") {
          setError(field, "This field is required");
          isValid = false;
        } else if (field.type === "email" && !emailPattern.test(value)) {
          setError(field, "Please enter a valid email");
          isValid = false;
        } else if (field.type === "tel" && !phonePattern.test(value)) {
          setError(field, "Please enter a 10 digit phone number");
          isValid = false;
        } else {
          setError(field, "");
        }
      });

      const message = form.querySelector(".form-message");

      if (isValid) {
        const name = form.querySelector("[name='name']").value.trim();
        message.textContent = "Thank you, " + name + "! We have received your details ✦";
        message.classList.add("success");
        form.reset(); // clear all the fields
      } else {
        message.classList.remove("success");
      }
    });

    // Remove the error as soon as the user starts typing again
    form.querySelectorAll("[required]").forEach(function (field) {
      field.addEventListener("input", function () {
        setError(field, "");
      });
    });
  });
}


/* ---------- 12. SCROLL PROGRESS BAR ----------
   progress = how far we scrolled / how far we CAN scroll.
   We turn that into a percentage and use it as the bar width. */
function scrollProgressBar() {
  const bar = document.querySelector(".progress-bar");
  if (!bar) return;

  window.addEventListener("scroll", function () {
    const scrolled = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const percent = maxScroll > 0 ? (scrolled / maxScroll) * 100 : 0;
    bar.style.width = percent + "%";
  });
}


/* ---------- 13. BACK TO TOP ----------
   The button shows after scrolling 400px down.
   Clicking it scrolls smoothly back to the top. */
function backToTop() {
  const button = document.querySelector(".back-to-top");
  if (!button) return;

  window.addEventListener("scroll", function () {
    if (window.scrollY > 400) {
      button.classList.add("show");
    } else {
      button.classList.remove("show");
    }
  });

  button.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}


/* ---------- 14. EVENT POP-UP (MODAL) ----------
   1. Every event card has data-event="key" (e.g. data-event="deadlock").
   2. Clicking the card looks up EVENT_DETAILS[key] (from js/events-data.js).
   3. We build the HTML for the details and put it inside the modal.
   4. Adding the class "open" shows the modal (CSS does the animation).
   It closes with the X button, a click on the dark background, or the Esc key. */
function setupEventModal() {
  const modal = document.getElementById("event-modal");
  const cards = document.querySelectorAll("[data-event]");

  // Stop if this page has no modal, or the event data file is not loaded
  if (!modal || cards.length === 0 || typeof EVENT_DETAILS === "undefined") return;

  const content = modal.querySelector(".modal-content");
  const box = modal.querySelector(".modal-box");
  let lastFocused = null; // the card that opened the modal (focus goes back to it on close)

  // Builds the HTML for one event. We use template strings (`...${value}...`)
  // because they make long pieces of HTML much easier to read.
  // (This is safe because the data is our own, not typed in by users.)
  function buildDetails(event) {
    let html = `
      <div class="modal-header">
        <div class="card-icon bg-yellow">${event.icon}</div>
        <div>
          <span class="tag">${event.tag}</span>
          <h2 class="modal-title">${event.title}</h2>
          <span class="modal-status">${event.status}</span>
        </div>
      </div>
      <p class="modal-summary">${event.summary}</p>`;

    // Quick facts as small boxes
    if (event.info) {
      html += `<div class="modal-info">`;
      event.info.forEach(function (item) {
        html += `<div class="info-box"><span>${item.label}</span><strong>${item.value}</strong></div>`;
      });
      html += `</div>`;
    }

    // Rounds / stages as a timeline. --i is the step number,
    // CSS uses it so the steps appear one after another.
    if (event.steps) {
      html += `<h3 class="modal-heading">How it works</h3><ol class="modal-steps">`;
      event.steps.forEach(function (step, index) {
        html += `
          <li style="--i:${index}">
            <span class="step-label">${step.label}</span>
            <h4>${step.title}</h4>
            <p>${step.text}</p>
          </li>`;
      });
      html += `</ol>`;
    }

    // Topics covered as a list
    if (event.topics) {
      html += `<h3 class="modal-heading">What we covered</h3><ul class="modal-topics">`;
      event.topics.forEach(function (topic, index) {
        html += `<li style="--i:${index}">${topic}</li>`;
      });
      html += `</ul>`;
    }

    // Buttons at the bottom
    html += `<div class="modal-actions">`;
    if (event.link) {
      html += `<a href="${event.link.url}" class="btn btn-primary" target="_blank" rel="noopener">${event.link.text} ↗</a>`;
    }
    // Borrow the Recruitment link from the navbar, because its path is different
    // on the home page ("pages/recruitment.html") and inside pages/ ("recruitment.html")
    const joinLink = document.querySelector('.nav-links a[href$="recruitment.html"]').getAttribute("href");
    html += `<a href="${joinLink}" class="btn btn-outline">Join the team behind it</a></div>`;

    return html;
  }

  function openModal(card) {
    const event = EVENT_DETAILS[card.dataset.event];
    if (!event) return; // no details for this key

    content.innerHTML = buildDetails(event);
    box.scrollTop = 0;                         // always start at the top
    lastFocused = card;                        // remember which card opened it

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open"); // stops the page behind from scrolling
    modal.querySelector(".modal-close").focus(); // keyboard users start on the X button
  }

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    if (lastFocused) lastFocused.focus(); // go back to the card that was clicked
  }

  // Make every event card clickable (and usable with the keyboard)
  cards.forEach(function (card) {
    card.setAttribute("tabindex", "0");   // can be reached with the Tab key
    card.setAttribute("role", "button");  // screen readers announce it as a button

    card.addEventListener("click", function () {
      openModal(card);
    });

    // Enter or Space opens it too, like a real button
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal(card);
      }
    });
  });

  // Everything with data-close (the X button and the dark background) closes it
  modal.querySelectorAll("[data-close]").forEach(function (el) {
    el.addEventListener("click", closeModal);
  });

  // The Esc key closes it
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("open")) {
      closeModal();
    }
  });
}


/* ---------- 15. BUTTON "INK DROP" HOVER ----------
   When the mouse enters (or leaves) a button, we save the mouse position
   inside the button as --x and --y. The CSS circle (.btn::before) grows
   from that point, so the colour spreads from where you touched it,
   and shrinks back towards where you left.
   We listen on the whole document (not each button), so it also works for
   buttons made later by JavaScript, like the one in the event pop-up. */
function buttonInkDrop() {
  function savePosition(e) {
    const button = e.target.closest(".btn, .filter-btn");
    if (!button) return;

    // getBoundingClientRect() tells us where the button is on the screen
    const box = button.getBoundingClientRect();
    button.style.setProperty("--x", (e.clientX - box.left) + "px");
    button.style.setProperty("--y", (e.clientY - box.top) + "px");
  }

  document.addEventListener("mouseover", savePosition);
  document.addEventListener("mouseout", savePosition);
}


/* ---------- START EVERYTHING ----------
   DOMContentLoaded fires when the HTML is ready.
   Then we run every feature. */
document.addEventListener("DOMContentLoaded", function () {
  runIntroLoader();
  createStarCanvas();
  revealOnScroll();
  animateCounters();
  typeWriter();
  cursorSparkle();
  setupMobileMenu();
  highlightActiveNav();
  filterEvents();
  toggleRoleCards();
  validateForms();
  scrollProgressBar();
  backToTop();
  setupEventModal();
  buttonInkDrop();

  // Put the current year in the footer automatically
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});
