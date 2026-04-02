/* ================================================================================
PROJECT: LOLA'S PARTY SYSTEM
FILE: public/navbar.js
VERSION: 2.0 (Narrative Documentation)
DATE: February 17, 2026

PURPOSE:
This script acts as the "Master Navigation". 
Instead of copying and pasting the HTML menu into every single page (which is a 
nightmare to update), we write it once here.

HOW IT WORKS:
1. Every HTML page has an empty <div id="navbar-container"></div>.
2. When the page loads, this script finds that div.
3. It "injects" the HTML code for the logo, links, and buttons into that div.
================================================================================ 
*/

document.addEventListener("DOMContentLoaded", () => {
    // Inject global focus styles for accessibility
    const focusStyle = document.createElement('style');
    focusStyle.textContent = `
        a:focus-visible, button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible {
            outline: 2px solid #a084ca;
            outline-offset: 2px;
        }
    `;
    document.head.appendChild(focusStyle);

    // 1. FIND THE TARGET
    // We look for the empty placeholder div we put at the top of every HTML page.
    const navContainer = document.getElementById("navbar-container");
    
    // Safety Check: If we forgot to add the div to a page, stop here so we don't crash.
    if (!navContainer) {
        console.error("Jarvis Error: No #navbar-container found on this page.");
        return;
    }

    // 2. INJECT THE HTML
    // We replace the empty div's content with this block of HTML.
    // Note: We use `sticky top-0 z-50` to make sure the menu sticks to the top 
    // of the screen and floats ABOVE everything else (like images or maps).
    navContainer.innerHTML = `
<nav class="bg-white/80 backdrop-blur-md border-b border-[#efe7f5] shadow-sm sticky top-0 z-50">
    <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-[#a084ca] focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:z-[100]">Skip to content</a>
    <div class="max-w-6xl mx-auto px-4 md:px-6">
        <div class="flex justify-between items-center h-16">
            
            <a href="index.html" class="flex items-center gap-3 group">
                <div class="w-10 h-10 rounded-full bg-[#a084ca] text-white flex items-center justify-center font-semibold text-lg shadow-sm group-hover:scale-105 transition-transform">
                    L
                </div>
                <div class="leading-tight">
                    <div class="font-semibold text-gray-900 text-lg tracking-tight">
                        Lola's Party
                    </div>
                    <div class="text-[10px] text-gray-400 uppercase tracking-widest">
                        Rentals
                    </div>
                </div>
            </a>

            <div class="hidden md:flex items-center space-x-8">
                <a href="index.html" class="text-gray-600 hover:text-[#a084ca] font-medium transition-colors">
                    Home
                </a>
                <a href="services.html" class="text-gray-600 hover:text-[#a084ca] font-medium transition-colors">
                    Services
                </a>
                <a href="gallery.html" class="text-gray-600 hover:text-[#a084ca] font-medium transition-colors">
                    Gallery
                </a>
                <a href="about.html" class="text-gray-600 hover:text-[#a084ca] font-medium transition-colors">
                    About Us
                </a>
                <a href="faq.html" class="text-gray-600 hover:text-[#a084ca] font-medium transition-colors">
                    FAQ
                </a>
                <a href="partyfavors.html" class="text-gray-600 hover:text-[#a084ca] font-medium transition-colors">
                    Party Favors
                </a>
                <a href="inquire.html"
                   class="bg-[#a084ca] hover:bg-[#8f6bbf] text-white px-6 py-2.5 rounded-full font-medium shadow-sm hover:shadow-md transition-all transform hover:-translate-y-0.5">
                    Book Now
                </a>
            </div>

            <div class="md:hidden flex items-center">
                <button id="mobile-menu-btn" class="text-gray-600 hover:text-[#a084ca] focus:outline-none p-3">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
            </div>

        </div>
    </div>

    <div id="mobile-menu" class="hidden md:hidden bg-white border-t border-[#efe7f5] pb-4 shadow-lg">
        <a href="index.html" class="block py-3 px-6 text-gray-700 hover:bg-[#f6f2fb] hover:text-[#a084ca] transition-all">
            Home
        </a>
        <a href="services.html" class="block py-3 px-6 text-gray-700 hover:bg-[#f6f2fb] hover:text-[#a084ca] transition-all">
            Services
        </a>
        <a href="gallery.html" class="block py-3 px-6 text-gray-700 hover:bg-[#f6f2fb] hover:text-[#a084ca] transition-all">
            Gallery
        </a>
        <a href="about.html" class="block py-3 px-6 text-gray-700 hover:bg-[#f6f2fb] hover:text-[#a084ca] transition-all">
            About Us
        </a>
        <a href="faq.html" class="block py-3 px-6 text-gray-700 hover:bg-[#f6f2fb] hover:text-[#a084ca] transition-all">
            FAQ
        </a>
        <a href="partyfavors.html" class="block py-3 px-6 text-gray-700 hover:bg-[#f6f2fb] hover:text-[#a084ca] transition-all">
            Party Favors
        </a>
        <div class="px-6 pt-2">
            <a href="inquire.html"
               class="block w-full text-center bg-[#a084ca] text-white py-3 rounded-full font-medium shadow hover:bg-[#8f6bbf] transition-all">
                Book Now
            </a>
        </div>
    </div>
</nav>
`;

    // 3. HIGHLIGHT ACTIVE NAV LINK
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    const navLinkMap = {
        "index.html": "index.html",
        "gallery.html": "gallery.html",
        "services.html": "services.html",
        "softplaypackages.html": "services.html",
        "tablespaces.html": "services.html",
        "minibouncers.html": "services.html",
        "partyfavors.html": "partyfavors.html",
        "inquire.html": "services.html",
        "about.html": "about.html",
        "faq.html": "faq.html"
    };
    const activeHref = navLinkMap[currentPage];
    if (activeHref) {
        navContainer.querySelectorAll(`nav a[href="${activeHref}"]`).forEach(link => {
            if (!link.classList.contains("bg-[#a084ca]")) {
                link.classList.remove("text-gray-600", "text-gray-700");
                link.classList.add("text-[#a084ca]", "font-semibold");
            }
        });
    }

    // 4. ACTIVATE THE MOBILE BUTTON
    // Now that the HTML exists, we can attach the "Click" listener to the hamburger button.
    const btn = document.getElementById("mobile-menu-btn");
    const menu = document.getElementById("mobile-menu");

    if(btn && menu) {
        btn.addEventListener("click", () => {
            menu.classList.toggle("hidden");
            // Safe: static SVG paths only (hamburger ↔ X icon), no user input
            const svg = btn.querySelector("svg");
            if (menu.classList.contains("hidden")) {
                svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>';
            } else {
                svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>';
            }
        });
    }

    // 4. INJECT BACK BUTTON BAR
    // Maps each page filename → its logical parent page.
    // Pages not listed here (e.g. index.html, admin.html) get no back bar.
    const backMap = {
        "gallery.html":          { label: "Home",     href: "index.html" },
        "services.html":         { label: "Home",     href: "index.html" },
        "about.html":            { label: "Home",     href: "index.html" },
        "faq.html":              { label: "Home",     href: "index.html" },
        "partyfavors.html":      { label: "Services", href: "services.html" },
        "inquire.html":          { label: "Services", href: "services.html" },
        "softplaypackages.html": { label: "Services", href: "services.html" },
        "tablespaces.html":      { label: "Services", href: "services.html" },
        "minibouncers.html":     { label: "Services", href: "services.html" },
        "success.html":          { label: "Home",     href: "index.html" },
        "404.html":              { label: "Home",     href: "index.html" },
    };

    const page = window.location.pathname.split("/").pop() || "index.html";
    const back = backMap[page];

    if (back) {
        const bar = document.createElement("div");
        bar.className = "bg-[#f6f2fb] border-b border-[#efe7f5] px-4 py-2";
        bar.innerHTML = `
            <div class="max-w-6xl mx-auto">
                <a href="${back.href}" class="inline-flex items-center gap-1.5 text-sm text-[#a084ca] hover:text-[#8f6bbf] font-medium transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                    Back to ${back.label}
                </a>
            </div>
        `;
        navContainer.appendChild(bar);
    }
});