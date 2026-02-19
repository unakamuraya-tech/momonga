/**
 * app.js
 * メインアプリケーション — データ読み込み・画面遷移・共通ユーティリティ
 */
const App = (() => {
  // ===== State =====
  const state = {
    beans: [],
    types: [],
    questions: [],
    loaded: false,
  };

  // ===== Background Momonga =====
  function spawnBgMomonga() {
    const layer = document.getElementById('bg-momonga-layer');
    if (!layer) return;
    // prefers-reduced-motion チェック
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const configs = [
      { size: 40, duration: 18, delay: 0,  startY: '20vh', endY: '10vh', opacity: 0.05 },
      { size: 56, duration: 22, delay: 4,  startY: '60vh', endY: '30vh', opacity: 0.07 },
      { size: 36, duration: 15, delay: 8,  startY: '75vh', endY: '50vh', opacity: 0.06 },
      { size: 48, duration: 25, delay: 12, startY: '40vh', endY: '15vh', opacity: 0.055 },
      { size: 32, duration: 20, delay: 16, startY: '85vh', endY: '65vh', opacity: 0.045 },
    ];

    configs.forEach(cfg => {
      const img = document.createElement('img');
      img.src = 'images/アセット 1@2x.png';
      img.alt = '';
      img.className = 'bg-momonga';
      img.style.cssText = `
        --momo-size: ${cfg.size}px;
        --momo-duration: ${cfg.duration}s;
        --momo-delay: ${cfg.delay}s;
        --momo-start-x: -60px;
        --momo-start-y: ${cfg.startY};
        --momo-end-x: calc(100vw + 60px);
        --momo-end-y: ${cfg.endY};
        --momo-opacity: ${cfg.opacity};
        --momo-rot-start: ${-10 - Math.random() * 20}deg;
        --momo-rot-end: ${10 + Math.random() * 20}deg;
      `;
      layer.appendChild(img);
    });
  }

  // ===== Data Loading =====
  async function loadData() {
    try {
      const [beansRes, typesRes, questionsRes] = await Promise.all([
        fetch('data/beans.json'),
        fetch('data/types.json'),
        fetch('data/questions.json'),
      ]);
      if (!beansRes.ok || !typesRes.ok || !questionsRes.ok) {
        throw new Error('データの読み込みに失敗しました');
      }
      state.beans = await beansRes.json();
      state.types = await typesRes.json();
      const qData = await questionsRes.json();
      state.questions = qData.questions || qData;
      state.loaded = true;
      validateData();
    } catch (err) {
      console.error('Data load error:', err);
      showToast('データの読み込みに失敗しました 😢');
    }
  }

  function validateData() {
    const beanIds = new Set(state.beans.map(b => b.id));
    // Validate blend component references
    state.beans.forEach(bean => {
      if (bean.blend && bean.blend.components) {
        bean.blend.components = bean.blend.components.filter(c => {
          if (!beanIds.has(c.beanId)) {
            console.warn(`Invalid beanId reference: ${c.beanId} in ${bean.id}`);
            return false;
          }
          return true;
        });
      }
    });
    // Validate type recommendations
    state.types.forEach(type => {
      type.recommendedBeanIds = type.recommendedBeanIds.filter(id => {
        if (!beanIds.has(id)) {
          console.warn(`Invalid recommendedBeanId: ${id} in type ${type.id}`);
          return false;
        }
        return true;
      });
    });
  }

  // ===== Screen Navigation =====
  function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => {
      s.classList.remove('is-active');
    });
    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add('is-active');
      target.scrollTo(0, 0);
      window.scrollTo(0, 0);
    }
  }

  // ===== Utilities =====
  function getBeanById(id) {
    return state.beans.find(b => b.id === id) || null;
  }

  function getTypeById(id) {
    return state.types.find(t => t.id === id) || null;
  }

  function getFeaturedBean() {
    return state.beans.find(b => b.featured) || state.beans[0] || null;
  }

  function getRandomBean() {
    if (state.beans.length === 0) return null;
    return state.beans[Math.floor(Math.random() * state.beans.length)];
  }

  // ===== Toast =====
  function showToast(message, duration = 2500) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    setTimeout(() => toast.classList.remove('is-visible'), duration);
  }

  // ===== Share =====
  async function share(title, text, url) {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (e) {
        // User cancelled share
      }
    } else {
      try {
        await navigator.clipboard.writeText(url || window.location.href);
        showToast('URLをコピーしました 📋');
      } catch (e) {
        showToast('シェアに失敗しました');
      }
    }
  }

  // ===== Setup Purchase Button =====
  function setupPurchaseButton(btnEl, bean) {
    if (!btnEl || !bean) return;
    if (bean.baseUrl && bean.baseUrl.trim() !== '') {
      btnEl.href = bean.baseUrl;
      btnEl.classList.remove('is-disabled');
      btnEl.textContent = 'BASEで購入する →';
    } else {
      btnEl.href = '#';
      btnEl.classList.add('is-disabled');
      btnEl.textContent = '準備中 🫖';
      btnEl.addEventListener('click', (e) => {
        e.preventDefault();
      });
    }
  }

  // ===== Init =====
  async function init() {
    await loadData();
    if (!state.loaded) return;

    // 背景モモンガ演出
    spawnBgMomonga();

    // Top screen buttons
    document.getElementById('btn-diagnosis').addEventListener('click', () => {
      showScreen('screen-diagnosis');
      Diagnosis.start();
    });

    document.getElementById('btn-gacha').addEventListener('click', () => {
      showScreen('screen-gacha');
      Gacha.reset();
    });

    document.getElementById('btn-omakase').addEventListener('click', () => {
      const featured = getFeaturedBean();
      if (featured) {
        showScreen('screen-result');
        Result.showOmakase(featured);
      }
    });

    // Diagnosis shortcuts
    document.getElementById('btn-shortcut-omakase').addEventListener('click', () => {
      const featured = getFeaturedBean();
      if (featured) {
        showScreen('screen-result');
        Result.showOmakase(featured);
      }
    });

    document.getElementById('btn-shortcut-gacha').addEventListener('click', () => {
      showScreen('screen-gacha');
      Gacha.reset();
    });

    // Back buttons
    document.getElementById('btn-diagnosis-back').addEventListener('click', () => showScreen('screen-top'));
    document.getElementById('btn-result-back').addEventListener('click', () => showScreen('screen-top'));
    document.getElementById('btn-gacha-back').addEventListener('click', () => showScreen('screen-top'));
    document.getElementById('btn-blend-back').addEventListener('click', () => showScreen('screen-result'));

    // Result actions
    document.getElementById('btn-retry').addEventListener('click', () => {
      showScreen('screen-diagnosis');
      Diagnosis.start();
    });

    document.getElementById('btn-share').addEventListener('click', () => {
      const typeName = document.getElementById('result-type-name').textContent;
      share(
        'モモンガコーヒー診断結果',
        `私のコーヒータイプは「${typeName}」でした！あなたもモモンガコーヒーで診断してみよう ☕🐿️`,
        window.location.href
      );
    });

    // Gacha
    document.getElementById('btn-gacha-to-top').addEventListener('click', () => showScreen('screen-top'));
  }

  // Boot
  document.addEventListener('DOMContentLoaded', init);

  return {
    state,
    showScreen,
    getBeanById,
    getTypeById,
    getFeaturedBean,
    getRandomBean,
    showToast,
    share,
    setupPurchaseButton,
  };
})();
