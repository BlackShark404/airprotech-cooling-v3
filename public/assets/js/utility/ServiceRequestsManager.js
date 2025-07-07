/**
 * ServiceRequestsManager Class
 * Handles creating service request cards, managing the details view,
 * filtering/searching service requests, and client-side pagination
 */
class ServiceRequestsManager {
    constructor(options = {}) {
        // Default configuration
        this.config = {
            serviceRequestsEndpoint: '/api/user/service-bookings',
            containerSelector: '#service-requests-list-container',
            detailViewSelector: '#service-detail-view', // Changed from modalId to detailViewSelector
            filterFormId: 'service-request-filters',
            searchInputId: 'service-request-search',
            dateFilterId: 'date-filter',
            statusFilterId: 'status-filter',
            itemsPerPage: 5,
            paginationContainerSelector: '#services-pagination-container',
            ...options
        };

        // Set card template after configuration is complete
        this.config.cardTemplate = this.config.cardTemplate || this.getDefaultCardTemplate();

        // Initialize detail view elements references
        this.detailView = {
            element: null, // Will be initialized in init() or createDetailViewStructure()
            serviceId: null,
            serviceName: null,
            serviceDescription: null,
            requestedDate: null,
            requestedTime: null,
            address: null,
            status: null,
            estimatedCost: null,
            priority: null,
            notes: null,
            statusBadge: null,
            serviceIcon: null
        };

        // Container for service request cards
        this.container = document.querySelector(this.config.containerSelector);

        // Detail view container
        this.detailContainer = document.querySelector(this.config.detailViewSelector);

        // Store all service requests for filtering
        this.allServiceRequests = [];
        this.filteredServiceRequests = [];

        // Pagination state
        this.currentPage = 1;
        this.itemsPerPage = this.config.itemsPerPage;

        // Current selected service
        this.currentServiceId = null;

        // Initialize the detail view
        this.init();
    }

