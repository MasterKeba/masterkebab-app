// app.js
document.addEventListener('DOMContentLoaded', () => {
    // Menü verileri
    const menu = [
        { 
            id: 1, 
            name: "Adana Kebab", 
            price: 120, 
            category: "kebap", 
            popular: true,
            description: "Özel baharatlarla hazırlanmış geleneksel lezzet"
        },
        { 
            id: 2, 
            name: "Urfa Burger", 
            price: 95, 
            category: "burger", 
            popular: true,
            description: "Urfa usulü baharatlı köftemizle hazırlanmış burger"
        },
        { 
            id: 3, 
            name: "Tavuk Şiş", 
            price: 85, 
            category: "tavuk", 
            popular: false,
            description: "Marine edilmiş tavuk şiş, pilav ve salata ile"
        },
        { 
            id: 4, 
            name: "Vejetaryen Kebab", 
            price: 100, 
            category: "kebap", 
            popular: false,
            description: "Sebzeler ve bitkisel proteinle hazırlanan sağlıklı seçenek"
        },
        { 
            id: 5, 
            name: "Köfte Menü", 
            price: 110, 
            category: "kebap", 
            popular: true,
            description: "Özel köftemiz, pilav, salata ve ayran ile"
        },
        { 
            id: 6, 
            name: "Akdeniz Salata", 
            price: 70, 
            category: "salata", 
            popular: false,
            description: "Taze sebzeler, zeytinyağı ve özel sos ile"
        },
        { 
            id: 7, 
            name: "Künefe", 
            price: 50, 
            category: "tatlı", 
            popular: true,
            description: "Sıcak künefe, dondurma ile servis edilir"
        }
    ];

    // Sepet verisi
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let currentItem = null;

    // DOM elementleri
    const menuContainer = document.querySelector('.menu-cards');
    const cartCount = document.getElementById('cart-count');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartItemsContainer = document.querySelector('.cart-items');
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    const customModal = document.getElementById('custom-modal');
    const modalTitle = document.getElementById('modal-title');
    const cartIcon = document.querySelector('.cart-icon');

    // Menüyü render etme
    function renderMenu() {
        menuContainer.innerHTML = menu.map(item => `
            <div class="menu-card ${item.popular ? 'popular' : ''}" data-id="${item.id}" data-category="${item.category}">
                <img src="https://source.unsplash.com/random/400x300/?kebab,${item.id}" alt="${item.name}">
                <h3>${item.name}</h3>
                <p>${item.price}₺</p>
                <p class="description">${item.description}</p>
                <button class="btn primary" onclick="openCustomization(${item.id})">
                    SEPETE EKLE
                </button>
                ${item.popular ? '<span class="popular-badge">POPÜLER</span>' : ''}
            </div>
        `).join('');
    }

    // Sepeti render etme
    function renderCart() {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `<div class="empty-cart">Sepetiniz boş</div>`;
            subtotalElement.textContent = '0₺';
            totalElement.textContent = '10₺';
            return;
        }

        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>${item.price}₺</p>
                    ${item.sauce ? `<p>Sos: ${getSauceName(item.sauce)}</p>` : ''}
                    ${item.extras.length > 0 ? `<p>Ekstra: ${item.extras.map(extra => getExtraName(extra)).join(', ')}</p>` : ''}
                </div>
                <div class="cart-item-actions">
                    <button onclick="decreaseQuantity(${item.id})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="increaseQuantity(${item.id})">+</button>
                    <button class="remove-btn" onclick="removeFromCart(${item.id})">×</button>
                </div>
            </div>
        `).join('');

        updateCartSummary();
    }

    // Sepet özetini güncelleme
    function updateCartSummary() {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const total = subtotal + 10; // Teslimat ücreti
        
        subtotalElement.textContent = `${subtotal}₺`;
        totalElement.textContent = `${total}₺`;
        
        cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Özelleştirme modali açma
    window.openCustomization = function(itemId) {
        currentItem = menu.find(item => item.id === itemId);
        if (!currentItem) return;
        
        modalTitle.textContent = currentItem.name;
        customModal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    // Sepete ekleme
    window.addToCart = function() {
        if (!currentItem) return;
        
        const sauce = document.querySelector('input[name="sauce"]:checked').value;
        const extras = Array.from(document.querySelectorAll('input[name="extra"]:checked')).map(e => e.value);
        const note = document.querySelector('textarea').value;
        
        // Ekstra ücretleri hesapla
        let extraPrice = 0;
        if (sauce === 'ozel') extraPrice += 5;
        if (extras.includes('peynir')) extraPrice += 5;
        if (extras.includes('zeytin')) extraPrice += 3;
        if (extras.includes('biber')) extraPrice += 2;
        
        const cartItem = {
            ...currentItem,
            price: currentItem.price + extraPrice,
            sauce,
            extras,
            note,
            quantity: 1
        };
        
        // Eğer bu ürün sepette varsa miktarını artır
        const existingItem = cart.find(item => 
            item.id === cartItem.id && 
            item.sauce === cartItem.sauce && 
            JSON.stringify(item.extras) === JSON.stringify(cartItem.extras)
        );
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push(cartItem);
        }
        
        renderCart();
        closeModal();
        openCart();
    }

    // Sepetten kaldırma
    window.removeFromCart = function(itemId) {
        cart = cart.filter(item => item.id !== itemId);
        renderCart();
    }

    // Miktar artırma
    window.increaseQuantity = function(itemId) {
        const item = cart.find(item => item.id === itemId);
        if (item) {
            item.quantity += 1;
            renderCart();
        }
    }

    // Miktar azaltma
    window.decreaseQuantity = function(itemId) {
        const item = cart.find(item => item.id === itemId);
        if (item) {
            if (item.quantity > 1) {
                item.quantity -= 1;
            } else {
                cart = cart.filter(i => i.id !== itemId);
            }
            renderCart();
        }
    }

    // Sos adını alma
    function getSauceName(sauce) {
        switch(sauce) {
            case 'acili': return 'Acılı Sos';
            case 'yogurtlu': return 'Yoğurtlu Sos';
            case 'ozel': return 'Özel Sos';
            default: return '';
        }
    }

    // Ekstra adını alma
    function getExtraName(extra) {
        switch(extra) {
            case 'peynir': return 'Peynir';
            case 'zeytin': return 'Zeytin';
            case 'biber': return 'Biber';
            default: return extra;
        }
    }

    // Sepeti açma
    function openCart() {
        cartSidebar.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    // Sepeti kapatma
    function closeCart() {
        cartSidebar.classList.remove('open');
        document.body.style.overflow = 'auto';
    }

    // Modali kapatma
    function closeModal() {
        customModal.classList.remove('open');
        document.body.style.overflow = 'auto';
    }

    // Event listener'lar
    document.querySelector('.close-cart').addEventListener('click', closeCart);
    document.querySelector('.close-modal').addEventListener('click', closeModal);
    document.querySelector('.cancel-btn').addEventListener('click', closeModal);
    cartIcon.addEventListener('click', openCart);
    document.querySelector('.add-to-cart-btn').addEventListener('click', addToCart);
    
    // Uygulamayı başlat
    renderMenu();
    renderCart();
});
