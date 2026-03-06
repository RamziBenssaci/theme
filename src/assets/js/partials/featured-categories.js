/**
 * Featured Categories Component
 * Displays menu categories in a grid layout
 * 
 * DEBUG: All console logs are prefixed with [FeaturedCategories] for easy filtering
 */
class FeaturedCategories extends HTMLElement {
    constructor() {
        super();
        console.log('[FeaturedCategories] Component constructor called');
        this.menus = [];
        this.isRendered = false;
    }

    connectedCallback() {
        console.log('[FeaturedCategories] connectedCallback - Component attached to DOM');
        
        // Wait for Salla to be ready
        if (typeof salla === 'undefined') {
            console.error('[FeaturedCategories] ERROR: Salla object not available. Make sure Salla is loaded.');
            this.showError('Salla not available');
            return;
        }

        console.log('[FeaturedCategories] Salla object found, waiting for onReady...');

        salla.onReady()
            .then(() => {
                console.log('[FeaturedCategories] Salla.onReady() resolved');
                
                if (typeof salla.lang !== 'undefined' && salla.lang.onLoaded) {
                    console.log('[FeaturedCategories] Waiting for language to load...');
                    return salla.lang.onLoaded();
                }
                console.log('[FeaturedCategories] Language already loaded or not needed');
                return Promise.resolve();
            })
            .then(() => {
                console.log('[FeaturedCategories] Checking API availability...');
                
                if (typeof salla.api === 'undefined') {
                    console.error('[FeaturedCategories] ERROR: salla.api is undefined');
                    this.showError('Salla API not available');
                    return;
                }
                
                if (typeof salla.api.component === 'undefined') {
                    console.error('[FeaturedCategories] ERROR: salla.api.component is undefined');
                    this.showError('Salla component API not available');
                    return;
                }
                
                if (typeof salla.api.component.getMenus !== 'function') {
                    console.error('[FeaturedCategories] ERROR: salla.api.component.getMenus is not a function');
                    console.log('[FeaturedCategories] Available methods:', Object.keys(salla.api.component));
                    this.showError('getMenus function not available');
                    return;
                }

                console.log('[FeaturedCategories] API available, fetching menus...');
                return salla.api.component.getMenus()
                    .then((response) => {
                        console.log('[FeaturedCategories] getMenus() response received:', response);
                        
                        if (!response) {
                            console.error('[FeaturedCategories] ERROR: No response from getMenus()');
                            this.showError('No response from API');
                            return;
                        }

                        const data = response.data || response;
                        console.log('[FeaturedCategories] Menu data:', data);
                        
                        if (!data) {
                            console.error('[FeaturedCategories] ERROR: No data in response');
                            this.showError('No data in API response');
                            return;
                        }

                        if (!Array.isArray(data)) {
                            console.error('[FeaturedCategories] ERROR: Data is not an array. Type:', typeof data, 'Value:', data);
                            this.showError('Invalid data format');
                            return;
                        }

                        if (data.length === 0) {
                            console.warn('[FeaturedCategories] WARNING: Menu data is empty array');
                            this.showError('No categories found');
                            return;
                        }

                        console.log('[FeaturedCategories] Found', data.length, 'menu items');
                        this.menus = data;
                        this.render();
                    })
                    .catch((error) => {
                        console.error('[FeaturedCategories] ERROR fetching menus:', error);
                        console.error('[FeaturedCategories] Error stack:', error.stack);
                        this.showError('Failed to fetch categories: ' + error.message);
                    });
            })
            .catch((error) => {
                console.error('[FeaturedCategories] ERROR in initialization chain:', error);
                console.error('[FeaturedCategories] Error stack:', error.stack);
                this.showError('Initialization error: ' + error.message);
            });
    }

    /**
     * Show error message in the component
     */
    showError(message) {
        const categoriesGrid = this.querySelector('.categories-grid');
        if (categoriesGrid) {
            categoriesGrid.innerHTML = `<div style="text-align: center; padding: 20px; color: #999;">${message}</div>`;
        }
    }

    /**
     * Get placeholder image URL
     */
    getPlaceholderImage() {
        try {
            if (typeof salla !== 'undefined' && salla.url && salla.url.asset) {
                const placeholder = salla.url.asset('images/placeholder.png');
                console.log('[FeaturedCategories] Placeholder image:', placeholder);
                return placeholder;
            }
        } catch (error) {
            console.warn('[FeaturedCategories] Could not get placeholder from Salla:', error);
        }
        return '/images/placeholder.png';
    }

