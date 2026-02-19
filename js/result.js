/**
 * result.js
 * 結果表示 — タイプカード・おすすめ豆・レーダーチャート・ブレンド分解
 */
const Result = (() => {
  let currentBean = null;
  let currentType = null;

  /**
   * 診断結果を表示する
   */
  function showDiagnosis(topType, secondType) {
    currentType = topType;

    // Render type card
    renderTypeCard(topType);

    // Pick recommended bean (with random element for fun)
    const recommendedIds = topType.recommendedBeanIds || [];
    let mainBean = null;
    if (recommendedIds.length > 0) {
      const randomIdx = Math.floor(Math.random() * recommendedIds.length);
      mainBean = App.getBeanById(recommendedIds[randomIdx]);
    }
    if (!mainBean) mainBean = App.getFeaturedBean();
    currentBean = mainBean;

    renderBeanCard(mainBean);

    // Second recommendation from second type
    if (secondType) {
      const altIds = secondType.recommendedBeanIds || [];
      let altBean = null;
      for (const id of altIds) {
        if (id !== mainBean.id) {
          altBean = App.getBeanById(id);
          break;
        }
      }
      if (altBean) {
        renderAltCard(altBean, secondType);
      } else {
        document.getElementById('result-alt-card').style.display = 'none';
      }
    } else {
      document.getElementById('result-alt-card').style.display = 'none';
    }

    // Blend link
    setupBlendLink(mainBean);
  }

  /**
   * おまかせ結果を表示する
   */
  function showOmakase(bean) {
    currentBean = bean;
    currentType = null;

    // Show a friendly omakase type card
    const typeCard = document.getElementById('result-type-card');
    document.getElementById('result-type-emoji').textContent = '🙏';
    document.getElementById('result-type-name').textContent = '迷わなくて正解です';
    document.getElementById('result-type-desc').textContent = '店主が自信を持っておすすめする一杯をどうぞ。';
    document.getElementById('result-type-personality').textContent = '';

    renderBeanCard(bean);
    document.getElementById('result-alt-card').style.display = 'none';
    setupBlendLink(bean);
  }

  function renderTypeCard(type) {
    document.getElementById('result-type-emoji').textContent = type.emoji || '☕';
    document.getElementById('result-type-name').textContent = type.name;
    document.getElementById('result-type-desc').textContent = type.description;
    document.getElementById('result-type-personality').textContent = type.personality || '';
  }

  function renderBeanCard(bean) {
    document.getElementById('result-bean-name').textContent = bean.name;
    document.getElementById('result-bean-roast').textContent = `${bean.roastLabel} / ${bean.origin || bean.roast}`;
    document.getElementById('result-bean-desc').textContent = bean.description;

    // Flavor tags
    const flavorsEl = document.getElementById('result-bean-flavors');
    flavorsEl.innerHTML = (bean.flavorNotes || [])
      .map(f => `<span class="flavor-tag">${f}</span>`)
      .join('');

    // Radar chart
    setTimeout(() => {
      RadarChart.draw('radar-chart-main', bean.scores);
    }, 100);

    // Purchase button
    App.setupPurchaseButton(document.getElementById('btn-purchase-main'), bean);
  }

  function renderAltCard(bean, fromType) {
    const altCard = document.getElementById('result-alt-card');
    altCard.style.display = 'block';

    document.getElementById('result-alt-name').textContent = bean.name;
    document.getElementById('result-alt-desc').textContent =
      `「${fromType.name}」の一面もあるあなたには、${bean.name}もおすすめ。`;

    const altBtn = document.getElementById('btn-purchase-alt');
    if (bean.baseUrl && bean.baseUrl.trim()) {
      altBtn.href = bean.baseUrl;
      altBtn.textContent = 'こちらも見る →';
      altBtn.classList.remove('is-disabled');
    } else {
      altBtn.href = '#';
      altBtn.textContent = '準備中 🫖';
      altBtn.classList.add('is-disabled');
      altBtn.addEventListener('click', e => e.preventDefault());
    }
  }

  function setupBlendLink(bean) {
    const blendLinkDiv = document.getElementById('result-blend-link');
    if (bean.type === 'blend' && bean.blend && bean.blend.components) {
      blendLinkDiv.style.display = 'block';
      document.getElementById('btn-blend-detail').onclick = () => {
        App.showScreen('screen-blend');
        renderBlendDetail(bean);
      };
    } else {
      blendLinkDiv.style.display = 'none';
    }
  }

  function renderBlendDetail(bean) {
    document.getElementById('blend-title').textContent = `🔍 ${bean.name} の中身`;
    document.getElementById('blend-concept').textContent = bean.blend.concept || '';

    const container = document.getElementById('blend-components');
    container.innerHTML = '';

    bean.blend.components.forEach(comp => {
      const compBean = App.getBeanById(comp.beanId);
      if (!compBean) return;

      const card = document.createElement('div');
      card.className = 'blend-component-card';

      const canvasId = `blend-chart-${comp.beanId}`;
      const purchaseClass = (compBean.baseUrl && compBean.baseUrl.trim()) ? '' : 'is-disabled';
      const purchaseText = purchaseClass ? '準備中 🫖' : 'ストレートで試す →';
      const purchaseHref = compBean.baseUrl && compBean.baseUrl.trim() ? compBean.baseUrl : '#';

      card.innerHTML = `
        <div class="blend-component-role">${comp.role}</div>
        <div class="blend-component-name">${compBean.name}</div>
        <div class="blend-component-ratio">${comp.ratio ? comp.ratio + '%' : ''} / ${compBean.roastLabel}</div>
        <div class="radar-chart-wrapper">
          <canvas id="${canvasId}" width="200" height="200" aria-label="${compBean.name}のレーダーチャート"></canvas>
        </div>
        <a class="blend-component-purchase ${purchaseClass}" href="${purchaseHref}" target="_blank" rel="noopener">
          ${purchaseText}
        </a>
      `;

      container.appendChild(card);

      // Draw chart after DOM insertion
      setTimeout(() => {
        RadarChart.draw(canvasId, compBean.scores, { size: 200 });
      }, 100);
    });
  }

  return { showDiagnosis, showOmakase };
})();
