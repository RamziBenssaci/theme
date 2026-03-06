/**
 * Featured Categories Component
 * Displays categories in a grid layout using Salla Categories API
 * 
 * DEBUG: All console logs are prefixed with [FeaturedCategories] for easy filtering
 */
class FeaturedCategories extends HTMLElement {
    constructor() {
        super();
        console.log('[FeaturedCategories] Component constructor called');
        this.categories = [];
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
                console.log('[FeaturedCategories] Fetching categories from API...');
                return this.fetchCategories();
            })
            .catch((error) => {
                console.error('[FeaturedCategories] ERROR in initialization chain:', error);
                console.error('[FeaturedCategories] Error stack:', error.stack);
                this.showError('Initialization error: ' + error.message);
            });
    }

    /**
     * Fetch categories from Salla Categories API
     */
    async fetchCategories() {
        try {
            // Try using Salla API helper
            if (typeof salla !== 'undefined' && salla.api) {
                console.log('[FeaturedCategories] Checking available Salla API methods...');
                console.log('[FeaturedCategories] salla.api keys:', Object.keys(salla.api));
                
                // Try salla.api.get if available
                if (typeof salla.api.get === 'function') {
                    console.log('[FeaturedCategories] Using salla.api.get()...');
                    const response = await salla.api.get('categories', { status: 'active' });
                    console.log('[FeaturedCategories] Categories API response:', response);
                    return this.processCategoriesResponse(response);
                }
                
                // Try salla.api.categories if available
                if (salla.api.categories && typeof salla.api.categories.list === 'function') {
                    console.log('[FeaturedCategories] Using salla.api.categories.list()...');
                    const response = await salla.api.categories.list({ status: 'active' });
                    console.log('[FeaturedCategories] Categories API response:', response);
                    return this.processCategoriesResponse(response);
                }
            }

            // Fallback: Use fetch to call the Categories API
            console.log('[FeaturedCategories] Using fetch to call Categories API...');
            
            // Build API URL - try different methods
            let apiUrl;
            if (typeof salla !== 'undefined' && salla.url && salla.url.api) {
                apiUrl = salla.url.api('categories', { status: 'active' });
            } else if (typeof salla !== 'undefined' && salla.config && salla.config.api) {
                apiUrl = `${salla.config.api}/categories?status=active`;
            } else {
                // Default API endpoint
                apiUrl = '/api/categories?status=active';
            }
            
            console.log('[FeaturedCategories] API URL:', apiUrl);
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            console.log('[FeaturedCategories] Fetch response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('[FeaturedCategories] Fetch response data:', data);
            return this.processCategoriesResponse(data);
        } catch (error) {
            console.error('[FeaturedCategories] ERROR fetching categories:', error);
            console.error('[FeaturedCategories] Error stack:', error.stack);
            
            // Fallback: Try getting categories from menu items
            console.log('[FeaturedCategories] Trying fallback: getting categories from menu...');
            return this.fetchCategoriesFromMenu();
        }
    }

    /**
     * Fallback: Get categories from menu items
     */
    async fetchCategoriesFromMenu() {
        try {
            if (typeof salla.api === 'undefined' || typeof salla.api.component === 'undefined' || typeof salla.api.component.getMenus !== 'function') {
                throw new Error('getMenus API not available');
            }

            console.log('[FeaturedCategories] Fetching menus as fallback...');
            const response = await salla.api.component.getMenus();
            console.log('[FeaturedCategories] Menus response:', response);
            
            const data = response.data || response;
            if (data && Array.isArray(data)) {
                console.log('[FeaturedCategories] Found', data.length, 'menu items');
                // Convert menu items to category-like format
                const categories = data
                    .filter(menu => !menu.parent_id || menu.parent_id === 0)
                    .slice(0, 6)
                    .map(menu => ({
                        id: menu.id,
                        name: menu.title || menu.name,
                        image: menu.image || menu.image_url || null,
                        url: menu.url || menu.link,
                        parent_id: menu.parent_id || 0
                    }));
                
                console.log('[FeaturedCategories] Converted menu items to categories:', categories);
                this.categories = categories;
                this.render();
            }
        } catch (error) {
            console.error('[FeaturedCategories] ERROR in fallback:', error);
            this.showError('Failed to fetch categories: ' + error.message);
        }
    }

    /**
     * Process categories API response
     */
    processCategoriesResponse(response) {
        console.log('[FeaturedCategories] Processing categories response...');
        console.log('[FeaturedCategories] Full response object:', JSON.stringify(response, null, 2));
        
        const data = response.data || response;
        console.log('[FeaturedCategories] Extracted data:', data);
        
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
            console.warn('[FeaturedCategories] WARNING: Categories data is empty array');
            this.showError('No categories found');
            return;
        }

        console.log('[FeaturedCategories] Found', data.length, 'categories in response');
        
        // Filter root categories (parent_id === 0) and active status
        const rootCategories = data.filter(category => {
            const isRoot = category.parent_id === 0 || category.parent_id === null;
            const isActive = category.status === 'active';
            
            console.log(`[FeaturedCategories] Category: "${category.name}" (ID: ${category.id})`);
            console.log(`  - parent_id: ${category.parent_id} (isRoot: ${isRoot})`);
            console.log(`  - status: ${category.status} (isActive: ${isActive})`);
            console.log(`  - image: ${category.image ? category.image : 'NULL/UNDEFINED'}`);
            console.log(`  - image type: ${typeof category.image}`);
            console.log(`  - image value:`, category.image);
            console.log(`  - Full category object:`, JSON.stringify(category, null, 2));
            
            return isRoot && isActive;
        });
        
        console.log('[FeaturedCategories] Found', rootCategories.length, 'root active categories');
        
        if (rootCategories.length === 0) {
            console.warn('[FeaturedCategories] No root categories found. Showing all active categories instead.');
            rootCategories.push(...data.filter(cat => cat.status === 'active'));
        }
        
        // Limit to first 6 categories
        this.categories = rootCategories.slice(0, 6);
        console.log('[FeaturedCategories] Final categories to display:', this.categories.length);
        console.log('[FeaturedCategories] Categories data:', JSON.stringify(this.categories, null, 2));
        
        this.render();
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

        if (!this.categories || this.categories.length === 0) {
            console.warn('[FeaturedCategories] No categories to render');
            this.showError('No categories available');
            return;
        }

        console.log('[FeaturedCategories] Rendering', this.categories.length, 'categories');

        const categoriesGrid = this.querySelector('.categories-grid');
        if (!categoriesGrid) {
            console.error('[FeaturedCategories] ERROR: .categories-grid element not found in DOM');
            return;
        }

        console.log('[FeaturedCategories] Found .categories-grid, clearing content...');
        categoriesGrid.innerHTML = '';

        const placeholderImage = this.getPlaceholderImage();

        // Render each category
        this.categories.forEach((category, index) => {
            try {
                console.log(`[FeaturedCategories] ===== Rendering category ${index + 1} =====`);
                console.log(`[FeaturedCategories] Full category object:`, JSON.stringify(category, null, 2));
                console.log(`[FeaturedCategories] Category ID:`, category.id);
                console.log(`[FeaturedCategories] Category name:`, category.name);
                console.log(`[FeaturedCategories] Category URL:`, category.url || category.urls?.customer);
                
                // DEBUG: Check image property in detail
                console.log(`[FeaturedCategories] === IMAGE DEBUG ===`);
                console.log(`[FeaturedCategories] category.image exists:`, 'image' in category);
                console.log(`[FeaturedCategories] category.image value:`, category.image);
                console.log(`[FeaturedCategories] category.image type:`, typeof category.image);
                console.log(`[FeaturedCategories] category.image === null:`, category.image === null);
                console.log(`[FeaturedCategories] category.image === undefined:`, category.image === undefined);
                console.log(`[FeaturedCategories] category.image === '':`, category.image === '');
                console.log(`[FeaturedCategories] category.image truthy:`, !!category.image);
                
                const categoryItem = document.createElement('div');
                categoryItem.className = 'category-item';
                
                const categoryLink = document.createElement('a');
                const categoryUrl = category.url || category.urls?.customer || '#';
                categoryLink.href = categoryUrl;
                categoryLink.setAttribute('aria-label', category.name || 'Category');
                console.log(`[FeaturedCategories] Category ${index + 1} link URL:`, categoryUrl);
                
                const categoryIcon = document.createElement('div');
                categoryIcon.className = 'category-icon';
                
                const categoryImage = document.createElement('img');
                
                // Use the image property directly from category (as per API spec)
                let imageUrl = category.image;
                
                console.log(`[FeaturedCategories] Raw image value:`, imageUrl);
                
                // Check if image exists and is valid
                if (!imageUrl || imageUrl === null || imageUrl === '' || imageUrl === 'null') {
                    console.warn(`[FeaturedCategories] Category ${index + 1} has no image, using placeholder`);
                    imageUrl = placeholderImage;
                } else {
                    console.log(`[FeaturedCategories] Category ${index + 1} has image:`, imageUrl);
                }
                
                categoryImage.src = imageUrl;
                categoryImage.alt = category.name || 'Category';
                categoryImage.loading = 'lazy';
                
                console.log(`[FeaturedCategories] Final image URL set to:`, imageUrl);
                
                categoryImage.onerror = function() {
                    console.warn(`[FeaturedCategories] Image failed to load for category ${index + 1}:`, imageUrl);
                    console.warn(`[FeaturedCategories] Falling back to placeholder:`, placeholderImage);
                    this.src = placeholderImage;
                };
                
                categoryImage.onload = function() {
                    console.log(`[FeaturedCategories] ✓ Image loaded successfully for category ${index + 1}:`, imageUrl);
                };
                
                categoryIcon.appendChild(categoryImage);
                
                const categoryTitle = document.createElement('h3');
                categoryTitle.textContent = category.name || 'Category';
                console.log(`[FeaturedCategories] Category ${index + 1} title:`, category.name);
                
                categoryLink.appendChild(categoryIcon);
                categoryLink.appendChild(categoryTitle);
                categoryItem.appendChild(categoryLink);
                categoriesGrid.appendChild(categoryItem);
                
                console.log(`[FeaturedCategories] ✓ Category ${index + 1} rendered successfully`);
                console.log(`[FeaturedCategories] ===== End category ${index + 1} =====`);
            } catch (error) {
                console.error(`[FeaturedCategories] ERROR rendering category ${index + 1}:`, error);
                console.error('[FeaturedCategories] Error stack:', error.stack);
            }
        });

        this.isRendered = true;
        console.log('[FeaturedCategories] ✓ Render complete! Total categories displayed:', this.categories.length);
    }
}

// Register the custom element only if not already defined
if (!customElements.get('featured-categories')) {
    try {
        console.log('[FeaturedCategories] Registering custom element...');
        customElements.define('featured-categories', FeaturedCategories);
        console.log('[FeaturedCategories] ✓ Custom element registered successfully');
    } catch (error) {
        console.error('[FeaturedCategories] ERROR registering custom element:', error);
        console.error('[FeaturedCategories] Error stack:', error.stack);
    }
} else {
    console.warn('[FeaturedCategories] Custom element already registered');
}
