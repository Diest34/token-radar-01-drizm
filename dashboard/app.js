// Token Radar's dashboard. Reads window.RADAR (written beside dashboard/ by
// main.ts) and renders the board, the detail view and the filters.
// No network: every byte it shows is in data.js.
(function () {
  'use strict';
  var DATA = window.RADAR;
  var rowsEl = document.getElementById('rows');
  var countEl = document.getElementById('count');
  var detailEl = document.getElementById('detail');
  var boardWrap = document.getElementById('boardwrap');
  var qEl = document.getElementById('q');
  var catEl = document.getElementById('cat');
  var chainEl = document.getElementById('chain');
  var viewEl = document.getElementById('view');
  var sortEl = document.getElementById('sort');
  var sortKey = 'rank';
  var sortDir = 1;

  function money(n) {
    if (n === null || n === undefined) return '—';
    if (n >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return '$' + (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return '$' + (n / 1e3).toFixed(0) + 'K';
    return '$' + String(n);
  }
  function pct(v) {
    if (v === null || v === undefined) return '<span class="flat">—</span>';
    var cls = v > 0 ? 'up' : v < 0 ? 'down' : 'flat';
    var sign = v > 0 ? '+' : '';
    return '<span class="' + cls + '">' + sign + v.toFixed(1) + '%</span>';
  }
  function age(v) {
    if (v === null || v === undefined) return '—';
    if (v < 30) return v + 'd';
    if (v < 365) return (v / 30).toFixed(0) + 'mo';
    return (v / 365).toFixed(1) + 'y';
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function signal(r) {
    if (r.plausibility < 1) return '<span class="badge cold">unlikely launch</span>';
    if (r.implied_value_usd >= 100000000) return '<span class="badge hot">top pick</span>';
    if (r.implied_value_usd >= 25000000) return '<span class="badge warm">watch</span>';
    return '<span class="badge">early</span>';
  }

  function fillSelect(el, values) {
    values.slice().sort().forEach(function (v) {
      var o = document.createElement('option');
      o.value = v; o.textContent = v;
      el.appendChild(o);
    });
  }
  var cats = {}, chains = {};
  DATA.rows.forEach(function (r) {
    if (r.category) cats[r.category] = 1;
    (r.chains || []).forEach(function (c) { chains[c] = 1; });
  });
  fillSelect(catEl, Object.keys(cats));
  fillSelect(chainEl, Object.keys(chains));

  document.getElementById('meta').textContent =
    'Snapshot ' + DATA.as_of + ' · ' + DATA.board_size + ' pre-token protocols · ' +
    DATA.watchlist_size + ' on the watchlist · ' + DATA.live_size + ' already trading · model ' + DATA.model_version;
  document.getElementById('foot').textContent =
    'Token Radar ' + DATA.model_version + ' · snapshot ' + DATA.as_of + ' · ' + esc(DATA.source);

  function currentRows() {
    var q = qEl.value.trim().toLowerCase();
    var cat = catEl.value, chain = chainEl.value;
    var list = viewEl.value === 'live' ? DATA.live : DATA.rows;
    var out = list.filter(function (r) {
      if (q && r.name.toLowerCase().indexOf(q) < 0 && r.slug.toLowerCase().indexOf(q) < 0) return false;
      if (cat && r.category !== cat) return false;
      if (chain && !(r.chains || []).indexOf(chain) >= 0) return false;
      return true;
    });
    var key = sortKey;
    out.sort(function (a, b) {
      var av, bv;
      if (key === 'rank') { av = a.rank || 1e9; bv = b.rank || 1e9; }
      else if (key === 'implied') { av = a.implied_value_usd || a.mcap_usd || 0; bv = b.implied_value_usd || b.mcap_usd || 0; return (bv - av) * sortDir; }
      else if (key === 'tvl') { av = a.tvl_usd; bv = b.tvl_usd; return (bv - av) * sortDir; }
      else if (key === 'growth') { av = a.change_7d === null ? -1e9 : a.change_7d; bv = b.change_7d === null ? -1e9 : b.change_7d; return (bv - av) * sortDir; }
      else if (key === 'name') { return (a.name < b.name ? -1 : 1) * sortDir; }
      return (av - bv) * sortDir;
    });
    return out;
  }

  function renderBoard() {
    var list = currentRows();
    var live = viewEl.value === 'live';
    var html = '';
    list.slice(0, 200).forEach(function (r) {
      var val = live ? r.mcap_usd : r.implied_value_usd;
      html += '<tr><td class="num">' + (r.rank || '—') + '</td>' +
        '<td class="name"><a href="#' + esc(r.slug) + '">' + esc(r.name) + '</a><small>' + esc(r.slug) + '</small></td>' +
        '<td>' + esc(r.category || '—') + '</td>' +
        '<td>' + esc((r.chains || []).slice(0, 3).join(', ')) + '</td>' +
        '<td class="num">' + money(r.tvl_usd) + '</td>' +
        '<td class="num">' + pct(r.change_7d) + '</td>' +
        '<td class="num">' + age(r.age_days) + '</td>' +
        '<td class="num">' + money(val) + '</td>' +
        '<td>' + (live ? '<span class="badge">trading</span>' : signal(r)) + '</td></tr>';
    });
    rowsEl.innerHTML = html || '<tr><td colspan="9" class="empty">Nothing matches these filters.</td></tr>';
    countEl.textContent = list.length + ' protocol' + (list.length === 1 ? '' : 's') +
      (list.length > 200 ? ' (showing the first 200 — narrow the filters to see more)' : '') +
      (live ? ' · already trading, shown by market cap' : ' · ranked by implied value');
  }

  function renderDetail(slug) {
    var r = null;
    for (var i = 0; i < DATA.rows.length; i++) if (DATA.rows[i].slug === slug) { r = DATA.rows[i]; break; }
    if (!r) { detailEl.hidden = true; boardWrap.hidden = false; return; }
    boardWrap.hidden = true;
    detailEl.hidden = false;
    var steps = r.farm_steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('');
    var factors = 'TVL ' + money(r.tvl_usd) + ' × category ' + r.category_multiple.toFixed(2) +
      ' × growth ' + r.growth_factor.toFixed(3) + ' × tenure ' + r.tenure_factor.toFixed(3) +
      ' × chains ' + r.chain_factor.toFixed(2) + ' × plausibility ' + r.plausibility.toFixed(2) +
      ' = ' + money(r.implied_value_usd);
    detailEl.innerHTML =
      '<h2>#' + r.rank + ' · ' + esc(r.name) + '</h2>' +
      '<p class="sub">' + esc(r.slug) + ' · ' + esc(r.category || 'Uncategorised') + ' · ' +
      esc((r.chains || []).join(', ')) + ' · records no token</p>' +
      '<div class="grid">' +
      '<div class="cell"><span>Implied value</span><b>' + money(r.implied_value_usd) + '</b></div>' +
      '<div class="cell"><span>TVL</span><b>' + money(r.tvl_usd) + '</b></div>' +
      '<div class="cell"><span>7-day change</span><b>' + (r.change_7d === null ? '—' : (r.change_7d > 0 ? '+' : '') + r.change_7d.toFixed(1) + '%') + '</b></div>' +
      '<div class="cell"><span>Age</span><b>' + age(r.age_days) + '</b></div>' +
      '<div class="cell"><span>Listed</span><b>' + esc(r.listed_at || '—') + '</b></div>' +
      '<div class="cell"><span>Plausibility</span><b>' + (r.plausibility * 100).toFixed(0) + '%</b></div>' +
      '</div>' +
      '<h3>Why this rank</h3><p class="factors">' + esc(factors) + '</p>' +
      '<h3>How to farm it</h3><ol>' + steps + '</ol>' +
      '<a class="back" href="#">← Back to the board</a>';
    window.scrollTo(0, 0);
  }

  function route() {
    var slug = window.location.hash.replace(/^#/, '');
    if (slug) renderDetail(slug);
    else { detailEl.hidden = true; boardWrap.hidden = false; renderBoard(); }
  }

  [qEl, catEl, chainEl, viewEl, sortEl].forEach(function (el) {
    el.addEventListener('input', function () { window.location.hash = ''; route(); });
    el.addEventListener('change', function () { window.location.hash = ''; route(); });
  });
  document.querySelectorAll('#board th').forEach(function (th) {
    th.addEventListener('click', function () {
      var k = th.getAttribute('data-k');
      if (!k) return;
      var map = { rank: 'rank', implied: 'implied', tvl: 'tvl', growth: 'growth', name: 'name' };
      if (sortKey === map[k]) sortDir = -sortDir; else { sortKey = map[k] || 'rank'; sortDir = 1; }
      sortEl.value = sortKey;
      renderBoard();
    });
  });
  sortEl.addEventListener('change', function () { sortKey = sortEl.value; sortDir = 1; renderBoard(); });
  window.addEventListener('hashchange', route);
  route();
})();
