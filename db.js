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
                orderId: row.order_id,
                name: row.name,
                phone: row.phone,
                dorm: row.dorm,
                notes: row.notes || '',
                serviceName: row.service_name || '',
                sizeKey: row.size_key || '',
                dryerKey: row.dryer_key || '',
                detergentKey: row.detergent_key || '',
                zoneKey: row.zone_key || '',
                sizePrice: Number(row.size_price || 0),
                dryerPrice: Number(row.dryer_price || 0),
                detergentSurcharge: Number(row.detergent_surcharge || 0),
                zoneSurcharge: Number(row.zone_surcharge || 0),
                couponCode: row.coupon_code || '',
                discountAmount: Number(row.discount_amount || 0),
                total: Number(row.total || 0),
                slipDataUrl: row.slip_url || row.slip_data_url || '',
                deliveryPhotoUrl: row.delivery_photo_url || row.deliveryPhotoUrl || '',
                status: row.status || 'pending',
                createdAt: row.created_at || new Date().toISOString()
            };
        },

        /**
         * Map JS Order Object to Supabase DB Row format
         */
        _mapToDb(order) {
            return {
                order_id: order.orderId,
                name: order.name,
                phone: order.phone,
                dorm: order.dorm,
                notes: order.notes || '',
                service_name: order.serviceName || '',
                size_key: order.sizeKey || '',
                dryer_key: order.dryerKey || '',
                detergent_key: order.detergentKey || '',
                zone_key: order.zoneKey || '',
                size_price: order.sizePrice || 0,
                dryer_price: order.dryerPrice || 0,
                detergent_surcharge: order.detergentSurcharge || 0,
                zone_surcharge: order.zoneSurcharge || 0,
                coupon_code: order.couponCode || '',
                discount_amount: order.discountAmount || 0,
                total: order.total || 0,
                slip_url: order.slipDataUrl || '',
                delivery_photo_url: order.deliveryPhotoUrl || '',
                status: order.status || 'pending',
                created_at: order.createdAt || new Date().toISOString()
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
        async getOrders() {
            if (this.isCloudEnabled()) {
                try {
                    const { data, error } = await supabaseClient
                        .from('orders')
                        .select('*')
                        .order('created_at', { ascending: false });

                    if (!error && Array.isArray(data)) {
                        const mappedOrders = data.map(row => this._mapFromDb(row));
                        this.setLocalOrders(mappedOrders);
                        return mappedOrders;
                    } else if (error) {
                        console.warn('⚠️ Supabase fetch error, using local fallback:', error.message);
                    }
                } catch (err) {
                    console.warn('⚠️ Supabase query exception, using local fallback:', err);
                }
            }
            return this.getLocalOrders();
        },

        /**
         * Get single order by Order ID
         */
        async getOrderById(orderId) {
            if (!orderId) return null;
            const cleanId = orderId.replace(/^#/, '').trim();

            if (this.isCloudEnabled()) {
                try {
                    const { data, error } = await supabaseClient
                        .from('orders')
                        .select('*')
                        .eq('order_id', cleanId)
                        .single();

                    if (!error && data) {
                        return this._mapFromDb(data);
                    }
                } catch (err) {
                    console.warn('⚠️ Supabase getOrderById error:', err);
                }
            }

            const localOrders = this.getLocalOrders();
            return localOrders.find(o => o.orderId === cleanId) || null;
        },

        /**
         * Save a new order
         */
        async saveOrder(orderRecord) {
            // Always save to localStorage immediately for instant feedback
            const existing = this.getLocalOrders();
            const filtered = existing.filter(o => o.orderId !== orderRecord.orderId);
            filtered.unshift(orderRecord);
            this.setLocalOrders(filtered);

            // Sync to Supabase Cloud if available
            if (this.isCloudEnabled()) {
                try {
                    const dbRow = this._mapToDb(orderRecord);
                    const { data, error } = await supabaseClient
                        .from('orders')
                        .upsert([dbRow], { onConflict: 'order_id' });

                    if (error) {
                        console.error('❌ Failed to save order to Supabase:', error.message);
                    } else {
                        console.log('✅ Order saved to Supabase Cloud!');
                    }
                } catch (err) {
                    console.error('❌ Exception saving order to Supabase:', err);
                }
            }
            return orderRecord;
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
        }
    };

    // Auto-init on script load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => SukpaDB.init());
    } else {
        SukpaDB.init();
    }

    window.SukpaDB = SukpaDB;
})(window);
