// Article Detail Page JavaScript - Enhanced Version
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация корзины
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    updateCartCount();
    
    // Получаем ID статьи из URL для уникального хранения данных
    const articleId = window.location.pathname.split('/').pop() || 'article-default';
    
    // Кнопка "Нравится" с улучшенной логикой
    const likeBtn = document.getElementById('likeBtn');
    let isLiked = localStorage.getItem(`articleLiked_${articleId}`) === 'true';
    let likeCount = parseInt(localStorage.getItem(`articleLikeCount_${articleId}`)) || parseInt(likeBtn?.textContent.match(/\d+/)?.[0]) || 0;
    
    if (likeBtn) {
        updateLikeButton();
        
        likeBtn.addEventListener('click', function() {
            isLiked = !isLiked;
            likeCount = isLiked ? likeCount + 1 : Math.max(0, likeCount - 1);
            
            localStorage.setItem(`articleLiked_${articleId}`, isLiked);
            localStorage.setItem(`articleLikeCount_${articleId}`, likeCount);
            
            updateLikeButton();
            
            // Анимация лайка
            if (isLiked) {
                createLikeAnimation();
                showNotification('Статья добавлена в понравившиеся!', 'success');
            }
        });
    }
    
    function updateLikeButton() {
        if (likeBtn) {
            const svgFill = isLiked ? 'currentColor' : 'none';
            likeBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="${svgFill}">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Нравится (${likeCount})
            `;
            
            likeBtn.classList.toggle('liked', isLiked);
        }
    }

    // Анимация лайка
    function createLikeAnimation() {
        const animation = document.createElement('div');
        animation.innerHTML = '❤️';
        animation.style.cssText = `
            position: fixed;
            font-size: 2rem;
            pointer-events: none;
            z-index: 10000;
            animation: floatUp 1s ease-out forwards;
        `;
        
        const rect = likeBtn.getBoundingClientRect();
        animation.style.left = rect.left + rect.width/2 - 20 + 'px';
        animation.style.top = rect.top + 'px';
        
        document.body.appendChild(animation);
        
        setTimeout(() => {
            document.body.removeChild(animation);
        }, 1000);
    }

    // Улучшенная кнопка "Поделиться" с больше опциями
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', function(e) {
            if (navigator.share) {
                shareNative();
            } else {
                showShareOptions(e);
            }
        });
    }

    function shareNative() {
        navigator.share({
            title: document.title,
            text: document.querySelector('.article-excerpt-main')?.textContent || '',
            url: window.location.href
        })
        .then(() => showNotification('Статья успешно поделена!', 'success'))
        .catch(() => showShareOptions());
    }

    function showShareOptions(event) {
        const shareModal = document.createElement('div');
        shareModal.className = 'share-modal';
        shareModal.innerHTML = `
            <div class="share-modal-content">
                <h3>Поделиться статьей</h3>
                <div class="share-buttons">
                    <button class="share-option" data-platform="copy">
                        <span>📋</span> Копировать ссылку
                    </button>
                    <button class="share-option" data-platform="telegram">
                        <span>📱</span> Telegram
                    </button>
                    <button class="share-option" data-platform="vkontakte">
                        <span>👥</span> ВКонтакте
                    </button>
                    <button class="share-option" data-platform="whatsapp">
                        <span>💬</span> WhatsApp
                    </button>
                </div>
                <button class="share-close">Закрыть</button>
            </div>
        `;

        shareModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
        `;

        shareModal.querySelector('.share-modal-content').style.cssText = `
            background: white;
            padding: 2rem;
            border-radius: 12px;
            max-width: 400px;
            width: 90%;
            text-align: center;
        `;

        document.body.appendChild(shareModal);

        // Обработчики для кнопок分享
        shareModal.querySelectorAll('.share-option').forEach(btn => {
            btn.addEventListener('click', function() {
                const platform = this.dataset.platform;
                handleShare(platform);
                document.body.removeChild(shareModal);
            });
        });

        shareModal.querySelector('.share-close').addEventListener('click', () => {
            document.body.removeChild(shareModal);
        });

        shareModal.addEventListener('click', (e) => {
            if (e.target === shareModal) {
                document.body.removeChild(shareModal);
            }
        });
    }

    function handleShare(platform) {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(document.title);
        
        const shareUrls = {
            copy: () => {
                navigator.clipboard.writeText(window.location.href)
                    .then(() => showNotification('Ссылка скопирована!', 'success'))
                    .catch(() => fallbackCopy());
            },
            telegram: () => window.open(`https://t.me/share/url?url=${url}&text=${title}`, '_blank'),
            vkontakte: () => window.open(`https://vk.com/share.php?url=${url}`, '_blank'),
            whatsapp: () => window.open(`https://wa.me/?text=${title}%20${url}`, '_blank')
        };

        if (shareUrls[platform]) {
            shareUrls[platform]();
        }
    }

    function fallbackCopy() {
        const tempInput = document.createElement('input');
        tempInput.value = window.location.href;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        showNotification('Ссылка скопирована в буфер обмена!', 'success');
    }

    // Улучшенная навигация по содержанию
    const tocLinks = document.querySelectorAll('.toc-link');
    const sections = document.querySelectorAll('.article-text-content h2, .article-text-content h3');
    
    // Автоматическое генерирование ID для секций
    sections.forEach((section, index) => {
        if (!section.id) {
            const text = section.textContent.toLowerCase().replace(/[^\wа-яё]+/gi, '-');
            section.id = text || `section-${index + 1}`;
        }
    });

    // Intersection Observer для подсветки активного раздела
    const observerOptions = {
        threshold: [0.1, 0.5, 1.0],
        rootMargin: '-100px 0px -100px 0px'
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        let mostVisible = null;
        let maxRatio = 0;

        entries.forEach(entry => {
            if (entry.intersectionRatio > maxRatio) {
                maxRatio = entry.intersectionRatio;
                mostVisible = entry.target;
            }
        });

        if (mostVisible) {
            const activeId = mostVisible.id;
            tocLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`);
            });
            
            // Обновляем прогресс чтения по разделам
            updateSectionProgress(activeId);
        }
    }, observerOptions);

    sections.forEach(section => sectionObserver.observe(section));

    function updateSectionProgress(activeId) {
        // Можно добавить дополнительную логику для отслеживания прогресса по разделам
        console.log('Активный раздел:', activeId);
    }

    // Плавная прокрутка с offset
    tocLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('header')?.offsetHeight || 100;
                const targetPosition = targetSection.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Добавляем временную подсветку секции
                targetSection.style.transition = 'background-color 0.3s ease';
                targetSection.style.backgroundColor = 'rgba(107, 99, 255, 0.05)';
                setTimeout(() => {
                    targetSection.style.backgroundColor = '';
                }, 2000);
            }
        });
    });

    // Система закладок для статьи
    function initBookmarkSystem() {
        const bookmarkBtn = document.createElement('button');
        bookmarkBtn.className = 'btn btn-secondary bookmark-btn';
        bookmarkBtn.innerHTML = '🔖 Сохранить';
        
        const isBookmarked = localStorage.getItem(`bookmarked_${articleId}`) === 'true';
        updateBookmarkButton(bookmarkBtn, isBookmarked);
        
        bookmarkBtn.addEventListener('click', function() {
            const currentlyBookmarked = localStorage.getItem(`bookmarked_${articleId}`) === 'true';
            const newBookmarkState = !currentlyBookmarked;
            
            localStorage.setItem(`bookmarked_${articleId}`, newBookmarkState);
            updateBookmarkButton(this, newBookmarkState);
            
            showNotification(
                newBookmarkState ? 'Статья сохранена в закладках!' : 'Статья удалена из закладок',
                newBookmarkState ? 'success' : 'info'
            );
        });
        
        // Добавляем кнопку в действия статьи
        const articleActions = document.querySelector('.article-actions');
        if (articleActions) {
            articleActions.prepend(bookmarkBtn);
        }
    }

    function updateBookmarkButton(button, isBookmarked) {
        if (isBookmarked) {
            button.innerHTML = '🔖 В закладках';
            button.classList.add('bookmarked');
            button.classList.remove('btn-secondary');
            button.classList.add('btn-primary');
        } else {
            button.innerHTML = '🔖 Сохранить';
            button.classList.remove('bookmarked');
            button.classList.remove('btn-primary');
            button.classList.add('btn-secondary');
        }
    }

    // Улучшенная система комментариев
    const commentForm = document.querySelector('.comment-form');
    if (commentForm) {
        // Подсчет символов
        const textarea = commentForm.querySelector('textarea');
        const charCounter = document.createElement('div');
        charCounter.className = 'char-counter';
        charCounter.style.cssText = `
            text-align: right;
            font-size: 0.875rem;
            color: var(--gray);
            margin-top: 0.5rem;
        `;
        textarea.parentNode.insertBefore(charCounter, textarea.nextSibling);
        
        textarea.addEventListener('input', function() {
            const length = this.value.length;
            charCounter.textContent = `${length}/1000 символов`;
            
            if (length > 1000) {
                charCounter.style.color = '#ef4444';
            } else if (length > 800) {
                charCounter.style.color = '#f59e0b';
            } else {
                charCounter.style.color = 'var(--gray)';
            }
        });

        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const commentText = textarea.value.trim();
            
            if (!commentText) {
                showNotification('Пожалуйста, введите текст комментария', 'error');
                return;
            }
            
            if (commentText.length > 1000) {
                showNotification('Комментарий слишком длинный (максимум 1000 символов)', 'error');
                return;
            }
            
            submitComment(commentText);
        });
    }

    function submitComment(text) {
        const submitBtn = commentForm.querySelector('button');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<div class="loading-spinner"></div> Отправка...';
        submitBtn.disabled = true;

        // Имитация задержки сети
        setTimeout(() => {
            addNewComment(text);
            commentForm.querySelector('textarea').value = '';
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            showNotification('Комментарий успешно добавлен!', 'success');
            
            // Сбрасываем счетчик символов
            const charCounter = commentForm.querySelector('.char-counter');
            if (charCounter) charCounter.textContent = '0/1000 символов';
            
        }, 1500 + Math.random() * 1000);
    }

    // Расширенная функция добавления комментария
    function addNewComment(text) {
        const commentsList = document.querySelector('.comments-list');
        const commentId = 'comment-' + Date.now();
        
        const newComment = document.createElement('div');
        newComment.className = 'comment';
        newComment.id = commentId;
        newComment.innerHTML = `
            <div class="comment-author">
                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" 
                     alt="Аватар пользователя" class="comment-avatar">
                <div class="comment-author-info">
                    <span class="comment-author-name">Вы</span>
                    <span class="comment-date">только что</span>
                    <span class="comment-badge">Новый</span>
                </div>
            </div>
            <div class="comment-text">
                <p>${escapeHtml(text)}</p>
            </div>
            <div class="comment-actions">
                <button class="comment-like" data-likes="0">❤️ <span class="like-count">0</span></button>
                <button class="comment-reply">Ответить</button>
                <button class="comment-edit">✏️</button>
                <button class="comment-delete">🗑️</button>
            </div>
            <div class="comment-edit-form" style="display: none;">
                <textarea>${escapeHtml(text)}</textarea>
                <div class="edit-actions">
                    <button class="btn btn-primary btn-sm save-edit">Сохранить</button>
                    <button class="btn btn-secondary btn-sm cancel-edit">Отмена</button>
                </div>
            </div>
        `;
        
        commentsList.insertBefore(newComment, commentsList.firstChild);
        
        // Анимация появления
        setTimeout(() => newComment.style.opacity = '1', 10);
        
        // Обновляем счетчик комментариев
        updateCommentsCounter(1);
        
        // Добавляем обработчики
        addEnhancedCommentEventListeners(newComment);
        
        // Сохраняем в localStorage
        saveComment(commentId, text);
    }

    function addEnhancedCommentEventListeners(commentElement) {
        const likeBtn = commentElement.querySelector('.comment-like');
        const replyBtn = commentElement.querySelector('.comment-reply');
        const editBtn = commentElement.querySelector('.comment-edit');
        const deleteBtn = commentElement.querySelector('.comment-delete');
        const saveEditBtn = commentElement.querySelector('.save-edit');
        const cancelEditBtn = commentElement.querySelector('.cancel-edit');
        
        // Лайки
        likeBtn.addEventListener('click', function() {
            const likeCount = this.querySelector('.like-count');
            const currentLikes = parseInt(likeCount.textContent);
            const newLikes = currentLikes + 1;
            likeCount.textContent = newLikes;
            
            // Анимация лайка
            this.style.transform = 'scale(1.2)';
            setTimeout(() => this.style.transform = 'scale(1)', 200);
            
            // Сохраняем в localStorage
            const commentId = commentElement.id;
            saveCommentLike(commentId, newLikes);
        });
        
        // Ответ
        replyBtn.addEventListener('click', function() {
            const authorName = commentElement.querySelector('.comment-author-name').textContent;
            const commentText = commentElement.querySelector('.comment-text p').textContent;
            const commentForm = document.querySelector('.comment-form textarea');
            
            commentForm.value = `@${authorName}, `;
            commentForm.focus();
            showNotification('Ответ на комментарий подготовлен!', 'info');
        });
        
        // Редактирование
        editBtn.addEventListener('click', function() {
            const editForm = commentElement.querySelector('.comment-edit-form');
            const commentText = commentElement.querySelector('.comment-text');
            
            editForm.style.display = 'block';
            commentText.style.display = 'none';
            this.style.display = 'none';
        });
        
        // Сохранение редактирования
        saveEditBtn.addEventListener('click', function() {
            const editForm = commentElement.querySelector('.comment-edit-form');
            const textarea = editForm.querySelector('textarea');
            const commentText = commentElement.querySelector('.comment-text p');
            const editBtn = commentElement.querySelector('.comment-edit');
            
            commentText.textContent = textarea.value;
            editForm.style.display = 'none';
            commentText.style.display = 'block';
            editBtn.style.display = 'inline-block';
            
            showNotification('Комментарий отредактирован!', 'success');
        });
        
        // Отмена редактирования
        cancelEditBtn.addEventListener('click', function() {
            const editForm = commentElement.querySelector('.comment-edit-form');
            const commentText = commentElement.querySelector('.comment-text');
            const editBtn = commentElement.querySelector('.comment-edit');
            
            editForm.style.display = 'none';
            commentText.style.display = 'block';
            editBtn.style.display = 'inline-block';
        });
        
        // Удаление
        deleteBtn.addEventListener('click', function() {
            if (confirm('Удалить этот комментарий?')) {
                commentElement.style.opacity = '0';
                commentElement.style.transform = 'translateX(-100%)';
                
                setTimeout(() => {
                    commentElement.remove();
                    updateCommentsCounter(-1);
                    showNotification('Комментарий удален', 'info');
                }, 300);
            }
        });
    }

    // Вспомогательные функции
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function updateCommentsCounter(change) {
        const commentsTitle = document.querySelector('.comments-section h3');
        const match = commentsTitle.textContent.match(/(\d+)/);
        const currentCount = match ? parseInt(match[1]) : 0;
        const newCount = Math.max(0, currentCount + change);
        commentsTitle.textContent = `Комментарии (${newCount})`;
    }

    function saveComment(commentId, text) {
        const comments = JSON.parse(localStorage.getItem(`comments_${articleId}`)) || {};
        comments[commentId] = {
            text: text,
            timestamp: new Date().toISOString(),
            likes: 0
        };
        localStorage.setItem(`comments_${articleId}`, JSON.stringify(comments));
    }

    function saveCommentLike(commentId, likes) {
        const comments = JSON.parse(localStorage.getItem(`comments_${articleId}`)) || {};
        if (comments[commentId]) {
            comments[commentId].likes = likes;
            localStorage.setItem(`comments_${articleId}`, JSON.stringify(comments));
        }
    }

    // Инициализация улучшенных функций
    initBookmarkSystem();
    setupEnhancedReadingProgress();
    initTextSelectionSharing();
    loadSavedComments();

    // Загрузка сохраненных комментариев
    function loadSavedComments() {
        const comments = JSON.parse(localStorage.getItem(`comments_${articleId}`)) || {};
        // Здесь можно добавить логику загрузки сохраненных комментариев
        console.log('Сохраненные комментарии:', comments);
    }

    // Расширенный прогресс чтения
    function setupEnhancedReadingProgress() {
        const progressBar = document.createElement('div');
        progressBar.className = 'reading-progress';
        progressBar.innerHTML = `
            <div class="reading-progress-bar"></div>
            <div class="reading-progress-text">0%</div>
        `;
        document.body.appendChild(progressBar);
        
        let lastScrollPercent = 0;
        
        window.addEventListener('scroll', function() {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
            
            // Обновляем только если изменение существенное
            if (Math.abs(scrollPercent - lastScrollPercent) > 1) {
                progressBar.querySelector('.reading-progress-bar').style.width = scrollPercent + '%';
                progressBar.querySelector('.reading-progress-text').textContent = Math.round(scrollPercent) + '%';
                lastScrollPercent = scrollPercent;
            }
            
            // Показываем/скрываем прогресс в зависимости от прокрутки
            if (scrollPercent > 5 && scrollPercent < 95) {
                progressBar.style.opacity = '1';
            } else {
                progressBar.style.opacity = '0';
            }
        });
    }

    // Шаринг выделенного текста
    function initTextSelectionSharing() {
        let selectedText = '';
        
        document.addEventListener('mouseup', function() {
            const selection = window.getSelection();
            const text = selection.toString().trim();
            
            if (text.length > 10 && text.length < 500) {
                selectedText = text;
                showTextShareTooltip(selection);
            }
        });
        
        document.addEventListener('mousedown', function() {
            hideTextShareTooltip();
        });
    }

    function showTextShareTooltip(selection) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        const tooltip = document.createElement('div');
        tooltip.className = 'text-share-tooltip';
        tooltip.innerHTML = '📤 Поделиться цитатой';
        tooltip.style.cssText = `
            position: fixed;
            left: ${rect.left + window.scrollX}px;
            top: ${rect.top + window.scrollY - 40}px;
            background: var(--gradient-primary);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.875rem;
            cursor: pointer;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        `;
        
        tooltip.addEventListener('click', function() {
            shareSelectedText(selectedText);
            document.body.removeChild(tooltip);
        });
        
        document.body.appendChild(tooltip);
        
        // Автоматическое скрытие через 5 секунд
        setTimeout(() => {
            if (document.body.contains(tooltip)) {
                document.body.removeChild(tooltip);
            }
        }, 5000);
    }

    function shareSelectedText(text) {
        const articleTitle = document.title;
        const articleUrl = window.location.href;
        
        const shareText = `"${text}"\n\n— Из статьи "${articleTitle}"\n${articleUrl}`;
        
        navigator.clipboard.writeText(shareText)
            .then(() => showNotification('Цитата скопирована в буфер обмена!', 'success'))
            .catch(() => showNotification('Не удалось скопировать цитату', 'error'));
    }

    function hideTextShareTooltip() {
        const tooltip = document.querySelector('.text-share-tooltip');
        if (tooltip) {
            document.body.removeChild(tooltip);
        }
    }

    // Подписка на автора
    const subscribeBtn = document.querySelector('.author-card .btn');
    if (subscribeBtn) {
        let isSubscribed = localStorage.getItem('authorSubscribed') === 'true';
        
        updateSubscribeButton();
        
        subscribeBtn.addEventListener('click', function() {
            isSubscribed = !isSubscribed;
            localStorage.setItem('authorSubscribed', isSubscribed);
            updateSubscribeButton();
            
            if (isSubscribed) {
                showNotification('Вы подписались на автора!', 'success');
            } else {
                showNotification('Вы отписались от автора', 'info');
            }
        });
        
        function updateSubscribeButton() {
            if (isSubscribed) {
                subscribeBtn.textContent = 'Отписаться';
                subscribeBtn.classList.add('btn-primary');
                subscribeBtn.classList.remove('btn-secondary');
            } else {
                subscribeBtn.textContent = 'Подписаться';
                subscribeBtn.classList.add('btn-secondary');
                subscribeBtn.classList.remove('btn-primary');
            }
        }
    }

    // Newsletter subscription
    const newsletterForms = document.querySelectorAll('.newsletter-form');
    newsletterForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            
            if (!validateEmail(email)) {
                showNotification('Пожалуйста, введите корректный email', 'error');
                return;
            }
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Отправка...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                showNotification(`Спасибо за подписку! На адрес ${email} будут приходить новые статьи.`, 'success');
                this.reset();
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 1500);
        });
    });

    // Валидация email
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Обработка кликов по похожим статьям
    document.addEventListener('click', function(e) {
        const relatedArticleLink = e.target.closest('.related-article-content h5 a');
        
        if (relatedArticleLink && relatedArticleLink.href) {
            e.preventDefault();
            
            // Добавляем анимацию перехода
            document.body.style.opacity = '0.7';
            document.body.style.transition = 'opacity 0.3s ease';
            
            setTimeout(() => {
                window.location.href = relatedArticleLink.href;
            }, 300);
        }
    });

    // Функция обновления счетчика корзины
    function updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }

    // Функция показа уведомлений
    function showNotification(message, type = 'info') {
        // Удаляем существующие уведомления
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        });
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 1rem;
            animation: slideInRight 0.3s ease-out;
            max-width: 400px;
        `;
        
        document.body.appendChild(notification);
        
        // Кнопка закрытия
        notification.querySelector('.notification-close').addEventListener('click', function() {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        });
        
        // Автоматическое закрытие через 5 секунд
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }

    // Инициализация времени чтения
    initializeReadingTime();
    
    function initializeReadingTime() {
        const articleContent = document.querySelector('.article-text-content');
        if (articleContent) {
            const text = articleContent.textContent || articleContent.innerText;
            const wordCount = text.split(/\s+/).length;
            const readingTime = Math.ceil(wordCount / 200); // 200 слов в минуту
            
            // Обновляем время чтения в мета-информации
            const readingTimeElement = document.querySelector('.article-reading-time');
            if (readingTimeElement) {
                readingTimeElement.textContent = `${readingTime} мин чтения`;
            }
        }
    }

    // Сохранение позиции прокрутки для возврата
    window.addEventListener('beforeunload', function() {
        localStorage.setItem('articleScrollPosition', window.pageYOffset);
    });

    // Восстановление позиции прокрутки при возврате
    window.addEventListener('load', function() {
        const savedPosition = localStorage.getItem('articleScrollPosition');
        if (savedPosition) {
            window.scrollTo(0, parseInt(savedPosition));
            localStorage.removeItem('articleScrollPosition');
        }
    });

    // Добавляем обработчики для существующих комментариев
    document.querySelectorAll('.comment').forEach(comment => {
        addEnhancedCommentEventListeners(comment);
    });
});