/*
  # Seed Sample Data for Pizza Zone

  ## Overview
  Populate the database with sample menu items and categories for testing and demonstration.

  ## Data Being Added
  1. Categories:
    - Pizza
    - Ghanaian Dishes
    - Continental
    - Drinks

  2. Sample Menu Items:
    - Multiple pizzas with different prices
    - Ghanaian dishes (Jollof Rice, Fried Rice, Banku, Fufu, etc.)
    - Continental dishes
    - Various drinks (water, juice, wine)

  ## Notes
  - All items start with active status
  - Realistic pricing in Ghana Cedis
  - Stock quantities and preparation times included
  - Sample images can be replaced with actual URLs
*/

INSERT INTO categories (id, name, display_order) VALUES
  (gen_random_uuid(), 'Pizza', 1),
  (gen_random_uuid(), 'Ghanaian Dishes', 2),
  (gen_random_uuid(), 'Continental', 3),
  (gen_random_uuid(), 'Drinks', 4)
ON CONFLICT (name) DO NOTHING;

DO $$
DECLARE
  pizza_cat_id uuid;
  ghanaian_cat_id uuid;
  continental_cat_id uuid;
  drinks_cat_id uuid;
BEGIN
  SELECT id INTO pizza_cat_id FROM categories WHERE name = 'Pizza';
  SELECT id INTO ghanaian_cat_id FROM categories WHERE name = 'Ghanaian Dishes';
  SELECT id INTO continental_cat_id FROM categories WHERE name = 'Continental';
  SELECT id INTO drinks_cat_id FROM categories WHERE name = 'Drinks';

  INSERT INTO menu_items (category_id, name, description, price, stock_quantity, preparation_time, in_stock, is_active, image_url) VALUES
    (pizza_cat_id, 'Margherita Pizza', 'Classic pizza with tomato sauce, mozzarella, and fresh basil', 45.00, 50, 25, true, true, ''),
    (pizza_cat_id, 'Pepperoni Pizza', 'Loaded with pepperoni and extra cheese', 55.00, 45, 25, true, true, ''),
    (pizza_cat_id, 'BBQ Chicken Pizza', 'Grilled chicken with BBQ sauce and onions', 60.00, 40, 30, true, true, ''),
    (pizza_cat_id, 'Vegetarian Pizza', 'Fresh vegetables with cheese and herbs', 50.00, 35, 25, true, true, ''),
    (pizza_cat_id, 'Hawaiian Pizza', 'Ham, pineapple, and mozzarella cheese', 55.00, 30, 25, true, true, ''),
    (pizza_cat_id, 'Meat Lovers Pizza', 'Beef, sausage, bacon, and pepperoni', 70.00, 25, 30, true, true, ''),
    
    (ghanaian_cat_id, 'Jollof Rice with Chicken', 'Spicy tomato rice served with grilled chicken', 35.00, 60, 35, true, true, ''),
    (ghanaian_cat_id, 'Fried Rice with Fish', 'Colorful fried rice with seasoned fried fish', 40.00, 50, 30, true, true, ''),
    (ghanaian_cat_id, 'Banku and Tilapia', 'Traditional fermented corn dough with grilled tilapia and pepper', 45.00, 30, 40, true, true, ''),
    (ghanaian_cat_id, 'Fufu and Light Soup', 'Pounded cassava and plantain with goat meat soup', 40.00, 35, 45, true, true, ''),
    (ghanaian_cat_id, 'Waakye', 'Rice and beans with spaghetti, gari, and protein', 30.00, 55, 25, true, true, ''),
    (ghanaian_cat_id, 'Kenkey and Fish', 'Fermented corn dough with fried fish and pepper sauce', 35.00, 40, 30, true, true, ''),
    (ghanaian_cat_id, 'Red Red', 'Black-eyed peas stew with fried plantain', 28.00, 45, 25, true, true, ''),
    (ghanaian_cat_id, 'Banku and Okro Stew', 'Banku served with okro soup and fish', 38.00, 35, 35, true, true, ''),
    
    (continental_cat_id, 'Grilled Chicken and Chips', 'Juicy grilled chicken breast with french fries', 50.00, 40, 30, true, true, ''),
    (continental_cat_id, 'Beef Burger Deluxe', 'Premium beef burger with lettuce, tomato, and cheese', 45.00, 35, 20, true, true, ''),
    (continental_cat_id, 'Fish and Chips', 'Crispy battered fish with golden fries', 55.00, 30, 25, true, true, ''),
    (continental_cat_id, 'Pasta Carbonara', 'Creamy pasta with bacon and parmesan', 48.00, 40, 25, true, true, ''),
    (continental_cat_id, 'Grilled Steak', 'Tender beef steak with vegetables and mashed potatoes', 80.00, 20, 35, true, true, ''),
    (continental_cat_id, 'Caesar Salad', 'Fresh romaine lettuce with Caesar dressing and croutons', 35.00, 45, 15, true, true, ''),
    
    (drinks_cat_id, 'Bottled Water', 'Pure drinking water 500ml', 3.00, 200, 2, true, true, ''),
    (drinks_cat_id, 'Coca Cola', 'Classic Coke 330ml', 5.00, 150, 2, true, true, ''),
    (drinks_cat_id, 'Sprite', 'Lemon-lime soda 330ml', 5.00, 150, 2, true, true, ''),
    (drinks_cat_id, 'Fanta Orange', 'Orange flavored soda 330ml', 5.00, 150, 2, true, true, ''),
    (drinks_cat_id, 'Fresh Orange Juice', 'Freshly squeezed orange juice', 15.00, 50, 5, true, true, ''),
    (drinks_cat_id, 'Pineapple Juice', 'Fresh pineapple juice', 15.00, 45, 5, true, true, ''),
    (drinks_cat_id, 'Sobolo', 'Traditional hibiscus drink', 10.00, 60, 5, true, true, ''),
    (drinks_cat_id, 'Red Wine', 'Premium red wine bottle', 120.00, 25, 2, true, true, ''),
    (drinks_cat_id, 'White Wine', 'Chilled white wine bottle', 120.00, 25, 2, true, true, ''),
    (drinks_cat_id, 'Local Beer', 'Ghanaian beer 330ml', 12.00, 100, 2, true, true, '')
  ON CONFLICT DO NOTHING;
END $$;
