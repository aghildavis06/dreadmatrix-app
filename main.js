function switchTab(btn, tabId) {
      document.querySelectorAll('.about-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
      btn.classList.add('active');
      document.getElementById('tab-' + tabId).classList.remove('hidden');
    }

    function switchService(el, id) {
      document.querySelectorAll('.service-menu-item').forEach(i => i.classList.remove('active'));
      document.querySelectorAll('.svc-panel').forEach(p => p.classList.remove('active'));
      el.classList.add('active');
      const panel = document.getElementById('svc-' + id);
      if (panel) panel.classList.add('active');
    }

    // ── Enhanced Scroll Animation Observer ──
    (function () {
      const observerOptions = {
        threshold: 0.08,
        rootMargin: '0px 0px -30px 0px'
      };

      // Create stagger effect for child elements
      function staggerChildren(element) {
        const children = element.querySelectorAll('h1, h2, h3, h4, p, .feature-item, .blog-card, .proj-card, .service-item, button:not(.proj-arrow)');
        children.forEach((child, index) => {
          if (child.style.animation === '' || !child.style.animation) {
            child.style.opacity = '0';
            child.style.animation = `slideInUp 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${0.1 + (index * 0.05)}s both`;
          }
        });
      }

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
            // Stagger child elements
            staggerChildren(entry.target);
            // Remove observer after first intersection for better performance
            setTimeout(() => {
              observer.unobserve(entry.target);
            }, 1200);
          }
        });
      }, observerOptions);

      // Observe all sections for scroll animations
      document.querySelectorAll('section').forEach((section, index) => {
        section.style.animationPlayState = 'paused';
        observer.observe(section);
      });

      // Add subtle parallax effect on scroll
      window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        document.querySelectorAll('section').forEach((section) => {
          if (section.getBoundingClientRect().top < window.innerHeight && section.getBoundingClientRect().bottom > 0) {
            const depth = (section.getBoundingClientRect().top / window.innerHeight);
            section.style.transform = `translateY(${depth * 2}px)`;
          }
        });
      }, { passive: true });

      // Smooth transitions for elements on interaction
      document.querySelectorAll('a, button, .service-menu-item, .about-tab, .faq-item').forEach((el) => {
        el.addEventListener('click', function(e) {
          if (!this.getAttribute('href') || this.getAttribute('href').startsWith('#')) {
            this.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
            this.style.transform = 'scale(0.96)';
            setTimeout(() => {
              this.style.transform = 'scale(1)';
            }, 150);
          }
        });
        
        // Add hover effect
        el.addEventListener('mouseenter', function() {
          if (!this.style.transition) {
            this.style.transition = 'all 0.3s ease-out';
          }
        });
      });

      // Add scroll-linked opacity for fade effect
      document.querySelectorAll('section').forEach(section => {
        const observer2 = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            const visibility = entry.intersectionRatio;
            entry.target.style.opacity = Math.min(1, visibility * 1.5);
          });
        }, { threshold: [0, 0.25, 0.5, 0.75, 1] });
        observer2.observe(section);
      });
    })();

    
    (function () {
      const track    = document.getElementById('projTrack');
      const prevBtn  = document.getElementById('projPrev');
      const nextBtn  = document.getElementById('projNext');
      const dotsWrap = document.getElementById('projDots');
      const outer    = track.parentElement;

      const CARDS_VISIBLE = 4;
      const GAP = 20;
      const AUTO_INTERVAL = 3000; // ms between auto slides

      function getCardWidth() {
        return (outer.offsetWidth - GAP * (CARDS_VISIBLE - 1)) / CARDS_VISIBLE;
      }

      const cards = Array.from(track.children);
      const totalCards = cards.length;
      const maxIndex = totalCards - CARDS_VISIBLE;
      let currentIndex = 0;
      let autoTimer = null;
      let isDragging = false;
      let startX = 0;
      let dragDelta = 0;
      let isTransitioning = false;

      // ── Size cards ──
      function sizeCards() {
        const cw = getCardWidth();
        cards.forEach(c => { c.style.width = cw + 'px'; c.style.flexShrink = '0'; });
      }

      // ── Dots ──
      function buildDots() {
        dotsWrap.innerHTML = '';
        for (let i = 0; i <= maxIndex; i++) {
          const d = document.createElement('button');
          d.className = 'proj-dot' + (i === 0 ? ' active' : '');
          d.addEventListener('click', () => { goTo(i); resetAuto(); });
          dotsWrap.appendChild(d);
        }
      }

      function updateDots() {
        dotsWrap.querySelectorAll('.proj-dot').forEach((d, i) =>
          d.classList.toggle('active', i === currentIndex));
      }

      // ── Go to index ──
      function goTo(index) {
        currentIndex = Math.max(0, Math.min(index, maxIndex));
        const cw = getCardWidth();
        const offset = currentIndex * (cw + GAP);
        track.style.transition = 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)';
        track.style.transform = `translateX(-${offset}px)`;
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex >= maxIndex;
        updateDots();
      }

      // ── Auto-play ──
      function startAuto() {
        stopAuto();
        autoTimer = setInterval(() => {
          const next = currentIndex >= maxIndex ? 0 : currentIndex + 1;
          goTo(next);
        }, AUTO_INTERVAL);
      }

      function stopAuto() {
        if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
      }

      function resetAuto() {
        stopAuto();
        startAuto();
      }

      // ── Arrow buttons ──
      prevBtn.addEventListener('click', () => { goTo(currentIndex - 1); resetAuto(); });
      nextBtn.addEventListener('click', () => { goTo(currentIndex + 1); resetAuto(); });

      // ── Mouse drag ──
      outer.addEventListener('mousedown', e => {
        startX = e.clientX;
        dragDelta = 0;
        isDragging = true;
        track.style.transition = 'none';
        stopAuto();
        outer.style.cursor = 'grabbing';
      });

      outer.addEventListener('mousemove', e => {
        if (!isDragging) return;
        dragDelta = e.clientX - startX;
        const cw = getCardWidth();
        const base = currentIndex * (cw + GAP);
        track.style.transform = `translateX(${-(base - dragDelta)}px)`;
      });

      function endDrag() {
        if (!isDragging) return;
        isDragging = false;
        outer.style.cursor = 'grab';
        if (Math.abs(dragDelta) > 60) {
          goTo(dragDelta < 0 ? currentIndex + 1 : currentIndex - 1);
        } else {
          goTo(currentIndex); // snap back
        }
        startAuto();
      }

      outer.addEventListener('mouseup', endDrag);
      outer.addEventListener('mouseleave', endDrag);

      // ── Touch swipe ──
      outer.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
        dragDelta = 0;
        isDragging = true;
        track.style.transition = 'none';
        stopAuto();
      }, { passive: true });

      outer.addEventListener('touchmove', e => {
        if (!isDragging) return;
        dragDelta = e.touches[0].clientX - startX;
        const cw = getCardWidth();
        const base = currentIndex * (cw + GAP);
        track.style.transform = `translateX(${-(base - dragDelta)}px)`;
      }, { passive: true });

      outer.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;
        if (Math.abs(dragDelta) > 50) {
          goTo(dragDelta < 0 ? currentIndex + 1 : currentIndex - 1);
        } else {
          goTo(currentIndex);
        }
        startAuto();
      });

      // ── Pause on hover ──
      outer.addEventListener('mouseenter', stopAuto);
      outer.addEventListener('mouseleave', () => { if (!isDragging) startAuto(); });

      // ── Init ──
      sizeCards();
      buildDots();
      goTo(0);
      startAuto();

      window.addEventListener('resize', () => { sizeCards(); goTo(currentIndex); });
    })();
  
     (function () {
      const track    = document.getElementById('testiTrack');
      const dotsWrap = document.getElementById('testiDots');
      const outer    = track.parentElement;   // .testi-cards-wrap (scrollable area only)

      const VISIBLE  = 4;   // 4 review cards visible at once
      const GAP      = 18;
      const AUTO_MS  = 3500;

      function getCardW() {
        return (outer.offsetWidth - GAP * (VISIBLE - 1)) / VISIBLE;
      }

      const cards  = Array.from(track.children);
      const total  = cards.length;
      const maxIdx = Math.max(0, total - VISIBLE);
      let   idx    = 0;
      let   timer  = null;
      let   drag   = false;
      let   startX = 0;
      let   delta  = 0;

      function sizeCards() {
        const cw = getCardW();
        cards.forEach(c => {
          c.style.width      = cw + 'px';
          c.style.flexShrink = '0';
        });
      }

      function buildDots() {
        dotsWrap.innerHTML = '';
        for (let i = 0; i <= maxIdx; i++) {
          const d = document.createElement('button');
          d.className = 'testi-dot' + (i === 0 ? ' active' : '');
          d.addEventListener('click', () => { goTo(i); resetAuto(); });
          dotsWrap.appendChild(d);
        }
      }

      function updateDots() {
        dotsWrap.querySelectorAll('.testi-dot').forEach((d, i) =>
          d.classList.toggle('active', i === idx));
      }

      function goTo(i) {
        idx = Math.max(0, Math.min(i, maxIdx));
        const offset = idx * (getCardW() + GAP);
        track.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1)';
        track.style.transform  = `translateX(-${offset}px)`;
        updateDots();
      }

      function startAuto() {
        stopAuto();
        timer = setInterval(() => goTo(idx >= maxIdx ? 0 : idx + 1), AUTO_MS);
      }
      function stopAuto()  { clearInterval(timer); timer = null; }
      function resetAuto() { stopAuto(); startAuto(); }

      /* Mouse drag on the scrollable area */
      outer.addEventListener('mousedown', e => {
        startX = e.clientX; delta = 0; drag = true;
        track.style.transition = 'none';
        stopAuto(); outer.style.cursor = 'grabbing';
      });
      outer.addEventListener('mousemove', e => {
        if (!drag) return;
        delta = e.clientX - startX;
        const base = idx * (getCardW() + GAP);
        track.style.transform = `translateX(${-(base - delta)}px)`;
      });
      function endDrag() {
        if (!drag) return;
        drag = false; outer.style.cursor = 'grab';
        if (Math.abs(delta) > 60) goTo(delta < 0 ? idx + 1 : idx - 1);
        else goTo(idx);
        startAuto();
      }
      outer.addEventListener('mouseup',    endDrag);
      outer.addEventListener('mouseleave', endDrag);

      /* Touch */
      outer.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX; delta = 0; drag = true;
        track.style.transition = 'none'; stopAuto();
      }, { passive: true });
      outer.addEventListener('touchmove', e => {
        if (!drag) return;
        delta = e.touches[0].clientX - startX;
        const base = idx * (getCardW() + GAP);
        track.style.transform = `translateX(${-(base - delta)}px)`;
      }, { passive: true });
      outer.addEventListener('touchend', () => {
        if (!drag) return; drag = false;
        if (Math.abs(delta) > 50) goTo(delta < 0 ? idx + 1 : idx - 1);
        else goTo(idx);
        startAuto();
      });

      /* Pause on hover */
      outer.addEventListener('mouseenter', stopAuto);
      outer.addEventListener('mouseleave', () => { if (!drag) startAuto(); });

      /* Init */
      sizeCards();
      buildDots();
      goTo(0);
      startAuto();
      window.addEventListener('resize', () => { sizeCards(); goTo(idx); });
    })();

    function toggleFaq(item) {
      const isOpen = item.classList.contains('faq-item--open');
      const faqAnswer = item.querySelector('.faq-a');
      const faqIcon = item.querySelector('.faq-icon');
      
      // Prevent closing already open item with double-click
      if (isOpen) {
        return;
      }
      
      // Close all other items with animation
      document.querySelectorAll('.faq-item').forEach(i => {
        if (i !== item && i.classList.contains('faq-item--open')) {
          i.classList.remove('faq-item--open');
          const answer = i.querySelector('.faq-a');
          const icon = i.querySelector('.faq-icon');
          
          // Animate closing
          answer.style.maxHeight = '0';
          answer.style.opacity = '0';
          setTimeout(() => {
            icon.textContent = '+';
          }, 200);
        }
      });
      
      // Open clicked item if it was closed
      if (!isOpen) {
        item.classList.add('faq-item--open');
        
        // Calculate max-height for smooth expansion
        faqAnswer.style.maxHeight = faqAnswer.scrollHeight + 'px';
        faqAnswer.style.opacity = '1';
        faqIcon.textContent = '−';
      }
    }

    // ── Trusted Slider with Mouse Support ──
    (function () {
      const track = document.getElementById('sliderTrack');
      if (!track) return;

      const outer = track.parentElement;
      let isDragging = false;
      let startX = 0;
      let currentTranslate = 0;
      let lastAnimationTime = 0;

      function pauseAnimation() {
        track.style.animationPlayState = 'paused';
      }

      function resumeAnimation() {
        track.style.animationPlayState = 'running';
      }

      // Mouse down - start dragging
      track.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        pauseAnimation();
        track.style.cursor = 'grabbing';
      });

      // Mouse move - drag
      document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const delta = e.clientX - startX;
        const computedStyle = window.getComputedStyle(track);
        const transform = computedStyle.transform;
        const matrix = new DOMMatrix(transform);
        currentTranslate = matrix.m41 + delta;
        track.style.transform = `translateX(${currentTranslate}px)`;
        startX = e.clientX;
      });

      // Mouse up - stop dragging and resume animation
      document.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        track.style.cursor = 'grab';
        resumeAnimation();
      });

      // Mouse leave - stop dragging
      document.addEventListener('mouseleave', () => {
        if (!isDragging) return;
        isDragging = false;
        track.style.cursor = 'grab';
        resumeAnimation();
      });

      // Pause on hover
      outer.addEventListener('mouseenter', pauseAnimation);
      outer.addEventListener('mouseleave', () => {
        if (!isDragging) resumeAnimation();
      });
    })();

    // ── Enhanced Interaction Transitions ──
    (function () {
      // Add smooth transitions to all card elements
      document.querySelectorAll('.proj-card, .blog-card, .testi-card--light, .hww-card').forEach((card) => {
        card.addEventListener('mouseenter', function() {
          this.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
        });
        card.addEventListener('mouseleave', function() {
          this.style.transition = 'all 0.3s ease-out';
        });
      });

      // Smooth scroll to top button (if exists)
      const scrollTopBtn = document.getElementById('scrollTop');
      if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
          scrollTopBtn.style.opacity = window.scrollY > 300 ? '1' : '0';
          scrollTopBtn.style.pointerEvents = window.scrollY > 300 ? 'auto' : 'none';
        });

        scrollTopBtn.addEventListener('click', () => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      }

      // Add page transition on navigation
      document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', function(e) {
          const href = this.getAttribute('href');
          if (href && href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
              target.style.opacity = '0.8';
              setTimeout(() => {
                target.style.opacity = '1';
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 100);
            }
          }
        });
      });

      // Smooth loading animations for images
      document.querySelectorAll('img').forEach((img) => {
        img.style.opacity = '0';
        img.addEventListener('load', function() {
          this.style.transition = 'opacity 0.5s ease-out';
          this.style.opacity = '1';
        });
        if (img.complete) {
          img.style.opacity = '1';
        }
      });
    })();