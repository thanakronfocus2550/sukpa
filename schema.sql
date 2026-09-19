-- ═══════════════════════════════════════════════════
-- ซักป่ะ? (Sukpa) - Supabase Database Initialization & Repair Schema
-- ═══════════════════════════════════════════════════

-- 1. สร้างตารางคำสั่งซื้อ (orders)
CREATE TABLE IF NOT EXISTS public.orders (
    order_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    dorm TEXT NOT NULL,
    notes TEXT DEFAULT '',
    service_name TEXT DEFAULT '',
    size_key TEXT DEFAULT '',
    dryer_key TEXT DEFAULT '',
    detergent_key TEXT DEFAULT '',
    zone_key TEXT DEFAULT '',
    size_price NUMERIC DEFAULT 0,
    dryer_price NUMERIC DEFAULT 0,
    detergent_surcharge NUMERIC DEFAULT 0,
    zone_surcharge NUMERIC DEFAULT 0,
    coupon_code TEXT DEFAULT '',
    discount_amount NUMERIC DEFAULT 0,
    total NUMERIC DEFAULT 0,
    slip_url TEXT DEFAULT '',
    delivery_photo_url TEXT DEFAULT '',
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- เพิ่มคอลัมน์ที่อาจจะขาดหายไปในกรณีที่ตาราง orders มีอยู่แล้ว
ALTER TABLE public.orders 
    ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS service_name TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS size_key TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS dryer_key TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS detergent_key TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS zone_key TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS size_price NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS dryer_price NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS detergent_surcharge NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS zone_surcharge NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS coupon_code TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS slip_url TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS delivery_photo_url TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 2. สร้างตารางคูปองส่วนลด (coupons)
CREATE TABLE IF NOT EXISTS public.coupons (
    code TEXT PRIMARY KEY,
    type TEXT NOT NULL DEFAULT 'flat',
    amount NUMERIC NOT NULL DEFAULT 0,
    label TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- เพิ่มคอลัมน์ max_uses และ used_count ในตาราง coupons
ALTER TABLE public.coupons 
    ADD COLUMN IF NOT EXISTS max_uses NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS used_count NUMERIC DEFAULT 0;

-- 3. เพิ่มข้อมูลคูปองเริ่มต้น
INSERT INTO public.coupons (code, type, amount, label) VALUES
    ('WELCOME10', 'flat', 10, 'ส่วนลดต้อนรับ 10฿'),
    ('SUKPA20', 'flat', 20, 'ส่วนลดพิเศษ 20฿'),
    ('FREEDRY', 'flat', 50, 'ส่วนลดค่าอบแห้ง 50฿'),
    ('FREEDELIVERY', 'flat', 40, 'ฟรีค่าจัดส่ง (สะสมครบ 10 ครั้ง)'),
    ('STUDENT10', 'percent', 10, 'ส่วนลดนักศึกษา 10%')
ON CONFLICT (code) DO NOTHING;

-- 4. ปิด RLS (Row Level Security) เพื่อให้เว็บอ่าน-เขียนข้อมูลได้ทันที
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons DISABLE ROW LEVEL SECURITY;

-- 5. เปิดใช้งาน Realtime แบบปลอดภัย
DO $$ 
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.coupons;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
END $$;
