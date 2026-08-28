/* =========================================================
   EAGLER SERVERS
   Individual Server Page — V1
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const serverContent =
        document.getElementById("serverContent");

    const serverError =
        document.getElementById("serverError");


    /* =====================================================
       GET SERVER ID
       ===================================================== */

    const params =
        new URLSearchParams(
            window.location.search
        );

    const requestedID =
        params.get("id");


    /* =====================================================
       LOAD SERVER DATABASE
       ===================================================== */

    async function loadServer() {

        if (!requestedID) {

            showError();

            return;

        }


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


            const servers =
                Array.isArray(data)
                    ? data
                    : Array.isArray(data.servers)
                        ? data.servers
                        : [];


            const server =
                servers.find(item => {

                    return (
                        String(item.id || "") ===
                            requestedID ||

                        String(item.slug || "") ===
                            requestedID ||

                        String(item.name || "") ===
                            requestedID
                    );

                });


            if (!server) {

                showError();

                return;

            }


            renderServer(server);

        } catch (error) {

            console.error(
                "Failed to load server:",
                error
            );

            showError();

        }

    }


    /* =====================================================
       RENDER SERVER
       ===================================================== */

    function renderServer(server) {

        if (!serverContent) {
            return;
        }


        if (serverError) {
            serverError.hidden = true;
        }


        const name =
            escapeHTML(
                server.name ||
                "Unnamed Server"
            );


        const description =
            escapeHTML(
                server.description ||
                "No description available."
            );


        const logo =
            escapeHTML(
                server.logo ||
                getInitial(server.name)
            );


        const ip =
            String(server.ip || "");


        const port =
            server.port
                ? String(server.port)
                : "";


        const address =
            ip
                ? (
                    port &&
                    port !== "25565"
                        ? `${ip}:${port}`
                        : ip
                )
                : "IP unavailable";


        const online =
            server.online === true;


        const players =
            Number(server.players || 0);


        const maxPlayers =
            Number(server.maxPlayers || 0);


        const votes =
            Number(server.votes || 0);


        const version =
            escapeHTML(
                server.version ||
                "Unknown"
            );


        const modes =
            Array.isArray(server.modes)
                ? server.modes
                : server.mode
                    ? [server.mode]
                    : [];


        const tags =
            Array.isArray(server.tags)
                ? server.tags
                : [];


        /*
         * Combine modes + tags without
         * showing duplicates.
         */

        const allTags =
            [
                ...modes,
                ...tags
            ].filter(
                (value, index, array) =>
                    array.findIndex(
                        item =>
                            String(item).toLowerCase() ===
                            String(value).toLowerCase()
                    ) === index
            );


        const tagsHTML =
            allTags
                .slice(0, 8)
                .map(tag => `
                    <span>
                        ${escapeHTML(tag)}
                    </span>
                `)
                .join("");


        const website =
            server.website || "";


        const discord =
            server.discord || "";


        const websiteButton =
            website
                ? `
                    <a
                        href="${escapeAttribute(
                            website
                        )}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="button button-secondary"
                    >
                        Website ↗
                    </a>
                `
                : "";


        const discordButton =
            discord
                ? `
                    <a
                        href="${escapeAttribute(
                            discord
                        )}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="button button-secondary"
                    >
                        Discord ↗
                    </a>
                `
                : "";


        document.title =
            `${name} — EAGLER Servers`;


        serverContent.innerHTML = `

            <section class="server-hero">

                <div class="server-hero-top">

                    <div class="server-identity">

                        <div class="server-page-logo">
                            ${logo}
                        </div>


                        <div>

                            <h1>
                                ${name}
                            </h1>

                            <p class="server-page-description">
                                ${description}
                            </p>

                        </div>

                    </div>


                    <div
                        class="server-page-status ${
                            online
                                ? ""
                                : "offline"
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


                <!-- SERVER ADDRESS -->

                <div class="server-ip-box">

                    <code class="server-ip">
                        ${escapeHTML(address)}
                    </code>


                    <button
                        type="button"
                        class="copy-ip"
                        id="copyIP"
                        ${
                            ip
                                ? ""
                                : "disabled"
                        }
                    >
                        Copy IP
                    </button>

                </div>


                ${
                    allTags.length
                        ? `
                            <div class="page-tags">
                                ${tagsHTML}
                            </div>
                        `
                        : ""
                }


                ${
                    websiteButton ||
                    discordButton
                        ? `
                            <div
                                style="
                                    display:flex;
                                    flex-wrap:wrap;
                                    gap:8px;
                                    margin-top:18px;
                                "
                            >
                                ${websiteButton}
                                ${discordButton}
                            </div>
                        `
                        : ""
                }

            </section>


            <!-- DETAILS -->

            <section class="server-details">

                <article class="server-panel">

                    <h2>
                        About this server
                    </h2>

                    <p class="server-about">
                        ${description}
                    </p>

                </article>


                <article class="server-panel">

                    <h2>
                        Server information
                    </h2>


                    <div class="detail-list">


                        <div class="detail-row">

                            <span>
                                Status
                            </span>

                            <strong>
                                ${
                                    online
                                        ? "Online"
                                        : "Offline"
                                }
                            </strong>

                        </div>


                        <div class="detail-row">

                            <span>
                                Players
                            </span>

                            <strong>
                                ${
                                    formatNumber(
                                        players
                                    )
                                }${
                                    maxPlayers > 0
                                        ? ` / ${formatNumber(
                                            maxPlayers
                                        )}`
                                        : ""
                                }
                            </strong>

                        </div>


                        <div class="detail-row">

                            <span>
                                Version
                            </span>

                            <strong>
                                ${version}
                            </strong>

                        </div>


                        <div class="detail-row">

                            <span>
                                Votes
                            </span>

                            <strong>
                                ${formatNumber(
                                    votes
                                )}
                            </strong>

                        </div>


                    </div>

                </article>

            </section>


            <!-- VOTE -->

            <section class="vote-panel">

                <div>

                    <h2>
                        Like this server?
                    </h2>

                    <p>
                        Support the server by voting for it.
                    </p>

                </div>


                <button
                    type="button"
                    class="vote-button"
                    id="voteButton"
                >
                    Vote for Server
                </button>

            </section>

        `;


        setupCopyButton(
            address,
            ip
        );


        setupVoteButton(
            server
        );

    }


    /* =====================================================
       COPY IP
       ===================================================== */

    function setupCopyButton(
        address,
        ip
    ) {

        const button =
            document.getElementById(
                "copyIP"
            );


        if (
            !button ||
            !ip
        ) {
            return;
        }


        button.addEventListener(
            "click",
            async () => {

                try {

                    await navigator.clipboard.writeText(
                        address
                    );


                    button.textContent =
                        "Copied ✓";


                } catch {

                    /*
                     * Fallback for browsers
                     * without Clipboard API.
                     */

                    const textarea =
                        document.createElement(
                            "textarea"
                        );


                    textarea.value =
                        address;


                    textarea.style.position =
                        "fixed";

                    textarea.style.opacity =
                        "0";


                    document.body.appendChild(
                        textarea
                    );


                    textarea.focus();

                    textarea.select();


                    try {

                        document.execCommand(
                            "copy"
                        );

                        button.textContent =
                            "Copied ✓";

                    } catch {

                        button.textContent =
                            "Copy failed";

                    }


                    textarea.remove();

                }


                setTimeout(() => {

                    button.textContent =
                        "Copy IP";

                }, 1600);

            }
        );

    }


    /* =====================================================
       VOTE
       ===================================================== */

    function setupVoteButton(
        server
    ) {

        const button =
            document.getElementById(
                "voteButton"
            );


        if (!button) {
            return;
        }


        /*
         * We do NOT fake votes.
         *
         * Once we have a backend, this button
         * can submit a real vote.
         */

        button.addEventListener(
            "click",
            () => {

                if (server.voteURL) {

                    window.open(
                        server.voteURL,
                        "_blank",
                        "noopener,noreferrer"
                    );

                    return;

                }


                button.textContent =
                    "Voting coming soon";

                button.disabled =
                    true;

            }
        );

    }


    /* =====================================================
       ERROR
       ===================================================== */

    function showError() {

        if (serverContent) {

            serverContent.innerHTML =
                "";

        }


        if (serverError) {

            serverError.hidden =
                false;

        }

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


        return String(name)
            .trim()
            .charAt(0)
            .toUpperCase();

    }


    function escapeHTML(value) {

        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

    }


    function escapeAttribute(value) {

        return escapeHTML(value);

    }


    /* =====================================================
       START
       ===================================================== */

    loadServer();

});
