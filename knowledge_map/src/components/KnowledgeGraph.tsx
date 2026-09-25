import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import * as d3 from "d3";
import { graphData, CATEGORIES, type GraphNode, type GraphLink } from "@/data/graph-data";

interface SimNode extends d3.SimulationNodeDatum, GraphNode {}
interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  weight: number;
}

export function KnowledgeGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const degreeMap = useMemo(() => {
    const map = new Map<string, number>();
    graphData.nodes.forEach((n) => map.set(n.id, 0));
    graphData.links.forEach((l) => {
      map.set(l.source, (map.get(l.source) || 0) + 1);
      map.set(l.target, (map.get(l.target) || 0) + 1);
    });
    return map;
  }, []);

  const categoryColor = useMemo(() => {
    const map = new Map<string, string>();
    CATEGORIES.forEach((c) => map.set(c.name, c.color));
    return map;
  }, []);

  const getConnected = useCallback(
    (nodeId: string) => {
      const connected = new Set<string>();
      const connectedLinks: GraphLink[] = [];
      graphData.links.forEach((l) => {
        const s = typeof l.source === "string" ? l.source : (l.source as SimNode).id;
        const t = typeof l.target === "string" ? l.target : (l.target as SimNode).id;
        if (s === nodeId) {
          connected.add(t);
          connectedLinks.push(l);
        }
        if (t === nodeId) {
          connected.add(s);
          connectedLinks.push(l);
        }
      });
      return { connected, connectedLinks };
    },
    [],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = Math.max(400, container.clientHeight || 560);

    d3.select(container).select("svg").remove();

    const nodes: SimNode[] = graphData.nodes.map((d) => ({ ...d }));
    const links: SimLink[] = graphData.links.map((d) => ({ ...d }));

    // Start in the middle of the canvas so the graph never animates in from
    // the top-left corner while the force simulation is warming up.
    const initialRadius = Math.min(width, height) * 0.2;
    nodes.forEach((node, index) => {
      const angle = (index / nodes.length) * Math.PI * 2;
      node.x = width / 2 + Math.cos(angle) * initialRadius;
      node.y = height / 2 + Math.sin(angle) * initialRadius;
    });

    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("display", "block");

    const zoomGroup = svg.append("g");

    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        zoomGroup.attr("transform", event.transform);
      });
    svg.call(zoomBehavior);

    const linkGroup = zoomGroup.append("g");
    const nodeGroup = zoomGroup.append("g");

    const linkElements = linkGroup
      .selectAll<SVGLineElement, SimLink>("line")
      .data(links)
      .join("line")
      .attr("class", "knowledge-map-link")
      .attr("stroke", "#b8b8b8")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", (d) => Math.max(0.5, d.weight * 0.4))
      .attr("stroke-dasharray", "4 3")
      .attr("stroke-dashoffset", 0);

    // 连线流动动画
    function animateFlow() {
      linkElements
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", -14)
        .on("end", function () {
          d3.select(this).attr("stroke-dashoffset", 0);
        });
    }
    // 延迟启动流动，等布局稳定后
    setTimeout(animateFlow, 800);
    const flowTimer = d3.interval(animateFlow, 2200);

    const nodeElements = nodeGroup
      .selectAll<SVGGElement, SimNode>("g")
      .data(nodes)
      .join("g")
      .attr("class", "knowledge-map-node")
      .style("cursor", "grab");

    const nodeRadius = (d: SimNode) => {
      const degree = degreeMap.get(d.id) || 0;
      return 5 + Math.pow(degree, 0.7) * 4;
    };

    nodeElements
      .append("circle")
      .attr("r", nodeRadius)
      .attr("fill", (d) => categoryColor.get(d.category) || "#666")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5);

    nodeElements
      .append("text")
      .text((d) => d.name)
      .attr("dy", (d) => nodeRadius(d) + 14)
      .attr("text-anchor", "middle")
      .attr("fill", "#737373")
      .attr("font-size", "11px")
      .attr("font-weight", "500")
      .style("pointer-events", "none")
      .style("user-select", "none");

    // Two soft axial forces act like a gravitational well. Unlike a hard
    // boundary, they keep isolated nodes in the same visual field while
    // allowing connected groups to settle into their own compact clusters.
    const gravityX = d3.forceX<SimNode>(width / 2).strength(0.045);
    const gravityY = d3.forceY<SimNode>(height / 2).strength(0.045);
    const centerForce = d3.forceCenter(width / 2, height / 2).strength(0.85);

    const simulation = d3
      .forceSimulation<SimNode>(nodes)
      .alphaDecay(0.02)
      .velocityDecay(0.4)
      .force(
        "link",
        d3
          .forceLink<SimNode, SimLink>(links)
          .id((d) => d.id)
          .distance(96)
          .strength((d) => d.weight * 0.075),
      )
      .force("charge", d3.forceManyBody<SimNode>().strength(-300))
      .force("center", centerForce)
      .force("gravity-x", gravityX)
      .force("gravity-y", gravityY)
      .force("collision", d3.forceCollide<SimNode>().radius((d) => nodeRadius(d) + 10).strength(0.8));

    let shouldFitLayout = true;

    const fitLayoutToViewport = () => {
      const positioned = nodes.filter((node) => Number.isFinite(node.x) && Number.isFinite(node.y));
      if (!positioned.length) return;

      const viewportWidth = container.clientWidth;
      const viewportHeight = Math.max(400, container.clientHeight || 560);
      const padding = 44;
      const minX = Math.min(...positioned.map((node) => node.x ?? 0));
      const maxX = Math.max(...positioned.map((node) => node.x ?? 0));
      const minY = Math.min(...positioned.map((node) => node.y ?? 0));
      const maxY = Math.max(...positioned.map((node) => node.y ?? 0));
      const graphWidth = Math.max(1, maxX - minX);
      const graphHeight = Math.max(1, maxY - minY);
      const scale = Math.min(
        1.25,
        (viewportWidth - padding * 2) / graphWidth,
        (viewportHeight - padding * 2) / graphHeight,
      );
      const translateX = viewportWidth / 2 - ((minX + maxX) / 2) * scale;
      const translateY = viewportHeight / 2 - ((minY + maxY) / 2) * scale;

      svg
        .transition()
        .duration(650)
        .call(
          zoomBehavior.transform,
          d3.zoomIdentity.translate(translateX, translateY).scale(scale),
        );
    };

    simulation.on("tick", () => {
      linkElements
        .attr("x1", (d) => (d.source as SimNode).x || 0)
        .attr("y1", (d) => (d.source as SimNode).y || 0)
        .attr("x2", (d) => (d.target as SimNode).x || 0)
        .attr("y2", (d) => (d.target as SimNode).y || 0);

      nodeElements.attr("transform", (d) => `translate(${d.x || 0},${d.y || 0})`);
    });

    simulation.on("end", () => {
      if (!shouldFitLayout) return;
      shouldFitLayout = false;
      fitLayoutToViewport();
    });

    const drag = d3
      .drag<SVGGElement, SimNode>()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.5).restart();
        d.fx = d.x;
        d.fy = d.y;
        d3.select(event.sourceEvent.target.closest("g")).style("cursor", "grabbing");
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
        simulation.alpha(0.4).restart();
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
        d3.select(event.sourceEvent.target.closest("g")).style("cursor", "grab");
      });

    nodeElements.call(drag);

    nodeElements
      .on("mouseover", function (_event, d) {
        const connectedIds = new Set<string>();
        links.forEach((l) => {
          const s = (l.source as SimNode).id;
          const t = (l.target as SimNode).id;
          if (s === d.id) connectedIds.add(t);
          if (t === d.id) connectedIds.add(s);
        });

        nodeElements
          .transition()
          .duration(200)
          .style("opacity", (n) => (n.id === d.id || connectedIds.has(n.id) ? 1 : 0.12));

        linkElements
          .transition()
          .duration(200)
          .attr("stroke-opacity", (l) =>
            (l.source as SimNode).id === d.id || (l.target as SimNode).id === d.id ? 0.85 : 0.12,
          )
          .attr("stroke", (l) =>
            (l.source as SimNode).id === d.id || (l.target as SimNode).id === d.id ? "#808080" : "#b8b8b8",
          );

        d3.select(this).select("circle").transition().duration(350).ease(d3.easeElasticOut.amplitude(1).period(0.4)).attr("r", function () {
          const parent = (this as Element | null)?.parentNode;
          if (!parent) return 0;
          const nd = d3.select(parent as SVGGElement).datum() as SimNode;
          return nodeRadius(nd) * 1.4;
        });
      })
      .on("mouseout", function () {
        nodeElements.transition().duration(300).style("opacity", 1);
        linkElements
          .transition()
          .duration(300)
          .attr("stroke-opacity", 0.6)
          .attr("stroke", "#b8b8b8");

        d3.select(this).select("circle").transition().duration(400).ease(d3.easeElasticOut.amplitude(1).period(0.5)).attr("r", function () {
          const parent = (this as Element | null)?.parentNode;
          if (!parent) return 0;
          const nd = d3.select(parent as SVGGElement).datum() as SimNode;
          return nodeRadius(nd);
        });
      })
      .on("click", (_event, d) => {
        setSelectedNode({
          id: d.id,
          name: d.name,
          category: d.category,
          description: d.description,
        });
      });

    const resizeObserver = new ResizeObserver(() => {
      const newWidth = container.clientWidth;
      const newHeight = Math.max(400, container.clientHeight || 560);
      svg.attr("width", newWidth).attr("height", newHeight);
      shouldFitLayout = true;
      simulation.force("center", d3.forceCenter(newWidth / 2, newHeight / 2).strength(0.85));
      simulation.force("gravity-x", d3.forceX<SimNode>(newWidth / 2).strength(0.045));
      simulation.force("gravity-y", d3.forceY<SimNode>(newHeight / 2).strength(0.045));
      simulation.alpha(0.3).restart();
    });
    resizeObserver.observe(container);

    return () => {
      simulation.stop();
      flowTimer.stop();
      resizeObserver.disconnect();
    };
  }, [degreeMap, categoryColor]);

  useEffect(() => {
    if (!containerRef.current) return;
    const svg = containerRef.current.querySelector("svg");
    if (!svg) return;

    const hasFilter = searchQuery || activeCategory;
    const matchIds = new Set<string>();

    if (hasFilter) {
      graphData.nodes.forEach((n) => {
        const nameMatch = !searchQuery || n.name.toLowerCase().includes(searchQuery.toLowerCase());
        const catMatch = !activeCategory || n.category === activeCategory;
        if (nameMatch && catMatch) matchIds.add(n.id);
      });
    }

    d3.select(svg)
      .selectAll<SVGGElement, SimNode>(".knowledge-map-node")
      .transition()
      .duration(200)
      .style("opacity", (d) => {
        if (!hasFilter) return 1;
        return matchIds.has(d.id) ? 1 : 0.1;
      });

    d3.select(svg)
      .selectAll<SVGLineElement, SimLink>(".knowledge-map-link")
      .transition()
      .duration(200)
      .attr("stroke-opacity", (d) => {
        if (!hasFilter) return 0.6;
        const s = typeof d.source === "string" ? d.source : (d.source as SimNode).id;
        const t = typeof d.target === "string" ? d.target : (d.target as SimNode).id;
        return matchIds.has(s) && matchIds.has(t) ? 0.6 : 0.08;
      });
  }, [searchQuery, activeCategory]);

  const connectedInfo = useMemo(() => {
    if (!selectedNode) return { nodes: [] as GraphNode[], links: [] as GraphLink[] };
    const connectedIds = new Set<string>();
    const connectedLinks: GraphLink[] = [];
    graphData.links.forEach((l) => {
      if (l.source === selectedNode.id || (l.source as unknown as SimNode).id === selectedNode.id) {
        const t = typeof l.target === "string" ? l.target : (l.target as unknown as SimNode).id;
        connectedIds.add(t);
        connectedLinks.push(l);
      }
      if (l.target === selectedNode.id || (l.target as unknown as SimNode).id === selectedNode.id) {
        const s = typeof l.source === "string" ? l.source : (l.source as unknown as SimNode).id;
        connectedIds.add(s);
        connectedLinks.push(l);
      }
    });
    const connectedNodes = graphData.nodes.filter((n) => connectedIds.has(n.id));
    return { nodes: connectedNodes, links: connectedLinks };
  }, [selectedNode]);

  return (
    <div className="bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Animated pet */}
        <div className="mb-6 sm:mb-8">
          <div className="knowledge-map-pet-stage" role="img" aria-label="角色正在来回奔跑">
            <span className="knowledge-map-pet" aria-hidden="true">
              <img className="knowledge-map-pet__gif" src="/graph/assets/pet-running.gif" alt="" draggable="false" />
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4 sm:mb-5">
          <input
            type="text"
            placeholder="搜索节点..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-72 px-3.5 py-2 text-sm bg-white border border-neutral-200 rounded-lg outline-none focus:ring-2 focus:ring-neutral-200 focus:border-neutral-300 transition-all placeholder:text-neutral-400"
          />
        </div>

        {/* Graph area */}
        <div className="relative">
          <div
            ref={containerRef}
            className="w-full bg-card border border-border rounded-xl overflow-hidden"
            style={{
              aspectRatio: "16 / 10",
              height: "auto",
              minHeight: "400px",
              maxHeight: "640px",
            }}
          />

          {/* Info panel */}
          {selectedNode && (
            <div className="absolute top-3 right-3 w-72 bg-white/90 backdrop-blur-md border border-neutral-200 rounded-xl p-3.5 shadow-sm max-h-[calc(100% - 24px)] overflow-y-auto text-sm">
              <div className="flex items-start justify-between mb-2.5">
                <div>
                  <h3
                    className="font-semibold text-foreground"
                    style={{ fontSize: "1.2rem", lineHeight: 1.25 }}
                  >
                    {selectedNode.name}
                  </h3>
                  <span
                    className="inline-block mt-1 px-2 py-0.5 rounded-full text-white/90"
                    style={{
                      fontSize: "0.68rem",
                      lineHeight: 1.4,
                      backgroundColor: categoryColor.get(selectedNode.category),
                    }}
                  >
                    {selectedNode.category}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-1 hover:bg-neutral-100 rounded-md transition-colors text-neutral-400 hover:text-neutral-700"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M11 3L3 11M3 3l8 8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
              <p
                className="text-neutral-500 leading-relaxed mb-3"
                style={{ fontSize: "0.82rem", lineHeight: 1.65 }}
              >
                {selectedNode.description}
              </p>
              <div>
                <h4
                  className="font-medium text-neutral-400 mb-1.5"
                  style={{ fontSize: "0.72rem", lineHeight: 1.4 }}
                >
                  关联节点 ({connectedInfo.nodes.length})
                </h4>
                <div className="flex flex-wrap gap-1">
                  {connectedInfo.nodes.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => setSelectedNode(n)}
                      className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors text-neutral-600"
                      style={{ fontSize: "0.75rem", lineHeight: 1.35 }}
                    >
                      {n.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 sm:mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() =>
                setActiveCategory((prev) => (prev === cat.name ? null : cat.name))
              }
              className={`flex items-center gap-1.5 text-xs transition-opacity ${
                activeCategory && activeCategory !== cat.name
                  ? "opacity-25"
                  : "opacity-100"
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-neutral-500">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
