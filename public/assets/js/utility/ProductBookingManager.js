/**
 * ProductBookingManager Class
 * Handles creating product booking cards, managing the details view,
 * filtering/searching bookings, and client-side pagination
 */
class ProductBookingManager {
    constructor(options = {}) {
        // Default configuration
        this.config = {
            bookingsEndpoint: '/api/user/product-bookings',
            containerSelector: '#bookings',
            bookingDetailSelector: '#booking-detail-view', // New selector for the booking detail view
            filterFormId: 'booking-filters',
            searchInputId: 'booking-search',
            dateFilterId: 'booking-date-filter',
            statusFilterId: 'booking-status-filter',
            cardTemplate: this.getDefaultCardTemplate(),
            itemsPerPage: 10,
            paginationContainerSelector: '#bookings-pagination-container',
            ...options
        };

        // Initialize booking detail view elements references
        this.detailView = {
            element: null, // Will be initialized in init()
            bookingId: null,
            productName: null,
            productImage: null,
            variant: null,
            quantity: null,
            unitPrice: null,
            totalAmount: null,
            status: null,
            bookingDate: null,
            preferredDate: null,
            preferredTime: null,
            address: null,
            description: null // Additional Instructions field
        };

        // Container for booking cards
        this.container = null;
        this.detailContainer = null;

        // Store all bookings for filtering
        this.allBookings = [];
        this.filteredBookings = [];

        // Pagination state
        this.currentPage = 1;
        this.itemsPerPage = this.config.itemsPerPage;

        // Current selected booking
        this.currentBookingId = null;
    }

    /**
     * Initialize the ProductBookingManager
     */
    init() {
        // Get container element
        this.container = document.querySelector(this.config.containerSelector);
        if (!this.container) {
            console.error(`Container element not found: ${this.config.containerSelector}`);
            return;
        }

        // Get detail view container
        this.detailContainer = document.querySelector(this.config.bookingDetailSelector);
        if (!this.detailContainer) {
            console.warn(`Detail view container not found: ${this.config.bookingDetailSelector}`);
            // Create it if it doesn't exist
            this.detailContainer = document.createElement('div');
            this.detailContainer.id = this.config.bookingDetailSelector.substring(1);
            this.detailContainer.className = 'booking-detail-view';
            this.detailContainer.style.display = 'none';
            
            // Insert after container
            if (this.container.parentNode) {
                this.container.parentNode.insertBefore(this.detailContainer, this.container.nextSibling);
            }
        }

        // Create the detail view structure
        this.createDetailViewStructure();

        // Initialize detail view controls
        this.initDetailViewControls();

        // Initialize filter and search
        this.initFilterAndSearch();

        // Fetch and render bookings
        this.fetchAndRenderBookings();
    }

