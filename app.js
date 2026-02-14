/**
 * The V-Day Bahb Chronicles — SPA navigation & Bahb story audio
 * One "Listen to the Bahb story" / "Pause the Bahb story" button plays the current year's MP3.
 * Pause resumes from the same position.
 */

const YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
const REFLECTIONS_PAGE = 'reflections';
/** All page ids in order (years + reflections). */
const PAGE_ORDER = [...YEARS.map(String), REFLECTIONS_PAGE];

/** Year -> path to MP3 (relative for GitHub Pages). Files: 2018_vday.mp3, 2019_vday.mp3, etc. */
const BAHB_AUDIO_BY_YEAR = {
  2018: 'audio/2018_vday.mp3',
  2019: 'audio/2019_vday.mp3',
  2020: 'audio/2020_vday.mp3',
  2021: 'audio/2021_vday.mp3',
  2022: 'audio/2022_vday.mp3',
  2023: 'audio/2023_vday.mp3',
  2024: 'audio/2024_vday.mp3',
  2025: 'audio/2025_vday.mp3',
};

/** Index into PAGE_ORDER: 0 = 2018, 7 = 2025, 8 = reflections */
let currentPageIndex = 0;
/** @type {HTMLAudioElement | null} */
let bahbAudio = null;
let bahbAudioYear = null;

function getCurrentPageId() {
  return PAGE_ORDER[currentPageIndex];
}

function getCurrentYear() {
  const id = getCurrentPageId();
  return typeof id === 'string' && /^\d{4}$/.test(id) ? Number(id) : null;
}

function getBahbButton() {
  return document.getElementById('btn-bahb');
}

function getBahbButtonLabel(playing) {
  const year = getCurrentYear();
  if (year == null) return playing ? 'Pause the Bahb story' : 'Listen to the Bahb story';
  if (year === 2018) return playing ? 'Pause the beginning of Bahbs' : 'The beginning of Bahbs';
  return playing ? `Pause V-Day in ${year}` : `Listen to V-Day in ${year}`;
}

function setBahbButtonPlaying(playing) {
  const btn = getBahbButton();
  if (!btn) return;
  const label = getBahbButtonLabel(playing);
  btn.textContent = label;
  btn.setAttribute('aria-label', label);
  btn.classList.toggle('playing', playing);
}

function showPage(pageId) {
  const idx = PAGE_ORDER.indexOf(String(pageId));
  if (idx === -1) return;
  currentPageIndex = idx;
  const id = getCurrentPageId();

  document.querySelectorAll('.year-page').forEach((page) => {
    page.classList.toggle('active', page.dataset.year === id);
  });

  document.querySelectorAll('.dot').forEach((dot) => {
    dot.classList.toggle('active', dot.dataset.year === id);
  });

  const prevBtn = document.querySelector('.btn-prev');
  const nextBtn = document.querySelector('.btn-next');
  if (prevBtn) {
    prevBtn.disabled = currentPageIndex === 0;
    const prevId = currentPageIndex > 0 ? PAGE_ORDER[currentPageIndex - 1] : '';
    prevBtn.querySelector('.btn-year').textContent = prevId && prevId !== REFLECTIONS_PAGE ? prevId : '';
  }
  if (nextBtn) {
    nextBtn.disabled = currentPageIndex === PAGE_ORDER.length - 1;
    const nextId = currentPageIndex < PAGE_ORDER.length - 1 ? PAGE_ORDER[currentPageIndex + 1] : '';
    nextBtn.querySelector('.btn-year').textContent = nextId && nextId !== REFLECTIONS_PAGE ? nextId : '';
  }

  if (bahbAudio) {
    bahbAudio.pause();
    setBahbButtonPlaying(false);
  }

  updateBahbButtonState();
  toggleReflectionsNav(id === REFLECTIONS_PAGE);
  updateBahbButtonLabel();
}

function showYear(year) {
  showPage(year);
}

function toggleReflectionsNav(show) {
  const mainNav = document.querySelector('.year-nav');
  const reflectionsNav = document.querySelector('.reflections-nav');
  if (mainNav) mainNav.classList.toggle('hidden', show);
  if (reflectionsNav) reflectionsNav.classList.toggle('active', show);
}

function updateBahbButtonState() {
  const btn = getBahbButton();
  if (!btn) return;
  const pageId = getCurrentPageId();
  const isReflections = pageId === REFLECTIONS_PAGE;
  const hasAudio = getCurrentYear() != null && BAHB_AUDIO_BY_YEAR[getCurrentYear()];
  btn.classList.toggle('hidden', isReflections);
  btn.disabled = !hasAudio;
  if (!hasAudio) btn.classList.remove('playing');
  updateBahbButtonLabel();
}

function updateBahbButtonLabel() {
  const btn = getBahbButton();
  if (!btn || btn.classList.contains('hidden')) return;
  const playing = btn.classList.contains('playing');
  const label = getBahbButtonLabel(playing);
  btn.textContent = label;
  btn.setAttribute('aria-label', label);
}

function goPrev() {
  if (currentPageIndex > 0) showPage(PAGE_ORDER[currentPageIndex - 1]);
}

function goNext() {
  if (currentPageIndex < PAGE_ORDER.length - 1) showPage(PAGE_ORDER[currentPageIndex + 1]);
}

function goTo2025() {
  showPage('2025');
}

function goToBeginning() {
  showPage('2018');
}

function playBahbStory() {
  const year = getCurrentYear();
  if (year == null) return;
  const src = BAHB_AUDIO_BY_YEAR[year];
  if (!src) return;

  if (bahbAudio && bahbAudioYear === year) {
    bahbAudio.play();
    setBahbButtonPlaying(true);
    return;
  }

  const audioUrl = new URL(src, window.location.href).href;
  const audio = new Audio(audioUrl);
  bahbAudio = audio;
  bahbAudioYear = year;
  audio.onplay = () => setBahbButtonPlaying(true);
  audio.onended = () => {
    setBahbButtonPlaying(false);
    bahbAudio = null;
    bahbAudioYear = null;
  };
  audio.onerror = () => {
    setBahbButtonPlaying(false);
    bahbAudio = null;
    bahbAudioYear = null;
  };
  audio.play();
}

function pauseBahbStory() {
  if (bahbAudio) {
    bahbAudio.pause();
    setBahbButtonPlaying(false);
  }
}

function toggleBahbStory() {
  const year = getCurrentYear();
  if (year == null || !BAHB_AUDIO_BY_YEAR[year]) return;

  if (bahbAudio && bahbAudioYear === year && !bahbAudio.paused) {
    pauseBahbStory();
    return;
  }
  playBahbStory();
}

function bindEvents() {
  document.querySelector('.btn-prev')?.addEventListener('click', goPrev);
  document.querySelector('.btn-next')?.addEventListener('click', goNext);

  document.querySelectorAll('.dot').forEach((dot) => {
    dot.addEventListener('click', () => showPage(dot.dataset.year));
  });

  getBahbButton()?.addEventListener('click', toggleBahbStory);
  document.querySelector('.btn-back-2025')?.addEventListener('click', goTo2025);
  document.querySelector('.btn-back-beginning')?.addEventListener('click', goToBeginning);
}

showPage('2018');
bindEvents();
updateBahbButtonState();
