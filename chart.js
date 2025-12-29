window.drawSalesChart = function (records) {
  console.log('[CDN] drawSalesChart called');
  console.log('[CDN] records:', records);

  // ① 画面に要素を出すテスト
  var space = kintone.app.getHeaderMenuSpaceElement();
  var div = document.createElement('div');
  div.textContent = 'CDNから表示されています（件数：' + records.length + '）';
  div.style.padding = '10px';
  div.style.background = '#e3f2fd';
  space.appendChild(div);
};
