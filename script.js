const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const sectionElements = Array.from(document.querySelectorAll('section[id]')).filter((section) => (
  document.querySelector(`.primary-nav a[href="#${section.id}"]`)
));
const revealElements = document.querySelectorAll('.reveal');
const navLinks = document.querySelectorAll('.primary-nav a');
const menuToggle = document.getElementById('menu-toggle');
const primaryNav = document.getElementById('primary-nav');
const parallaxItems = document.querySelectorAll('.parallax-item');
const counters = document.querySelectorAll('.counter');
const progressFills = document.querySelectorAll('.progress-fill');
const yearElement = document.getElementById('year');

const terminalOutput = document.getElementById('terminal-output');
const terminalForm = document.getElementById('terminal-form');
const terminalInput = document.getElementById('terminal-input');

const copyEmailButton = document.getElementById('copy-email');
const emailText = document.getElementById('email-text');
const copyFeedback = document.getElementById('copy-feedback');

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

if (menuToggle && primaryNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = primaryNav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (event) => {
    const targetId = anchor.getAttribute('href');
    const target = targetId ? document.querySelector(targetId) : null;
    if (!target) return;

    event.preventDefault();
    const headerOffset = document.querySelector('.site-header')?.offsetHeight || 0;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - headerOffset + 1;

    window.scrollTo({
      top: targetTop,
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });

    if (primaryNav?.classList.contains('is-open')) {
      primaryNav.classList.remove('is-open');
      menuToggle?.setAttribute('aria-expanded', 'false');
    }
  });
});

if (prefersReducedMotion) {
  revealElements.forEach((el) => el.classList.add('visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

  revealElements.forEach((el) => revealObserver.observe(el));
}

if (sectionElements.length && navLinks.length) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    });
  }, { threshold: 0.52 });

  sectionElements.forEach((section) => sectionObserver.observe(section));
}

if (parallaxItems.length && !prefersReducedMotion) {
  const updateParallax = () => {
    const scrollY = window.scrollY;
    parallaxItems.forEach((item) => {
      const speed = Number(item.getAttribute('data-parallax')) || 0;
      item.style.transform = `translate3d(0, ${scrollY * speed}px, 0)`;
    });
  };

  window.addEventListener('scroll', updateParallax, { passive: true });
}

const scrambleText = (element, finalText, duration = 900) => {
  if (!element || prefersReducedMotion) return;
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  const frameRate = 30;
  const totalFrames = Math.floor(duration / frameRate);
  let frame = 0;

  const timer = setInterval(() => {
    const progress = frame / totalFrames;
    const revealCount = Math.floor(progress * finalText.length);
    const scrambled = finalText
      .split('')
      .map((char, index) => {
        if (char === ' ') return ' ';
        if (index < revealCount) return finalText[index];
        return letters[Math.floor(Math.random() * letters.length)];
      })
      .join('');

    element.textContent = scrambled;
    frame += 1;

    if (frame > totalFrames) {
      clearInterval(timer);
      element.textContent = finalText;
    }
  }, frameRate);
};

document.querySelectorAll('[data-scramble]').forEach((element) => {
  const targetText = element.getAttribute('data-scramble') || '';
  if (!targetText) return;
  scrambleText(element, targetText, 1150);
  element.addEventListener('mouseenter', () => scrambleText(element, targetText, 850));
});

const animateCounter = (counter) => {
  const target = Number(counter.getAttribute('data-target')) || 0;
  const duration = 1300;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const value = Math.floor(progress * target);
    counter.textContent = value.toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
};

if (counters.length) {
  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.45 });

  counters.forEach((counter) => counterObserver.observe(counter));
}

if (progressFills.length) {
  const progressObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const level = Number(entry.target.getAttribute('data-level')) || 0;
      entry.target.style.width = `${Math.min(level, 100)}%`;
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  progressFills.forEach((fill) => progressObserver.observe(fill));
}

if (copyEmailButton && emailText && copyFeedback) {
  copyEmailButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(emailText.textContent?.trim() || '');
      copyFeedback.textContent = 'Email copied to clipboard.';
    } catch (error) {
      copyFeedback.textContent = 'Copy failed. Please copy manually.';
    }
  });
}

const terminalResponses = {
  help: [
    'Available commands:',
    'help, about, skills, projects, contact, github, resume'
  ],
  about: [
    'Kapil Khatri — Linux Developer & Software Engineer.',
    'Focused on Linux, C/C++, system programming, and modern interface design.'
  ],
  skills: [
    'Programming: C, C++, JavaScript, HTML, CSS',
    'Operating Systems: Linux, Arch Linux',
    'Tools: Git, GitHub, VS Code, Vim'
  ],
  projects: [
    'Featured: System Lens Dashboard',
    'More projects available in the Projects section above.'
  ],
  contact: [
    'Email: kapil@example.com',
    'GitHub: https://github.com/',
    'LinkedIn: https://www.linkedin.com/'
  ],
  github: ['Opening GitHub profile placeholder: https://github.com/'],
  resume: ['Resume file: ../Kapil_Khatri.pdf']
};

const history = [];
let historyIndex = -1;

const printTerminalLine = (text, className = 'response-line') => {
  if (!terminalOutput) return;
  const line = document.createElement('p');
  line.className = `terminal-line ${className}`;
  line.textContent = text;
  terminalOutput.appendChild(line);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
};

const runTerminalCommand = (rawInput) => {
  const input = rawInput.trim().toLowerCase();
  printTerminalLine(`kapil@arch:~$ ${rawInput}`, 'prompt-line');

  if (!input) {
    printTerminalLine('Enter a command. Type "help" to list options.');
    return;
  }

  if (input === 'clear') {
    terminalOutput.innerHTML = '';
    return;
  }

  const response = terminalResponses[input];
  if (!response) {
    printTerminalLine(`Command not found: ${input}. Type "help".`);
    return;
  }

  response.forEach((line) => printTerminalLine(line));
};

if (terminalOutput && terminalForm && terminalInput) {
  printTerminalLine('Booting command center...');
  printTerminalLine('Type "help" to view available commands.');

  terminalForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const command = terminalInput.value;
    if (!command.trim()) return;

    history.push(command);
    historyIndex = history.length;
    runTerminalCommand(command);
    terminalInput.value = '';
  });

  terminalInput.addEventListener('keydown', (event) => {
    if (!history.length) return;

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      historyIndex = Math.max(0, historyIndex - 1);
      terminalInput.value = history[historyIndex];
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      historyIndex = Math.min(history.length, historyIndex + 1);
      terminalInput.value = historyIndex === history.length ? '' : history[historyIndex];
    }
  });
}
