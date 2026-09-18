/**
 * ═══════════════════════════════════════════════════
 * ซักป่ะ? — Centralized Pricing & Booking Config
 * Single Source of Truth for rates and calculations
 * ═══════════════════════════════════════════════════
 */

const SUKPA_PRICING = {
    // อัตราค่าบริการตามขนาดถุง
    sizes: {
        s: {
            key: 's',
            name: 'Size S',
            capacity: '9 kg',
            suitableFor: 'ผ้าชิ้นเล็ก/ผ้าใช้ประจำวัน',
            price: 50,
            fullText: 'Size S (9 kg) - 50฿',
            shortText: 'Size S (50฿)',
        },
        m: {
            key: 'm',
            name: 'Size M',
            capacity: '14 kg',
            suitableFor: 'ผ้าใช้ประจำวัน ปริมาณ 15–25 ชิ้น',
            price: 70,
            fullText: 'Size M (14 kg) - 70฿',
            shortText: 'Size M (70฿)',
        },
        l: {
            key: 'l',
            name: 'Size L',
            capacity: '18 kg',
            suitableFor: 'ผ้ากองโต ปริมาณ 25–35 ชิ้น หรือเครื่องนอนขนาดกลาง',
            price: 80,
            fullText: 'Size L (18 kg) - 80฿',
            shortText: 'Size L (80฿)',
        },
        jumbo: {
            key: 'jumbo',
            name: 'Jumbo',
            capacity: '28 kg',
            suitableFor: 'ผ้าชิ้นใหญ่พิเศษ ผ้าหนา หรือผ้ากองใหญ่',
            price: 110,
            fullText: 'Jumbo (28 kg) - 110฿',
            shortText: 'Jumbo (110฿)',
        },
    },

    // น้ำยาซักผ้า / ปรับผ้านุ่ม
    detergents: {
        own: {
            key: 'own',
            name: 'นำน้ำยามาเอง',
            desc: 'วางคู่กับถุงผ้า',
            surcharge: 0,
            fullText: 'ของตัวเอง (วางคู่กับถุงผ้า)',
            shortText: 'ฟรี (ของตัวเอง)',
        },
        shop: {
            key: 'shop',
            name: 'ร้านจัดให้',
            desc: 'ซัก+ปรับผ้านุ่ม มาตรฐาน',
            surcharge: 15,
            fullText: 'ไม่มีน้ำยา / ร้านจัดให้ (+15฿)',
            shortText: '+15฿ (ร้านจัดเตรียมให้)',
        },
    },

    // โซนจุดรับ-ส่ง
    zones: {
        off: {
            key: 'off',
            name: 'นอก มจพ.',
            desc: 'หอนอกรอบมหาวิทยาลัย',
            surcharge: 30,
            fullText: 'นอก มจพ. (30฿)',
            shortText: '30฿ (นอก มจพ.)',
        },
        on: {
            key: 'on',
            name: 'หอใน มจพ.',
            desc: 'หอพักนักศึกษาใน มจพ.',
            surcharge: 40,
            fullText: 'หอใน มจพ. (40฿)',
            shortText: '40฿ (หอใน มจพ.)',
        },
        far: {
            key: 'far',
            name: 'โซนไกล (>5 km)',
            desc: 'ระยะเกิน 5 กิโลเมตร (+55฿)',
            surcharge: 55,
            fullText: 'โซนไกล ระยะเกิน 5 โล (55฿)',
            shortText: '55฿ (โซนไกล เกิน 5 โล)',
        },
    },

    // เครื่องอบผ้า (Drying Price)
    dryers: {
        d15: {
            key: 'd15',
            name: 'เครื่องอบ 15 kg',
            capacity: '15 kg',
            duration: '24 นาที',
            suitableFor: 'ผ้าชิ้นไม่ใหญ่มาก แห้งง่าย',
            price: 50,
            fullText: 'เครื่องอบ 15 kg (24 นาที) - 50฿',
            shortText: 'อบ 15 kg (50฿)',
        },
        d25: {
            key: 'd25',
            name: 'เครื่องอบ 25 kg',
            capacity: '25 kg',
            duration: '24 นาที',
            suitableFor: 'ผ้านวมหนา, ผ้าปูที่นอน หรือผ้าปริมาณมากที่ต้องการพื้นที่ให้อากาศหมุนเวียน ผ้าจะได้แห้งทั่วถึง',
            price: 70,
            fullText: 'เครื่องอบ 25 kg (24 นาที) - 70฿',
            shortText: 'อบ 25 kg (70฿)',
        },
    },

    // ประเภทผ้า (เผื่อหน้าเก่าอ้างอิง)
    fabrics: {
        general: {
            key: 'general',
            name: 'ผ้าทั่วไป',
            desc: 'เสื้อยืด กางเกง ชุดนอน ชุดนศ.',
            fullText: 'ผ้าทั่วไป',
        },
    },

    // คูปองส่วนลดตั้งต้น
    coupons: {
        'WELCOME10': { code: 'WELCOME10', type: 'flat', amount: 10, label: 'ส่วนลดต้อนรับ 10฿' },
        'SUKPA20': { code: 'SUKPA20', type: 'flat', amount: 20, label: 'ส่วนลดพิเศษ 20฿' },
        'FREEDRY': { code: 'FREEDRY', type: 'flat', amount: 50, label: 'ส่วนลดค่าอบแห้ง 50฿' },
        'FREEDELIVERY': { code: 'FREEDELIVERY', type: 'flat', amount: 40, label: 'ฟรีค่าจัดส่ง (สะสมครบ 10 ครั้ง)' },
        'STUDENT10': { code: 'STUDENT10', type: 'percent', amount: 10, label: 'ส่วนลดนักศึกษา 10%' },
    }
};

