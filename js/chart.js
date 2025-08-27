// network web chart using D3.js
function createChart() {
    const css = getComputedStyle(document.documentElement);
    const INK = (css.getPropertyValue('--ink') || '#000').trim();
    const INK_2 = (css.getPropertyValue('--ink-2') || '#1a1a1a').trim();
    const PAPER = (css.getPropertyValue('--paper') || '#fff').trim();
    const RULE_MID = (css.getPropertyValue('--rule-mid') || 'rgba(0,0,0,.55)').trim();
    const RULE_WEAK = (css.getPropertyValue('--rule-weak') || 'rgba(0,0,0,.35)').trim();
    const ACCENT = (css.getPropertyValue('--accent') || '#7a003c').trim();

    const container = d3.select("#chartContainer");
    const containerRect = container.node().getBoundingClientRect();
    const width = containerRect.width || 350;
    const height = containerRect.height || 300;

    const nodeRadius = 6;
    const defaultNodeStroke = INK;         // ink outline
    const defaultNodeFill = PAPER;       // paper fill (hollow dot look)
    const matchNodeFill = ACCENT;      // when search matches
    const hoverNodeFill = ACCENT;      // on hover

    const defaultEdgeColor = RULE_WEAK;   // hairline rules
    const hoverEdgeColor = ACCENT;      // accent for connected edges
    const edgeWidth = 1.25;
    const dashDefault = "1.5,3";     // dotted / hairline
    const dashHighlight = null;        // solid on highlight

    container.selectAll("*").remove();

    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("background-color", "transparent")
        .style("cursor", "grab");

    const g = svg.append("g");

    // zoom & pan
    const zoom = d3.zoom()
        .scaleExtent([0.6, 2.2])
        .on("zoom", (event) => {
            g.attr("transform", event.transform);
        });
    svg.call(zoom);

    const sites = allSites.map((site, index) => ({ ...site, id: `node-${index}` }));
    const links = sites.map((site, index) => ({
        source: site.id,
        target: sites[(index + 1) % sites.length].id,
    }));

    const simulation = d3.forceSimulation(sites)
        .force("link", d3.forceLink(links).id(d => d.id).distance(80))
        .force("charge", d3.forceManyBody().strength(-150))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(nodeRadius * 2.5))
        .alphaDecay(0.02)
        .velocityDecay(0.4);

    // edges
    const link = g.append("g")
        .attr("fill", "none")
        .selectAll("line")
        .data(links)
        .enter()
        .append("line")
        .attr("stroke", defaultEdgeColor)
        .attr("stroke-opacity", 0.9)
        .attr("stroke-width", edgeWidth)
        .attr("stroke-linecap", "round")
        .attr("stroke-dasharray", dashDefault);

    // nodes
    const node = g.append("g")
        .selectAll("g")
        .data(sites)
        .enter()
        .append("g")
        .style("cursor", "pointer")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
        );

    // circles
    node.append("circle")
        .attr("r", nodeRadius)
        .attr("fill", d => getNodeFill(d))
        .attr("stroke", defaultNodeStroke)
        .attr("stroke-width", 1.5)
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut)
        .on("click", handleClick);

    // labels
    node.append("text")
        .attr("dx", nodeRadius + 8)
        .attr("dy", 4)
        .style("font-family", "JetBrains Mono, monospace")
        .style("font-size", "10px")
        .style("fill", RULE_MID)
        .style("pointer-events", "none")
        .text(d => {
            const domain = d.website.replace(/^https?:\/\//, "").replace(/^www\./, "");
            return domain.length > 15 ? domain.substring(0, 12) + "..." : domain;
        });

    simulation.on("tick", ticked);

    let stabilizationTimer;
    simulation.on("tick", () => {
        ticked();
        clearTimeout(stabilizationTimer);
        stabilizationTimer = setTimeout(() => {
            if (simulation.alpha() < 0.1) fitToView();
        }, 100);
    });

    function ticked() {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node.attr("transform", d => `translate(${d.x},${d.y})`);
    }

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        svg.style("cursor", "grabbing");
        d.fx = d.x;
        d.fy = d.y;
    }
    function dragged(event, d) {
        d.fx = event.x; d.fy = event.y;
    }
    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        svg.style("cursor", "grab");
        d.fx = null; d.fy = null;
    }

    function getNodeFill(d) {
        const searchInput = document.getElementById("searchInput");
        const term = (searchInput ? searchInput.value : "").toLowerCase();
        if (!term) return defaultNodeFill;

        const match =
            d.name.toLowerCase().includes(term) ||
            d.year.toString().includes(term) ||
            d.website.toLowerCase().includes(term);

        return match ? matchNodeFill : defaultNodeFill;
    }

    function handleMouseOver(event, d) {
        d3.select(this)
            .transition().duration(120)
            .attr("fill", hoverNodeFill);

        link
            .transition().duration(120)
            .attr("stroke", l => (l.source.id === d.id || l.target.id === d.id) ? hoverEdgeColor : defaultEdgeColor)
            .attr("stroke-dasharray", l => (l.source.id === d.id || l.target.id === d.id) ? dashHighlight : dashDefault)
            .attr("stroke-opacity", l => (l.source.id === d.id || l.target.id === d.id) ? 1 : 0.9);

        showTooltip(event, d);
    }

    function handleMouseOut(event, d) {
        d3.select(this)
            .transition().duration(120)
            .attr("fill", getNodeFill(d));

        link
            .transition().duration(120)
            .attr("stroke", defaultEdgeColor)
            .attr("stroke-dasharray", dashDefault)
            .attr("stroke-opacity", 0.9);

        hideTooltip();
    }

    function handleClick(event, d) {
        event.stopPropagation();
        window.open(d.website, "_blank");
    }

    // tooltip
    function showTooltip(event, d) {
        d3.select("body").selectAll(".chart-tooltip").remove();

        const tooltip = d3.select("body")
            .append("div")
            .attr("class", "chart-tooltip")
            .style("position", "absolute")
            .style("background", PAPER)
            .style("color", INK_2)
            .style("padding", "10px 12px")
            .style("border", `1.5px dotted ${RULE_MID}`)
            .style("border-radius", "8px")
            .style("font-family", "EB Garamond, Georgia, serif")
            .style("font-size", "14px")
            .style("line-height", "1.2")
            .style("pointer-events", "none")
            .style("z-index", "1000")
            .style("opacity", 0);

        tooltip.html(`
      <div style="font-weight:600; color:${INK};">${d.name}</div>
      <div style="margin-top:3px; font-family:'JetBrains Mono', monospace; font-size:12px; color:${ACCENT};">
        Class of ${d.year}
      </div>
      <div style="margin-top:5px; font-family:'JetBrains Mono', monospace; font-size:11px; color:${RULE_MID};">
        Click to visit
      </div>
    `)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px")
            .transition().duration(160)
            .style("opacity", 1);
    }

    function hideTooltip() {
        d3.select("body").selectAll(".chart-tooltip")
            .transition().duration(120)
            .style("opacity", 0)
            .remove();
    }

    function updateHighlighting() {
        node.selectAll("circle").attr("fill", d => getNodeFill(d));
    }
    const searchInput = document.getElementById("searchInput");
    if (searchInput) searchInput.addEventListener("input", updateHighlighting);

    function fitToView() {
        const nodes = simulation.nodes();
        if (nodes.length === 0) return;

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        nodes.forEach(d => {
            minX = Math.min(minX, d.x); minY = Math.min(minY, d.y);
            maxX = Math.max(maxX, d.x); maxY = Math.max(maxY, d.y);
        });

        const padding = nodeRadius + 8;
        minX -= padding; minY -= padding; maxX += padding; maxY += padding;

        const scale = Math.min(width / (maxX - minX), height / (maxY - minY));
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        svg.transition()
            .duration(750)
            .call(zoom.transform, d3.zoomIdentity
                .translate(width / 2, height / 2)
                .scale(scale)
                .translate(-centerX, -centerY)
            );
    }

    function handleResize() {
        const newRect = container.node().getBoundingClientRect();
        const newWidth = newRect.width || 350;
        const newHeight = newRect.height || 300;

        svg.attr("width", newWidth).attr("height", newHeight);
        simulation.force("center", d3.forceCenter(newWidth / 2, newHeight / 2));
        simulation.alpha(0.3).restart();
    }
    window.addEventListener("resize", handleResize);
}
