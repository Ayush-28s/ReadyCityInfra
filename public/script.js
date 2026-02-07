document.addEventListener('DOMContentLoaded', () => {
    
    // ---------------------------------------------------------
    // 1. HERO CAROUSEL (Main Top Slider)
    // ---------------------------------------------------------
    const heroSwiper = new Swiper(".mySwiper", {
        loop: true,
        speed: 1000, // Smooth transition speed
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        effect: "fade", // Cinematic fade
        fadeEffect: {
            crossFade: true
        },
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
    });

    // ---------------------------------------------------------
    // 2. TESTIMONIAL CAROUSEL (New Section)
    // ---------------------------------------------------------
    const testimonialSwiper = new Swiper(".testimonialSwiper", {
        loop: true,
        speed: 800,
        autoplay: {
            delay: 4000, // Slightly faster than hero
            disableOnInteraction: false,
        },
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
        slidesPerView: 1, // Show 1 review at a time
        spaceBetween: 30,
        grabCursor: true,
    });

    // ---------------------------------------------------------
    // 3. FETCH PROPERTIES FROM DATABASE
    // ---------------------------------------------------------
    fetchProperties();
});

async function fetchProperties() {
    const container = document.getElementById('property-container');

    try {
        const response = await fetch('/api/properties');
        const data = await response.json();

        container.innerHTML = '';

        if (!data || data.length === 0) {
            container.innerHTML = '<p class="col-span-full text-center text-gray-500 text-xl">No properties currently listed.</p>';
            return;
        }

        data.forEach((item, index) => {
            // Delay animation slightly for each card for a "cascading" effect
            const delay = index * 100;
            
            // Format Price
            const price = Number(item.price).toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0
            });

            const mapLink = item.map_url || '#';
            const description = item.description || 'Contact us for more details.';

            // Render Professional Card
            const cardHTML = `
                <div class="property-card bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full animate-fade-up" style="animation-delay: ${delay}ms">
                    
                    <!-- Image Section -->
                    <div class="relative h-72 overflow-hidden">
                        <img src="${item.image_url}" alt="${item.title}" class="w-full h-full object-cover transition-transform duration-700 hover:scale-110">
                        
                        <!-- Badges -->
                        <div class="absolute top-4 left-4 bg-brand text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                            ${item.type}
                        </div>
                        <div class="absolute bottom-4 right-4 bg-white/90 backdrop-blur text-gray-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center">
                            <i class="fas fa-camera mr-1"></i> Gallery
                        </div>
                    </div>
                    
                    <!-- Content Section -->
                    <div class="p-6 flex flex-col flex-grow">
                        <div class="flex justify-between items-start mb-2">
                            <h3 class="text-xl font-bold text-gray-900 line-clamp-1 hover:text-brand transition cursor-pointer">${item.title}</h3>
                        </div>
                        
                        <p class="text-2xl font-bold text-brand mb-4">${price}</p>
                        
                        <!-- Meta Info Row -->
                        <div class="flex items-center gap-4 text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
                            <div class="flex items-center">
                                <i class="fas fa-map-marker-alt text-brand-light mr-2"></i> ${item.location}
                            </div>
                            <div class="flex items-center">
                                <i class="fas fa-ruler-combined text-brand-light mr-2"></i> ${item.area}
                            </div>
                        </div>

                        <!-- Description -->
                        <p class="text-gray-600 text-sm mb-6 line-clamp-2">${description}</p>
                        
                        <!-- Buttons -->
                        <div class="mt-auto grid grid-cols-2 gap-3">
                            <a href="${mapLink}" target="_blank" class="flex items-center justify-center gap-2 border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition">
                                <i class="fas fa-location-arrow text-red-500"></i> Location
                            </a>
                            <a href="tel:+919651227779" class="flex items-center justify-center gap-2 bg-brand text-white py-3 rounded-xl font-semibold hover:bg-brand-dark transition shadow-lg shadow-blue-200">
                                <i class="fas fa-phone-alt"></i> Call Now
                            </a>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += cardHTML;
        });

    } catch (error) {
        console.error("Fetch Error:", error);
        container.innerHTML = `
            <div class="col-span-full text-center py-20">
                <i class="fas fa-exclamation-circle text-4xl text-red-400 mb-4"></i>
                <p class="text-gray-600">Unable to load properties from the server.</p>
            </div>
        `;
    }
}