/**
 * ดึงรายการคูปองส่วนลดทั้งหมด (รวมคูปองที่ Admin เพิ่มใหม่)
 */
function getSukpaCoupons() {
    const defaultCoupons = {
        'WELCOME10': { code: 'WELCOME10', type: 'flat', amount: 10, label: 'ส่วนลดต้อนรับ 10฿' },
        'SUKPA20': { code: 'SUKPA20', type: 'flat', amount: 20, label: 'ส่วนลดพิเศษ 20฿' },
        'FREEDRY': { code: 'FREEDRY', type: 'flat', amount: 50, label: 'ส่วนลดค่าอบแห้ง 50฿' },
        'FREEDELIVERY': { code: 'FREEDELIVERY', type: 'flat', amount: 40, label: 'ฟรีค่าจัดส่ง (สะสมครบ 10 ครั้ง)' },
        'STUDENT10': { code: 'STUDENT10', type: 'percent', amount: 10, label: 'ส่วนลดนักศึกษา 10%' },
    };
    try {
        const raw = localStorage.getItem('sp_coupons');
        if (raw !== null) {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object') {
                return parsed;
            }
        }
    } catch (e) {
        console.error('Error reading sp_coupons:', e);
    }
    localStorage.setItem('sp_coupons', JSON.stringify(defaultCoupons));
    return defaultCoupons;
}

/**
 * บันทึกรายการคูปองส่วนลดทั้งหมด
 */
function saveSukpaCoupons(couponsObj) {
    try {
        localStorage.setItem('sp_coupons', JSON.stringify(couponsObj || {}));
        return true;
    } catch (e) {
        console.error('Error saving sp_coupons:', e);
        return false;
    }
}

/**
 * ตรวจสอบและคำนวณส่วนลดจากคูปอง
 * @param {string} rawCode 
 * @param {number} subtotal 
 */
function validateCoupon(rawCode, subtotal = 0) {
    if (!rawCode || typeof rawCode !== 'string') {
        return { valid: false, message: 'กรุณากรอกโค้ดส่วนลด', discountAmount: 0 };
    }
    const code = rawCode.trim().toUpperCase();
    const activeCoupons = getSukpaCoupons();
    const coupon = activeCoupons[code];
    if (!coupon) {
        return { valid: false, message: 'ไม่พบโค้ดส่วนลดนี้ หรือโค้ดหมดอายุ', discountAmount: 0 };
    }
    let discount = 0;
    if (coupon.type === 'flat') {
        discount = Number(coupon.amount) || 0;
    } else if (coupon.type === 'percent') {
        discount = Math.round((subtotal * (Number(coupon.amount) || 0)) / 100);
    }
    discount = Math.min(discount, subtotal);
    return {
        valid: true,
        code: coupon.code,
        label: coupon.label || coupon.code,
        discountAmount: discount,
        message: `ใช้โค้ดสำเร็จ! ${coupon.label || coupon.code} (-${discount}฿)`
    };
}

/**
 * คำนวณราคารวมพร้อมรายละเอียดแต่ละส่วน
 * @param {Object} options
 * @param {string} [options.sizeKey='s'] - เครื่องซัก ('s' | 'm' | 'l' | 'jumbo')
 * @param {string} [options.dryerKey='d15'] - เครื่องอบ ('d15' | 'd25')
 * @param {string} [options.detergentKey='own'] - น้ำยา ('own' | 'shop')
 * @param {string} [options.zoneKey='off'] - จุดรับส่ง ('off' | 'on' | 'far')
 * @param {string} [options.couponCode=''] - โค้ดส่วนลด
 * @returns {{
 *   sizePrice: number,
 *   dryerPrice: number,
 *   detergentSurcharge: number,
 *   zoneSurcharge: number,
 *   subtotal: number,
 *   discountAmount: number,
 *   couponCode: string,
 *   couponInfo: Object,
 *   total: number,
 *   sizeInfo: Object,
 *   dryerInfo: Object,
 *   detergentInfo: Object,
 *   zoneInfo: Object
 * }}
 */
