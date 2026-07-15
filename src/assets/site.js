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

  // Church history: highlight bottom-most fully visible event + show its image.
  // Click pins an entry until the user scrolls again.
  // L-shaped connector: event → horizontal → vertical → image.
  var tlRoot = document.querySelector('[data-tl]');
  if (tlRoot) {
    var events = tlRoot.querySelectorAll('[data-tl-event]');
    var figure = tlRoot.querySelector('[data-tl-figure]');
    var figureImg = tlRoot.querySelector('[data-tl-figure-img]');
    var connector = document.querySelector('[data-tl-connector]');
    var connectorPath = document.querySelector('[data-tl-connector-path]');
    var activeEl = null;
    var pinnedEl = null;
    var ticking = false;

    function isFullyInViewport(el) {
      var r = el.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      // Fully visible: top and bottom inside the viewport
      return r.top >= 0 && r.bottom <= vh && r.height > 0;
    }

    function sizeFigureToEvent(eventEl) {
      if (!figure || !eventEl) return;
      var block = eventEl.querySelector('.tl-block');
      if (!block) return;
      // Measure the image grid track by stretching to 100% first
      figure.style.justifySelf = 'stretch';
      figure.style.width = '100%';
      figure.style.maxWidth = '100%';
      var trackW = figure.getBoundingClientRect().width;
      // Target ≈ 2× event card, but stay inside the right column only
      var target = Math.round(block.getBoundingClientRect().width * 2);
      var w = Math.max(160, Math.min(target, trackW));
      figure.style.width = w + 'px';
      figure.style.maxWidth = '100%';
      figure.style.justifySelf = 'end';
    }

    function updateConnector() {
      if (!connector || !connectorPath) return;
      if (!activeEl || !figure || !figure.classList.contains('is-visible')) {
        connector.classList.remove('is-visible');
        connectorPath.setAttribute('d', '');
        return;
      }
      var block = activeEl.querySelector('.tl-block');
      var frame = figure.querySelector('.tl-figure-frame') || figure;
      if (!block) {
        connector.classList.remove('is-visible');
        connectorPath.setAttribute('d', '');
        return;
      }
      var br = block.getBoundingClientRect();
      var fr = frame.getBoundingClientRect();
      // Start: mid-right of event block. End: mid-left of image frame.
      var x1 = br.right;
      var y1 = br.top + br.height / 2;
      var x2 = fr.left;
      var y2 = fr.top + fr.height / 2;
      // Horizontal first, then vertical if needed
      var d = 'M ' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y1;
      if (Math.abs(y2 - y1) > 1) {
        d += ' L ' + x2 + ' ' + y2;
      }
      connectorPath.setAttribute('d', d);
      connector.classList.add('is-visible');
    }

    function setFigure(eventEl) {
      if (!figure || !figureImg) return;
      var src = eventEl && eventEl.getAttribute('data-image');
      var title = eventEl && eventEl.getAttribute('data-title');
      if (!src) {
        figure.classList.remove('is-visible');
        figureImg.removeAttribute('src');
        figureImg.alt = '';
        figure.style.width = '';
        figure.style.maxWidth = '';
        updateConnector();
        return;
      }
      if (figureImg.getAttribute('src') !== src) {
        figureImg.src = src;
        figureImg.alt = title || '';
      }
      figure.classList.add('is-visible');
      sizeFigureToEvent(eventEl);
      // After layout / image load, redraw path
      if (figureImg.complete) {
        updateConnector();
      } else {
        figureImg.addEventListener('load', updateConnector, { once: true });
        // still draw toward the frame box immediately
        updateConnector();
      }
    }

    function applyActive(next) {
      if (next !== activeEl) {
        if (activeEl) activeEl.classList.remove('is-active');
        activeEl = next;
        if (activeEl) {
          activeEl.classList.add('is-active');
          setFigure(activeEl);
        } else {
          setFigure(null);
        }
      } else if (activeEl) {
        // Same event — still refresh size/connector (scroll moves sticky image)
        sizeFigureToEvent(activeEl);
        updateConnector();
      } else {
        updateConnector();
      }
    }

    function pickScrollActive() {
      var fully = [];
      for (var i = 0; i < events.length; i++) {
        if (isFullyInViewport(events[i])) fully.push(events[i]);
      }

      if (fully.length) {
        // Bottom-most fully visible = last in document order among fully visible
        return fully[fully.length - 1];
      }

      // Fallback: nearest event whose top is above the viewport bottom
      var vh = window.innerHeight || 0;
      var best = null;
      var bestBottom = -Infinity;
      for (var j = 0; j < events.length; j++) {
        var r = events[j].getBoundingClientRect();
        if (r.top < vh && r.bottom > bestBottom) {
          bestBottom = r.bottom;
          best = events[j];
        }
      }
      return best;
    }

    function updateActive() {
      ticking = false;
      if (pinnedEl) {
        applyActive(pinnedEl);
        return;
      }
      applyActive(pickScrollActive());
    }

    function requestUpdate() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateActive);
      }
    }

    for (var c = 0; c < events.length; c++) {
      events[c].addEventListener('click', function () {
        pinnedEl = this;
        applyActive(this);
      });
      events[c].addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        pinnedEl = this;
        applyActive(this);
      });
      // Clickable without changing semantics for assistive tech
      if (!events[c].hasAttribute('tabindex')) {
        events[c].setAttribute('tabindex', '0');
        events[c].setAttribute('role', 'button');
      }
    }

    window.addEventListener('scroll', function () {
      // Any real scroll returns control to the auto “bottom-most” rule
      if (pinnedEl) pinnedEl = null;
      requestUpdate();
    }, { passive: true });
    window.addEventListener('resize', requestUpdate);
    updateActive();
  }
})();




