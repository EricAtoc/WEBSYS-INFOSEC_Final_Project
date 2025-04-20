document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed"); // Initial check

    // --- Main Navigation Selectors ---
    const mainNavButtons = document.querySelectorAll('.main-nav .nav-button:not(#category-btn)');
    const categoryButton = document.getElementById('category-btn');
    const categoryDropdown = document.getElementById('category-dropdown');
    const categoryDropdownButtons = categoryDropdown ? categoryDropdown.querySelectorAll('button') : [];
    const allMainNavButtons = document.querySelectorAll('.main-nav .nav-button');

    // --- Content Section Selectors ---
    const contentSections = document.querySelectorAll('.main-content .content-section');

    // --- Pollution Section Pagination Selectors ---
    const pollutionContainer = document.getElementById('pollution-content'); // Get the main pollution section container
    // Only select buttons/pages *if* the container exists
    const pollutionSideNavButtons = pollutionContainer ? pollutionContainer.querySelectorAll('.side-nav .side-nav-item') : [];
    const pollutionPages = pollutionContainer ? pollutionContainer.querySelectorAll('.pollution-main .pollution-page') : [];

    console.log(`Found ${contentSections.length} main content sections.`);
    if (pollutionContainer) {
        console.log(`Found pollution section container.`);
        console.log(`Found ${pollutionSideNavButtons.length} pollution pagination buttons.`);
        console.log(`Found ${pollutionPages.length} pollution pages.`);
    } else {
        console.warn("Pollution section container (#pollution-content) not found!");
    }


    // --- Function to switch active MAIN content section and update MAIN nav button ---
    function setActiveSection(targetId) {
        console.log(`Attempting to activate main section: #${targetId}`);

        // 1. Hide ALL main content sections first
        contentSections.forEach(section => {
            section.classList.remove('active');
        });

        // 2. Deactivate ALL main nav buttons visually
        allMainNavButtons.forEach(btn => {
            btn.classList.remove('active');
        });

        // 3. Find and Show the TARGET main section
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.classList.add('active');
            console.log(`Successfully activated main section: #${targetId}`);

            // **** Reset Pollution Section Internal State (if activating pollution section) ****
            if (targetId === 'pollution-content' && pollutionContainer && pollutionSideNavButtons.length > 0 && pollutionPages.length > 0) {
                console.log('Resetting pollution pagination to page 1...');
                // Deactivate all pollution pages/buttons first
                pollutionPages.forEach(page => page.classList.remove('active'));
                pollutionSideNavButtons.forEach(btn => btn.classList.remove('active'));

                // Activate the first page and button by default
                const firstPollutionPage = pollutionContainer.querySelector('#pollution-page-1'); // More specific selector
                const firstPollutionButton = pollutionContainer.querySelector('.side-nav-item[data-target="pollution-page-1"]');

                if (firstPollutionPage) {
                     firstPollutionPage.classList.add('active');
                     console.log('Activated pollution-page-1');
                } else {
                    console.error('Could not find #pollution-page-1 to activate.');
                }
                if (firstPollutionButton) {
                    firstPollutionButton.classList.add('active');
                    console.log('Activated pollution side nav button for page 1');
                } else {
                     console.error('Could not find pollution side nav button for page 1.');
                }
            }
            // **** End of Pollution Reset Block ****

        } else {
            console.error(`Target main section with ID "${targetId}" not found!`);
            return; // Stop if the target doesn't exist
        }

        // 4. Activate the corresponding MAIN NAV button
        let mainButtonToActivate = document.querySelector(`.main-nav .nav-button[data-target="${targetId}"]`);

        // If not found directly, check if it's an item from the category dropdown
        if (!mainButtonToActivate && categoryDropdownButtons.length > 0) {
            const isCategoryItem = Array.from(categoryDropdownButtons).some(btn => btn.dataset.target === targetId);
            if (isCategoryItem && categoryButton) {
                mainButtonToActivate = categoryButton; // Activate the main Category button
            }
        }

        // Activate the found button or handle the 'welcome-content' case
        if (mainButtonToActivate) {
            mainButtonToActivate.classList.add('active');
        } else {
            // Special case: If target is 'welcome-content', ensure 'About Us' button is active
            if (targetId === 'welcome-content') {
                const aboutButton = document.querySelector('.main-nav .nav-button[data-target="welcome-content"]');
                if (aboutButton) aboutButton.classList.add('active');
            } else {
                console.warn(`No main nav button found to activate for target: ${targetId}`);
            }
        }

        // 5. Close category dropdown if it's open
        if (categoryDropdown) {
            categoryDropdown.style.display = 'none';
        }
    }


    // --- Event Listeners ---

    // Main navigation buttons (excluding Category itself)
    mainNavButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.target;
            if (targetId) {
                setActiveSection(targetId);
            } else {
                console.warn('Main nav button clicked has no data-target:', button);
            }
        });
    });

    // Category button (to toggle dropdown)
    if (categoryButton && categoryDropdown) {
        categoryButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent click bubbling up to document
            const isVisible = categoryDropdown.style.display === 'block';
            console.log(`Category dropdown toggle: ${isVisible ? 'hiding' : 'showing'}`);
            categoryDropdown.style.display = isVisible ? 'none' : 'block';
        });
    }

    // Category dropdown buttons
    if (categoryDropdownButtons.length > 0) {
        categoryDropdownButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                 event.stopPropagation(); // Prevent click bubbling up
                const targetId = button.dataset.target;
                if (targetId) {
                     console.log(`Category dropdown item clicked: ${targetId}`);
                    setActiveSection(targetId); // This handles activating the section and closing dropdown
                }
            });
        });
    }

    // Close category dropdown if clicking outside of it
    document.addEventListener('click', (event) => {
        if (categoryDropdown && categoryButton && categoryDropdown.style.display === 'block') {
            // Check if the click was outside the dropdown AND outside the category button
            if (!categoryButton.contains(event.target) && !categoryDropdown.contains(event.target)) {
                 console.log("Clicked outside category dropdown, closing it.");
                categoryDropdown.style.display = 'none';
            }
        }
    });

    // --- Pollution Section Side Navigation Listener ---
    if (pollutionContainer && pollutionSideNavButtons.length > 0 && pollutionPages.length > 0) {
        console.log("Attaching listeners to pollution pagination buttons...");
        pollutionSideNavButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetPageId = button.dataset.target;
                console.log(`Pollution button clicked: data-target="${targetPageId}"`); // Log which button was clicked

                // Check if target page exists before proceeding
                const targetPage = pollutionContainer.querySelector(`#${targetPageId}`); // Search within pollution container

                if (!targetPage) {
                    console.warn(`Pollution page with ID "${targetPageId}" not found within #pollution-content.`);
                    return; // Do nothing if the target page doesn't exist
                }

                // Update button active state (only within pollution side nav)
                console.log("Updating pollution button active states...");
                pollutionSideNavButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Update page active state (only within pollution main content)
                console.log("Updating pollution page active states...");
                pollutionPages.forEach(page => {
                    page.classList.remove('active');
                });
                targetPage.classList.add('active');

                console.log(`Successfully activated pollution page: #${targetPageId}`);
            });
        });
         console.log("Finished attaching pollution pagination listeners.");
    } else {
        console.warn("Pollution pagination elements not found or missing. Listeners not attached.");
    }


    // --- Initial Page State ---
    console.log("Initializing page state...");
    // Ensure all main sections are hidden initially except the default one
    contentSections.forEach(section => {
        section.classList.remove('active');
    });
    // Activate the default section (e.g., 'welcome-content')
    setActiveSection('welcome-content'); // Set your desired starting section ID here

    console.log("Initialization complete.");

}); // End of DOMContentLoaded