/* ==========================================================================
   Snerpa Þjálfun - shared behaviour (no external dependencies)
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- Mobile menu ---------- */
  function initMobileMenu() {
    var toggle = document.getElementById("menuToggle");
    var menu = document.getElementById("mobileMenu");
    if (!toggle || !menu) return;

    function close() {
      toggle.setAttribute("aria-expanded", "false");
      menu.hidden = true;
      document.body.style.overflow = "";
    }
    function open() {
      toggle.setAttribute("aria-expanded", "true");
      menu.hidden = false;
      document.body.style.overflow = "hidden";
    }

    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      if (expanded) { close(); } else { open(); }
    });

    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A" || e.target.closest("a")) close();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        close();
        toggle.focus();
      }
    });

    var mq = window.matchMedia("(min-width: 900px)");
    function handleBreakpoint(e) { if (e.matches) close(); }
    if (mq.addEventListener) mq.addEventListener("change", handleBreakpoint);
    else if (mq.addListener) mq.addListener(handleBreakpoint);
  }

  /* ---------- Dynamic form action (per aldurshópur Formspree-form) ---------- */
  function initDynamicFormAction() {
    document.querySelectorAll("[data-endpoint-select]").forEach(function (select) {
      var form = select.closest("form");
      if (!form) return;
      function apply() {
        var opt = select.options[select.selectedIndex];
        var endpoint = opt && opt.getAttribute("data-endpoint");
        if (endpoint) form.action = endpoint;
      }
      select.addEventListener("change", apply);
      apply();
    });
  }

  /* ---------- Nav dropdown (Hafa samband) ---------- */
  function initNavDropdown() {
    var dropdowns = document.querySelectorAll(".nav-dropdown");
    if (!dropdowns.length) return;

    function closeAll(except) {
      dropdowns.forEach(function (d) {
        if (d === except) return;
        d.classList.remove("is-open");
        var t = d.querySelector(".nav-dropdown-toggle");
        if (t) t.setAttribute("aria-expanded", "false");
      });
    }

    dropdowns.forEach(function (dropdown) {
      var toggle = dropdown.querySelector(".nav-dropdown-toggle");
      if (!toggle) return;
      toggle.addEventListener("click", function () {
        var isOpen = dropdown.classList.contains("is-open");
        closeAll(dropdown);
        dropdown.classList.toggle("is-open", !isOpen);
        toggle.setAttribute("aria-expanded", String(!isOpen));
      });
    });

    document.addEventListener("click", function (e) {
      if (!e.target.closest(".nav-dropdown")) closeAll();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeAll();
    });
  }

  /* ---------- Training calendar (month-flip view) ---------- */
  function initTrainingCalendar() {
    var grid = document.getElementById("calGrid");
    if (!grid) return;
    var label = document.getElementById("calMonthLabel");
    var prevBtn = document.getElementById("calPrev");
    var nextBtn = document.getElementById("calNext");

    var monthNames = ["Janúar","Febrúar","Mars","Apríl","Maí","Júní","Júlí","Ágúst","September","Október","Nóvember","Desember"];

    var months = [
      { y: 2026, m: 8,  training: [6,13,20,27],       off: {} },
      { y: 2026, m: 9,  training: [4,11,18,25],        off: {} },
      { y: 2026, m: 10, training: [1,8,15,22,29],      off: {} },
      { y: 2026, m: 11, training: [6,13,20],           off: { 27: "Jólafrí" } },
      { y: 2027, m: 0,  training: [10,17,24,31],       off: {} },
      { y: 2027, m: 1,  training: [7,14,21,28],        off: {} },
      { y: 2027, m: 2,  training: [7,14,21],           off: { 28: "Páskadagur" } },
      { y: 2027, m: 3,  training: [4,11,18,25],        off: {} },
      { y: 2027, m: 4,  training: [2,9,23,30],         off: { 16: "Hvítasunnudagur" } }
    ];
    var idx = 0;

    function render() {
      var mo = months[idx];
      if (label) label.textContent = monthNames[mo.m] + " " + mo.y;
      grid.innerHTML = "";

      var firstDay = new Date(mo.y, mo.m, 1).getDay(); // 0=Sun..6=Sat
      var offset = (firstDay + 6) % 7; // Mon=0..Sun=6
      var daysInMonth = new Date(mo.y, mo.m + 1, 0).getDate();

      for (var i = 0; i < offset; i++) {
        var empty = document.createElement("div");
        empty.className = "cal-day is-empty";
        grid.appendChild(empty);
      }
      for (var d = 1; d <= daysInMonth; d++) {
        var cell = document.createElement("div");
        cell.className = "cal-day";
        cell.textContent = String(d);
        if (mo.training.indexOf(d) !== -1) {
          cell.className += " is-training";
          cell.setAttribute("aria-label", d + ". - æfing");
        } else if (mo.off[d]) {
          cell.className += " is-off";
          cell.title = mo.off[d];
          cell.setAttribute("aria-label", d + ". - frí, " + mo.off[d]);
        }
        grid.appendChild(cell);
      }
      if (prevBtn) prevBtn.disabled = idx === 0;
      if (nextBtn) nextBtn.disabled = idx === months.length - 1;
    }

    if (prevBtn) prevBtn.addEventListener("click", function () { if (idx > 0) { idx--; render(); } });
    if (nextBtn) nextBtn.addEventListener("click", function () { if (idx < months.length - 1) { idx++; render(); } });

    render();
  }

  /* ---------- Accordion (FAQ / legal) ---------- */
  function initAccordions() {
    var triggers = document.querySelectorAll("[data-accordion-trigger]");
    triggers.forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        var panelId = trigger.getAttribute("aria-controls");
        var panel = document.getElementById(panelId);
        if (!panel) return;
        var isOpen = trigger.getAttribute("aria-expanded") === "true";
        var group = trigger.closest("[data-accordion-group]");
        var singleOpen = group && group.hasAttribute("data-accordion-single");

        if (singleOpen && !isOpen) {
          group.querySelectorAll("[data-accordion-trigger]").forEach(function (t) {
            if (t !== trigger) {
              t.setAttribute("aria-expanded", "false");
              var p = document.getElementById(t.getAttribute("aria-controls"));
              if (p) p.hidden = true;
              var s = t.querySelector("[data-accordion-sign]");
              if (s) s.textContent = "+";
            }
          });
        }

        trigger.setAttribute("aria-expanded", String(!isOpen));
        panel.hidden = isOpen;
        var sign = trigger.querySelector("[data-accordion-sign]");
        if (sign) sign.textContent = isOpen ? "+" : "−";
      });
    });
  }

  /* ---------- Fjarþjálfun 3-step wizard ---------- */
  function initWizard() {
    var wizard = document.querySelector("[data-wizard]");
    if (!wizard) return;

    var steps = Array.prototype.slice.call(wizard.querySelectorAll("[data-wizard-step]"));
    var navSteps = Array.prototype.slice.call(wizard.querySelectorAll("[data-wizard-nav-step]"));
    var backBtn = wizard.querySelector("[data-wizard-back]");
    var nextBtn = wizard.querySelector("[data-wizard-next]");
    var summary = wizard.querySelector("[data-wizard-summary]");
    var current = 0;
    var selection = { coach: null, pkg: null };

    function render() {
      steps.forEach(function (step, i) {
        step.hidden = i !== current;
      });
      navSteps.forEach(function (nav, i) {
        nav.classList.toggle("is-active", i === current);
        nav.classList.toggle("is-done", i < current);
      });
      backBtn.hidden = current === 0;

      var done = current === 0 ? !!selection.coach : current === 1 ? !!selection.pkg : true;
      if (current === 2) {
        nextBtn.textContent = "Senda fyrirspurn";
        nextBtn.disabled = false;
      } else {
        nextBtn.textContent = "Áfram";
        nextBtn.disabled = !done;
      }

      if (summary) {
        summary.textContent = (selection.coach || "-") + " · " + (selection.pkg || "-");
      }
    }

    wizard.querySelectorAll("[data-pick-coach]").forEach(function (card) {
      card.addEventListener("click", function () {
        selection.coach = card.getAttribute("data-pick-coach");
        wizard.querySelectorAll("[data-pick-coach]").forEach(function (c) {
          c.classList.toggle("is-selected", c === card);
        });
        render();
      });
    });

    wizard.querySelectorAll("[data-pick-package]").forEach(function (card) {
      card.addEventListener("click", function () {
        selection.pkg = card.getAttribute("data-pick-package");
        wizard.querySelectorAll("[data-pick-package]").forEach(function (c) {
          c.classList.toggle("is-selected", c === card);
        });
        render();
      });
    });

    backBtn.addEventListener("click", function () {
      if (current > 0) { current -= 1; render(); }
    });

    nextBtn.addEventListener("click", function () {
      var done = current === 0 ? !!selection.coach : current === 1 ? !!selection.pkg : true;
      if (!done) return;

      if (current < 2) {
        current += 1;
        render();
        wizard.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      // Step 3 submit: send to Formspree (lands in info@snerpacoaching.is,
      // merkt fyrir Hauk / fjarþjálfun).
      var form = wizard.querySelector("[data-wizard-form]");
      var statusEl = wizard.querySelector("[data-wizard-status]");
      var data = {};
      if (form) {
        Array.prototype.slice.call(form.elements).forEach(function (el) {
          if (el.name) data[el.name] = el.value;
        });
      }
      var payload = new FormData();
      payload.append("_subject", "Snerpa - Fjarþjálfun skráning (Haukur)");
      payload.append("Þjálfari", selection.coach || "-");
      payload.append("Pakki", selection.pkg || "-");
      payload.append("Nafn", data.name || "");
      payload.append("Netfang", data.email || "");
      payload.append("Sími", data.tel || "");
      payload.append("Markmið", data.goals || "");
      payload.append("Reynsla", data.experience || "");
      payload.append("Meiðsli/heilsufar", data.health || "");
      payload.append("Hvenær hentar að byrja", data.start || "");
      payload.append("Annað", data.notes || "");

      nextBtn.disabled = true;
      nextBtn.textContent = "Sendi...";

      fetch("https://formspree.io/f/xdendnke", {
        method: "POST",
        body: payload,
        headers: { Accept: "application/json" }
      }).then(function (response) {
        if (!response.ok) throw new Error("Formspree error");
        if (form) form.reset();
        nextBtn.hidden = true;
        if (statusEl) {
          statusEl.textContent = "Takk fyrir! Við höfum samband fljótlega.";
          statusEl.className = "form-status is-success";
          statusEl.hidden = false;
        }
      }).catch(function () {
        nextBtn.disabled = false;
        nextBtn.textContent = "Senda fyrirspurn";
        if (statusEl) {
          statusEl.textContent = "Úps, eitthvað fór úrskeiðis. Reyndu aftur eða sendu okkur línu á info@snerpacoaching.is.";
          statusEl.className = "form-status is-error";
          statusEl.hidden = false;
        }
      });
    });

    render();
  }

  /* ---------- Generic scroll-track carousel (umsagnir, þjálfarar) ---------- */
  function initCarousel(opts) {
    var track = document.getElementById(opts.trackId);
    var dotsWrap = document.getElementById(opts.dotsId);
    var prevBtn = document.getElementById(opts.prevId);
    var nextBtn = document.getElementById(opts.nextId);
    if (!track || !dotsWrap || !prevBtn || !nextBtn) return;

    var cards = Array.prototype.slice.call(track.children);
    if (!cards.length) return;

    cards.forEach(function (card, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "reviews-dot";
      dot.setAttribute("aria-label", opts.dotLabel + " " + (i + 1));
      dot.addEventListener("click", function () {
        track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: "smooth" });
      });
      dotsWrap.appendChild(dot);
    });
    var dots = Array.prototype.slice.call(dotsWrap.children);

    var ticking = false;
    function update() {
      ticking = false;
      var pos = track.scrollLeft;
      var active = 0;
      var minDist = Infinity;
      cards.forEach(function (card, i) {
        var dist = Math.abs(card.offsetLeft - track.offsetLeft - pos);
        if (dist < minDist) { minDist = dist; active = i; }
      });
      dots.forEach(function (d, i) { d.classList.toggle("is-active", i === active); });
      prevBtn.disabled = pos <= 4;
      nextBtn.disabled = pos >= track.scrollWidth - track.clientWidth - 4;
    }

    function scrollByCard(dir) {
      var gap = 20;
      var amount = (cards[0].getBoundingClientRect().width + gap) * dir;
      track.scrollBy({ left: amount, behavior: "smooth" });
    }

    prevBtn.addEventListener("click", function () { scrollByCard(-1); });
    nextBtn.addEventListener("click", function () { scrollByCard(1); });
    track.addEventListener("scroll", function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }, { passive: true });
    window.addEventListener("resize", update);

    update();
  }

  function initReviews() {
    initCarousel({
      trackId: "reviewsTrack", dotsId: "reviewsDots", prevId: "reviewsPrev", nextId: "reviewsNext",
      dotLabel: "Fara í umsögn"
    });
  }

  function initCoaches() {
    initCarousel({
      trackId: "coachesTrack", dotsId: "coachesDots", prevId: "coachesPrev", nextId: "coachesNext",
      dotLabel: "Fara á þjálfara"
    });
  }

  /* ---------- Formspree form submit ----------
     Submits a form to Formspree via fetch (no page leave) and shows an
     inline status message. Used for póstlisti, Hafa samband og Samstarf -
     all three land in info@snerpacoaching.is. */
  function wireFormspreeForm(form) {
    if (!form) return;
    var status = form.querySelector("[data-form-status]");
    var externalSubmit = form.id ? document.querySelector('button[type="submit"][form="' + form.id + '"]') : null;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var submitBtn = form.querySelector('button[type="submit"]');
      [submitBtn, externalSubmit].forEach(function (b) { if (b) b.disabled = true; });

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      }).then(function (response) {
        if (!response.ok) throw new Error("Formspree error");
        form.reset();
        if (status) {
          status.textContent = "Takk fyrir! Skilaboðin voru send.";
          status.className = "form-status is-success";
          status.hidden = false;
        }
      }).catch(function () {
        if (status) {
          status.textContent = "Úps, eitthvað fór úrskeiðis. Reyndu aftur eða sendu okkur línu á info@snerpacoaching.is.";
          status.className = "form-status is-error";
          status.hidden = false;
        }
      }).finally(function () {
        [submitBtn, externalSubmit].forEach(function (b) { if (b) b.disabled = false; });
      });
    });
  }

  function initMailtoForms() {
    // Póstlisti - birtist í fæti á öllum síðum.
    document.querySelectorAll(".newsletter-form").forEach(wireFormspreeForm);

    // Hafa samband.
    wireFormspreeForm(document.getElementById("contact-form"));

    // Samstarf.
    wireFormspreeForm(document.getElementById("samstarf-form"));

    // Þjálfarastörf.
    wireFormspreeForm(document.getElementById("thjalfari-form"));

    // Biðlisti.
    wireFormspreeForm(document.getElementById("bidlisti-form"));
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initNavDropdown();
    initDynamicFormAction();
    initTrainingCalendar();
    initAccordions();
    initWizard();
    initReviews();
    initCoaches();
    initMailtoForms();
  });
})();
