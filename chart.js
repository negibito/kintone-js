window.drawSalesChart = function (records) {
  console.log('[CDN] drawSalesChart called');
  console.log('[CDN] records:', records);

  // ① 表示エリア取得
  const space = kintone.app.getHeaderMenuSpaceElement();

  // ② 表示用div
  const box = document.createElement('div');
  box.style.padding = '10px';
  box.style.marginTop = '10px';
  box.style.background = '#e3f2fd';

  // ③ 1件目のレコード
  const r = records[0];

  // ④ フィールド値を取り出す（フィールドコードに注意）
  box.innerHTML = `
    <div>部門名：${r.部門名.value}</div>
    <div>前年売上：${r.前年売上.value}</div>
    <div>売上金額：${r.売上金額.value}</div>
  `;

  space.appendChild(box);
};
