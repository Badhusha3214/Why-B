require('dotenv').config();
const mongoose = require('mongoose');

const Category  = require('./src/models/category.model');
const Tag       = require('./src/models/tag.model');
const Component = require('./src/models/component.model');
const Product   = require('./src/models/product.model');
const Customer  = require('./src/models/customer.model');
const Order     = require('./src/models/order.model');
const Coupon    = require('./src/models/coupon.model');
const Banner    = require('./src/models/banner.model');
const Review    = require('./src/models/review.model');

const clearOnly = process.argv.includes('--clear-only');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB...');

  // â”€â”€â”€ Clear existing data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  await Promise.all([
    Category.deleteMany(),
    Tag.deleteMany(),
    Component.deleteMany(),
    Product.deleteMany(),
    Customer.deleteMany(),
    Order.deleteMany(),
    Coupon.deleteMany(),
    Banner.deleteMany(),
    Review.deleteMany(),
  ]);
  console.log('Old data cleared.');


  if (clearOnly) {
    console.log('--clear-only: database wiped. No new data inserted.');
    await mongoose.disconnect();
    process.exit(0);
  }

  // â”€â”€â”€ Categories â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Each category represents a domain of STEAM / Robotics education
  const [roboticsKits, arduinoIoT, sensors, printing3D, scienceKits] = await Category.insertMany([
    {
      name: 'Robotics Kits',
      slug: 'robotics-kits',
      description: 'Complete robot-building kits for beginners to advanced learners. Includes chassis, motors, controllers and full assembly guides.',
      status: 'active',
    },
    {
      name: 'Arduino & IoT',
      slug: 'arduino-iot',
      description: 'Microcontroller boards, IoT shields, and starter packs for coding and electronics projects.',
      status: 'active',
    },
    {
      name: 'Sensors & Modules',
      slug: 'sensors-modules',
      description: 'Individual sensor modules â€” ultrasonic, IR, temperature, gyroscope, and more â€” for custom builds.',
      status: 'active',
    },
    {
      name: '3D Printing',
      slug: '3d-printing',
      description: 'Desktop 3D printers, filaments, and accessories for prototyping STEAM project parts.',
      status: 'active',
    },
    {
      name: 'Science & Experiment Kits',
      slug: 'science-experiment-kits',
      description: 'Hands-on STEM experiment kits covering physics, chemistry, electronics and environmental science.',
      status: 'active',
    },
  ]);
  console.log('Categories seeded.');

  // â”€â”€â”€ Tags â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Tags let admins label projects by skill level, curriculum area, or promo status
  const [tagBeginner, tagAdvanced, tagArduino, tagRaspberryPi, tagSale, tagNew, tagAwardWinner] = await Tag.insertMany([
    { name: 'Beginner',       slug: 'beginner',        description: 'Suitable for ages 8+ with no prior experience', color: '#22c55e' },
    { name: 'Advanced',       slug: 'advanced',        description: 'For experienced builders & coders (15+)',        color: '#8b5cf6' },
    { name: 'Arduino',        slug: 'arduino',         description: 'Powered by Arduino microcontrollers',            color: '#3b82f6' },
    { name: 'Raspberry Pi',   slug: 'raspberry-pi',    description: 'Raspberry Pi based projects',                    color: '#ec4899' },
    { name: 'Sale',           slug: 'sale',            description: 'Limited-time discounted items',                  color: '#ef4444' },
    { name: 'New Arrival',    slug: 'new-arrival',     description: 'Recently launched kits',                         color: '#f97316' },
    { name: 'Award Winner',   slug: 'award-winner',    description: 'Recognised at national STEM competitions',       color: '#eab308' },
  ]);
  console.log('Tags seeded.');

  // â”€â”€â”€ Components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Components = individual parts / variants / addons that can be attached to a project kit
  const [
    servoMotor,
    dcMotorPair,
    ultrasonicSensor,
    irSensor,
    l298nDriver,
    arduino328,
    raspberryPi4,
    lipo2200,
    aluminumChassis,
    extendedWarranty,
  ] = await Component.insertMany([
    {
      name: 'SG90 Micro Servo Motor',
      type: 'part',
      description: '9g micro servo motor. Rotation: 0â€“180Â°. Torque: 1.8 kg/cm. Used for arms, grippers and steering mechanisms.',
      price: 120,
      stock: 300,
      sku: 'CMP-SRV-SG90',
      attributes: { voltage: '4.8â€“6V', torque: '1.8kg/cm', weight: '9g' },
      status: 'active',
    },
    {
      name: 'DC Gear Motor Pair (TT Motor)',
      type: 'part',
      description: 'Pair of yellow TT gear motors. 3â€“6V DC, 200 RPM. Standard fit for most 2WD and 4WD robot chassis.',
      price: 180,
      stock: 250,
      sku: 'CMP-DCM-TT2',
      attributes: { voltage: '3â€“6V', rpm: '200', quantity: '2 pcs' },
      status: 'active',
    },
    {
      name: 'HC-SR04 Ultrasonic Distance Sensor',
      type: 'part',
      description: 'Measures distance 2 cm â€“ 400 cm with Â±3 mm accuracy. Essential for obstacle-avoidance robots.',
      price: 95,
      stock: 500,
      sku: 'CMP-SEN-HCSR04',
      attributes: { range: '2â€“400cm', accuracy: 'Â±3mm', voltage: '5V' },
      status: 'active',
    },
    {
      name: 'IR Line-Tracking Sensor Module',
      type: 'part',
      description: 'Infrared sensor for line-following robots. Detects black/white contrast up to 1 cm. Digital output.',
      price: 60,
      stock: 400,
      sku: 'CMP-SEN-IR01',
      attributes: { detection: '1cm', output: 'Digital', voltage: '3.3â€“5V' },
      status: 'active',
    },
    {
      name: 'L298N Dual H-Bridge Motor Driver',
      type: 'part',
      description: 'Controls 2 DC motors or 1 stepper motor. PWM speed control. Max output 2A per channel.',
      price: 150,
      stock: 200,
      sku: 'CMP-DRV-L298N',
      attributes: { channels: '2', maxCurrent: '2A/ch', voltage: '5â€“35V' },
      status: 'active',
    },
    {
      name: 'Arduino Uno R3 (ATmega328P)',
      type: 'variant',
      description: 'The most popular open-source microcontroller board. 14 digital I/O pins, 6 PWM, 6 analog inputs.',
      price: 550,
      stock: 180,
      sku: 'CMP-MCU-UNO',
      attributes: { processor: 'ATmega328P', flash: '32KB', voltage: '5V' },
      status: 'active',
    },
    {
      name: 'Raspberry Pi 4 Model B (4GB)',
      type: 'variant',
      description: 'Quad-core ARM Cortex-A72 SBC. 4GB LPDDR4. Dual HDMI, USB 3.0, Gigabit Ethernet. For advanced AI/vision robots.',
      price: 4500,
      stock: 60,
      sku: 'CMP-SBC-RPI4',
      attributes: { processor: 'Cortex-A72', ram: '4GB', os: 'Raspberry Pi OS' },
      status: 'active',
    },
    {
      name: 'LiPo Battery 7.4V 2200mAh',
      type: 'addon',
      description: '2S LiPo rechargeable battery pack. Ideal for mobile robots requiring sustained runtime (60â€“90 min).',
      price: 799,
      stock: 120,
      sku: 'CMP-BAT-LIPO22',
      attributes: { voltage: '7.4V', capacity: '2200mAh', connector: 'XT60' },
      status: 'active',
    },
    {
      name: 'Aluminium Alloy Robot Chassis',
      type: 'variant',
      description: 'Lightweight aluminium 4WD chassis (250Ã—190mm). Pre-drilled mounting holes for Arduino and Raspberry Pi.',
      price: 650,
      stock: 80,
      sku: 'CMP-CHS-ALU4WD',
      attributes: { material: 'Aluminium', size: '250Ã—190mm', wheels: '4' },
      status: 'active',
    },
    {
      name: '1-Year Extended Warranty',
      type: 'addon',
      description: 'Extends standard 6-month warranty to 18 months. Covers manufacturing defects and free component replacement.',
      price: 499,
      stock: 999,
      sku: 'CMP-WRN-1YR',
      status: 'active',
    },
  ]);
  console.log('Components seeded.');

  // â”€â”€â”€ Products (Project Kits) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Each product is a complete STEAM kit sold to schools, students, or hobbyists
  const [obstacleRobot, lineFollower, arduinoStarter, aiVisionBot, weatherStation, printer3d] = await Product.insertMany([
    {
      name: 'ObstaClear 4WD Obstacle-Avoidance Robot Kit',
      slug: 'obstaclear-4wd-obstacle-avoidance-robot-kit',
      description: `Build a fully autonomous 4-wheel drive robot that detects and avoids obstacles in real time using ultrasonic sensors and servo-mounted radar scanning.

Includes step-by-step assembly guide, Arduino source code, and a 30-page STEAM workbook covering robotics fundamentals, C++ programming, motor control, and sensor integration. Ideal for school science exhibitions and robotics club workshops.`,
      shortDescription: '4WD â€¢ Ultrasonic radar â€¢ Arduino Uno â€¢ STEAM workbook',
      price: 2999,
      salePrice: 2499,
      images: ['https://placehold.co/600x400?text=ObstaClear+Robot'],
      category: roboticsKits._id,
      tags: [tagBeginner._id, tagArduino._id, tagSale._id],
      components: [dcMotorPair._id, ultrasonicSensor._id, irSensor._id, l298nDriver._id, arduino328._id, lipo2200._id, aluminumChassis._id, extendedWarranty._id],
      stock: 60,
      sku: 'KIT-ROB-OBS4WD',
      status: 'active',
      isFeatured: true,
      attributes: { ageGroup: '12+', difficulty: 'Beginner', programmingLang: 'C++ / Arduino IDE', assemblyTime: '2â€“3 hours' },
    },
    {
      name: 'TrackMaster Line-Following Robot Kit',
      slug: 'trackmaster-line-following-robot-kit',
      description: `A classic STEAM project that teaches PID control, sensor arrays, and feedback loops. The robot follows a black line on white surface at adjustable speeds using 5 IR sensors.

Kit includes chassis, IR sensor array, motor driver, Arduino Nano, jumper wires, line-track mat (A2 size), and a coding guide. Great for inter-school robotics competitions.`,
      shortDescription: '5-IR array â€¢ PID control â€¢ Competition-ready â€¢ Track mat included',
      price: 1999,
      images: ['https://placehold.co/600x400?text=TrackMaster+Robot'],
      category: roboticsKits._id,
      tags: [tagBeginner._id, tagArduino._id, tagAwardWinner._id],
      components: [dcMotorPair._id, irSensor._id, l298nDriver._id, arduino328._id, extendedWarranty._id],
      stock: 80,
      sku: 'KIT-ROB-LNFLW',
      status: 'active',
      isFeatured: false,
      attributes: { ageGroup: '10+', difficulty: 'Beginnerâ€“Intermediate', programmingLang: 'Arduino IDE', trackMatIncluded: 'Yes' },
    },
    {
      name: 'Arduino Mega STEAM Starter Kit',
      slug: 'arduino-mega-steam-starter-kit',
      description: `Everything a beginner needs to start learning electronics and programming from scratch. Includes 50+ components â€” LEDs, resistors, LCDs, buzzers, push buttons, servo, temperature sensor, potentiometers, breadboard, and jumper wires â€” all in a compartmentalised storage box.

Comes with 30 guided projects ranging from blinking an LED to building a digital thermometer. Perfect first kit for ages 10 and above.`,
      shortDescription: '50+ components â€¢ 30 guided projects â€¢ Arduino Mega 2560 â€¢ Storage box',
      price: 3499,
      salePrice: 2999,
      images: ['https://placehold.co/600x400?text=Arduino+Starter+Kit'],
      category: arduinoIoT._id,
      tags: [tagBeginner._id, tagArduino._id, tagNew._id, tagSale._id],
      components: [arduino328._id, servoMotor._id, ultrasonicSensor._id, extendedWarranty._id],
      stock: 120,
      sku: 'KIT-ARD-MEGA-STRT',
      status: 'active',
      isFeatured: true,
      attributes: { ageGroup: '10+', difficulty: 'Beginner', components: '50+', projects: '30', storageBox: 'Yes' },
    },
    {
      name: 'VisionBot AI Robot with Raspberry Pi 4',
      slug: 'visionbot-ai-robot-raspberry-pi-4',
      description: `Advanced AI/ML robot using Raspberry Pi 4 and an 8MP camera module for real-time object detection (TensorFlow Lite), face recognition, and gesture control.

Includes Pi 4 (4GB), camera, aluminium chassis, servo arm, LiPo battery, motor driver, and a comprehensive Python + AI workbook (OpenCV, TensorFlow Lite). Designed for advanced students, engineering colleges, and STEM research labs.`,
      shortDescription: 'Raspberry Pi 4 â€¢ Object detection â€¢ Servo arm â€¢ Python AI workbook',
      price: 12999,
      images: ['https://placehold.co/600x400?text=VisionBot+AI'],
      category: roboticsKits._id,
      tags: [tagAdvanced._id, tagRaspberryPi._id, tagNew._id],
      components: [raspberryPi4._id, servoMotor._id, l298nDriver._id, lipo2200._id, aluminumChassis._id, extendedWarranty._id],
      stock: 25,
      sku: 'KIT-ROB-VISBOT',
      status: 'active',
      isFeatured: true,
      attributes: { ageGroup: '16+', difficulty: 'Advanced', programmingLang: 'Python 3', aiFramework: 'TensorFlow Lite / OpenCV', camera: '8MP' },
    },
    {
      name: 'AgroSense IoT Weather Station Kit',
      slug: 'agrosense-iot-weather-station-kit',
      description: `Build a real-time IoT weather station that reads temperature, humidity, air pressure, UV index, and rainfall, then pushes data to a cloud dashboard (ThingSpeak / Blynk).

Includes Arduino Uno, DHT22, BMP280, UV sensor, rain gauge module, OLED display, WiFi shield, and a wiring guide. Teaches IoT protocols (MQTT), data logging, and environmental science concepts.`,
      shortDescription: 'Multiple sensors â€¢ WiFi â€¢ Cloud dashboard â€¢ IoT protocols',
      price: 2199,
      images: ['https://placehold.co/600x400?text=AgroSense+IoT'],
      category: arduinoIoT._id,
      tags: [tagArduino._id, tagNew._id, tagAwardWinner._id],
      components: [arduino328._id, ultrasonicSensor._id, extendedWarranty._id],
      stock: 70,
      sku: 'KIT-IOT-WTHSTN',
      status: 'active',
      isFeatured: false,
      attributes: { ageGroup: '13+', difficulty: 'Intermediate', connectivity: 'WiFi / MQTT', cloudPlatform: 'ThingSpeak, Blynk' },
    },
    {
      name: 'PrintBot Mini Desktop 3D Printer Kit',
      slug: 'printbot-mini-desktop-3d-printer-kit',
      description: `A fully functional FDM desktop 3D printer kit designed for STEAM classrooms and maker spaces. Print volume: 180Ã—180Ã—180mm. 0.1mm layer resolution. Compatible with PLA, PETG, and TPU filaments.

Comes partially pre-assembled with full wiring harness. Students learn mechanical assembly, G-code programming, and iterative design thinking. Includes 500g white PLA spool and Cura slicing software guide.`,
      shortDescription: '180Ã—180Ã—180mm â€¢ 0.1mm resolution â€¢ PLA/PETG/TPU â€¢ 500g filament included',
      price: 15999,
      salePrice: 13999,
      images: ['https://placehold.co/600x400?text=PrintBot+Mini+3D'],
      category: printing3D._id,
      tags: [tagAdvanced._id, tagSale._id, tagNew._id],
      components: [extendedWarranty._id],
      stock: 20,
      sku: 'KIT-3DP-PRTBOT',
      status: 'active',
      isFeatured: true,
      attributes: { ageGroup: '14+', difficulty: 'Intermediateâ€“Advanced', printVolume: '180Ã—180Ã—180mm', resolution: '0.1mm', filamentIncluded: '500g PLA' },
    },
  ]);
  console.log('Products seeded.');


  // ─── Additional Components (Drone, RC Car, Drip Irrigation, Robotic Arm) ─
  const [
    brushlessMotor,
    esc30a,
    flightController,
    droneFrame,
    propellerSet,
    lipo3s1500,
    esp32,
    nrf24l01,
    rcCarChassis,
    mgServo,
    waterPump,
    soilMoisture,
    relayModule,
    lcdI2C,
    stepperMotor,
    motorShield,
  ] = await Component.insertMany([
    {
      name: 'Brushless Motor 2300KV (x4)',
      type: 'part',
      description: 'Set of 4x 2300KV brushless outrunner motors for 250mm FPV racing drones.',
      price: 1200, stock: 80, sku: 'CMP-BLM-2300KV',
      attributes: { kv: '2300', quantity: '4 pcs', frameSize: '250mm' }, status: 'active',
    },
    {
      name: '30A ESC Electronic Speed Controller (x4)',
      type: 'part',
      description: '4-in-1 30A ESC stack for quadcopters. BLHeli_S firmware, DSHOT600 compatible.',
      price: 1800, stock: 60, sku: 'CMP-ESC-30A',
      attributes: { current: '30A', firmware: 'BLHeli_S', protocol: 'DSHOT600' }, status: 'active',
    },
    {
      name: 'F4 Flight Controller (Betaflight)',
      type: 'part',
      description: 'F4 FC with MPU6000 gyro, barometer, OSD, USB-C. Betaflight firmware.',
      price: 1400, stock: 50, sku: 'CMP-FC-F4BFLY',
      attributes: { gyro: 'MPU6000', firmware: 'Betaflight', port: 'USB-C' }, status: 'active',
    },
    {
      name: '250mm FPV Drone Frame Kit',
      type: 'variant',
      description: 'Carbon-fibre 250mm quadcopter frame with arms, standoffs, and all hardware.',
      price: 950, stock: 70, sku: 'CMP-FRM-250CF',
      attributes: { material: 'Carbon Fibre', wheelbase: '250mm', weight: '95g' }, status: 'active',
    },
    {
      name: '5045 3-Blade Propeller Set (4 pairs)',
      type: 'part',
      description: '5 inch 3-blade props, 4 CW + 4 CCW. Polycarbonate, quick-release hub.',
      price: 320, stock: 200, sku: 'CMP-PROP-5045',
      attributes: { size: '5 inch', blades: '3', pairs: '4' }, status: 'active',
    },
    {
      name: 'LiPo Battery 11.1V 1500mAh 3S 45C',
      type: 'addon',
      description: '3S 1500mAh 45C LiPo for FPV drones. XT60 connector. ~6-8 min flight time.',
      price: 1100, stock: 90, sku: 'CMP-BAT-3S1500',
      attributes: { voltage: '11.1V', capacity: '1500mAh', discharge: '45C', connector: 'XT60' }, status: 'active',
    },
    {
      name: 'ESP32 DevKit v1 (WiFi + Bluetooth)',
      type: 'variant',
      description: 'Dual-core 240MHz MCU with WiFi and Bluetooth. 30 GPIO pins.',
      price: 480, stock: 150, sku: 'CMP-MCU-ESP32',
      attributes: { processor: 'Xtensa 240MHz', wifi: '802.11 b/g/n', bluetooth: 'BT 4.2 + BLE' }, status: 'active',
    },
    {
      name: 'NRF24L01+ 2.4GHz RF Transceiver',
      type: 'part',
      description: 'Wireless 2.4GHz transceiver for RC remote controls. Up to 100m range. SPI.',
      price: 110, stock: 300, sku: 'CMP-RF-NRF24',
      attributes: { frequency: '2.4GHz', range: '100m', interface: 'SPI' }, status: 'active',
    },
    {
      name: 'RC Car Chassis with Wheels & Motors',
      type: 'variant',
      description: '2-layer acrylic smart car chassis with 4x TT motors, 4x wheels, encoder discs.',
      price: 580, stock: 100, sku: 'CMP-CHS-RCCAR',
      attributes: { layers: '2', motors: '4 x TT', material: 'Acrylic' }, status: 'active',
    },
    {
      name: 'MG996R High-Torque Servo Motor',
      type: 'part',
      description: '11kg/cm metal-gear servo for RC steering, robotic arm joints, pan-tilt.',
      price: 280, stock: 160, sku: 'CMP-SRV-MG996',
      attributes: { torque: '11kg/cm', voltage: '4.8-7.2V', gear: 'Metal' }, status: 'active',
    },
    {
      name: 'Mini Submersible Water Pump (3-5V DC)',
      type: 'part',
      description: 'Small DC submersible pump. 80-120 L/hr. For drip irrigation and hydroponics.',
      price: 130, stock: 200, sku: 'CMP-PMP-MINI',
      attributes: { voltage: '3-5V', flow: '120L/hr', type: 'Submersible' }, status: 'active',
    },
    {
      name: 'Soil Moisture Sensor Module',
      type: 'part',
      description: 'Capacitive soil moisture sensor. Analog + digital output. No corrosion.',
      price: 75, stock: 350, sku: 'CMP-SEN-SOIL',
      attributes: { output: 'Analog + Digital', voltage: '3.3-5V', type: 'Capacitive' }, status: 'active',
    },
    {
      name: '5V 1-Channel Relay Module',
      type: 'part',
      description: 'Optocoupler-isolated relay. Controls 250V AC or 30V DC loads from MCUs.',
      price: 55, stock: 400, sku: 'CMP-RLY-5V1CH',
      attributes: { voltage: '5V coil', loadAC: '250V/10A', loadDC: '30V/10A' }, status: 'active',
    },
    {
      name: '16x2 LCD Display with I2C Adapter',
      type: 'part',
      description: '16x2 character LCD with I2C backpack. Only 2 wires to Arduino.',
      price: 160, stock: 220, sku: 'CMP-LCD-1602I2C',
      attributes: { size: '16x2', interface: 'I2C', voltage: '5V' }, status: 'active',
    },
    {
      name: 'NEMA 17 Stepper Motor',
      type: 'part',
      description: '1.8 deg step angle, 200 steps/rev. 0.4Nm torque. For robotic arms and CNC.',
      price: 650, stock: 80, sku: 'CMP-STP-NEMA17',
      attributes: { stepAngle: '1.8deg', steps: '200/rev', torque: '0.4Nm', voltage: '12V' }, status: 'active',
    },
    {
      name: 'L293D Motor Shield for Arduino',
      type: 'part',
      description: 'Controls 4 DC motors or 2 steppers + 2 servos. Stacks on Arduino Uno/Mega.',
      price: 220, stock: 130, sku: 'CMP-DRV-L293DSHLD',
      attributes: { channels: '4 DC / 2 Stepper', servoPorts: '2', voltage: '4.5-36V' }, status: 'active',
    },
  ]);
  console.log('Extra components seeded.');

  // ─── New Projects (Drone, RC Car, Drip Irrigation, Robotic Arm, CNC) ──────
  await Product.insertMany([
    {
      name: 'QuadFlyer 250 FPV Racing Drone Kit',
      slug: 'quadflyer-250-fpv-racing-drone-kit',
      description: 'Build a real FPV racing quadcopter from scratch. Teaches aerodynamics, PID tuning, ESC calibration, and Betaflight configuration. Includes carbon-fibre 250mm frame, 4x 2300KV brushless motors, 4-in-1 30A ESC, F4 flight controller, 3S 1500mAh LiPo, propellers, full assembly + Betaflight setup guide.',
      shortDescription: '250mm carbon frame • 2300KV motors • F4 FC • Betaflight • 3S LiPo',
      price: 7499, salePrice: 6499,
      images: ['https://placehold.co/600x400?text=QuadFlyer+250+Drone'],
      category: roboticsKits._id,
      tags: [tagAdvanced._id, tagNew._id, tagSale._id],
      components: [brushlessMotor._id, esc30a._id, flightController._id, droneFrame._id, propellerSet._id, lipo3s1500._id, extendedWarranty._id],
      stock: 40, sku: 'KIT-DRN-QUAD250', status: 'active', isFeatured: true,
      attributes: { ageGroup: '15+', difficulty: 'Advanced', frameSize: '250mm', flightTime: '6-8 min' },
    },
    {
      name: 'Arduino Wireless RC Car Kit',
      slug: 'arduino-wireless-rc-car-kit',
      description: 'Build your own radio-controlled car with a custom NRF24L01 wireless controller and program it yourself using Arduino. Includes RC car chassis (4 motors + wheels), Arduino Uno for car, Arduino Nano for remote, NRF24L01 modules x2, L298N motor driver, LiPo battery, joystick module, and full guide. Teaches: 2.4GHz wireless, motor control, PWM, joystick input.',
      shortDescription: '2.4GHz NRF24L01 remote • L298N • Arduino Uno + Nano • DIY joystick controller',
      price: 2799,
      images: ['https://placehold.co/600x400?text=Arduino+RC+Car'],
      category: roboticsKits._id,
      tags: [tagBeginner._id, tagArduino._id, tagNew._id],
      components: [rcCarChassis._id, arduino328._id, nrf24l01._id, l298nDriver._id, lipo2200._id, extendedWarranty._id],
      stock: 75, sku: 'KIT-ROB-RCCAR', status: 'active', isFeatured: true,
      attributes: { ageGroup: '12+', difficulty: 'Beginner-Intermediate', range: '~50m', remoteIncluded: 'Yes (DIY)' },
    },
    {
      name: 'Smart Drip Irrigation System Kit',
      slug: 'smart-drip-irrigation-system-kit',
      description: 'Build an automated plant watering system that reads soil moisture and turns a water pump on/off via relay. Includes Arduino Uno, capacitive soil moisture sensor, 5V relay module, mini submersible water pump, silicone tubing, 16x2 I2C LCD, and power supply. Advanced path: add ESP32 for WiFi monitoring via Blynk app. Teaches: sensor interfacing, relay control, IoT automation.',
      shortDescription: 'Capacitive soil sensor • Auto pump via relay • LCD display • ESP32 WiFi upgrade path',
      price: 1499, salePrice: 1299,
      images: ['https://placehold.co/600x400?text=Drip+Irrigation+Kit'],
      category: arduinoIoT._id,
      tags: [tagBeginner._id, tagArduino._id, tagAwardWinner._id, tagSale._id],
      components: [arduino328._id, soilMoisture._id, relayModule._id, waterPump._id, lcdI2C._id, esp32._id, extendedWarranty._id],
      stock: 100, sku: 'KIT-IOT-DRIP', status: 'active', isFeatured: true,
      attributes: { ageGroup: '11+', difficulty: 'Beginner', automation: 'Yes', iotUpgrade: 'ESP32 + Blynk' },
    },
    {
      name: '4-DOF Robotic Arm Kit',
      slug: '4-dof-robotic-arm-kit',
      description: 'Assemble and program a 4-degree-of-freedom robotic arm with 4x MG996R servos controlled by Arduino Mega + L293D motor shield. Kit includes laser-cut acrylic frame, 4x MG996R servos, Arduino Mega 2560, motor shield, HC-05 Bluetooth module, and calibration guide. 3 control modes: manual potentiometers, Bluetooth app, and sequence playback. Teaches: servo control, kinematics, serial communication.',
      shortDescription: '4-DOF • MG996R servos • Arduino Mega • Bluetooth + potentiometer + sequence modes',
      price: 3999, salePrice: 3499,
      images: ['https://placehold.co/600x400?text=Robotic+Arm+4DOF'],
      category: roboticsKits._id,
      tags: [tagAdvanced._id, tagArduino._id, tagNew._id, tagSale._id],
      components: [mgServo._id, arduino328._id, motorShield._id, lcdI2C._id, extendedWarranty._id],
      stock: 50, sku: 'KIT-ROB-ARM4DOF', status: 'active', isFeatured: false,
      attributes: { ageGroup: '14+', difficulty: 'Intermediate-Advanced', dof: '4', controlModes: 'Potentiometer, Bluetooth, Sequence' },
    },
    {
      name: 'CNC Pen Plotter Drawing Robot Kit',
      slug: 'cnc-pen-plotter-drawing-robot',
      description: 'Build a working 2-axis CNC pen plotter that draws any design from a G-code file. Uses 2x NEMA 17 stepper motors, Arduino Mega, and GRBL firmware. Students design in Inkscape, export G-code, and watch the machine draw in real time. Kit includes: 2x NEMA 17 steppers, A4-size aluminium frame, linear rails, GT2 belt, CNC Shield v3, A4988 drivers, pen holder, and GRBL guide.',
      shortDescription: 'A4 size • NEMA 17 steppers • GRBL firmware • Inkscape compatible',
      price: 5499,
      images: ['https://placehold.co/600x400?text=CNC+Pen+Plotter'],
      category: roboticsKits._id,
      tags: [tagAdvanced._id, tagArduino._id, tagNew._id],
      components: [stepperMotor._id, arduino328._id, motorShield._id, extendedWarranty._id],
      stock: 30, sku: 'KIT-CNC-PLOTTER', status: 'active', isFeatured: false,
      attributes: { ageGroup: '15+', difficulty: 'Advanced', workArea: 'A4 (210x297mm)', firmware: 'GRBL' },
    },
  ]);
  console.log('New projects seeded.');
  // â”€â”€â”€ Customers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Customers are schools, college labs, and individual students/hobbyists
  const [greenwoodSchool, aravind, nithyaLab] = await Customer.insertMany([
    {
      name: 'Greenwood Public School',
      email: 'procurement@greenwoodschool.edu.in',
      phone: '+91 9876543210',
      addresses: [{
        label: 'School',
        street: 'No. 5, Rajaji Nagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        zipCode: '560010',
        country: 'India',
        isDefault: true,
      }],
      status: 'active',
      totalOrders: 4,
      totalSpent: 89960,
      notes: 'Bulk orders for inter-school robotics club. Request school PO invoice.',
    },
    {
      name: 'Aravind Krishnan',
      email: 'aravind.k@example.com',
      phone: '+91 9123456780',
      addresses: [{
        label: 'Home',
        street: '14-B Velachery Main Road',
        city: 'Chennai',
        state: 'Tamil Nadu',
        zipCode: '600042',
        country: 'India',
        isDefault: true,
      }],
      status: 'active',
      totalOrders: 2,
      totalSpent: 15998,
      notes: 'College student, frequently purchases Arduino components.',
    },
    {
      name: 'Nithya Robotics Lab â€“ CUSAT',
      email: 'lab@nithyarobotics.ac.in',
      phone: '+91 9988776655',
      addresses: [{
        label: 'Lab',
        street: 'CUSAT Campus, Kalamassery',
        city: 'Ernakulam',
        state: 'Kerala',
        zipCode: '682022',
        country: 'India',
        isDefault: true,
      }],
      status: 'active',
      totalOrders: 6,
      totalSpent: 142000,
      notes: 'University research lab. Eligible for institutional discount.',
    },
  ]);
  console.log('Customers seeded.');

  // â”€â”€â”€ Coupons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Coupons drive sales for schools, first-time buyers, and competition seasons
  const [couponStem, couponSchool, couponRoboFest] = await Coupon.insertMany([
    {
      code: 'STEAM10',
      description: '10% off for first-time STEAM kit buyers',
      type: 'percentage',
      value: 10,
      minOrderAmount: 1000,
      maxUses: 500,
      usedCount: 38,
      expiresAt: new Date('2026-12-31'),
      status: 'active',
    },
    {
      code: 'SCHOOL500',
      description: 'Flat â‚¹500 off on school bulk orders above â‚¹5000',
      type: 'fixed',
      value: 500,
      minOrderAmount: 5000,
      maxUses: 200,
      usedCount: 22,
      expiresAt: new Date('2026-10-31'),
      status: 'active',
    },
    {
      code: 'ROBOFEST25',
      description: '25% off â€” RoboFest 2026 competition season special',
      type: 'percentage',
      value: 25,
      minOrderAmount: 1500,
      maxUses: 100,
      usedCount: 67,
      expiresAt: new Date('2026-07-31'),
      status: 'active',
    },
  ]);
  console.log('Coupons seeded.');

  // â”€â”€â”€ Orders â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  await Order.insertMany([
    {
      customer: greenwoodSchool._id,
      items: [
        { product: obstacleRobot._id,  quantity: 10, price: 2499, components: [aluminumChassis._id, extendedWarranty._id] },
        { product: lineFollower._id,   quantity: 5,  price: 1999, components: [extendedWarranty._id] },
      ],
      totalAmount: 34990,
      discountAmount: 500,
      coupon: couponSchool._id,
      status: 'delivered',
      paymentStatus: 'paid',
      paymentMethod: 'Bank Transfer',
      shippingAddress: { street: 'No. 5, Rajaji Nagar', city: 'Bengaluru', state: 'Karnataka', zipCode: '560010', country: 'India' },
      notes: 'Ordered for Annual Robotics Day event. Deliver before April 18.',
    },
    {
      customer: aravind._id,
      items: [
        { product: arduinoStarter._id, quantity: 1, price: 2999, components: [arduino328._id] },
      ],
      totalAmount: 2699,
      discountAmount: 300,
      coupon: couponStem._id,
      status: 'shipped',
      paymentStatus: 'paid',
      paymentMethod: 'UPI',
      shippingAddress: { street: '14-B Velachery Main Road', city: 'Chennai', state: 'Tamil Nadu', zipCode: '600042', country: 'India' },
    },
    {
      customer: nithyaLab._id,
      items: [
        { product: aiVisionBot._id, quantity: 3, price: 12999, components: [raspberryPi4._id, lipo2200._id, extendedWarranty._id] },
        { product: printer3d._id,   quantity: 1, price: 13999, components: [extendedWarranty._id] },
      ],
      totalAmount: 52996,
      discountAmount: 13250,
      coupon: couponRoboFest._id,
      status: 'processing',
      paymentStatus: 'paid',
      paymentMethod: 'Credit Card',
      shippingAddress: { street: 'CUSAT Campus, Kalamassery', city: 'Ernakulam', state: 'Kerala', zipCode: '682022', country: 'India' },
      notes: 'For M.Tech robotics research project. Include GST invoice.',
    },
  ]);
  console.log('Orders seeded.');

  // â”€â”€â”€ Banners â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  await Banner.insertMany([
    {
      title: 'RoboFest 2026 â€“ Get Competition-Ready!',
      subtitle: 'Up to 25% off on all Robot Kits',
      description: 'The biggest school robotics competition of the year is here. Pick up your kit today and start building. Limited stock â€” early orders get a free track mat.',
      image: 'https://placehold.co/1200x400?text=RoboFest+2026',
      link: '/products?category=robotics-kits&tag=sale',
      position: 'home_top',
      order: 1,
      status: 'active',
      startsAt: new Date('2026-04-01'),
      endsAt: new Date('2026-07-31'),
    },
    {
      title: 'Introducing VisionBot â€“ AI Robotics for Advanced Learners',
      subtitle: 'Raspberry Pi 4 â€¢ Object Detection â€¢ Gesture Control',
      description: 'Experience the future of robotics with real-time AI and computer vision. Designed for engineering students and research labs.',
      image: 'https://placehold.co/1200x400?text=VisionBot+AI+Launch',
      link: '/products/visionbot-ai-robot-raspberry-pi-4',
      position: 'home_middle',
      order: 2,
      status: 'active',
    },
    {
      title: 'School Bulk Order Programme',
      subtitle: 'Special pricing for institutions',
      description: 'Order 10+ kits and unlock exclusive school pricing, GST invoices, and free curriculum workshop support. Use code SCHOOL500.',
      image: 'https://placehold.co/600x600?text=School+Bulk+Orders',
      link: '/contact',
      position: 'sidebar',
      order: 1,
      status: 'active',
    },
    {
      title: 'Free Shipping on orders above â‚¹2000!',
      subtitle: 'Valid this week only',
      description: 'Stock up on sensors, modules and starter kits. Free shipping auto-applied at checkout.',
      image: 'https://placehold.co/600x300?text=Free+Shipping',
      link: '/products?category=sensors-modules',
      position: 'popup',
      order: 1,
      status: 'active',
      endsAt: new Date('2026-04-20'),
    },
  ]);
  console.log('Banners seeded.');

  // â”€â”€â”€ Reviews â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  await Review.insertMany([
    {
      product: obstacleRobot._id,
      customer: greenwoodSchool._id,
      rating: 5,
      title: 'Perfect for our Robotics Day!',
      body: 'We ordered 10 kits for our annual robotics event and every single one assembled smoothly. The STEAM workbook is excellent â€” teachers loved the curriculum alignment. Will definitely reorder.',
      status: 'approved',
      adminReply: "Thank you! We are proud to support Greenwood's Robotics Day. See you at RoboFest 2026! ðŸ¤–",
    },
    {
      product: arduinoStarter._id,
      customer: aravind._id,
      rating: 5,
      title: 'Best starter kit I have ever used',
      body: 'Went from zero Arduino experience to building a mini weather station in a weekend. The 30-project guide is well written and the component quality is top notch. The storage box is a bonus!',
      status: 'approved',
      adminReply: 'Awesome progress, Aravind! Try the IoT Weather Station kit as your next project.',
    },
    {
      product: aiVisionBot._id,
      customer: nithyaLab._id,
      rating: 4,
      title: 'Impressive AI capabilities, setup takes time',
      body: 'The object detection accuracy is genuinely impressive for the price. The Python workbook covers TensorFlow Lite and OpenCV clearly. Took about half a day to set up the Pi environment but the documentation is thorough.',
      status: 'approved',
    },
    {
      product: lineFollower._id,
      customer: greenwoodSchool._id,
      rating: 5,
      title: 'Won 1st place at district competition!',
      body: 'Our team used TrackMaster at the district-level line-following competition and took first place. The PID tuning guide in the manual was key. Already planning to order more for next semester.',
      status: 'approved',
      adminReply: 'Congratulations on the win! We knew you would do great. ðŸ†',
    },
    {
      product: printer3d._id,
      customer: nithyaLab._id,
      rating: 4,
      title: 'Great print quality, bed levelling tricky',
      body: 'Print quality is very good once calibrated. The auto-bed levelling is a bit fiddly to set up initially. Would appreciate a more detailed calibration video. Recommend for labs with adult supervision.',
      status: 'pending',
    },
  ]);
  console.log('Reviews seeded.');

  console.log('\nâœ… All STEAM & Robotics seed data inserted successfully!');
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});

