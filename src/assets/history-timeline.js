/**
 * Scrollable + draggable horizontal timeline (Codrops / GSAP pattern).
 * https://tympanus.net/codrops/2022/01/03/building-a-scrollable-and-draggable-timeline-with-gsap/
 *
 * ScrollTrigger scrubs the nav track as the page scrolls.
 * Dragging the track programmatically scrolls the page.
 * Clicking a nav link jumps to the section (smooth scroll via CSS).
 */
(function () {
  var track = document.querySelector('[data-draggable]');
  if (!track || typeof gsap === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger, Draggable);

  var navLinks = gsap.utils.toArray('[data-link]');
  var sections = gsap.utils.toArray('[data-history-section]');
  if (!navLinks.length || !sections.length) return;

  var lastItemWidth = function () {
    return navLinks[navLinks.length - 1].offsetWidth;
  };

  var getDraggableWidth = function () {
    return track.offsetWidth * 0.5 - lastItemWidth();
  };

  var getUseableHeight = function () {
    return document.documentElement.offsetHeight - window.innerHeight;
  };

  var tl = gsap.timeline().to(track, {
    x: function () {
      return getDraggableWidth() * -1;
    },
    ease: 'none'
  });

  var st = ScrollTrigger.create({
    animation: tl,
    scrub: 0
  });

  var updatePosition = function () {
    var left = track.getBoundingClientRect().left * -1;
    var width = getDraggableWidth();
    var useableHeight = getUseableHeight();
    var y = gsap.utils.mapRange(0, width, 0, useableHeight, left);
    st.scroll(y);
  };

  var draggable = Draggable.create(track, {
    type: 'x',
    // InertiaPlugin is premium — free build omits throw momentum
    bounds: {
      minX: 0,
      maxX: getDraggableWidth() * -1
    },
    edgeResistance: 1,
    onDragStart: function () {
      st.disable();
    },
    onDragEnd: function () {
      st.enable();
    },
    onDrag: updatePosition
  })[0];

  // Keep track in view when tabbing through off-screen links
  track.addEventListener('keyup', function (e) {
    var id = e.target.getAttribute('href');
    if (!id || e.key !== 'Tab') return;
    var section = document.querySelector(id);
    if (!section) return;
    var y = section.getBoundingClientRect().top + window.scrollY;
    st.scroll(y);
  });

  // Active link highlight while scrolling
  sections.forEach(function (section) {
    ScrollTrigger.create({
      trigger: section,
      start: 'top center',
      end: 'bottom center',
      onToggle: function (self) {
        if (!self.isActive) return;
        var id = section.getAttribute('id');
        navLinks.forEach(function (link) {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  });

  // Section enter animations (skip if reduced motion)
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!prefersReducedMotion.matches) {
    sections.forEach(function (section) {
      var heading = section.querySelector('.history-section__heading');
      var image = section.querySelector('.history-section__image');
      var detail = section.querySelector('.history-section__detail');

      if (heading) gsap.set(heading, { opacity: 0, y: 40 });
      if (image) gsap.set(image, { opacity: 0, y: 28 });
      if (detail) gsap.set(detail, { opacity: 0, y: 20 });

      var sectionTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 70%',
          end: '+=40%',
          toggleActions: 'play reverse play reverse'
        }
      });

      if (image) {
        sectionTl.to(image, { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' }, 0);
      }
      if (heading) {
        sectionTl.to(heading, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0.15);
      }
      if (detail) {
        sectionTl.to(detail, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.3);
      }
    });
  }

  function refreshTimeline() {
    tl.invalidate();
    if (draggable) {
      draggable.applyBounds({
        minX: 0,
        maxX: getDraggableWidth() * -1
      });
    }
    ScrollTrigger.refresh();
  }

  window.addEventListener('resize', refreshTimeline);
  window.addEventListener('load', refreshTimeline);
})();