    /**
     * Initialize the ServiceRequestsManager
     */
    init() {
        // Ensure container exists
        if (!this.container) {
            console.error(`Container element not found: ${this.config.containerSelector}`);
            return;
        }

        // Get detail view container
        if (!this.detailContainer) {
            console.warn(`Detail view container not found: ${this.config.detailViewSelector}`);
            // Create it if it doesn't exist
            this.detailContainer = document.createElement('div');
            this.detailContainer.id = this.config.detailViewSelector.substring(1);
            this.detailContainer.className = 'service-detail-view';
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
    }

    /**
     * Create the detail view structure
     */
    createDetailViewStructure() {
        this.detailContainer.innerHTML = `
            <div class="service-detail card shadow-sm mb-4">
                <div class="card-header bg-white py-3">
                    <div class="d-flex justify-content-between align-items-center">
                        <button id="back-to-services" class="btn btn-outline-danger">
                            <i class="fas fa-arrow-left me-2"></i>Back to Service Requests
                        </button>
                        <h5 class="mb-0 fw-bold">Service Request <span id="detail-service-id" class="text-danger"></span></h5>
                    </div>
                </div>
                <div class="card-body p-0">
                    <div class="p-4">
                        <div class="d-flex justify-content-between align-items-start mb-4">
                            <div class="d-flex align-items-center">
                                <div id="detail-service-icon" class="service-icon me-3"></div>
                                <h4 id="detail-service-name" class="fs-4 fw-bold text-primary mb-0"></h4>
                            </div>
                            <span id="detail-status-badge" class="badge rounded-pill px-3 py-2"></span>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="card shadow-sm mb-3">
                                    <div class="card-header bg-light">
                                        <h6 class="mb-0"><i class="fas fa-info-circle me-2"></i>Service Information</h6>
                                    </div>
                                    <div class="card-body">
                                        <p class="mb-2"><strong>Service Type:</strong> <span id="detail-service-description"></span></p>
                                        <p class="mb-2"><strong>Estimated Cost:</strong> <span id="detail-estimated-cost" class="fw-bold"></span></p>
                                        <p class="mb-0"><strong>Priority:</strong> <span id="detail-priority"></span></p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="card shadow-sm mb-3">
                                    <div class="card-header bg-light">
                                        <h6 class="mb-0"><i class="fas fa-calendar-alt me-2"></i>Schedule Details</h6>
                                    </div>
                                    <div class="card-body">
                                        <p class="mb-2"><strong>Preferred Date:</strong> <span id="detail-requested-date"></span></p>
                                        <p class="mb-2"><strong>Preferred Time:</strong> <span id="detail-requested-time"></span></p>
                                        <p class="mb-0"><strong>Service Address:</strong> <span id="detail-address"></span></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="card shadow-sm">
                            <div class="card-header bg-light">
                                <h6 class="mb-0"><i class="fas fa-clipboard-list me-2"></i>Request Details</h6>
                            </div>
                            <div class="card-body">
                                <p id="detail-notes" style="white-space: pre-wrap;"></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Initialize detail view element references
        this.detailView.element = this.detailContainer;
        this.detailView.serviceId = document.getElementById('detail-service-id');
        this.detailView.serviceName = document.getElementById('detail-service-name');
        this.detailView.serviceDescription = document.getElementById('detail-service-description');
        this.detailView.requestedDate = document.getElementById('detail-requested-date');
        this.detailView.requestedTime = document.getElementById('detail-requested-time');
        this.detailView.address = document.getElementById('detail-address');
        this.detailView.estimatedCost = document.getElementById('detail-estimated-cost');
        this.detailView.priority = document.getElementById('detail-priority');
        this.detailView.notes = document.getElementById('detail-notes');
        this.detailView.statusBadge = document.getElementById('detail-status-badge');
        this.detailView.serviceIcon = document.getElementById('detail-service-icon');
        
        // Hide the detail view initially
        this.detailContainer.style.display = 'none';
    }

    /**
     * Map service type codes to Font Awesome icons
     */
    getServiceIcon(serviceTypeCode) {
        const iconMap = {
            'checkup-repair': 'fas fa-tools fa-lg',
            'installation': 'fas fa-plug fa-lg',
            'ducting': 'fas fa-wind fa-lg',
            'cleaning-pms': 'fas fa-broom fa-lg',
            'survey-estimation': 'fas fa-search fa-lg',
            'project-quotations': 'fas fa-file-invoice-dollar fa-lg'
        };
        return iconMap[serviceTypeCode] || 'fas fa-cog fa-lg'; // Fallback icon
    }

    /**
     * Default card template for service requests
     */
    getDefaultCardTemplate() {
        return (service) => `
            <div class="booking-item card shadow-sm mb-3">
                <div class="card-body d-flex align-items-center p-4">
                    <div class="service-icon me-4">
                        <i class="${this.getServiceIcon(service.ST_CODE)}"></i>
                    </div>
                    <div class="flex-grow-1">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <p class="text-muted mb-1">SRV-${service.SB_ID} <span class="text-muted">${new Date(service.SB_CREATED_AT).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></p>
                                <h5 class="fw-bold mb-1">${service.ST_NAME}</h5>
                                <p class="text-muted mb-0">Service: ${service.ST_DESCRIPTION || 'N/A'}</p>
                                ${service.SB_STATUS === 'completed' && service.SB_ESTIMATED_COST && parseFloat(service.SB_ESTIMATED_COST) !== 0
                ? `<p class="fw-bold text-dark mb-0">Cost: ₱${parseFloat(service.SB_ESTIMATED_COST).toFixed(2)}</p>`
                : ''}
                            </div>
                            <div class="text-end">
                                <p class="text-muted mb-1">Requested on: ${new Date(service.SB_CREATED_AT).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                <span class="badge bg-${this.getStatusBadgeClass(service.SB_STATUS)}-subtle text-${this.getStatusBadgeClass(service.SB_STATUS)}">${service.SB_STATUS ? service.SB_STATUS.charAt(0).toUpperCase() + service.SB_STATUS.slice(1) : 'Unknown'}</span>
                                <div class="mt-2">
                                    <button class="btn btn-danger view-service-details" data-service-id="${service.SB_ID}">View Details</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get badge class based on status
     */
    getStatusBadgeClass(status) {
        if (!status) return 'secondary';

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
            // Check if the clicked element or its parent is a "view-service-details" button
            const viewDetailsButton = e.target.closest('.view-service-details');
            if (viewDetailsButton) {
                const serviceId = viewDetailsButton.getAttribute('data-service-id');
                if (serviceId) {
                    this.openServiceDetail(serviceId);
                }
            }
            
            // Handle back button click
            if (e.target.closest('#back-to-services')) {
                this.showServicesList();
            }
        });
    }

    /**
     * Show the services list view
     */
    showServicesList() {
        // Show the services list and hide the detail view
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
                // Use a short timeout to allow form elements to reset before applying filters
                setTimeout(() => this.applyFilters(), 10);
            });
        }

