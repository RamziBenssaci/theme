/**
 * Featured Categories Component
 * Displays menu categories in a grid layout
 * Uses getMenus() for category names (working) + menu items for images
 * 
 * DEBUG: All console logs are prefixed with [FeaturedCategories] for easy filtering
 */
class FeaturedCategories extends HTMLElement {
    constructor() {
        super();
        console.log('[FeaturedCategories] ===== Component constructor called =====');
        this.menus = [];
        this.menuItems = [];
        this.isRendered = false;
    }

    connectedCallback() {
        console.log('[FeaturedCategories] ===== connectedCallback - Component attached to DOM =====');
        
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
                console.log('[FeaturedCategories] Fetching menus (for category names - current working method)...');
                return this.fetchMenusForCategories();
            })
            .catch((error) => {
                console.error('[FeaturedCategories] ERROR in initialization chain:', error);
                console.error('[FeaturedCategories] Error stack:', error.stack);
                this.showError('Initialization error: ' + error.message);
            });
    }

    /**
     * Fetch menus using getMenus() - This is the method that works for category names
     */
    async fetchMenusForCategories() {
        try {
            console.log('[FeaturedCategories] ===== STEP 1: Fetching menus using getMenus() =====');
            
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
                console.log('[FeaturedCategories] Available methods in salla.api.component:', Object.keys(salla.api.component));
                this.showError('getMenus function not available');
                return;
            }

            console.log('[FeaturedCategories] Calling salla.api.component.getMenus()...');
            const response = await salla.api.component.getMenus();
            
            console.log('[FeaturedCategories] ===== FULL RESPONSE FROM getMenus() =====');
            console.log('[FeaturedCategories] Response type:', typeof response);
            console.log('[FeaturedCategories] Response:', response);
            console.log('[FeaturedCategories] Response keys:', Object.keys(response || {}));
            console.log('[FeaturedCategories] Response.data:', response.data);
            console.log('[FeaturedCategories] Response.data type:', typeof response.data);
            console.log('[FeaturedCategories] Response.data is array:', Array.isArray(response.data));
            
            // Extract data
            const data = response.data || response;
            
            console.log('[FeaturedCategories] ===== EXTRACTED DATA =====');
            console.log('[FeaturedCategories] Data:', data);
            console.log('[FeaturedCategories] Data type:', typeof data);
            console.log('[FeaturedCategories] Data is array:', Array.isArray(data));
            console.log('[FeaturedCategories] Data length:', data ? data.length : 0);
            
            if (!data) {
                console.error('[FeaturedCategories] ERROR: No data in response');
                this.showError('No data in API response');
                return;
            }

            if (!Array.isArray(data)) {
                console.error('[FeaturedCategories] ERROR: Data is not an array. Type:', typeof data, 'Value:', JSON.stringify(data, null, 2));
                this.showError('Invalid data format');
                return;
            }

            if (data.length === 0) {
                console.warn('[FeaturedCategories] WARNING: Menu data is empty array');
                this.showError('No categories found');
                return;
            }

            console.log('[FeaturedCategories] ===== DETAILED MENU ITEMS ANALYSIS =====');
            console.log('[FeaturedCategories] Found', data.length, 'menu items');
            
            // Log each menu item in detail
            data.forEach((menu, index) => {
                console.log(`[FeaturedCategories] ===== MENU ITEM ${index + 1} =====`);
                console.log(`[FeaturedCategories] Full menu object:`, JSON.stringify(menu, null, 2));
                console.log(`[FeaturedCategories] Menu keys:`, Object.keys(menu || {}));
                console.log(`[FeaturedCategories] Menu ID:`, menu.id);
                console.log(`[FeaturedCategories] Menu title:`, menu.title);
                console.log(`[FeaturedCategories] Menu name:`, menu.name);
                console.log(`[FeaturedCategories] Menu url:`, menu.url);
                console.log(`[FeaturedCategories] Menu link:`, menu.link);
                console.log(`[FeaturedCategories] Menu parent_id:`, menu.parent_id);
                console.log(`[FeaturedCategories] Menu image:`, menu.image);
                console.log(`[FeaturedCategories] Menu image type:`, typeof menu.image);
                console.log(`[FeaturedCategories] Menu image_url:`, menu.image_url);
                console.log(`[FeaturedCategories] Menu thumbnail:`, menu.thumbnail);
                console.log(`[FeaturedCategories] Menu thumbnail_url:`, menu.thumbnail_url);
                
                // Check for nested image objects
                if (menu.image && typeof menu.image === 'object') {
                    console.log(`[FeaturedCategories] Menu.image is object:`, JSON.stringify(menu.image, null, 2));
                    console.log(`[FeaturedCategories] Menu.image.url:`, menu.image.url);
                    console.log(`[FeaturedCategories] Menu.image.alt:`, menu.image.alt);
                }
                
                // Check for icon
                console.log(`[FeaturedCategories] Menu icon:`, menu.icon);
                
                // Check children
                if (menu.children && Array.isArray(menu.children)) {
                    console.log(`[FeaturedCategories] Menu has ${menu.children.length} children`);
                }
                
                console.log(`[FeaturedCategories] ===== END MENU ITEM ${index + 1} =====`);
            });

            this.menus = data;
            
            // Now try to get menu items with images (for the menu component approach)
            console.log('[FeaturedCategories] ===== STEP 2: Trying to get menu items with images =====');
            await this.fetchMenuItemsForImages();
            
            // Process and render
            this.processAndRender();
        } catch (error) {
            console.error('[FeaturedCategories] ERROR fetching menus:', error);
            console.error('[FeaturedCategories] Error stack:', error.stack);
            this.showError('Failed to fetch categories: ' + error.message);
        }
    }

    /**
     * Try to fetch menu items using menu component approach (for images)
     */
    async fetchMenuItemsForImages() {
        try {
            console.log('[FeaturedCategories] ===== Attempting to get menu items with images =====');
            
            // Try to access menu component if it exists in DOM
            const menuComponent = document.querySelector('custom-main-menu');
            if (menuComponent) {
                console.log('[FeaturedCategories] Found custom-main-menu component in DOM');
                console.log('[FeaturedCategories] Menu component:', menuComponent);
                console.log('[FeaturedCategories] Menu component menus:', menuComponent.menus);
                
                if (menuComponent.menus && Array.isArray(menuComponent.menus)) {
                    console.log('[FeaturedCategories] Found menus in menu component:', menuComponent.menus.length);
                    this.menuItems = menuComponent.menus;
                    
                    // Log menu items with images
                    menuComponent.menus.forEach((item, index) => {
                        console.log(`[FeaturedCategories] Menu Item ${index + 1} from component:`, JSON.stringify(item, null, 2));
                        console.log(`[FeaturedCategories] Menu Item ${index + 1} image:`, item.image);
                        console.log(`[FeaturedCategories] Menu Item ${index + 1} image_url:`, item.image_url);
                    });
                }
            } else {
                console.log('[FeaturedCategories] custom-main-menu component not found in DOM yet');
            }
            
            // Also try to get from salla.api.component.getMenuItems if available
            if (typeof salla.api.component.getMenuItems === 'function') {
                console.log('[FeaturedCategories] Trying salla.api.component.getMenuItems()...');
                const menuItemsResponse = await salla.api.component.getMenuItems();
                console.log('[FeaturedCategories] Menu items response:', menuItemsResponse);
                if (menuItemsResponse && menuItemsResponse.data) {
                    this.menuItems = menuItemsResponse.data;
                }
            }
        } catch (error) {
            console.warn('[FeaturedCategories] Could not fetch menu items for images:', error);
            // Not critical, we'll use fallback
        }
    }

    /**
     * Process categories and render
     */
    processAndRender() {
        console.log('[FeaturedCategories] ===== STEP 3: Processing categories =====');
        
        if (!this.menus || this.menus.length === 0) {
            console.warn('[FeaturedCategories] No menus to process');
            this.showError('No categories available');
            return;
        }

        // Get only root-level menu items (the main categories)
        const rootCategories = this.menus.filter(menu => {
            const isRoot = !menu.parent_id || menu.parent_id === 0 || menu.parent_id === null;
            console.log(`[FeaturedCategories] Menu "${menu.title || menu.name}" - parent_id: ${menu.parent_id}, isRoot: ${isRoot}`);
            return isRoot;
        });
        
        console.log('[FeaturedCategories] Found', rootCategories.length, 'root categories');
        
        if (rootCategories.length === 0) {
            console.warn('[FeaturedCategories] No root categories found. Showing all categories instead.');
            rootCategories.push(...this.menus);
        }
        
        // Limit to first 6 categories
        const categoriesToShow = rootCategories.slice(0, 6);
        console.log('[FeaturedCategories] Will display', categoriesToShow.length, 'categories');

        // Match categories with menu items to get images
        const categoriesWithImages = categoriesToShow.map(category => {
            console.log(`[FeaturedCategories] ===== Processing category: ${category.title || category.name} =====`);
            
            // Try to find matching menu item with image
            let imageUrl = null;
            
            // Method 1: Check if category itself has image
            if (category.image) {
                if (typeof category.image === 'string') {
                    imageUrl = category.image;
                    console.log(`[FeaturedCategories] Found image in category.image (string):`, imageUrl);
                } else if (typeof category.image === 'object' && category.image.url) {
                    imageUrl = category.image.url;
                    console.log(`[FeaturedCategories] Found image in category.image.url:`, imageUrl);
                }
            }
            
            // Method 2: Check other image properties
            if (!imageUrl && category.image_url) {
                imageUrl = category.image_url;
                console.log(`[FeaturedCategories] Found image in category.image_url:`, imageUrl);
            }
            
            if (!imageUrl && category.thumbnail) {
                imageUrl = category.thumbnail;
                console.log(`[FeaturedCategories] Found image in category.thumbnail:`, imageUrl);
            }
            
            if (!imageUrl && category.thumbnail_url) {
                imageUrl = category.thumbnail_url;
                console.log(`[FeaturedCategories] Found image in category.thumbnail_url:`, imageUrl);
            }
            
            // Method 3: Try to match with menu items (menu component approach)
            if (!imageUrl && this.menuItems && this.menuItems.length > 0) {
                const matchingMenuItem = this.menuItems.find(item => 
                    (item.id && item.id === category.id) ||
                    (item.title && item.title === category.title) ||
                    (item.name && item.name === category.name) ||
                    (item.url && item.url === category.url)
                );
                
                if (matchingMenuItem) {
                    console.log(`[FeaturedCategories] Found matching menu item:`, JSON.stringify(matchingMenuItem, null, 2));
                    
                    if (matchingMenuItem.image) {
                        if (typeof matchingMenuItem.image === 'string') {
                            imageUrl = matchingMenuItem.image;
                            console.log(`[FeaturedCategories] Found image in menu item.image (string):`, imageUrl);
                        } else if (typeof matchingMenuItem.image === 'object' && matchingMenuItem.image.url) {
                            imageUrl = matchingMenuItem.image.url;
                            console.log(`[FeaturedCategories] Found image in menu item.image.url:`, imageUrl);
                        }
                    }
                    
                    if (!imageUrl && matchingMenuItem.image_url) {
                        imageUrl = matchingMenuItem.image_url;
                        console.log(`[FeaturedCategories] Found image in menu item.image_url:`, imageUrl);
                    }
                } else {
                    console.log(`[FeaturedCategories] No matching menu item found for category: ${category.title || category.name}`);
                }
            }
            
            console.log(`[FeaturedCategories] Final image URL for "${category.title || category.name}":`, imageUrl || 'NOT FOUND - will use placeholder');
            
            return {
                id: category.id,
                name: category.title || category.name || 'Category',
                url: category.url || category.link || '#',
                image: imageUrl,
                parent_id: category.parent_id || 0
            };
        });

        this.categories = categoriesWithImages;
        console.log('[FeaturedCategories] ===== Final categories with images =====');
        console.log('[FeaturedCategories] Categories:', JSON.stringify(this.categories, null, 2));
        
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
        console.log('[FeaturedCategories] ===== STEP 4: Rendering categories =====');
        
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
                console.log(`[FeaturedCategories] ===== Rendering category ${index + 1}: ${category.name} =====`);
                console.log(`[FeaturedCategories] Category data:`, JSON.stringify(category, null, 2));
                
                const categoryItem = document.createElement('div');
                categoryItem.className = 'category-item';
                
                const categoryLink = document.createElement('a');
                categoryLink.href = category.url || '#';
                categoryLink.setAttribute('aria-label', category.name || 'Category');
                console.log(`[FeaturedCategories] Category ${index + 1} link URL:`, category.url);
                
                const categoryIcon = document.createElement('div');
                categoryIcon.className = 'category-icon';
                
                const categoryImage = document.createElement('img');
                
                // Use image from category, or fallback to placeholder
                const imageUrl = category.image || placeholderImage;
                
                console.log(`[FeaturedCategories] Category ${index + 1} image URL:`, imageUrl);
                console.log(`[FeaturedCategories] Category ${index + 1} using placeholder:`, !category.image);
                
                categoryImage.src = imageUrl;
                categoryImage.alt = category.name || 'Category';
                categoryImage.loading = 'lazy';
                
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
            } catch (error) {
                console.error(`[FeaturedCategories] ERROR rendering category ${index + 1}:`, error);
                console.error('[FeaturedCategories] Error stack:', error.stack);
            }
        });

        this.isRendered = true;
        console.log('[FeaturedCategories] ===== Render complete! Total categories displayed:', this.categories.length);
        console.log('[FeaturedCategories] ===== END OF COMPONENT =====');
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
