/* =========================================================
   EAGLER SERVERS
   Main JavaScript — V1
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
       ===================================================== */

    const featuredServers =
        document.getElementById("featuredServers");

    const featuredEmpty =
        document.getElementById("featuredEmpty");

    const heroSearch =
        document.getElementById("heroSearch");

    const serverSearch =
        document.getElementById("serverSearch");

    const mobileMenuButton =
        document.querySelector(".mobile-menu-button");

    const navLinks =
        document.querySelector(".nav-links");


    /* =====================================================
       SERVER DATA
       ===================================================== */

    let servers = [];


    async function loadServers() {

        try {

            const response =
                await fetch("servers.json", {
                    cache: "no-store"
                });

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}`
                );
            }

            const data = await response.json();

            /*
             * Supports either:
             *
             * [
             *   {...},
             *   {...}
             * ]
             *
             * OR:
             *
             * {
             *   "servers": [...]
             * }
             */

            servers = Array.isArray(data)
                ? data
                : Array.isArray(data.servers)
                    ? data.servers
                    : [];


            renderFeaturedServers();

            updateStats();

        } catch (error) {

            console.error(
                "Could not load servers.json:",
                error
            );

            servers = [];

            showEmptyState();

            updateStats();

        }

    }


    /* =====================================================
       FEATURED SERVERS
       ===================================================== */

    function renderFeaturedServers() {

        if (!featuredServers) {
            return;
        }

        featuredServers.innerHTML = "";


        /*
         * Only show servers that are marked as featured.
         *
         * If there are no featured servers,
         * show the clean empty state.
         */

        const featured =
            servers
                .filter(server => server.featured === true)
                .slice(0, 6);


        if (featured.length === 0) {

            showEmptyState();

            return;

        }


        if (featuredEmpty) {
            featuredEmpty.hidden = true;
        }


        featured.forEach(server => {

            const card =
                createServerCard(server);

            featuredServers.appendChild(card);

        });

    }


    /* =====================================================
       SERVER CARD
       ===================================================== */

    function createServerCard(server) {

        const card =
            document.createElement("article");

        card.className = "server-card";


        const name =
            escapeHTML(
                server.name || "Unnamed Server"
            );

        const description =
            escapeHTML(
                server.description ||
                "An Eaglercraft server."
            );

        const logo =
            escapeHTML(
                server.logo ||
                getInitial(server.name)
            );

        const players =
            Number.isFinite(Number(server.players))
                ? Number(server.players)
                : 0;


        const online =
            server.online !== false;


        const tags =
            Array.isArray(server.tags)
                ? server.tags.slice(0, 4)
                : [];


        const tagsHTML =
            tags
                .map(tag => `
                    <span>
                        ${escapeHTML(tag)}
                    </span>
                `)
                .join("");


        card.innerHTML = `

            <div class="server-card-top">

                <div class="server-logo">
                    ${logo}
                </div>

                <div
                    class="server-status ${online ? "online" : ""}"
                >

                    <span></span>

                    ${online ? "Online" : "Offline"}

                </div>

            </div>


            <h3>
                ${name}
            </h3>


            <p class="server-description">
                ${description}
            </p>


            ${
                tagsHTML
                    ? `
                        <div class="server-tags">
                            ${tagsHTML}
                        </div>
                    `
                    : ""
            }


            <div class="server-card-footer">

                <div class="players">

                    <span class="players-dot"></span>

                    <strong>
                        ${formatNumber(players)}
                    </strong>

                    players

                </div>


                <a
                    href="server.html?id=${encodeURIComponent(
                        server.id || server.slug || name
                    )}"
                >
                    View Server →
                </a>

            </div>

        `;


        return card;

    }


    /* =====================================================
       EMPTY STATE
       ===================================================== */

    function showEmptyState() {

        if (featuredServers) {
            featuredServers.innerHTML = "";
        }

        if (featuredEmpty) {
            featuredEmpty.hidden = false;
        }

    }


    /* =====================================================
       STATS
       ===================================================== */

    function updateStats() {

        const serverCount =
            servers.length;


        const playerCount =
            servers.reduce(
                (total, server) => {

                    const players =
                        Number(server.players);

                    return total +
                        (Number.isFinite(players)
                            ? players
                            : 0);

                },
                0
            );


        const voteCount =
            servers.reduce(
                (total, server) => {

                    const votes =
                        Number(server.votes);

                    return total +
                        (Number.isFinite(votes)
                            ? votes
                            : 0);

                },
                0
            );


        animateStat(
            '[data-stat="servers"]',
            serverCount
        );

        animateStat(
            '[data-stat="players"]',
            playerCount
        );

        animateStat(
            '[data-stat="votes"]',
            voteCount
        );

    }


    /* =====================================================
       STAT ANIMATION
       ===================================================== */

    function animateStat(selector, target) {

        const element =
            document.querySelector(selector);

        if (!element) {
            return;
        }


        const duration = 900;

        const startTime =
            performance.now();


        function update(currentTime) {

            const progress =
                Math.min(
                    (currentTime - startTime) / duration,
                    1
                );


            const eased =
                1 - Math.pow(1 - progress, 3);


            const current =
                Math.floor(target * eased);


            element.textContent =
                formatNumber(current);


            if (progress < 1) {

                requestAnimationFrame(update);

            } else {

                element.textContent =
                    formatNumber(target);

            }

        }


        requestAnimationFrame(update);

    }


    /* =====================================================
       HERO SEARCH
       ===================================================== */

    if (heroSearch) {

        heroSearch.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const query =
                    serverSearch
                        ? serverSearch.value.trim()
                        : "";


                if (!query) {

                    window.location.href =
                        "servers.html";

                    return;

                }


                window.location.href =
                    `servers.html?search=${encodeURIComponent(
                        query
                    )}`;

            }
        );

    }


    /* =====================================================
       MOBILE MENU
       ===================================================== */

    if (
        mobileMenuButton &&
        navLinks
    ) {

        mobileMenuButton.addEventListener(
            "click",
            () => {

                const isOpen =
                    navLinks.classList.toggle(
                        "mobile-open"
                    );


                mobileMenuButton
                    .setAttribute(
                        "aria-expanded",
                        String(isOpen)
                    );

            }
        );


        navLinks
            .querySelectorAll("a")
            .forEach(link => {

                link.addEventListener(
                    "click",
                    () => {

                        navLinks.classList.remove(
                            "mobile-open"
                        );

                        mobileMenuButton
                            .setAttribute(
                                "aria-expanded",
                                "false"
                            );

                    }
                );

            });

    }


    /* =====================================================
       SCROLL REVEAL
       ===================================================== */

    const revealElements =
        document.querySelectorAll(
            ".section-reveal"
        );


    if ("IntersectionObserver" in window) {

        const observer =
            new IntersectionObserver(
                entries => {

                    entries.forEach(entry => {

                        if (entry.isIntersecting) {

                            entry.target.classList.add(
                                "visible"
                            );

                            observer.unobserve(
                                entry.target
                            );

                        }

                    });

                },
                {
                    threshold: 0.12
                }
            );


        revealElements.forEach(element => {

            observer.observe(element);

        });

    } else {

        revealElements.forEach(element => {

            element.classList.add(
                "visible"
            );

        });

    }


    /* =====================================================
       HELPERS
       ===================================================== */

    function formatNumber(number) {

        return new Intl.NumberFormat(
            "en-US",
            {
                notation: "compact",
                maximumFractionDigits: 1
            }
        ).format(number);

    }


    function getInitial(name) {

        if (!name) {
            return "E";
        }

        return name
            .trim()
            .charAt(0)
            .toUpperCase();

    }


    /*
     * Prevent server data from injecting HTML.
     */

    function escapeHTML(value) {

        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

    }


    /* =====================================================
       START
       ===================================================== */

    loadServers();

});
