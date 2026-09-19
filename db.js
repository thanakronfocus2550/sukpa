/**
 * db.js — Centralized Database & Realtime Sync Layer for "ซักป่ะ?"
 * Supports Supabase Cloud DB with seamless LocalStorage Fallback.
 */

(function (window) {
    const STORAGE_KEY_ORDERS = 'sp_orders';
    const STORAGE_KEY_URL = 'sp_supabase_url';
    const STORAGE_KEY_KEY = 'sp_supabase_key';

    const DEFAULT_URL = 'https://wukguaovtkqvzjbzlorx.supabase.co';
    const DEFAULT_KEY = 'sb_publishable_oXK_WwhxI-1aTUZ8Il3d_A_au3rF5B5';

    let supabaseClient = null;

    const SukpaDB = {
        /**
         * Initialize Supabase client if credentials are present
         */
        init() {
            const url = this.getConfig().url;
            const key = this.getConfig().key;
            if (url && key && window.supabase) {
                try {
                    supabaseClient = window.supabase.createClient(url, key);
                    console.log('⚡ Supabase DB Connected successfully!');
                } catch (err) {
                    console.error('❌ Supabase init error:', err);
                    supabaseClient = null;
                }
            } else {
                supabaseClient = null;
            }
            return supabaseClient;
        },

        /**
         * Check if Supabase client is active
         */
        isCloudEnabled() {
            if (!supabaseClient) {
                this.init();
            }
            return !!supabaseClient;
        },

        /**
         * Get saved Supabase Configuration
         */
        getConfig() {
            let rawUrl = (localStorage.getItem(STORAGE_KEY_URL) || DEFAULT_URL).trim();
            // Automatically clean /rest/v1/ or trailing slashes if user pasted REST endpoint URL
            rawUrl = rawUrl.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
            const key = (localStorage.getItem(STORAGE_KEY_KEY) || DEFAULT_KEY).trim();
            return {
                url: rawUrl,
                key: key
            };
        },

        /**
         * Save Supabase Configuration
         */
        saveConfig(url, key) {
            localStorage.setItem(STORAGE_KEY_URL, (url || '').trim());
            localStorage.setItem(STORAGE_KEY_KEY, (key || '').trim());
            return this.init();
        },

        /**
         * Map Supabase DB Row to JS Order Object format
         */
        _mapFromDb(row) {
            if (!row) return null;
            return {
                orderId: row.order_id || row.orderId || row.id || '',
                name: row.name || '',
                phone: row.phone || '',
                dorm: row.dorm || '',
                notes: row.notes || '',
                serviceName: row.service_name || row.serviceName || '',
                sizeKey: row.size_key || row.sizeKey || '',
                dryerKey: row.dryer_key || row.dryerKey || '',
                detergentKey: row.detergent_key || row.detergentKey || '',
                zoneKey: row.zone_key || row.zoneKey || '',
                sizePrice: Number(row.size_price ?? row.sizePrice ?? 0),
                dryerPrice: Number(row.dryer_price ?? row.dryerPrice ?? 0),
                detergentSurcharge: Number(row.detergent_surcharge ?? row.detergentSurcharge ?? 0),
                zoneSurcharge: Number(row.zone_surcharge ?? row.zoneSurcharge ?? 0),
                couponCode: row.coupon_code || row.couponCode || '',
                discountAmount: Number(row.discount_amount ?? row.discountAmount ?? 0),
                total: Number(row.total ?? 0),
                slipDataUrl: row.slip_url || row.slip_data_url || row.slipDataUrl || '',
                deliveryPhotoUrl: row.delivery_photo_url || row.deliveryPhotoUrl || '',
                status: row.status || 'pending',
                createdAt: row.created_at || row.createdAt || new Date().toISOString()
            };
        },

        /**
         * Map JS Order Object to Supabase DB Row format
         */
        _mapToDb(order) {
            return {
                order_id: order.orderId || order.order_id || '',
                name: order.name || '',
                phone: order.phone || '',
                dorm: order.dorm || '',
                notes: order.notes || '',
                service_name: order.serviceName || order.service_name || '',
                size_key: order.sizeKey || order.size_key || '',
                dryer_key: order.dryerKey || order.dryer_key || '',
                detergent_key: order.detergentKey || order.detergent_key || '',
                zone_key: order.zoneKey || order.zone_key || '',
                size_price: Number(order.sizePrice ?? order.size_price ?? 0),
                dryer_price: Number(order.dryerPrice ?? order.dryer_price ?? 0),
                detergent_surcharge: Number(order.detergentSurcharge ?? order.detergent_surcharge ?? 0),
                zone_surcharge: Number(order.zoneSurcharge ?? order.zone_surcharge ?? 0),
                coupon_code: order.couponCode || order.coupon_code || '',
                discount_amount: Number(order.discountAmount ?? order.discount_amount ?? 0),
                total: Number(order.total ?? 0),
                slip_url: order.slipDataUrl || order.slipUrl || order.slip_url || '',
                delivery_photo_url: order.deliveryPhotoUrl || order.delivery_photo_url || '',
                status: order.status || 'pending',
                created_at: order.createdAt || order.created_at || new Date().toISOString()
            };
        },

        /**
         * Get Local Storage Orders
         */
        getLocalOrders() {
            try {
                return JSON.parse(localStorage.getItem(STORAGE_KEY_ORDERS) || '[]');
            } catch (e) {
                return [];
            }
        },

        /**
         * Set Local Storage Orders
         */
        setLocalOrders(orders) {
            localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders || []));
        },

        /**
         * Fetch all orders (From Cloud DB if connected, fallback to LocalStorage)
         */
        /**
         * Compress base64 DataURL image (max 800px width, JPEG 0.7 quality)
         */
        compressDataUrl(dataUrl, maxWidth = 600, quality = 0.5) {
            return new Promise((resolve) => {
                if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image')) {
                    resolve(dataUrl || '');
                    return;
                }
                // If already small enough (< 50KB), return as is
                if (dataUrl.length < 50000) {
                    resolve(dataUrl);
                    return;
                }
                const img = new Image();
                img.onload = () => {
                    try {
                        const canvas = document.createElement('canvas');
                        let width = img.width;
                        let height = img.height;

                        if (width > maxWidth) {
                            height = Math.round((height * maxWidth) / width);
                            width = maxWidth;
                        }

                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);

                        const compressed = canvas.toDataURL('image/jpeg', quality);
                        resolve(compressed);
                    } catch (e) {
                        resolve(dataUrl);
                    }
                };
                img.onerror = () => resolve(dataUrl);
                img.src = dataUrl;
            });
        },

        /**
         * Fetch all orders (From Cloud DB if connected, fallback to LocalStorage)
         */
        async getOrders() {
            const localOrders = this.getLocalOrders();
            const localMap = {};
            localOrders.forEach(o => { if (o.orderId) localMap[o.orderId] = o; });

            if (this.isCloudEnabled()) {
                try {
                    const { data, error } = await supabaseClient
                        .from('orders')
                        .select('*')
                        .order('created_at', { ascending: false });

                    if (!error && Array.isArray(data)) {
                        const mappedOrders = data.map(row => {
                            const mapped = this._mapFromDb(row);
                            // Preserve local slip and delivery photo if cloud returned empty
                            if (localMap[mapped.orderId]) {
                                const loc = localMap[mapped.orderId];
                                if (!mapped.slipDataUrl && (loc.slipDataUrl || loc.slipUrl || loc.slip_url)) {
                                    mapped.slipDataUrl = loc.slipDataUrl || loc.slipUrl || loc.slip_url;
                                }
                                if (!mapped.deliveryPhotoUrl && loc.deliveryPhotoUrl) {
                                    mapped.deliveryPhotoUrl = loc.deliveryPhotoUrl;
                                }
                            }
                            return mapped;
                        });
                        this.setLocalOrders(mappedOrders);
                        return mappedOrders;
                    } else if (error) {
                        console.warn('⚠️ Supabase fetch error, using local fallback:', error.message);
                    }
                } catch (err) {
                    console.warn('⚠️ Supabase query exception, using local fallback:', err);
                }
            }
            return localOrders;
        },

        /**
         * Get single order by Order ID
         */
        async getOrderById(orderId) {
            if (!orderId) return null;
            const cleanId = orderId.replace(/^#/, '').trim();
            const upperCleanId = cleanId.toUpperCase();

            if (this.isCloudEnabled()) {
                try {
                    const { data, error } = await supabaseClient
                        .from('orders')
                        .select('*')
                        .ilike('order_id', `%${cleanId}`)
                        .limit(1);

                    if (!error && Array.isArray(data) && data.length > 0) {
                        const cloudOrd = this._mapFromDb(data[0]);
                        const local = this.getLocalOrders().find(o => o.orderId === cloudOrd.orderId);
                        if (local) {
                            if (!cloudOrd.slipDataUrl && (local.slipDataUrl || local.slipUrl || local.slip_url)) {
                                cloudOrd.slipDataUrl = local.slipDataUrl || local.slipUrl || local.slip_url;
                            }
                        }
                        return cloudOrd;
                    }
                } catch (err) {
                    console.warn('⚠️ Supabase getOrderById error:', err);
                }
            }

            const localOrders = this.getLocalOrders();
            return localOrders.find(o => {
                if (!o.orderId) return false;
                const oId = o.orderId.toUpperCase();
                return oId === upperCleanId || oId.endsWith(upperCleanId);
            }) || null;
        },

        /**
         * Save a new order
         */
        async saveOrder(orderRecord) {
            if (!orderRecord) return null;

            // Compress heavy slip / photo images if present
            if (orderRecord.slipDataUrl && orderRecord.slipDataUrl.length > 50000) {
                orderRecord.slipDataUrl = await this.compressDataUrl(orderRecord.slipDataUrl, 600, 0.5);
            }
            if (orderRecord.deliveryPhotoUrl && orderRecord.deliveryPhotoUrl.length > 50000) {
                orderRecord.deliveryPhotoUrl = await this.compressDataUrl(orderRecord.deliveryPhotoUrl, 600, 0.5);
            }

            // Always save to localStorage immediately for instant feedback
            const existing = this.getLocalOrders();
            const filtered = existing.filter(o => o.orderId !== orderRecord.orderId);
            filtered.unshift(orderRecord);
            this.setLocalOrders(filtered);

            // Sync to Supabase Cloud if available
            if (this.isCloudEnabled()) {
                try {
                    const dbRow = this._mapToDb(orderRecord);
                    let { data, error } = await supabaseClient
                        .from('orders')
                        .upsert([dbRow], { onConflict: 'order_id' });

                    if (error) {
                        console.warn('⚠️ Standard upsert error:', error.message);
                        if (error.message && (error.message.includes('Could not find') || error.message.includes('column') || error.message.includes('schema cache'))) {
                            console.warn('⚠️ Table schema mismatch detected. Retrying with basic schema fields...');
                            const baseRow = {
                                order_id: dbRow.order_id,
                                name: dbRow.name,
                                phone: dbRow.phone,
                                dorm: dbRow.dorm,
                                notes: dbRow.notes,
                                service_name: dbRow.service_name,
                                total: dbRow.total,
                                slip_url: dbRow.slip_url,
                                status: dbRow.status,
                                created_at: dbRow.created_at
                            };
                            const fallbackRes = await supabaseClient
                                .from('orders')
                                .upsert([baseRow], { onConflict: 'order_id' });

                            if (fallbackRes.error) {
                                console.error('❌ Base column fallback also failed:', fallbackRes.error.message);
                            } else {
                                console.log('✅ Order saved to Supabase Cloud via basic schema fallback!');
                            }
                        } else {
                            console.error('❌ Failed to save order to Supabase:', error.message);
                        }
                    } else {
                        console.log('✅ Order saved to Supabase Cloud!');
                    }
                } catch (err) {
                    console.error('❌ Exception saving order to Supabase:', err);
                }
            }

            // Increment coupon usage if order used a coupon
            if (orderRecord.couponCode) {
                this.incrementCouponUsage(orderRecord.couponCode).catch(() => {});
            }

            return orderRecord;
        },

        /**
         * Get Coupons (From Cloud DB if connected, fallback to LocalStorage)
         */
        async getCoupons() {
            const STORAGE_KEY_COUPONS = 'sp_coupons';
            let localCoupons = {};
            try {
                const raw = localStorage.getItem(STORAGE_KEY_COUPONS);
                if (raw) localCoupons = JSON.parse(raw) || {};
            } catch (e) { }

            if (this.isCloudEnabled()) {
                try {
                    const { data, error } = await supabaseClient
                        .from('coupons')
                        .select('*');

                    if (!error && Array.isArray(data) && data.length > 0) {
                        const cloudCoupons = {};
                        data.forEach(c => {
                            const code = (c.code || '').toUpperCase();
                            if (code) {
                                cloudCoupons[code] = {
                                    code: code,
                                    type: c.type || 'flat',
                                    amount: Number(c.amount || 0),
                                    label: c.label || code,
                                    maxUses: Number(c.max_uses ?? c.maxUses ?? 0),
                                    usedCount: Number(c.used_count ?? c.usedCount ?? 0)
                                };
                            }
                        });
                        const merged = { ...localCoupons, ...cloudCoupons };
                        localStorage.setItem(STORAGE_KEY_COUPONS, JSON.stringify(merged));
                        return merged;
                    }
                } catch (err) {
                    console.warn('⚠️ Supabase getCoupons error:', err);
                }
            }
            return localCoupons;
        },

        /**
         * Save Coupon (To Cloud DB if connected & LocalStorage)
         */
        async saveCoupon(couponObj) {
            if (!couponObj || !couponObj.code) return false;
            const STORAGE_KEY_COUPONS = 'sp_coupons';
            const code = couponObj.code.trim().toUpperCase();
            const formatted = {
                code: code,
                type: couponObj.type || 'flat',
                amount: Number(couponObj.amount || 0),
                label: couponObj.label || code,
                maxUses: Number(couponObj.maxUses || 0),
                usedCount: Number(couponObj.usedCount || 0)
            };

            let local = {};
            try {
                local = JSON.parse(localStorage.getItem(STORAGE_KEY_COUPONS) || '{}');
            } catch (e) { }
            local[code] = formatted;
            localStorage.setItem(STORAGE_KEY_COUPONS, JSON.stringify(local));

            if (this.isCloudEnabled()) {
                try {
                    const dbRow = {
                        code: formatted.code,
                        type: formatted.type,
                        amount: formatted.amount,
                        label: formatted.label,
                        max_uses: formatted.maxUses,
                        used_count: formatted.usedCount,
                        created_at: new Date().toISOString()
                    };
                    const { error } = await supabaseClient
                        .from('coupons')
                        .upsert([dbRow], { onConflict: 'code' });

                    if (error) {
                        console.error('❌ Supabase saveCoupon error:', error.message);
                    } else {
                        console.log(`✅ Coupon saved to Supabase: ${code}`);
                    }
                } catch (err) {
                    console.error('❌ Exception saving coupon to Supabase:', err);
                }
            }
            return true;
        },

        /**
         * Clear All Coupons (From LocalStorage & Cloud DB)
         */
        async clearAllCoupons() {
            const STORAGE_KEY_COUPONS = 'sp_coupons';
            localStorage.setItem(STORAGE_KEY_COUPONS, JSON.stringify({}));

            if (this.isCloudEnabled()) {
                try {
                    const { error } = await supabaseClient
                        .from('coupons')
                        .delete()
                        .neq('code', '');

                    if (error) {
                        console.error('❌ Supabase clearAllCoupons error:', error.message);
                    } else {
                        console.log('✅ Cleared all coupons from Supabase Cloud DB');
                    }
                } catch (err) {
                    console.error('❌ Exception clearing coupons from Supabase:', err);
                }
            }
            return true;
        },

        /**
         * Increment Coupon Used Count
         */
        async incrementCouponUsage(code) {
            if (!code) return false;
            const cleanCode = code.trim().toUpperCase();
            const coupons = await this.getCoupons();
            const coupon = coupons[cleanCode];
            if (coupon) {
                coupon.usedCount = (Number(coupon.usedCount) || 0) + 1;
                await this.saveCoupon(coupon);
                console.log(`🎟️ Incremented coupon usage: ${cleanCode} -> ${coupon.usedCount}/${coupon.maxUses || '∞'}`);
                return true;
            }
            return false;
        },

        /**
         * Delete Coupon (From Cloud DB if connected & LocalStorage)
         */
        async deleteCoupon(code) {
            if (!code) return false;
            const STORAGE_KEY_COUPONS = 'sp_coupons';
            const cleanCode = code.trim().toUpperCase();

            let local = {};
            try {
                local = JSON.parse(localStorage.getItem(STORAGE_KEY_COUPONS) || '{}');
            } catch (e) { }
            delete local[cleanCode];
            localStorage.setItem(STORAGE_KEY_COUPONS, JSON.stringify(local));

            if (this.isCloudEnabled()) {
                try {
                    const { error } = await supabaseClient
                        .from('coupons')
                        .delete()
                        .eq('code', cleanCode);

                    if (error) {
                        console.error('❌ Supabase deleteCoupon error:', error.message);
                    } else {
                        console.log(`✅ Coupon deleted from Supabase: ${cleanCode}`);
                    }
                } catch (err) {
                    console.error('❌ Exception deleting coupon from Supabase:', err);
                }
            }
            return true;
        },

        /**
         * Update order status
         */
        async updateOrderStatus(orderId, newStatus) {
            const cleanId = orderId.replace(/^#/, '').trim();

            // 1. Update LocalStorage
            const localOrders = this.getLocalOrders();
            const idx = localOrders.findIndex(o => o.orderId === cleanId);
            if (idx !== -1) {
                localOrders[idx].status = newStatus;
                this.setLocalOrders(localOrders);
            }

            // 2. Update Supabase Cloud DB
            if (this.isCloudEnabled()) {
                try {
                    const { error } = await supabaseClient
                        .from('orders')
                        .update({ status: newStatus })
                        .eq('order_id', cleanId);

                    if (error) {
                        console.error('❌ Supabase status update error:', error.message);
                    } else {
                        console.log(`✅ Supabase status updated: #${cleanId} -> ${newStatus}`);
                    }
                } catch (err) {
                    console.error('❌ Exception updating Supabase status:', err);
                }
            }
            return true;
        },

        /**
         * Delete order by Order ID
         */
        async deleteOrder(orderId) {
            if (!orderId) return false;
            const cleanId = orderId.replace(/^#/, '').trim();

            // 1. Remove from LocalStorage
            const localOrders = this.getLocalOrders();
            const filtered = localOrders.filter(o => o.orderId !== cleanId);
            this.setLocalOrders(filtered);

            // 2. Delete from Supabase Cloud DB
            if (this.isCloudEnabled()) {
                try {
                    const { error } = await supabaseClient
                        .from('orders')
                        .delete()
                        .eq('order_id', cleanId);

                    if (error) {
                        console.error('❌ Supabase delete order error:', error.message);
                    } else {
                        console.log(`✅ Supabase order deleted: #${cleanId}`);
                    }
                } catch (err) {
                    console.error('❌ Exception deleting Supabase order:', err);
                }
            }
            return true;
        },

        /**
         * Subscribe to changes (Realtime Cloud Sync)
         */
        subscribeOrders(onUpdateCallback) {
            let subscription = null;

            if (this.isCloudEnabled()) {
                try {
                    subscription = supabaseClient
                        .channel('realtime:public:orders')
                        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, async (payload) => {
                            console.log('⚡ Realtime Update received from Supabase:', payload);
                            const updatedOrders = await SukpaDB.getOrders();
                            if (typeof onUpdateCallback === 'function') {
                                onUpdateCallback(updatedOrders, payload);
                            }
                        })
                        .subscribe();
                    console.log('📡 Subscribed to Supabase Realtime changes.');
                } catch (err) {
                    console.warn('⚠️ Could not subscribe to Supabase Realtime:', err);
                }
            }

            // Also listen to local window storage changes for cross-tab sync
            const storageHandler = async (e) => {
                if (e.key === STORAGE_KEY_ORDERS && typeof onUpdateCallback === 'function') {
                    const orders = SukpaDB.getLocalOrders();
                    onUpdateCallback(orders, { type: 'local_storage' });
                }
            };
            window.addEventListener('storage', storageHandler);

            return {
                unsubscribe() {
                    if (subscription) {
                        supabaseClient.removeChannel(subscription);
                    }
                    window.removeEventListener('storage', storageHandler);
                }
            };
        },

        /**
         * Test Cloud DB Connection
         */
        async testCloudConnection() {
            if (!this.isCloudEnabled()) {
                return { success: false, message: 'ไม่ได้ตั้งค่า Supabase URL / API Key' };
            }
            try {
                const { count, error } = await supabaseClient
                    .from('orders')
                    .select('*', { count: 'exact', head: true });

                if (error) {
                    return { success: false, message: error.message };
                }
                return { success: true, message: 'เชื่อมต่อ Supabase สำเร็จ!', count: count || 0 };
            } catch (err) {
                return { success: false, message: err.message || 'ไม่สามารถเชื่อมต่อได้' };
            }
        },

        /**
         * Get Orders By Status
         */
        async getOrdersByStatus(status) {
            if (!status || status === 'all') return this.getOrders();

            if (this.isCloudEnabled()) {
                try {
                    const { data, error } = await supabaseClient
                        .from('orders')
                        .select('*')
                        .eq('status', status)
                        .order('created_at', { ascending: false });

                    if (!error && Array.isArray(data)) {
                        return data.map(row => this._mapFromDb(row));
                    }
                } catch (err) {
                    console.warn('⚠️ getOrdersByStatus error:', err);
                }
            }

            const local = this.getLocalOrders();
            return local.filter(o => (o.status || 'pending') === status);
        },

        /**
         * Get Orders By Customer Phone Number
         */
        async getOrdersByPhone(phone) {
            if (!phone) return [];
            const cleanPhone = phone.replace(/\D/g, '');
            if (!cleanPhone) return [];

            const allOrders = await this.getOrders();
            return allOrders.filter(o => (o.phone || '').replace(/\D/g, '').includes(cleanPhone));
        },

        /**
         * Export Backup as JSON String
         */
        async exportBackupJSON() {
            const orders = await this.getOrders();
            const backup = {
                app: 'Sukpa Laundry',
                version: '2.0.0',
                exportedAt: new Date().toISOString(),
                totalOrders: orders.length,
                orders: orders
            };
            return JSON.stringify(backup, null, 2);
        },

        /**
         * Import Backup JSON String
         */
        async importBackupJSON(jsonString) {
            try {
                const parsed = JSON.parse(jsonString);
                const ordersToImport = Array.isArray(parsed) ? parsed : (parsed.orders || []);

                if (!Array.isArray(ordersToImport) || ordersToImport.length === 0) {
                    return { success: false, message: 'ไม่พบรายการออเดอร์ในไฟล์ข้อมูลสำรอง' };
                }

                let importedCount = 0;
                for (const ord of ordersToImport) {
                    if (ord.orderId) {
                        await this.saveOrder(ord);
                        importedCount++;
                    }
                }

                return { success: true, message: `นำเข้าออเดอร์สำเร็จ ${importedCount} รายการ`, count: importedCount };
            } catch (err) {
                return { success: false, message: `ไฟล์ JSON ไม่ถูกต้อง: ${err.message}` };
            }
        },

        /**
         * Clear All Orders (Reset DB)
         */
        async clearAllOrders() {
            this.setLocalOrders([]);
            if (this.isCloudEnabled()) {
                try {
                    await supabaseClient.from('orders').delete().neq('order_id', '');
                } catch (err) {
                    console.warn('⚠️ Clear cloud DB error:', err);
                }
            }
            return true;
        },

        /**
         * Sync Offline Queue to Supabase Cloud DB
         */
        async syncOfflineQueue() {
            const STORAGE_KEY_QUEUE = 'sp_offline_queue';
            try {
                const queue = JSON.parse(localStorage.getItem(STORAGE_KEY_QUEUE) || '[]');
                if (queue.length === 0 || !this.isCloudEnabled()) return;

                console.log(`🔄 Syncing ${queue.length} offline tasks to Supabase...`);
                const remaining = [];
                for (const task of queue) {
                    try {
                        if (task.type === 'save') {
                            await this.saveOrder(task.order);
                        } else if (task.type === 'status') {
                            await this.updateOrderStatus(task.orderId, task.status);
                        } else if (task.type === 'delete') {
                            await this.deleteOrder(task.orderId);
                        }
                    } catch (e) {
                        remaining.push(task);
                    }
                }
                localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(remaining));
            } catch (err) {
                console.warn('⚠️ Offline sync error:', err);
            }
        }
    };

    // Auto-init on script load & listen to online reconnect
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => SukpaDB.init());
    } else {
        SukpaDB.init();
    }
    window.addEventListener('online', () => SukpaDB.syncOfflineQueue());

    window.SukpaDB = SukpaDB;
})(window);
