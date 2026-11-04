
/* OH GIRL: public catalogue connection. Uses only the public publishable key. */
(() => {
  const SUPABASE_URL = 'https://uvxnstxpnyhpuyuopnuk.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_8a6hID_wvsn2sKRJBVg72w_OMuRidsf';

  const headers = {
    apikey: SUPABASE_KEY
  };

  const slugByPage = {
    'oh-girl-product-wish-map-fixed.html': 'wish-map',
    'oh-girl-product-oh-love.html': 'oh-love',
    'oh-girl-product-notebook.html': 'notebook',
    'oh-girl-product-oh-drink.html': 'oh-drink',
    'oh-girl-product-oh-cards.html': 'oh-cards'
  };

  const pageBySlug = {
    'wish-map': 'oh-girl-product-wish-map-fixed.html',
    'oh-love': 'oh-girl-product-oh-love.html',
    'notebook': 'oh-girl-product-notebook.html',
    'oh-drink': 'oh-girl-product-oh-drink.html',
    'oh-cards': 'oh-girl-product-oh-cards.html'
  };

  const money = n =>
    `${new Intl.NumberFormat('uk-UA').format(Number(n) || 0)} ₴`;

  async function loadProducts() {
    const url =
      `${SUPABASE_URL}/rest/v1/products?select=id,name,slug,description,price,old_price,images,is_active,sort_order&is_active=eq.true&order=sort_order.asc`;

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`Supabase products: ${response.status}`);
    }

    return response.json();
  }

  function applyHome(products) {
    const cards = [...document.querySelectorAll('.product-card')];

    cards.forEach(card => {
      const link = card.querySelector('.product-page-link');

      const slug = Object.keys(pageBySlug).find(
        key => link?.getAttribute('href') === pageBySlug[key]
      );

      const product = products.find(item => item.slug === slug);

      if (!product) return;

      const name = card.querySelector('.product-name');
      if (name) name.textContent = product.name;

      const price = card.querySelector('.price');
      if (price) price.textContent = money(product.price);

      const old = card.querySelector('.old-price');

      if (old) {
        if (product.old_price) {
          old.textContent = money(product.old_price);
        } else {
          old.remove();
        }
      }

      const sale = card.querySelector('.sale-tag');
      if (sale && !product.old_price) sale.remove();

      const imageBox = card.querySelector('.product-image');

      if (imageBox && product.images?.length) {
        imageBox.innerHTML = '';

        const img = document.createElement('img');
        img.src = product.images[0];
        img.alt = product.name;
        img.loading = 'lazy';

        img.style.cssText =
  'display:block;width:100%;height:100%;object-fit:cover;';
        imageBox.appendChild(img);
      }

      const caption = card.querySelector('.product-caption');

      if (caption && product.description) {
        caption.textContent = product.description;
      }
    });
  }

  function applyProduct(products) {
    const file = location.pathname.split('/').pop();
    const slug = slugByPage[file];

    if (!slug) return;

    const product = products.find(item => item.slug === slug);

    if (!product) return;

    const title = document.querySelector('h1');
    if (title) title.textContent = product.name;

    const price = document.querySelector('.price');
    if (price) price.textContent = money(product.price);

    const old = document.querySelector('.old-price');

    if (old) {
      if (product.old_price) {
        old.textContent = money(product.old_price);
      } else {
        old.remove();
      }
    }

    const gallery = (product.images || []).map((src, index) => ({
      src,
      alt: `${product.name} — фото ${index + 1}`
    }));

    if (
      gallery.length &&
      typeof draw === 'function' &&
      typeof drawThumbs === 'function'
    ) {
      productPhotos.splice(0, productPhotos.length, ...gallery);
      current = 0;
      drawThumbs();
      draw();
    } else if (gallery.length) {
      const img = document.getElementById('largeImage');

      if (img) {
        img.src = gallery[0].src;
        img.alt = gallery[0].alt;
      }
    }

    const description = document.querySelector('.description');

    if (description && product.description) {
      description.textContent = product.description;
    }
  }

  document.addEventListener('DOMContentLoaded', async () => {
    try {
      const products = await loadProducts();

      applyHome(products);
      applyProduct(products);

      console.log('OH GIRL: каталог успешно загружен из Supabase');
    } catch (error) {
      console.warn(
        'OH GIRL: не удалось обновить каталог из Supabase. Показываем встроенные данные страницы.',
        error
      );
    }
  });
})();
const galleryStyles = document.createElement('style');

galleryStyles.textContent = `
  .main-photo img,
  #largeImage,
  .thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover !important;
    object-position: center;
  }
`;

document.head.appendChild(galleryStyles);