    /**
     * Render the featured categories
     */
    render() {
        console.log('[FeaturedCategories] render() called');
        
        if (this.isRendered) {
            console.warn('[FeaturedCategories] Already rendered, skipping...');
            return;
        }

        if (!this.menus || this.menus.length === 0) {
            console.warn('[FeaturedCategories] No menus to render');
            this.showError('No categories available');
            return;
        }

        console.log('[FeaturedCategories] Processing', this.menus.length, 'menu items');

        // Get only root-level menu items (the main categories)
        // Menu items without parent_id or with parent_id === 0 or null are root categories
        const rootCategories = this.menus.filter(menu => {
            const isRoot = !menu.parent_id || menu.parent_id === 0 || menu.parent_id === null;
            console.log('[FeaturedCategories] Menu item:', menu.title || menu.name, 'parent_id:', menu.parent_id, 'isRoot:', isRoot);
            return isRoot;
        });
        
        console.log('[FeaturedCategories] Found', rootCategories.length, 'root categories');
        
        if (rootCategories.length === 0) {
            console.warn('[FeaturedCategories] No root categories found. Showing all categories instead.');
            // If no root categories, show all categories
            rootCategories.push(...this.menus);
        }
        
        // Limit to first 6 categories or all if less than 6
        const categoriesToShow = rootCategories.slice(0, 6);
        console.log('[FeaturedCategories] Will display', categoriesToShow.length, 'categories');

        const categoriesGrid = this.querySelector('.categories-grid');
        if (!categoriesGrid) {
            console.error('[FeaturedCategories] ERROR: .categories-grid element not found in DOM');
            return;
        }

        console.log('[FeaturedCategories] Found .categories-grid, clearing content...');
        // Clear existing content
        categoriesGrid.innerHTML = '';

        const placeholderImage = this.getPlaceholderImage();

        // Render each category
        categoriesToShow.forEach((category, index) => {
            try {
                console.log(`[FeaturedCategories] Rendering category ${index + 1}:`, category);
                
                const categoryItem = document.createElement('div');
                categoryItem.className = 'category-item';
                
                const categoryLink = document.createElement('a');
                const categoryUrl = category.url || category.link || '#';
                categoryLink.href = categoryUrl;
                categoryLink.setAttribute('aria-label', category.title || category.name || 'Category');
                console.log(`[FeaturedCategories] Category ${index + 1} URL:`, categoryUrl);
                
                const categoryIcon = document.createElement('div');
                categoryIcon.className = 'category-icon';
                
                const categoryImage = document.createElement('img');
                
                // Try multiple possible image properties
                const imageUrl = category.image || 
                                category.image_url || 
                                category.image?.url || 
                                category.thumbnail || 
                                category.thumbnail_url ||
                                placeholderImage;
                
                categoryImage.src = imageUrl;
                categoryImage.alt = category.title || category.name || 'Category';
                categoryImage.loading = 'lazy';
                
                console.log(`[FeaturedCategories] Category ${index + 1} image:`, imageUrl);
                
                categoryImage.onerror = function() {
                    console.warn(`[FeaturedCategories] Image failed to load for category ${index + 1}, using placeholder`);
                    this.src = placeholderImage;
                };
                
                categoryImage.onload = function() {
                    console.log(`[FeaturedCategories] Image loaded successfully for category ${index + 1}`);
                };
                
                categoryIcon.appendChild(categoryImage);
                
                const categoryTitle = document.createElement('h3');
                const categoryName = category.title || category.name || 'Category';
                categoryTitle.textContent = categoryName;
                console.log(`[FeaturedCategories] Category ${index + 1} name:`, categoryName);
                
                categoryLink.appendChild(categoryIcon);
                categoryLink.appendChild(categoryTitle);
                categoryItem.appendChild(categoryLink);
                categoriesGrid.appendChild(categoryItem);
                
                console.log(`[FeaturedCategories] Category ${index + 1} rendered successfully`);
            } catch (error) {
                console.error(`[FeaturedCategories] ERROR rendering category ${index + 1}:`, error);
                console.error('[FeaturedCategories] Error stack:', error.stack);
            }
        });

        this.isRendered = true;
        console.log('[FeaturedCategories] Render complete! Total categories displayed:', categoriesToShow.length);
    }
}

// Register the custom element only if not already defined
if (!customElements.get('featured-categories')) {
    try {
        console.log('[FeaturedCategories] Registering custom element...');
        customElements.define('featured-categories', FeaturedCategories);
        console.log('[FeaturedCategories] Custom element registered successfully');
    } catch (error) {
        console.error('[FeaturedCategories] ERROR registering custom element:', error);
        console.error('[FeaturedCategories] Error stack:', error.stack);
    }
} else {
    console.warn('[FeaturedCategories] Custom element already registered');
}
