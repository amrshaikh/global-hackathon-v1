// script.js
document.addEventListener('DOMContentLoaded', () => {
    // Views
    const homepageView = document.getElementById('homepage-view');
    const storytellerView = document.getElementById('storyteller-view');
    const familyView = document.getElementById('family-view');
    
    const allViews = [homepageView, storytellerView, familyView];

    // Buttons
    const gotoStorytellerBtn = document.getElementById('goto-storyteller');
    const gotoFamilyBtn = document.getElementById('goto-family');
    const backBtn1 = document.getElementById('back-to-home-1');
    const backBtn2 = document.getElementById('back-to-home-2');

    const showView = (viewToShow) => {
        allViews.forEach(view => {
            // Hide all views first
            view.classList.add('hidden', 'opacity-0');
        });
        // Show the target view with a fade-in effect
        viewToShow.classList.remove('hidden');
        setTimeout(() => viewToShow.classList.remove('opacity-0'), 50); // Small delay to trigger transition
    };

    // Event Listeners
    gotoStorytellerBtn.addEventListener('click', () => showView(storytellerView));
    gotoFamilyBtn.addEventListener('click', () => showView(familyView));
    backBtn1.addEventListener('click', () => showView(homepageView));
    backBtn2.addEventListener('click', () => showView(homepageView));
});