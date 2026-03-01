// search highlighting & chart compatibility

(function () {
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

    const tableEl = $("#sitesTable");
    const searchInput = $("#searchInput");
    const countTargets = $$(".stats .count, #dir-heading .count, .count");

    const hasAllSites = typeof allSites !== "undefined";
    const sitesSource = hasAllSites
        ? allSites
        : (typeof webringData !== "undefined" ? (webringData.sites || []) : []);

    if (typeof filteredSites === "undefined") {
        window.filteredSites = [...sitesSource];
    } else {
        filteredSites.splice(0, filteredSites.length, ...sitesSource);
    }

    const socialIcons = {
        linkedin: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
        x: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`
    };

    function renderSocials(socials) {
        if (!socials) return '';
        let html = '';
        if (socials.linkedin) {
            html += `<a class="social-link" href="${escapeAttr(socials.linkedin)}" target="_blank" rel="noopener" aria-label="LinkedIn">${socialIcons.linkedin}</a>`;
        }
        if (socials.x) {
            html += `<a class="social-link" href="${escapeAttr(socials.x)}" target="_blank" rel="noopener" aria-label="X">${socialIcons.x}</a>`;
        }
        return html;
    }

    function renderRows(list) {
        if (!tableEl) return;
        const frag = document.createDocumentFragment();

        list.forEach(site => {
            const name = String(site.name ?? site.title ?? "");
            const year = String(site.year ?? site.grad ?? site.class ?? "");
            const url = String(site.website ?? site.url ?? site.link ?? "");
            const socials = site.socials || null;

            const row = document.createElement("div");
            row.className = "site-row";
            row.tabIndex = 0;
            row.dataset.name = name;
            row.dataset.year = year;
            row.dataset.url = url;

            row.innerHTML = `
        <div class="site-name" data-text="${escapeHTML(name)}">${escapeHTML(name)}</div>
        <div class="site-year" data-text="${escapeHTML(year)}">${escapeHTML(year)}</div>
        <div class="site-website">
          <a class="site-url" href="${escapeAttr(url)}" target="_blank" rel="noopener"
             data-text="${escapeHTML(url)}">${escapeHTML(url)}</a>
        </div>
        <div class="site-socials">${renderSocials(socials)}</div>
      `;

            row.addEventListener("click", (e) => {
                if (!(e.target instanceof HTMLAnchorElement) && !e.target.closest('.social-link')) {
                    row.querySelector(".site-url")?.click();
                }
            });
            row.addEventListener("keydown", (e) => {
                if (e.key === "Enter") row.click();
            });

            frag.appendChild(row);
        });

        tableEl.innerHTML = "";
        tableEl.appendChild(frag);
    }

    function handleSearch() {
        const q = (searchInput?.value || "").trim().toLowerCase();
        const tokens = q.split(/\s+/).filter(Boolean);

        if (tokens.length === 0) {
            $$(".site-row", tableEl).forEach(row => {
                row.classList.remove("is-match", "is-dim");
                unmark(row);
            });
            if (typeof filteredSites !== "undefined") {
                filteredSites.splice(0, filteredSites.length, ...sitesSource);
            }
            updateCount(sitesSource.length);
            return;
        }

        const matched = [];
        $$(".site-row", tableEl).forEach(row => {
            const name = (row.dataset.name || "").toLowerCase();
            const year = (row.dataset.year || "").toLowerCase();
            const url = (row.dataset.url || "").toLowerCase();
            const hay = `${name} ${year} ${url}`;

            const isMatch = tokens.every(t => hay.includes(t));
            row.classList.toggle("is-match", isMatch);
            row.classList.toggle("is-dim", !isMatch);

            unmark(row);
            if (isMatch) {
                markText(row.querySelector(".site-name"), tokens);
                markText(row.querySelector(".site-url"), tokens);
                matched.push({
                    name: row.dataset.name || "",
                    year: row.dataset.year || "",
                    website: row.dataset.url || ""
                });
            }
        });

        if (typeof filteredSites !== "undefined") {
            filteredSites.splice(0, filteredSites.length, ...matched);
        }

        updateCount(sitesSource.length);
    }

    function updateCount(n) {
        countTargets.forEach(el => { el.textContent = String(n); });
    }

    function markText(node, tokens) {
        if (!node) return;
        const orig = node.getAttribute("data-text") ?? node.textContent ?? "";
        const lower = orig.toLowerCase();

        let ranges = [];
        tokens.forEach(t => {
            let i = 0;
            while (t && (i = lower.indexOf(t, i)) !== -1) {
                ranges.push([i, i + t.length]);
                i += t.length;
            }
        });
        if (!ranges.length) { node.innerHTML = escapeHTML(orig); return; }

        ranges.sort((a, b) => a[0] - b[0]);
        const merged = [];
        for (const r of ranges) {
            if (!merged.length || r[0] > merged[merged.length - 1][1]) merged.push(r);
            else merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], r[1]);
        }

        let out = "", last = 0;
        for (const [s, e] of merged) {
            out += escapeHTML(orig.slice(last, s));
            out += "<mark>" + escapeHTML(orig.slice(s, e)) + "</mark>";
            last = e;
        }
        out += escapeHTML(orig.slice(last));
        node.innerHTML = out;
    }

    function unmark(row) {
        const n = row.querySelector(".site-name");
        const y = row.querySelector(".site-year");
        const u = row.querySelector(".site-url");
        if (n && n.hasAttribute("data-text")) n.innerHTML = escapeHTML(n.getAttribute("data-text"));
        if (y && y.hasAttribute("data-text")) y.innerHTML = escapeHTML(y.getAttribute("data-text"));
        if (u && u.hasAttribute("data-text")) u.innerHTML = escapeHTML(u.getAttribute("data-text"));
    }

    function ensureClearButton() {
        if (!searchInput) return;
        const wrap = searchInput.closest(".search-container") || searchInput.parentElement;
        if (!wrap || wrap.querySelector(".search-clear")) return;

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "search-clear";
        btn.setAttribute("aria-label", "Clear search");
        btn.textContent = "✕";
        btn.style.visibility = "hidden";
        btn.addEventListener("click", () => {
            searchInput.value = "";
            handleSearch();
            searchInput.focus();
            btn.style.visibility = "hidden";
        });
        wrap.appendChild(btn);

        searchInput.addEventListener("input", () => {
            btn.style.visibility = searchInput.value ? "visible" : "hidden";
        }, { passive: true });
    }

    function escapeHTML(str) {
        return String(str)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;");
    }
    function escapeAttr(str) {
        return escapeHTML(str).replaceAll("'", "&#39;");
    }

    renderRows(sitesSource);
    updateCount(sitesSource.length);

    if (searchInput) {
        searchInput.addEventListener("input", handleSearch, { passive: true });
        searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && searchInput.value) {
                e.preventDefault();
                searchInput.value = "";
                handleSearch();
            }
        });
    }
    ensureClearButton();

    if (typeof createChart === "function") {
        try { createChart(); } catch (e) { console.error("createChart failed:", e); }
    }
})();
