(() => {
  const stage = document.querySelector(".skill-dna-stage");
  const mobileContainer = document.querySelector(".skill-dna-mobile");

  if (!stage || !mobileContainer) {
    return;
  }

  const svg = stage.querySelector(".dna-canvas");
  const tooltip = stage.querySelector(".skill-dna-tooltip");
  const originNode = stage.querySelector(".origin-node");
  const domainCards = Array.from(stage.querySelectorAll(".domain-node"));
  const mobileBreakpoint = window.matchMedia("(max-width: 767px)");
  const svgNamespace = "http://www.w3.org/2000/svg";

  const state = {
    activeDomain: null,
    mobileOpenDomain: "infra",
    lineAnimationFrame: null,
  };

  const domains = {
    infra: {
      label: "Infra & DevOps",
      accent: "#547A95",
      accentRgb: "84, 122, 149",
      summary: "Scale, pipelines, orchestration",
      description:
        "Infrastructure foundations and automation layers that keep product delivery reliable at scale.",
      tech: [
        {
          name: "Kubernetes",
          blurb: "Container orchestration at scale",
          icon: "src/png/k8s.png",
        },
        {
          name: "Docker",
          blurb: "Portable containers for consistent environments",
          icon: "src/png/docker.png",
        },
        {
          name: "Terraform",
          blurb: "Infrastructure as code for repeatable provisioning",
          icon: "src/png/terraform.png",
        },
        {
          name: "Airflow",
          blurb: "Workflow orchestration for scheduled data pipelines",
          icon: "src/png/af.png",
        },
        {
          name: "Ansible",
          blurb: "open-source automation tool that helps manage and configure multiple systems at once",
          icon: "src/png/ansible.png",
        },
        {
          name: "GitHub Actions",
          blurb: "CI/CD automation wired into shipping loops",
          icon: "src/png/github-white-icon.png",
        },
      ],
    },
    frontend: {
      label: "Frontend",
      accent: "#B0F3F1",
      accentRgb: "176, 243, 241",
      summary: "Interfaces that ship clearly",
      description:
        "Interfaces that turn system complexity into clear, legible experiences people can actually use.",
      tech: [
        {
          name: "React",
          blurb: "Component-driven UI systems with predictable state flow",
          icon: "src/png/react.png",
        },
        {
          name: "JavaScript",
          blurb: "Runtime behavior and interaction logic in the browser",
          icon: "src/png/js.png",
        },
        {
          name: "NextJS",
          blurb: "Layout, motion, and semantic structure for polished UI",
          icon: "src/png/nextjs.png",
        },
      ],
    },
    ai: {
      label: "Agentic AI",
      accent: "#A78BFA",
      accentRgb: "167, 139, 250",
      summary: "Reasoning systems, retrieval, agents",
      description:
        "Reasoning workflows, retrieval systems, and LLM orchestration stitched into real product behavior.",
      tech: [
        {
          name: "n8n",
          blurb: "Low-code Automation and Integration Platform",
          icon: "src/png/n8n.png",
        },
        {
          name: "LangChain",
          blurb: "Composable primitives for chaining tool-using LLM flows",
          icon: "src/png/langchain.png",
        },
        {
          name: "RAG Pipelines",
          blurb: "Grounded retrieval layers for context-aware generation",
          icon: "src/png/ailogo.png",
        },
        {
          name: "Vector DBs",
          blurb: "Semantic search and memory retrieval for agent state",
          fallback: "DB",
        },
      ],
    },
    backend: {
      label: "Backend",
      accent: "#C8A07A",
      accentRgb: "200, 160, 122",
      summary: "APIs, data, distributed services",
      description:
        "Service architecture, APIs, and persistence layers built with systems thinking and product discipline.",
      tech: [
        {
          name: "Python",
          blurb: "Backend services and application logic with strong ergonomics",
          icon: "src/png/py.png",
        },
        {
          name: "TypeScript",
          blurb: "Static contracts for maintainable frontend systems",
          icon: "src/png/ts.png",
        },
        {
          name: "Django",
          blurb: "Structured backend development with batteries included",
          icon: "src/png/django.png",
        },
        {
          name: "PostgreSQL",
          blurb: "Relational storage for operational and analytics-heavy flows",
          icon: "src/png/psql.png",
        },
        {
          name: "FastAPI",
          blurb: "High-throughput async endpoints with schema-first ergonomics",
          icon: "src/png/fastapi.png",
        },
        {
          name: "Kafka",
          blurb: "Streaming contracts that connect services asynchronously",
          icon: "src/png/kafka.png",
        },
      ],
    },
  };

  const domainCardMap = domainCards.reduce((map, card) => {
    map[card.dataset.domain] = card;
    return map;
  }, {});

  function buildIconMarkup(tech, accentRgb, variant) {
    const iconClass =
      variant === "mobile" ? "mobile-tech-tile-icon" : "skill-tech-tile";
    const fallbackClass =
      variant === "mobile" ? "mobile-tech-fallback" : "skill-tech-fallback";
    const fallbackText = tech.fallback || tech.name.slice(0, 2).toUpperCase();

    if (tech.icon) {
      return `
        <span class="${iconClass}">
          <img src="${tech.icon}" alt="" loading="lazy" />
        </span>
      `;
    }

    return `
      <span class="${iconClass}">
        <span class="${fallbackClass}" style="--accent-rgb:${accentRgb};">${fallbackText}</span>
      </span>
    `;
  }

  function buildDesktopCards() {
    domainCards.forEach((card) => {
      const domain = domains[card.dataset.domain];
      const grid = card.querySelector(".skill-tiles-grid");

      if (!domain || !grid) {
        return;
      }

      grid.innerHTML = domain.tech
        .map(
          (tech, index) => `
            <button
              type="button"
              class="skill-tech-item"
              style="--tile-index:${index}; --accent-rgb:${domain.accentRgb};"
              aria-label="${tech.name}. ${tech.blurb}"
            >
              ${buildIconMarkup(tech, domain.accentRgb, "desktop")}
              <span class="skill-tech-label">${tech.name}</span>
            </button>
          `
        )
        .join("");
    });
  }

  function buildMobileAccordion() {
    mobileContainer.innerHTML = Object.entries(domains)
      .map(([domainId, domain]) => {
        const isOpen = state.mobileOpenDomain === domainId;

        return `
          <section
            class="skill-dna-accordion-item${isOpen ? " is-open" : ""}"
            data-mobile-domain="${domainId}"
            style="--panel-accent:${domain.accent};"
          >
            <button
              type="button"
              class="skill-dna-accordion-trigger"
              aria-expanded="${isOpen ? "true" : "false"}"
              aria-controls="skill-dna-accordion-panel-${domainId}"
            >
              <span class="skill-dna-accordion-label">
                <span class="skill-dna-accordion-title">${domain.label}</span>
                <span class="skill-dna-accordion-copy">${domain.summary}</span>
              </span>
              <span class="skill-dna-accordion-icon">+</span>
            </button>
            <div
              class="skill-dna-accordion-panel"
              id="skill-dna-accordion-panel-${domainId}"
            >
              <div class="skill-dna-mobile-list">
                ${domain.tech
                  .map(
                    (tech, index) => `
                      <article class="skill-dna-mobile-item" style="--tile-index:${index};">
                        ${buildIconMarkup(tech, domain.accentRgb, "mobile")}
                        <span class="mobile-tech-label">${tech.name}</span>
                      </article>
                    `
                  )
                  .join("")}
              </div>
            </div>
          </section>
        `;
      })
      .join("");
  }

  function syncAccordionHeights() {
    const items = mobileContainer.querySelectorAll(".skill-dna-accordion-item");

    items.forEach((item) => {
      const panel = item.querySelector(".skill-dna-accordion-panel");

      if (!panel) {
        return;
      }

      panel.style.maxHeight = item.classList.contains("is-open")
        ? `${panel.scrollHeight}px`
        : "0px";
    });
  }

  function setMobileOpenDomain(domainId) {
    state.mobileOpenDomain = state.mobileOpenDomain === domainId ? null : domainId;

    const items = mobileContainer.querySelectorAll(".skill-dna-accordion-item");

    items.forEach((item) => {
      const isOpen = item.dataset.mobileDomain === state.mobileOpenDomain;
      item.classList.toggle("is-open", isOpen);

      const trigger = item.querySelector(".skill-dna-accordion-trigger");
      if (trigger) {
        trigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
      }
    });

    syncAccordionHeights();
  }

  function positionTooltip(target) {
    if (tooltip.hidden) {
      return;
    }

    const stageRect = stage.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const idealLeft =
      targetRect.left - stageRect.left + targetRect.width / 2 - tooltipRect.width / 2;
    const idealTop = targetRect.top - stageRect.top - tooltipRect.height - 14;
    const maxLeft = stageRect.width - tooltipRect.width - 18;
    const clampedLeft = Math.min(Math.max(idealLeft, 18), Math.max(maxLeft, 18));
    const top =
      idealTop < 18 ? targetRect.bottom - stageRect.top + 12 : idealTop;

    tooltip.style.left = `${clampedLeft}px`;
    tooltip.style.top = `${top}px`;
  }

  function showTooltip(target, tech) {
    if (mobileBreakpoint.matches) {
      return;
    }

    tooltip.hidden = false;
    tooltip.innerHTML = `<strong>${tech.name}</strong> - ${tech.blurb}`;
    positionTooltip(target);
  }

  function hideTooltip() {
    tooltip.hidden = true;
  }

  function bindDesktopTileTooltips() {
    domainCards.forEach((card) => {
      const domain = domains[card.dataset.domain];
      const tiles = Array.from(card.querySelectorAll(".skill-tech-item"));

      tiles.forEach((tile, index) => {
        const tech = domain.tech[index];

        tile.addEventListener("mouseenter", () => showTooltip(tile, tech));
        tile.addEventListener("focus", () => showTooltip(tile, tech));
        tile.addEventListener("mousemove", () => positionTooltip(tile));
        tile.addEventListener("mouseleave", hideTooltip);
        tile.addEventListener("blur", hideTooltip);
      });
    });
  }

  function setActiveDomain(domainId) {
    if (state.activeDomain === domainId) {
      return;
    }

    state.activeDomain = domainId;
    updateCardState();
    drawLines();
    animateLines(650);
  }

  function clearActiveDomain(domainId) {
    if (domainId && state.activeDomain !== domainId) {
      return;
    }

    state.activeDomain = null;
    updateCardState();
    hideTooltip();
    drawLines();
    animateLines(650);
  }

  function updateCardState() {
    domainCards.forEach((card) => {
      card.classList.toggle("is-active", card.dataset.domain === state.activeDomain);
    });
  }

  function getCenter(node, relativeToRect) {
    const rect = node.getBoundingClientRect();
    return {
      x: rect.left - relativeToRect.left + rect.width / 2,
      y: rect.top - relativeToRect.top + rect.height / 2,
    };
  }

  function createLine(start, end, domain, isActive) {
    const line = document.createElementNS(svgNamespace, "line");
    line.setAttribute("x1", start.x);
    line.setAttribute("y1", start.y);
    line.setAttribute("x2", end.x);
    line.setAttribute("y2", end.y);
    line.setAttribute("class", `dna-line${isActive ? " dna-line--active" : ""}`);
    line.style.stroke = isActive
      ? `rgba(${domain.accentRgb}, 0.95)`
      : "rgba(255, 255, 255, 0.2)";
    return line;
  }

  function drawLines() {
    if (mobileBreakpoint.matches) {
      svg.innerHTML = "";
      return;
    }

    const stageRect = stage.getBoundingClientRect();
    svg.setAttribute("viewBox", `0 0 ${stageRect.width} ${stageRect.height}`);
    svg.innerHTML = "";

    const originCenter = getCenter(originNode, stageRect);

    domainCards.forEach((card) => {
      const domain = domains[card.dataset.domain];
      const cardCenter = getCenter(card, stageRect);
      const isActive = state.activeDomain === card.dataset.domain;

      svg.appendChild(createLine(originCenter, cardCenter, domain, isActive));
    });
  }

  function stopLineAnimation() {
    if (state.lineAnimationFrame) {
      cancelAnimationFrame(state.lineAnimationFrame);
      state.lineAnimationFrame = null;
    }
  }

  function animateLines(duration) {
    stopLineAnimation();

    const start = performance.now();

    const frame = (timestamp) => {
      drawLines();

      if (timestamp - start < duration) {
        state.lineAnimationFrame = requestAnimationFrame(frame);
      } else {
        state.lineAnimationFrame = null;
      }
    };

    state.lineAnimationFrame = requestAnimationFrame(frame);
  }

  function bindCardEvents() {
    domainCards.forEach((card) => {
      const domainId = card.dataset.domain;

      card.addEventListener("mouseenter", () => {
        setActiveDomain(domainId);
      });

      card.addEventListener("mouseleave", () => {
        if (!card.contains(document.activeElement)) {
          clearActiveDomain(domainId);
        }
      });

      card.addEventListener("focusin", () => {
        setActiveDomain(domainId);
      });

      card.addEventListener("focusout", (event) => {
        if (event.relatedTarget && card.contains(event.relatedTarget)) {
          return;
        }

        if (!card.matches(":hover")) {
          clearActiveDomain(domainId);
        }
      });
    });

    stage.addEventListener("mouseleave", hideTooltip);
  }

  function bindAccordionEvents() {
    mobileContainer.addEventListener("click", (event) => {
      const trigger = event.target.closest(".skill-dna-accordion-trigger");

      if (!trigger) {
        return;
      }

      const item = trigger.closest(".skill-dna-accordion-item");

      if (!item) {
        return;
      }

      setMobileOpenDomain(item.dataset.mobileDomain);
    });
  }

  function handleResize() {
    drawLines();
    syncAccordionHeights();
    positionTooltip(document.activeElement);
  }

  function bindResize() {
    if (typeof mobileBreakpoint.addEventListener === "function") {
      mobileBreakpoint.addEventListener("change", handleResize);
    } else if (typeof mobileBreakpoint.addListener === "function") {
      mobileBreakpoint.addListener(handleResize);
    }

    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(() => {
        handleResize();
      });

      resizeObserver.observe(stage);
      resizeObserver.observe(mobileContainer);
    } else {
      window.addEventListener("resize", handleResize);
    }
  }

  buildDesktopCards();
  buildMobileAccordion();
  bindDesktopTileTooltips();
  bindCardEvents();
  bindAccordionEvents();
  bindResize();
  syncAccordionHeights();
  updateCardState();
  drawLines();
})();
