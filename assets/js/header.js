/* ============================================================
   THQAF - Header & Footer Injector + Dropdown Interactions
   ------------------------------------------------------------
   هذا الملف مسؤول عن:
   1) حقن header.html داخل #appHeader و footer.html داخل #appFooter
   2) تهيئة قائمة الجوال (الهامبرغر)
   3) تهيئة جميع القوائم المنسدلة (courses / support / account ... إلخ)
   4) إغلاق القوائم عند الضغط خارجها أو عند الضغط على ESC
   5) تفعيل رابط الصفحة الحالية عبر data-page (اختياري)
   6) تفعيل مودل تسجيل دخول الإدارة (يعمل في كل الصفحات بعد حقن الهيدر)
   ============================================================ */

(function () {
  "use strict";

  /* =========================
     أدوات مساعدة (Helpers)
     ========================= */

  // حقن ملف HTML داخل عنصر محدد
  async function injectHTML(targetId, filePath) {
    const target = document.getElementById(targetId);
    if (!target) return null;

    try {
      const res = await fetch(filePath, { cache: "no-store" });
      if (!res.ok) throw new Error(`${filePath} HTTP ${res.status}`);

      target.innerHTML = await res.text();
      return target;
    } catch (err) {
      console.error(err);
      target.innerHTML = `
        <div class="injectError">
          تعذر تحميل <b>${filePath}</b> — شغّل المشروع عبر Live Server / XAMPP.
        </div>
      `;
      return null;
    }
  }

  // إغلاق جميع الدروب داون داخل نطاق معيّن (الهيدر عادة)
  function closeAllDropdowns(root) {
    root.querySelectorAll(".dropdown.open").forEach((dd) => {
      dd.classList.remove("open");
      const btn = dd.querySelector(".dropbtn");
      if (btn) btn.setAttribute("aria-expanded", "false");
    });
  }

  // تفعيل رابط الصفحة الحالية (اختياري)
  function activateCurrentPage(root) {
    const current = document.body.getAttribute("data-page");
    if (!current) return;

    const activeEl = root.querySelector(`[data-page="${current}"]`);
    if (activeEl) activeEl.classList.add("isActive");
  }

  /* =========================
     ✅ تهيئة مودل تسجيل دخول الإدارة
     - يجب أن تكون العناصر موجودة داخل header.html
     - يعمل بعد الحقن في كل الصفحات
     ========================= */
  function initAdminLoginModal(root) {
    // حماية: لا تربط الأحداث مرتين
    if (document.documentElement.dataset.thqafLoginBound === "1") return;
    document.documentElement.dataset.thqafLoginBound = "1";

    // ملاحظة: بما أن الهيدر يُحقن لاحقاً، نستخدم Delegation على document
    document.addEventListener("click", (e) => {
      const loginBtn = e.target.closest("#loginBtn");
      if (!loginBtn) return;

      const adminModal = document.getElementById("adminModal");
      if (!adminModal) return;

      adminModal.classList.add("active");
      adminModal.setAttribute("aria-hidden", "false");

      const adminPhone = document.getElementById("adminPhone");
      if (adminPhone) setTimeout(() => adminPhone.focus(), 0);
    });

    // إغلاق المودل (زر إغلاق / إلغاء)
    document.addEventListener("click", (e) => {
      const closeBtn = e.target.closest("#closeAdminModal");
      const cancelBtn = e.target.closest("#cancelAdminModal");
      if (!closeBtn && !cancelBtn) return;

      const adminModal = document.getElementById("adminModal");
      if (!adminModal) return;

      adminModal.classList.remove("active");
      adminModal.setAttribute("aria-hidden", "true");
    });

    // إغلاق عند الضغط على الخلفية
    document.addEventListener("click", (e) => {
      const adminModal = document.getElementById("adminModal");
      if (!adminModal || !adminModal.classList.contains("active")) return;

      // الضغط على الخلفية نفسها (overlay)
      if (e.target === adminModal) {
        adminModal.classList.remove("active");
        adminModal.setAttribute("aria-hidden", "true");
      }
    });

    // إغلاق بالزر ESC
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;

      const adminModal = document.getElementById("adminModal");
      if (!adminModal || !adminModal.classList.contains("active")) return;

      adminModal.classList.remove("active");
      adminModal.setAttribute("aria-hidden", "true");
    });
  }

  /* =========================
     تهيئة تفاعلات الهيدر
     ========================= */
  function initHeader(headerHost) {
    const root = headerHost || document;

    // حماية: لا تربط الأحداث مرتين
    if (root.dataset.thqafHeaderBound === "1") return;
    root.dataset.thqafHeaderBound = "1";

    const hamburger = root.querySelector("#hamburger");
    const menu = root.querySelector("#menu");

    // 1) قائمة الجوال (☰)
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

        // عند فتح قائمة الجوال: اقفل أي دروب داون مفتوح
        if (open) closeAllDropdowns(root);
      });
    }

    // 2) القوائم المنسدلة (Generic)
    const dropdowns = root.querySelectorAll(".dropdown");

    dropdowns.forEach((dd) => {
      const btn = dd.querySelector(".dropbtn");
      const ddMenu = dd.querySelector(".dropdown-menu");

      if (!btn || !ddMenu) return;

      // تهيئة aria
      btn.setAttribute("aria-haspopup", "true");
      if (!btn.hasAttribute("aria-expanded")) btn.setAttribute("aria-expanded", "false");

      // عند الضغط على زر الدروب داون
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

    // 3) إغلاق عند الضغط خارج الهيدر
    document.addEventListener("click", () => {
      closeAllDropdowns(root);
    });

    // 4) إغلاق بالزر ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeAllDropdowns(root);
        closeMobileMenu();
      }
    });

    // 5) منع روابط # فقط
    root.querySelectorAll('a[href="#"]').forEach((a) => {
      a.addEventListener("click", (e) => e.preventDefault());
    });

    // 6) تفعيل رابط الصفحة الحالية (اختياري)
    activateCurrentPage(root);
  }

  /* =========================
     تهيئة الفوتر
     ========================= */
  function initFooter(footerHost) {
    if (!footerHost) return;
    const yearEl = footerHost.querySelector("#year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  }

  /* =========================
     تشغيل الحقن عند تحميل الصفحة
     ========================= */
  (async () => {
    const headerHost = await injectHTML("appHeader", "./header.html");
    if (headerHost) {
      initHeader(headerHost);

      // ✅ مهم: تفعيل مودل تسجيل الدخول بعد حقن الهيدر
      initAdminLoginModal(headerHost);
    }

    const footerHost = await injectHTML("appFooter", "./footer.html");
    initFooter(footerHost);
  })();
})();
