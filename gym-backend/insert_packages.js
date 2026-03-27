const mysql = require('mysql2/promise');

async function main() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'nhattan15',
      database: 'gym_xala_db'
    });

    console.log('Connected to MySQL!');

    const packages = [
      ['Basic Starter', 'Gói tập cơ bản dành cho người mới bắt đầu làm quen với Gym, duy trì sức khỏe.', 3000000.0, 12, 30, 'NORMAL', 'Tặng 1 buổi đo inbody', 1],
      ['Premium Muscle Builder PRO', 'Gói tăng cơ cấp tốc cao cấp dưới sự hướng dẫn 1-1 sát sao. Chuyên sâu về hypertrophy và chế độ dinh dưỡng.', 25000000.0, 36, 90, 'WEIGHT_GAIN, MUSCLE', 'Tặng Whey Protein, giáo án dinh dưỡng độc quyền', 1],
      ['Fat Loss VIP Transformation', 'Giảm mỡ chuyên sâu, cam kết giảm 3-5kg. Tập luyện kết hợp HIIT và Cardio cường độ cao.', 18000000.0, 30, 90, 'WEIGHT_LOSS, CARDIO', 'Tặng Combo Detox, Đánh giá sinh học cơ thể hàng tuần', 1],
      ['Endurance & Core Master', 'Tăng cường độ bền bỉ, sức dẻo dai và core. Thích hợp cho người làm văn phòng cần cải thiện tư thế.', 10000000.0, 24, 60, 'ENDURANCE', 'Tặng Yoga Thảm', 1]
    ];

    for (const pkg of packages) {
      // Check if already exists
      const [rows] = await connection.execute('SELECT id FROM packages WHERE name = ?', [pkg[0]]);
      if (rows.length === 0) {
        await connection.execute(
          'INSERT INTO packages (name, description, price, max_sessions, duration_in_days, category, promotion, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          pkg
        );
        console.log('Inserted: ' + pkg[0]);
      } else {
        console.log('Already exists: ' + pkg[0]);
      }
    }

    await connection.end();
    console.log('DONE');
  } catch (error) {
    console.error('Database Error:', error);
  }
}

main();
