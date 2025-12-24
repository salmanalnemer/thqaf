/* ============================================================
   THQAF - Header & Footer Injector + Dropdown + Admin Modal + Live DateTime
   ------------------------------------------------------------
   1) Inject header.html into #appHeader and footer.html into #appFooter
   2) Mobile menu (hamburger)
   3) Dropdowns
   4) Close dropdowns on outside click / ESC
   5) Highlight active page via body[data-page]
   6) Admin login modal (delegation)
   7) ✅ Live time with seconds + Gregorian + Hijri date (after injection)
   ============================================================ */

(function () {
  "use strict";

  /* =========================
     Helpers
     ========================= */

  function buildUrl(relativePath) {
    return new URL(relativePath, window.location.href).toString();
  }

  async function injectHTML(targetId, filePath) {
    const target = document.getElementById(targetId);
    if (!target) return null;

    try {
      const res = await fetch(buildUrl(filePath), {
        cache: "no-store",
        credentials: "same-origin",
      });
      if (!res.ok) throw new Error(`${filePath} HTTP ${res.status}`);

      target.innerHTML = await res.text();
      return target;
    } catch (err) {
      console.error(err);
      target.innerHTML = `
        <div class="injectError" style="padding:12px;border:1px solid #f3c;border-radius:12px;background:#fff;">
          تعذر تحميل <b>${filePath}</b> — شغّل المشروع عبر Live Server / XAMPP.
        </div>
      `;
      return null;
    }
  }

  function closeAllDropdowns(root) {
    root.querySelectorAll(".dropdown.open").forEach((dd) => {
      dd.classList.remove("open");
      const btn = dd.querySelector(".dropbtn");
      if (btn) btn.setAttribute("aria-expanded", "false");
    });
  }

  function activateCurrentPage(root) {
    const current = document.body.getAttribute("data-page");
    if (!current) return;

    root.querySelectorAll(".menu .link[data-page]").forEach((a) => {
      if (a.getAttribute("data-page") === current) a.classList.add("active");
    });
  }

  /* =========================
     ✅ Live DateTime (seconds + dates)
     ========================= */

  function formatLiveArabic(d) {
    // ✅ وقت بالثواني
    const t = new Intl.DateTimeFormat("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      // timeZone: "Asia/Riyadh", // فعّلها إذا تبي تثبيت توقيت السعودية
    }).format(d);

    // ✅ التاريخ الميلادي + اسم اليوم
    const g = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
      weekday: "long",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      // timeZone: "Asia/Riyadh",
    }).format(d);

    // ✅ التاريخ الهجري
    const h = new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      // timeZone: "Asia/Riyadh",
    }).format(d);

    return `الوقت الآن ${t} — ${g} | هـ ${h}`;
  }

  function initLiveTime(root) {
    const liveEl = root.querySelector("#liveTime");
    if (!liveEl) return;

    // حماية: لا تشغل أكثر من مؤقت
    if (document.documentElement.dataset.thqafClockBound === "1") return;
    document.documentElement.dataset.thqafClockBound = "1";

    const update = () => {
      liveEl.textContent = formatLiveArabic(new Date());
    };

    update();
    // ✅ تحديث كل ثانية
    const timer = setInterval(update, 1000);

    // تنظيف بسيط لو الصفحة تغيّرت (اختياري)
    window.addEventListener("beforeunload", () => clearInterval(timer));
  }

  /* =========================
     ✅ Admin Modal (delegation)
     ========================= */

  function initAdminLoginModal() {
    if (document.documentElement.dataset.thqafLoginBound === "1") return;
    document.documentElement.dataset.thqafLoginBound = "1";

    function openModal() {
      const adminModal = document.getElementById("adminModal");
      if (!adminModal) return;

      adminModal.classList.add("active");
      adminModal.setAttribute("aria-hidden", "false");

      const adminPhone = document.getElementById("adminPhone");
      if (adminPhone) setTimeout(() => adminPhone.focus(), 0);
    }

    function closeModal() {
      const adminModal = document.getElementById("adminModal");
      if (!adminModal) return;

      adminModal.classList.remove("active");
      adminModal.setAttribute("aria-hidden", "true");
    }

    // فتح
    document.addEventListener("click", (e) => {
      if (!e.target.closest("#loginBtn")) return;
      openModal();
    });

    // إغلاق (زر إغلاق / إلغاء)
    document.addEventListener("click", (e) => {
      if (e.target.closest("#closeAdminModal") || e.target.closest("#cancelAdminModal")) {
        closeModal();
      }
    });

    // إغلاق عند الضغط على الخلفية
    document.addEventListener("click", (e) => {
      const adminModal = document.getElementById("adminModal");
      if (!adminModal || !adminModal.classList.contains("active")) return;
      if (e.target === adminModal) closeModal();
    });

    // إغلاق بالـ ESC
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      const adminModal = document.getElementById("adminModal");
      if (!adminModal || !adminModal.classList.contains("active")) return;
      closeModal();
    });
  }

  /* =========================
     Header Interactions
     ========================= */

  function initHeader(headerHost) {
    const root = headerHost || document;

    if (root.dataset.thqafHeaderBound === "1") return;
    root.dataset.thqafHeaderBound = "1";

    const hamburger = root.querySelector("#hamburger");
    const menu = root.querySelector("#menu");

    function closeMobileMenu() {
      if (!menu || !hamburger) return;
      menu.classList.remove("open");
      hamburger.setAttribute("aria-expanded", "false");
    }

    if (hamburger && menu) {
      hamburger.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const open = menu.classList.toggle("open");
        hamburger.setAttribute("aria-expanded", String(open));

        if (open) closeAllDropdowns(root);
      });
    }

    // Dropdowns
    const dropdowns = root.querySelectorAll(".dropdown");
    dropdowns.forEach((dd) => {
      const btn = dd.querySelector(".dropbtn");
      const ddMenu = dd.querySelector(".dropdown-menu");
      if (!btn || !ddMenu) return;

      btn.setAttribute("aria-haspopup", "true");
      if (!btn.hasAttribute("aria-expanded")) btn.setAttribute("aria-expanded", "false");

      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const wasOpen = dd.classList.contains("open");
        closeAllDropdowns(root);

        if (!wasOpen) {
          dd.classList.add("open");
          btn.setAttribute("aria-expanded", "true");
        } else {
          dd.classList.remove("open");
          btn.setAttribute("aria-expanded", "false");
        }
      });

      dd.addEventListener("click", (e) => e.stopPropagation());
      ddMenu.addEventListener("click", (e) => e.stopPropagation());
    });

    // Close on outside click
    document.addEventListener("click", () => closeAllDropdowns(root));

    // ESC closes dropdowns and mobile menu
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      closeAllDropdowns(root);
      closeMobileMenu();
    });

    // Prevent dummy links
    root.querySelectorAll('a[href="#"]').forEach((a) => {
      a.addEventListener("click", (e) => e.preventDefault());
    });

    activateCurrentPage(root);

    // ✅ Live time after injection
    initLiveTime(root);
  }

  /* =========================
     Footer
     ========================= */

  function initFooter(footerHost) {
    if (!footerHost) return;
    const yearEl = footerHost.querySelector("#year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  }

  /* =========================
     Boot
     ========================= */

  (async () => {
    const headerHost = await injectHTML("appHeader", "header.html");
    if (headerHost) {
      initHeader(headerHost);
      initAdminLoginModal();
    }

    const footerHost = await injectHTML("appFooter", "footer.html");
    initFooter(footerHost);
  })();

})();
