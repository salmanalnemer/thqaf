   // ================= Demo Data =================
    const data = [
      {
        id: 101,
        title: "دورة سفير الحياة",
        kind: "course",
        audience: "أفراد",
        track: "تثقيف مجتمعي",
        requester: { name: "سلمان", dept: "التدريب", phone: "05xxxxxxx", email: "user@thqaf.sa" },
        date: "2025-12-22",
        status: "pending",
        notes: "محتوى توعوي مناسب للجمهور العام."
      },
      {
        id: 102,
        title: "مبادرة المسعف الصغير",
        kind: "initiative",
        audience: "أطفال",
        track: "مبادرات",
        requester: { name: "أحمد", dept: "التوعية", phone: "05xxxxxxx", email: "a@thqaf.sa" },
        date: "2025-12-21",
        status: "pending",
        notes: "محتاج موافقة مسار المدارس/الأسر."
      },
      {
        id: 103,
        title: "دورة الثمان الأولى",
        kind: "course",
        audience: "أفراد",
        track: "إسعافات أولية",
        requester: { name: "نورا", dept: "المدربين", phone: "05xxxxxxx", email: "n@thqaf.sa" },
        date: "2025-12-20",
        status: "pending",
        notes: "مراجعة مدة الدورة وخطة المحتوى."
      }
    ];

    const els = {
      rows: document.getElementById('rows'),
      q: document.getElementById('q'),
      type: document.getElementById('type'),
      status: document.getElementById('status'),
      applyBtn: document.getElementById('applyBtn'),
      resetBtn: document.getElementById('resetBtn'),
      exportBtn: document.getElementById('exportBtn'),

      cntPending: document.getElementById('cntPending'),
      cntApproved: document.getElementById('cntApproved'),
      cntRejected: document.getElementById('cntRejected'),

      modalBack: document.getElementById('modalBack'),
      closeModal: document.getElementById('closeModal'),
      kvCourse: document.getElementById('kvCourse'),
      kvRequester: document.getElementById('kvRequester'),
      rejectBox: document.getElementById('rejectBox'),
      rejectReason: document.getElementById('rejectReason'),
      modalApprove: document.getElementById('modalApprove'),
      modalReject: document.getElementById('modalReject'),
      modalViewOnly: document.getElementById('modalViewOnly'),
      modalHint: document.getElementById('modalHint'),
    };

    let current = null;

    function kindLabel(k){
      return k === "course" ? "دورة" : "مبادرة";
    }

    function statusPill(s){
      if(s === "approved") return `<span class="statusPill approved">معتمد</span>`;
      if(s === "rejected") return `<span class="statusPill rejected">مرفوض</span>`;
      return `<span class="statusPill pending">قيد المراجعة</span>`;
    }

    function updateCounters(list){
      const p = list.filter(x => x.status === "pending").length;
      const a = list.filter(x => x.status === "approved").length;
      const r = list.filter(x => x.status === "rejected").length;
      els.cntPending.textContent = p;
      els.cntApproved.textContent = a;
      els.cntRejected.textContent = r;
    }

    function render(list){
      updateCounters(list);
      els.rows.innerHTML = list.map((x, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td>${escapeHtml(x.title)}</td>
          <td>${kindLabel(x.kind)}</td>
          <td>${escapeHtml(x.audience)}</td>
          <td>${escapeHtml(x.track)}</td>
          <td>${escapeHtml(x.requester.name)}</td>
          <td>${escapeHtml(x.date)}</td>
          <td>${statusPill(x.status)}</td>
          <td>
            <div class="actions">
              <button class="aBtn" type="button" data-act="view" data-id="${x.id}">تفاصيل</button>
              <button class="aBtn ok" type="button" data-act="approve" data-id="${x.id}">اعتماد</button>
              <button class="aBtn no" type="button" data-act="reject" data-id="${x.id}">رفض</button>
            </div>
          </td>
        </tr>
      `).join('');
    }

    function applyFilters(){
      const q = (els.q.value || "").trim().toLowerCase();
      const t = els.type.value;
      const s = els.status.value;

      const filtered = data.filter(x => {
        const hit =
          x.title.toLowerCase().includes(q) ||
          x.track.toLowerCase().includes(q) ||
          x.requester.name.toLowerCase().includes(q);
        const okQ = q ? hit : true;
        const okT = (t === "all") ? true : x.kind === t;
        const okS = (s === "all") ? true : x.status === s;
        return okQ && okT && okS;
      });

      render(filtered);
    }

    function resetFilters(){
      els.q.value = "";
      els.type.value = "all";
      els.status.value = "all";
      render(data);
    }

    function openModal(item, mode="view"){
      current = item;
      els.modalBack.classList.add('open');
      els.modalBack.setAttribute('aria-hidden', 'false');

      // fill
      els.kvCourse.innerHTML = `
        <span>رقم الطلب</span><b>#${item.id}</b>
        <span>العنوان</span><b>${escapeHtml(item.title)}</b>
        <span>النوع</span><b>${kindLabel(item.kind)}</b>
        <span>الفئة</span><b>${escapeHtml(item.audience)}</b>
        <span>المسار</span><b>${escapeHtml(item.track)}</b>
        <span>ملاحظات</span><b>${escapeHtml(item.notes || "-")}</b>
      `;

      els.kvRequester.innerHTML = `
        <span>الاسم</span><b>${escapeHtml(item.requester.name)}</b>
        <span>الإدارة</span><b>${escapeHtml(item.requester.dept)}</b>
        <span>الجوال</span><b>${escapeHtml(item.requester.phone)}</b>
        <span>البريد</span><b>${escapeHtml(item.requester.email)}</b>
        <span>تاريخ الطلب</span><b>${escapeHtml(item.date)}</b>
      `;

      els.rejectReason.value = "";
      els.rejectBox.classList.remove('open');

      if(mode === "reject"){
        els.rejectBox.classList.add('open');
        els.modalHint.textContent = "اكتب سبب الرفض ثم اضغط (رفض) لتأكيد العملية.";
      } else if(mode === "approve"){
        els.modalHint.textContent = "اضغط (اعتماد) لتأكيد اعتماد هذا الطلب.";
      } else {
        els.modalHint.textContent = "عرض تفاصيل الطلب فقط.";
      }
    }

    function closeModal(){
      els.modalBack.classList.remove('open');
      els.modalBack.setAttribute('aria-hidden', 'true');
      current = null;
    }

    function setStatus(id, status){
      const item = data.find(x => x.id === id);
      if(!item) return;
      item.status = status;
      applyFilters();
    }

    function exportCSV(){
      const header = ["id","title","kind","audience","track","requester","date","status"];
      const lines = [header.join(",")];

      data.forEach(x => {
        const row = [
          x.id,
          `"${(x.title || "").replaceAll('"','""')}"`,
          x.kind,
          `"${(x.audience || "").replaceAll('"','""')}"`,
          `"${(x.track || "").replaceAll('"','""')}"`,
          `"${(x.requester?.name || "").replaceAll('"','""')}"`,
          x.date,
          x.status
        ];
        lines.push(row.join(","));
      });

      const blob = new Blob([lines.join("\n")], {type:"text/csv;charset=utf-8"});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = "approve-courses.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    }

    // Security: basic HTML escaping for demo render
    function escapeHtml(str){
      return String(str ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }

    // Events
    els.applyBtn.addEventListener('click', applyFilters);
    els.resetBtn.addEventListener('click', resetFilters);
    els.exportBtn.addEventListener('click', exportCSV);

    els.rows.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-act]');
      if(!btn) return;
      const id = Number(btn.dataset.id);
      const act = btn.dataset.act;
      const item = data.find(x => x.id === id);
      if(!item) return;

      if(act === "view") openModal(item, "view");
      if(act === "approve") openModal(item, "approve");
      if(act === "reject") openModal(item, "reject");
    });

    els.closeModal.addEventListener('click', closeModal);
    els.modalBack.addEventListener('click', (e) => {
      if(e.target === els.modalBack) closeModal();
    });

    els.modalViewOnly.addEventListener('click', () => {
      els.rejectBox.classList.remove('open');
      els.modalHint.textContent = "عرض تفاصيل الطلب فقط.";
    });

    els.modalApprove.addEventListener('click', () => {
      if(!current) return;
      setStatus(current.id, "approved");
      closeModal();
    });

    els.modalReject.addEventListener('click', () => {
      if(!current) return;
      // show box if not visible
      if(!els.rejectBox.classList.contains('open')){
        els.rejectBox.classList.add('open');
        els.modalHint.textContent = "اكتب سبب الرفض ثم اضغط (رفض) لتأكيد العملية.";
        return;
      }
      const reason = (els.rejectReason.value || "").trim();
      if(reason.length < 5){
        els.rejectReason.focus();
        return;
      }
      setStatus(current.id, "rejected");
      closeModal();
    });

    // init
    render(data);