    /**
     * Create the detail view structure
     */
    createDetailViewStructure() {
        this.detailContainer.innerHTML = `
            <div class="booking-detail card shadow-sm mb-4">
                <div class="card-header bg-white py-3">
                    <div class="d-flex justify-content-between align-items-center">
                        <button id="back-to-bookings" class="btn btn-outline-primary">
                            <i class="fas fa-arrow-left me-2"></i>Back to Bookings
                        </button>
                        <h5 class="mb-0 fw-bold">Booking <span id="detail-booking-id" class="text-primary"></span></h5>
                    </div>
                </div>
                <div class="card-body p-0">
                    <div class="row g-0">
                        <!-- Product Image Column -->
                        <div class="col-lg-4 bg-light">
                            <div class="p-4 h-100 d-flex flex-column">
                                <div class="text-center py-4 mb-3 flex-grow-1">
                                    <img id="detail-product-image" src="" alt="Product" class="img-fluid rounded" style="max-height: 250px;">
                                </div>
                                <div class="bg-white rounded p-3 shadow-sm">
                                    <h5 id="detail-product-name" class="fw-bold mb-2"></h5>
                                    <p class="mb-1">Variant: <span id="detail-variant" class="badge bg-secondary rounded-pill"></span></p>
                                    <p class="mb-1">Quantity: <span id="detail-quantity" class="fw-medium"></span></p>
                                    <p class="mb-1">Status: <span id="detail-status" class="badge rounded-pill"></span></p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Booking Details Column -->
                        <div class="col-lg-8">
                            <div class="p-4">
                                <div class="row mb-4">
                                    <div class="col-md-6">
                                        <h6 class="text-muted mb-1">Booking Date</h6>
                                        <p id="detail-booking-date" class="fw-medium"></p>
                                    </div>
                                    <div class="col-md-6">
                                        <h6 class="text-muted mb-1">Total Amount</h6>
                                        <p id="detail-total-amount" class="fw-bold fs-4 text-primary"></p>
                                    </div>
                                </div>
                                
                                <hr class="my-4">
                                
                                <div class="row mb-4">
                                    <div class="col-md-6">
                                        <h6 class="text-muted mb-1">Preferred Date</h6>
                                        <p id="detail-preferred-date" class="fw-medium"></p>
                                    </div>
                                    <div class="col-md-6">
                                        <h6 class="text-muted mb-1">Preferred Time</h6>
                                        <p id="detail-preferred-time" class="fw-medium"></p>
                                    </div>
                                </div>
                                
                                <div class="mb-4">
                                    <h6 class="text-muted mb-1">Delivery Address</h6>
                                    <p id="detail-delivery-address" class="fw-medium"></p>
                                </div>
                                
                                <div class="mb-4">
                                    <h6 class="text-muted mb-1">Additional Instructions</h6>
                                    <p id="detail-description" class="text-muted"></p>
                                </div>
                                
                                <!-- Unit price -->
                                <div class="row mb-4">
                                    <div class="col-md-6">
                                        <h6 class="text-muted mb-1">Unit Price</h6>
                                        <p id="detail-unit-price" class="fw-medium"></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Initialize detail view element references
        this.detailView.element = this.detailContainer;
        this.detailView.bookingId = document.getElementById('detail-booking-id');
        this.detailView.productName = document.getElementById('detail-product-name');
        this.detailView.productImage = document.getElementById('detail-product-image');
        this.detailView.variant = document.getElementById('detail-variant');
        this.detailView.quantity = document.getElementById('detail-quantity');
        this.detailView.unitPrice = document.getElementById('detail-unit-price');
        this.detailView.totalAmount = document.getElementById('detail-total-amount');
        this.detailView.status = document.getElementById('detail-status');
        this.detailView.bookingDate = document.getElementById('detail-booking-date');
        this.detailView.preferredDate = document.getElementById('detail-preferred-date');
        this.detailView.preferredTime = document.getElementById('detail-preferred-time');
        this.detailView.address = document.getElementById('detail-delivery-address');
        this.detailView.description = document.getElementById('detail-description');
        
        // Hide the detail view initially
        this.detailContainer.style.display = 'none';
    }

    /**
     * Default card template for product bookings
     */
    getDefaultCardTemplate() {
        return (booking) => {
            // Handle both upper and lowercase field names from API
            const id = booking.PB_ID || booking.pb_id;
            const bookingDate = booking.PB_ORDER_DATE || booking.pb_order_date;
            const productName = booking.PROD_NAME || booking.prod_name || 'Unknown Product';
            const rawProductImage = booking.PROD_IMAGE || booking.prod_image || '/assets/images/product-placeholder.jpg';

            // Fix image path by ensuring it has the correct prefix
            const productImage = this.fixImagePath(rawProductImage);

            const variantCapacity = booking.VAR_CAPACITY || booking.var_capacity || 'N/A';
            const totalAmount = booking.PB_TOTAL_AMOUNT || booking.pb_total_amount || 0;
            const status = booking.PB_STATUS || booking.pb_status || 'pending';
            const preferredDate = booking.PB_PREFERRED_DATE || booking.pb_preferred_date;

            return `
                <div class="booking-item card shadow-sm mb-3">
                    <div class="card-body d-flex align-items-center p-4">
                        <img src="${productImage}" alt="${productName}" class="me-4 rounded" width="100" height="100">
                        <div class="flex-grow-1">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <p class="text-muted mb-1">PB-${id} <span class="text-muted">${new Date(bookingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></p>
                                    <h5 class="fw-bold mb-1">${productName}</h5>
                                    <p class="text-muted mb-0">Variant: ${variantCapacity}</p>
                                    ${status === 'completed' && totalAmount && parseFloat(totalAmount) !== 0 ?
                    `<p class="fw-bold text-dark mb-0">₱${parseFloat(totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>` :
                    ''}
                                </div>
                                <div class="text-end">
                                    <p class="text-muted mb-1">Preferred Date: ${new Date(preferredDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                    <span class="badge bg-${this.getStatusBadgeClass(status)}-subtle text-${this.getStatusBadgeClass(status)}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>
                                    <div class="mt-2">
                                        <button class="btn btn-primary view-product-details" data-booking-id="${id}">View Details</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        };
    }

    /**
     * Helper method to fix image paths
     */
    fixImagePath(path) {
        if (!path) return '/assets/images/product-placeholder.jpg';

        // If path already starts with http/https or /, return as is
        if (path.startsWith('http') || path.startsWith('/')) {
            return path;
        }

        // Otherwise, prepend /
        return '/' + path;
    }

    /**
     * Get badge class based on status
     */
    getStatusBadgeClass(status) {
        switch (status.toLowerCase()) {
            case 'pending': return 'warning';
            case 'confirmed': return 'primary';
            case 'in-progress': return 'primary';
            case 'completed': return 'success';
            case 'cancelled': return 'danger';
            default: return 'secondary';
        }
    }

    /**
     * Initialize controls for the detail view
     */
    initDetailViewControls() {
        // Add event listener to all "View Details" buttons using event delegation
        document.addEventListener('click', (e) => {
            // Check if the clicked element or its parent is a "view-product-details" button 
            const viewDetailsButton = e.target.closest('.view-product-details');

            if (viewDetailsButton) {
                const bookingId = viewDetailsButton.getAttribute('data-booking-id');
                if (bookingId) {
                    this.openBookingDetail(bookingId);
                }
            }
            
            // Handle back button click
            if (e.target.closest('#back-to-bookings')) {
                this.showBookingsList();
            }
        });
    }

    /**
     * Show the bookings list view
     */
    showBookingsList() {
        // Show the bookings list and hide the detail view
        if (this.container) this.container.style.display = 'block';
        if (this.detailContainer) this.detailContainer.style.display = 'none';
        
        // Update browser history to reflect the list view
        if (history.pushState) {
            const newUrl = window.location.pathname;
            window.history.pushState({path: newUrl}, '', newUrl);
        }
    }

    /**
     * Initialize filter and search functionality
     */
    initFilterAndSearch() {
        // Get filter form, search input, and filter selects
        this.filterForm = document.getElementById(this.config.filterFormId);
        this.searchInput = document.getElementById(this.config.searchInputId);
        this.dateFilter = document.getElementById(this.config.dateFilterId);
        this.statusFilter = document.getElementById(this.config.statusFilterId);

        // Add event listeners for filter changes
        if (this.filterForm) {
            this.filterForm.addEventListener('change', () => this.applyFilters());
            this.filterForm.addEventListener('reset', () => {
                setTimeout(() => this.applyFilters(), 10);
            });
        }

        // Add event listener for search input
        if (this.searchInput) {
            let searchTimeout;
            this.searchInput.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => this.applyFilters(), 300);
            });
        }
    }

