-- Aether: catalogue seed data.
-- Run last, after 0001_schema.sql and 0002_rls.sql.
-- Safe to re-run: every insert upserts on slug, so nothing is duplicated.
-- Prices are whole naira integers. image_url is left null, which makes the app
-- render its labelled placeholder until real photography is added.
--
-- is_featured = true marks the four products shown in the Curated Products row.
-- created_at values are spread out so "New Arrivals" ordering is meaningful.

insert into public.categories (name, slug, sort_order) values
  ('Fashion', 'fashion', 1),
  ('Tech & Accessories', 'tech-accessories', 2),
  ('Home & Desk', 'home-desk', 3),
  ('Self-Care', 'self-care', 4)
on conflict (slug) do update
  set name = excluded.name,
      sort_order = excluded.sort_order;

-- Fashion ------------------------------------------------------------------
insert into public.products (
  name, slug, description, short_description, price, category_id,
  image_url, stock, is_featured, sizes, details, material, dimensions, created_at
) values
  (
    'Minimal Cap',
    'minimal-cap',
    'A six-panel cap in washed cotton with a soft brim and a low profile that sits well through the day.',
    'Washed cotton, low profile, quietly structured.',
    16000,
    (select id from public.categories where slug = 'fashion'),
    null, 24, false, null,
    array['Washed cotton', 'Metal adjuster', 'Embroidered AETHER mark'],
    '100% washed cotton',
    'One size, adjustable',
    '2026-09-18'
  ),
  (
    'Essential T-Shirt',
    'essential-t-shirt',
    'An everyday-weight cotton t-shirt with a clean neckline and a straight hem, cut to be worn as often as you like.',
    'Everyday weight, clean neckline, straight hem.',
    18500,
    (select id from public.categories where slug = 'fashion'),
    null, 40, false,
    array['S', 'M', 'L', 'XL'],
    array['240gsm cotton jersey', 'Ribbed neckline', 'Pre-washed for softness'],
    '100% combed cotton',
    null,
    '2026-09-11'
  ),
  (
    'Relaxed Hoodie',
    'relaxed-hoodie',
    'A heavyweight hoodie with a dropped shoulder and a brushed interior: warm without feeling heavy.',
    'Heavyweight, dropped shoulder, brushed inside.',
    42000,
    (select id from public.categories where slug = 'fashion'),
    null, 18, false,
    array['S', 'M', 'L', 'XL'],
    array['420gsm loopback cotton', 'Double-layer hood', 'Ribbed cuffs and hem'],
    '100% organic cotton',
    null,
    '2026-09-04'
  ),
  (
    'Everyday Tote',
    'everyday-tote',
    'A structured tote in heavy canvas with a flat base and long handles that sit comfortably on the shoulder.',
    'Heavy canvas, flat base, shoulder handles.',
    28000,
    (select id from public.categories where slug = 'fashion'),
    null, 22, false, null,
    array['Heavy cotton canvas', 'Reinforced handles', 'Flat base'],
    '100% cotton canvas',
    '38 x 42 x 12 cm',
    '2026-08-28'
  )
on conflict (slug) do update
  set name = excluded.name,
      description = excluded.description,
      short_description = excluded.short_description,
      price = excluded.price,
      category_id = excluded.category_id,
      image_url = excluded.image_url,
      stock = excluded.stock,
      is_featured = excluded.is_featured,
      sizes = excluded.sizes,
      details = excluded.details,
      material = excluded.material,
      dimensions = excluded.dimensions,
      created_at = excluded.created_at;

-- Tech & Accessories -------------------------------------------------------
insert into public.products (
  name, slug, description, short_description, price, category_id,
  image_url, stock, is_featured, sizes, details, material, dimensions, created_at
) values
  (
    'USB-C Hub',
    'usb-c-hub',
    'A seven-port hub that adds USB-A, HDMI and card reading to a laptop over a single USB-C cable.',
    'Seven ports from one USB-C cable.',
    52000,
    (select id from public.categories where slug = 'tech-accessories'),
    null, 15, true, null,
    array['HDMI output', 'USB-A x3, SD, microSD', 'Bus powered'],
    'Aluminium and ABS',
    '11 x 5 x 1.2 cm',
    '2026-08-21'
  ),
  (
    'Laptop Stand',
    'laptop-stand',
    'A folding aluminium stand that lifts a laptop to a comfortable height and folds flat enough to travel with.',
    'Folds flat, lifts to a comfortable height.',
    45000,
    (select id from public.categories where slug = 'tech-accessories'),
    null, 19, true, null,
    array['Six height positions', 'Silicone contact points', 'Folds to 1.5 cm'],
    'Anodised aluminium',
    'Folded: 32 x 24 x 1.5 cm',
    '2026-08-14'
  ),
  (
    'Wireless Mouse',
    'wireless-mouse',
    'A quiet, low-latency wireless mouse with an ambidextrous shape and a rechargeable battery.',
    'Quiet clicks, ambidextrous shape, rechargeable.',
    34500,
    (select id from public.categories where slug = 'tech-accessories'),
    null, 27, true, null,
    array['Silent switches', 'Dongle or Bluetooth', 'USB-C charging'],
    'ABS with silicone grip',
    '11 x 6.2 x 3.9 cm',
    '2026-08-07'
  )
