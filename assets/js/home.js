// home.js - полная версия для главной страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏠 Home page JS loaded');
    
    // Navigation buttons
    const startShoppingBtn = document.getElementById('startShoppingBtn');
    const viewCollectionsBtn = document.getElementById('viewCollectionsBtn');
    const consultationBtn = document.getElementById('consultationBtn');

    if (startShoppingBtn) {
        startShoppingBtn.addEventListener('click', () => {
            window.location.href = 'catalog.html';
        });
    }

    if (viewCollectionsBtn) {
        viewCollectionsBtn.addEventListener('click', () => {
            window.location.href = 'catalog.html';
        });
    }

    if (consultationBtn) {
        consultationBtn.addEventListener('click', () => {
            // Создаем модальное окно для консультации
            const modal = document.createElement('div');
            modal.className = 'consultation-modal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            `;
            
            modal.innerHTML = `
                <div style="background: white; padding: 2rem; border-radius: 12px; max-width: 400px; width: 90%; text-align: center;">
                    <h3 style="margin-bottom: 1rem; color: #667eea;">Бесплатная консультация</h3>
                    <p style="margin-bottom: 1.5rem; color: #666;">Спасибо за интерес! Наш дизайнер свяжется с вами в течение 24 часов.</p>
                    <button class="btn btn-primary" onclick="this.closest('.consultation-modal').remove()">Понятно</button>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Закрытие по клику на фон
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });
        });
    }

    // Category buttons
    document.querySelectorAll('.view-category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            window.location.href = `catalog.html?category=${category}`;
        });
    });

    // Hero image hover effect
    const heroImage = document.querySelector('.hero-image');
    if (heroImage) {
        heroImage.addEventListener('mouseenter', () => {
            heroImage.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1.02)';
        });
        
        heroImage.addEventListener('mouseleave', () => {
            heroImage.style.transform = 'perspective(1000px) rotateY(-5deg) rotateX(5deg) scale(1)';
        });
    }

    // Floating cards animation
    const floatingCards = document.querySelectorAll('.floating-card');
    floatingCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.5}s`;
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe animated elements
    document.querySelectorAll('.animate-fade-in-up, .animate-slide-in-left, .animate-slide-in-right').forEach(el => {
        // Устанавливаем начальные стили для анимации
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        observer.observe(el);
    });

    // Stats counter animation
    const statNumbers = document.querySelectorAll('.stat-number');
    const statsSection = document.querySelector('.hero-stats');
    
    if (statsSection && statNumbers.length > 0) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    statNumbers.forEach(stat => {
                        const target = parseInt(stat.textContent);
                        let current = 0;
                        const increment = target / 50;
                        const timer = setInterval(() => {
                            current += increment;
                            if (current >= target) {
                                stat.textContent = target + (stat.textContent.includes('*') ? '*' : '');
                                clearInterval(timer);
                            } else {
                                stat.textContent = Math.floor(current);
                            }
                        }, 30);
                    });
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        statsObserver.observe(statsSection);
    }

    // Add hover effects to category cards
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });

    // CTA section background animation
    const ctaSection = document.querySelector('.cta-content');
    if (ctaSection) {
        let hue = 0;
        setInterval(() => {
            hue = (hue + 0.5) % 360;
            ctaSection.style.background = `linear-gradient(135deg, hsl(${hue}, 70%, 60%) 0%, hsl(${hue + 30}, 70%, 50%) 100%)`;
        }, 100);
    }

    console.log('✅ Home page initialization complete');
});

// Дополнительные функции для главной страницы
window.homeFunctions = {
    // Функция для быстрого добавления популярных товаров
    quickAddToCart: function(productId, productName, price, image) {
        window.addToCart({
            id: productId,
            title: productName,
            price: price,
            image: image,
            quantity: 1
        });
    },
    
    // Функция для показа дополнительной информации о категории
    showCategoryInfo: function(category) {
        const categoryInfo = {
            'living': 'Гостиная - создайте уютное пространство для отдыха и приема гостей',
            'bedroom': 'Спальня - обеспечьте комфортный отдых и гармоничную атмосферу',
            'office': 'Офис - организуйте продуктивное рабочее пространство'
        };
        
        if (categoryInfo[category]) {
            alert(categoryInfo[category]);
        }
    }
};