    /**
     * Apply all active filters and search
     */
    applyFilters() {
        if (!this.allBookings.length) return;

        this.filteredBookings = [...this.allBookings];

        // Apply date range filter
        if (this.dateFilter && this.dateFilter.value) {
            const now = new Date();
            let startDate;

            switch (this.dateFilter.value) {
                case 'Last 30 days':
                    startDate = new Date();
                    startDate.setDate(now.getDate() - 30);
                    break;
                case 'Last 60 days':
                    startDate = new Date();
                    startDate.setDate(now.getDate() - 60);
                    break;
                case 'Last 90 days':
                    startDate = new Date();
                    startDate.setDate(now.getDate() - 90);
                    break;
                case 'All time':
                default:
                    startDate = null;
            }

            if (startDate) {
                this.filteredBookings = this.filteredBookings.filter(booking => {
                    const dateField = booking.PB_ORDER_DATE || booking.pb_order_date;
                    return new Date(dateField) >= startDate;
                });
            }
        }

        // Apply status filter
        if (this.statusFilter && this.statusFilter.value && this.statusFilter.value !== 'All Status') {
            this.filteredBookings = this.filteredBookings.filter(booking => {
                const status = booking.PB_STATUS || booking.pb_status || '';
                return status.toLowerCase() === this.statusFilter.value.toLowerCase();
            });
        }

        // Apply search filter
        if (this.searchInput && this.searchInput.value.trim() !== '') {
            const searchTerm = this.searchInput.value.trim().toLowerCase();
            this.filteredBookings = this.filteredBookings.filter(booking => {
                const productName = booking.PROD_NAME || booking.prod_name || '';
                const variantCapacity = booking.VAR_CAPACITY || booking.var_capacity || '';
                const id = booking.PB_ID || booking.pb_id || '';

                return productName.toLowerCase().includes(searchTerm) ||
                    variantCapacity.toLowerCase().includes(searchTerm) ||
                    `PB-${id}`.toLowerCase().includes(searchTerm);
            });
        }

        // Reset to first page when filters change
        this.currentPage = 1;

        // Render filtered bookings with pagination
        this.renderBookings(this.filteredBookings);

        // Update results count if element exists
        const resultsCountElement = document.getElementById('booking-results-count');
        if (resultsCountElement) {
            resultsCountElement.textContent = `${this.filteredBookings.length} bookings found`;
        }
    }

