const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const nav = document.getElementById('primary-nav');
const menuToggle = document.getElementById('menu-toggle');
const revealElements = document.querySelectorAll('.reveal');
const navLinks = document.querySelectorAll('.primary-nav a');
const sections = Array.from(document.querySelectorAll('main section[id]')).filter((section) => document.querySelector(`.primary-nav a[href="#${section.id}"]`));
const terminalOutput = document.getElementById('terminal-output');
const terminalForm = document.getElementById('terminal-form');
const terminalInput = document.getElementById('terminal-input');
const terminalBody = document.getElementById('terminal-body');
const terminalToggle = document.getElementById('terminal-toggle');
const flash = document.getElementById('memory-flash');
const year = document.getElementById('year');

if (year) year.textContent = new Date().getFullYear();

menuToggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    nav?.classList.remove('is-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});

if (prefersReducedMotion) {
  revealElements.forEach((el) => el.classList.add('visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.16 });
  revealElements.forEach((el) => revealObserver.observe(el));
}

if (sections.length) {
  const activeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { threshold: 0.5 });
  sections.forEach((section) => activeObserver.observe(section));
}

if (!prefersReducedMotion) {
  window.addEventListener('scroll', () => {
    document.querySelectorAll('.parallax-item').forEach((item) => {
      const speed = Number(item.dataset.parallax) || 0;
      item.style.transform = `translate3d(0, ${window.scrollY * speed}px, 0)`;
    });
  }, { passive: true });
}

const scrambleText = (element, finalText) => {
  if (!element || prefersReducedMotion) return;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/';
  let frame = 0;
  const timer = setInterval(() => {
    element.textContent = finalText.split('').map((char, index) => {
      if (char === ' ') return ' ';
      return index < frame / 2 ? char : chars[Math.floor(Math.random() * chars.length)];
    }).join('');
    frame += 1;
    if (frame > finalText.length * 2) {
      clearInterval(timer);
      element.textContent = finalText;
    }
  }, 32);
};

document.querySelectorAll('[data-scramble]').forEach((element) => {
  const text = element.dataset.scramble;
  scrambleText(element, text);
  element.addEventListener('mouseenter', () => scrambleText(element, text));
});

const archiveUrls = [
  'https://web.archive.org/web/19961220195654/http://www.yahoo.com/',
  'https://web.archive.org/web/19981212030856/http://google.com/',
  'https://web.archive.org/web/20000815052811/http://slashdot.org/',
  'https://web.archive.org/web/20010202094400/http://archive.org/',
  'https://web.archive.org/web/19970401000000/http://www.wired.com/'
];

document.getElementById('archive-btn')?.addEventListener('click', () => {
  const url = archiveUrls[Math.floor(Math.random() * archiveUrls.length)];
  flash?.classList.add('active');
  window.setTimeout(() => {
    flash?.classList.remove('active');
    window.open(url, '_blank', 'noopener,noreferrer');
  }, prefersReducedMotion ? 0 : 850);
});

document.getElementById('surprise-btn')?.addEventListener('click', () => {
  const targets = ['#story', '#project-index', '#terminal', '#archive', '#goals', '#contact'];
  document.querySelector(targets[Math.floor(Math.random() * targets.length)])?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
});

const responses = {
  help: ['Available commands:', '  help      about      projects', '  skills    contact    resume', '  timeline  clear'],
  about: ['Name: Kapil Khatri', 'Role: Linux Developer & Software Engineer', 'Interests: Linux systems, low-level programming, embedded logic, raw web interfaces', 'Current focus: Linux kernel fundamentals and system programming'],
  skills: ['Linux | C | C++ | JavaScript | HTML | CSS | Git | GitHub | Vim'],
  projects: ['drwxr-xr-x  kapil  projects/', '', './system-lens-dashboard', '  description: Linux-inspired monitoring interface with command-style controls.', '  tech: JavaScript, HTML, CSS', '  link: https://github.com/', '', './arch-setup-automator', '  description: Reproducible workstation setup and development environment scripts.', '  tech: Linux, Shell, Git', '  link: https://github.com/', '', './brutal-portfolio-engine', '  description: Editorial single-page site with animation, archive interactions, and terminal UX.', '  tech: HTML, CSS, JavaScript', '  link: https://github.com/'],
  contact: ['Email: kapilkaacc@gmail.com', 'Resume: ./Kapil_Khatri.pdf', '<button class="copy-email" type="button" data-copy-email>Copy email</button>'],
  resume: ['Resume link: ./Kapil_Khatri.pdf', 'Open it from the site root when the PDF is available.'],
  timeline: ['01  Electrical engineering foundation', '02  Linux-first daily workflow', '03  C/C++ and systems fundamentals', '04  Web interfaces and tooling', '05  Kernel and system-programming focus']
};

const commandHistory = [];
let historyIndex = 0;

const printLine = (content, className = 'response-line', asHtml = false) => {
  if (!terminalOutput) return;
  const line = document.createElement('p');
  line.className = `terminal-line ${className}`;
  if (asHtml) line.innerHTML = content;
  else line.textContent = content;
  terminalOutput.appendChild(line);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
};

const runCommand = (rawCommand) => {
  const command = rawCommand.trim().toLowerCase();
  printLine(`kapil@website:~$ ${rawCommand}`, 'prompt-line');
  if (command === 'clear') {
    terminalOutput.innerHTML = '';
    return;
  }
  if (!responses[command]) {
    printLine(`Command not found: ${command || '(empty)'}. Type help.`);
    return;
  }
  responses[command].forEach((line) => printLine(line, 'response-line', line.startsWith('<button')));
};

if (terminalOutput && terminalForm && terminalInput) {
  printLine('Boot sequence complete. Type help.');
  terminalForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = terminalInput.value;
    commandHistory.push(value);
    historyIndex = commandHistory.length;
    runCommand(value);
    terminalInput.value = '';
  });
  terminalInput.addEventListener('keydown', (event) => {
    if (!commandHistory.length) return;
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      historyIndex = Math.max(0, historyIndex - 1);
      terminalInput.value = commandHistory[historyIndex];
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      historyIndex = Math.min(commandHistory.length, historyIndex + 1);
      terminalInput.value = historyIndex === commandHistory.length ? '' : commandHistory[historyIndex];
    }
  });
  terminalOutput.addEventListener('click', async (event) => {
    if (!event.target.matches('[data-copy-email]')) return;
    await navigator.clipboard.writeText('kapilkaacc@gmail.com');
    event.target.textContent = 'Copied';
  });
}

terminalToggle?.addEventListener('click', () => {
  const closed = terminalBody.classList.toggle('closed');
  terminalToggle.textContent = closed ? 'Open' : 'Close';
  terminalToggle.setAttribute('aria-expanded', String(!closed));
});

document.querySelectorAll('[data-terminal-command]').forEach((link) => {
  link.addEventListener('click', () => {
    const command = link.dataset.terminalCommand;
    window.setTimeout(() => {
      if (terminalBody?.classList.contains('closed')) terminalToggle?.click();
      terminalInput?.focus();
      runCommand(command);
    }, 450);
  });
});

let eggClicks = 0;
document.querySelector('.egg-trigger')?.addEventListener('click', () => {
  eggClicks += 1;
  if (eggClicks >= 3) {
    document.getElementById('easter-egg')?.classList.add('show');
    document.body.style.setProperty('--red', '#ff1a1a');
  }
});
