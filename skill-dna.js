(() => {
  const stage = document.querySelector(".skill-dna-stage");
  const mobileContainer = document.querySelector(".skill-dna-mobile");

  if (!stage || !mobileContainer) {
    return;
  }

  const baseSvg = stage.querySelector(".dna-canvas");
  const dialogSvg = stage.querySelector(".dna-dialog-canvas");
  const dialog = stage.querySelector(".skill-dna-dialog");
  const dialogTitle = dialog?.querySelector(".skill-dna-dialog-title");
  const dialogBody = dialog?.querySelector(".skill-dna-dialog-body");
  const originNode = stage.querySelector(".origin-node");
  const domainCards = Array.from(stage.querySelectorAll(".domain-node"));
  const mobileBreakpoint = window.matchMedia("(max-width: 767px)");
  const svgNamespace = "http://www.w3.org/2000/svg";

  if (!baseSvg || !dialogSvg || !dialog || !dialogTitle || !dialogBody || !originNode) {
    return;
  }

  const state = {
    activeDomain: null,
    hoveredTile: null,
    dialogHideTimeout: null,
    lineAnimationFrame: null,
    mobileOpenDomain: "infra",
  };

  const domains = {
    infra: {
      label: "Infra & DevOps",
      accent: "#547A95",
      accentRgb: "84, 122, 149",
      summary: "Scale, pipelines, orchestration",
      tech: [
        { name: "Kubernetes", blurb: "Container orchestration at scale", icon: "src/png/k8s.png" },
        { name: "Docker", blurb: "Portable containers for consistent environments", icon: "src/png/docker.png" },
        { name: "Terraform", blurb: "Infrastructure as code for repeatable provisioning", icon: "src/png/terraform.png" },
        { name: "Airflow", blurb: "Workflow orchestration for scheduled data pipelines", icon: "src/png/af.png" },
        { name: "Ansible", blurb: "Automation for provisioning and configuration workflows", icon: "src/png/ansible.png" },
        { name: "GitHub Actions", blurb: "CI/CD automation wired into shipping loops", icon: "src/png/github-white-icon.png" },
      ],
    },
    frontend: {
      label: "Frontend",
      accent: "#B0F3F1",
      accentRgb: "176, 243, 241",
      summary: "Interfaces that ship clearly",
      tech: [
        { name: "React", blurb: "Component-driven UI systems with predictable state flow", icon: "src/png/react.png" },
        { name: "JavaScript", blurb: "Runtime behavior and interaction logic in the browser", icon: "src/png/js.png" },
        { name: "NextJS", blurb: "App routing and rendering for production-grade React surfaces", icon: "src/png/nextjs.png" },
      ],
    },
    ai: {
      label: "Agentic AI",
      accent: "#A78BFA",
      accentRgb: "167, 139, 250",
      summary: "Reasoning systems, retrieval, agents",
      tech: [
        { name: "n8n", blurb: "Low-code automation and integration flows", icon: "src/png/n8n.png" },
        { name: "LangChain", blurb: "Composable primitives for chaining tool-using LLM flows", icon: "src/png/langchain.png" },
        { name: "RAG Pipelines", blurb: "Grounded retrieval layers for context-aware generation", icon: "src/png/ailogo.png" },
      ],
    },
    backend: {
      label: "Backend",
      accent: "#C8A07A",
      accentRgb: "200, 160, 122",
      summary: "APIs, data, distributed services",
      tech: [
        { name: "Python", blurb: "Backend services and application logic with strong ergonomics", icon: "src/png/py.png" },
        { name: "TypeScript", blurb: "Static contracts that keep shared backend/frontend surfaces clean", icon: "src/png/ts.png" },
        { name: "Django", blurb: "Structured backend development with batteries included", icon: "src/png/django.png" },
        { name: "PostgreSQL", blurb: "Relational storage for operational and analytics-heavy flows", icon: "src/png/psql.png" },
        { name: "FastAPI", blurb: "High-throughput async endpoints with schema-first ergonomics", icon: "src/png/fastapi.png" },
        { name: "Kafka", blurb: "Streaming contracts that connect services asynchronously", icon: "src/png/kafka.png" },
      ],
    },
  };

  function getCardSide(domainId) {
    return domainId === "frontend" || domainId === "backend" ? "right" : "left";
  }

  function getDialogSide(domainId) {
    return getCardSide(domainId) === "right" ? "left" : "right";
  }

  function buildIconMarkup(tech, accentRgb, variant) {
    const iconClass = variant === "mobile" ? "mobile-tech-tile-icon" : "skill-tech-tile";
    const fallbackClass = variant === "mobile" ? "mobile-tech-fallback" : "skill-tech-fallback";
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
          (tech) => `
            <button
              type="button"
              class="skill-tech-item"
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
            <div class="skill-dna-accordion-panel" id="skill-dna-accordion-panel-${domainId}">
              <div class="skill-dna-mobile-list">
                ${domain.tech
                  .map(
                    (tech) => `
                      <article class="skill-dna-mobile-item">
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
    mobileContainer.querySelectorAll(".skill-dna-accordion-item").forEach((item) => {
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

    mobileContainer.querySelectorAll(".skill-dna-accordion-item").forEach((item) => {
      const isOpen = item.dataset.mobileDomain === state.mobileOpenDomain;
      item.classList.toggle("is-open", isOpen);

      const trigger = item.querySelector(".skill-dna-accordion-trigger");
      if (trigger) {
        trigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
      }
    });

    syncAccordionHeights();
  }

  function updateCardState() {
    domainCards.forEach((card) => {
      card.classList.toggle("is-active", card.dataset.domain === state.activeDomain);
    });
  }

  function getCenter(node, relativeRect) {
    const rect = node.getBoundingClientRect();
    return {
      x: rect.left - relativeRect.left + rect.width / 2,
      y: rect.top - relativeRect.top + rect.height / 2,
    };
  }

  function createLine(start, end, stroke, className) {
    const line = document.createElementNS(svgNamespace, "line");
    line.setAttribute("x1", start.x);
    line.setAttribute("y1", start.y);
    line.setAttribute("x2", end.x);
    line.setAttribute("y2", end.y);
    line.setAttribute("class", className);
    line.style.stroke = stroke;
    return line;
  }

  function drawBaseLines() {
    if (mobileBreakpoint.matches) {
      baseSvg.innerHTML = "";
      dialogSvg.innerHTML = "";
      return;
    }

    const stageRect = stage.getBoundingClientRect();
    baseSvg.setAttribute("viewBox", `0 0 ${stageRect.width} ${stageRect.height}`);
    baseSvg.innerHTML = "";

    const originCenter = getCenter(originNode, stageRect);

    domainCards.forEach((card) => {
      const domain = domains[card.dataset.domain];
      const cardCenter = getCenter(card, stageRect);
      const isActive = state.activeDomain === card.dataset.domain;
      const stroke = isActive
        ? `rgba(${domain.accentRgb}, 0.95)`
        : "rgba(255, 255, 255, 0.2)";

      baseSvg.appendChild(
        createLine(
          originCenter,
          cardCenter,
          stroke,
          `dna-line${isActive ? " dna-line--active" : ""}`
        )
      );
    });
  }

  function clearDialogHideTimeout() {
    if (state.dialogHideTimeout) {
      clearTimeout(state.dialogHideTimeout);
      state.dialogHideTimeout = null;
    }
  }

  function positionDialog() {
    if (!state.hoveredTile || mobileBreakpoint.matches) {
      return;
    }

    const stageRect = stage.getBoundingClientRect();
    const originRect = originNode.getBoundingClientRect();
    const originCenter = getCenter(originNode, stageRect);
    const dialogSide = getDialogSide(state.hoveredTile.domainId);
    const dialogWidth = dialog.offsetWidth;
    const dialogHeight = dialog.offsetHeight;
    const offset = originRect.width / 2 + 30;

    dialog.classList.remove("skill-dna-dialog--left", "skill-dna-dialog--right");
    dialog.classList.add(`skill-dna-dialog--${dialogSide}`);

    let left =
      dialogSide === "right"
        ? originCenter.x + offset
        : originCenter.x - offset - dialogWidth;
    let top = originCenter.y - dialogHeight / 2 - 6;

    left = Math.min(Math.max(left, 18), stageRect.width - dialogWidth - 18);
    top = Math.min(Math.max(top, 18), stageRect.height - dialogHeight - 18);

    dialog.style.left = `${left}px`;
    dialog.style.top = `${top}px`;
  }

  function drawDialogLine() {
    dialogSvg.innerHTML = "";

    if (!state.hoveredTile || mobileBreakpoint.matches) {
      return;
    }

    const stageRect = stage.getBoundingClientRect();
    dialogSvg.setAttribute("viewBox", `0 0 ${stageRect.width} ${stageRect.height}`);

    const originRect = originNode.getBoundingClientRect();
    const dialogRect = dialog.getBoundingClientRect();
    const originCenter = getCenter(originNode, stageRect);
    const dialogSide = getDialogSide(state.hoveredTile.domainId);
    const domain = domains[state.hoveredTile.domainId];
    const radius = originRect.width / 2 - 2;

    const start = {
      x: dialogSide === "right" ? originCenter.x + radius * 0.72 : originCenter.x - radius * 0.72,
      y: originCenter.y - 6,
    };

    const end = {
      x:
        dialogSide === "right"
          ? dialogRect.left - stageRect.left
          : dialogRect.right - stageRect.left,
      y: dialogRect.top - stageRect.top + dialogRect.height * 0.48,
    };

    const line = createLine(
      start,
      end,
      `rgba(${domain.accentRgb}, 0.95)`,
      "dna-line dna-line--dialog"
    );
    const length = Math.hypot(end.x - start.x, end.y - start.y);
    line.style.strokeDasharray = `${length}`;
    line.style.strokeDashoffset = `${length}`;
    line.style.setProperty("--line-length", `${length}`);
    dialogSvg.appendChild(line);
  }

  function hideDialog(immediate = false) {
    clearDialogHideTimeout();
    state.hoveredTile = null;
    dialog.classList.remove("is-visible");
    dialog.setAttribute("aria-hidden", "true");

    if (immediate) {
      dialogSvg.innerHTML = "";
      return;
    }

    state.dialogHideTimeout = window.setTimeout(() => {
      dialogSvg.innerHTML = "";
      state.dialogHideTimeout = null;
    }, 120);
  }

  function scheduleHideDialog() {
    clearDialogHideTimeout();
    state.dialogHideTimeout = window.setTimeout(() => {
      hideDialog(false);
    }, 120);
  }

  function showDialog(domainId, tech) {
    clearDialogHideTimeout();
    state.hoveredTile = { domainId, tech };
    dialogTitle.textContent = tech.name;
    dialogBody.textContent = tech.blurb;
    dialog.setAttribute("aria-hidden", "false");
    positionDialog();
    drawDialogLine();

    requestAnimationFrame(() => {
      dialog.classList.add("is-visible");
    });
  }

  function stopLineAnimation() {
    if (state.lineAnimationFrame) {
      cancelAnimationFrame(state.lineAnimationFrame);
      state.lineAnimationFrame = null;
    }
  }

  function animateBaseLines(duration) {
    stopLineAnimation();

    const start = performance.now();

    const frame = (timestamp) => {
      drawBaseLines();

      if (timestamp - start < duration) {
        state.lineAnimationFrame = requestAnimationFrame(frame);
      } else {
        state.lineAnimationFrame = null;
      }
    };

    state.lineAnimationFrame = requestAnimationFrame(frame);
  }

  function setActiveDomain(domainId) {
    state.activeDomain = domainId;
    updateCardState();
    drawBaseLines();
    animateBaseLines(650);
  }

  function clearActiveDomain(domainId) {
    if (domainId && state.activeDomain !== domainId) {
      return;
    }

    state.activeDomain = null;
    updateCardState();
    hideDialog(true);
    drawBaseLines();
    animateBaseLines(650);
  }

  function bindDesktopTileDialog() {
    domainCards.forEach((card) => {
      const domainId = card.dataset.domain;
      const domain = domains[domainId];
      const tiles = Array.from(card.querySelectorAll(".skill-tech-item"));

      tiles.forEach((tile, index) => {
        const tech = domain.tech[index];

        tile.addEventListener("mouseenter", () => showDialog(domainId, tech));
        tile.addEventListener("focus", () => showDialog(domainId, tech));
        tile.addEventListener("mouseleave", scheduleHideDialog);
        tile.addEventListener("blur", scheduleHideDialog);
      });
    });
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
    drawBaseLines();
    positionDialog();
    drawDialogLine();
    syncAccordionHeights();
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
  bindDesktopTileDialog();
  bindCardEvents();
  bindAccordionEvents();
  bindResize();
  syncAccordionHeights();
  updateCardState();
  drawBaseLines();
})();
