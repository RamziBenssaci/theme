import "lite-youtube-embed";
import BasePage from "./base-page";
import Lightbox from "fslightbox";
window.fslightbox = Lightbox;

class Home extends BasePage {
    onReady() {
        this.initFeaturedTabs();
        // this.initDealsSection();
    }

    /**
     * used in views/components/home/featured-products-style*.twig
     */
    initFeaturedTabs() {
        app.all('.tab-trigger', el => {
            el.addEventListener('click', ({ currentTarget: btn }) => {
                let id = btn.dataset.componentId;
                // btn.setAttribute('fill', 'solid');
                app.toggleClassIf(`#${id} .tabs-wrapper>div`, 'is-active opacity-0 translate-y-3', 'inactive', tab => tab.id == btn.dataset.target)
                    .toggleClassIf(`#${id} .tab-trigger`, 'is-active', 'inactive', tabBtn => tabBtn == btn);

                // fadeIn active tabe
                setTimeout(() => app.toggleClassIf(`#${id} .tabs-wrapper>div`, 'opacity-100 translate-y-0', 'opacity-0 translate-y-3', tab => tab.id == btn.dataset.target), 100);
            })
        });
        document.querySelectorAll('.s-block-tabs').forEach(block => block.classList.add('tabs-initialized'));
    }

    /**
     * Initialize Deals of the Week section
     * - Countdown timer
     * - Slider navigation
     */
    initDealsSection() {
        try {
            // Countdown Timer
            const dealsTimerBoxes = document.querySelectorAll('.deals-countdown .timer-box');
            if (dealsTimerBoxes.length > 0) {
                let dealsHours = 9;
                let dealsMinutes = 20;
                let dealsSeconds = 54;
                let dealsMilliseconds = 27;

                const updateTimer = () => {
                    dealsMilliseconds--;
                    if (dealsMilliseconds < 0) {
                        dealsMilliseconds = 99;
                        dealsSeconds--;
                        if (dealsSeconds < 0) {
                            dealsSeconds = 59;
                            dealsMinutes--;
                            if (dealsMinutes < 0) {
                                dealsMinutes = 59;
                                dealsHours--;
                                if (dealsHours < 0) {
                                    dealsHours = 23;
                                }
                            }
                        }
                    }

                    if (dealsTimerBoxes[0]) dealsTimerBoxes[0].textContent = String(dealsHours).padStart(2, '0');
                    if (dealsTimerBoxes[1]) dealsTimerBoxes[1].textContent = String(dealsMinutes).padStart(2, '0');
                    if (dealsTimerBoxes[2]) dealsTimerBoxes[2].textContent = String(dealsSeconds).padStart(2, '0');
                    if (dealsTimerBoxes[3]) dealsTimerBoxes[3].textContent = String(dealsMilliseconds).padStart(2, '0');
                };

                // Update every 10ms for milliseconds
                setInterval(updateTimer, 10);
            }

            // Slider Navigation - Wait for page to be fully loaded
            setTimeout(() => {
                const dealsPrevBtn = document.querySelector('.deals-prev');
                const dealsNextBtn = document.querySelector('.deals-next');
                const dealsSlider = document.querySelector('#deals-of-week-slider');

                if (dealsPrevBtn && dealsNextBtn && dealsSlider) {
                    // Try to find Swiper instance
                    const findSwiper = () => {
                        try {
                            if (dealsSlider.swiper) {
                                return dealsSlider.swiper;
                            }
                            const swiperEl = dealsSlider.querySelector('.swiper');
                            if (swiperEl && swiperEl.swiper) {
                                return swiperEl.swiper;
                            }
                            if (dealsSlider._swiper) {
                                return dealsSlider._swiper;
                            }
                        } catch (e) {
                            console.log('Swiper not found yet');
                        }
                        return null;
                    };

                    // Try multiple times to find swiper
                    let attempts = 0;
                    const maxAttempts = 10;
                    const checkSwiper = setInterval(() => {
                        attempts++;
                        const swiper = findSwiper();
                        
                        if (swiper) {
                            clearInterval(checkSwiper);
                            dealsPrevBtn.addEventListener('click', () => {
                                swiper.slidePrev();
                            });

                            dealsNextBtn.addEventListener('click', () => {
                                swiper.slideNext();
                            });
                        } else if (attempts >= maxAttempts) {
                            clearInterval(checkSwiper);
                            // Fallback: just prevent default and let Salla handle it
                            dealsPrevBtn.addEventListener('click', (e) => {
                                e.preventDefault();
                            });

                            dealsNextBtn.addEventListener('click', (e) => {
                                e.preventDefault();
                            });
                        }
                    }, 200);
                }
            }, 1000);
        } catch (error) {
            console.error('Error initializing deals section:', error);
        }
    }
}

Home.initiateWhenReady(['index']);