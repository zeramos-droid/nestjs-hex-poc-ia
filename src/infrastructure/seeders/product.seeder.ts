import { DataSource } from 'typeorm';
import { ProductEntity } from '../orm/product.entity';

export class ProductSeeder {
  static async run(dataSource: DataSource): Promise<void> {
    const productRepository = dataSource.getRepository(ProductEntity);

    // Check if products already exist
    const existingProducts = await productRepository.count();
    if (existingProducts > 0) {
      console.log('✅ Products already seeded, skipping...');
      return;
    }

    const products = [
      {
        name: 'Laptop Dell XPS 15',
        description:
          'High-performance laptop with Intel Core i7, 16GB RAM, 512GB SSD. Perfect for developers and content creators.',
        price: 1499.99,
        stock: 15,
        sku: 'LAPTOP-DELL-XPS15-001',
        categoryId: 'electronics',
        isActive: true,
      },
      {
        name: 'Mouse Logitech MX Master 3',
        description:
          'Ergonomic wireless mouse with precision scroll wheel and customizable buttons. Works on any surface.',
        price: 99.99,
        stock: 50,
        sku: 'MOUSE-LOGITECH-MX3-001',
        categoryId: 'electronics',
        isActive: true,
      },
      {
        name: 'Keyboard Mechanical RGB',
        description:
          'Mechanical gaming keyboard with RGB backlight, Cherry MX switches, and programmable keys.',
        price: 149.99,
        stock: 30,
        sku: 'KEYBOARD-MECH-RGB-001',
        categoryId: 'electronics',
        isActive: true,
      },
      {
        name: 'Monitor LG UltraWide 34"',
        description:
          '34-inch curved ultrawide monitor with 3440x1440 resolution, perfect for multitasking and gaming.',
        price: 599.99,
        stock: 8,
        sku: 'MONITOR-LG-UW34-001',
        categoryId: 'electronics',
        isActive: true,
      },
      {
        name: 'Webcam Logitech C920',
        description:
          'Full HD 1080p webcam with auto-focus and stereo audio. Ideal for video calls and streaming.',
        price: 79.99,
        stock: 25,
        sku: 'WEBCAM-LOGI-C920-001',
        categoryId: 'electronics',
        isActive: true,
      },
      {
        name: 'Headphones Sony WH-1000XM4',
        description:
          'Premium noise-cancelling wireless headphones with exceptional sound quality and 30-hour battery life.',
        price: 349.99,
        stock: 12,
        sku: 'HEADPHONES-SONY-XM4-001',
        categoryId: 'electronics',
        isActive: true,
      },
      {
        name: 'USB-C Hub Anker 7-in-1',
        description:
          'Compact USB-C hub with HDMI, USB 3.0 ports, SD card reader, and 100W power delivery.',
        price: 49.99,
        stock: 40,
        sku: 'HUB-ANKER-7IN1-001',
        categoryId: 'electronics',
        isActive: true,
      },
      {
        name: 'SSD Samsung 970 EVO 1TB',
        description:
          'NVMe M.2 SSD with read speeds up to 3,500 MB/s. Perfect for system upgrades and gaming.',
        price: 129.99,
        stock: 20,
        sku: 'SSD-SAMSUNG-970-1TB-001',
        categoryId: 'electronics',
        isActive: true,
      },
      {
        name: 'Router Wi-Fi 6 TP-Link',
        description:
          'High-speed Wi-Fi 6 router with dual-band, 4 antennas, and gigabit ethernet ports.',
        price: 89.99,
        stock: 18,
        sku: 'ROUTER-TPLINK-WIFI6-001',
        categoryId: 'electronics',
        isActive: true,
      },
      {
        name: 'External HDD WD 2TB',
        description:
          'Portable external hard drive with USB 3.0, compatible with Windows and Mac.',
        price: 69.99,
        stock: 35,
        sku: 'HDD-WD-2TB-001',
        categoryId: 'electronics',
        isActive: true,
      },
      {
        name: 'Microphone Blue Yeti',
        description:
          'Professional USB microphone with multiple pickup patterns. Great for podcasts and streaming.',
        price: 129.99,
        stock: 10,
        sku: 'MIC-BLUE-YETI-001',
        categoryId: 'electronics',
        isActive: true,
      },
      {
        name: 'Graphics Tablet Wacom',
        description:
          'Digital drawing tablet with 4096 pressure levels and battery-free pen.',
        price: 199.99,
        stock: 7,
        sku: 'TABLET-WACOM-INTUOS-001',
        categoryId: 'electronics',
        isActive: true,
      },
      {
        name: 'Power Bank Anker 20000mAh',
        description:
          'High-capacity portable charger with fast charging and multiple USB ports.',
        price: 39.99,
        stock: 60,
        sku: 'POWERBANK-ANKER-20K-001',
        categoryId: 'electronics',
        isActive: true,
      },
      {
        name: 'Smart Speaker Amazon Echo',
        description:
          'Voice-controlled smart speaker with Alexa, premium sound, and smart home hub.',
        price: 99.99,
        stock: 22,
        sku: 'SPEAKER-ECHO-DOT4-001',
        categoryId: 'electronics',
        isActive: true,
      },
      {
        name: 'Desk Lamp LED Adjustable',
        description:
          'Modern LED desk lamp with adjustable brightness, color temperature, and USB charging port.',
        price: 34.99,
        stock: 45,
        sku: 'LAMP-LED-DESK-001',
        categoryId: 'office',
        isActive: true,
      },
      {
        name: 'Office Chair Ergonomic',
        description:
          'Comfortable ergonomic office chair with lumbar support, adjustable height, and breathable mesh.',
        price: 249.99,
        stock: 5,
        sku: 'CHAIR-ERGO-MESH-001',
        categoryId: 'office',
        isActive: true,
      },
      {
        name: 'Standing Desk Electric',
        description:
          'Height-adjustable standing desk with memory presets and sturdy steel frame.',
        price: 449.99,
        stock: 3,
        sku: 'DESK-STAND-ELEC-001',
        categoryId: 'office',
        isActive: true,
      },
      {
        name: 'Cable Management Kit',
        description:
          'Complete cable management solution with clips, sleeves, and ties for clean desk setup.',
        price: 19.99,
        stock: 80,
        sku: 'CABLE-MGMT-KIT-001',
        categoryId: 'office',
        isActive: true,
      },
      {
        name: 'Laptop Stand Aluminum',
        description:
          'Adjustable aluminum laptop stand with ventilation holes and non-slip surface.',
        price: 44.99,
        stock: 28,
        sku: 'STAND-LAPTOP-ALU-001',
        categoryId: 'office',
        isActive: true,
      },
      {
        name: 'Notebook Moleskine Classic',
        description:
          'Premium hardcover notebook with dotted pages, elastic closure, and bookmark ribbon.',
        price: 18.99,
        stock: 100,
        sku: 'NOTEBOOK-MOLESKIN-001',
        categoryId: 'office',
        isActive: true,
      },
    ];

    const entities = products.map((product) =>
      productRepository.create(product),
    );

    await productRepository.save(entities);

    console.log(`✅ Successfully seeded ${products.length} products`);
  }
}
