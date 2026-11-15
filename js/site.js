(function () {
	'use strict';

	var doc = document.documentElement;
	doc.classList.add('js');

	/* ---------- Theme toggle ---------- */
	var toggle = document.querySelector('[data-theme-toggle]');
	if (toggle) {
		toggle.addEventListener('click', function () {
			var next = doc.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
			doc.setAttribute('data-theme', next);
			try { localStorage.setItem('portfolio.theme', next); } catch (e) { /* storage unavailable */ }
		});
	}

	/* ---------- Nav: scrolled state, mobile menu, back-to-top ---------- */
	var nav = document.querySelector('.nav');
	var menuBtn = document.querySelector('.nav__menu-btn');
	var toTop = document.querySelector('.to-top');

	function onScroll() {
		var y = window.scrollY;
		nav.classList.toggle('is-scrolled', y > 8);
		if (toTop) toTop.classList.toggle('is-visible', y > 800);
	}
	window.addEventListener('scroll', onScroll, { passive: true });
	onScroll();

	function closeMenu() {
		nav.classList.remove('is-open');
		menuBtn.setAttribute('aria-expanded', 'false');
	}
	menuBtn.addEventListener('click', function () {
		var open = nav.classList.toggle('is-open');
		menuBtn.setAttribute('aria-expanded', String(open));
	});
	document.querySelectorAll('.nav__links a').forEach(function (a) {
		a.addEventListener('click', closeMenu);
	});
	document.addEventListener('keydown', function (e) {
		if (e.key === 'Escape') closeMenu();
	});

	/* ---------- Active section highlight ---------- */
	var links = {};
	document.querySelectorAll('.nav__links a[href^="#"]').forEach(function (a) {
		links[a.getAttribute('href').slice(1)] = a;
	});

	if ('IntersectionObserver' in window) {
		var sectionObserver = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				var link = links[entry.target.id];
				if (link && entry.isIntersecting) {
					Object.keys(links).forEach(function (k) { links[k].classList.remove('is-active'); });
					link.classList.add('is-active');
				}
			});
		}, { rootMargin: '-45% 0px -50% 0px' });
		Object.keys(links).forEach(function (id) {
			var el = document.getElementById(id);
			if (el) sectionObserver.observe(el);
		});

		/* ---------- Reveal on scroll ---------- */
		var revealObserver = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					entry.target.classList.add('is-visible');
					revealObserver.unobserve(entry.target);
				}
			});
		}, { rootMargin: '0px 0px -8% 0px' });
		document.querySelectorAll('.reveal').forEach(function (el) { revealObserver.observe(el); });
	} else {
		document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
	}

	/* ---------- Copy email ---------- */
	document.querySelectorAll('[data-copy]').forEach(function (btn) {
		btn.addEventListener('click', function () {
			var text = btn.getAttribute('data-copy');
			var done = function () {
				var label = btn.textContent;
				btn.textContent = 'Copied';
				btn.classList.add('is-copied');
				setTimeout(function () {
					btn.textContent = label;
					btn.classList.remove('is-copied');
				}, 1600);
			};
			if (navigator.clipboard) {
				navigator.clipboard.writeText(text).then(done, function () {});
			}
		});
	});

	/* ---------- Open-source list: language filter + search ---------- */
	var list = document.getElementById('oss-list');
	var filterWrap = document.getElementById('oss-filters');
	var search = document.getElementById('oss-search');
	var empty = document.getElementById('oss-empty');

	if (list && filterWrap && search) {
		var items = Array.prototype.filter.call(list.children, function (el) {
			return el.querySelector('.proj-card');
		});

		items.forEach(function (item) {
			var chips = Array.prototype.map.call(item.querySelectorAll('.exp-chip'), function (c) {
				return c.textContent.trim();
			});
			item._tags = chips.filter(function (t) { return t.toLowerCase() !== 'npm'; });
			item._text = item.textContent.toLowerCase();
		});

		var counts = {};
		items.forEach(function (item) {
			item._tags.forEach(function (t) { counts[t] = (counts[t] || 0) + 1; });
		});
		var tags = Object.keys(counts)
			.filter(function (t) { return counts[t] >= 2; })
			.sort(function (a, b) { return counts[b] - counts[a]; })
			.slice(0, 7);

		var active = 'All';
		function makeFilter(label, count) {
			var b = document.createElement('button');
			b.type = 'button';
			b.className = 'filter' + (label === active ? ' is-active' : '');
			b.innerHTML = label + ' <small>' + count + '</small>';
			b.setAttribute('aria-pressed', String(label === active));
			b.addEventListener('click', function () {
				active = label;
				filterWrap.querySelectorAll('.filter').forEach(function (f) {
					var on = f === b;
					f.classList.toggle('is-active', on);
					f.setAttribute('aria-pressed', String(on));
				});
				apply();
			});
			filterWrap.appendChild(b);
		}
		makeFilter('All', items.length);
		tags.forEach(function (t) { makeFilter(t, counts[t]); });

		function apply() {
			var q = search.value.trim().toLowerCase();
			var shown = 0;
			items.forEach(function (item) {
				var ok = (active === 'All' || item._tags.indexOf(active) !== -1) &&
					(!q || item._text.indexOf(q) !== -1);
				item.hidden = !ok;
				if (ok) shown++;
			});
			empty.hidden = shown !== 0;
		}
		search.addEventListener('input', apply);
	}

	/* ---------- Footer year ---------- */
	var year = document.getElementById('year');
	if (year) year.textContent = new Date().getFullYear();
})();
