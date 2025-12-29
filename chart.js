(function () {
  'use strict';

  const TOTAL_WIDTH = 1400;
  const ROW_HEADER_WIDTH = 80;
  const CHART_HEIGHT = 800;

  kintone.events.on('app.record.index.show', function (event) {

    if (document.getElementById('pdfArea')) {
      return event;
    }

    loadScript('https://cdn.jsdelivr.net/npm/chart.js', function () {
      loadScript('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js', function () {
        loadScript('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js', function () {
          draw(event);
        });
      });
    });

    return event;
  });

  function draw(event) {

    const headerSpace = kintone.app.getHeaderSpaceElement();

    const wrapper = document.createElement('div');
    wrapper.style.marginTop = '20px';
    wrapper.style.marginBottom = '30px';

    const pdfArea = document.createElement('div');
    pdfArea.id = 'pdfArea';
    pdfArea.style.width = (TOTAL_WIDTH + 20) + 'px';
    pdfArea.style.background = '#fff';
    pdfArea.style.padding = '10px';
    pdfArea.style.boxSizing = 'border-box';

    wrapper.appendChild(pdfArea);
    headerSpace.appendChild(wrapper);

    const headerMenu = kintone.app.getHeaderMenuSpaceElement();
    const btn = document.createElement('button');
    btn.textContent = 'PDF出力';
    btn.onclick = function () {
      exportPdf(pdfArea);
    };
    headerMenu.appendChild(btn);

    /* ===== データ準備 ===== */
    const records = event.records.slice().reverse();

    const labels = [];
    const lastYear = [];
    const target = [];
    const sales = [];
    const achievement = [];

    let totalLastYear = 0;
    let totalTarget = 0;
    let totalSales = 0;

    records.forEach(r => {
      const ly = Number(r.前年売上.value || 0);
      const tg = Number(r.目標金額.value || 0);
      const sl = Number(r.売上金額.value || 0);

      labels.push(r.部門名.value);
      lastYear.push(ly);
      target.push(tg);
      sales.push(sl);

      const rate = tg > 0 ? Math.round((sl / tg) * 100) : 0;
      achievement.push(rate);

      totalLastYear += ly;
      totalTarget += tg;
      totalSales += sl;
    });

    const totalAchievement =
      totalTarget > 0 ? Math.round((totalSales / totalTarget) * 100) : 0;

    labels.push('計');
    lastYear.push(totalLastYear);
    target.push(totalTarget);
    sales.push(totalSales);
    achievement.push(totalAchievement);

    /* ===== グラフ ===== */
    const canvas = document.createElement('canvas');
    canvas.id = 'salesChart';
    canvas.width = TOTAL_WIDTH;
    canvas.height = CHART_HEIGHT;
    pdfArea.appendChild(canvas);

    new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: '前年売上', data: lastYear, backgroundColor: 'rgba(255,206,86,0.7)' },
          { label: '目標金額', data: target, backgroundColor: 'rgba(54,162,235,0.7)' },
          { label: '売上実績', data: sales, backgroundColor: 'rgba(255,99,132,0.7)' }
        ]
      },
      options: {
  responsive: false,

  plugins: {
    title: {
      display: true,
      text: '部門別 売上グラフ',
      padding: { top: 10, bottom: 15 },
      color: '#333',                // ★ 追加
      font: {
        size: 26,
        weight: 'normal'
      }
    },
    legend: {
      labels: {
        color: '#333',              // ★ 追加
        font: {
          size: 12,
          weight: 'normal'
        }
      }
    }
  },

  scales: {
    x: {
      ticks: {
        autoSkip: false,
        maxRotation: 0,
        minRotation: 0,
        color: '#333',              // ★ 追加
        font: {
          size: 12,
          weight: 'normal'
        }
      }
    },
    y: {
      beginAtZero: true,
      ticks: {
        color: '#333',              // ★ 追加
        font: {
          size: 12,
          weight: 'normal'
        },
        callback: function (value) {
          return value.toLocaleString();
        }
      },
      grid: {
        color: '#ddd'               // ★ 補助線だけ薄く（任意）
      }
    }
  }
}
    });

    /* ===== 下の表 ===== */
    const table = document.createElement('table');
    table.style.width = TOTAL_WIDTH + 'px';
    table.style.tableLayout = 'fixed';
    table.style.borderCollapse = 'collapse';
    table.style.fontSize = '12px';
    table.style.border = '1px solid #999';
    table.style.marginTop = '0px';

    const colgroup = document.createElement('colgroup');
    const colLeft = document.createElement('col');
    colLeft.style.width = ROW_HEADER_WIDTH + 'px';
    colgroup.appendChild(colLeft);

    const colCount = records.length + 1;
    const colWidth = Math.floor((TOTAL_WIDTH - ROW_HEADER_WIDTH) / colCount);

    for (let i = 0; i < colCount; i++) {
      const col = document.createElement('col');
      col.style.width = colWidth + 'px';
      colgroup.appendChild(col);
    }

    table.appendChild(colgroup);

    const tbody = document.createElement('tbody');

    function addRow(label, values, total, isPercent) {
      const tr = document.createElement('tr');
      const tdLabel = document.createElement('td');
      tdLabel.textContent = label;
      tr.appendChild(tdLabel);

      values.forEach(v => {
        const td = document.createElement('td');
        td.textContent = isPercent ? v + '%' : v.toLocaleString();
        tr.appendChild(td);
      });

      const tdTotal = document.createElement('td');
      tdTotal.textContent = isPercent ? total + '%' : total.toLocaleString();
      tr.appendChild(tdTotal);

      tbody.appendChild(tr);
    }

    addRow('前年売上', lastYear.slice(0, -1), totalLastYear);
    addRow('目標金額', target.slice(0, -1), totalTarget);
    addRow('売上実績', sales.slice(0, -1), totalSales);
    addRow('達成率', achievement.slice(0, -1), totalAchievement, true);

    table.appendChild(tbody);

    table.querySelectorAll('td').forEach(cell => {
      cell.style.border = '1px solid #ddd';
      cell.style.padding = '4px';
      cell.style.textAlign = 'center';
    });

    pdfArea.appendChild(table);
  }

  /* ===== PDF出力（下余白なし）===== */
  function exportPdf(target) {
    html2canvas(target, {
      scale: 2,
      backgroundColor: '#ffffff',
      windowWidth: target.scrollWidth,
      windowHeight: target.scrollHeight
    }).then(canvas => {

      const pdf = new jspdf.jsPDF('l', 'mm', 'a4');
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 10;

      let imgW = pageW - margin * 2;
      let imgH = (canvas.height / canvas.width) * imgW;

      if (imgH > pageH - margin * 2) {
        imgH = pageH - margin * 2;
        imgW = (canvas.width / canvas.height) * imgH;
      }

      const x = (pageW - imgW) / 2;
      const y = margin; // ★ 下の余白をなくすポイント

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', x, y, imgW, imgH);
      pdf.save('部門別売上グラフ.pdf');
    });
  }

  function loadScript(src, callback) {
    const s = document.createElement('script');
    s.src = src;
    s.onload = callback;
    document.head.appendChild(s);
  }

})();