    /**
     * Fetch bookings from API and render them
     */
    async fetchAndRenderBookings() {
        try {
            console.log('Fetching bookings from:', this.config.bookingsEndpoint);

            const response = await axios.get(this.config.bookingsEndpoint);
            console.log('Bookings API response:', response.data);

            // Check for success response structure with data field
            let bookings = [];
            if (response.data && response.data.success && Array.isArray(response.data.data)) {
                bookings = response.data.data;
            } else if (Array.isArray(response.data)) {
                bookings = response.data;
            }

            console.log('Processed bookings:', bookings);

            if (bookings.length > 0) {
                // Debug booking IDs
                console.log('Booking IDs:', bookings.map(b => b.PB_ID || b.pb_id));

                // Store all bookings for filtering
                this.allBookings = bookings;
                this.filteredBookings = [...bookings];

                // Render first page of bookings
                this.renderBookings(this.filteredBookings);
                
                // Check if URL has a booking ID to display
                const urlParams = new URLSearchParams(window.location.search);
                const bookingId = urlParams.get('bookingId');
                if (bookingId) {
                    this.openBookingDetail(bookingId);
                }
            } else {
                console.warn('No bookings found or invalid data format');
                if (this.container) {
                    this.container.innerHTML = '<div class="col-12"><p class="text-center">No bookings available.</p></div>';
                }
                this.renderPagination(0);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            if (this.container) {
                this.container.innerHTML = '<div class="col-12"><p class="text-center text-danger">Failed to load bookings. Please try again later.</p></div>';
            }
            this.renderPagination(0);
        }
    }

    /**
     * Render booking cards with pagination
     */
    renderBookings(bookings) {
        if (!this.container) return;

        if (bookings.length === 0) {
            this.container.innerHTML = '<div class="col-12"><p class="text-center">No bookings match your filters. Try different criteria.</p></div>';
            this.renderPagination(0);
            return;
        }

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedBookings = bookings.slice(startIndex, endIndex);

        let html = '';
        paginatedBookings.forEach(booking => {
            html += this.config.cardTemplate(booking);
        });

        this.container.innerHTML = html;

        this.renderPagination(bookings.length);
    }

    /**
     * Render pagination controls
     */
    renderPagination(totalItems) {
        const paginationContainer = document.querySelector(this.config.paginationContainerSelector);
        if (!paginationContainer) return;

        const totalPages = Math.ceil(totalItems / this.itemsPerPage);

        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let paginationHTML = `
            <nav aria-label="Booking pagination">
                <ul class="pagination">
                    <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                        <a class="page-link" href="#" data-page="prev"><i class="fas fa-chevron-left"></i></a>
                    </li>
        `;

        // Calculate visible page range
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = startPage + maxVisiblePages - 1;

        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // Add first page and ellipsis if needed
        if (startPage > 1) {
            paginationHTML += `
                <li class="page-item">
                    <a class="page-link" href="#" data-page="1">1</a>
                </li>
            `;

            if (startPage > 2) {
                paginationHTML += `
                    <li class="page-item disabled">
                        <a class="page-link" href="#">...</a>
                    </li>
                `;
            }
        }

        // Add page numbers
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <li class="page-item ${this.currentPage === i ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }

        // Add last page and ellipsis if needed
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += `
                    <li class="page-item disabled">
                        <a class="page-link" href="#">...</a>
                    </li>
                `;
            }

            paginationHTML += `
                <li class="page-item">
                    <a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a>
                </li>
            `;
        }

