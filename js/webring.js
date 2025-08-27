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

    function renderRows(list) {
        if (!tableEl) return;
        const frag = document.createDocumentFragment();

        list.forEach(site => {
            const name = String(site.name ?? site.title ?? "");
            const year = String(site.year ?? site.grad ?? site.class ?? "");
            const url = String(site.website ?? site.url ?? site.link ?? "");

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
      `;

            row.addEventListener("click", (e) => {
                if (!(e.target instanceof HTMLAnchorElement)) {
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
