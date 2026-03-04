import "lite-youtube-embed";
import BasePage from "./base-page";
import Lightbox from "fslightbox";
window.fslightbox = Lightbox;

class Home extends BasePage {
    onReady() {
        this.initFeaturedTabs();
        this.initDealsSection();
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

        // Slider Navigation
        const dealsPrevBtn = document.querySelector('.deals-prev');
        const dealsNextBtn = document.querySelector('.deals-next');
        const dealsSlider = document.querySelector('#deals-of-week-slider');

        if (dealsPrevBtn && dealsNextBtn && dealsSlider) {
            // Wait for Salla slider to initialize
            salla.onReady(() => {
                // Find the Swiper instance
                const findSwiper = () => {
                    if (dealsSlider.swiper) {
                        return dealsSlider.swiper;
                    }
                    // Try to find swiper in shadow DOM or component
                    const swiperInstance = dealsSlider.querySelector('.swiper')?.swiper;
                    if (swiperInstance) return swiperInstance;
                    
                    // Try accessing via Salla's internal structure
                    if (dealsSlider._swiper) return dealsSlider._swiper;
                    
                    return null;
                };

                // Try to get swiper after a short delay
                setTimeout(() => {
                    const swiper = findSwiper();
                    
                    if (swiper) {
                        dealsPrevBtn.addEventListener('click', () => {
                            swiper.slidePrev();
                        });

                        dealsNextBtn.addEventListener('click', () => {
                            swiper.slideNext();
                        });
                    } else {
                        // Fallback: try to trigger Salla's built-in navigation
                        dealsPrevBtn.addEventListener('click', () => {
                            dealsSlider.dispatchEvent(new CustomEvent('prev'));
                        });

                        dealsNextBtn.addEventListener('click', () => {
                            dealsSlider.dispatchEvent(new CustomEvent('next'));
                        });
                    }
                }, 500);
            });
        }
    }
}

Home.initiateWhenReady(['index']);