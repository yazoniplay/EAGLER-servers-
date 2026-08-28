/* =========================================================
   EAGLER SERVERS
   Server Directory — V1
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
       ===================================================== */

    const serverList =
        document.getElementById("serverList");

    const directoryEmpty =
        document.getElementById("directoryEmpty");

    const directorySearch =
        document.getElementById("directorySearch");

    const modeFilter =
        document.getElementById("modeFilter");

    const sortFilter =
        document.getElementById("sortFilter");

    const serverCount =
        document.getElementById("serverCount");

    const pagination =
        document.getElementById("pagination");

    const mobileMenuButton =
        document.querySelector(".mobile-menu-button");

    const navLinks =
        document.querySelector(".nav-links");


    /* =====================================================
       SETTINGS
       ===================================================== */

    const SERVERS_PER_PAGE = 12;


    let servers = [];

    let filteredServers = [];

    let currentPage = 1;


    /* =====================================================
       LOAD DATABASE
       ===================================================== */

    async function loadServers() {

        try {

            const response =
                await fetch(
                    "servers.json",
                    {
                        cache: "no-store"
                    }
                );


            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}`
                );
            }


            const data =
                await response.json();


            servers =
                Array.isArray(data)
                    ? data
                    : Array.isArray(data.servers)
                        ? data.servers
                        : [];


            readURLFilters();

            applyFilters();

        } catch (error) {

            console.error(
                "Failed to load servers.json:",
                error
            );


            servers = [];

            filteredServers = [];

            render();

        }

    }


    /* =====================================================
       URL PARAMETERS
       ===================================================== */

    function readURLFilters() {

        const params =
            new URLSearchParams(
                window.location.search
            );


        const search =
            params.get("search");


        const mode =
            params.get("mode");


        if (
            search &&
            directorySearch
        ) {

            directorySearch.value =
                search;

        }


        if (
            mode &&
            modeFilter
        ) {

            const validModes =
                Array.from(
                    modeFilter.options
                ).map(
                    option => option.value
                );


            if (
                validModes.includes(
                    mode.toLowerCase()
                )
            ) {

                modeFilter.value =
                    mode.toLowerCase();

            }

        }

    }


    /* =====================================================
       FILTERING
       ===================================================== */

    function applyFilters() {

        const search =
            directorySearch
                ? directorySearch.value
                    .trim()
                    .toLowerCase()
                : "";


        const mode =
            modeFilter
                ? modeFilter.value
                : "all";


        filteredServers =
            servers.filter(server => {

                /*
                 * Search through:
                 * - server name
                 * - description
                 * - IP
                 * - tags
                 * - gamemode
                 */

                const searchableText = [

                    server.name,

                    server.description,

                    server.ip,

                    server.mode,

                    ...(Array.isArray(server.tags)
                        ? server.tags
                        : [])

                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                const matchesSearch =
                    !search ||
                    searchableText.includes(
                        search
                    );


                const serverModes =
                    Array.isArray(server.modes)
                        ? server.modes.map(
                            value =>
                                String(value)
                                    .toLowerCase()
                        )
                        : server.mode
                            ? [
                                String(
                                    server.mode
                                ).toLowerCase()
                            ]
                            : [];


                const matchesMode =
                    mode === "all" ||
                    serverModes.includes(
                        mode.toLowerCase()
                    );


                return (
                    matchesSearch &&
                    matchesMode
                );

            });


        sortServers();


        currentPage = 1;


        render();

    }


    /* =====================================================
       SORTING
       ===================================================== */

    function sortServers() {

        const sort =
            sortFilter
                ? sortFilter.value
                : "featured";


        filteredServers.sort(
            (a, b) => {

                switch (sort) {

                    case "players":

                        return (
                            Number(b.players || 0) -
                            Number(a.players || 0)
                        );


                    case "votes":

                        return (
                            Number(b.votes || 0) -
                            Number(a.votes || 0)
                        );


                    case "name":

                        return String(
                            a.name || ""
                        ).localeCompare(
                            String(
                                b.name || ""
                            )
                        );


                    case "featured":

                    default:

                        return (
                            Number(
                                b.featured === true
                            ) -
                            Number(
                                a.featured === true
                            )
                        );

                }

            }
        );

    }


    /* =====================================================
       RENDER
       ===================================================== */

    function render() {

        if (!serverList) {
            return;
        }


        serverList.innerHTML = "";


        const total =
            filteredServers.length;


        if (serverCount) {

            serverCount.textContent =
                `${total} ${
                    total === 1
                        ? "server"
                        : "servers"
                }`;

        }


        if (total === 0) {

            if (directoryEmpty) {
                directoryEmpty.hidden =
                    false;
            }


            if (pagination) {
                pagination.innerHTML =
                    "";
            }


            return;

        }


        if (directoryEmpty) {
            directoryEmpty.hidden =
                true;
        }


        const totalPages =
            Math.ceil(
                total /
                SERVERS_PER_PAGE
            );


        if (
            currentPage >
            totalPages
        ) {

            currentPage =
                totalPages;

        }


        const start =
            (currentPage - 1) *
            SERVERS_PER_PAGE;


        const pageServers =
            filteredServers.slice(
                start,
                start +
                SERVERS_PER_PAGE
            );


        pageServers.forEach(
            server => {

                serverList.appendChild(
                    createServerCard(server)
                );

            }
        );


        renderPagination(
            totalPages
        );

    }


    /* =====================================================
       SERVER CARD
       ===================================================== */

    function createServerCard(server) {

        const card =
            document.createElement("article");


        card.className =
            "server-card";


        const name =
            escapeHTML(
                server.name ||
                "Unnamed Server"
            );


        const description =
            escapeHTML(
                server.description ||
                "An Eaglercraft server."
            );


        const logo =
            escapeHTML(
                server.logo ||
                getInitial(
                    server.name
                )
            );


        const players =
            Number(
                server.players || 0
            );


        const online =
            server.online === true;


        const tags =
            Array.isArray(server.tags)
                ? server.tags.slice(0, 4)
                : [];


        const tagsHTML =
            tags.map(tag => {

                return `
                    <span>
                        ${escapeHTML(tag)}
                    </span>
                `;

            }).join("");


        const serverID =
            server.id ||
            server.slug ||
            server.name ||
            "";


        card.innerHTML = `

            <div class="server-card-top">

                <div class="server-logo">

                    ${logo}

                </div>


                <div
                    class="server-status ${
                        online
                            ? "online"
                            : ""
                    }"
                >

                    <span></span>

                    ${
                        online
                            ? "Online"
                            : "Offline"
                    }

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

                    <span
                        class="players-dot"
                    ></span>

                    <strong>
                        ${formatNumber(
                            players
                        )}
                    </strong>

                    players

                </div>


                <a
                    href="server.html?id=${encodeURIComponent(
                        serverID
                    )}"
                >
                    View Server →
                </a>

            </div>

        `;


        return card;

    }


    /* =====================================================
       PAGINATION
       ===================================================== */

    function renderPagination(
        totalPages
    ) {

        if (!pagination) {
            return;
        }


        pagination.innerHTML = "";


        if (totalPages <= 1) {
            return;
        }


        /*
         * Previous button
         */

        if (currentPage > 1) {

            pagination.appendChild(
                createPageButton(
                    "←",
                    currentPage - 1,
                    "Previous page"
                )
            );

        }


        /*
         * Page numbers
         */

        for (
            let page = 1;
            page <= totalPages;
            page++
        ) {

            /*
             * Avoid creating a massive
             * pagination bar.
             */

            if (
                totalPages > 7 &&
                Math.abs(
                    page - currentPage
                ) > 2 &&
                page !== 1 &&
                page !== totalPages
            ) {

                if (
                    page === 2 ||
                    page === totalPages - 1
                ) {

                    const dots =
                        document.createElement(
                            "span"
                        );

                    dots.textContent =
                        "…";

                    dots.style.padding =
                        "0 5px";

                    dots.style.color =
                        "var(--dim)";

                    pagination.appendChild(
                        dots
                    );

                }

                continue;

            }


            pagination.appendChild(
                createPageButton(
                    String(page),
                    page,
                    `Page ${page}`
                )
            );

        }


        /*
         * Next button
         */

        if (
            currentPage <
            totalPages
        ) {

            pagination.appendChild(
                createPageButton(
                    "→",
                    currentPage + 1,
                    "Next page"
                )
            );

        }

    }


    function createPageButton(
        label,
        page,
        ariaLabel
    ) {

        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.className =
            "page-button";


        if (
            page === currentPage
        ) {

            button.classList.add(
                "active"
            );

        }


        button.textContent =
            label;


        button.setAttribute(
            "aria-label",
            ariaLabel
        );


        button.addEventListener(
            "click",
            () => {

                currentPage =
                    page;

                render();


                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );


        return button;

    }


    /* =====================================================
       SEARCH EVENTS
       ===================================================== */

    if (directorySearch) {

        directorySearch.addEventListener(
            "input",
            debounce(
                applyFilters,
                150
            )
        );

    }


    if (modeFilter) {

        modeFilter.addEventListener(
            "change",
            applyFilters
        );

    }


    if (sortFilter) {

        sortFilter.addEventListener(
            "change",
            applyFilters
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


                mobileMenuButton.setAttribute(
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


                        mobileMenuButton.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                    }
                );

            });

    }


    /* =====================================================
       HELPERS
       ===================================================== */

    function debounce(
        callback,
        delay
    ) {

        let timeout;


        return (...args) => {

            clearTimeout(timeout);


            timeout =
                setTimeout(
                    () => callback(...args),
                    delay
                );

        };

    }


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


        return String(name)
            .trim()
            .charAt(0)
            .toUpperCase();

    }


    function escapeHTML(value) {

        return String(value)
            .replaceAll(
                "&",
                "&amp;"
            )
            .replaceAll(
                "<",
                "&lt;"
            )
            .replaceAll(
                ">",
                "&gt;"
            )
            .replaceAll(
                '"',
                "&quot;"
            )
            .replaceAll(
                "'",
                "&#039;"
            );

    }


    /* =====================================================
       START
       ===================================================== */

    loadServers();

});