        paginationHTML += `
                    <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                        <a class="page-link" href="#" data-page="next"><i class="fas fa-chevron-right"></i></a>
                    </li>
                </ul>
            </nav>
        `;

        paginationContainer.innerHTML = paginationHTML;

        this.initPaginationControls();
    }

    /**
     * Initialize pagination controls
     */
    initPaginationControls() {
        const paginationContainer = document.querySelector(this.config.paginationContainerSelector);
        if (!paginationContainer) return;

        const paginationLinks = paginationContainer.querySelectorAll('.page-link');

        paginationLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();

                // Get the data-page attribute from the clicked element or its parent
                let pageAction;

                if (e.target.hasAttribute('data-page')) {
                    pageAction = e.target.getAttribute('data-page');
                } else if (e.target.parentElement.hasAttribute('data-page')) {
                    pageAction = e.target.parentElement.getAttribute('data-page');
                }

                if (pageAction) {
                    this.handlePageChange(pageAction);
                }
            });
        });
    }

    /**
     * Handle page change
     */
    handlePageChange(pageAction) {
        const totalPages = Math.ceil(this.filteredBookings.length / this.itemsPerPage);

        if (pageAction === 'prev' && this.currentPage > 1) {
            this.currentPage--;
        } else if (pageAction === 'next' && this.currentPage < totalPages) {
            this.currentPage++;
        } else if (!isNaN(pageAction)) {
            const pageNum = parseInt(pageAction);
            if (pageNum >= 1 && pageNum <= totalPages) {
                this.currentPage = pageNum;
            }
        }

        this.renderBookings(this.filteredBookings);
    }

    /**
     * Open booking detail view with details
     */
    async openBookingDetail(bookingId) {
        try {
            // Debug: Log the URL being called
            const url = `${this.config.bookingsEndpoint}/${bookingId}`;
            console.log('Fetching booking details from:', url);

            const response = await axios.get(url);

            // Debug: Log the response
            console.log('API Response:', response.data);

            // Handle different API response formats
            let booking;
            if (response.data && response.data.success && response.data.data) {
                booking = response.data.data;
            } else {
                booking = response.data;
            }

            if (!booking || (Array.isArray(booking) && booking.length === 0)) {
                console.error('No booking data returned from API');
                alert('Booking details could not be loaded. The booking may not exist.');
                return;
            }

            console.log('Processed booking data:', booking);
            this.currentBooking = booking;
            this.populateDetailView(booking);

            // Hide the list view and show the detail view
            if (this.container) this.container.style.display = 'none';
            if (this.detailContainer) this.detailContainer.style.display = 'block';
            
            // Update URL to include booking ID
            if (history.pushState) {
                const newUrl = `${window.location.pathname}?bookingId=${bookingId}`;
                window.history.pushState({path: newUrl}, '', newUrl);
            }
            
            // Scroll to top
            window.scrollTo(0, 0);
            
            // Store current booking ID
            this.currentBookingId = bookingId;
        } catch (error) {
            console.error('Error fetching booking details:', error);

            // Provide more specific error information
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);

                if (error.response.status === 404) {
                    alert('Booking not found. The booking may have been deleted or you do not have permission to view it.');
                } else {
                    alert(`Failed to load booking details. Server error: ${error.response.status}`);
                }
            } else if (error.request) {
                console.error('Request made but no response received');
                alert('Failed to load booking details. No response from server.');
            } else {
                alert(`Failed to load booking details: ${error.message}`);
            }
        }
    }

    /**
     * Populate detail view with booking details
     */
    populateDetailView(booking) {
        if (!booking) return;

        // Normalize field names (handle both upper and lowercase)
        const bookingData = {
            id: booking.PB_ID || booking.pb_id,
            variantId: booking.PB_VARIANT_ID || booking.pb_variant_id,
            quantity: booking.PB_QUANTITY || booking.pb_quantity,
            unitPrice: booking.PB_UNIT_PRICE || booking.pb_unit_price,
            totalAmount: booking.PB_TOTAL_AMOUNT || booking.pb_total_amount,
            status: booking.PB_STATUS || booking.pb_status,
            bookingDate: booking.PB_ORDER_DATE || booking.pb_order_date,
            preferredDate: booking.PB_PREFERRED_DATE || booking.pb_preferred_date,
            preferredTime: booking.PB_PREFERRED_TIME || booking.pb_preferred_time,
            address: booking.PB_ADDRESS || booking.pb_address,
            description: booking.PB_DESCRIPTION || booking.pb_description,
            productName: booking.PROD_NAME || booking.prod_name,
            productImage: booking.PROD_IMAGE || booking.prod_image,
            variantCapacity: booking.VAR_CAPACITY || booking.var_capacity
        };

        // Check if detailView elements exist before updating them
        if (this.detailView.bookingId) {
            this.detailView.bookingId.textContent = `PB-${bookingData.id}`;
        }

        if (this.detailView.productName) {
            this.detailView.productName.textContent = bookingData.productName || 'N/A';
        }

        if (this.detailView.productImage) {
            // Fix image path
            this.detailView.productImage.src = this.fixImagePath(bookingData.productImage);
            this.detailView.productImage.alt = bookingData.productName || 'Product Image';
        }

        if (this.detailView.variant) {
            this.detailView.variant.textContent = bookingData.variantCapacity || 'N/A';
        }

        if (this.detailView.quantity) {
            this.detailView.quantity.textContent = bookingData.quantity;
        }

        if (this.detailView.unitPrice) {
            this.detailView.unitPrice.textContent = bookingData.status === 'completed' && bookingData.unitPrice && parseFloat(bookingData.unitPrice) !== 0
                ? `₱${parseFloat(bookingData.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : 'Price pending';
        }

        if (this.detailView.totalAmount) {
            this.detailView.totalAmount.textContent = bookingData.status === 'completed' && bookingData.totalAmount && parseFloat(bookingData.totalAmount) !== 0
                ? `₱${parseFloat(bookingData.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : 'Price pending';
        }

        if (this.detailView.status) {
            const statusText = bookingData.status.charAt(0).toUpperCase() + bookingData.status.slice(1);
            this.detailView.status.textContent = statusText;

            // Add appropriate status class
            this.detailView.status.className = 'badge rounded-pill'; // Clear existing classes
            const statusClass = this.getStatusBadgeClass(bookingData.status);
            this.detailView.status.classList.add(`bg-${statusClass}`);
        }

        if (this.detailView.bookingDate) {
            this.detailView.bookingDate.textContent = new Date(bookingData.bookingDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }

        if (this.detailView.preferredDate) {
            this.detailView.preferredDate.textContent = new Date(bookingData.preferredDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }

        if (this.detailView.preferredTime) {
            // Format time from HH:MM:SS to HH:MM AM/PM
            let timeText = 'N/A';
            if (bookingData.preferredTime) {
                const timeParts = bookingData.preferredTime.split(':');
                if (timeParts.length >= 2) {
                    const hours = parseInt(timeParts[0]);
                    const minutes = timeParts[1];
                    const period = hours >= 12 ? 'PM' : 'AM';
                    const displayHours = hours % 12 || 12;
                    timeText = `${displayHours}:${minutes} ${period}`;
                }
            }
            this.detailView.preferredTime.textContent = timeText;
        }

        if (this.detailView.address) {
            this.detailView.address.textContent = bookingData.address || 'N/A';
        }

        if (this.detailView.description) {
            this.detailView.description.textContent = bookingData.description || 'No additional instructions provided';
        }
    }
}