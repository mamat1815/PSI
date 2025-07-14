// test-db.js (versi diperbaiki)
import pg from 'pg';
const { Client } = pg;

// Ambil URL dari file .env Anda
const connectionString = "postgresql://postgres:fqtUFBWYw5jhFzrh@db.zaktscwwzerbswjodnec.supabase.co:5432/postgres";

const client = new Client({
    connectionString: connectionString,
});

async function testConnection() {
    try {
        console.log("Mencoba menghubungkan ke database...");
        await client.connect();
        console.log("✅ Koneksi berhasil!");
        const res = await client.query('SELECT NOW()');
        console.log("Hasil query waktu server:", res.rows[0]);
    } catch (err) {
        console.error("❌ Gagal terhubung ke database!");
        console.error("Error:", err.message);
    } finally {
        await client.end();
    }
}

testConnection();