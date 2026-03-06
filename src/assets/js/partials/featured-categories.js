/**
 * Featured Categories Component
 * Displays menu categories in a grid layout
 */
class FeaturedCategories extends HTMLElement {
    connectedCallback() {
        // Wait for Salla to be ready
        if (typeof salla === 'undefined') {
            console.warn('featured-categories: Salla not available');
            return;
        }

        salla.onReady()
            .then(() => {
                if (typeof salla.lang !== 'undefined' && salla.lang.onLoaded) {
                    return salla.lang.onLoaded();
                }
                return Promise.resolve();
            })
            .then(() => {
                if (typeof salla.api === 'undefined' || typeof salla.api.component === 'undefined' || typeof salla.api.component.getMenus !== 'function') {
                    console.warn('featured-categories: getMenus API not available');
                    return;
                }
                return salla.api.component.getMenus()
                    .then(({ data }) => {
                        if (data && Array.isArray(data)) {
                            this.menus = data;
                            this.render();
                        }
                    })
                    .catch((error) => {
                        console.error('featured-categories::Error fetching menus', error);
                    });
            })
            .catch((error) => {
                console.error('featured-categories::Error initializing', error);
            });
    }

    /**
     * Get placeholder image URL
     */
    getPlaceholderImage() {
        // Use Salla's asset helper if available, otherwise use default path
        if (typeof salla !== 'undefined' && salla.url && salla.url.asset) {
            return salla.url.asset('images/placeholder.png');
        }
        return '/images/placeholder.png';
    }

    /**
     * Render the featured categories
     */
    render() {
        if (!this.menus || this.menus.length === 0) {
            return;
        }

        // Get only root-level menu items (the main categories)
        const rootCategories = this.menus.filter(menu => !menu.parent_id || menu.parent_id === 0);
        
        // Limit to first 6 categories or all if less than 6
        const categoriesToShow = rootCategories.slice(0, 6);

        const categoriesGrid = this.querySelector('.categories-grid');
        if (!categoriesGrid) {
            return;
        }

        // Clear existing content
        categoriesGrid.innerHTML = '';

        const placeholderImage = this.getPlaceholderImage();

        // Render each category
        categoriesToShow.forEach(category => {
            const categoryItem = document.createElement('div');
            categoryItem.className = 'category-item';
            
            const categoryLink = document.createElement('a');
            categoryLink.href = category.url || '#';
            
            const categoryIcon = document.createElement('div');
            categoryIcon.className = 'category-icon';
            
            const categoryImage = document.createElement('img');
            // Use category image if available, otherwise use placeholder
            categoryImage.src = category.image || category.image_url || placeholderImage;
            categoryImage.alt = category.title || category.name || 'Category';
            categoryImage.onerror = function() {
                this.src = placeholderImage;
            };
            
            categoryIcon.appendChild(categoryImage);
            
            const categoryTitle = document.createElement('h3');
            categoryTitle.textContent = category.title || category.name || 'Category';
            
            categoryLink.appendChild(categoryIcon);
            categoryLink.appendChild(categoryTitle);
            categoryItem.appendChild(categoryLink);
            categoriesGrid.appendChild(categoryItem);
        });
    }
}

// Register the custom element only if not already defined
if (!customElements.get('featured-categories')) {
    try {
        customElements.define('featured-categories', FeaturedCategories);
    } catch (error) {
        console.error('featured-categories: Error registering custom element', error);
    }
}
