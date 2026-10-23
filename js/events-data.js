/* =========================================================
   CELESTIUS - events-data.js
   All the details shown in the event pop-up (modal).
   The information comes from the old celestius.in website.

   How it connects:
   - Every event card in the HTML has an attribute like data-event="deadlock"
   - "deadlock" is a key in the EVENT_DETAILS object below
   - When a card is clicked, setupEventModal() in main.js reads
     EVENT_DETAILS["deadlock"] and builds the pop-up from it

   Every event can have:
     icon     - an emoji
     tag      - small label (e.g. "Flagship · Competition")
     title    - event name
     status   - e.g. "Concluded" or "Coming soon"
     summary  - a paragraph about the event
     info     - quick facts, shown as small boxes  [ { label, value } ]
     steps    - rounds / stages, shown as a timeline [ { label, title, text } ]
     topics   - what was covered, shown as a list    [ "text", ... ]
     link     - optional button to another website  { text, url }
   ========================================================= */

const EVENT_DETAILS = {

  promptverse: {
    icon: "🤖",
    tag: "Flagship · Hackathon",
    title: "PromptVerse Continuum",
    status: "Sector 01 concluded · Sector 02 coming soon",
    summary: "The flagship technical symposium of Celestius. A two-stage challenge: participants first master prompt synthesis and generative AI pipelines, then compete in a live build challenge solving real industry problem statements.",
    info: [
      { label: "Format", value: "Workshop + Hackathon" },
      { label: "Stages", value: "2 sections" },
      { label: "Website", value: "promptverse.celestius.in" }
    ],
    steps: [
      { label: "Section 01 · Workshop", title: "Prompt Synthesis", text: "Context engineering, system prompting and LLM orchestration." },
      { label: "Section 02 · Hackathon", title: "Problem Build Sprint", text: "Building working solutions against live problem statements." },
      { label: "Sector 01 · Concluded", title: "For CSE & allied branches", text: "Started with prompt architecture masterclasses and ended with a competitive product build sprint." },
      { label: "Sector 02 · Coming soon", title: "For core engineering branches", text: "Prompt engineering for mechanics, VLSI, smart circuits and industrial problems, with an Applied Core AI workshop and a Core Build Sprint." }
    ],
    link: { text: "Visit PromptVerse site", url: "https://promptverse.celestius.in" }
  },

  takshashila: {
    icon: "🏛️",
    tag: "Flagship · Symposium",
    title: "Takshashila Tech",
    status: "Annual festival of CIT",
    summary: "Takshashila is the annual festival of Chennai Institute of Technology. Celestius powers its technical side, from building the official festival website to running workshops and competitions.",
    info: [
      { label: "Where", value: "CIT Chennai" },
      { label: "Our role", value: "Website, workshops, contests" }
    ],
    steps: [
      { label: "Takshashila'24 · Website", title: "Official festival website", text: "Designed and built the official portal for Takshashila'24, \"The Rhythm of Life\": event rules, schedules, online registrations and live festival updates." },
      { label: "Takshashila'24 · Workshop", title: "GitHub & Machine Learning", text: "A hands-on workshop on Git, pull request workflows and basic machine learning on real datasets." },
      { label: "Takshashila'25 · Competition", title: "Reverse Engineering", text: "Participants analysed compiled programs with debugging and disassembly to solve technical security puzzles." },
      { label: "Takshashila · Competition", title: "Deadlock", text: "Our speed coding battle, conducted as a Takshashila (TK) event." }
    ]
  },

  deadlock: {
    icon: "⚔️",
    tag: "Flagship · Competition",
    title: "Deadlock",
    status: "A Takshashila event",
    summary: "A fast-paced competitive programming event conducted for Takshashila, CIT's flagship festival. Developers battled in 1v1 coding duels and black-box logic challenges, advancing through knockout rounds to the finals.",
    info: [
      { label: "Format", value: "1v1 knockout" },
      { label: "Skills", value: "Algorithms, speed, logic" },
      { label: "Rounds", value: "2" }
    ],
    steps: [
      { label: "Round 01 · Elimination", title: "Tug of War", text: "Two teams battled over a digital rope. Every correct coding solution pulled the rope toward that team, until one side crossed the victory line." },
      { label: "Round 02 · Finals", title: "The Code", text: "Finalists got only 3 sample input and output pairs and no problem statement. They had to work out the hidden logic and write code that passes all the hidden test cases." }
    ]
  },

  transformers: {
    icon: "🧠",
    tag: "Workshop",
    title: "Transformers Workshop",
    status: "Concluded",
    summary: "An advanced masterclass exploring the Transformer architecture and its central role in modern artificial intelligence.",
    info: [
      { label: "Type", value: "Masterclass" },
      { label: "Level", value: "Advanced" }
    ],
    topics: [
      "Self-attention mechanisms",
      "Tokens and contextual representations",
      "Foundations of Large Language Models (LLMs)",
      "How generative AI systems work"
    ]
  },

  githubml: {
    icon: "🔀",
    tag: "Workshop",
    title: "GitHub & Machine Learning Workshop",
    status: "Concluded · Takshashila'24",
    summary: "A practical, hands-on workshop bridging version control and machine learning fundamentals.",
    info: [
      { label: "Type", value: "Hands-on workshop" },
      { label: "Event", value: "Takshashila'24" }
    ],
    topics: [
      "Working with Git repositories",
      "Collaborating with pull requests",
      "Basic machine learning algorithms",
      "Applying them to real datasets"
    ]
  },

  uiux: {
    icon: "✏️",
    tag: "Workshop",
    title: "UI/UX Workshop",
    status: "Concluded · Youth Fest",
    summary: "An introductory design masterclass held during Youth Fest, covering how to turn concept sketches into production-ready user interfaces.",
    info: [
      { label: "Type", value: "Design masterclass" },
      { label: "Event", value: "Youth Fest" }
    ],
    topics: [
      "Human-centred design",
      "Typography and spacing hierarchy",
      "Reusable components",
      "From sketches to real interfaces"
    ]
  },

  reverse: {
    icon: "🔍",
    tag: "Competition",
    title: "Reverse Engineering",
    status: "Concluded · Takshashila'25",
    summary: "A specialised technical competition where participants analysed pre-compiled programs and explored their internal logic to solve technical security puzzles.",
    info: [
      { label: "Type", value: "Technical contest" },
      { label: "Event", value: "Takshashila'25" }
    ],
    topics: [
      "Analysing pre-compiled binaries",
      "Runtime debugging",
      "Disassembly",
      "Logical deduction"
    ]
  },

  trivia: {
    icon: "🎯",
    tag: "Competition",
    title: "Tech Trivia",
    status: "Concluded · Tech Fiesta",
    summary: "A fast-paced quiz tournament held during Tech Fiesta, where teams competed across several rounds of technology questions.",
    info: [
      { label: "Type", value: "Team quiz" },
      { label: "Event", value: "Tech Fiesta" }
    ],
    topics: [
      "Computer science history",
      "Programming languages",
      "Artificial intelligence milestones",
      "Technology culture"
    ]
  }

};
