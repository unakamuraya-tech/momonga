/**
 * gacha.js
 * ガチャ機能 — ランダム豆選出・スロット風アニメーション
 */
const Gacha = (() => {
  let isSpinning = false;

  function reset() {
    isSpinning = false;
    const stage = document.getElementById('gacha-stage');
    const result = document.getElementById('gacha-result');
    stage.style.display = 'flex';
    result.style.display = 'none';
    stage.classList.remove('gacha-spinning');

    // Bind pull button
    const pullBtn = document.getElementById('btn-gacha-pull');
    pullBtn.onclick = pull;

    // Bind again button
    const againBtn = document.getElementById('btn-gacha-again');
    againBtn.onclick = () => {
      reset();
    };
  }

  function pull() {
    if (isSpinning) return;
    isSpinning = true;

    const stage = document.getElementById('gacha-stage');
    stage.classList.add('gacha-spinning');

    // Animation duration
    setTimeout(() => {
      showResult();
    }, 900);
  }

  function showResult() {
    const bean = App.getRandomBean();
    if (!bean) {
      App.showToast('豆データが見つかりません 😢');
      isSpinning = false;
      return;
    }

    const stage = document.getElementById('gacha-stage');
    const result = document.getElementById('gacha-result');

    stage.style.display = 'none';
    result.style.display = 'block';

    // Fill result
    document.getElementById('gacha-result-name').textContent = bean.name;
    document.getElementById('gacha-result-roast').textContent =
      `${bean.roastLabel} / ${bean.origin || bean.roast}`;
    document.getElementById('gacha-result-comment').textContent =
      bean.shortComment || bean.description;

    // Radar chart
    setTimeout(() => {
      RadarChart.draw('radar-chart-gacha', bean.scores);
    }, 100);

    // Purchase button
    App.setupPurchaseButton(document.getElementById('btn-purchase-gacha'), bean);

    isSpinning = false;
  }

  return { reset };
})();
