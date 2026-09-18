/* ═══════════════════════════════════════════════════
   ซักป่ะ? — Interactive Logic
   Price Calculator, FAQ Accordion, Navbar Scroll
   ═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ─────────────────────────────────────────────
  // PRICE CALCULATOR
  // ─────────────────────────────────────────────
  let selectedSize = 's';
  let selectedDetergent = 'own';
  let selectedZone = 'off';

  const sizeBtns = document.querySelectorAll('.size-btn');
  const detBtns = document.querySelectorAll('.detergent-btn');
  const locBtns = document.querySelectorAll('.loc-btn');
  const priceTotal = document.getElementById('price-total');
  const priceBase = document.getElementById('price-base');
  const priceDetergent = document.getElementById('price-detergent');
  const priceSurcharge = document.getElementById('price-surcharge');

  function updatePrice() {
    const calc = calculateSukpaPrice({
      sizeKey: selectedSize,
      detergentKey: selectedDetergent,
      zoneKey: selectedZone
    });

    // Animate price change
    if (priceTotal) {
      priceTotal.classList.remove('price-animate');
      void priceTotal.offsetWidth; // trigger reflow
      priceTotal.classList.add('price-animate');
      priceTotal.textContent = `฿${calc.total}`;
    }
    if (priceBase) {
      priceBase.textContent = `฿${calc.sizePrice}`;
    }
    if (priceDetergent) {
      priceDetergent.textContent = calc.detergentSurcharge > 0 ? `+฿${calc.detergentSurcharge}` : 'ฟรี (นำมาเอง)';
    }
    if (priceSurcharge) {
      priceSurcharge.textContent = calc.zoneSurcharge > 0 ? `+฿${calc.zoneSurcharge}` : '฿0';
    }
  }

  // Size button handlers
  sizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sizeBtns.forEach(b => {
        b.classList.remove('selected');
        b.classList.remove('border-blue-500', 'bg-blue-50/50');
        b.classList.add('border-slate-200', 'bg-white');
      });

      btn.classList.add('selected');
      btn.classList.remove('border-slate-200', 'bg-white');
      btn.classList.add('border-blue-500', 'bg-blue-50/50');

      selectedSize = btn.dataset.size || 's';
      updatePrice();
      syncCalculatorToBooking('size', selectedSize);
    });
  });

  // Detergent button handlers
  detBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      detBtns.forEach(b => {
        b.classList.remove('selected');
        b.classList.remove('border-blue-500', 'bg-blue-50/50');
        b.classList.add('border-slate-200', 'bg-white');
      });

      btn.classList.add('selected');
      btn.classList.remove('border-slate-200', 'bg-white');
      btn.classList.add('border-blue-500', 'bg-blue-50/50');

      selectedDetergent = btn.dataset.detergent || 'own';
      updatePrice();
      syncCalculatorToBooking('detergent', selectedDetergent);
    });
  });

  // Location button handlers
  locBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      locBtns.forEach(b => {
        b.classList.remove('selected');
        b.classList.remove('border-blue-500', 'bg-blue-50/50');
        b.classList.add('border-slate-200', 'bg-white');
      });

      btn.classList.add('selected');
      btn.classList.remove('border-slate-200', 'bg-white');
      btn.classList.add('border-blue-500', 'bg-blue-50/50');

      selectedZone = btn.dataset.location || 'off';
      updatePrice();
      syncCalculatorToBooking('location', selectedZone);
    });
  });

  // ─────────────────────────────────────────────
  // FAQ ACCORDION
  // ─────────────────────────────────────────────
  const faqTriggers = document.querySelectorAll('.faq-trigger');

  faqTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const faqItem = trigger.closest('.faq-item');
      const content = faqItem.querySelector('.faq-content');
      const isActive = faqItem.classList.contains('active');

      // Close all others
      document.querySelectorAll('.faq-item.active').forEach(item => {
        if (item !== faqItem) {
          item.classList.remove('active');
          const c = item.querySelector('.faq-content');
          c.style.maxHeight = null;
          c.classList.add('hidden');
        }
      });

      // Toggle current
      if (isActive) {
        faqItem.classList.remove('active');
        content.style.maxHeight = null;
        setTimeout(() => content.classList.add('hidden'), 350);
      } else {
        faqItem.classList.add('active');
        content.classList.remove('hidden');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });

  // ─────────────────────────────────────────────
  // NAVBAR SCROLL EFFECT
  // ─────────────────────────────────────────────
  const navbar = document.getElementById('navbar');
  let lastScrollY = 0;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScrollY = currentScrollY;
  }, { passive: true });

  // ─────────────────────────────────────────────
  // STATS COUNTER ANIMATION
  // ─────────────────────────────────────────────
  const counters = document.querySelectorAll('.counter');
  let countersAnimated = false;

  function runCounters() {
    if (countersAnimated) return;
    countersAnimated = true;

    counters.forEach(counter => {
      const target = parseInt(counter.dataset.target, 10);
      const duration = 1200; // ms
      const stepTime = 20;
      const totalSteps = duration / stepTime;
      const increment = target / totalSteps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          counter.textContent = target;
          clearInterval(timer);
        } else {
          counter.textContent = Math.floor(current);
        }
      }, stepTime);
    });
  }

  // ─────────────────────────────────────────────
  // BOOKING MESSAGE GENERATOR (ระบบช่วยสร้างข้อความจองคิว)
  // ─────────────────────────────────────────────
  const bfName = document.getElementById('bf-name');
  const bfPhone = document.getElementById('bf-phone');
  const bfDorm = document.getElementById('bf-dorm');
  const bfNotes = document.getElementById('bf-notes');
  const previewText = document.getElementById('preview-text');
  const previewTimestamp = document.getElementById('preview-timestamp');
  const bfTotalDisplay = document.getElementById('bf-total-display');
  const openChatSendBtn = document.getElementById('openchat-send-btn');
  const lineCopyBtn = document.getElementById('line-copy-btn');
  const copyBtnText = document.getElementById('copy-btn-text');
  const toastNotify = document.getElementById('toast-notify');
  const dormChips = document.querySelectorAll('.dorm-chip');
  const OPENCHAT_URL = 'https://line.me/ti/g2/c4n6z-xzaKCXJcKWlGoLYVoxeAxBuZNRcGEg1A?utm_source=invitation&utm_medium=link_copy&utm_campaign=default';

  // Booking Form State
  const bfState = {
    name: '',
    phone: '',
    dorm: '',
    fabricKey: 'general',
    fabricText: 'ผ้าทั่วไป',
    sizeKey: 's',
    detergentKey: 'own',
    zoneKey: 'off',
    notes: ''
  };

  function updateTimePreview() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    if (previewTimestamp) {
      previewTimestamp.textContent = `${hours}:${mins} น.`;
    }
  }

  function generateMessageText() {
    return buildSukpaBookingMessage({
      name: bfState.name,
      phone: bfState.phone,
      dorm: bfState.dorm,
      notes: bfState.notes,
      fabricText: bfState.fabricText,
      sizeKey: bfState.sizeKey,
      detergentKey: bfState.detergentKey,
      zoneKey: bfState.zoneKey
    });
  }

  function updateBookingPreview() {
    const msg = generateMessageText();
    const calc = calculateSukpaPrice({
      sizeKey: bfState.sizeKey,
      detergentKey: bfState.detergentKey,
      zoneKey: bfState.zoneKey
    });

    if (previewText) previewText.textContent = msg;
    if (bfTotalDisplay) bfTotalDisplay.textContent = `฿${calc.total}`;
  }

  // Name Input
  if (bfName) {
    bfName.addEventListener('input', (e) => {
      bfState.name = e.target.value;
      updateBookingPreview();
    });
  }

  // Auto-format phone number (08X-XXX-XXXX)
  if (bfPhone) {
    bfPhone.addEventListener('input', (e) => {
      let digits = e.target.value.replace(/\D/g, '');
      if (digits.length > 10) digits = digits.slice(0, 10);

      let formatted = digits;
      if (digits.length > 6) {
        formatted = `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
      } else if (digits.length > 3) {
        formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
      }
      e.target.value = formatted;
      bfState.phone = formatted;
      updateBookingPreview();
    });
  }

  // Dorm Input
  if (bfDorm) {
    bfDorm.addEventListener('input', (e) => {
      bfState.dorm = e.target.value;
      updateBookingPreview();
    });
  }

  // Notes Input
  if (bfNotes) {
    bfNotes.addEventListener('input', (e) => {
      bfState.notes = e.target.value;
      updateBookingPreview();
    });
  }

  // Quick Dorm Chips
  dormChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const dormName = chip.dataset.dorm;
      if (bfDorm) {
        bfDorm.value = dormName;
        bfState.dorm = dormName;
        updateBookingPreview();
      }
    });
  });

  // Booking choice cards (Size, Detergent, Time, Zone)
  const choiceCards = document.querySelectorAll('.booking-choice-card');
  choiceCards.forEach(card => {
    card.addEventListener('click', () => {
      const group = card.dataset.group;
      if (!group) return;

      // Deselect all cards in group
      const siblings = document.querySelectorAll(`.booking-choice-card[data-group="${group}"]`);
      siblings.forEach(s => {
        s.classList.remove('active');
        s.classList.remove('border-[#06C755]', 'bg-[#06C755]/5');
        s.classList.add('border-slate-200', 'bg-white');
        const check = s.querySelector('.choice-check');
        if (check) {
          check.classList.remove('opacity-100');
          check.classList.add('opacity-0');
        }
      });

      // Activate clicked card
      card.classList.add('active');
      card.classList.remove('border-slate-200', 'bg-white');
      card.classList.add('border-[#06C755]', 'bg-[#06C755]/5');
      const check = card.querySelector('.choice-check');
      if (check) {
        check.classList.remove('opacity-0');
        check.classList.add('opacity-100');
      }

      // Update state
      if (group === 'fabric') {
        bfState.fabricKey = card.dataset.value;
        bfState.fabricText = card.dataset.text || 'ผ้าทั่วไป';
      } else if (group === 'size') {
        bfState.sizeKey = card.dataset.value || 's';
      } else if (group === 'detergent') {
        bfState.detergentKey = card.dataset.value || 'own';
      } else if (group === 'zone') {
        bfState.zoneKey = card.dataset.value || 'off';
      }

      updateBookingPreview();
    });
  });

  // Sync from Price Calculator to Booking Form
  function syncCalculatorToBooking(type, val) {
    if (type === 'size') {
      const targetCard = document.querySelector(`.booking-choice-card[data-group="size"][data-value="${val}"]`);
      if (targetCard) targetCard.click();
    } else if (type === 'detergent') {
      const targetCard = document.querySelector(`.booking-choice-card[data-group="detergent"][data-value="${val}"]`);
      if (targetCard) targetCard.click();
    } else if (type === 'location') {
      const targetCard = document.querySelector(`.booking-choice-card[data-group="zone"][data-value="${val}"]`);
      if (targetCard) targetCard.click();
    }
  }

  // Hook calculator buttons to sync with booking form
  sizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      syncCalculatorToBooking('size', btn.dataset.size);
    });
  });

  locBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      syncCalculatorToBooking('location', btn.dataset.location);
    });
  });

  // Toast Notification
  let toastTimer = null;
  function showToast(text) {
    if (!toastNotify) return;
    const toastText = document.getElementById('toast-text');
    if (toastText && text) toastText.textContent = text;
    toastNotify.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastNotify.classList.remove('show');
    }, 3200);
  }

  // Reusable Copy Booking Message
  async function copyBookingMessage() {
    const msg = generateMessageText();
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(msg);
      } else {
        const ta = document.createElement('textarea');
        ta.value = msg;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      return true;
    } catch (err) {
      console.error('Failed to copy', err);
      return false;
    }
  }

  // Primary Action: Copy message & Open LINE OpenChat
  if (openChatSendBtn) {
    openChatSendBtn.addEventListener('click', async () => {
      const ok = await copyBookingMessage();
      if (ok) {
        showToast('คัดลอกข้อความสำเร็จ! กำลังเปิด LINE OpenChat นำไปวาง (Paste) ในกลุ่มได้เลย 💬✨');
      } else {
        showToast('กำลังเปิด LINE OpenChat... (สามารถคัดลอกข้อความจากกล่องตัวอย่างได้ครับ)');
      }
      setTimeout(() => {
        window.open(OPENCHAT_URL, '_blank', 'noopener,noreferrer');
      }, 400);
    });
  }

  // Secondary Action: Copy Message to Clipboard Only
  if (lineCopyBtn) {
    lineCopyBtn.addEventListener('click', async () => {
      const ok = await copyBookingMessage();
      if (ok) {
        if (copyBtnText) {
          copyBtnText.textContent = 'คัดลอกแล้ว! ✅';
          setTimeout(() => {
            copyBtnText.textContent = 'คัดลอกข้อความ';
          }, 2500);
        }
        showToast('คัดลอกข้อความสำเร็จ! นำไปวางในกลุ่ม OpenChat ได้เลย 📋✨');
      } else {
        showToast('คัดลอกไม่สำเร็จ กรุณากดเลือกข้อความในกล่องแล้วคัดลอก');
      }
    });
  }

  // Initialize booking helper
  updateTimePreview();
  updateBookingPreview();

  // ─────────────────────────────────────────────
  // SCROLL REVEAL (Intersection Observer)
  // ─────────────────────────────────────────────
  const revealSections = document.querySelectorAll(
    '#rainy-promo, #how-it-works, #stats, #calculator, #booking-generator, #delivery-zones, #faq, #final-cta'
  );

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal', 'visible');

        // Trigger counters when stats section is visible
        if (entry.target.id === 'stats') {
          runCounters();
        }

        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealSections.forEach(section => {
    section.classList.add('reveal');
    revealObserver.observe(section);
  });

  // ─────────────────────────────────────────────
  // LAUNDRY PREP CHECKLIST INTERACTIVITY
  // ─────────────────────────────────────────────
  const checklistCards = document.querySelectorAll('.checklist-card');
  const checklistStatusText = document.getElementById('checklist-status-text');
  const checklistStatusIcon = document.getElementById('checklist-status-icon');
  const checklistStatusBar = document.getElementById('checklist-status-bar');

  function updateChecklistProgress() {
    if (!checklistCards.length) return;
    const total = checklistCards.length;
    let checkedCount = 0;

    checklistCards.forEach(card => {
      const checkbox = card.querySelector('.checklist-toggle');
      if (checkbox && checkbox.checked) {
        checkedCount++;
        card.classList.add('checked');
      } else {
        card.classList.remove('checked');
      }
    });

    if (checklistStatusText && checklistStatusBar) {
      if (checkedCount === 0) {
        checklistStatusText.textContent = 'เช็คครบ 4 ข้อแล้วกดจองคิวผ่านเว็บด้านล่างได้เลยครับ!';
        if (checklistStatusIcon) checklistStatusIcon.textContent = '📋';
        checklistStatusBar.className = 'inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-slate-100 text-slate-600 text-xs font-semibold transition-all duration-300';
      } else if (checkedCount < total) {
        checklistStatusText.textContent = `เช็คแล้ว ${checkedCount}/${total} ข้อ (อีก ${total - checkedCount} ข้อพร้อมส่งซักแล้วครับ)`;
        if (checklistStatusIcon) checklistStatusIcon.textContent = '⏳';
        checklistStatusBar.className = 'inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold transition-all duration-300';
      } else {
        checklistStatusText.textContent = '✨ เช็คครบ 4 ข้อแล้ว ผ้าพร้อมส่งซักเรียบร้อยครับ!';
        if (checklistStatusIcon) checklistStatusIcon.textContent = '🎉';
        checklistStatusBar.className = 'inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-green-50 text-green-700 border border-green-200 shadow-sm text-xs font-bold transition-all duration-300';
        showToast('ยอดเยี่ยม! เช็คครบทุกข้อแล้ว ไปจองคิวผ่านเว็บกันได้เลย 🧺✨');
      }
    }
  }

  checklistCards.forEach(card => {
    const checkbox = card.querySelector('.checklist-toggle');
    if (checkbox) {
      checkbox.addEventListener('change', () => {
        updateChecklistProgress();
      });
    }

    // Allow clicking the card anywhere to toggle
    card.addEventListener('click', (e) => {
      if (e.target.closest('label') || e.target.tagName === 'INPUT') return;
      if (checkbox) {
        checkbox.checked = !checkbox.checked;
        updateChecklistProgress();
      }
    });
  });

  // ─────────────────────────────────────────────
  // SMOOTH SCROLL for anchor links
  // ─────────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offsetTop = target.offsetTop - 80; // account for fixed nav
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });

  // ─────────────────────────────────────────────
  // VISITOR COUNTER (localStorage-based)
  // นับผู้เข้าชมแบบ client-side ใช้ sessionStorage
  // กันนับซ้ำในการเปิดแท็บเดิม แต่นับใหม่ทุกครั้งที่เปิดเว็บ
  // ─────────────────────────────────────────────
  const visitorEl = document.getElementById('visitor-count');
  if (visitorEl) {
    const STORAGE_KEY = 'zakpa_visitors';
    const SESSION_KEY = 'zakpa_visited_this_session';

    // เพิ่มนับเฉพาะครั้งแรกของ session นี้
    if (!sessionStorage.getItem(SESSION_KEY)) {
      sessionStorage.setItem(SESSION_KEY, '1');
      const current = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
      localStorage.setItem(STORAGE_KEY, current + 1);
    }

    const total = parseInt(localStorage.getItem(STORAGE_KEY) || '1', 10);

    // Animate count up
    let start = 0;
    const duration = 1200;
    const step = Math.ceil(total / (duration / 16));
    const timer = setInterval(() => {
      start = Math.min(start + step, total);
      visitorEl.textContent = start.toLocaleString('th-TH');
      if (start >= total) clearInterval(timer);
    }, 16);
  }

});