        // Add event listener for search input
        if (this.searchInput) {
            let searchTimeout;
            this.searchInput.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => this.applyFilters(), 300); // Debounce search
            });
        }
    }

    /**
     * Fetch service requests from the API and render them
     */
    fetchAndRenderServiceRequests() {
        // Show loading state
        if (this.container) {
            this.container.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"></div><p class="mt-2">Loading service requests...</p></div>';
        }

        // Fetch service requests from the API
        axios.get(this.config.serviceRequestsEndpoint)
            .then(response => {
                if (response.data && response.data.success) {
                    this.allServiceRequests = response.data.data || [];
                    this.filteredServiceRequests = [...this.allServiceRequests];
                    this.renderServiceRequests();

                    // Update results count
                    const resultsCountElement = document.getElementById('service-results-count');
                    if (resultsCountElement) {
                        resultsCountElement.textContent = `Showing ${this.filteredServiceRequests.length} of ${this.allServiceRequests.length} service requests`;
                    }
                    
                    // Check if URL has a service ID to display
                    const urlParams = new URLSearchParams(window.location.search);
                    const serviceId = urlParams.get('serviceId');
                    if (serviceId) {
                        this.openServiceDetail(serviceId);
                    }
                } else {
                    this.handleError('Failed to load service requests');
                }
            })
            .catch(error => {
                console.error('Error fetching service requests:', error);
                this.handleError('Error loading service requests. Please try again later.');
            });
    }

    /**
     * Render service requests with pagination
     */
    renderServiceRequests() {
        if (!this.container) return;

        // Calculate pagination
        const totalPages = Math.ceil(this.filteredServiceRequests.length / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const currentPageItems = this.filteredServiceRequests.slice(startIndex, endIndex);

        // Clear container
        this.container.innerHTML = '';

        // Check if there are any service requests to display
        if (currentPageItems.length === 0) {
            this.container.innerHTML = '<div class="alert alert-info text-center">No service requests found matching your criteria.</div>';
            this.renderPagination(totalPages);
            return;
        }

        // Render service request cards
        currentPageItems.forEach(service => {
            const cardHtml = this.config.cardTemplate(service);
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = cardHtml;
            this.container.appendChild(tempDiv.firstElementChild);
        });

        // Render pagination
        this.renderPagination(totalPages);
    }

    /**
     * Render pagination controls
     */
    renderPagination(totalPages) {
        const paginationContainer = document.querySelector(this.config.paginationContainerSelector);
        if (!paginationContainer) return;

        // Clear pagination container
        paginationContainer.innerHTML = '';

        // Don't show pagination if there's only one page
        if (totalPages <= 1) return;

        // Create pagination nav
        const nav = document.createElement('nav');
        nav.setAttribute('aria-label', 'Service requests pagination');
        const ul = document.createElement('ul');
        ul.className = 'pagination';

        // Previous button
        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${this.currentPage === 1 ? 'disabled' : ''}`;
        const prevLink = document.createElement('a');
        prevLink.className = 'page-link';
        prevLink.href = '#';
        prevLink.setAttribute('aria-label', 'Previous');
        prevLink.innerHTML = '<span aria-hidden="true">&laquo;</span>';
        prevLink.setAttribute('data-page', 'prev');
        prevLi.appendChild(prevLink);
        ul.appendChild(prevLi);

        // Page numbers
        const maxPagesToShow = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        // Adjust if we're near the end
        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === this.currentPage ? 'active' : ''}`;
            const link = document.createElement('a');
            link.className = 'page-link';
            link.href = '#';
            link.textContent = i;
            link.setAttribute('data-page', i);
            li.appendChild(link);
            ul.appendChild(li);
        }

        // Next button
        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${this.currentPage === totalPages ? 'disabled' : ''}`;
        const nextLink = document.createElement('a');
        nextLink.className = 'page-link';
        nextLink.href = '#';
        nextLink.setAttribute('aria-label', 'Next');
        nextLink.innerHTML = '<span aria-hidden="true">&raquo;</span>';
        nextLink.setAttribute('data-page', 'next');
        nextLi.appendChild(nextLink);
        ul.appendChild(nextLi);

        nav.appendChild(ul);
        paginationContainer.appendChild(nav);
        
        // Initialize pagination controls
        this.initPaginationControls();
    }

    /**
     * Open the service request detail view
     */
    openServiceDetail(serviceId) {
        try {
            // Find the service request in our existing list.
            // serviceId is a string from data-attribute, SB_ID might be a number or string.
            // Using '==' for comparison handles type coercion (e.g., 123 == "123" is true).
            const service = this.allServiceRequests.find(s => s.SB_ID == serviceId);

            if (!service) {
                // This case implies that the serviceId clicked does not exist in the
                // pre-loaded data. This could indicate a data inconsistency or a stale UI.
                console.error(`Service request with ID ${serviceId} not found in this.allServiceRequests. This might indicate that the local data is incomplete or out of sync with the UI elements.`);
                alert('Error: Could not find details for the selected service. The information may be unavailable or out of date.');
                return;
            }

            // Store the current service ID
            this.currentServiceId = serviceId;

            // Populate the detail view
            this.populateDetailView(service);

            // Hide the list view and show the detail view
            if (this.container) this.container.style.display = 'none';
            if (this.detailContainer) this.detailContainer.style.display = 'block';
            
            // Update URL to include service ID
            if (history.pushState) {
                const newUrl = `${window.location.pathname}?serviceId=${serviceId}`;
                window.history.pushState({path: newUrl}, '', newUrl);
            }
            
            // Scroll to top
            window.scrollTo(0, 0);

        } catch (error) {
            console.error('Error in openServiceDetail:', error);
            alert('An unexpected error occurred while trying to display the service details. Please try again.');
        }
    }

    /**
     * Handle error in the main container
     */
    handleError(message) {
        if (this.container) {
            this.container.innerHTML = `<div class="alert alert-danger">${message}</div>`;
        }
    }

    /**
     * Apply all active filters and search
     */
    applyFilters() {
        if (!this.allServiceRequests.length) {
            // Data might not be loaded yet if filters are applied before initial fetch completes
            return;
        }

        let filteredServiceRequests = [...this.allServiceRequests];

        // Apply date range filter
        if (this.dateFilter && this.dateFilter.value && this.dateFilter.value !== 'All time') {
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
                // No 'All time' case here, as it implies no date filtering.
            }
            if (startDate) {
                // Normalize start of day for comparison
                startDate.setHours(0, 0, 0, 0);
                filteredServiceRequests = filteredServiceRequests.filter(service =>
                    service.SB_CREATED_AT && new Date(service.SB_CREATED_AT) >= startDate
                );
            }
        }

        // Apply status filter
        if (this.statusFilter && this.statusFilter.value && this.statusFilter.value !== 'All Status') {
            filteredServiceRequests = filteredServiceRequests.filter(service =>
                service.SB_STATUS && service.SB_STATUS.toLowerCase() === this.statusFilter.value.toLowerCase()
            );
        }

        // Apply search filter
        if (this.searchInput && this.searchInput.value.trim() !== '') {
            const searchTerm = this.searchInput.value.trim().toLowerCase();
            filteredServiceRequests = filteredServiceRequests.filter(service =>
                (service.ST_NAME && service.ST_NAME.toLowerCase().includes(searchTerm)) ||
                (service.ST_DESCRIPTION && service.ST_DESCRIPTION.toLowerCase().includes(searchTerm)) ||
                (service.SB_ID && `srv-${service.SB_ID}`.toLowerCase().includes(searchTerm)) // Standardize search for ID
            );
        }

        this.filteredServiceRequests = filteredServiceRequests;
        this.currentPage = 1; // Reset to first page
        this.renderServiceRequests(this.filteredServiceRequests);

        const resultsCountElement = document.getElementById('service-results-count');
        if (resultsCountElement) {
            resultsCountElement.textContent = `${filteredServiceRequests.length} service request${filteredServiceRequests.length !== 1 ? 's' : ''} found`;
        }
    }

    /**
     * Initialize pagination controls
     */
    initPaginationControls() {
        const paginationContainer = document.querySelector(this.config.paginationContainerSelector);
        if (!paginationContainer) return;

        // Remove previous listeners to avoid multiple bindings if called repeatedly
        // A more robust way is to attach one listener to the container.
        // For simplicity, if this function is only called after innerHTML overwrite, it's fine.

        paginationContainer.addEventListener('click', (e) => {
            e.preventDefault();
            const link = e.target.closest('.page-link');
            if (link && !link.closest('.page-item.disabled') && !link.closest('.page-item.active')) {
                const pageAction = link.getAttribute('data-page');
                if (pageAction) {
                    this.handlePageChange(pageAction);
                }
            }
        });
    }

    /**
     * Handle page change
     */
    handlePageChange(pageAction) {
        const totalPages = Math.ceil(this.filteredServiceRequests.length / this.itemsPerPage);

        if (pageAction === 'prev') {
            if (this.currentPage > 1) this.currentPage--;
        } else if (pageAction === 'next') {
            if (this.currentPage < totalPages) this.currentPage++;
        } else {
            const pageNum = parseInt(pageAction, 10);
            if (pageNum >= 1 && pageNum <= totalPages) {
                this.currentPage = pageNum;
            }
        }

        this.renderServiceRequests(this.filteredServiceRequests);

        if (this.container) {
            this.container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    /**
     * Populate detail view with service request details
     */
    populateDetailView(service) {
        if (!service) return;

        const safeSetText = (element, text) => {
            if (element) element.textContent = text !== null && text !== undefined ? String(text) : 'N/A';
        };

        safeSetText(this.detailView.serviceId, `SRV-${service.SB_ID}`);
        safeSetText(this.detailView.serviceName, service.ST_NAME);
        safeSetText(this.detailView.serviceDescription, service.ST_DESCRIPTION || 'No description available');

        if (this.detailView.requestedDate) {
            try {
                const date = service.SB_PREFERRED_DATE ? new Date(service.SB_PREFERRED_DATE) : null;
                this.detailView.requestedDate.textContent = date ? date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                }) : 'N/A';
            } catch (e) {
                console.warn('Error formatting requestedDate:', e);
                this.detailView.requestedDate.textContent = 'Invalid Date';
            }
        }

        // Format the time in 12-hour format with AM/PM
        if (this.detailView.requestedTime && service.SB_PREFERRED_TIME) {
            try {
                // Parse the time string (expected format: HH:MM:SS)
                const timeParts = service.SB_PREFERRED_TIME.split(':');
                if (timeParts.length >= 2) {
                    const hours = parseInt(timeParts[0], 10);
                    const minutes = parseInt(timeParts[1], 10);
                    const ampm = hours >= 12 ? 'PM' : 'AM';
                    const hours12 = hours % 12 || 12; // Convert to 12-hour format (0 becomes 12)

                    // Format as hours:minutes AM/PM
                    this.detailView.requestedTime.textContent = `${hours12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
                } else {
                    safeSetText(this.detailView.requestedTime, service.SB_PREFERRED_TIME);
                }
            } catch (e) {
                console.warn('Error formatting requestedTime:', e);
                safeSetText(this.detailView.requestedTime, service.SB_PREFERRED_TIME);
            }
        } else {
            safeSetText(this.detailView.requestedTime, service.SB_PREFERRED_TIME);
        }

        // Ensure we use the proper field name for address
        safeSetText(this.detailView.address, service.SB_ADDRESS || service.sb_address);

        // Set the service icon
        if (this.detailView.serviceIcon) {
            this.detailView.serviceIcon.innerHTML = `<i class="${this.getServiceIcon(service.ST_CODE)}"></i>`;
        }

        // Set status with badge style
        if (this.detailView.statusBadge && service.SB_STATUS) {
            const statusClass = this.getStatusBadgeClass(service.SB_STATUS);
            const statusText = service.SB_STATUS.charAt(0).toUpperCase() + service.SB_STATUS.slice(1);
            this.detailView.statusBadge.className = `badge bg-${statusClass}-subtle text-${statusClass}`;
            this.detailView.statusBadge.textContent = statusText;
        }

        if (this.detailView.estimatedCost) {
            this.detailView.estimatedCost.textContent =
                service.SB_STATUS === 'completed' && service.SB_ESTIMATED_COST && parseFloat(service.SB_ESTIMATED_COST) !== 0
                    ? `₱${parseFloat(service.SB_ESTIMATED_COST).toFixed(2)}`
                    : 'Estimate pending';
        }

        if (this.detailView.priority && service.SB_PRIORITY) {
            this.detailView.priority.textContent = service.SB_PRIORITY.charAt(0).toUpperCase() + service.SB_PRIORITY.slice(1);
        } else if (this.detailView.priority) {
            this.detailView.priority.textContent = 'N/A';
        }

        // Use SB_DESCRIPTION for the notes field
        safeSetText(this.detailView.notes, service.SB_DESCRIPTION || service.sb_description || 'No additional notes');
    }
}