on conflict (slug) do update
  set name = excluded.name,
      description = excluded.description,
      short_description = excluded.short_description,
      price = excluded.price,
      category_id = excluded.category_id,
      image_url = excluded.image_url,
      stock = excluded.stock,
      is_featured = excluded.is_featured,
      sizes = excluded.sizes,
      details = excluded.details,
      material = excluded.material,
      dimensions = excluded.dimensions,
      created_at = excluded.created_at;

-- Home & Desk --------------------------------------------------------------
insert into public.products (
  name, slug, description, short_description, price, category_id,
  image_url, stock, is_featured, sizes, details, material, dimensions, created_at
) values
  (
    'Insulated Bottle',
    'insulated-bottle',
    'A double-walled steel bottle that keeps drinks cold through a working day and fits a cup holder.',
    'Cold for a working day, fits a cup holder.',
    37000,
    (select id from public.categories where slug = 'home-desk'),
    null, 30, true, null,
    array['Double-wall vacuum', 'Powder-coated finish', 'BPA-free lid'],
    '18/8 stainless steel',
    '750ml, 7.5 cm across, 26 cm tall',
    '2026-07-31'
  ),
  (
    'Desk Lamp',
    'desk-lamp',
    'A dimmable desk lamp with a warm-to-cool range and an arm that stays exactly where you put it.',
    'Warm to cool, and stays put.',
    68000,
    (select id from public.categories where slug = 'home-desk'),
    null, 12, false, null,
    array['Stepless dimming', '2700K-5000K', 'USB-C passthrough'],
    'Powder-coated steel',
    '42 cm tall, 45 cm reach',
    '2026-07-24'
  ),
  (
    'Weekly Planner',
    'weekly-planner',
    'An undated weekly planner with a soft cover and paper that lies flat on a desk.',
    'Undated, soft cover, lies flat.',
    21000,
    (select id from public.categories where slug = 'home-desk'),
    null, 35, false, null,
    array['Undated, 52 weeks', '160gsm paper', 'Ribbon marker'],
    'Paper and board',
    '21 x 14.8 x 1.4 cm',
    '2026-07-17'
  ),
  (
    'Ceramic Mug',
    'ceramic-mug',
    'A stoneware mug with a matte glaze and a handle sized for a whole hand.',
    'Matte glaze, generous handle.',
    12500,
    (select id from public.categories where slug = 'home-desk'),
    null, 44, false, null,
    array['Stoneware', 'Dishwasher safe', '320ml'],
    'Glazed stoneware',
    '320ml, 9 cm across, 10 cm tall',
    '2026-07-10'
  )
on conflict (slug) do update
  set name = excluded.name,
      description = excluded.description,
      short_description = excluded.short_description,
      price = excluded.price,
      category_id = excluded.category_id,
      image_url = excluded.image_url,
      stock = excluded.stock,
      is_featured = excluded.is_featured,
      sizes = excluded.sizes,
      details = excluded.details,
      material = excluded.material,
      dimensions = excluded.dimensions,
      created_at = excluded.created_at;

-- Self-Care ---------------------------------------------------------------
insert into public.products (
  name, slug, description, short_description, price, category_id,
  image_url, stock, is_featured, sizes, details, material, dimensions, created_at
) values
  (
    'Scented Candle',
    'scented-candle',
    'A soy wax candle in a reusable glass jar with a warm cedar and fig scent.',
    'Soy wax, cedar and fig, reusable jar.',
    26500,
    (select id from public.categories where slug = 'self-care'),
    null, 26, false, null,
    array['40 hour burn', 'Cotton wick', 'Reusable glass jar'],
    'Soy wax, cotton wick, glass',
    '220g, 8 cm across',
    '2026-07-03'
  ),
  (
    'Body Butter',
    'body-butter',
    'A rich shea and squalane body butter that absorbs quickly and leaves skin soft rather than greasy.',
    'Shea and squalane, absorbs quickly.',
    14500,
    (select id from public.categories where slug = 'self-care'),
    null, 33, false, null,
    array['Unscented', 'Absorbs in seconds', 'Wide mouth tub'],
    'Shea butter, squalane',
    '200ml tub',
    '2026-06-26'
  ),
  (
    'Hand Cream',
    'hand-cream',
    'A lightweight hand cream for frequent washing, light enough to use at a desk without your hands slipping.',
    'Light enough for a desk, not slippery.',
    11000,
    (select id from public.categories where slug = 'self-care'),
    null, 38, false, null,
    array['Fast absorbing', 'Unscented', 'Suitable for frequent washing'],
    'Glycerin, shea butter',
    '75ml tube',
    '2026-06-19'
  )
on conflict (slug) do update
  set name = excluded.name,
      description = excluded.description,
      short_description = excluded.short_description,
      price = excluded.price,
      category_id = excluded.category_id,
      image_url = excluded.image_url,
      stock = excluded.stock,
      is_featured = excluded.is_featured,
      sizes = excluded.sizes,
      details = excluded.details,
      material = excluded.material,
      dimensions = excluded.dimensions,
      created_at = excluded.created_at;

-- Sanity check -------------------------------------------------------------
-- Expect 4 categories and 14 products, 4 of which are featured.
select (select count(*) from public.categories) as categories,
       (select count(*) from public.products)   as products,
       (select count(*) from public.products where is_featured) as featured;