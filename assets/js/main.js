/**
 * Link International Travels & Tours - Main JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      navMenu.classList.toggle('open');
    });

    // Close mobile menu on link click
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        navMenu.classList.remove('open');
      });
    });
  }

  // 2. Header shadow on scroll
  const siteHeader = document.getElementById('siteHeader');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      siteHeader?.classList.add('scrolled');
    } else {
      siteHeader?.classList.remove('scrolled');
    }
  });

  // 3. Interactive Booking Modal
  const bookingModal = document.getElementById('bookingModal');
  const modalClose = document.getElementById('modalClose');

  function openModal(defaultService = '') {
    if (!bookingModal) return;
    bookingModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    const serviceSelect = document.getElementById('modalService');
    if (serviceSelect && serviceSelect.options && serviceSelect.options.length > 0) {
      // Start from the placeholder ("-- Select Service --")
      serviceSelect.selectedIndex = 0;
      if (defaultService) {
        const lower = defaultService.toLowerCase();
        let matched = false;
        // 1. Exact match
        for (let opt of serviceSelect.options) {
          if (!opt.value) continue;
          if (opt.value === defaultService || opt.text === defaultService) {
            serviceSelect.value = opt.value;
            matched = true;
            break;
          }
        }
        // 2. Partial / case-insensitive match
        if (!matched) {
          for (let opt of serviceSelect.options) {
            if (!opt.value) continue;
            const optVal = opt.value.toLowerCase();
            const optTxt = opt.text.toLowerCase();
            if (optVal.includes(lower) || optTxt.includes(lower) || lower.includes(optVal) || lower.includes(optTxt)) {
              serviceSelect.value = opt.value;
              matched = true;
              break;
            }
          }
        }
        // 3. Fallback: if not matched and it's a specific package name, append dynamically
        if (!matched && defaultService !== 'Hajj' && defaultService !== 'Umrah' && defaultService !== 'Visa' && defaultService !== 'Tour') {
          const opt = document.createElement('option');
          opt.value = defaultService;
          opt.textContent = defaultService;
          opt.selected = true;
          serviceSelect.appendChild(opt);
          serviceSelect.value = defaultService;
        }
      }
    }
    setTimeout(() => document.getElementById('modalName')?.focus(), 50);
  }

  function closeModal() {
    if (!bookingModal) return;
    bookingModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Delegated click handler so all buttons (including dynamic custom packages) work seamlessly
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.open-booking-modal, .btn-hajj-view-details, .btn-reserve-offer, .btn-book-now, .btn-package:not([type="submit"]), a.btn-gold, button.btn-gold:not([type="submit"])');
    if (!btn || btn.closest('form')) return;

    if (btn.getAttribute('data-action') === 'contact' || btn.getAttribute('href')?.startsWith('tel:') || btn.getAttribute('href')?.startsWith('mailto:')) {
      return;
    }

    const href = btn.tagName === 'A' ? (btn.getAttribute('href') || '').trim() : '';
    if (href && href !== '#' && !href.startsWith('javascript:') && !btn.classList.contains('open-booking-modal')) {
      return;
    }

    e.preventDefault();
    let service = btn.getAttribute('data-service') || '';
    if (!service) {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('hajj.html') || (path.includes('hajj') && !path.includes('umrah'))) {
        service = 'Hajj';
      } else if (path.includes('umrah')) {
        service = 'Umrah';
      } else if (path.includes('visa')) {
        service = 'Visa';
      } else if (path.includes('flight') || path.includes('ticketing')) {
        service = 'Air Ticketing';
      } else if (path.includes('tour')) {
        service = 'Tour';
      }
    }
    openModal(service);
  });

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && bookingModal?.classList.contains('active')) closeModal();
  });

  if (bookingModal) {
    bookingModal.addEventListener('click', (e) => {
      if (e.target === bookingModal) {
        closeModal();
      }
    });
  }

  // Handle Booking Form Submit (Forward to WhatsApp 0300-8053198)
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('modalName')?.value.trim() || '';
      const phone = document.getElementById('modalPhone')?.value.trim() || '';
      const serviceSelect = document.getElementById('modalService');
      const service = serviceSelect?.options[serviceSelect.selectedIndex]?.text?.trim() || '';
      const persons = document.getElementById('modalPersons')?.value.trim() || '';
      const notes = document.getElementById('modalNotes')?.value.trim() || '';

      if (!name || !phone || !service || !serviceSelect.value) {
        bookingForm.reportValidity();
        return;
      }

      const WHATSAPP_NUMBER = '923008053198';
      let waMsg = `✈️ *New Booking Request - Link International Travels*\n`;
      waMsg += `━━━━━━━━━━━━━━━━━━━━━\n`;
      waMsg += `👤 *Name:* ${name}\n`;
      waMsg += `📱 *Phone / WhatsApp:* ${phone}\n`;
      waMsg += `📦 *Package:* ${service}\n`;
      if (persons) waMsg += `👥 *Persons:* ${persons}\n`;
      if (notes) waMsg += `💬 *Message:* ${notes}\n`;
      waMsg += `━━━━━━━━━━━━━━━━━━━━━\n`;
      waMsg += `Assalam-o-Alaikum, I submitted this request via the website. Please contact me. Shukriya!`;

      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMsg)}`;

      // Open WhatsApp directly (no setTimeout) to avoid popup blockers
      const win = window.open(waUrl, '_blank');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        window.location.href = waUrl;
      }

      closeModal();
      bookingForm.reset();
    });
  }

  // Handle Contact Page Form Submit (Forward to WhatsApp 0300-8053198)
  const contactInquiryForm = document.getElementById('contactInquiryForm');
  if (contactInquiryForm) {
    contactInquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contactName')?.value.trim() || 'Guest';
      const email = document.getElementById('contactEmail')?.value.trim() || '';
      const phone = document.getElementById('contactPhone')?.value.trim() || '';
      const message = document.getElementById('contactMessage')?.value.trim() || '';

      const WHATSAPP_NUMBER = '923008053198';
      let waMsg = `📩 *Contact Inquiry - Link International Travels*\n`;
      waMsg += `━━━━━━━━━━━━━━━━━━━━━\n`;
      waMsg += `👤 *Customer Name:* ${name}\n`;
      if (email) waMsg += `📧 *Email Address:* ${email}\n`;
      if (phone) waMsg += `📱 *Phone / WhatsApp:* ${phone}\n`;
      if (message) waMsg += `💬 *Message:* ${message}\n`;
      waMsg += `━━━━━━━━━━━━━━━━━━━━━\n`;
      waMsg += `Assalam-o-Alaikum, I sent an inquiry via the website contact form. Kindly reply on WhatsApp. Shukriya!`;

      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMsg)}`;
      const win = window.open(waUrl, '_blank');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        window.location.href = waUrl;
      }
      contactInquiryForm.reset();
    });
  }

  // 4. In-page view switcher (For live previewing between Home, About Us, Hajj & Umrah layouts on index.html)
  const viewToggles = document.querySelectorAll('.btn-view-toggle');
  const pageViews = document.querySelectorAll('.page-view-section');

  if (viewToggles.length > 0 && pageViews.length > 0) {
    viewToggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        const targetView = toggle.getAttribute('data-view');
        
        viewToggles.forEach(btn => btn.classList.remove('active'));
        toggle.classList.add('active');

        pageViews.forEach(view => {
          if (view.id === `view-${targetView}`) {
            view.style.display = 'block';
          } else {
            view.style.display = 'none';
          }
        });

        // Update nav links active underline accordingly
        document.querySelectorAll('.nav-link').forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('data-target-view') === targetView) {
            link.classList.add('active');
          }
        });
      });
    });
  }

  // 5. Gallery Category Filter
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (filterBtns.length > 0 && galleryItems.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter') || 'all';

        galleryItems.forEach(item => {
          const categories = (item.getAttribute('data-category') || '').toLowerCase().split(/\s+/);
          
          if (filter === 'all' || categories.includes(filter)) {
            item.style.display = 'block';
            item.style.opacity = '0';
            item.style.transform = 'scale(0.92)';
            setTimeout(() => {
              item.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
              item.style.opacity = '1';
              item.style.transform = 'scale(1)';
            }, 20);
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  // 6. Gallery Lightbox Modal
  const galleryModal = document.getElementById('galleryLightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');

  if (galleryItems.length > 0 && galleryModal) {
    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        const caption = item.getAttribute('data-title') || img?.alt || 'Link International Travels';
        if (img && lightboxImg) {
          lightboxImg.src = img.src;
          lightboxImg.alt = caption;
          if (lightboxCaption) lightboxCaption.textContent = caption;
          galleryModal.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      });
    });

    if (lightboxClose) {
      lightboxClose.addEventListener('click', () => {
        galleryModal.classList.remove('active');
        document.body.style.overflow = '';
      });
    }

    galleryModal.addEventListener('click', (e) => {
      if (e.target === galleryModal) {
        galleryModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // 7. Hero Home Carousel Controller (Hajj & Umrah, Visit Visa, Air Ticketing & Tours)
  const heroCarousel = document.getElementById('homeHeroCarousel');
  if (heroCarousel) {
    const slides = heroCarousel.querySelectorAll('.carousel-slide');
    const dots = heroCarousel.querySelectorAll('.dot-btn');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    let currentSlide = 0;
    let autoSlideInterval = null;
    const AUTO_DELAY = 5500;

    function goToSlide(index) {
      if (!slides.length) return;
      if (index >= slides.length) {
        currentSlide = 0;
      } else if (index < 0) {
        currentSlide = slides.length - 1;
      } else {
        currentSlide = index;
      }

      slides.forEach((slide, idx) => {
        if (idx === currentSlide) {
          slide.classList.add('active');
        } else {
          slide.classList.remove('active');
        }
      });

      dots.forEach((dot, idx) => {
        if (idx === currentSlide) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }

    function nextSlide() {
      goToSlide(currentSlide + 1);
    }

    function prevSlide() {
      goToSlide(currentSlide - 1);
    }

    function startAutoSlide() {
      stopAutoSlide();
      autoSlideInterval = setInterval(nextSlide, AUTO_DELAY);
    }

    function stopAutoSlide() {
      if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
        autoSlideInterval = null;
      }
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        nextSlide();
        startAutoSlide();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        prevSlide();
        startAutoSlide();
      });
    }

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        goToSlide(idx);
        startAutoSlide();
      });
    });

    // Pause on hover
    heroCarousel.addEventListener('mouseenter', stopAutoSlide);
    heroCarousel.addEventListener('mouseleave', startAutoSlide);

    // Pause when tab/window is inactive
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopAutoSlide();
      } else {
        startAutoSlide();
      }
    });

    // Touch swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    heroCarousel.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    heroCarousel.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const swipeDistance = touchStartX - touchEndX;
      if (Math.abs(swipeDistance) > 45) {
        if (swipeDistance > 0) {
          // Swiped left -> next
          nextSlide();
        } else {
          // Swiped right -> prev
          prevSlide();
        }
        startAutoSlide();
      }
    }

    // Keyboard navigation (Arrow keys when hero carousel is visible)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        nextSlide();
        startAutoSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
        startAutoSlide();
      }
    });

    // Initialize auto play
    startAutoSlide();
  }

  // 8. Showcase Banner Hero Slider (Umrah & Hajj pages)
  const showcaseBanner = document.querySelector('.hero-showcase-banner');
  if (showcaseBanner) {
    const dots = showcaseBanner.querySelectorAll('.banner-dot');
    const prevBtn = showcaseBanner.querySelector('.banner-arrow-btn[aria-label="Previous Slide"]');
    const nextBtn = showcaseBanner.querySelector('.banner-arrow-btn[aria-label="Next Slide"]');
    
    const isHajj = window.location.pathname.toLowerCase().includes('hajj.html');
    const slides = isHajj 
      ? ['assets/images/dest-saudi.jpg', 'assets/images/crop-hajj-hero.jpg', 'assets/images/hero-makkah.jpg']
      : ['assets/images/hero-makkah.jpg', 'assets/images/madinah-green-dome.jpg', 'assets/images/grand-mosque.jpg'];
    
    let currentIdx = 0;
    function setBannerSlide(idx) {
      currentIdx = (idx + slides.length) % slides.length;
      showcaseBanner.style.backgroundImage = `url('${slides[currentIdx]}')`;
      dots.forEach((d, i) => d.classList.toggle('active', i === currentIdx));
    }
    
    if (prevBtn) prevBtn.addEventListener('click', () => setBannerSlide(currentIdx - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => setBannerSlide(currentIdx + 1));
    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => setBannerSlide(idx));
    });
  }

  // 9. Interactive Umrah Filter & Live Search
  const filterMonth = document.getElementById('filterMonth');
  const filterSector = document.getElementById('filterSector');
  const filterDuration = document.getElementById('filterDuration');
  const sectorPills = document.querySelectorAll('.sector-pill-btn');
  const btnResetFilters = document.getElementById('btnResetFilters');
  const offersCountBadge = document.getElementById('offersCountBadge');
  const customContainer = document.getElementById('customPackagesContainer');

  let activeSectorPill = 'all';
  let isDirectOnly = false;

  function filterPackages() {
    const cards = document.querySelectorAll('.umrah-offer-card');
    const selectedMonth = filterMonth?.value || 'all';
    const selectedSector = filterSector?.value || 'all';
    const selectedDuration = filterDuration?.value || 'all';

    let visibleCount = 0;

    cards.forEach(card => {
      const cardCity = card.getAttribute('data-city') || '';
      const cardDuration = card.getAttribute('data-duration') || '';
      const cardMonth = card.getAttribute('data-month') || '';
      const cardDirect = card.getAttribute('data-direct') === 'true';

      const matchesMonth = selectedMonth === 'all' || cardMonth === selectedMonth || cardMonth === 'all';
      const matchesSector = (selectedSector === 'all' || cardCity === selectedSector) &&
                            (activeSectorPill === 'all' || cardCity === activeSectorPill);
      const matchesDuration = selectedDuration === 'all' || cardDuration === selectedDuration;
      const matchesDirect = !isDirectOnly || cardDirect;

      if (matchesMonth && matchesSector && matchesDuration && matchesDirect) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (offersCountBadge) {
      offersCountBadge.textContent = `Showing ${visibleCount} of ${cards.length} Offers`;
    }
  }

  if (filterMonth && filterSector && filterDuration) {
    filterMonth.addEventListener('change', filterPackages);
    filterSector.addEventListener('change', () => {
      activeSectorPill = 'all';
      sectorPills.forEach(p => p.classList.remove('active'));
      const allPill = document.querySelector('.sector-pill-btn[data-sector="all"]');
      if (allPill) allPill.classList.add('active');
      filterPackages();
    });
    filterDuration.addEventListener('change', filterPackages);

    sectorPills.forEach(pill => {
      pill.addEventListener('click', () => {
        if (pill.hasAttribute('data-direct')) {
          isDirectOnly = !isDirectOnly;
          pill.classList.toggle('active', isDirectOnly);
        } else {
          sectorPills.forEach(p => {
            if (!p.hasAttribute('data-direct')) p.classList.remove('active');
          });
          pill.classList.add('active');
          activeSectorPill = pill.getAttribute('data-sector') || 'all';
          if (filterSector && activeSectorPill !== 'all') {
            filterSector.value = activeSectorPill;
          } else if (filterSector) {
            filterSector.value = 'all';
          }
        }
        filterPackages();
      });
    });

    if (btnResetFilters) {
      btnResetFilters.addEventListener('click', () => {
        if (filterMonth) filterMonth.value = 'all';
        if (filterSector) filterSector.value = 'all';
        if (filterDuration) filterDuration.value = 'all';
        activeSectorPill = 'all';
        isDirectOnly = false;
        sectorPills.forEach(p => {
          if (p.getAttribute('data-sector') === 'all') p.classList.add('active');
          else p.classList.remove('active');
        });
        filterPackages();
      });
    }
  }

  // 10. Upload Package Modal & Supabase Dynamic Package Integration
  const uploadModal = document.getElementById('uploadPackageModal');
  const btnOpenUpload = document.getElementById('btnOpenUploadModal');
  const btnOpenUploadBottom = document.getElementById('btnOpenUploadModalBottom');
  const uploadClose = document.getElementById('uploadModalClose');
  const uploadForm = document.getElementById('uploadPackageForm');
  const pkgImageFile = document.getElementById('pkgImageFile');
  const uploadPreviewBox = document.getElementById('uploadPreviewBox');
  const btnShareWhatsAppPkg = document.getElementById('btnShareWhatsAppPkg');

  let uploadedImageData = '';

  function openUploadModal() {
    if (!uploadModal) return;
    uploadModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeUploadModal() {
    if (!uploadModal) return;
    uploadModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (btnOpenUpload) btnOpenUpload.addEventListener('click', openUploadModal);
  if (btnOpenUploadBottom) btnOpenUploadBottom.addEventListener('click', openUploadModal);
  if (uploadClose) uploadClose.addEventListener('click', closeUploadModal);

  if (uploadModal) {
    uploadModal.addEventListener('click', (e) => {
      if (e.target === uploadModal) closeUploadModal();
    });
  }

  // Lightweight client-side image compression to prevent payload errors and storage limits
  function compressImageFile(file, maxWidth = 800, maxHeight = 600, quality = 0.75) {
    return new Promise((resolve) => {
      if (!file || !file.type.startsWith('image/')) {
        resolve('');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          if (width > maxWidth || height > maxHeight) {
            if (width / height > maxWidth / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  }

  if (pkgImageFile && uploadPreviewBox) {
    pkgImageFile.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        uploadPreviewBox.innerHTML = '<span style="font-size: 0.85rem; color: var(--color-gold);">Processing image...</span>';
        uploadedImageData = await compressImageFile(file);
        uploadPreviewBox.innerHTML = `<img src="${uploadedImageData}" alt="Package Preview" style="width: 100%; height: 100%; object-fit: contain;">`;
      }
    });
  }

  // Render Approved Umrah Packages (Strictly from Supabase where is_approved = true)
  async function renderCustomPackages() {
    if (!customContainer) return;

    // Clear any legacy localStorage cache so unapproved local cards never appear
    try { localStorage.removeItem('customUmrahPackages'); } catch (e) {}

    let packagesToDisplay = [];

    if (window.SupabasePackages && window.SupabasePackages.isConfigured()) {
      try {
        const remote = await window.SupabasePackages.fetchApprovedPackages('umrah');
        if (Array.isArray(remote)) {
          packagesToDisplay = remote;
        }
      } catch (err) {
        console.warn('Supabase fetch failed:', err);
      }
    }

    customContainer.innerHTML = '';

    packagesToDisplay.forEach((pkg) => {
      const card = document.createElement('div');
      card.className = 'umrah-offer-card';
      const city = (pkg.city || 'lhe').toLowerCase();
      const days = pkg.days || '21 Days';
      card.setAttribute('data-city', city);
      card.setAttribute('data-duration', (days || '').replace(/\D/g, '') || '21');
      card.setAttribute('data-month', 'all');
      card.setAttribute('data-direct', 'true');

      const imgSrc = pkg.image_url || pkg.image || 'assets/images/umrah-package-kaaba.jpg';
      const rawPrice = pkg.price || 250000;
      const formattedPrice = Number(rawPrice).toLocaleString();
      const mHotel = pkg.makkah_hotel || pkg.makkahHotel || 'Hotel near Haram';
      const mdHotel = pkg.madinah_hotel || pkg.madinahHotel || 'Hotel near Prophet Mosque';
      const luggage = pkg.luggage || '23 kg + 7 kg Hand Carry';

      card.innerHTML = `
        <div class="card-media-wrap">
          <img src="${imgSrc}" alt="${pkg.name}">
          <div class="card-top-badges">
            <span class="badge-days">${days}</span>
            <span class="badge-type">Verified</span>
          </div>
          <div class="badge-seats-pill">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M22 10V6c0-1.11-.9-2-2-2H4c-1.1 0-1.99.89-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2zm-9 7.5h-2v-2h2v2zm0-4.5h-2v-2h2v2zm0-4.5h-2v-2h2v2z"/></svg>
            ${pkg.seats || '15 / 15 Available'}
          </div>
        </div>
        
        <div class="card-details-body">
          <h3 class="offer-package-title">${pkg.name}</h3>
          <p class="offer-package-sub">Official Package • Complete Ground Assistance</p>
          
          <div class="offer-spec-box">
            <div class="spec-row-airline">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="color: var(--color-primary-blue);"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
              <span>${pkg.airline || 'Saudi Airlines'}</span>
            </div>
            <div class="spec-two-cols">
              <span class="spec-pill"><svg class="spec-pill-svg" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg> ${days}</span>
              <span class="spec-pill"><svg class="spec-pill-svg" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/></svg> ${pkg.dates || 'Upcoming'}</span>
            </div>
            <div class="spec-sectors-row">
              <span class="spec-pill"><svg class="spec-pill-svg" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg> Sector (${city.toUpperCase()})</span>
              <span class="spec-pill"><svg class="spec-pill-svg" viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg> DIRECT FLIGHT (ROUND TRIP)</span>
            </div>
            <div class="flight-code-tags">
              <span class="tag-flight-code">${city.toUpperCase()} - JED</span>
              <span class="tag-flight-code">JED - ${city.toUpperCase()}</span>
            </div>
            <div class="spec-hotel-line">
              <span class="spec-icon-wrap" title="Makkah Hotel"><svg viewBox="0 0 24 24"><path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z"/></svg></span>
              <div class="spec-hotel-content"><strong>Makkah:</strong> ${mHotel}</div>
            </div>
            <div class="spec-hotel-line">
              <span class="spec-icon-wrap" title="Madinah Hotel"><svg viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zM7 11h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2zm-8 4h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg></span>
              <div class="spec-hotel-content"><strong>Madinah:</strong> ${mdHotel}</div>
            </div>
            <div class="spec-luggage-line">
              <span class="spec-icon-wrap" title="Baggage Allowance"><svg viewBox="0 0 24 24"><path d="M17 6h-2V3c0-.55-.45-1-1-1h-4c-.55 0-1 .45-1 1v3H7c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2 0 .55.45 1 1 1s1-.45 1-1h6c0 .55.45 1 1 1s1-.45 1-1c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM11 3.5h2V6h-2V3.5zM19 19H5V8h14v11z"/></svg></span>
              <div class="spec-luggage-content"><strong>Luggage:</strong> ${luggage}</div>
            </div>
          </div>

          <div class="offer-card-footer">
            <div class="price-col">
              <span class="price-starting-label">Starting From</span>
              <span class="price-main-val">PKR ${formattedPrice}</span>
            </div>
            <div style="display: flex; gap: 6px;">
              <button type="button" class="btn-reserve-offer open-booking-modal" data-service="${pkg.name} (PKR ${formattedPrice})">
                <span>View Details &amp; Reserve</span>
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
            </div>
          </div>
        </div>
      `;

      customContainer.appendChild(card);
    });

    if (typeof filterPackages === 'function') filterPackages();
  }

  // Handle Umrah Form Submit (Strictly saves to Supabase with is_approved = false; NO localStorage)
  if (uploadForm) {
    uploadForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const newPkg = {
        type: 'umrah',
        name: document.getElementById('pkgName')?.value.trim() || 'Custom Umrah Package',
        airline: document.getElementById('pkgAirline')?.value.trim() || 'Saudi Airlines',
        days: document.getElementById('pkgDays')?.value || '21 Days',
        dates: document.getElementById('pkgDates')?.value.trim() || 'Flexible Dates',
        city: document.getElementById('pkgCity')?.value || 'lhe',
        price: document.getElementById('pkgPrice')?.value.trim() || '250000',
        makkahHotel: document.getElementById('pkgMakkahHotel')?.value.trim() || 'Hotel near Haram',
        madinahHotel: document.getElementById('pkgMadinahHotel')?.value.trim() || 'Hotel near Prophet Mosque',
        luggage: document.getElementById('pkgLuggage')?.value.trim() || '23 kg + 7 kg Hand Carry',
        seats: document.getElementById('pkgSeats')?.value.trim() || '20 / 20 Seats Available',
        image: uploadedImageData || 'assets/images/umrah-package-kaaba.jpg'
      };

      const submitBtn = uploadForm.querySelector('button[type="submit"]');
      const origBtnHtml = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Saving to Supabase...</span>';
      }

      try {
        if (!window.SupabasePackages || !window.SupabasePackages.isConfigured()) {
          throw new Error('Supabase client is not loaded or configured. Please check assets/js/supabase-config.js and assets/js/supabase-client.js.');
        }

        const res = await window.SupabasePackages.submitPackage(newPkg);
        if (res && res.success) {
          uploadForm.reset();
          uploadedImageData = '';
          if (uploadPreviewBox) {
            uploadPreviewBox.innerHTML = '<span style="font-size: 0.85rem; color: #64748B;">Select an image or default holy Kaaba image will be used</span>';
          }
          closeUploadModal();
          alert('✅ Umrah Package Submitted to Supabase!\n\nYour package has been saved to the Supabase database (public.packages) with is_approved = false.\n\nGo to your Supabase Table Editor and change "is_approved" to TRUE — the card will appear automatically on this page!');
        } else {
          console.error('Supabase insert failed:', res?.error);
          alert('⚠️ Could not save package to Supabase:\n' + (res?.error || 'Unknown error. Please check console.'));
        }
      } catch (err) {
        console.error('Submission exception:', err);
        alert('⚠️ Submission Error:\n' + err.message);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = origBtnHtml;
        }
      }
    });
  }

  // Share to WhatsApp direct
  if (btnShareWhatsAppPkg) {
    btnShareWhatsAppPkg.addEventListener('click', () => {
      const name = document.getElementById('pkgName')?.value.trim() || 'Custom Package';
      const airline = document.getElementById('pkgAirline')?.value.trim() || 'Saudi Airlines';
      const days = document.getElementById('pkgDays')?.value || '21 Days';
      const dates = document.getElementById('pkgDates')?.value.trim() || 'Dec 2026';
      const price = document.getElementById('pkgPrice')?.value.trim() || 'Quote';

      const waMsg = `✈️ *Custom Umrah Package Proposal - Link International Travels*\n━━━━━━━━━━━━━━━━━━━━━\n📦 *Package:* ${name}\n✈️ *Airline:* ${airline}\n🕒 *Duration:* ${days}\n📅 *Dates:* ${dates}\n💰 *Price:* PKR ${price}\n━━━━━━━━━━━━━━━━━━━━━\nAssalam-o-Alaikum, I want to inquire/register this custom package.`;
      const waUrl = `https://wa.me/923008053198?text=${encodeURIComponent(waMsg)}`;
      window.open(waUrl, '_blank');
    });
  }

  // Initial call to render saved packages
  renderCustomPackages();

  // Listen for Supabase Realtime / Polling for immediate display when approved
  if (window.SupabasePackages && window.SupabasePackages.isConfigured()) {
    window.SupabasePackages.startPollingForApprovedPackages('umrah', () => {
      renderCustomPackages();
    });
  }

  // =========================================================================
  // 11. Hajj Packages Filtering & Upload Feature (User Requirement)
  // =========================================================================
  const filterHajjDuration = document.getElementById('filterHajjDuration');
  const filterHajjMaktab = document.getElementById('filterHajjMaktab');
  const filterHajjType = document.getElementById('filterHajjType');
  const hajjPills = document.querySelectorAll('[data-hajj-filter]');
  const customHajjContainer = document.getElementById('customHajjPackagesContainer');

  function filterHajjPackages() {
    const durationVal = filterHajjDuration ? filterHajjDuration.value : 'all';
    const maktabVal = filterHajjMaktab ? filterHajjMaktab.value : 'all';
    const typeVal = filterHajjType ? filterHajjType.value : 'all';

    let activePillVal = 'all';
    hajjPills.forEach(pill => {
      if (pill.classList.contains('active')) {
        activePillVal = pill.getAttribute('data-hajj-filter') || 'all';
      }
    });

    const allHajjCards = document.querySelectorAll('.hajj-package-card');
    let visibleCount = 0;

    allHajjCards.forEach(card => {
      const cardDur = card.getAttribute('data-duration') || '';
      const cardMaktab = card.getAttribute('data-maktab') || '';
      const cardType = card.getAttribute('data-type') || '';

      let matchDuration = (durationVal === 'all') || (cardDur === durationVal);
      if (durationVal === '35' && (cardDur === '35' || cardDur === '38' || cardDur === '40')) {
        matchDuration = true;
      }

      let matchMaktab = (maktabVal === 'all') || (cardMaktab === maktabVal);
      let matchType = (typeVal === 'all') || (cardType === typeVal);

      let matchPill = true;
      if (activePillVal === 'maktab-a') matchPill = (cardMaktab === 'maktab-a');
      else if (activePillVal === 'maktab-b') matchPill = (cardMaktab === 'maktab-b');
      else if (activePillVal === 'maktab-c') matchPill = (cardMaktab === 'maktab-c');
      else if (activePillVal === 'non-shifting') matchPill = (cardType === 'non-shifting');
      else if (activePillVal === 'shifting') matchPill = (cardType === 'shifting');

      if (matchDuration && matchMaktab && matchType && matchPill) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    const countBadge = document.getElementById('hajjOffersCountBadge');
    if (countBadge) {
      countBadge.textContent = `Showing ${visibleCount} of ${allHajjCards.length} Offers`;
    }
  }

  if (filterHajjDuration) filterHajjDuration.addEventListener('change', filterHajjPackages);
  if (filterHajjMaktab) filterHajjMaktab.addEventListener('change', filterHajjPackages);
  if (filterHajjType) filterHajjType.addEventListener('change', filterHajjPackages);

  hajjPills.forEach(pill => {
    pill.addEventListener('click', function () {
      hajjPills.forEach(p => p.classList.remove('active'));
      this.classList.add('active');
      filterHajjPackages();
    });
  });

  const btnResetHajjFilters = document.getElementById('btnResetHajjFilters');
  if (btnResetHajjFilters) {
    btnResetHajjFilters.addEventListener('click', () => {
      if (filterHajjDuration) filterHajjDuration.value = 'all';
      if (filterHajjMaktab) filterHajjMaktab.value = 'all';
      if (filterHajjType) filterHajjType.value = 'all';
      hajjPills.forEach(p => p.classList.remove('active'));
      if (hajjPills[0]) hajjPills[0].classList.add('active');
      filterHajjPackages();
    });
  }

  // =========================================================================
  // 12. Hajj Upload Package Modal & Dynamic Creation (Supabase Connected)
  // =========================================================================
  const uploadHajjModal = document.getElementById('uploadHajjPackageModal');
  const btnOpenHajjUpload = document.getElementById('btnOpenHajjUploadModal');
  const btnOpenHajjUploadBottom = document.getElementById('btnOpenHajjUploadModalBottom');
  const uploadHajjClose = document.getElementById('uploadHajjModalClose');
  const uploadHajjForm = document.getElementById('uploadHajjPackageForm');
  const hajjPkgImageFile = document.getElementById('hajjPkgImageFile');
  const hajjUploadPreviewBox = document.getElementById('hajjUploadPreviewBox');
  const btnShareWhatsAppHajjPkg = document.getElementById('btnShareWhatsAppHajjPkg');

  let uploadedHajjImageData = '';

  function openHajjUploadModal() {
    if (!uploadHajjModal) return;
    uploadHajjModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeHajjUploadModal() {
    if (!uploadHajjModal) return;
    uploadHajjModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (btnOpenHajjUpload) btnOpenHajjUpload.addEventListener('click', openHajjUploadModal);
  if (btnOpenHajjUploadBottom) btnOpenHajjUploadBottom.addEventListener('click', openHajjUploadModal);
  if (uploadHajjClose) uploadHajjClose.addEventListener('click', closeHajjUploadModal);

  if (uploadHajjModal) {
    uploadHajjModal.addEventListener('click', (e) => {
      if (e.target === uploadHajjModal) closeHajjUploadModal();
    });
  }

  if (hajjPkgImageFile) {
    hajjPkgImageFile.addEventListener('change', async function () {
      const file = this.files[0];
      if (file) {
        if (hajjUploadPreviewBox) {
          hajjUploadPreviewBox.innerHTML = '<span style="font-size: 0.85rem; color: var(--color-gold);">Processing image...</span>';
        }
        uploadedHajjImageData = await compressImageFile(file);
        if (hajjUploadPreviewBox) {
          hajjUploadPreviewBox.innerHTML = `<img src="${uploadedHajjImageData}" alt="Hajj Package Flyer Preview" style="width: 100%; height: 100%; object-fit: contain;">`;
        }
      }
    });
  }

  // Render Approved Hajj Packages (Strictly from Supabase where is_approved = true)
  async function renderCustomHajjPackages() {
    if (!customHajjContainer) return;

    // Clear any legacy localStorage cache so unapproved local cards never appear
    try { localStorage.removeItem('customHajjPackages'); } catch (e) {}

    let hajjPackagesToDisplay = [];

    if (window.SupabasePackages && window.SupabasePackages.isConfigured()) {
      try {
        const remote = await window.SupabasePackages.fetchApprovedPackages('hajj');
        if (Array.isArray(remote)) {
          hajjPackagesToDisplay = remote;
        }
      } catch (err) {
        console.warn('Supabase fetch failed:', err);
      }
    }

    customHajjContainer.innerHTML = '';

    hajjPackagesToDisplay.forEach((pkg) => {
      const card = document.createElement('div');
      card.className = 'hajj-package-card';
      const days = pkg.days || '20';
      const maktab = pkg.maktab || 'maktab-c';
      card.setAttribute('data-duration', days);
      card.setAttribute('data-maktab', maktab);
      card.setAttribute('data-type', 'non-shifting');
      card.setAttribute('data-direct', 'true');

      const bannerSrc = pkg.image_url || pkg.image || 'assets/images/hajj-card-banner.png';
      const maktabLabel = maktab === 'maktab-a' ? 'MAKTAB "A" / ZONE "1" (VIP AC TENTS)' :
                         maktab === 'maktab-b' ? 'MAKTAB "B" / ZONE "2" (STANDARD)' :
                         'MAKTAB "C" / ZONE "3"';

      const bedPrice = pkg.price || pkg.bed_price || pkg.bedPrice || 1800000;
      const formattedBedPrice = Number(bedPrice).toLocaleString();

      card.innerHTML = `
        <div class="hajj-card-header">
          <div class="hajj-card-top-badges">
            <span class="hajj-badge-days">${days} Days</span>
            <span class="hajj-badge-type">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5zm4 4h-2v-2h2v2zm0-4h-2V7h2v5z"/></svg>
              Verified
            </span>
          </div>
          
          <div class="hajj-agency-banner-box">
            <img src="${bannerSrc}" alt="${pkg.name}">
          </div>

          <div class="hajj-seats-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M22 10V6c0-1.11-.9-2-2-2H4c-1.1 0-1.99.89-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2zm-9 7.5h-2v-2h2v2zm0-4.5h-2v-2h2v2zm0-4.5h-2v-2h2v2z"/></svg>
            ${pkg.seats || '30 / 30 Seats Available'}
          </div>
        </div>

        <div class="hajj-card-body">
          <div class="hajj-lic-row">
            <span class="hajj-lic-agency">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              LINK INTERNATIONAL TRAVELS
            </span>
            <span class="hajj-lic-num">Lic: DTS #1042</span>
          </div>

          <h3 class="hajj-pkg-title">${pkg.name} <span class="custom-pkg-tag">Approved</span></h3>

          <div class="hajj-tags-row">
            <span class="hajj-tag-airline">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
              ${pkg.airline || 'DIRECT / INDIRECT AIRLINE'}
            </span>
            <span class="hajj-tag-dates">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/></svg>
              ${pkg.dates || 'Upcoming'}
            </span>
          </div>

          <span class="hajj-tag-hijri">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12.3 2a10 10 0 0 0-1.9 19.8 8 8 0 0 1-7.2-7.2A10 10 0 0 0 12.3 2z"/></svg>
            ${pkg.hijri_dates || pkg.hijriDates || '25 ZILQADAH – 15 ZILHAJJ 1448'}
          </span>

          <div class="hajj-maktab-text">${maktabLabel}</div>

          <div class="hajj-sharing-grid">
            <div class="hajj-sharing-box">
              <div class="sharing-label">QUAD SHARING</div>
              <div class="sharing-price">PKR ${Number(pkg.quad_price || pkg.quadPrice || 1900000).toLocaleString()}</div>
            </div>
            <div class="hajj-sharing-box">
              <div class="sharing-label">TRIPLE SHARING</div>
              <div class="sharing-price">PKR ${Number(pkg.triple_price || pkg.triplePrice || 1950000).toLocaleString()}</div>
            </div>
            <div class="hajj-sharing-box">
              <div class="sharing-label">DOUBLE SHARING</div>
              <div class="sharing-price">PKR ${Number(pkg.double_price || pkg.doublePrice || 2000000).toLocaleString()}</div>
            </div>
            <div class="hajj-sharing-box">
              <div class="sharing-label">SHARING BED</div>
              <div class="sharing-price">PKR ${formattedBedPrice}</div>
            </div>
          </div>

          <div class="hajj-accom-plan">
            <div class="hajj-accom-title">ACCOMMODATION PLAN:</div>
            <div class="hajj-accom-list">
              <div class="hajj-accom-item">
                <span class="hajj-accom-hotel"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="color: var(--color-gold);"><path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z"/></svg> ${pkg.makkah_hotel || pkg.makkahHotel || 'Makkah Hotel'}</span>
                <span class="hajj-accom-dates">🗓️ Schedule A</span>
                <span class="hajj-accom-nights">(Makkah)</span>
              </div>
              <div class="hajj-accom-item">
                <span class="hajj-accom-hotel"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="color: var(--color-gold);"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/></svg> ${pkg.madinah_hotel || pkg.madinahHotel || 'Madinah Hotel'}</span>
                <span class="hajj-accom-dates">🗓️ Schedule B</span>
                <span class="hajj-accom-nights">(Madinah)</span>
              </div>
              <div class="hajj-accom-item">
                <span class="hajj-accom-hotel"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="color: var(--color-gold);"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg> ${pkg.mina_schedule || pkg.minaSchedule || 'Mina Tents'}</span>
                <span class="hajj-accom-dates">🗓️ 15 - 20 May</span>
                <span class="hajj-accom-nights">(Mashaer)</span>
              </div>
            </div>
          </div>

          <div class="hajj-card-footer">
            <div class="hajj-price-col">
              <span class="hajj-price-starting">STARTING FROM</span>
              <span class="hajj-price-val">PKR ${formattedBedPrice}</span>
            </div>
            <div style="display: flex; gap: 8px;">
              <button type="button" class="btn-hajj-view-details open-booking-modal" data-service="${pkg.name} (PKR ${formattedBedPrice})">
                <span>View Details</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M5 12h14M12 5l7 7-7 7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
            </div>
          </div>
        </div>
      `;

      customHajjContainer.appendChild(card);
    });

    if (typeof filterHajjPackages === 'function') filterHajjPackages();
  }

  // Handle Hajj Form Submit (Strictly saves to Supabase with is_approved = false; NO localStorage)
  if (uploadHajjForm) {
    uploadHajjForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const newHajjPkg = {
        type: 'hajj',
        name: document.getElementById('hajjPkgName')?.value.trim() || 'Custom VIP Hajj Package',
        airline: document.getElementById('hajjPkgAirline')?.value.trim() || 'DIRECT / INDIRECT AIRLINE',
        days: document.getElementById('hajjPkgDays')?.value || '20',
        maktab: document.getElementById('hajjPkgMaktab')?.value || 'maktab-c',
        dates: document.getElementById('hajjPkgDates')?.value.trim() || '02 MAY – 22 MAY',
        hijriDates: document.getElementById('hajjPkgHijri')?.value.trim() || '25 ZILQADAH – 15 ZILHAJJ 1448',
        quadPrice: document.getElementById('hajjPkgQuadPrice')?.value.trim() || '1900000',
        triplePrice: document.getElementById('hajjPkgTriplePrice')?.value.trim() || '1950000',
        doublePrice: document.getElementById('hajjPkgDoublePrice')?.value.trim() || '2000000',
        bedPrice: document.getElementById('hajjPkgBedPrice')?.value.trim() || '1800000',
        price: document.getElementById('hajjPkgBedPrice')?.value.trim() || '1800000',
        makkahHotel: document.getElementById('hajjPkgMakkah')?.value.trim() || 'MAKKAH CLOCK TOWER (6 Nights)',
        madinahHotel: document.getElementById('hajjPkgMadinah')?.value.trim() || 'MARKAZIA (4 Nights)',
        minaSchedule: document.getElementById('hajjPkgMina')?.value.trim() || 'AZIZIA BUILDING + MASHAER (7 Nights)',
        seats: document.getElementById('hajjPkgSeats')?.value.trim() || '30 / 30 Seats Available',
        image: uploadedHajjImageData || 'assets/images/hajj-card-banner.png'
      };

      const submitBtn = uploadHajjForm.querySelector('button[type="submit"]');
      const origBtnHtml = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Saving to Supabase...</span>';
      }

      try {
        if (!window.SupabasePackages || !window.SupabasePackages.isConfigured()) {
          throw new Error('Supabase client is not loaded or configured. Please check assets/js/supabase-config.js and assets/js/supabase-client.js.');
        }

        const res = await window.SupabasePackages.submitPackage(newHajjPkg);
        if (res && res.success) {
          uploadHajjForm.reset();
          uploadedHajjImageData = '';
          if (hajjUploadPreviewBox) {
            hajjUploadPreviewBox.innerHTML = '<span style="font-size: 0.85rem; color: #64748B;">Select an image banner or default banner will be used</span>';
          }
          closeHajjUploadModal();
          alert('✅ Hajj Package Submitted to Supabase!\n\nYour package has been saved to the Supabase database (public.packages) with is_approved = false.\n\nGo to your Supabase Table Editor and change "is_approved" to TRUE — the card will appear automatically on this page!');
        } else {
          console.error('Supabase insert failed:', res?.error);
          alert('⚠️ Could not save package to Supabase:\n' + (res?.error || 'Unknown error. Please check console.'));
        }
      } catch (err) {
        console.error('Submission exception:', err);
        alert('⚠️ Submission Error:\n' + err.message);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = origBtnHtml;
        }
      }
    });
  }

  // Share Hajj package to WhatsApp direct
  if (btnShareWhatsAppHajjPkg) {
    btnShareWhatsAppHajjPkg.addEventListener('click', () => {
      const name = document.getElementById('hajjPkgName')?.value.trim() || 'VIP Hajj Package';
      const days = document.getElementById('hajjPkgDays')?.value || '20';
      const dates = document.getElementById('hajjPkgDates')?.value.trim() || '02 MAY – 22 MAY';
      const quad = document.getElementById('hajjPkgQuadPrice')?.value.trim() || '1900000';
      const bed = document.getElementById('hajjPkgBedPrice')?.value.trim() || '1800000';

      const waMsg = `🕋 *Custom Hajj Package Inquiry - Link International Travels*\n━━━━━━━━━━━━━━━━━━━━━\n📌 *Package:* ${name}\n⏱️ *Duration:* ${days} Days\n📅 *Dates:* ${dates}\n💰 *Quad Sharing:* PKR ${quad}\n🛏️ *Sharing Bed:* PKR ${bed}\n━━━━━━━━━━━━━━━━━━━━━\nAssalam-o-Alaikum, please confirm availability and Maktab details for this Hajj package.`;
      const waUrl = `https://wa.me/923008053198?text=${encodeURIComponent(waMsg)}`;
      window.open(waUrl, '_blank');
    });
  }

  // Initial call to render saved custom Hajj packages
  renderCustomHajjPackages();

  // Listen for Supabase Realtime / Polling for immediate display when approved
  if (window.SupabasePackages && window.SupabasePackages.isConfigured()) {
    window.SupabasePackages.startPollingForApprovedPackages('hajj', () => {
      renderCustomHajjPackages();
    });
  }

  // =========================================================================
  // 13. Registration Portal Controller (Client Account vs B2B Agent Partner)
  // =========================================================================
  const tabBtnClient = document.getElementById('tabBtnClient');
  const tabBtnAgent = document.getElementById('tabBtnAgent');
  const panelClient = document.getElementById('panelClient');
  const panelAgent = document.getElementById('panelAgent');

  function switchPortalTab(targetTab) {
    if (!tabBtnClient || !tabBtnAgent || !panelClient || !panelAgent) return;

    if (targetTab === 'client') {
      tabBtnClient.classList.add('active');
      tabBtnClient.setAttribute('aria-selected', 'true');
      tabBtnAgent.classList.remove('active');
      tabBtnAgent.setAttribute('aria-selected', 'false');

      panelClient.classList.add('active');
      panelAgent.classList.remove('active');
    } else {
      tabBtnAgent.classList.add('active');
      tabBtnAgent.setAttribute('aria-selected', 'true');
      tabBtnClient.classList.remove('active');
      tabBtnClient.setAttribute('aria-selected', 'false');

      panelAgent.classList.add('active');
      panelClient.classList.remove('active');
    }
  }

  if (tabBtnClient) {
    tabBtnClient.addEventListener('click', () => switchPortalTab('client'));
  }
  if (tabBtnAgent) {
    tabBtnAgent.addEventListener('click', () => switchPortalTab('agent'));
  }

  // Handle URL hash parameters (e.g. become-agent.html#agent or become-agent.html#client)
  if (window.location.hash === '#agent' || window.location.hash === '#b2b') {
    switchPortalTab('agent');
  } else if (window.location.hash === '#client') {
    switchPortalTab('client');
  }

  // Custom File Inputs Label Updates with responsive truncation and styling
  function setupFileInputPreview(inputId, labelId) {
    const input = document.getElementById(inputId);
    const label = document.getElementById(labelId);
    const box = label ? label.closest('.portal-file-box') : null;
    if (input && label) {
      input.addEventListener('change', function () {
        if (this.files && this.files.length > 0) {
          const file = this.files[0];
          label.textContent = file.name;
          label.title = file.name; // Full name tooltip on hover
          label.style.color = '#001D49';
          label.style.fontWeight = '700';
          if (box) {
            box.classList.add('has-file');
          }
        } else {
          label.textContent = 'No file chosen';
          label.removeAttribute('title');
          label.style.color = '#64748B';
          label.style.fontWeight = 'normal';
          if (box) {
            box.classList.remove('has-file');
          }
        }
      });
    }
  }

  setupFileInputPreview('agentDocPhoto', 'labelDocPhoto');
  setupFileInputPreview('agentDocCnicFront', 'labelDocCnicFront');
  setupFileInputPreview('agentDocCnicBack', 'labelDocCnicBack');

  // Helper to open WhatsApp smoothly on Desktop & Mobile without popup blocks
  function sendToWhatsAppPortal(phone, message, formElement, successContainerId, titleText) {
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    
    // 1. Immediately trigger WhatsApp opening in new window/tab
    const win = window.open(waUrl, '_blank');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      window.location.href = waUrl;
    }

    // 2. Display friendly in-card success notification with direct WhatsApp button
    if (formElement) {
      let successBox = document.getElementById(successContainerId);
      if (!successBox) {
        successBox = document.createElement('div');
        successBox.id = successContainerId;
        formElement.parentNode.insertBefore(successBox, formElement);
      }
      successBox.innerHTML = `
        <div style="background: rgba(37, 211, 102, 0.12); border: 1.5px solid #25D366; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center; animation: portalFadeIn 0.3s ease;">
          <div style="font-size: 1.2rem; font-weight: 800; color: #25D366; margin-bottom: 6px;">
            ✅ ${titleText} Sent to WhatsApp!
          </div>
          <p style="color: #E2E8F0; font-size: 0.95rem; margin: 0 0 14px 0;">
            Aapki registration details hamare official WhatsApp number <strong>0300-8053198</strong> par send ki ja rahi hain.
          </p>
          <a href="${waUrl}" target="_blank" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: #25D366; color: #FFFFFF; font-weight: 700; font-size: 0.95rem; padding: 12px 26px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 15px rgba(37, 211, 102, 0.4); text-transform: uppercase;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67M8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7 8.5 7 9.71C7 10.93 7.89 12.1 8.01 12.27C8.14 12.44 9.76 14.94 12.25 16C12.84 16.27 13.3 16.42 13.66 16.53C14.25 16.72 14.79 16.69 15.22 16.63C15.7 16.56 16.68 16.03 16.89 15.45C17.1 14.87 17.1 14.38 17.04 14.27C16.97 14.17 16.81 14.11 16.56 13.99C16.32 13.86 15.12 13.27 14.9 13.19C14.68 13.1 14.52 13.06 14.36 13.3C14.19 13.55 13.73 14.11 13.59 14.27C13.44 14.44 13.3 14.46 13.06 14.34C12.81 14.21 11.78 13.88 10.55 12.79C9.59 11.94 8.95 10.88 8.82 10.64C8.7 10.4 8.81 10.26 8.93 10.14C9.04 10.03 9.18 9.85 9.3 9.71C9.42 9.57 9.47 9.47 9.55 9.3C9.63 9.14 9.59 9 9.53 8.88C9.47 8.76 9 7.63 8.8 7.14C8.6 6.66 8.41 6.72 8.26 6.71C8.12 6.71 7.95 6.71 7.79 6.71" /></svg>
            <span>Click Here to Chat on WhatsApp (0300-8053198)</span>
          </a>
        </div>
      `;
      successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // Client Registration Form Submit
  const formClientRegister = document.getElementById('formClientRegister');
  if (formClientRegister) {
    formClientRegister.addEventListener('submit', (e) => {
      e.preventDefault();
      const firstName = document.getElementById('clientFirstName')?.value.trim();
      const lastName = document.getElementById('clientLastName')?.value.trim();
      const email = document.getElementById('clientEmail')?.value.trim();
      const phone = document.getElementById('clientPhone')?.value.trim();
      const pass = document.getElementById('clientPassword')?.value;
      const confirmPass = document.getElementById('clientConfirmPassword')?.value;

      if (pass !== confirmPass) {
        alert('⚠️ Passwords do not match! Please check your password and confirm password fields.');
        document.getElementById('clientConfirmPassword')?.focus();
        return;
      }

      const WHATSAPP_NUMBER = '923008053198';
      let waMsg = `👤 *NEW CLIENT REGISTRATION - LINK INTERNATIONAL TRAVELS*\n`;
      waMsg += `━━━━━━━━━━━━━━━━━━━━━\n`;
      waMsg += `👤 *Client Name:* ${firstName} ${lastName}\n`;
      waMsg += `📱 *Phone / WhatsApp:* ${phone}\n`;
      waMsg += `📧 *Email Address:* ${email}\n`;
      waMsg += `🔑 *Account Password:* ${pass}\n`;
      waMsg += `━━━━━━━━━━━━━━━━━━━━━\n`;
      waMsg += `Assalam-o-Alaikum, I have registered my Client Account on the Link International portal. Please activate my account and send confirmation. Shukriya!`;

      sendToWhatsAppPortal(WHATSAPP_NUMBER, waMsg, formClientRegister, 'clientRegisterSuccess', 'Client Account Registration');
      formClientRegister.reset();
    });
  }

  // B2B Agent Partner Registration Form Submit
  const formB2BRegister = document.getElementById('formB2BRegister');
  if (formB2BRegister) {
    formB2BRegister.addEventListener('submit', (e) => {
      e.preventDefault();
      const fullName = document.getElementById('agentFullName')?.value.trim();
      const email = document.getElementById('agentEmail')?.value.trim();
      const phone = document.getElementById('agentPhone')?.value.trim();
      const agencyName = document.getElementById('agentAgencyName')?.value.trim();
      const officeAddress = document.getElementById('agentOfficeAddress')?.value.trim();
      const city = document.getElementById('agentCity')?.value.trim();
      const license = document.getElementById('agentLicense')?.value.trim();
      const pass = document.getElementById('agentPassword')?.value;
      const confirmPass = document.getElementById('agentConfirmPassword')?.value;

      if (pass !== confirmPass) {
        alert('⚠️ Passwords do not match! Please check your password and confirm password fields.');
        document.getElementById('agentConfirmPassword')?.focus();
        return;
      }

      let docsStatus = [];
      const photoFile = document.getElementById('agentDocPhoto')?.files[0];
      const cnicFrontFile = document.getElementById('agentDocCnicFront')?.files[0];
      const cnicBackFile = document.getElementById('agentDocCnicBack')?.files[0];

      if (photoFile) docsStatus.push(`Profile Photo (${photoFile.name})`);
      if (cnicFrontFile) docsStatus.push(`CNIC Front (${cnicFrontFile.name})`);
      if (cnicBackFile) docsStatus.push(`CNIC Back (${cnicBackFile.name})`);
      const docsSummary = docsStatus.length > 0 ? docsStatus.join(' | ') : 'Ready to attach on WhatsApp';

      const WHATSAPP_NUMBER = '923008053198';
      let waMsg = `💼 *NEW B2B AGENT PARTNER REGISTRATION - LINK INTERNATIONAL TRAVELS*\n`;
      waMsg += `━━━━━━━━━━━━━━━━━━━━━\n`;
      waMsg += `🏢 *Agency Name:* ${agencyName}\n`;
      waMsg += `👤 *Principal Agent:* ${fullName}\n`;
      waMsg += `📱 *Phone / WhatsApp:* ${phone}\n`;
      waMsg += `📧 *Official Email:* ${email}\n`;
      if (city) waMsg += `📍 *City / Location:* ${city}\n`;
      if (officeAddress) waMsg += `🏢 *Office Address:* ${officeAddress}\n`;
      if (license) waMsg += `📜 *DTS / IATA License:* ${license}\n`;
      waMsg += `📁 *Documents:* ${docsSummary}\n`;
      waMsg += `🔑 *Portal Password:* ${pass}\n`;
      waMsg += `━━━━━━━━━━━━━━━━━━━━━\n`;
      waMsg += `Assalam-o-Alaikum, I have submitted our travel agency B2B partner registration on the Link International portal. Kindly approve our B2B agent account for inventory and special agent rates. Shukriya!`;

      sendToWhatsAppPortal(WHATSAPP_NUMBER, waMsg, formB2BRegister, 'b2bRegisterSuccess', 'B2B Agent Registration');
      formB2BRegister.reset();
      ['labelDocPhoto', 'labelDocCnicFront', 'labelDocCnicBack'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.textContent = 'No file chosen';
          el.removeAttribute('title');
          el.style.color = '#64748B';
          el.style.fontWeight = 'normal';
          const box = el.closest('.portal-file-box');
          if (box) box.classList.remove('has-file');
        }
      });
    });
  }

  // Sign In Modal Controls
  const portalSignInModal = document.getElementById('portalSignInModal');
  const portalSignInClose = document.getElementById('portalSignInClose');
  const portalSignInForm = document.getElementById('portalSignInForm');

  document.querySelectorAll('.open-signin-modal').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const role = link.getAttribute('data-role') || 'b2b';
      const roleSelect = document.getElementById('signInRole');
      if (roleSelect) {
        roleSelect.value = role === 'client' ? 'client' : 'b2b';
      }
      if (portalSignInModal) {
        portalSignInModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  if (portalSignInClose && portalSignInModal) {
    portalSignInClose.addEventListener('click', () => {
      portalSignInModal.classList.remove('active');
      document.body.style.overflow = '';
    });

    portalSignInModal.addEventListener('click', (e) => {
      if (e.target === portalSignInModal) {
        portalSignInModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  if (portalSignInForm) {
    portalSignInForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('signInEmail')?.value.trim();
      const role = document.getElementById('signInRole')?.value;
      const roleTitle = role === 'client' ? 'Client' : 'B2B Agent Partner';
      
      alert(`🔐 Welcome back!\n\nAuthenticating ${roleTitle} portal access for:\n${email}\n\nYour portal session is being initialized...`);
      if (portalSignInModal) {
        portalSignInModal.classList.remove('active');
        document.body.style.overflow = '';
      }
      portalSignInForm.reset();
    });
  }
});
