/* ==========================================================================
   Snerpa Þjálfun — shared behaviour (no external dependencies)
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
        summary.textContent = (selection.coach || "—") + " · " + (selection.pkg || "—");
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

      // Step 3 submit: build a mailto fallback (TODO: replace with real form endpoint).
      var form = wizard.querySelector("[data-wizard-form]");
      var data = {};
      if (form) {
        Array.prototype.slice.call(form.elements).forEach(function (el) {
          if (el.name) data[el.name] = el.value;
        });
      }
      var bodyLines = [
        "Þjálfari: " + (selection.coach || "—"),
        "Pakki: " + (selection.pkg || "—"),
        "Nafn: " + (data.name || ""),
        "Netfang: " + (data.email || ""),
        "Sími: " + (data.tel || ""),
        "Markmið: " + (data.goals || ""),
        "Reynsla: " + (data.experience || ""),
        "Meiðsli/heilsufar: " + (data.health || ""),
        "Hvenær hentar að byrja: " + (data.start || ""),
        "Annað: " + (data.notes || "")
      ];
      var mailto = "mailto:Haukur@snerpacoaching.is" +
        "?subject=" + encodeURIComponent("Fjarþjálfun — skráning") +
        "&body=" + encodeURIComponent(bodyLines.join("\n"));
      window.location.href = mailto;
    });

    render();
  }

  /* ---------- Reviews carousel (umsagnir) ---------- */
  function initReviews() {
    var track = document.getElementById("reviewsTrack");
    var dotsWrap = document.getElementById("reviewsDots");
    var prevBtn = document.getElementById("reviewsPrev");
    var nextBtn = document.getElementById("reviewsNext");
    if (!track || !dotsWrap || !prevBtn || !nextBtn) return;

    var cards = Array.prototype.slice.call(track.children);
    if (!cards.length) return;

    cards.forEach(function (card, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "reviews-dot";
      dot.setAttribute("aria-label", "Fara í umsögn " + (i + 1));
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

  /* ---------- Formspree form submit ----------
     Submits a form to Formspree via fetch (no page leave) and shows an
     inline status message. Used for póstlisti, Hafa samband og Samstarf —
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
    // Póstlisti — birtist í fæti á öllum síðum.
    document.querySelectorAll(".newsletter-form").forEach(wireFormspreeForm);

    // Hafa samband.
    wireFormspreeForm(document.getElementById("contact-form"));

    // Samstarf.
    wireFormspreeForm(document.getElementById("samstarf-form"));
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initAccordions();
    initWizard();
    initReviews();
    initMailtoForms();
  });
})();
