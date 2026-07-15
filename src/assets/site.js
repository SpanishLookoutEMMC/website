// Shared site behavior: mobile nav, year stamp.
(function () {
  // Year in footer
  const yr = document.querySelector('[data-year]');
  if (yr) yr.textContent = String(new Date().getFullYear());

  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }

  // Rotating homepage scripture — pick a random verse on each visit
  var scriptureEl = document.getElementById('hero-scripture');
  var referenceEl = document.getElementById('hero-reference');
  if (scriptureEl && referenceEl) {
    var verses = [
      { text: '“Enter his gates with thanksgiving, and his courts with praise.”', ref: 'Psalm 100:4' },
      { text: '“For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.”', ref: 'John 3:16' },
      { text: '“Come to me, all you who are weary and burdened, and I will give you rest.”', ref: 'Matthew 11:28' },
      { text: '“Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.”', ref: 'Proverbs 3:5–6' },
      { text: '“But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.”', ref: 'Isaiah 40:31' },
      { text: '“And we know that in all things God works for the good of those who love him, who have been called according to his purpose.”', ref: 'Romans 8:28' },
      { text: '“God is our refuge and strength, an ever-present help in trouble.”', ref: 'Psalm 46:1' },
      { text: '“Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.”', ref: 'Joshua 1:9' },
      { text: '“He has shown you, O mortal, what is good. And what does the Lord require of you? To act justly and to love mercy and to walk humbly with your God.”', ref: 'Micah 6:8' },
      { text: '“Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.”', ref: 'Philippians 4:6' }
    ];
    var verse = verses[Math.floor(Math.random() * verses.length)];
    scriptureEl.textContent = verse.text;
    referenceEl.textContent = verse.ref;
  }

  // Contact form — compose a mailto: so the message leaves via the visitor's email app
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var to = contactForm.getAttribute('data-to') || '';
      var name = (contactForm.elements.name && contactForm.elements.name.value || '').trim();
      var email = (contactForm.elements.email && contactForm.elements.email.value || '').trim();
      var msg = (contactForm.elements.msg && contactForm.elements.msg.value || '').trim();
      if (!to || !name || !email || !msg) return;
      var subject = encodeURIComponent('Website message from ' + name);
      var body = encodeURIComponent('From: ' + name + ' <' + email + '>\n\n' + msg);
      var done = contactForm.querySelector('.done');
      if (done) done.style.display = 'inline';
      window.location.href = 'mailto:' + to + '?subject=' + subject + '&body=' + body;
    });
  }

  // Church history timeline — CodyHouse-style scroll reveal: blocks below
  // the fold start hidden, then bounce in once they reach 80% of the viewport.
  var timelineItems = document.querySelectorAll('[data-timeline-item]');
  if (timelineItems.length) {
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion) {
      var tlOffset = 0.8;
      var tlScrolling = false;

      for (var i = 0; i < timelineItems.length; i++) {
        if (timelineItems[i].getBoundingClientRect().top > window.innerHeight * tlOffset) {
          timelineItems[i].classList.add('is-hidden');
        }
      }

      function showTimelineBlocks() {
        tlScrolling = false;
        for (var j = 0; j < timelineItems.length; j++) {
          var item = timelineItems[j];
          if (item.classList.contains('is-hidden') &&
              item.getBoundingClientRect().top <= window.innerHeight * tlOffset) {
            item.classList.remove('is-hidden');
            item.classList.add('bounce-in');
          }
        }
      }

      function requestTimelineCheck() {
        if (!tlScrolling) {
          tlScrolling = true;
          window.requestAnimationFrame
            ? window.requestAnimationFrame(showTimelineBlocks)
            : setTimeout(showTimelineBlocks, 250);
        }
      }

      window.addEventListener('scroll', requestTimelineCheck, { passive: true });
      window.addEventListener('resize', requestTimelineCheck);
      showTimelineBlocks();
    }
  }
})();