function calculateSukpaPrice({ sizeKey = 's', dryerKey = 'd15', detergentKey = 'own', zoneKey = 'off', couponCode = '' } = {}) {
    const sizeInfo = SUKPA_PRICING.sizes[sizeKey] || SUKPA_PRICING.sizes.s;
    const dryerInfo = SUKPA_PRICING.dryers[dryerKey] || SUKPA_PRICING.dryers.d15;
    const detergentInfo = SUKPA_PRICING.detergents[detergentKey] || SUKPA_PRICING.detergents.own;
    const zoneInfo = SUKPA_PRICING.zones[zoneKey] || SUKPA_PRICING.zones.off;

    const sizePrice = sizeInfo.price;
    const dryerPrice = dryerInfo ? dryerInfo.price : 0;
    const detergentSurcharge = detergentInfo.surcharge;
    const zoneSurcharge = zoneInfo.surcharge;
    const subtotal = sizePrice + dryerPrice + detergentSurcharge + zoneSurcharge;

    const couponRes = couponCode ? validateCoupon(couponCode, subtotal) : { valid: false, discountAmount: 0 };
    const discountAmount = couponRes.discountAmount || 0;
    const total = Math.max(0, subtotal - discountAmount);

    return {
        sizePrice,
        dryerPrice,
        detergentSurcharge,
        zoneSurcharge,
        subtotal,
        discountAmount,
        couponCode: couponRes.valid ? couponRes.code : '',
        couponInfo: couponRes,
        total,
        sizeInfo,
        dryerInfo,
        detergentInfo,
        zoneInfo,
    };
}

/**
 * สร้างข้อความจองคิวมาตรฐาน สำหรับส่งเข้า LINE OpenChat
 */
function buildSukpaBookingMessage({
    name = '',
    phone = '',
    dorm = '',
    notes = '',
    sizeKey = 's',
    dryerKey = 'd15',
    detergentKey = 'own',
    zoneKey = 'off',
    couponCode = ''
} = {}) {
    const calc = calculateSukpaPrice({ sizeKey, dryerKey, detergentKey, zoneKey, couponCode });

    const nameVal = name.trim() || 'กาย (ตัวอย่าง)';
    const phoneVal = phone.trim() || '08X-XXX-XXXX';
    const dormVal = dorm.trim() || 'หอมังกือ ตึก A';
    const notesVal = notes.trim() || '-';

    const dryerLine = calc.dryerInfo ? `💨 เครื่องอบผ้า : ${calc.dryerInfo.fullText}\n` : '';
    const dryerBillLine = calc.dryerInfo ? `  • ค่าอบ : ${calc.dryerInfo.shortText}\n` : '';
    const discountLine = calc.discountAmount > 0 ? `  • ส่วนลด (${calc.couponCode}) : -${calc.discountAmount}฿\n` : '';

    return (
        `🧺 แจ้งจองคิวซักผ้า — ซักป่ะ? 🫧\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `👤 ชื่อ/ชื่อเล่น : ${nameVal}\n` +
        `📞 เบอร์โทรศัพท์ : ${phoneVal}\n` +
        `🏢 ชื่อหอพัก : ${dormVal}\n` +
        `🧼 เครื่องซัก : ${calc.sizeInfo.fullText}\n` +
        dryerLine +
        `🧴 น้ำยาซักผ้า/ปรับผ้านุ่ม : ${calc.detergentInfo.fullText}\n` +
        `📍 จุดรับ-ส่ง : ${calc.zoneInfo.fullText}\n` +
        `📝 หมายเหตุ : ${notesVal}\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `🧾 สรุปยอดบิล:\n` +
        `  • ค่าซัก : ${calc.sizeInfo.shortText}\n` +
        dryerBillLine +
        `  • น้ำยาซัก/ปรับผ้านุ่ม : ${calc.detergentInfo.shortText}\n` +
        `  • ค่าจัดส่ง : ${calc.zoneInfo.shortText}\n` +
        discountLine +
        `  💰 รวมยอดชำระสุทธิ : ${calc.total} บาท\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `📍 นัดรับชั้นล่างใต้ตึก ขอบคุณครับ/ค่ะ 🙏`
    );
}

// Export for Node/CommonJS environments if ever needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SUKPA_PRICING,
        getSukpaCoupons,
        saveSukpaCoupons,
        validateCoupon,
        calculateSukpaPrice,
        buildSukpaBookingMessage,
    };
}
