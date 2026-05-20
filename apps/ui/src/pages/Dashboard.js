"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Dashboard;
var react_1 = require("motion/react");
var react_2 = require("react");
var lucide_react_1 = require("lucide-react");
var API_BASE = (_a = import.meta.env.VITE_API_URL) !== null && _a !== void 0 ? _a : 'http://localhost:8000';
var ORDERS_PER_PAGE = 10;
var DASHBOARD_MOBILE_VIEW_KEY = 'dashboard_mobile_view';
var DASHBOARD_MOBILE_VIEW_EVENT = 'dashboard-mobile-view-change';
var isSidebarView = function (value) {
    return [
        'dashboard',
        'deliveries',
        'sales',
        'customers',
        'branches',
        'inventory',
        'products',
        'users',
        'quality',
        'settings',
    ].includes(value);
};
function Dashboard(_a) {
    var _this = this;
    var onNavigate = _a.onNavigate;
    var _b = (0, react_2.useState)('dashboard'), activeView = _b[0], setActiveView = _b[1];
    var _c = (0, react_2.useState)([]), branches = _c[0], setBranches = _c[1];
    var _d = (0, react_2.useState)([]), selectedBranchIds = _d[0], setSelectedBranchIds = _d[1];
    var _e = (0, react_2.useState)(1), branchPage = _e[0], setBranchPage = _e[1];
    var _f = (0, react_2.useState)(false), isBranchesLoading = _f[0], setIsBranchesLoading = _f[1];
    var _g = (0, react_2.useState)(null), branchesError = _g[0], setBranchesError = _g[1];
    var _h = (0, react_2.useState)(false), isBranchModalOpen = _h[0], setIsBranchModalOpen = _h[1];
    var _j = (0, react_2.useState)(null), editingBranchId = _j[0], setEditingBranchId = _j[1];
    var _k = (0, react_2.useState)({
        unitId: '',
        name: '',
        address: '',
        contact: '',
    }), branchForm = _k[0], setBranchForm = _k[1];
    var _l = (0, react_2.useState)(null), branchFormError = _l[0], setBranchFormError = _l[1];
    var _m = (0, react_2.useState)([]), customers = _m[0], setCustomers = _m[1];
    var _o = (0, react_2.useState)([]), selectedCustomerIds = _o[0], setSelectedCustomerIds = _o[1];
    var _p = (0, react_2.useState)(1), customerPage = _p[0], setCustomerPage = _p[1];
    var _q = (0, react_2.useState)(false), isCustomersLoading = _q[0], setIsCustomersLoading = _q[1];
    var _r = (0, react_2.useState)(null), customersError = _r[0], setCustomersError = _r[1];
    var _s = (0, react_2.useState)(false), isCustomerModalOpen = _s[0], setIsCustomerModalOpen = _s[1];
    var _t = (0, react_2.useState)(null), editingCustomerId = _t[0], setEditingCustomerId = _t[1];
    var _u = (0, react_2.useState)({
        branchId: '',
        code: '',
        name: '',
        address: '',
        contact: '',
        geolocation: '',
    }), customerForm = _u[0], setCustomerForm = _u[1];
    var _v = (0, react_2.useState)(null), customerFormError = _v[0], setCustomerFormError = _v[1];
    var _w = (0, react_2.useState)([]), customerBranchOptions = _w[0], setCustomerBranchOptions = _w[1];
    var _x = (0, react_2.useState)([]), inventories = _x[0], setInventories = _x[1];
    var _y = (0, react_2.useState)([]), selectedInventoryIds = _y[0], setSelectedInventoryIds = _y[1];
    var _z = (0, react_2.useState)(1), inventoryPage = _z[0], setInventoryPage = _z[1];
    var _0 = (0, react_2.useState)(false), isInventoriesLoading = _0[0], setIsInventoriesLoading = _0[1];
    var _1 = (0, react_2.useState)(null), inventoriesError = _1[0], setInventoriesError = _1[1];
    var _2 = (0, react_2.useState)(false), isInventoryModalOpen = _2[0], setIsInventoryModalOpen = _2[1];
    var _3 = (0, react_2.useState)(null), editingInventoryId = _3[0], setEditingInventoryId = _3[1];
    var _4 = (0, react_2.useState)({
        branchId: '',
        code: '',
        name: '',
        description: '',
        supplier: '',
        quantity: '0',
    }), inventoryForm = _4[0], setInventoryForm = _4[1];
    var _5 = (0, react_2.useState)(null), inventoryFormError = _5[0], setInventoryFormError = _5[1];
    var _6 = (0, react_2.useState)([]), inventoryBranchOptions = _6[0], setInventoryBranchOptions = _6[1];
    var _7 = (0, react_2.useState)([]), products = _7[0], setProducts = _7[1];
    var _8 = (0, react_2.useState)(1), productPage = _8[0], setProductPage = _8[1];
    var _9 = (0, react_2.useState)(false), isProductsLoading = _9[0], setIsProductsLoading = _9[1];
    var _10 = (0, react_2.useState)(null), productsError = _10[0], setProductsError = _10[1];
    var _11 = (0, react_2.useState)(false), isProductModalOpen = _11[0], setIsProductModalOpen = _11[1];
    var _12 = (0, react_2.useState)(null), editingProductId = _12[0], setEditingProductId = _12[1];
    var _13 = (0, react_2.useState)({ branchId: '', code: '', name: '', description: '', unitPrice: '0' }), productForm = _13[0], setProductForm = _13[1];
    var _14 = (0, react_2.useState)(null), productFormError = _14[0], setProductFormError = _14[1];
    var _15 = (0, react_2.useState)([]), productBranchOptions = _15[0], setProductBranchOptions = _15[1];
    var _16 = (0, react_2.useState)([]), productComponents = _16[0], setProductComponents = _16[1];
    var _17 = (0, react_2.useState)(''), productComponentToAdd = _17[0], setProductComponentToAdd = _17[1];
    var _18 = (0, react_2.useState)([]), maintenance = _18[0], setMaintenance = _18[1];
    var _19 = (0, react_2.useState)([]), selectedMaintenanceIds = _19[0], setSelectedMaintenanceIds = _19[1];
    var _20 = (0, react_2.useState)(1), maintenancePage = _20[0], setMaintenancePage = _20[1];
    var _21 = (0, react_2.useState)(false), isMaintenanceLoading = _21[0], setIsMaintenanceLoading = _21[1];
    var _22 = (0, react_2.useState)(null), maintenanceError = _22[0], setMaintenanceError = _22[1];
    var _23 = (0, react_2.useState)(false), isMaintenanceModalOpen = _23[0], setIsMaintenanceModalOpen = _23[1];
    var _24 = (0, react_2.useState)(null), editingMaintenanceId = _24[0], setEditingMaintenanceId = _24[1];
    var _25 = (0, react_2.useState)({
        branchId: '',
        code: '',
        name: '',
        supplier: '',
        contact: '',
        expirationDays: '0',
        dateReplaced: '',
    }), maintenanceForm = _25[0], setMaintenanceForm = _25[1];
    var _26 = (0, react_2.useState)(null), maintenanceFormError = _26[0], setMaintenanceFormError = _26[1];
    var _27 = (0, react_2.useState)([]), maintenanceBranchOptions = _27[0], setMaintenanceBranchOptions = _27[1];
    var _28 = (0, react_2.useState)([]), orders = _28[0], setOrders = _28[1];
    var _29 = (0, react_2.useState)([]), selectedOrderIds = _29[0], setSelectedOrderIds = _29[1];
    var _30 = (0, react_2.useState)([]), sales = _30[0], setSales = _30[1];
    var _31 = (0, react_2.useState)([]), selectedSaleIds = _31[0], setSelectedSaleIds = _31[1];
    var _32 = (0, react_2.useState)(1), salePage = _32[0], setSalePage = _32[1];
    var _33 = (0, react_2.useState)(false), isSalesLoading = _33[0], setIsSalesLoading = _33[1];
    var _34 = (0, react_2.useState)(null), salesError = _34[0], setSalesError = _34[1];
    var _35 = (0, react_2.useState)(false), isSaleModalOpen = _35[0], setIsSaleModalOpen = _35[1];
    var _36 = (0, react_2.useState)(null), editingSaleId = _36[0], setEditingSaleId = _36[1];
    var _37 = (0, react_2.useState)(null), saleFormError = _37[0], setSaleFormError = _37[1];
    var _38 = (0, react_2.useState)([]), saleBranchOptions = _38[0], setSaleBranchOptions = _38[1];
    var emptySaleForm = function () { return ({
        branchId: '',
        invoiceNumber: '',
        customerName: '',
        customerEmail: '',
        productName: '',
        quantity: '1',
        unitPrice: '0',
        discount: '0',
        taxRate: '0',
        shippingFee: '0',
        paymentMethod: 'cash',
        paymentStatus: 'pending',
        saleStatus: 'pending',
        saleDate: '',
        notes: '',
        referenceNumber: '',
    }); };
    var _39 = (0, react_2.useState)(emptySaleForm), saleForm = _39[0], setSaleForm = _39[1];
    var _40 = (0, react_2.useState)(false), isOrdersLoading = _40[0], setIsOrdersLoading = _40[1];
    var _41 = (0, react_2.useState)(null), ordersError = _41[0], setOrdersError = _41[1];
    var _42 = (0, react_2.useState)(1), orderPage = _42[0], setOrderPage = _42[1];
    var _43 = (0, react_2.useState)(''), orderDateFrom = _43[0], setOrderDateFrom = _43[1];
    var _44 = (0, react_2.useState)(''), orderDateTo = _44[0], setOrderDateTo = _44[1];
    var _45 = (0, react_2.useState)(''), orderTypeFilter = _45[0], setOrderTypeFilter = _45[1];
    var _46 = (0, react_2.useState)(''), containerTypeFilter = _46[0], setContainerTypeFilter = _46[1];
    var _47 = (0, react_2.useState)(false), isOrderModalOpen = _47[0], setIsOrderModalOpen = _47[1];
    var _48 = (0, react_2.useState)(null), editingOrderId = _48[0], setEditingOrderId = _48[1];
    var _49 = (0, react_2.useState)(null), orderFormError = _49[0], setOrderFormError = _49[1];
    var _50 = (0, react_2.useState)([]), orderBranchOptions = _50[0], setOrderBranchOptions = _50[1];
    var emptyOrderForm = function () { return ({
        branchId: '',
        orderNumber: '',
        customerName: '',
        deliveryAddress: '',
        contactNumber: '',
        orderType: 'delivery',
        containerType: '',
        containerSize: '',
        quantity: '1',
        borrowedContainers: '0',
        returnedContainers: '0',
        unitPrice: '0',
        discount: '0',
        deliveryFee: '0',
        amountPaid: '0',
        paymentMethod: '',
        deliveryDate: '',
        deliveryTimeSlot: '',
        deliveryNotes: '',
        priorityFlag: false,
    }); };
    var _51 = (0, react_2.useState)(emptyOrderForm), orderForm = _51[0], setOrderForm = _51[1];
    var _52 = (0, react_2.useState)(''), overviewBranchFilter = _52[0], setOverviewBranchFilter = _52[1];
    var _53 = (0, react_2.useState)(null), inventoryCapacity = _53[0], setInventoryCapacity = _53[1];
    var _54 = (0, react_2.useState)(false), isInventoryCapacityLoading = _54[0], setIsInventoryCapacityLoading = _54[1];
    var _55 = (0, react_2.useState)(null), dailySales = _55[0], setDailySales = _55[1];
    var _56 = (0, react_2.useState)(false), isDailySalesLoading = _56[0], setIsDailySalesLoading = _56[1];
    var _57 = (0, react_2.useState)([]), activeOrders = _57[0], setActiveOrders = _57[1];
    var _58 = (0, react_2.useState)(false), isActiveOrdersLoading = _58[0], setIsActiveOrdersLoading = _58[1];
    var _59 = (0, react_2.useState)([]), users = _59[0], setUsers = _59[1];
    var _60 = (0, react_2.useState)([]), selectedUserIds = _60[0], setSelectedUserIds = _60[1];
    var _61 = (0, react_2.useState)(1), userPage = _61[0], setUserPage = _61[1];
    var _62 = (0, react_2.useState)(false), isUsersLoading = _62[0], setIsUsersLoading = _62[1];
    var _63 = (0, react_2.useState)(null), usersError = _63[0], setUsersError = _63[1];
    var _64 = (0, react_2.useState)(false), isUserModalOpen = _64[0], setIsUserModalOpen = _64[1];
    var _65 = (0, react_2.useState)(null), editingUserId = _65[0], setEditingUserId = _65[1];
    var _66 = (0, react_2.useState)({ email: '', password: '', fullName: '', role: 'staff', branchId: '' }), userForm = _66[0], setUserForm = _66[1];
    var _67 = (0, react_2.useState)(null), userFormError = _67[0], setUserFormError = _67[1];
    var _68 = (0, react_2.useState)([]), userBranchOptions = _68[0], setUserBranchOptions = _68[1];
    var currentUserRole = (function () {
        try {
            var userText = localStorage.getItem('user');
            if (!userText) {
                return 'staff';
            }
            var user = JSON.parse(userText);
            return user.role === 'admin' ? 'admin' : 'staff';
        }
        catch (_a) {
            return 'staff';
        }
    })();
    var currentUserId = (function () {
        var _a;
        try {
            var userText = localStorage.getItem('user');
            if (!userText) {
                return '';
            }
            var user = JSON.parse(userText);
            return String((_a = user.id) !== null && _a !== void 0 ? _a : '');
        }
        catch (_b) {
            return '';
        }
    })();
    var isAdminUser = currentUserRole === 'admin';
    var getAuthToken = function () { return localStorage.getItem('access_token'); };
    var mapBranchFromApi = function (item) {
        var _a, _b, _c;
        return ({
            id: Number(item.id),
            unitId: String(item.unit_id),
            name: (_a = item.name) !== null && _a !== void 0 ? _a : '',
            address: (_b = item.address) !== null && _b !== void 0 ? _b : '',
            contact: (_c = item.contact) !== null && _c !== void 0 ? _c : '',
            status: item.status === 'inactive' ? 'inactive' : 'active',
        });
    };
    var mapCustomerFromApi = function (item) {
        var _a, _b, _c, _d;
        return ({
            id: Number(item.id),
            branchId: item.branch_id ? Number(item.branch_id) : null,
            code: String(item.code),
            name: (_a = item.name) !== null && _a !== void 0 ? _a : '',
            address: (_b = item.address) !== null && _b !== void 0 ? _b : '',
            contact: (_c = item.contact) !== null && _c !== void 0 ? _c : '',
            geolocation: (_d = item.geolocation) !== null && _d !== void 0 ? _d : '',
            status: item.status === 'inactive' ? 'inactive' : 'active',
        });
    };
    var mapInventoryFromApi = function (item) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return ({
            id: Number(item.id),
            branchId: item.branch_id ? Number(item.branch_id) : null,
            branchName: (_a = item.branch_name) !== null && _a !== void 0 ? _a : '',
            code: String(item.code),
            name: (_b = item.name) !== null && _b !== void 0 ? _b : '',
            description: (_c = item.description) !== null && _c !== void 0 ? _c : '',
            supplier: (_d = item.supplier) !== null && _d !== void 0 ? _d : '',
            quantity: Number((_e = item.quantity) !== null && _e !== void 0 ? _e : 0),
            capacity: Number((_f = item.capacity) !== null && _f !== void 0 ? _f : 0),
            unitCost: Number((_g = item.unit_cost) !== null && _g !== void 0 ? _g : 0),
            sellingPrice: Number((_h = item.selling_price) !== null && _h !== void 0 ? _h : 0),
            status: item.status === 'inactive' ? 'inactive' : 'active',
        });
    };
    var mapProductFromApi = function (item) {
        var _a, _b, _c, _d, _e, _f;
        return ({
            id: Number(item.id),
            branchId: item.branch_id ? Number(item.branch_id) : null,
            branchName: (_a = item.branch_name) !== null && _a !== void 0 ? _a : '',
            code: String((_b = item.code) !== null && _b !== void 0 ? _b : ''),
            name: (_c = item.name) !== null && _c !== void 0 ? _c : '',
            description: (_d = item.description) !== null && _d !== void 0 ? _d : '',
            unitPrice: Number((_e = item.unit_price) !== null && _e !== void 0 ? _e : 0),
            components: (_f = item.components) !== null && _f !== void 0 ? _f : [],
        });
    };
    var mapMaintenanceFromApi = function (item) {
        var _a, _b, _c, _d, _e, _f, _g;
        return ({
            id: Number(item.id),
            branchId: item.branch_id ? Number(item.branch_id) : null,
            branchName: (_a = item.branch_name) !== null && _a !== void 0 ? _a : '',
            code: String(item.code),
            name: (_b = item.name) !== null && _b !== void 0 ? _b : '',
            supplier: (_c = item.supplier) !== null && _c !== void 0 ? _c : '',
            contact: (_d = item.contact) !== null && _d !== void 0 ? _d : '',
            expirationDays: Number((_e = item.expiration_days) !== null && _e !== void 0 ? _e : 0),
            dateReplaced: (_f = item.date_replaced) !== null && _f !== void 0 ? _f : '',
            userName: (_g = item.user_name) !== null && _g !== void 0 ? _g : '',
        });
    };
    var mapOrderFromApi = function (item) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        return ({
            id: Number(item.id),
            orderNumber: String((_a = item.order_number) !== null && _a !== void 0 ? _a : ''),
            customerName: (_b = item.customer_name) !== null && _b !== void 0 ? _b : 'Walk-in Customer',
            orderType: (_c = item.order_type) !== null && _c !== void 0 ? _c : 'delivery',
            containerType: (_d = item.container_type) !== null && _d !== void 0 ? _d : '',
            containerSize: item.container_size != null ? Number(item.container_size) : null,
            deliveryDate: (_e = item.delivery_date) !== null && _e !== void 0 ? _e : '',
            quantity: Number((_f = item.quantity) !== null && _f !== void 0 ? _f : 0),
            totalAmount: Number((_g = item.total_amount) !== null && _g !== void 0 ? _g : 0),
            paymentStatus: (_h = item.payment_status) !== null && _h !== void 0 ? _h : 'unpaid',
            orderStatus: (_j = item.order_status) !== null && _j !== void 0 ? _j : 'pending',
        });
    };
    var mapSaleFromApi = function (item) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        return ({
            id: Number(item.id),
            invoiceNumber: String((_a = item.invoice_number) !== null && _a !== void 0 ? _a : ''),
            customerName: (_b = item.customer_name) !== null && _b !== void 0 ? _b : 'Walk-in Customer',
            productName: (_c = item.product_name) !== null && _c !== void 0 ? _c : '—',
            quantity: Number((_d = item.quantity) !== null && _d !== void 0 ? _d : 0),
            totalAmount: Number((_e = item.total_amount) !== null && _e !== void 0 ? _e : 0),
            paymentStatus: ((_f = item.payment_status) !== null && _f !== void 0 ? _f : 'pending'),
            saleStatus: ((_g = item.sale_status) !== null && _g !== void 0 ? _g : 'pending'),
            saleDate: (_j = (_h = item.sale_date) !== null && _h !== void 0 ? _h : item.created_at) !== null && _j !== void 0 ? _j : '',
        });
    };
    var mapUserFromApi = function (item) {
        var _a, _b, _c, _d, _e, _f;
        return ({
            id: String(item.id),
            email: (_a = item.email) !== null && _a !== void 0 ? _a : '',
            fullName: (_b = item.full_name) !== null && _b !== void 0 ? _b : '',
            role: ((_c = item.role) !== null && _c !== void 0 ? _c : 'staff'),
            isActive: Boolean((_d = item.is_active) !== null && _d !== void 0 ? _d : true),
            branchName: (_e = item.branch_name) !== null && _e !== void 0 ? _e : null,
            createdAt: (_f = item.created_at) !== null && _f !== void 0 ? _f : '',
        });
    };
    var fetchBranches = function () { return __awaiter(_this, void 0, void 0, function () {
        var token, res, data, list, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    token = getAuthToken();
                    if (!token) {
                        setBranchesError('You are not logged in.');
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    setIsBranchesLoading(true);
                    setBranchesError(null);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch("".concat(API_BASE, "/branches"), {
                            headers: {
                                Authorization: "Bearer ".concat(token),
                            },
                        })];
                case 2:
                    res = _c.sent();
                    if (res.status === 401) {
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('user');
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _c.sent();
                    if (!res.ok) {
                        setBranchesError((_b = data.detail) !== null && _b !== void 0 ? _b : 'Unable to load branches.');
                        return [2 /*return*/];
                    }
                    list = Array.isArray(data.branches) ? data.branches.map(mapBranchFromApi) : [];
                    setBranches(list);
                    setSelectedBranchIds([]);
                    return [3 /*break*/, 6];
                case 4:
                    _a = _c.sent();
                    setBranchesError('Unable to reach the server.');
                    return [3 /*break*/, 6];
                case 5:
                    setIsBranchesLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var fetchCustomers = function () { return __awaiter(_this, void 0, void 0, function () {
        var token, endpoint, branchRes, branchData, firstBranch, res, data, list, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    token = getAuthToken();
                    if (!token) {
                        setCustomersError('You are not logged in.');
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    setIsCustomersLoading(true);
                    setCustomersError(null);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 7, 8, 9]);
                    endpoint = "".concat(API_BASE, "/customers");
                    if (!(currentUserRole !== 'admin')) return [3 /*break*/, 4];
                    return [4 /*yield*/, fetch("".concat(API_BASE, "/branches"), {
                            headers: {
                                Authorization: "Bearer ".concat(token),
                            },
                        })];
                case 2:
                    branchRes = _c.sent();
                    if (!branchRes.ok) {
                        setCustomersError('Unable to determine branch context.');
                        setCustomers([]);
                        setSelectedCustomerIds([]);
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, branchRes.json()];
                case 3:
                    branchData = _c.sent();
                    firstBranch = Array.isArray(branchData.branches) ? branchData.branches[0] : null;
                    if (!firstBranch) {
                        setCustomers([]);
                        setSelectedCustomerIds([]);
                        return [2 /*return*/];
                    }
                    endpoint = "".concat(API_BASE, "/customers?branch_id=").concat(firstBranch.id);
                    _c.label = 4;
                case 4: return [4 /*yield*/, fetch(endpoint, {
                        headers: {
                            Authorization: "Bearer ".concat(token),
                        },
                    })];
                case 5:
                    res = _c.sent();
                    if (res.status === 401) {
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('user');
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, res.json()];
                case 6:
                    data = _c.sent();
                    if (!res.ok) {
                        setCustomersError((_b = data.detail) !== null && _b !== void 0 ? _b : 'Unable to load customers.');
                        return [2 /*return*/];
                    }
                    list = Array.isArray(data.customers) ? data.customers.map(mapCustomerFromApi) : [];
                    setCustomers(list);
                    setSelectedCustomerIds([]);
                    return [3 /*break*/, 9];
                case 7:
                    _a = _c.sent();
                    setCustomersError('Unable to reach the server.');
                    return [3 /*break*/, 9];
                case 8:
                    setIsCustomersLoading(false);
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    }); };
    var fetchInventories = function () { return __awaiter(_this, void 0, void 0, function () {
        var token, endpoint, branchRes, branchData, firstBranch, res, data, list, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    token = getAuthToken();
                    if (!token) {
                        setInventoriesError('You are not logged in.');
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    setIsInventoriesLoading(true);
                    setInventoriesError(null);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 7, 8, 9]);
                    endpoint = "".concat(API_BASE, "/inventories");
                    if (!(currentUserRole !== 'admin')) return [3 /*break*/, 4];
                    return [4 /*yield*/, fetch("".concat(API_BASE, "/branches"), {
                            headers: { Authorization: "Bearer ".concat(token) },
                        })];
                case 2:
                    branchRes = _c.sent();
                    if (!branchRes.ok) {
                        setInventoriesError('Unable to determine branch context.');
                        setInventories([]);
                        setSelectedInventoryIds([]);
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, branchRes.json()];
                case 3:
                    branchData = _c.sent();
                    firstBranch = Array.isArray(branchData.branches) ? branchData.branches[0] : null;
                    if (!firstBranch) {
                        setInventories([]);
                        setSelectedInventoryIds([]);
                        return [2 /*return*/];
                    }
                    endpoint = "".concat(API_BASE, "/inventories?branch_id=").concat(firstBranch.id);
                    _c.label = 4;
                case 4: return [4 /*yield*/, fetch(endpoint, {
                        headers: { Authorization: "Bearer ".concat(token) },
                    })];
                case 5:
                    res = _c.sent();
                    if (res.status === 401) {
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('user');
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, res.json()];
                case 6:
                    data = _c.sent();
                    if (!res.ok) {
                        setInventoriesError((_b = data.detail) !== null && _b !== void 0 ? _b : 'Unable to load inventories.');
                        return [2 /*return*/];
                    }
                    list = Array.isArray(data.inventories) ? data.inventories.map(mapInventoryFromApi) : [];
                    setInventories(list);
                    setSelectedInventoryIds([]);
                    return [3 /*break*/, 9];
                case 7:
                    _a = _c.sent();
                    setInventoriesError('Unable to reach the server.');
                    return [3 /*break*/, 9];
                case 8:
                    setIsInventoriesLoading(false);
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    }); };
    var fetchProducts = function () { return __awaiter(_this, void 0, void 0, function () {
        var token, endpoint, branchRes, branchData, firstBranch, res, data, list, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    token = getAuthToken();
                    if (!token) {
                        setProductsError('You are not logged in.');
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    setIsProductsLoading(true);
                    setProductsError(null);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 7, 8, 9]);
                    endpoint = "".concat(API_BASE, "/products");
                    if (!(currentUserRole !== 'admin')) return [3 /*break*/, 4];
                    return [4 /*yield*/, fetch("".concat(API_BASE, "/branches"), {
                            headers: { Authorization: "Bearer ".concat(token) },
                        })];
                case 2:
                    branchRes = _c.sent();
                    if (!branchRes.ok) {
                        setProductsError('Unable to determine branch context.');
                        setProducts([]);
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, branchRes.json()];
                case 3:
                    branchData = _c.sent();
                    firstBranch = Array.isArray(branchData.branches) ? branchData.branches[0] : null;
                    if (!firstBranch) {
                        setProducts([]);
                        return [2 /*return*/];
                    }
                    endpoint = "".concat(API_BASE, "/products?branch_id=").concat(firstBranch.id);
                    _c.label = 4;
                case 4: return [4 /*yield*/, fetch(endpoint, {
                        headers: { Authorization: "Bearer ".concat(token) },
                    })];
                case 5:
                    res = _c.sent();
                    if (res.status === 401) {
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('user');
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, res.json()];
                case 6:
                    data = _c.sent();
                    if (!res.ok) {
                        setProductsError((_b = data.detail) !== null && _b !== void 0 ? _b : 'Unable to load products.');
                        return [2 /*return*/];
                    }
                    list = Array.isArray(data.products) ? data.products.map(mapProductFromApi) : [];
                    setProducts(list);
                    return [3 /*break*/, 9];
                case 7:
                    _a = _c.sent();
                    setProductsError('Unable to reach the server.');
                    return [3 /*break*/, 9];
                case 8:
                    setIsProductsLoading(false);
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    }); };
    var fetchMaintenance = function () { return __awaiter(_this, void 0, void 0, function () {
        var token, endpoint, branchRes, branchData, firstBranch, res, data, list, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    token = getAuthToken();
                    if (!token) {
                        setMaintenanceError('You are not logged in.');
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    setIsMaintenanceLoading(true);
                    setMaintenanceError(null);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 7, 8, 9]);
                    endpoint = "".concat(API_BASE, "/maintenance");
                    if (!(currentUserRole !== 'admin')) return [3 /*break*/, 4];
                    return [4 /*yield*/, fetch("".concat(API_BASE, "/branches"), {
                            headers: { Authorization: "Bearer ".concat(token) },
                        })];
                case 2:
                    branchRes = _c.sent();
                    if (!branchRes.ok) {
                        setMaintenanceError('Unable to determine branch context.');
                        setMaintenance([]);
                        setSelectedMaintenanceIds([]);
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, branchRes.json()];
                case 3:
                    branchData = _c.sent();
                    firstBranch = Array.isArray(branchData.branches) ? branchData.branches[0] : null;
                    if (!firstBranch) {
                        setMaintenance([]);
                        setSelectedMaintenanceIds([]);
                        return [2 /*return*/];
                    }
                    endpoint = "".concat(API_BASE, "/maintenance?branch_id=").concat(firstBranch.id);
                    _c.label = 4;
                case 4: return [4 /*yield*/, fetch(endpoint, {
                        headers: { Authorization: "Bearer ".concat(token) },
                    })];
                case 5:
                    res = _c.sent();
                    if (res.status === 401) {
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('user');
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, res.json()];
                case 6:
                    data = _c.sent();
                    if (!res.ok) {
                        setMaintenanceError((_b = data.detail) !== null && _b !== void 0 ? _b : 'Unable to load maintenance items.');
                        return [2 /*return*/];
                    }
                    list = Array.isArray(data.maintenance) ? data.maintenance.map(mapMaintenanceFromApi) : [];
                    setMaintenance(list);
                    setSelectedMaintenanceIds([]);
                    return [3 /*break*/, 9];
                case 7:
                    _a = _c.sent();
                    setMaintenanceError('Unable to reach the server.');
                    return [3 /*break*/, 9];
                case 8:
                    setIsMaintenanceLoading(false);
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    }); };
    var fetchOrders = function () { return __awaiter(_this, void 0, void 0, function () {
        var token, endpoint, branchRes, branchData, firstBranch, res, data, list, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    token = getAuthToken();
                    if (!token) {
                        setOrdersError('You are not logged in.');
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    setIsOrdersLoading(true);
                    setOrdersError(null);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 7, 8, 9]);
                    endpoint = "".concat(API_BASE, "/orders");
                    if (!(currentUserRole !== 'admin')) return [3 /*break*/, 4];
                    return [4 /*yield*/, fetch("".concat(API_BASE, "/branches"), {
                            headers: { Authorization: "Bearer ".concat(token) },
                        })];
                case 2:
                    branchRes = _c.sent();
                    if (!branchRes.ok) {
                        setOrdersError('Unable to determine branch context.');
                        setOrders([]);
                        setSelectedOrderIds([]);
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, branchRes.json()];
                case 3:
                    branchData = _c.sent();
                    firstBranch = Array.isArray(branchData.branches) ? branchData.branches[0] : null;
                    if (!firstBranch) {
                        setOrders([]);
                        setSelectedOrderIds([]);
                        return [2 /*return*/];
                    }
                    endpoint = "".concat(API_BASE, "/orders?branch_id=").concat(firstBranch.id);
                    _c.label = 4;
                case 4: return [4 /*yield*/, fetch(endpoint, {
                        headers: { Authorization: "Bearer ".concat(token) },
                    })];
                case 5:
                    res = _c.sent();
                    if (res.status === 401) {
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('user');
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, res.json()];
                case 6:
                    data = _c.sent();
                    if (!res.ok) {
                        setOrdersError((_b = data.detail) !== null && _b !== void 0 ? _b : 'Unable to load orders.');
                        return [2 /*return*/];
                    }
                    list = Array.isArray(data.orders) ? data.orders.map(mapOrderFromApi) : [];
                    setOrders(list);
                    setSelectedOrderIds([]);
                    return [3 /*break*/, 9];
                case 7:
                    _a = _c.sent();
                    setOrdersError('Unable to reach the server.');
                    return [3 /*break*/, 9];
                case 8:
                    setIsOrdersLoading(false);
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    }); };
    var fetchSales = function () { return __awaiter(_this, void 0, void 0, function () {
        var token, endpoint, branchRes, branchData, firstBranch, res, data, list, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    token = getAuthToken();
                    if (!token) {
                        setSalesError('You are not logged in.');
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    setIsSalesLoading(true);
                    setSalesError(null);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 7, 8, 9]);
                    endpoint = "".concat(API_BASE, "/sales");
                    if (!(currentUserRole !== 'admin')) return [3 /*break*/, 4];
                    return [4 /*yield*/, fetch("".concat(API_BASE, "/branches"), {
                            headers: { Authorization: "Bearer ".concat(token) },
                        })];
                case 2:
                    branchRes = _c.sent();
                    if (!branchRes.ok) {
                        setSalesError('Unable to determine branch context.');
                        setSales([]);
                        setSelectedSaleIds([]);
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, branchRes.json()];
                case 3:
                    branchData = _c.sent();
                    firstBranch = Array.isArray(branchData.branches) ? branchData.branches[0] : null;
                    if (!firstBranch) {
                        setSales([]);
                        setSelectedSaleIds([]);
                        return [2 /*return*/];
                    }
                    endpoint = "".concat(API_BASE, "/sales?branch_id=").concat(firstBranch.id);
                    _c.label = 4;
                case 4: return [4 /*yield*/, fetch(endpoint, {
                        headers: { Authorization: "Bearer ".concat(token) },
                    })];
                case 5:
                    res = _c.sent();
                    if (res.status === 401) {
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('user');
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, res.json()];
                case 6:
                    data = _c.sent();
                    if (!res.ok) {
                        setSalesError((_b = data.detail) !== null && _b !== void 0 ? _b : 'Unable to load sales.');
                        return [2 /*return*/];
                    }
                    list = Array.isArray(data.sales) ? data.sales.map(mapSaleFromApi) : [];
                    setSales(list);
                    setSelectedSaleIds([]);
                    return [3 /*break*/, 9];
                case 7:
                    _a = _c.sent();
                    setSalesError('Unable to reach the server.');
                    return [3 /*break*/, 9];
                case 8:
                    setIsSalesLoading(false);
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    }); };
    var fetchUsers = function () { return __awaiter(_this, void 0, void 0, function () {
        var token, res, data, list, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    token = getAuthToken();
                    if (!token) {
                        setUsersError('You are not logged in.');
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    setIsUsersLoading(true);
                    setUsersError(null);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch("".concat(API_BASE, "/users"), {
                            headers: { Authorization: "Bearer ".concat(token) },
                        })];
                case 2:
                    res = _c.sent();
                    if (res.status === 401) {
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('user');
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _c.sent();
                    if (!res.ok) {
                        setUsersError((_b = data.detail) !== null && _b !== void 0 ? _b : 'Unable to load users.');
                        return [2 /*return*/];
                    }
                    list = Array.isArray(data.users)
                        ? data.users.map(mapUserFromApi).filter(function (u) { return u.id !== currentUserId; })
                        : [];
                    setUsers(list);
                    setSelectedUserIds([]);
                    return [3 /*break*/, 6];
                case 4:
                    _a = _c.sent();
                    setUsersError('Unable to reach the server.');
                    return [3 /*break*/, 6];
                case 5:
                    setIsUsersLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleDeleteUsers = function () { return __awaiter(_this, void 0, void 0, function () {
        var token, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!selectedUserIds.length)
                        return [2 /*return*/];
                    token = getAuthToken();
                    if (!token) {
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, Promise.all(selectedUserIds.map(function (id) {
                            return fetch("".concat(API_BASE, "/users/").concat(id), { method: 'DELETE', headers: { Authorization: "Bearer ".concat(token) } });
                        }))];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, fetchUsers()];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    setUsersError('Failed to delete selected users.');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleDeleteUser = function (userId) { return __awaiter(_this, void 0, void 0, function () {
        var token, res, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    token = getAuthToken();
                    if (!token) {
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("".concat(API_BASE, "/users/").concat(userId), {
                            method: 'DELETE',
                            headers: { Authorization: "Bearer ".concat(token) },
                        })];
                case 2:
                    res = _b.sent();
                    if (!res.ok) {
                        setUsersError('Failed to delete user.');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, fetchUsers()];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    setUsersError('Failed to delete user.');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var fetchUserBranchOptions = function () { return __awaiter(_this, void 0, void 0, function () {
        var token, res, data, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    token = getAuthToken();
                    if (!token) {
                        setUserFormError('You are not logged in.');
                        return [2 /*return*/];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("".concat(API_BASE, "/branches"), {
                            headers: { Authorization: "Bearer ".concat(token) },
                        })];
                case 2:
                    res = _c.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _c.sent();
                    if (!res.ok) {
                        setUserFormError((_b = data.detail) !== null && _b !== void 0 ? _b : 'Unable to load branch options.');
                        return [2 /*return*/];
                    }
                    setUserBranchOptions(Array.isArray(data.branches) ? data.branches.map(mapBranchFromApi) : []);
                    return [3 /*break*/, 5];
                case 4:
                    _a = _c.sent();
                    setUserFormError('Unable to load branch options.');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var openAddUserModal = function () {
        setUserFormError(null);
        setEditingUserId(null);
        setUserForm({ email: '', password: '', fullName: '', role: 'staff', branchId: '' });
        if (isAdminUser) {
            void fetchUserBranchOptions();
        }
        setIsUserModalOpen(true);
    };
    var openEditUserModal = function (user) {
        setUserFormError(null);
        setEditingUserId(user.id);
        setUserForm({ email: user.email, password: '', fullName: user.fullName, role: user.role, branchId: '' });
        if (isAdminUser) {
            void fetchUserBranchOptions();
        }
        setIsUserModalOpen(true);
    };
    var closeUserModal = function () {
        setIsUserModalOpen(false);
        setEditingUserId(null);
        setUserFormError(null);
    };
    var handleUserSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var normalizedEmail, token, isEditing, endpoint, method, body, res, data, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    e.preventDefault();
                    normalizedEmail = userForm.email.trim().toLowerCase();
                    if (!editingUserId && !normalizedEmail) {
                        setUserFormError('Email is required.');
                        return [2 /*return*/];
                    }
                    if (!editingUserId && userForm.password.length < 8) {
                        setUserFormError('Password must be at least 8 characters.');
                        return [2 /*return*/];
                    }
                    token = getAuthToken();
                    if (!token) {
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 5, , 6]);
                    isEditing = editingUserId !== null;
                    endpoint = isEditing ? "".concat(API_BASE, "/users/").concat(editingUserId) : "".concat(API_BASE, "/users");
                    method = isEditing ? 'PUT' : 'POST';
                    body = {
                        full_name: userForm.fullName.trim() || undefined,
                        role: userForm.role,
                    };
                    if (isAdminUser && userForm.branchId) {
                        body.branch_id = Number(userForm.branchId);
                    }
                    if (!isEditing) {
                        body.email = normalizedEmail;
                        body.password = userForm.password;
                    }
                    return [4 /*yield*/, fetch(endpoint, {
                            method: method,
                            headers: { 'Content-Type': 'application/json', Authorization: "Bearer ".concat(token) },
                            body: JSON.stringify(body),
                        })];
                case 2:
                    res = _c.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _c.sent();
                    if (!res.ok) {
                        setUserFormError((_b = data.detail) !== null && _b !== void 0 ? _b : 'Failed to save user.');
                        return [2 /*return*/];
                    }
                    closeUserModal();
                    return [4 /*yield*/, fetchUsers()];
                case 4:
                    _c.sent();
                    return [3 /*break*/, 6];
                case 5:
                    _a = _c.sent();
                    setUserFormError('Unable to reach the server.');
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var fetchInventoryCapacity = function (branchId) { return __awaiter(_this, void 0, void 0, function () {
        var token, args, body, res, json, data, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    token = getAuthToken();
                    if (!token)
                        return [2 /*return*/];
                    setIsInventoryCapacityLoading(true);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, 5, 6]);
                    args = branchId ? "(branchId: ".concat(branchId, ")") : '';
                    body = JSON.stringify({
                        query: "{ inventoryCapacity".concat(args, " { capacity demand } }"),
                    });
                    return [4 /*yield*/, fetch("".concat(API_BASE, "/gql"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', Authorization: "Bearer ".concat(token) },
                            body: body,
                        })];
                case 2:
                    res = _c.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    json = _c.sent();
                    data = (_b = json === null || json === void 0 ? void 0 : json.data) === null || _b === void 0 ? void 0 : _b.inventoryCapacity;
                    if (data) {
                        setInventoryCapacity({ capacity: Number(data.capacity), demand: Number(data.demand) });
                    }
                    return [3 /*break*/, 6];
                case 4:
                    _a = _c.sent();
                    return [3 /*break*/, 6];
                case 5:
                    setIsInventoryCapacityLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var fetchDailySales = function (branchId) { return __awaiter(_this, void 0, void 0, function () {
        var token, args, body, res, json, data, _a;
        var _b, _c, _d, _e, _f, _g, _h, _j;
        return __generator(this, function (_k) {
            switch (_k.label) {
                case 0:
                    token = getAuthToken();
                    if (!token)
                        return [2 /*return*/];
                    setIsDailySalesLoading(true);
                    _k.label = 1;
                case 1:
                    _k.trys.push([1, 4, 5, 6]);
                    args = branchId ? "(branchId: ".concat(branchId, ")") : '';
                    body = JSON.stringify({
                        query: "{ dailySales".concat(args, " { day1 day2 day3 day4 day5 day6 day7 } }"),
                    });
                    return [4 /*yield*/, fetch("".concat(API_BASE, "/gql"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', Authorization: "Bearer ".concat(token) },
                            body: body,
                        })];
                case 2:
                    res = _k.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    json = _k.sent();
                    data = (_b = json === null || json === void 0 ? void 0 : json.data) === null || _b === void 0 ? void 0 : _b.dailySales;
                    if (data) {
                        setDailySales({
                            day1: Number((_c = data.day1) !== null && _c !== void 0 ? _c : 0),
                            day2: Number((_d = data.day2) !== null && _d !== void 0 ? _d : 0),
                            day3: Number((_e = data.day3) !== null && _e !== void 0 ? _e : 0),
                            day4: Number((_f = data.day4) !== null && _f !== void 0 ? _f : 0),
                            day5: Number((_g = data.day5) !== null && _g !== void 0 ? _g : 0),
                            day6: Number((_h = data.day6) !== null && _h !== void 0 ? _h : 0),
                            day7: Number((_j = data.day7) !== null && _j !== void 0 ? _j : 0),
                        });
                    }
                    return [3 /*break*/, 6];
                case 4:
                    _a = _k.sent();
                    return [3 /*break*/, 6];
                case 5:
                    setIsDailySalesLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var fetchActiveOrders = function (branchId) { return __awaiter(_this, void 0, void 0, function () {
        var token, args, body, res, json, data, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    token = getAuthToken();
                    if (!token)
                        return [2 /*return*/];
                    setIsActiveOrdersLoading(true);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, 5, 6]);
                    args = branchId ? "(branchId: ".concat(branchId, ")") : '';
                    body = JSON.stringify({
                        query: "{ activeOrders".concat(args, " { orderNumber customerName orderStatus orderType totalAmount } }"),
                    });
                    return [4 /*yield*/, fetch("".concat(API_BASE, "/gql"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', Authorization: "Bearer ".concat(token) },
                            body: body,
                        })];
                case 2:
                    res = _c.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    json = _c.sent();
                    data = (_b = json === null || json === void 0 ? void 0 : json.data) === null || _b === void 0 ? void 0 : _b.activeOrders;
                    if (Array.isArray(data)) {
                        setActiveOrders(data.map(function (o) {
                            var _a, _b;
                            return ({
                                orderNumber: String(o.orderNumber),
                                customerName: (_a = o.customerName) !== null && _a !== void 0 ? _a : null,
                                orderStatus: String(o.orderStatus),
                                orderType: String(o.orderType),
                                totalAmount: Number((_b = o.totalAmount) !== null && _b !== void 0 ? _b : 0),
                            });
                        }));
                    }
                    return [3 /*break*/, 6];
                case 4:
                    _a = _c.sent();
                    return [3 /*break*/, 6];
                case 5:
                    setIsActiveOrdersLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    (0, react_2.useEffect)(function () {
        var requestedView = localStorage.getItem(DASHBOARD_MOBILE_VIEW_KEY);
        if (requestedView && isSidebarView(requestedView)) {
            setActiveView(requestedView);
        }
        localStorage.removeItem(DASHBOARD_MOBILE_VIEW_KEY);
    }, []);
    (0, react_2.useEffect)(function () {
        var handleMobileViewChange = function (event) {
            var _a;
            var customEvent = event;
            var requestedView = (_a = customEvent.detail) === null || _a === void 0 ? void 0 : _a.view;
            if (requestedView && isSidebarView(requestedView)) {
                setActiveView(requestedView);
            }
        };
        window.addEventListener(DASHBOARD_MOBILE_VIEW_EVENT, handleMobileViewChange);
        return function () {
            window.removeEventListener(DASHBOARD_MOBILE_VIEW_EVENT, handleMobileViewChange);
        };
    }, []);
    (0, react_2.useEffect)(function () {
        if (activeView === 'deliveries') {
            void fetchOrders();
        }
        if (activeView === 'sales') {
            void fetchSales();
        }
        if (activeView === 'branches') {
            void fetchBranches();
        }
        if (activeView === 'dashboard' && isAdminUser) {
            void fetchBranches();
        }
        if (activeView === 'dashboard') {
            void fetchInventoryCapacity(overviewBranchFilter || undefined);
            void fetchDailySales(overviewBranchFilter || undefined);
            void fetchActiveOrders(overviewBranchFilter || undefined);
        }
        if (activeView === 'customers') {
            void fetchCustomers();
        }
        if (activeView === 'inventory') {
            void fetchInventories();
        }
        if (activeView === 'products') {
            void fetchProducts();
        }
        if (activeView === 'quality') {
            void fetchMaintenance();
        }
        if (activeView === 'users') {
            void fetchUsers();
        }
    }, [activeView]);
    (0, react_2.useEffect)(function () {
        if (activeView === 'dashboard') {
            void fetchInventoryCapacity(overviewBranchFilter || undefined);
            void fetchDailySales(overviewBranchFilter || undefined);
            void fetchActiveOrders(overviewBranchFilter || undefined);
        }
    }, [overviewBranchFilter, activeView]);
    var allBranchesSelected = branches.length > 0 && selectedBranchIds.length === branches.length;
    var allCustomersSelected = customers.length > 0 && selectedCustomerIds.length === customers.length;
    var allInventoriesSelected = inventories.length > 0 && selectedInventoryIds.length === inventories.length;
    var allOrdersSelected = orders.length > 0 && selectedOrderIds.length === orders.length;
    var allSalesSelected = sales.length > 0 && selectedSaleIds.length === sales.length;
    var allMaintenanceSelected = maintenance.length > 0 && selectedMaintenanceIds.length === maintenance.length;
    var allUsersSelected = users.length > 0 && selectedUserIds.length === users.length;
    var totalProductPages = Math.max(1, Math.ceil(products.length / ORDERS_PER_PAGE));
    var paginatedProducts = products.slice((productPage - 1) * ORDERS_PER_PAGE, productPage * ORDERS_PER_PAGE);
    var filteredOrders = orders.filter(function (order) {
        var orderDate = order.deliveryDate ? new Date(order.deliveryDate) : null;
        if (orderDateFrom && (!orderDate || orderDate < new Date(orderDateFrom))) {
            return false;
        }
        if (orderDateTo && (!orderDate || orderDate > new Date(orderDateTo))) {
            return false;
        }
        if (orderTypeFilter && order.orderType !== orderTypeFilter) {
            return false;
        }
        if (containerTypeFilter && order.containerType !== containerTypeFilter) {
            return false;
        }
        return true;
    });
    var totalOrderPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));
    var paginatedOrders = filteredOrders.slice((orderPage - 1) * ORDERS_PER_PAGE, orderPage * ORDERS_PER_PAGE);
    var totalCustomerPages = Math.max(1, Math.ceil(customers.length / ORDERS_PER_PAGE));
    var paginatedCustomers = customers.slice((customerPage - 1) * ORDERS_PER_PAGE, customerPage * ORDERS_PER_PAGE);
    var totalBranchPages = Math.max(1, Math.ceil(branches.length / ORDERS_PER_PAGE));
    var paginatedBranches = branches.slice((branchPage - 1) * ORDERS_PER_PAGE, branchPage * ORDERS_PER_PAGE);
    var totalInventoryPages = Math.max(1, Math.ceil(inventories.length / ORDERS_PER_PAGE));
    var paginatedInventories = inventories.slice((inventoryPage - 1) * ORDERS_PER_PAGE, inventoryPage * ORDERS_PER_PAGE);
    var totalUserPages = Math.max(1, Math.ceil(users.length / ORDERS_PER_PAGE));
    var paginatedUsers = users.slice((userPage - 1) * ORDERS_PER_PAGE, userPage * ORDERS_PER_PAGE);
    var totalMaintenancePages = Math.max(1, Math.ceil(maintenance.length / ORDERS_PER_PAGE));
    var paginatedMaintenance = maintenance.slice((maintenancePage - 1) * ORDERS_PER_PAGE, maintenancePage * ORDERS_PER_PAGE);
    var totalSalePages = Math.max(1, Math.ceil(sales.length / ORDERS_PER_PAGE));
    var paginatedSales = sales.slice((salePage - 1) * ORDERS_PER_PAGE, salePage * ORDERS_PER_PAGE);
    (0, react_2.useEffect)(function () {
        setOrderPage(1);
    }, [orderDateFrom, orderDateTo, orderTypeFilter, containerTypeFilter]);
    (0, react_2.useEffect)(function () {
        if (orderPage > totalOrderPages) {
            setOrderPage(totalOrderPages);
        }
    }, [orderPage, totalOrderPages]);
    (0, react_2.useEffect)(function () {
        setCustomerPage(1);
    }, [customers.length]);
    (0, react_2.useEffect)(function () {
        if (customerPage > totalCustomerPages) {
            setCustomerPage(totalCustomerPages);
        }
    }, [customerPage, totalCustomerPages]);
    (0, react_2.useEffect)(function () {
        setBranchPage(1);
    }, [branches.length]);
    (0, react_2.useEffect)(function () {
        if (branchPage > totalBranchPages) {
            setBranchPage(totalBranchPages);
        }
    }, [branchPage, totalBranchPages]);
    (0, react_2.useEffect)(function () {
        setInventoryPage(1);
    }, [inventories.length]);
    (0, react_2.useEffect)(function () {
        if (inventoryPage > totalInventoryPages) {
            setInventoryPage(totalInventoryPages);
        }
    }, [inventoryPage, totalInventoryPages]);
    (0, react_2.useEffect)(function () {
        setProductPage(1);
    }, [products.length]);
    (0, react_2.useEffect)(function () {
        if (productPage > totalProductPages) {
            setProductPage(totalProductPages);
        }
    }, [productPage, totalProductPages]);
    (0, react_2.useEffect)(function () {
        setMaintenancePage(1);
    }, [maintenance.length]);
    (0, react_2.useEffect)(function () {
        if (maintenancePage > totalMaintenancePages) {
            setMaintenancePage(totalMaintenancePages);
        }
    }, [maintenancePage, totalMaintenancePages]);
    (0, react_2.useEffect)(function () {
        setUserPage(1);
    }, [users.length]);
    (0, react_2.useEffect)(function () {
        if (userPage > totalUserPages) {
            setUserPage(totalUserPages);
        }
    }, [userPage, totalUserPages]);
    (0, react_2.useEffect)(function () {
        setSalePage(1);
    }, [sales.length]);
    (0, react_2.useEffect)(function () {
        if (salePage > totalSalePages) {
            setSalePage(totalSalePages);
        }
    }, [salePage, totalSalePages]);
    var toggleSelectAllBranches = function () {
        if (allBranchesSelected) {
            setSelectedBranchIds([]);
            return;
        }
        setSelectedBranchIds(branches.map(function (branch) { return branch.id; }));
    };
    var toggleBranchSelection = function (branchId) {
        setSelectedBranchIds(function (current) {
            return current.includes(branchId)
                ? current.filter(function (id) { return id !== branchId; })
                : __spreadArray(__spreadArray([], current, true), [branchId], false);
        });
    };
    var toggleSelectAllCustomers = function () {
        if (allCustomersSelected) {
            setSelectedCustomerIds([]);
            return;
        }
        setSelectedCustomerIds(customers.map(function (customer) { return customer.id; }));
    };
    var toggleCustomerSelection = function (customerId) {
        setSelectedCustomerIds(function (current) {
            return current.includes(customerId)
                ? current.filter(function (id) { return id !== customerId; })
                : __spreadArray(__spreadArray([], current, true), [customerId], false);
        });
    };
    var toggleSelectAllInventories = function () {
        if (allInventoriesSelected) {
            setSelectedInventoryIds([]);
            return;
        }
        setSelectedInventoryIds(inventories.map(function (inv) { return inv.id; }));
    };
    var toggleInventorySelection = function (inventoryId) {
        setSelectedInventoryIds(function (current) {
            return current.includes(inventoryId)
                ? current.filter(function (id) { return id !== inventoryId; })
                : __spreadArray(__spreadArray([], current, true), [inventoryId], false);
        });
    };
    var toggleSelectAllMaintenance = function () {
        if (allMaintenanceSelected) {
            setSelectedMaintenanceIds([]);
            return;
        }
        setSelectedMaintenanceIds(maintenance.map(function (item) { return item.id; }));
    };
    var toggleMaintenanceSelection = function (maintenanceId) {
        setSelectedMaintenanceIds(function (current) {
            return current.includes(maintenanceId)
                ? current.filter(function (id) { return id !== maintenanceId; })
                : __spreadArray(__spreadArray([], current, true), [maintenanceId], false);
        });
    };
    var toggleSelectAllOrders = function () {
        if (allOrdersSelected) {
            setSelectedOrderIds([]);
            return;
        }
        setSelectedOrderIds(orders.map(function (order) { return order.id; }));
    };
    var toggleOrderSelection = function (orderId) {
        setSelectedOrderIds(function (current) {
            return current.includes(orderId) ? current.filter(function (id) { return id !== orderId; }) : __spreadArray(__spreadArray([], current, true), [orderId], false);
        });
    };
    var toggleSelectAllSales = function () {
        if (allSalesSelected) {
            setSelectedSaleIds([]);
            return;
        }
        setSelectedSaleIds(sales.map(function (sale) { return sale.id; }));
    };
    var toggleSaleSelection = function (saleId) {
        setSelectedSaleIds(function (current) {
            return current.includes(saleId) ? current.filter(function (id) { return id !== saleId; }) : __spreadArray(__spreadArray([], current, true), [saleId], false);
        });
    };
    var toggleSelectAllUsers = function () {
        if (allUsersSelected) {
            setSelectedUserIds([]);
            return;
        }
        setSelectedUserIds(users.map(function (u) { return u.id; }));
    };
    var toggleUserSelection = function (userId) {
        setSelectedUserIds(function (current) {
            return current.includes(userId) ? current.filter(function (id) { return id !== userId; }) : __spreadArray(__spreadArray([], current, true), [userId], false);
        });
    };
    var handleDeleteBranches = function () { return __awaiter(_this, void 0, void 0, function () {
        var token, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!selectedBranchIds.length) {
                        return [2 /*return*/];
                    }
                    token = getAuthToken();
                    if (!token) {
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, Promise.all(selectedBranchIds.map(function (branchId) {
                            return fetch("".concat(API_BASE, "/branches/").concat(branchId), {
                                method: 'DELETE',
                                headers: {
                                    Authorization: "Bearer ".concat(token),
                                },
                            });
                        }))];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, fetchBranches()];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    setBranchesError('Failed to delete selected branches.');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleDeleteBranch = function (branchId) { return __awaiter(_this, void 0, void 0, function () {
        var token, res, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    token = getAuthToken();
                    if (!token) {
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("".concat(API_BASE, "/branches/").concat(branchId), {
                            method: 'DELETE',
                            headers: {
                                Authorization: "Bearer ".concat(token),
                            },
                        })];
                case 2:
                    res = _b.sent();
                    if (!res.ok) {
                        setBranchesError('Failed to delete branch.');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, fetchBranches()];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    setBranchesError('Failed to delete branch.');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleDeleteCustomers = function () { return __awaiter(_this, void 0, void 0, function () {
        var token, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!selectedCustomerIds.length) {
                        return [2 /*return*/];
                    }
                    token = getAuthToken();
                    if (!token) {
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, Promise.all(selectedCustomerIds.map(function (customerId) {
                            return fetch("".concat(API_BASE, "/customers/").concat(customerId), {
                                method: 'DELETE',
                                headers: {
                                    Authorization: "Bearer ".concat(token),
                                },
                            });
                        }))];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, fetchCustomers()];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    setCustomersError('Failed to delete selected customers.');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleDeleteCustomer = function (customerId) { return __awaiter(_this, void 0, void 0, function () {
        var token, res, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    token = getAuthToken();
                    if (!token) {
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("".concat(API_BASE, "/customers/").concat(customerId), {
                            method: 'DELETE',
                            headers: {
                                Authorization: "Bearer ".concat(token),
                            },
                        })];
                case 2:
                    res = _b.sent();
                    if (!res.ok) {
                        setCustomersError('Failed to delete customer.');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, fetchCustomers()];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    setCustomersError('Failed to delete customer.');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var toggleCustomerStatus = function (customerId) { return __awaiter(_this, void 0, void 0, function () {
        var token, customer, nextStatus, res, data, updated_1, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    token = getAuthToken();
                    if (!token) {
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    customer = customers.find(function (item) { return item.id === customerId; });
                    if (!customer) {
                        return [2 /*return*/];
                    }
                    nextStatus = customer.status === 'active' ? 'inactive' : 'active';
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("".concat(API_BASE, "/customers/").concat(customerId), {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: "Bearer ".concat(token),
                            },
                            body: JSON.stringify({ status: nextStatus }),
                        })];
                case 2:
                    res = _b.sent();
                    if (!res.ok) {
                        setCustomersError('Failed to update customer status.');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _b.sent();
                    if (data.customer) {
                        updated_1 = mapCustomerFromApi(data.customer);
                        setCustomers(function (current) { return current.map(function (item) { return (item.id === updated_1.id ? updated_1 : item); }); });
                    }
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    setCustomersError('Failed to update customer status.');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var toggleBranchStatus = function (branchId) { return __awaiter(_this, void 0, void 0, function () {
        var token, branch, nextStatus, res, data, updated_2, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    token = getAuthToken();
                    if (!token) {
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    branch = branches.find(function (item) { return item.id === branchId; });
                    if (!branch) {
                        return [2 /*return*/];
                    }
                    nextStatus = branch.status === 'active' ? 'inactive' : 'active';
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("".concat(API_BASE, "/branches/").concat(branchId), {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: "Bearer ".concat(token),
                            },
                            body: JSON.stringify({ status: nextStatus }),
                        })];
                case 2:
                    res = _b.sent();
                    if (!res.ok) {
                        setBranchesError('Failed to update branch status.');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _b.sent();
                    if (data.branch) {
                        updated_2 = mapBranchFromApi(data.branch);
                        setBranches(function (current) { return current.map(function (item) { return (item.id === updated_2.id ? updated_2 : item); }); });
                    }
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    setBranchesError('Failed to update branch status.');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleDeleteInventories = function () { return __awaiter(_this, void 0, void 0, function () {
        var token, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!selectedInventoryIds.length)
                        return [2 /*return*/];
                    token = getAuthToken();
                    if (!token) {
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, Promise.all(selectedInventoryIds.map(function (id) {
                            return fetch("".concat(API_BASE, "/inventories/").concat(id), {
                                method: 'DELETE',
                                headers: { Authorization: "Bearer ".concat(token) },
                            });
                        }))];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, fetchInventories()];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    setInventoriesError('Failed to delete selected inventories.');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleDeleteInventory = function (inventoryId) { return __awaiter(_this, void 0, void 0, function () {
        var token, res, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    token = getAuthToken();
                    if (!token) {
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("".concat(API_BASE, "/inventories/").concat(inventoryId), {
                            method: 'DELETE',
                            headers: { Authorization: "Bearer ".concat(token) },
                        })];
                case 2:
                    res = _b.sent();
                    if (!res.ok) {
                        setInventoriesError('Failed to delete inventory.');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, fetchInventories()];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    setInventoriesError('Failed to delete inventory.');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleDeleteMaintenances = function () { return __awaiter(_this, void 0, void 0, function () {
        var token, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!selectedMaintenanceIds.length)
                        return [2 /*return*/];
                    token = getAuthToken();
                    if (!token) {
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, Promise.all(selectedMaintenanceIds.map(function (id) {
                            return fetch("".concat(API_BASE, "/maintenance/").concat(id), {
                                method: 'DELETE',
                                headers: { Authorization: "Bearer ".concat(token) },
                            });
                        }))];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, fetchMaintenance()];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    setMaintenanceError('Failed to delete selected maintenance records.');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleDeleteMaintenance = function (maintenanceId) { return __awaiter(_this, void 0, void 0, function () {
        var token, res, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    token = getAuthToken();
                    if (!token) {
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("".concat(API_BASE, "/maintenance/").concat(maintenanceId), {
                            method: 'DELETE',
                            headers: { Authorization: "Bearer ".concat(token) },
                        })];
                case 2:
                    res = _b.sent();
                    if (!res.ok) {
                        setMaintenanceError('Failed to delete maintenance record.');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, fetchMaintenance()];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    setMaintenanceError('Failed to delete maintenance record.');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var toggleInventoryStatus = function (inventoryId) { return __awaiter(_this, void 0, void 0, function () {
        var token, inv, nextStatus, res, data, updated_3, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    token = getAuthToken();
                    if (!token) {
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    inv = inventories.find(function (item) { return item.id === inventoryId; });
                    if (!inv)
                        return [2 /*return*/];
                    nextStatus = inv.status === 'active' ? 'inactive' : 'active';
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("".concat(API_BASE, "/inventories/").concat(inventoryId), {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json', Authorization: "Bearer ".concat(token) },
                            body: JSON.stringify({ status: nextStatus }),
                        })];
                case 2:
                    res = _b.sent();
                    if (!res.ok) {
                        setInventoriesError('Failed to update inventory status.');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _b.sent();
                    if (data.inventory) {
                        updated_3 = mapInventoryFromApi(data.inventory);
                        setInventories(function (current) { return current.map(function (item) { return (item.id === updated_3.id ? updated_3 : item); }); });
                    }
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    setInventoriesError('Failed to update inventory status.');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var fetchInventoryBranchOptions = function () { return __awaiter(_this, void 0, void 0, function () {
        var token, res, data, list, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    token = getAuthToken();
                    if (!token) {
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("".concat(API_BASE, "/branches"), {
                            headers: { Authorization: "Bearer ".concat(token) },
                        })];
                case 2:
                    res = _c.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _c.sent();
                    if (!res.ok) {
                        setInventoryFormError((_b = data.detail) !== null && _b !== void 0 ? _b : 'Unable to load branch options.');
                        return [2 /*return*/];
                    }
                    list = Array.isArray(data.branches) ? data.branches.map(mapBranchFromApi) : [];
                    setInventoryBranchOptions(list);
                    return [3 /*break*/, 5];
                case 4:
                    _a = _c.sent();
                    setInventoryFormError('Unable to load branch options.');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var fetchMaintenanceBranchOptions = function () { return __awaiter(_this, void 0, void 0, function () {
        var token, res, data, list, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    token = getAuthToken();
                    if (!token) {
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("".concat(API_BASE, "/branches"), {
                            headers: { Authorization: "Bearer ".concat(token) },
                        })];
                case 2:
                    res = _c.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _c.sent();
                    if (!res.ok) {
                        setMaintenanceFormError((_b = data.detail) !== null && _b !== void 0 ? _b : 'Unable to load branch options.');
                        return [2 /*return*/];
                    }
                    list = Array.isArray(data.branches) ? data.branches.map(mapBranchFromApi) : [];
                    setMaintenanceBranchOptions(list);
                    return [3 /*break*/, 5];
                case 4:
                    _a = _c.sent();
                    setMaintenanceFormError('Unable to load branch options.');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var openAddInventoryModal = function () {
        setInventoryFormError(null);
        setEditingInventoryId(null);
        setInventoryForm({ branchId: '', code: '', name: '', description: '', supplier: '', quantity: '0', capacity: '0', unitCost: '0', sellingPrice: '0' });
        if (isAdminUser)
            void fetchInventoryBranchOptions();
        setIsInventoryModalOpen(true);
    };
    var fetchProductBranchOptions = function () { return __awaiter(_this, void 0, void 0, function () {
        var token, res, data, list, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    token = getAuthToken();
                    if (!token) {
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("".concat(API_BASE, "/branches"), {
                            headers: { Authorization: "Bearer ".concat(token) },
                        })];
                case 2:
                    res = _c.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _c.sent();
                    if (!res.ok) {
                        setProductFormError((_b = data.detail) !== null && _b !== void 0 ? _b : 'Unable to load branch options.');
                        return [2 /*return*/];
                    }
                    list = Array.isArray(data.branches) ? data.branches.map(mapBranchFromApi) : [];
                    setProductBranchOptions(list);
                    return [3 /*break*/, 5];
                case 4:
                    _a = _c.sent();
                    setProductFormError('Unable to load branch options.');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var openAddProduct = function () {
        setEditingProductId(null);
        setProductFormError(null);
        setProductForm({ branchId: '', code: '', name: '', description: '', unitPrice: '0' });
        setProductComponentToAdd('');
        setProductComponents([]);
        if (isAdminUser)
            void fetchProductBranchOptions();
        if (!inventories.length)
            void fetchInventories();
        setIsProductModalOpen(true);
    };
    var closeProductModal = function () {
        setIsProductModalOpen(false);
    };
    var handleProductSubmit = function (event) { return __awaiter(_this, void 0, void 0, function () {
        var token, branchId, components, res, data, createdProduct_1, _a;
        var _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    event.preventDefault();
                    token = getAuthToken();
                    if (!token) {
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    setProductFormError(null);
                    branchId = productForm.branchId ? Number(productForm.branchId) : undefined;
                    components = productComponents.map(function (item) { return ({
                        id: item.id,
                        code: item.code,
                        name: item.name,
                        description: item.description,
                        unit_cost: item.unit_cost,
                    }); });
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("".concat(API_BASE, "/products"), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: "Bearer ".concat(token),
                            },
                            body: JSON.stringify({
                                branch_id: branchId,
                                code: productForm.code,
                                name: productForm.name,
                                description: productForm.description,
                                unit_price: Number(productForm.unitPrice || 0),
                                components: components,
                            }),
                        })];
                case 2:
                    res = _f.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _f.sent();
                    if (!res.ok) {
                        setProductFormError((_b = data.detail) !== null && _b !== void 0 ? _b : 'Unable to save product.');
                        return [2 /*return*/];
                    }
                    createdProduct_1 = data.product ? __assign(__assign({}, mapProductFromApi(data.product)), { code: (_c = data.product.code) !== null && _c !== void 0 ? _c : productForm.code }) : {
                        id: Date.now(),
                        branchId: branchId !== null && branchId !== void 0 ? branchId : null,
                        branchName: (_e = (_d = productBranchOptions.find(function (b) { return b.id === branchId; })) === null || _d === void 0 ? void 0 : _d.name) !== null && _e !== void 0 ? _e : '',
                        code: productForm.code,
                        name: productForm.name,
                        description: productForm.description,
                        unitPrice: Number(productForm.unitPrice || 0),
                        components: components,
                    };
                    setProducts(function (current) { return __spreadArray([createdProduct_1], current, true); });
                    setIsProductModalOpen(false);
                    setProductForm({ branchId: '', code: '', name: '', description: '', unitPrice: '0' });
                    setProductComponents([]);
                    setProductComponentToAdd('');
                    return [3 /*break*/, 5];
                case 4:
                    _a = _f.sent();
                    setProductFormError('Unable to reach the server.');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var openAddMaintenanceModal = function () {
        setEditingMaintenanceId(null);
        setMaintenanceFormError(null);
        setMaintenanceForm({ branchId: '', code: '', name: '', supplier: '', contact: '', expirationDays: '0', dateReplaced: '' });
        if (isAdminUser)
            void fetchMaintenanceBranchOptions();
        setIsMaintenanceModalOpen(true);
    };
    var openEditMaintenanceModal = function (item) {
        var _a, _b, _c;
        setEditingMaintenanceId(item.id);
        setMaintenanceFormError(null);
        setMaintenanceForm({
            branchId: item.branchId ? String(item.branchId) : '',
            code: item.code,
            name: item.name,
            supplier: (_a = item.supplier) !== null && _a !== void 0 ? _a : '',
            contact: (_b = item.contact) !== null && _b !== void 0 ? _b : '',
            expirationDays: String((_c = item.expirationDays) !== null && _c !== void 0 ? _c : 0),
            dateReplaced: item.dateReplaced || '',
        });
        if (isAdminUser)
            void fetchMaintenanceBranchOptions();
        setIsMaintenanceModalOpen(true);
    };
    var closeMaintenanceModal = function () {
        setIsMaintenanceModalOpen(false);
        setEditingMaintenanceId(null);
        setMaintenanceFormError(null);
    };
    var handleMaintenanceSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var normalizedCode, normalizedName, expirationDays, token, method, url, res, data, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    e.preventDefault();
                    normalizedCode = maintenanceForm.code.trim();
                    normalizedName = maintenanceForm.name.trim();
                    if (!normalizedCode) {
                        setMaintenanceFormError('Code is required.');
                        return [2 /*return*/];
                    }
                    if (!normalizedName) {
                        setMaintenanceFormError('Name is required.');
                        return [2 /*return*/];
                    }
                    expirationDays = Number(maintenanceForm.expirationDays);
                    if (isNaN(expirationDays) || expirationDays < 0) {
                        setMaintenanceFormError('Expiration days must be 0 or more.');
                        return [2 /*return*/];
                    }
                    token = getAuthToken();
                    if (!token) {
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 5, , 6]);
                    method = editingMaintenanceId ? 'PUT' : 'POST';
                    url = editingMaintenanceId ? "".concat(API_BASE, "/maintenance/").concat(editingMaintenanceId) : "".concat(API_BASE, "/maintenance");
                    return [4 /*yield*/, fetch(url, {
                            method: method,
                            headers: { 'Content-Type': 'application/json', Authorization: "Bearer ".concat(token) },
                            body: JSON.stringify(__assign(__assign({}, (isAdminUser && maintenanceForm.branchId ? { branch_id: Number(maintenanceForm.branchId) } : {})), { code: normalizedCode, name: normalizedName, supplier: maintenanceForm.supplier.trim() || null, contact: maintenanceForm.contact.trim() || null, expiration_days: expirationDays, date_replaced: maintenanceForm.dateReplaced || null })),
                        })];
                case 2:
                    res = _c.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _c.sent();
                    if (!res.ok) {
                        setMaintenanceFormError((_b = data.detail) !== null && _b !== void 0 ? _b : (editingMaintenanceId ? 'Failed to update maintenance item.' : 'Failed to add maintenance item.'));
                        return [2 /*return*/];
                    }
                    closeMaintenanceModal();
                    return [4 /*yield*/, fetchMaintenance()];
                case 4:
                    _c.sent();
                    return [3 /*break*/, 6];
                case 5:
                    _a = _c.sent();
                    setMaintenanceFormError('Unable to reach the server.');
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var openEditInventoryModal = function (inv) {
        setInventoryFormError(null);
        setEditingInventoryId(inv.id);
        setInventoryForm({
            branchId: inv.branchId ? String(inv.branchId) : '',
            code: inv.code,
            name: inv.name,
            description: inv.description,
            supplier: inv.supplier,
            quantity: String(inv.quantity),
            capacity: String(inv.capacity),
            unitCost: String(inv.unitCost),
            sellingPrice: String(inv.sellingPrice),
        });
        if (isAdminUser)
            void fetchInventoryBranchOptions();
        setIsInventoryModalOpen(true);
    };
    var closeInventoryModal = function () {
        setIsInventoryModalOpen(false);
        setEditingInventoryId(null);
        setInventoryFormError(null);
    };
    var handleInventorySubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var normalizedCode, normalizedName, qty, capacity, unitCost, sellingPrice, token, res, data, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    e.preventDefault();
                    normalizedCode = inventoryForm.code.trim();
                    normalizedName = inventoryForm.name.trim();
                    if (!normalizedCode) {
                        setInventoryFormError('Code is required.');
                        return [2 /*return*/];
                    }
                    if (!normalizedName) {
                        setInventoryFormError('Name is required.');
                        return [2 /*return*/];
                    }
                    qty = Number(inventoryForm.quantity);
                    if (isNaN(qty) || qty < 0) {
                        setInventoryFormError('Quantity must be 0 or more.');
                        return [2 /*return*/];
                    }
                    capacity = Number(inventoryForm.capacity);
                    if (isNaN(capacity) || capacity < 0) {
                        setInventoryFormError('Capacity must be 0 or more.');
                        return [2 /*return*/];
                    }
                    unitCost = Number(inventoryForm.unitCost);
                    if (isNaN(unitCost) || unitCost < 0) {
                        setInventoryFormError('Unit cost must be 0 or more.');
                        return [2 /*return*/];
                    }
                    sellingPrice = Number(inventoryForm.sellingPrice);
                    if (isNaN(sellingPrice) || sellingPrice < 0) {
                        setInventoryFormError('Selling price must be 0 or more.');
                        return [2 /*return*/];
                    }
                    token = getAuthToken();
                    if (!token) {
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, fetch(editingInventoryId ? "".concat(API_BASE, "/inventories/").concat(editingInventoryId) : "".concat(API_BASE, "/inventories"), {
                            method: editingInventoryId ? 'PUT' : 'POST',
                            headers: { 'Content-Type': 'application/json', Authorization: "Bearer ".concat(token) },
                            body: JSON.stringify(__assign(__assign({}, (isAdminUser && inventoryForm.branchId ? { branch_id: Number(inventoryForm.branchId) } : {})), { code: normalizedCode, name: normalizedName, description: inventoryForm.description.trim(), supplier: inventoryForm.supplier.trim(), quantity: qty, capacity: capacity, unit_cost: unitCost, selling_price: sellingPrice })),
                        })];
                case 2:
                    res = _c.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _c.sent();
                    if (!res.ok) {
                        setInventoryFormError((_b = data.detail) !== null && _b !== void 0 ? _b : 'Failed to save inventory.');
                        return [2 /*return*/];
                    }
                    closeInventoryModal();
                    return [4 /*yield*/, fetchInventories()];
                case 4:
                    _c.sent();
                    return [3 /*break*/, 6];
                case 5:
                    _a = _c.sent();
                    setInventoryFormError('Unable to reach the server.');
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleDeleteOrders = function () { return __awaiter(_this, void 0, void 0, function () {
        var token, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!selectedOrderIds.length) {
                        return [2 /*return*/];
                    }
                    token = getAuthToken();
                    if (!token) {
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, Promise.all(selectedOrderIds.map(function (id) {
                            return fetch("".concat(API_BASE, "/orders/").concat(id), {
                                method: 'DELETE',
                                headers: { Authorization: "Bearer ".concat(token) },
                            });
                        }))];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, fetchOrders()];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    setOrdersError('Failed to delete selected orders.');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleDeleteSales = function () { return __awaiter(_this, void 0, void 0, function () {
        var token, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!selectedSaleIds.length) {
                        return [2 /*return*/];
                    }
                    token = getAuthToken();
                    if (!token) {
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, Promise.all(selectedSaleIds.map(function (id) {
                            return fetch("".concat(API_BASE, "/sales/").concat(id), {
                                method: 'DELETE',
                                headers: { Authorization: "Bearer ".concat(token) },
                            });
                        }))];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, fetchSales()];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    setSalesError('Failed to delete selected sales.');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleDeleteSale = function (saleId) { return __awaiter(_this, void 0, void 0, function () {
        var token, res, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    token = getAuthToken();
                    if (!token) {
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("".concat(API_BASE, "/sales/").concat(saleId), {
                            method: 'DELETE',
                            headers: { Authorization: "Bearer ".concat(token) },
                        })];
                case 2:
                    res = _b.sent();
                    if (!res.ok) {
                        setSalesError('Failed to delete sale.');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, fetchSales()];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    setSalesError('Failed to delete sale.');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var fetchSaleBranchOptions = function () { return __awaiter(_this, void 0, void 0, function () {
        var token, res, data, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    token = getAuthToken();
                    if (!token) {
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("".concat(API_BASE, "/branches"), { headers: { Authorization: "Bearer ".concat(token) } })];
                case 2:
                    res = _c.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _c.sent();
                    if (!res.ok) {
                        setSaleFormError((_b = data.detail) !== null && _b !== void 0 ? _b : 'Unable to load branch options.');
                        return [2 /*return*/];
                    }
                    setSaleBranchOptions(Array.isArray(data.branches) ? data.branches.map(mapBranchFromApi) : []);
                    return [3 /*break*/, 5];
                case 4:
                    _a = _c.sent();
                    setSaleFormError('Unable to load branch options.');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var openCreateSaleModal = function () { return __awaiter(_this, void 0, void 0, function () {
        var now, invoiceSuffix, invoiceNumber;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setEditingSaleId(null);
                    setSaleFormError(null);
                    now = new Date();
                    invoiceSuffix = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
                    invoiceNumber = "INV-".concat(now.getFullYear(), "-").concat(invoiceSuffix);
                    setSaleForm(__assign(__assign({}, emptySaleForm()), { invoiceNumber: invoiceNumber, saleDate: now.toISOString().slice(0, 10) }));
                    if (!isAdminUser) return [3 /*break*/, 2];
                    return [4 /*yield*/, fetchSaleBranchOptions()];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    setIsSaleModalOpen(true);
                    return [2 /*return*/];
            }
        });
    }); };
    var openEditSaleModal = function (saleId) { return __awaiter(_this, void 0, void 0, function () {
        var token, res, data, sale, saleDate, _a;
        var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
        return __generator(this, function (_s) {
            switch (_s.label) {
                case 0:
                    token = getAuthToken();
                    if (!token) {
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    setSaleFormError(null);
                    if (!isAdminUser) return [3 /*break*/, 2];
                    return [4 /*yield*/, fetchSaleBranchOptions()];
                case 1:
                    _s.sent();
                    _s.label = 2;
                case 2:
                    _s.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, fetch("".concat(API_BASE, "/sales/").concat(saleId), {
                            headers: { Authorization: "Bearer ".concat(token) },
                        })];
                case 3:
                    res = _s.sent();
                    return [4 /*yield*/, res.json()];
                case 4:
                    data = _s.sent();
                    if (!res.ok || !data.sale) {
                        setSaleFormError((_b = data.detail) !== null && _b !== void 0 ? _b : 'Unable to load sale details.');
                        return [2 /*return*/];
                    }
                    sale = data.sale;
                    saleDate = sale.sale_date ? String(sale.sale_date).slice(0, 10) : '';
                    setEditingSaleId(saleId);
                    setSaleForm({
                        branchId: sale.branch_id ? String(sale.branch_id) : '',
                        invoiceNumber: String((_c = sale.invoice_number) !== null && _c !== void 0 ? _c : ''),
                        customerName: (_d = sale.customer_name) !== null && _d !== void 0 ? _d : '',
                        customerEmail: (_e = sale.customer_email) !== null && _e !== void 0 ? _e : '',
                        productName: (_f = sale.product_name) !== null && _f !== void 0 ? _f : '',
                        quantity: String((_g = sale.quantity) !== null && _g !== void 0 ? _g : 1),
                        unitPrice: String((_h = sale.unit_price) !== null && _h !== void 0 ? _h : 0),
                        discount: String((_j = sale.discount) !== null && _j !== void 0 ? _j : 0),
                        taxRate: String((_k = sale.tax_rate) !== null && _k !== void 0 ? _k : 0),
                        shippingFee: String((_l = sale.shipping_fee) !== null && _l !== void 0 ? _l : 0),
                        paymentMethod: (_m = sale.payment_method) !== null && _m !== void 0 ? _m : 'cash',
                        paymentStatus: ((_o = sale.payment_status) !== null && _o !== void 0 ? _o : 'pending'),
                        saleStatus: ((_p = sale.sale_status) !== null && _p !== void 0 ? _p : 'pending'),
                        saleDate: saleDate,
                        notes: (_q = sale.notes) !== null && _q !== void 0 ? _q : '',
                        referenceNumber: (_r = sale.reference_number) !== null && _r !== void 0 ? _r : '',
                    });
                    setIsSaleModalOpen(true);
                    return [3 /*break*/, 6];
                case 5:
                    _a = _s.sent();
                    setSaleFormError('Unable to load sale details.');
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var closeSaleModal = function () {
        setIsSaleModalOpen(false);
        setEditingSaleId(null);
        setSaleFormError(null);
    };
    var handleSaleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var token, invoiceNumber, quantity, unitPrice, discount, taxRate, shippingFee, subtotal, taxAmount, totalAmount, payload, endpoint, method, res, data, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    e.preventDefault();
                    token = getAuthToken();
                    if (!token) {
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    invoiceNumber = saleForm.invoiceNumber.trim();
                    if (!invoiceNumber) {
                        setSaleFormError('Invoice number is required.');
                        return [2 /*return*/];
                    }
                    quantity = Number(saleForm.quantity);
                    unitPrice = Number(saleForm.unitPrice);
                    discount = Number(saleForm.discount);
                    taxRate = Number(saleForm.taxRate);
                    shippingFee = Number(saleForm.shippingFee);
                    if (isNaN(quantity) || quantity <= 0) {
                        setSaleFormError('Quantity must be greater than 0.');
                        return [2 /*return*/];
                    }
                    if (isNaN(unitPrice) || unitPrice < 0 || isNaN(discount) || discount < 0 || isNaN(taxRate) || taxRate < 0 || isNaN(shippingFee) || shippingFee < 0) {
                        setSaleFormError('Amounts must be valid positive values.');
                        return [2 /*return*/];
                    }
                    subtotal = quantity * unitPrice - discount;
                    if (subtotal < 0) {
                        setSaleFormError('Discount cannot exceed quantity × unit price.');
                        return [2 /*return*/];
                    }
                    taxAmount = subtotal * taxRate;
                    totalAmount = subtotal + taxAmount + shippingFee;
                    payload = {
                        invoice_number: invoiceNumber,
                        customer_name: saleForm.customerName.trim() || undefined,
                        customer_email: saleForm.customerEmail.trim() || undefined,
                        product_name: saleForm.productName.trim() || undefined,
                        quantity: quantity,
                        unit_price: unitPrice,
                        discount: discount,
                        subtotal: subtotal,
                        tax_rate: taxRate,
                        tax_amount: taxAmount,
                        shipping_fee: shippingFee,
                        total_amount: totalAmount,
                        currency: 'PHP',
                        payment_method: saleForm.paymentMethod.trim() || undefined,
                        payment_status: saleForm.paymentStatus,
                        sale_status: saleForm.saleStatus,
                        sale_date: saleForm.saleDate || undefined,
                        notes: saleForm.notes.trim() || undefined,
                        reference_number: saleForm.referenceNumber.trim() || undefined,
                    };
                    if (isAdminUser && saleForm.branchId) {
                        payload.branch_id = Number(saleForm.branchId);
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 5, , 6]);
                    endpoint = editingSaleId ? "".concat(API_BASE, "/sales/").concat(editingSaleId) : "".concat(API_BASE, "/sales");
                    method = editingSaleId ? 'PUT' : 'POST';
                    return [4 /*yield*/, fetch(endpoint, {
                            method: method,
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: "Bearer ".concat(token),
                            },
                            body: JSON.stringify(payload),
                        })];
                case 2:
                    res = _c.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _c.sent();
                    if (!res.ok) {
                        setSaleFormError((_b = data.detail) !== null && _b !== void 0 ? _b : 'Failed to save sale.');
                        return [2 /*return*/];
                    }
                    closeSaleModal();
                    return [4 /*yield*/, fetchSales()];
                case 4:
                    _c.sent();
                    return [3 /*break*/, 6];
                case 5:
                    _a = _c.sent();
                    setSaleFormError('Unable to reach the server.');
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var fetchOrderBranchOptions = function () { return __awaiter(_this, void 0, void 0, function () {
        var token, res, data, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    token = getAuthToken();
                    if (!token) {
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("".concat(API_BASE, "/branches"), { headers: { Authorization: "Bearer ".concat(token) } })];
                case 2:
                    res = _c.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _c.sent();
                    if (!res.ok) {
                        setOrderFormError((_b = data.detail) !== null && _b !== void 0 ? _b : 'Unable to load branch options.');
                        return [2 /*return*/];
                    }
                    setOrderBranchOptions(Array.isArray(data.branches) ? data.branches.map(mapBranchFromApi) : []);
                    return [3 /*break*/, 5];
                case 4:
                    _a = _c.sent();
                    setOrderFormError('Unable to load branch options.');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var openOrderModal = function () {
        setEditingOrderId(null);
        setOrderFormError(null);
        setOrderForm(emptyOrderForm());
        if (isAdminUser)
            void fetchOrderBranchOptions();
        setIsOrderModalOpen(true);
    };
    var openEditOrderModal = function (orderId) { return __awaiter(_this, void 0, void 0, function () {
        var token, res, data, order, _a;
        var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
        return __generator(this, function (_v) {
            switch (_v.label) {
                case 0:
                    token = getAuthToken();
                    if (!token) {
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    setOrderFormError(null);
                    if (!isAdminUser) return [3 /*break*/, 2];
                    return [4 /*yield*/, fetchOrderBranchOptions()];
                case 1:
                    _v.sent();
                    _v.label = 2;
                case 2:
                    _v.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, fetch("".concat(API_BASE, "/orders/").concat(orderId), {
                            headers: { Authorization: "Bearer ".concat(token) },
                        })];
                case 3:
                    res = _v.sent();
                    return [4 /*yield*/, res.json()];
                case 4:
                    data = _v.sent();
                    if (!res.ok || !data.order) {
                        setOrderFormError((_b = data.detail) !== null && _b !== void 0 ? _b : 'Unable to load order details.');
                        return [2 /*return*/];
                    }
                    order = data.order;
                    setEditingOrderId(orderId);
                    setOrderForm({
                        branchId: order.branch_id ? String(order.branch_id) : '',
                        orderNumber: String((_c = order.order_number) !== null && _c !== void 0 ? _c : ''),
                        customerName: (_d = order.customer_name) !== null && _d !== void 0 ? _d : '',
                        deliveryAddress: (_e = order.delivery_address) !== null && _e !== void 0 ? _e : '',
                        contactNumber: (_f = order.contact_number) !== null && _f !== void 0 ? _f : '',
                        orderType: ((_g = order.order_type) !== null && _g !== void 0 ? _g : 'delivery'),
                        containerType: ((_h = order.container_type) !== null && _h !== void 0 ? _h : ''),
                        containerSize: order.container_size != null ? String(order.container_size) : '',
                        quantity: String((_j = order.quantity) !== null && _j !== void 0 ? _j : 0),
                        borrowedContainers: String((_k = order.borrowed_containers) !== null && _k !== void 0 ? _k : 0),
                        returnedContainers: String((_l = order.returned_containers) !== null && _l !== void 0 ? _l : 0),
                        unitPrice: String((_m = order.unit_price) !== null && _m !== void 0 ? _m : 0),
                        discount: String((_o = order.discount) !== null && _o !== void 0 ? _o : 0),
                        deliveryFee: String((_p = order.delivery_fee) !== null && _p !== void 0 ? _p : 0),
                        amountPaid: String((_q = order.amount_paid) !== null && _q !== void 0 ? _q : 0),
                        paymentMethod: ((_r = order.payment_method) !== null && _r !== void 0 ? _r : ''),
                        deliveryDate: (_s = order.delivery_date) !== null && _s !== void 0 ? _s : '',
                        deliveryTimeSlot: ((_t = order.delivery_time_slot) !== null && _t !== void 0 ? _t : ''),
                        deliveryNotes: (_u = order.delivery_notes) !== null && _u !== void 0 ? _u : '',
                        priorityFlag: Boolean(order.priority_flag),
                    });
                    setIsOrderModalOpen(true);
                    return [3 /*break*/, 6];
                case 5:
                    _a = _v.sent();
                    setOrderFormError('Unable to load order details.');
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var closeOrderModal = function () {
        setIsOrderModalOpen(false);
        setEditingOrderId(null);
        setOrderFormError(null);
    };
    var handleOrderSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var num, qty, unitPrice, discount, deliveryFee, amountPaid, subtotal, total, change, paymentStatus, token, body, isEditing, endpoint, method, res, data, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    e.preventDefault();
                    num = orderForm.orderNumber.trim();
                    if (!num) {
                        setOrderFormError('Order number is required.');
                        return [2 /*return*/];
                    }
                    qty = Number(orderForm.quantity);
                    if (isNaN(qty) || qty < 0) {
                        setOrderFormError('Quantity must be 0 or more.');
                        return [2 /*return*/];
                    }
                    unitPrice = Number(orderForm.unitPrice);
                    discount = Number(orderForm.discount);
                    deliveryFee = Number(orderForm.deliveryFee);
                    amountPaid = Number(orderForm.amountPaid);
                    subtotal = qty * unitPrice;
                    total = Math.max(0, subtotal - discount + deliveryFee);
                    change = Math.max(0, amountPaid - total);
                    paymentStatus = 'unpaid';
                    if (amountPaid >= total && total > 0)
                        paymentStatus = 'paid';
                    else if (amountPaid > 0)
                        paymentStatus = 'partial';
                    token = getAuthToken();
                    if (!token) {
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 5, , 6]);
                    body = {
                        order_number: num,
                        customer_name: orderForm.customerName.trim() || undefined,
                        delivery_address: orderForm.deliveryAddress.trim() || undefined,
                        contact_number: orderForm.contactNumber.trim() || undefined,
                        order_type: orderForm.orderType,
                        container_type: orderForm.containerType || undefined,
                        container_size: orderForm.containerSize ? Number(orderForm.containerSize) : undefined,
                        quantity: qty,
                        borrowed_containers: Number(orderForm.borrowedContainers),
                        returned_containers: Number(orderForm.returnedContainers),
                        unit_price: unitPrice,
                        subtotal: subtotal,
                        discount: discount,
                        delivery_fee: deliveryFee,
                        total_amount: total,
                        amount_paid: amountPaid,
                        change_amount: change,
                        payment_method: orderForm.paymentMethod || undefined,
                        payment_status: paymentStatus,
                        delivery_date: orderForm.deliveryDate || undefined,
                        delivery_time_slot: orderForm.deliveryTimeSlot || undefined,
                        delivery_notes: orderForm.deliveryNotes.trim() || undefined,
                        priority_flag: orderForm.priorityFlag,
                    };
                    if (isAdminUser && orderForm.branchId)
                        body.branch_id = Number(orderForm.branchId);
                    isEditing = editingOrderId !== null;
                    endpoint = isEditing ? "".concat(API_BASE, "/orders/").concat(editingOrderId) : "".concat(API_BASE, "/orders");
                    method = isEditing ? 'PUT' : 'POST';
                    return [4 /*yield*/, fetch(endpoint, {
                            method: method,
                            headers: { 'Content-Type': 'application/json', Authorization: "Bearer ".concat(token) },
                            body: JSON.stringify(body),
                        })];
                case 2:
                    res = _c.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _c.sent();
                    if (!res.ok) {
                        setOrderFormError((_b = data.detail) !== null && _b !== void 0 ? _b : 'Failed to save order.');
                        return [2 /*return*/];
                    }
                    closeOrderModal();
                    return [4 /*yield*/, fetchOrders()];
                case 4:
                    _c.sent();
                    return [3 /*break*/, 6];
                case 5:
                    _a = _c.sent();
                    setOrderFormError('Unable to reach the server.');
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleDeleteOrder = function (orderId) { return __awaiter(_this, void 0, void 0, function () {
        var token, res, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    token = getAuthToken();
                    if (!token) {
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("".concat(API_BASE, "/orders/").concat(orderId), {
                            method: 'DELETE',
                            headers: { Authorization: "Bearer ".concat(token) },
                        })];
                case 2:
                    res = _b.sent();
                    if (!res.ok) {
                        setOrdersError('Failed to delete order.');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, fetchOrders()];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    setOrdersError('Failed to delete order.');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var openAddBranchModal = function () {
        setBranchFormError(null);
        setEditingBranchId(null);
        setBranchForm({ unitId: '', name: '', address: '', contact: '' });
        setIsBranchModalOpen(true);
    };
    var openEditBranchModal = function (branch) {
        setBranchFormError(null);
        setEditingBranchId(branch.id);
        setBranchForm({
            unitId: branch.unitId,
            name: branch.name,
            address: branch.address,
            contact: branch.contact,
        });
        setIsBranchModalOpen(true);
    };
    var closeAddBranchModal = function () {
        setIsBranchModalOpen(false);
        setEditingBranchId(null);
        setBranchFormError(null);
    };
    var fetchCustomerBranchOptions = function () { return __awaiter(_this, void 0, void 0, function () {
        var token, res, data, list, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    token = getAuthToken();
                    if (!token) {
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("".concat(API_BASE, "/branches"), {
                            headers: {
                                Authorization: "Bearer ".concat(token),
                            },
                        })];
                case 2:
                    res = _c.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _c.sent();
                    if (!res.ok) {
                        setCustomerFormError((_b = data.detail) !== null && _b !== void 0 ? _b : 'Unable to load branch options.');
                        return [2 /*return*/];
                    }
                    list = Array.isArray(data.branches) ? data.branches.map(mapBranchFromApi) : [];
                    setCustomerBranchOptions(list);
                    return [3 /*break*/, 5];
                case 4:
                    _a = _c.sent();
                    setCustomerFormError('Unable to load branch options.');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var openAddCustomerModal = function () {
        setCustomerFormError(null);
        setEditingCustomerId(null);
        setCustomerForm({ branchId: '', code: '', name: '', address: '', contact: '', geolocation: '' });
        if (isAdminUser) {
            void fetchCustomerBranchOptions();
        }
        setIsCustomerModalOpen(true);
    };
    var openEditCustomerModal = function (customer) {
        setCustomerFormError(null);
        setEditingCustomerId(customer.id);
        setCustomerForm({
            branchId: customer.branchId ? String(customer.branchId) : '',
            code: customer.code,
            name: customer.name,
            address: customer.address,
            contact: customer.contact,
            geolocation: customer.geolocation,
        });
        if (isAdminUser) {
            void fetchCustomerBranchOptions();
        }
        setIsCustomerModalOpen(true);
    };
    var closeAddCustomerModal = function () {
        setIsCustomerModalOpen(false);
        setEditingCustomerId(null);
        setCustomerFormError(null);
    };
    var handleAddBranchSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var normalizedUnitId, normalizedName, token, res, data, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    e.preventDefault();
                    normalizedUnitId = branchForm.unitId.trim();
                    normalizedName = branchForm.name.trim();
                    if (!/^[0-9]{5}$/.test(normalizedUnitId)) {
                        setBranchFormError('Unit ID must be exactly 5 digits.');
                        return [2 /*return*/];
                    }
                    if (!normalizedName) {
                        setBranchFormError('Branch name is required.');
                        return [2 /*return*/];
                    }
                    if (branches.some(function (branch) { return branch.unitId === normalizedUnitId && branch.id !== editingBranchId; })) {
                        setBranchFormError('Unit ID already exists.');
                        return [2 /*return*/];
                    }
                    token = getAuthToken();
                    if (!token) {
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, fetch(editingBranchId ? "".concat(API_BASE, "/branches/").concat(editingBranchId) : "".concat(API_BASE, "/branches"), {
                            method: editingBranchId ? 'PUT' : 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: "Bearer ".concat(token),
                            },
                            body: JSON.stringify({
                                unit_id: normalizedUnitId,
                                name: normalizedName,
                                address: branchForm.address.trim(),
                                contact: branchForm.contact.trim(),
                                status: 'active',
                            }),
                        })];
                case 2:
                    res = _c.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _c.sent();
                    if (!res.ok) {
                        setBranchFormError((_b = data.detail) !== null && _b !== void 0 ? _b : 'Failed to save branch.');
                        return [2 /*return*/];
                    }
                    closeAddBranchModal();
                    return [4 /*yield*/, fetchBranches()];
                case 4:
                    _c.sent();
                    return [3 /*break*/, 6];
                case 5:
                    _a = _c.sent();
                    setBranchFormError('Unable to reach the server.');
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleAddCustomerSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var normalizedCode, normalizedName, token, res, data, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    e.preventDefault();
                    normalizedCode = customerForm.code.trim();
                    normalizedName = customerForm.name.trim();
                    if (!/^[A-Za-z0-9]{8}$/.test(normalizedCode)) {
                        setCustomerFormError('Code must be exactly 8 alphanumeric characters.');
                        return [2 /*return*/];
                    }
                    if (!normalizedName) {
                        setCustomerFormError('Customer name is required.');
                        return [2 /*return*/];
                    }
                    if (customers.some(function (customer) { return customer.code.toLowerCase() === normalizedCode.toLowerCase() && customer.id !== editingCustomerId; })) {
                        setCustomerFormError('Customer code already exists.');
                        return [2 /*return*/];
                    }
                    token = getAuthToken();
                    if (!token) {
                        onNavigate('auth');
                        return [2 /*return*/];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, fetch(editingCustomerId ? "".concat(API_BASE, "/customers/").concat(editingCustomerId) : "".concat(API_BASE, "/customers"), {
                            method: editingCustomerId ? 'PUT' : 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: "Bearer ".concat(token),
                            },
                            body: JSON.stringify(__assign(__assign({}, (isAdminUser && customerForm.branchId ? { branch_id: Number(customerForm.branchId) } : {})), { code: normalizedCode, name: normalizedName, address: customerForm.address.trim(), contact: customerForm.contact.trim(), geolocation: customerForm.geolocation.trim(), status: 'active' })),
                        })];
                case 2:
                    res = _c.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _c.sent();
                    if (!res.ok) {
                        setCustomerFormError((_b = data.detail) !== null && _b !== void 0 ? _b : 'Failed to save customer.');
                        return [2 /*return*/];
                    }
                    closeAddCustomerModal();
                    return [4 /*yield*/, fetchCustomers()];
                case 4:
                    _c.sent();
                    return [3 /*break*/, 6];
                case 5:
                    _a = _c.sent();
                    setCustomerFormError('Unable to reach the server.');
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="hidden lg:flex h-screen w-64 border-r sticky top-0 left-0 bg-slate-50 border-slate-200 flex-col py-6 font-medium">
        <div className="px-6 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
              <lucide_react_1.Droplet className="w-6 h-6 fill-current"/>
            </div>
            <div>
              <h1 className="text-xl font-black text-primary tracking-tight">AquaFlow Admin</h1>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Water Management System</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-2">
          {[
            { id: 'dashboard', icon: lucide_react_1.LayoutDashboard, label: 'Dashboard' },
            { id: 'deliveries', icon: lucide_react_1.Truck, label: 'Orders' },
            { id: 'sales', icon: lucide_react_1.Receipt, label: 'Sales' },
            { id: 'customers', icon: lucide_react_1.Users, label: 'Customers' },
            { id: 'branches', icon: lucide_react_1.Map, label: 'Branches' },
        ].map(function (item) { return (<button key={item.id} onClick={function () { return setActiveView(item.id); }} className={"w-full text-left rounded-xl px-4 py-3 flex items-center gap-3 transition-all duration-200 ".concat(activeView === item.id
                ? 'bg-primary text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-100 hover:translate-x-1')}>
              <item.icon className="w-5 h-5"/>
              <span className="text-sm">{item.label}</span>
            </button>); })}

          <div className="my-3 border-t border-slate-200"/>

          {[
            { id: 'inventory', icon: lucide_react_1.Package, label: 'Inventory' },
            { id: 'products', icon: lucide_react_1.Package, label: 'Products' },
            { id: 'users', icon: lucide_react_1.Users, label: 'Users' },
            { id: 'quality', icon: lucide_react_1.Droplet, label: 'Maintenance' },
            { id: 'settings', icon: lucide_react_1.Settings, label: 'Settings' },
        ].map(function (item) { return (<button key={item.id} onClick={function () { return setActiveView(item.id); }} className={"w-full text-left rounded-xl px-4 py-3 flex items-center gap-3 transition-all duration-200 ".concat(activeView === item.id
                ? 'bg-primary text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-100 hover:translate-x-1')}>
              <item.icon className="w-5 h-5"/>
              <span className="text-sm">{item.label}</span>
            </button>); })}
        </nav>

        <div className="px-4 mt-auto space-y-6">
          <div className="pt-6 border-t border-slate-200 space-y-1">
            <button className="w-full text-slate-500 hover:bg-slate-100 rounded-xl px-4 py-2 flex items-center gap-3 transition-colors text-sm">
              <lucide_react_1.HelpCircle className="w-4 h-4"/>
              <span>Help Center</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen p-6 md:p-10 lg:p-12 overflow-y-auto">
        {activeView === 'deliveries' ? (<section>
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
              <div>
                <p className="text-secondary font-bold text-xs uppercase tracking-widest mb-2">Order Management</p>
                <h2 className="text-4xl font-bold text-primary">Orders</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <button onClick={toggleSelectAllOrders} className="px-5 py-3 rounded-xl border border-outline-variant text-primary font-bold hover:bg-surface-container transition-all text-sm">
                  {allOrdersSelected ? 'Unselect All' : 'Select All'}
                </button>
                <div className="flex gap-3">
                  <button onClick={handleDeleteOrders} disabled={!selectedOrderIds.length} className="px-5 py-3 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                    Delete
                  </button>
                  <button onClick={openOrderModal} className="px-5 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-container transition-all text-sm">
                    Create Order
                  </button>
                </div>
              </div>
            </header>

            {ordersError && (<div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                {ordersError}
              </div>)}

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  <input type="date" value={orderDateFrom} onChange={function (e) { return setOrderDateFrom(e.target.value); }} className="px-3 py-2 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm" aria-label="Filter from date"/>
                  <input type="date" value={orderDateTo} onChange={function (e) { return setOrderDateTo(e.target.value); }} className="px-3 py-2 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm" aria-label="Filter to date"/>
                  <select value={orderTypeFilter} onChange={function (e) { return setOrderTypeFilter(e.target.value); }} className="px-3 py-2 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm bg-white" aria-label="Filter by order type">
                    <option value="">All order types</option>
                    <option value="delivery">Delivery</option>
                    <option value="pickup">Pickup</option>
                    <option value="walk-in">Walk-in</option>
                  </select>
                  <select value={containerTypeFilter} onChange={function (e) { return setContainerTypeFilter(e.target.value); }} className="px-3 py-2 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm bg-white" aria-label="Filter by container type">
                    <option value="">All container types</option>
                    <option value="round">Round</option>
                    <option value="slim">Slim</option>
                    <option value="distilled">Distilled</option>
                    <option value="alkaline">Alkaline</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500 font-black">
                    <tr>
                      <th className="px-6 py-4 w-16"><span className="sr-only">Select</span></th>
                      <th className="px-6 py-4">Order #</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Delivery Date</th>
                      <th className="px-6 py-4">Order Type</th>
                      <th className="px-6 py-4">Container</th>
                      <th className="px-6 py-4">Qty</th>
                      <th className="px-6 py-4">Total</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {isOrdersLoading ? (<tr>
                        <td colSpan={9} className="px-6 py-8 text-center text-sm text-slate-500">Loading orders...</td>
                      </tr>) : filteredOrders.length === 0 ? (<tr>
                        <td colSpan={9} className="px-6 py-8 text-center text-sm text-slate-500">No orders found.</td>
                      </tr>) : paginatedOrders.map(function (order) { return (<tr key={order.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <input type="checkbox" checked={selectedOrderIds.includes(order.id)} onChange={function () { return toggleOrderSelection(order.id); }} className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30"/>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-600">{order.orderNumber}</td>
                        <td className="px-6 py-4 text-sm font-bold text-primary">{order.customerName}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 capitalize">{order.orderType}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 capitalize">
                          {order.containerType
                    ? "".concat(order.containerType).concat(order.containerSize ? " (".concat(order.containerSize, " gal)") : '')
                    : order.containerSize
                        ? "".concat(order.containerSize, " gal")
                        : '—'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700 font-bold">{order.quantity}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {order.totalAmount.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button type="button" onClick={function () { void openEditOrderModal(order.id); }} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors" aria-label={"Edit ".concat(order.orderNumber)}>
                              <lucide_react_1.Pencil className="w-4 h-4"/>
                            </button>
                            <button type="button" onClick={function () { return handleDeleteOrder(order.id); }} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors" aria-label={"Delete ".concat(order.orderNumber)}>
                              <lucide_react_1.Trash2 className="w-4 h-4"/>
                            </button>
                          </div>
                        </td>
                      </tr>); })}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <span className="text-xs text-slate-500">
                  {filteredOrders.length === 0
                ? 'Showing 0 of 0'
                : "Showing ".concat((orderPage - 1) * ORDERS_PER_PAGE + 1, "-").concat(Math.min(orderPage * ORDERS_PER_PAGE, filteredOrders.length), " of ").concat(filteredOrders.length)}
                </span>
                <button type="button" onClick={function () { return setOrderPage(function (current) { return Math.max(1, current - 1); }); }} disabled={orderPage === 1 || filteredOrders.length === 0} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  Previous
                </button>
                <span className="text-xs font-semibold text-slate-600 min-w-16 text-center">
                  {orderPage} / {totalOrderPages}
                </span>
                <button type="button" onClick={function () { return setOrderPage(function (current) { return Math.min(totalOrderPages, current + 1); }); }} disabled={orderPage === totalOrderPages || filteredOrders.length === 0} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  Next
                </button>
              </div>
            </div>

            {/* Order Modal */}
            {isOrderModalOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                  <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-primary">{editingOrderId ? 'Edit Order' : 'Create Order'}</h3>
                    <button onClick={closeOrderModal} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">✕</button>
                  </div>
                  <form onSubmit={handleOrderSubmit} className="flex-1 overflow-y-auto px-8 py-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {isAdminUser && (<div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Branch</label>
                          <select value={orderForm.branchId} onChange={function (e) { return setOrderForm(function (f) { return (__assign(__assign({}, f), { branchId: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                            <option value="">Select branch…</option>
                            {orderBranchOptions.map(function (b) { return <option key={b.id} value={String(b.id)}>{b.name}</option>; })}
                          </select>
                        </div>)}

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Order Number *</label>
                        <input type="text" required value={orderForm.orderNumber} onChange={function (e) { return setOrderForm(function (f) { return (__assign(__assign({}, f), { orderNumber: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"/>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Customer Name</label>
                        <input type="text" value={orderForm.customerName} onChange={function (e) { return setOrderForm(function (f) { return (__assign(__assign({}, f), { customerName: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"/>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Contact Number</label>
                        <input type="text" value={orderForm.contactNumber} onChange={function (e) { return setOrderForm(function (f) { return (__assign(__assign({}, f), { contactNumber: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"/>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Delivery Address</label>
                        <input type="text" value={orderForm.deliveryAddress} onChange={function (e) { return setOrderForm(function (f) { return (__assign(__assign({}, f), { deliveryAddress: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"/>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Order Type</label>
                        <select value={orderForm.orderType} onChange={function (e) { return setOrderForm(function (f) { return (__assign(__assign({}, f), { orderType: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                          <option value="delivery">Delivery</option>
                          <option value="pickup">Pickup</option>
                          <option value="walk-in">Walk-in</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Container Type</label>
                        <select value={orderForm.containerType} onChange={function (e) { return setOrderForm(function (f) { return (__assign(__assign({}, f), { containerType: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                          <option value="">Select…</option>
                          <option value="round">Round</option>
                          <option value="slim">Slim</option>
                          <option value="distilled">Distilled</option>
                          <option value="alkaline">Alkaline</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Container Size</label>
                        <select value={orderForm.containerSize} onChange={function (e) { return setOrderForm(function (f) { return (__assign(__assign({}, f), { containerSize: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                          <option value="">Select…</option>
                          <option value="5">5 gal</option>
                          <option value="3">3 gal</option>
                          <option value="1">1 gal</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Quantity</label>
                        <input type="number" min={0} value={orderForm.quantity} onChange={function (e) { return setOrderForm(function (f) { return (__assign(__assign({}, f), { quantity: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"/>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Borrowed Containers</label>
                        <input type="number" min={0} value={orderForm.borrowedContainers} onChange={function (e) { return setOrderForm(function (f) { return (__assign(__assign({}, f), { borrowedContainers: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"/>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Returned Containers</label>
                        <input type="number" min={0} value={orderForm.returnedContainers} onChange={function (e) { return setOrderForm(function (f) { return (__assign(__assign({}, f), { returnedContainers: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"/>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Unit Price</label>
                        <input type="number" min={0} step={0.01} value={orderForm.unitPrice} onChange={function (e) { return setOrderForm(function (f) { return (__assign(__assign({}, f), { unitPrice: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"/>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Discount</label>
                        <input type="number" min={0} step={0.01} value={orderForm.discount} onChange={function (e) { return setOrderForm(function (f) { return (__assign(__assign({}, f), { discount: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"/>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Delivery Fee</label>
                        <input type="number" min={0} step={0.01} value={orderForm.deliveryFee} onChange={function (e) { return setOrderForm(function (f) { return (__assign(__assign({}, f), { deliveryFee: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"/>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Amount Paid</label>
                        <input type="number" min={0} step={0.01} value={orderForm.amountPaid} onChange={function (e) { return setOrderForm(function (f) { return (__assign(__assign({}, f), { amountPaid: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"/>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Payment Method</label>
                        <select value={orderForm.paymentMethod} onChange={function (e) { return setOrderForm(function (f) { return (__assign(__assign({}, f), { paymentMethod: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                          <option value="">Select…</option>
                          <option value="cash">Cash</option>
                          <option value="gcash">GCash</option>
                          <option value="maya">Maya</option>
                          <option value="bank-transfer">Bank Transfer</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Delivery Date</label>
                        <input type="date" value={orderForm.deliveryDate} onChange={function (e) { return setOrderForm(function (f) { return (__assign(__assign({}, f), { deliveryDate: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"/>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Delivery Time Slot</label>
                        <select value={orderForm.deliveryTimeSlot} onChange={function (e) { return setOrderForm(function (f) { return (__assign(__assign({}, f), { deliveryTimeSlot: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                          <option value="">Select…</option>
                          <option value="morning">Morning</option>
                          <option value="afternoon">Afternoon</option>
                          <option value="evening">Evening</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Delivery Notes</label>
                        <textarea rows={2} value={orderForm.deliveryNotes} onChange={function (e) { return setOrderForm(function (f) { return (__assign(__assign({}, f), { deliveryNotes: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"/>
                      </div>

                      <div className="sm:col-span-2 flex items-center gap-3">
                        <input type="checkbox" id="orderPriorityFlag" checked={orderForm.priorityFlag} onChange={function (e) { return setOrderForm(function (f) { return (__assign(__assign({}, f), { priorityFlag: e.target.checked })); }); }} className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30"/>
                        <label htmlFor="orderPriorityFlag" className="text-sm font-medium text-slate-700">Priority Order</label>
                      </div>
                    </div>

                    {orderFormError && (<p className="mt-4 text-sm text-red-600 font-medium">{orderFormError}</p>)}

                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-100">
                      <button type="button" onClick={closeOrderModal} className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">
                        Cancel
                      </button>
                      <button type="submit" className="px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-container transition-all">
                        {editingOrderId ? 'Update Order' : 'Create Order'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>)}
          </section>) : activeView === 'sales' ? (<section>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
              <div>
                <p className="text-secondary font-bold text-xs uppercase tracking-widest mb-2">Sales Management</p>
                <h2 className="text-4xl font-bold text-primary">Sales</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button onClick={toggleSelectAllSales} className="px-5 py-3 rounded-xl border border-outline-variant text-primary font-bold hover:bg-surface-container transition-all text-sm">
                  {allSalesSelected ? 'Unselect All' : 'Select All'}
                </button>
                <div className="flex gap-3">
                  <button onClick={handleDeleteSales} disabled={!selectedSaleIds.length} className="px-5 py-3 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                    Delete
                  </button>
                  <button onClick={function () { void openCreateSaleModal(); }} className="px-5 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-container transition-all text-sm">
                    Create Sale
                  </button>
                </div>
              </div>
            </header>

            {salesError && (<div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                {salesError}
              </div>)}

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500 font-black">
                    <tr>
                      <th className="px-6 py-4 w-16"><span className="sr-only">Select</span></th>
                      <th className="px-6 py-4">Invoice #</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Product</th>
                      <th className="px-6 py-4">Qty</th>
                      <th className="px-6 py-4">Total</th>
                      <th className="px-6 py-4">Payment</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Sale Date</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {isSalesLoading ? (<tr>
                        <td colSpan={10} className="px-6 py-8 text-center text-sm text-slate-500">Loading sales...</td>
                      </tr>) : sales.length === 0 ? (<tr>
                        <td colSpan={10} className="px-6 py-8 text-center text-sm text-slate-500">No sales found.</td>
                      </tr>) : paginatedSales.map(function (sale) { return (<tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <input type="checkbox" checked={selectedSaleIds.includes(sale.id)} onChange={function () { return toggleSaleSelection(sale.id); }} className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30"/>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-600">{sale.invoiceNumber}</td>
                        <td className="px-6 py-4 text-sm font-bold text-primary">{sale.customerName}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{sale.productName}</td>
                        <td className="px-6 py-4 text-sm text-slate-700 font-bold">{sale.quantity}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {sale.totalAmount.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 capitalize">{sale.paymentStatus}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 capitalize">{sale.saleStatus}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(sale.saleDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button type="button" onClick={function () { void openEditSaleModal(sale.id); }} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors" aria-label={"Edit ".concat(sale.invoiceNumber)}>
                              <lucide_react_1.Pencil className="w-4 h-4"/>
                            </button>
                            <button type="button" onClick={function () { return handleDeleteSale(sale.id); }} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors" aria-label={"Delete ".concat(sale.invoiceNumber)}>
                              <lucide_react_1.Trash2 className="w-4 h-4"/>
                            </button>
                          </div>
                        </td>
                      </tr>); })}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <span className="text-xs text-slate-500">
                  {sales.length === 0
                ? 'Showing 0 of 0'
                : "Showing ".concat((salePage - 1) * ORDERS_PER_PAGE + 1, "-").concat(Math.min(salePage * ORDERS_PER_PAGE, sales.length), " of ").concat(sales.length)}
                </span>
                <button type="button" onClick={function () { return setSalePage(function (current) { return Math.max(1, current - 1); }); }} disabled={salePage === 1 || sales.length === 0} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  Previous
                </button>
                <span className="text-xs font-semibold text-slate-600 min-w-16 text-center">
                  {salePage} / {totalSalePages}
                </span>
                <button type="button" onClick={function () { return setSalePage(function (current) { return Math.min(totalSalePages, current + 1); }); }} disabled={salePage === totalSalePages || sales.length === 0} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  Next
                </button>
              </div>
            </div>

            {isSaleModalOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                  <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-primary">{editingSaleId ? 'Edit Sale' : 'Create Sale'}</h3>
                    <button onClick={closeSaleModal} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">✕</button>
                  </div>

                  <form onSubmit={handleSaleSubmit} className="flex-1 overflow-y-auto px-8 py-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {isAdminUser && (<div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Branch</label>
                          <select value={saleForm.branchId} onChange={function (e) { return setSaleForm(function (f) { return (__assign(__assign({}, f), { branchId: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                            <option value="">Select branch…</option>
                            {saleBranchOptions.map(function (b) { return <option key={b.id} value={String(b.id)}>{b.name}</option>; })}
                          </select>
                        </div>)}

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Invoice Number *</label>
                        <input type="text" required value={saleForm.invoiceNumber} onChange={function (e) { return setSaleForm(function (f) { return (__assign(__assign({}, f), { invoiceNumber: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"/>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Sale Date</label>
                        <input type="date" value={saleForm.saleDate} onChange={function (e) { return setSaleForm(function (f) { return (__assign(__assign({}, f), { saleDate: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"/>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Customer Name</label>
                        <input type="text" value={saleForm.customerName} onChange={function (e) { return setSaleForm(function (f) { return (__assign(__assign({}, f), { customerName: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"/>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Customer Email</label>
                        <input type="email" value={saleForm.customerEmail} onChange={function (e) { return setSaleForm(function (f) { return (__assign(__assign({}, f), { customerEmail: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"/>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Product Name</label>
                        <input type="text" value={saleForm.productName} onChange={function (e) { return setSaleForm(function (f) { return (__assign(__assign({}, f), { productName: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"/>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Quantity</label>
                        <input type="number" min={1} value={saleForm.quantity} onChange={function (e) { return setSaleForm(function (f) { return (__assign(__assign({}, f), { quantity: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"/>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Unit Price</label>
                        <input type="number" min={0} step={0.01} value={saleForm.unitPrice} onChange={function (e) { return setSaleForm(function (f) { return (__assign(__assign({}, f), { unitPrice: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"/>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Discount</label>
                        <input type="number" min={0} step={0.01} value={saleForm.discount} onChange={function (e) { return setSaleForm(function (f) { return (__assign(__assign({}, f), { discount: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"/>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tax Rate</label>
                        <input type="number" min={0} step={0.0001} value={saleForm.taxRate} onChange={function (e) { return setSaleForm(function (f) { return (__assign(__assign({}, f), { taxRate: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"/>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Shipping Fee</label>
                        <input type="number" min={0} step={0.01} value={saleForm.shippingFee} onChange={function (e) { return setSaleForm(function (f) { return (__assign(__assign({}, f), { shippingFee: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"/>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Payment Method</label>
                        <input type="text" value={saleForm.paymentMethod} onChange={function (e) { return setSaleForm(function (f) { return (__assign(__assign({}, f), { paymentMethod: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"/>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Payment Status</label>
                        <select value={saleForm.paymentStatus} onChange={function (e) { return setSaleForm(function (f) { return (__assign(__assign({}, f), { paymentStatus: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="partial">Partial</option>
                          <option value="refunded">Refunded</option>
                          <option value="failed">Failed</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Sale Status</label>
                        <select value={saleForm.saleStatus} onChange={function (e) { return setSaleForm(function (f) { return (__assign(__assign({}, f), { saleStatus: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                          <option value="pending">Pending</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Reference Number</label>
                        <input type="text" value={saleForm.referenceNumber} onChange={function (e) { return setSaleForm(function (f) { return (__assign(__assign({}, f), { referenceNumber: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"/>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Notes</label>
                        <textarea rows={2} value={saleForm.notes} onChange={function (e) { return setSaleForm(function (f) { return (__assign(__assign({}, f), { notes: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"/>
                      </div>
                    </div>

                    {saleFormError && (<p className="mt-4 text-sm text-red-600 font-medium">{saleFormError}</p>)}

                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-100">
                      <button type="button" onClick={closeSaleModal} className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">
                        Cancel
                      </button>
                      <button type="submit" className="px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-container transition-all">
                        {editingSaleId ? 'Update Sale' : 'Create Sale'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>)}
          </section>) : activeView === 'products' ? (<section>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
              <div>
                <p className="text-secondary font-bold text-xs uppercase tracking-widest mb-2">Product Catalog</p>
                <h2 className="text-4xl font-bold text-primary">Products</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button type="button" onClick={function () { }} className="px-5 py-3 rounded-xl border border-outline-variant text-primary font-bold hover:bg-surface-container transition-all text-sm">
                  Select All
                </button>
                <button type="button" onClick={function () { }} className="px-5 py-3 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-all text-sm">
                  Delete
                </button>
                <button type="button" onClick={openAddProduct} className="px-5 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-container transition-all text-sm">
                  Add Product
                </button>
              </div>
            </header>

            {productsError && (<div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                {productsError}
              </div>)}

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500 font-black">
                    <tr>
                      <th className="px-6 py-4">Code</th>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Branch</th>
                      <th className="px-6 py-4">Description</th>
                      <th className="px-6 py-4">Unit Price</th>
                      <th className="px-6 py-4">Components</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {isProductsLoading ? (<tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">Loading products...</td>
                      </tr>) : products.length === 0 ? (<tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">No products found.</td>
                      </tr>) : paginatedProducts.map(function (product) { return (<tr key={product.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-slate-700">{product.code}</td>
                        <td className="px-6 py-4 text-sm font-bold text-primary">{product.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{product.branchName}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{product.description}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{product.unitPrice.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {typeof product.components === 'string'
                    ? product.components
                    : Array.isArray(product.components)
                        ? product.components.length === 0
                            ? '—'
                            : product.components
                                .map(function (component) {
                                return component && typeof component === 'object'
                                    ? component.name
                                    : String(component);
                            })
                                .join(', ')
                        : JSON.stringify(product.components)}
                        </td>
                      </tr>); })}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <span className="text-xs text-slate-500">
                  {products.length === 0
                ? 'Showing 0 of 0'
                : "Showing ".concat((productPage - 1) * ORDERS_PER_PAGE + 1, "-").concat(Math.min(productPage * ORDERS_PER_PAGE, products.length), " of ").concat(products.length)}
                </span>
                <button type="button" onClick={function () { return setProductPage(function (current) { return Math.max(1, current - 1); }); }} disabled={productPage === 1 || products.length === 0} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  Previous
                </button>
                <span className="text-xs font-semibold text-slate-600 min-w-16 text-center">
                  {productPage} / {totalProductPages}
                </span>
                <button type="button" onClick={function () { return setProductPage(function (current) { return Math.min(totalProductPages, current + 1); }); }} disabled={productPage === totalProductPages || products.length === 0} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  Next
                </button>
              </div>
            </div>

            {isProductModalOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <button type="button" aria-label="Close modal" onClick={closeProductModal} className="absolute inset-0 bg-slate-900/45"/>
                <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white border border-slate-100 shadow-2xl">
                  <div className="px-6 py-5 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-primary">Add Product</h3>
                    <p className="text-sm text-slate-500 mt-1">Fill in the product details below.</p>
                  </div>

                  <form onSubmit={handleProductSubmit} className="px-6 py-5 space-y-4">
                    {productFormError && (<div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                        {productFormError}
                      </div>)}

                    {isAdminUser && (<div className="space-y-1">
                        <label htmlFor="prod-branch-id" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Branch</label>
                        <select id="prod-branch-id" value={productForm.branchId} onChange={function (e) { return setProductForm(function (current) { return (__assign(__assign({}, current), { branchId: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none bg-white">
                          <option value="">Auto-assign first branch</option>
                          {productBranchOptions.map(function (branch) { return (<option key={branch.id} value={String(branch.id)}>{branch.name || branch.unitId}</option>); })}
                        </select>
                      </div>)}

                    <div className="space-y-1">
                      <label htmlFor="prod-code" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Code</label>
                      <input id="prod-code" value={productForm.code} onChange={function (e) { return setProductForm(function (current) { return (__assign(__assign({}, current), { code: e.target.value })); }); }} placeholder="PRD-001" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none" required/>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="prod-name" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Name</label>
                      <input id="prod-name" value={productForm.name} onChange={function (e) { return setProductForm(function (current) { return (__assign(__assign({}, current), { name: e.target.value })); }); }} placeholder="Mineral Water" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none" required/>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="prod-description" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Description</label>
                      <input id="prod-description" value={productForm.description} onChange={function (e) { return setProductForm(function (current) { return (__assign(__assign({}, current), { description: e.target.value })); }); }} placeholder="Filtered water, 350ml glass bottle" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"/>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label htmlFor="prod-unit-price" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Unit Price</label>
                        <input id="prod-unit-price" type="number" min={0} step="0.01" value={productForm.unitPrice} onChange={function (e) { return setProductForm(function (current) { return (__assign(__assign({}, current), { unitPrice: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none" required/>
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Components</label>
                        <div className="grid gap-3">
                          <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                            <label className="sr-only" htmlFor="prod-component-select">Inventory component</label>
                            <select id="prod-component-select" value={productComponentToAdd} onChange={function (e) { return setProductComponentToAdd(e.target.value); }} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10">
                              <option value="">Select component from inventory</option>
                              {inventories
                    .filter(function (item) { return !productComponents.some(function (component) { return component.id === item.id; }); })
                    .map(function (item) { return (<option key={item.id} value={String(item.id)}>
                                    {item.code} - {item.name}
                                  </option>); })}
                            </select>
                            <button type="button" onClick={function () {
                    var selected = inventories.find(function (item) { return String(item.id) === productComponentToAdd; });
                    if (!selected)
                        return;
                    setProductComponents(function (current) { return __spreadArray(__spreadArray([], current, true), [
                        {
                            id: selected.id,
                            code: selected.code,
                            name: selected.name,
                            description: selected.description,
                            unit_cost: selected.unitCost,
                        },
                    ], false); });
                    setProductComponentToAdd('');
                }} disabled={!productComponentToAdd} className="px-5 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-container transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                              Add component
                            </button>
                          </div>
                          {productComponents.length > 0 ? (<div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                              {productComponents.map(function (component) { return (<div key={component.id} className="flex items-start justify-between gap-3 rounded-xl bg-white p-3 border border-slate-100">
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900">{component.code} - {component.name}</p>
                                    <p className="text-xs text-slate-500">{component.description || 'No description'}</p>
                                    <p className="text-xs text-slate-500">Unit cost: ₱{component.unit_cost.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                  </div>
                                  <button type="button" onClick={function () { return setProductComponents(function (current) { return current.filter(function (item) { return item.id !== component.id; }); }); }} className="px-3 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50">
                                    Remove
                                  </button>
                                </div>); })}
                            </div>) : (<p className="text-xs text-slate-500">Use the selector above to add inventory components for this product.</p>)}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                      <button type="button" onClick={closeProductModal} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50">
                        Cancel
                      </button>
                      <button type="submit" className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-container">
                        Save Product
                      </button>
                    </div>
                  </form>
                </div>
              </div>)}
          </section>) : activeView === 'inventory' ? (<section>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
              <div>
                <p className="text-secondary font-bold text-xs uppercase tracking-widest mb-2">Stock Management</p>
                <h2 className="text-4xl font-bold text-primary">Inventory</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button onClick={toggleSelectAllInventories} className="px-5 py-3 rounded-xl border border-outline-variant text-primary font-bold hover:bg-surface-container transition-all text-sm">
                  {allInventoriesSelected ? 'Unselect All' : 'Select All'}
                </button>
                <div className="flex gap-3">
                  <button onClick={handleDeleteInventories} disabled={!selectedInventoryIds.length} className="px-5 py-3 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                    Delete
                  </button>
                  <button onClick={openAddInventoryModal} className="px-5 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-container transition-all text-sm">
                    Add Inventory
                  </button>
                </div>
              </div>
            </header>

            {inventoriesError && (<div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                {inventoriesError}
              </div>)}

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500 font-black">
                    <tr>
                      <th className="px-6 py-4 w-16"><span className="sr-only">Select</span></th>
                      <th className="px-6 py-4">Code</th>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Branch</th>
                      <th className="px-6 py-4">Description</th>
                      <th className="px-6 py-4">Supplier</th>
                      <th className="px-6 py-4">Qty</th>
                      <th className="px-6 py-4">Capacity</th>
                      <th className="px-6 py-4">Unit Cost</th>
                      <th className="px-6 py-4">Selling Price</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {isInventoriesLoading ? (<tr>
                        <td colSpan={11} className="px-6 py-8 text-center text-sm text-slate-500">Loading inventories...</td>
                      </tr>) : inventories.length === 0 ? (<tr>
                        <td colSpan={11} className="px-6 py-8 text-center text-sm text-slate-500">No inventory items found.</td>
                      </tr>) : paginatedInventories.map(function (inv) { return (<tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <input type="checkbox" checked={selectedInventoryIds.includes(inv.id)} onChange={function () { return toggleInventorySelection(inv.id); }} className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30"/>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-600">{inv.code}</td>
                        <td className="px-6 py-4 text-sm font-bold text-primary">{inv.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{inv.branchName}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{inv.description}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{inv.supplier}</td>
                        <td className="px-6 py-4 text-sm text-slate-700 font-bold">{inv.quantity}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{inv.capacity}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{inv.unitCost.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{inv.sellingPrice.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button type="button" onClick={function () { return toggleInventoryStatus(inv.id); }} className={"px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-colors ".concat(inv.status === 'active'
                    ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
                              {inv.status}
                            </button>
                            <button type="button" onClick={function () { return openEditInventoryModal(inv); }} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors" aria-label={"Edit ".concat(inv.name)}>
                              <lucide_react_1.Pencil className="w-4 h-4"/>
                            </button>
                            <button type="button" onClick={function () { return handleDeleteInventory(inv.id); }} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors" aria-label={"Delete ".concat(inv.name)}>
                              <lucide_react_1.Trash2 className="w-4 h-4"/>
                            </button>
                          </div>
                        </td>
                      </tr>); })}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <span className="text-xs text-slate-500">
                  {inventories.length === 0
                ? 'Showing 0 of 0'
                : "Showing ".concat((inventoryPage - 1) * ORDERS_PER_PAGE + 1, "-").concat(Math.min(inventoryPage * ORDERS_PER_PAGE, inventories.length), " of ").concat(inventories.length)}
                </span>
                <button type="button" onClick={function () { return setInventoryPage(function (current) { return Math.max(1, current - 1); }); }} disabled={inventoryPage === 1 || inventories.length === 0} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  Previous
                </button>
                <span className="text-xs font-semibold text-slate-600 min-w-16 text-center">
                  {inventoryPage} / {totalInventoryPages}
                </span>
                <button type="button" onClick={function () { return setInventoryPage(function (current) { return Math.min(totalInventoryPages, current + 1); }); }} disabled={inventoryPage === totalInventoryPages || inventories.length === 0} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  Next
                </button>
              </div>
            </div>

            {isInventoryModalOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <button type="button" aria-label="Close modal" onClick={closeInventoryModal} className="absolute inset-0 bg-slate-900/45"/>
                <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white border border-slate-100 shadow-2xl">
                  <div className="px-6 py-5 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-primary">{editingInventoryId ? 'Edit Inventory' : 'Add Inventory'}</h3>
                    <p className="text-sm text-slate-500 mt-1">Fill in the inventory details below.</p>
                  </div>

                  <form onSubmit={handleInventorySubmit} className="px-6 py-5 space-y-4">
                    {inventoryFormError && (<div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                        {inventoryFormError}
                      </div>)}

                    {isAdminUser && (<div className="space-y-1">
                        <label htmlFor="inv-branch-id" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Branch</label>
                        <select id="inv-branch-id" value={inventoryForm.branchId} onChange={function (e) { return setInventoryForm(function (c) { return (__assign(__assign({}, c), { branchId: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none bg-white">
                          <option value="">Auto-assign first branch</option>
                          {inventoryBranchOptions.map(function (b) { return (<option key={b.id} value={String(b.id)}>{b.name || b.unitId}</option>); })}
                        </select>
                      </div>)}

                    <div className="space-y-1">
                      <label htmlFor="inv-code" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Code</label>
                      <input id="inv-code" value={inventoryForm.code} onChange={function (e) { return setInventoryForm(function (c) { return (__assign(__assign({}, c), { code: e.target.value })); }); }} placeholder="ITEM-001" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none" required/>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="inv-name" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Name</label>
                      <input id="inv-name" value={inventoryForm.name} onChange={function (e) { return setInventoryForm(function (c) { return (__assign(__assign({}, c), { name: e.target.value })); }); }} placeholder="Water Container 20L" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none" required/>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="inv-description" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Description</label>
                      <input id="inv-description" value={inventoryForm.description} onChange={function (e) { return setInventoryForm(function (c) { return (__assign(__assign({}, c), { description: e.target.value })); }); }} placeholder="Heavy-duty reusable container" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"/>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="inv-supplier" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Supplier</label>
                      <input id="inv-supplier" value={inventoryForm.supplier} onChange={function (e) { return setInventoryForm(function (c) { return (__assign(__assign({}, c), { supplier: e.target.value })); }); }} placeholder="Supplier Co." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"/>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label htmlFor="inv-quantity" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Quantity</label>
                        <input id="inv-quantity" type="number" min={0} value={inventoryForm.quantity} onChange={function (e) { return setInventoryForm(function (c) { return (__assign(__assign({}, c), { quantity: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none" required/>
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="inv-capacity" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Capacity</label>
                        <input id="inv-capacity" type="number" min={0} value={inventoryForm.capacity} onChange={function (e) { return setInventoryForm(function (c) { return (__assign(__assign({}, c), { capacity: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none" required/>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label htmlFor="inv-unit-cost" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Unit Cost</label>
                        <input id="inv-unit-cost" type="number" min={0} step="0.01" value={inventoryForm.unitCost} onChange={function (e) { return setInventoryForm(function (c) { return (__assign(__assign({}, c), { unitCost: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none" required/>
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="inv-selling-price" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Selling Price</label>
                        <input id="inv-selling-price" type="number" min={0} step="0.01" value={inventoryForm.sellingPrice} onChange={function (e) { return setInventoryForm(function (c) { return (__assign(__assign({}, c), { sellingPrice: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none" required/>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                      <button type="button" onClick={closeInventoryModal} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50">
                        Cancel
                      </button>
                      <button type="submit" className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-container">
                        {editingInventoryId ? 'Update Inventory' : 'Save Inventory'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>)}
          </section>) : activeView === 'quality' ? (<section>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
              <div>
                <p className="text-secondary font-bold text-xs uppercase tracking-widest mb-2">Maintenance Management</p>
                <h2 className="text-4xl font-bold text-primary">Maintenance</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button onClick={toggleSelectAllMaintenance} className="px-5 py-3 rounded-xl border border-outline-variant text-primary font-bold hover:bg-surface-container transition-all text-sm">
                  {allMaintenanceSelected ? 'Unselect All' : 'Select All'}
                </button>
                <div className="flex gap-3">
                  <button onClick={handleDeleteMaintenances} disabled={!selectedMaintenanceIds.length} className="px-5 py-3 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                    Delete
                  </button>
                </div>
                <button type="button" onClick={openAddMaintenanceModal} className="px-5 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-container transition-all text-sm flex items-center justify-center gap-2">
                  <lucide_react_1.Plus className="w-4 h-4"/>
                  Add Item
                </button>
              </div>
            </header>

            {maintenanceError && (<div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                {maintenanceError}
              </div>)}

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500 font-black">
                    <tr>
                      <th className="px-6 py-4 w-16"><span className="sr-only">Select</span></th>
                      <th className="px-6 py-4">Code</th>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Branch</th>
                      <th className="px-6 py-4">Supplier</th>
                      <th className="px-6 py-4">Contact</th>
                      <th className="px-6 py-4">Expiration Days</th>
                      <th className="px-6 py-4">Replaced</th>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {isMaintenanceLoading ? (<tr>
                        <td colSpan={10} className="px-6 py-8 text-center text-sm text-slate-500">Loading maintenance items...</td>
                      </tr>) : maintenance.length === 0 ? (<tr>
                        <td colSpan={10} className="px-6 py-8 text-center text-sm text-slate-500">No maintenance records found.</td>
                      </tr>) : paginatedMaintenance.map(function (item) { return (<tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <input type="checkbox" checked={selectedMaintenanceIds.includes(item.id)} onChange={function () { return toggleMaintenanceSelection(item.id); }} className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30"/>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-600">{item.code}</td>
                        <td className="px-6 py-4 text-sm font-bold text-primary">{item.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{item.branchName}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{item.supplier}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{item.contact}</td>
                        <td className="px-6 py-4 text-sm text-slate-700 font-bold">{item.expirationDays}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{item.dateReplaced ? new Date(item.dateReplaced).toLocaleDateString() : '—'}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{item.userName || '—'}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button type="button" onClick={function () { return openEditMaintenanceModal(item); }} className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors" aria-label={"Edit ".concat(item.name)}>
                              <lucide_react_1.Pencil className="w-4 h-4"/>
                            </button>
                            <button type="button" onClick={function () { return handleDeleteMaintenance(item.id); }} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors" aria-label={"Delete ".concat(item.name)}>
                              <lucide_react_1.Trash2 className="w-4 h-4"/>
                            </button>
                          </div>
                        </td>
                      </tr>); })}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <span className="text-xs text-slate-500">
                  {maintenance.length === 0
                ? 'Showing 0 of 0'
                : "Showing ".concat((maintenancePage - 1) * ORDERS_PER_PAGE + 1, "-").concat(Math.min(maintenancePage * ORDERS_PER_PAGE, maintenance.length), " of ").concat(maintenance.length)}
                </span>
                <button type="button" onClick={function () { return setMaintenancePage(function (current) { return Math.max(1, current - 1); }); }} disabled={maintenancePage === 1 || maintenance.length === 0} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  Previous
                </button>
                <span className="text-xs font-semibold text-slate-600 min-w-16 text-center">
                  {maintenancePage} / {totalMaintenancePages}
                </span>
                <button type="button" onClick={function () { return setMaintenancePage(function (current) { return Math.min(totalMaintenancePages, current + 1); }); }} disabled={maintenancePage === totalMaintenancePages || maintenance.length === 0} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  Next
                </button>
              </div>
            </div>

            {isMaintenanceModalOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <button type="button" aria-label="Close modal" onClick={closeMaintenanceModal} className="absolute inset-0 bg-slate-900/45"/>
                <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white border border-slate-100 shadow-2xl">
                  <div className="px-6 py-5 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-primary">{editingMaintenanceId ? 'Edit Maintenance Item' : 'Add Maintenance Item'}</h3>
                    <p className="text-sm text-slate-500 mt-1">Fill in the maintenance item details below.</p>
                  </div>

                  <form onSubmit={handleMaintenanceSubmit} className="px-6 py-5 space-y-4">
                    {maintenanceFormError && (<div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                        {maintenanceFormError}
                      </div>)}

                    {isAdminUser && (<div className="space-y-1">
                        <label htmlFor="maint-branch-id" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Branch</label>
                        <select id="maint-branch-id" value={maintenanceForm.branchId} onChange={function (e) { return setMaintenanceForm(function (c) { return (__assign(__assign({}, c), { branchId: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none bg-white">
                          <option value="">Auto-assign first branch</option>
                          {maintenanceBranchOptions.map(function (b) { return (<option key={b.id} value={String(b.id)}>{b.name || b.unitId}</option>); })}
                        </select>
                      </div>)}

                    <div className="space-y-1">
                      <label htmlFor="maint-code" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Code</label>
                      <input id="maint-code" value={maintenanceForm.code} onChange={function (e) { return setMaintenanceForm(function (c) { return (__assign(__assign({}, c), { code: e.target.value })); }); }} placeholder="MAINT-001" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none" required/>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="maint-name" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Name</label>
                      <input id="maint-name" value={maintenanceForm.name} onChange={function (e) { return setMaintenanceForm(function (c) { return (__assign(__assign({}, c), { name: e.target.value })); }); }} placeholder="Filter Replacement" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none" required/>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label htmlFor="maint-supplier" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Supplier</label>
                        <input id="maint-supplier" value={maintenanceForm.supplier} onChange={function (e) { return setMaintenanceForm(function (c) { return (__assign(__assign({}, c), { supplier: e.target.value })); }); }} placeholder="Supplier name" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"/>
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="maint-contact" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Contact</label>
                        <input id="maint-contact" value={maintenanceForm.contact} onChange={function (e) { return setMaintenanceForm(function (c) { return (__assign(__assign({}, c), { contact: e.target.value })); }); }} placeholder="Contact info" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"/>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label htmlFor="maint-expiration-days" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Expiration Days</label>
                        <input id="maint-expiration-days" type="number" min={0} value={maintenanceForm.expirationDays} onChange={function (e) { return setMaintenanceForm(function (c) { return (__assign(__assign({}, c), { expirationDays: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"/>
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="maint-date-replaced" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Date Replaced</label>
                        <input id="maint-date-replaced" type="date" value={maintenanceForm.dateReplaced} onChange={function (e) { return setMaintenanceForm(function (c) { return (__assign(__assign({}, c), { dateReplaced: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"/>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                      <button type="button" onClick={closeMaintenanceModal} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50">
                        Cancel
                      </button>
                      <button type="submit" className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-container">
                        {editingMaintenanceId ? 'Update Item' : 'Add Item'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>)}
          </section>) : activeView === 'customers' ? (<section>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
              <div>
                <p className="text-secondary font-bold text-xs uppercase tracking-widest mb-2">Customer Directory</p>
                <h2 className="text-4xl font-bold text-primary">Customers</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button onClick={toggleSelectAllCustomers} className="px-5 py-3 rounded-xl border border-outline-variant text-primary font-bold hover:bg-surface-container transition-all text-sm">
                  {allCustomersSelected ? 'Unselect All' : 'Select All'}
                </button>
                <div className="flex gap-3">
                  <button onClick={handleDeleteCustomers} disabled={!selectedCustomerIds.length} className="px-5 py-3 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                    Delete
                  </button>
                  <button onClick={openAddCustomerModal} className="px-5 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-container transition-all text-sm">
                    Add Customer
                  </button>
                </div>
              </div>
            </header>

            {customersError && (<div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                {customersError}
              </div>)}

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500 font-black">
                    <tr>
                      <th className="px-6 py-4 w-16">
                        <span className="sr-only">Select</span>
                      </th>
                      <th className="px-6 py-4">Code</th>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Address</th>
                      <th className="px-6 py-4">Contact</th>
                      <th className="px-6 py-4">Geolocation</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {isCustomersLoading ? (<tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-500">Loading customers...</td>
                      </tr>) : customers.length === 0 ? (<tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-500">No customers found.</td>
                      </tr>) : paginatedCustomers.map(function (customer) { return (<tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <input type="checkbox" checked={selectedCustomerIds.includes(customer.id)} onChange={function () { return toggleCustomerSelection(customer.id); }} className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30"/>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-600">{customer.code}</td>
                        <td className="px-6 py-4 text-sm font-bold text-primary">{customer.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{customer.address}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{customer.contact}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{customer.geolocation}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button type="button" onClick={function () { return toggleCustomerStatus(customer.id); }} className={"px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-colors ".concat(customer.status === 'active'
                    ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
                              {customer.status}
                            </button>
                            <button type="button" onClick={function () { return openEditCustomerModal(customer); }} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors" aria-label={"Edit ".concat(customer.name)}>
                              <lucide_react_1.Pencil className="w-4 h-4"/>
                            </button>
                            <button type="button" onClick={function () { return handleDeleteCustomer(customer.id); }} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors" aria-label={"Delete ".concat(customer.name)}>
                              <lucide_react_1.Trash2 className="w-4 h-4"/>
                            </button>
                          </div>
                        </td>
                      </tr>); })}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <span className="text-xs text-slate-500">
                  {customers.length === 0
                ? 'Showing 0 of 0'
                : "Showing ".concat((customerPage - 1) * ORDERS_PER_PAGE + 1, "-").concat(Math.min(customerPage * ORDERS_PER_PAGE, customers.length), " of ").concat(customers.length)}
                </span>
                <button type="button" onClick={function () { return setCustomerPage(function (current) { return Math.max(1, current - 1); }); }} disabled={customerPage === 1 || customers.length === 0} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  Previous
                </button>
                <span className="text-xs font-semibold text-slate-600 min-w-16 text-center">
                  {customerPage} / {totalCustomerPages}
                </span>
                <button type="button" onClick={function () { return setCustomerPage(function (current) { return Math.min(totalCustomerPages, current + 1); }); }} disabled={customerPage === totalCustomerPages || customers.length === 0} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  Next
                </button>
              </div>
            </div>

            {isCustomerModalOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <button type="button" aria-label="Close modal" onClick={closeAddCustomerModal} className="absolute inset-0 bg-slate-900/45"/>
                <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white border border-slate-100 shadow-2xl">
                  <div className="px-6 py-5 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-primary">{editingCustomerId ? 'Edit Customer' : 'Add Customer'}</h3>
                    <p className="text-sm text-slate-500 mt-1">Fill in the customer details below.</p>
                  </div>

                  <form onSubmit={handleAddCustomerSubmit} className="px-6 py-5 space-y-4">
                    {customerFormError && (<div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                        {customerFormError}
                      </div>)}

                    {isAdminUser && (<div className="space-y-1">
                        <label htmlFor="customer-branch-id" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Branch</label>
                        <select id="customer-branch-id" value={customerForm.branchId} onChange={function (e) { return setCustomerForm(function (current) { return (__assign(__assign({}, current), { branchId: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none bg-white">
                          <option value="">Auto-assign first branch</option>
                          {customerBranchOptions.map(function (branch) { return (<option key={branch.id} value={String(branch.id)}>
                              {branch.name || branch.unitId}
                            </option>); })}
                        </select>
                      </div>)}

                    <div className="space-y-1">
                      <label htmlFor="customer-code" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Code</label>
                      <input id="customer-code" value={customerForm.code} onChange={function (e) { return setCustomerForm(function (current) { return (__assign(__assign({}, current), { code: e.target.value })); }); }} placeholder="AB12CD34" maxLength={8} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none" required/>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="customer-name" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Name</label>
                      <input id="customer-name" value={customerForm.name} onChange={function (e) { return setCustomerForm(function (current) { return (__assign(__assign({}, current), { name: e.target.value })); }); }} placeholder="Acme Industries" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none" required/>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="customer-address" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Address</label>
                      <input id="customer-address" value={customerForm.address} onChange={function (e) { return setCustomerForm(function (current) { return (__assign(__assign({}, current), { address: e.target.value })); }); }} placeholder="123 Main Street" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"/>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="customer-contact" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Contact</label>
                      <input id="customer-contact" value={customerForm.contact} onChange={function (e) { return setCustomerForm(function (current) { return (__assign(__assign({}, current), { contact: e.target.value })); }); }} placeholder="+63 900 000 0000" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"/>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="customer-geolocation" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Geolocation</label>
                      <input id="customer-geolocation" value={customerForm.geolocation} onChange={function (e) { return setCustomerForm(function (current) { return (__assign(__assign({}, current), { geolocation: e.target.value })); }); }} placeholder="14.5995, 120.9842" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"/>
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                      <button type="button" onClick={closeAddCustomerModal} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50">
                        Cancel
                      </button>
                      <button type="submit" className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-container">
                        {editingCustomerId ? 'Update Customer' : 'Save Customer'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>)}
          </section>) : activeView === 'users' ? (<section>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
              <div>
                <p className="text-secondary font-bold text-xs uppercase tracking-widest mb-2">User Management</p>
                <h2 className="text-4xl font-bold text-primary">Users</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button onClick={toggleSelectAllUsers} className="px-5 py-3 rounded-xl border border-outline-variant text-primary font-bold hover:bg-surface-container transition-all text-sm">
                  {allUsersSelected ? 'Unselect All' : 'Select All'}
                </button>
                <div className="flex gap-3">
                  {isAdminUser && (<button onClick={handleDeleteUsers} disabled={!selectedUserIds.length} className="px-5 py-3 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                      Delete
                    </button>)}
                  {isAdminUser && (<button onClick={openAddUserModal} className="px-5 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-container transition-all text-sm">
                      Add User
                    </button>)}
                </div>
              </div>
            </header>

            {usersError && (<div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                {usersError}
              </div>)}

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500 font-black">
                    <tr>
                      <th className="px-6 py-4 w-16"><span className="sr-only">Select</span></th>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Branch</th>
                      <th className="px-6 py-4">Created</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {isUsersLoading ? (<tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-sm text-slate-500">Loading users...</td>
                      </tr>) : users.length === 0 ? (<tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-sm text-slate-500">No users found.</td>
                      </tr>) : paginatedUsers.map(function (user) { return (<tr key={user.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <input type="checkbox" checked={selectedUserIds.includes(user.id)} onChange={function () { return toggleUserSelection(user.id); }} className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30"/>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-primary">{user.fullName || '—'}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className={"px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide ".concat(user.role === 'admin' ? 'bg-primary/10 text-primary' :
                    user.role === 'assistant' ? 'bg-secondary/10 text-secondary' :
                        'bg-slate-100 text-slate-600')}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={"px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide ".concat(user.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500')}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {user.branchName || '—'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {isAdminUser && (<button type="button" onClick={function () { return openEditUserModal(user); }} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors" aria-label={"Edit ".concat(user.email)}>
                                <lucide_react_1.Pencil className="w-4 h-4"/>
                              </button>)}
                            {isAdminUser && (<button type="button" onClick={function () { void handleDeleteUser(user.id); }} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors" aria-label={"Delete ".concat(user.email)}>
                                <lucide_react_1.Trash2 className="w-4 h-4"/>
                              </button>)}
                          </div>
                        </td>
                      </tr>); })}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <span className="text-xs text-slate-500">
                  {users.length === 0
                ? 'Showing 0 of 0'
                : "Showing ".concat((userPage - 1) * ORDERS_PER_PAGE + 1, "-").concat(Math.min(userPage * ORDERS_PER_PAGE, users.length), " of ").concat(users.length)}
                </span>
                <button type="button" onClick={function () { return setUserPage(function (current) { return Math.max(1, current - 1); }); }} disabled={userPage === 1 || users.length === 0} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  Previous
                </button>
                <span className="text-xs font-semibold text-slate-600 min-w-16 text-center">
                  {userPage} / {totalUserPages}
                </span>
                <button type="button" onClick={function () { return setUserPage(function (current) { return Math.min(totalUserPages, current + 1); }); }} disabled={userPage === totalUserPages || users.length === 0} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  Next
                </button>
              </div>
            </div>

            {isUserModalOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <button type="button" aria-label="Close modal" onClick={closeUserModal} className="absolute inset-0 bg-slate-900/45"/>
                <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white border border-slate-100 shadow-2xl">
                  <div className="px-6 py-5 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-primary">{editingUserId ? 'Edit User' : 'Add User'}</h3>
                    <p className="text-sm text-slate-500 mt-1">Fill in the user details below.</p>
                  </div>

                  <form onSubmit={handleUserSubmit} className="px-6 py-5 space-y-4">
                    {userFormError && (<div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                        {userFormError}
                      </div>)}

                    {!editingUserId && (<div className="space-y-1">
                        <label htmlFor="user-email" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email *</label>
                        <input id="user-email" type="email" value={userForm.email} onChange={function (e) { return setUserForm(function (c) { return (__assign(__assign({}, c), { email: e.target.value })); }); }} placeholder="user@example.com" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none" required/>
                      </div>)}

                    {editingUserId && (<div className="px-4 py-3 bg-slate-50 rounded-xl text-sm text-slate-600">
                        Email: <span className="font-bold">{userForm.email}</span>
                      </div>)}

                    {!editingUserId && (<div className="space-y-1">
                        <label htmlFor="user-password" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Password *</label>
                        <input id="user-password" type="password" value={userForm.password} onChange={function (e) { return setUserForm(function (c) { return (__assign(__assign({}, c), { password: e.target.value })); }); }} placeholder="Min 8 characters" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none" required/>
                      </div>)}

                    <div className="space-y-1">
                      <label htmlFor="user-full-name" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Full Name</label>
                      <input id="user-full-name" value={userForm.fullName} onChange={function (e) { return setUserForm(function (c) { return (__assign(__assign({}, c), { fullName: e.target.value })); }); }} placeholder="Juan dela Cruz" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"/>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="user-role" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Role</label>
                      <select id="user-role" value={userForm.role} onChange={function (e) { return setUserForm(function (c) { return (__assign(__assign({}, c), { role: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none bg-white">
                        <option value="staff">Staff</option>
                        <option value="assistant">Assistant</option>
                        <option value="delivery">Delivery</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    {isAdminUser && (<div className="space-y-1">
                        <label htmlFor="user-branch" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Branch (optional)</label>
                        <select id="user-branch" value={userForm.branchId} onChange={function (e) { return setUserForm(function (c) { return (__assign(__assign({}, c), { branchId: e.target.value })); }); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none bg-white">
                          <option value="">— None (Admin) —</option>
                          {userBranchOptions.map(function (branch) { return (<option key={branch.id} value={String(branch.id)}>
                              {branch.name}
                            </option>); })}
                        </select>
                      </div>)}

                    <div className="pt-2 flex justify-end gap-3">
                      <button type="button" onClick={closeUserModal} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50">
                        Cancel
                      </button>
                      <button type="submit" className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-container">
                        {editingUserId ? 'Update User' : 'Add User'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>)}
          </section>) : activeView === 'branches' ? (<section>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
              <div>
                <p className="text-secondary font-bold text-xs uppercase tracking-widest mb-2">Branch Directory</p>
                <h2 className="text-4xl font-bold text-primary">Branches</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button onClick={toggleSelectAllBranches} className="px-5 py-3 rounded-xl border border-outline-variant text-primary font-bold hover:bg-surface-container transition-all text-sm">
                  {allBranchesSelected ? 'Unselect All' : 'Select All'}
                </button>
                <div className="flex gap-3">
                  <button onClick={handleDeleteBranches} disabled={!selectedBranchIds.length} className="px-5 py-3 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                    Delete
                  </button>
                  <button onClick={openAddBranchModal} className="px-5 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-container transition-all text-sm">
                    Add Branch
                  </button>
                </div>
              </div>
            </header>

            {branchesError && (<div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                {branchesError}
              </div>)}

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500 font-black">
                    <tr>
                      <th className="px-6 py-4 w-16">
                        <span className="sr-only">Select</span>
                      </th>
                      <th className="px-6 py-4">Unit ID</th>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Address</th>
                      <th className="px-6 py-4">Contact</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {isBranchesLoading ? (<tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">Loading branches...</td>
                      </tr>) : branches.length === 0 ? (<tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">No branches found.</td>
                      </tr>) : paginatedBranches.map(function (branch) { return (<tr key={branch.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <input type="checkbox" checked={selectedBranchIds.includes(branch.id)} onChange={function () { return toggleBranchSelection(branch.id); }} className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30"/>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-600">{branch.unitId}</td>
                        <td className="px-6 py-4 text-sm font-bold text-primary">{branch.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{branch.address}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{branch.contact}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button type="button" onClick={function () { return toggleBranchStatus(branch.id); }} className={"px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-colors ".concat(branch.status === 'active'
                    ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
                              {branch.status}
                            </button>
                            <button type="button" onClick={function () { return openEditBranchModal(branch); }} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors" aria-label={"Edit ".concat(branch.name)}>
                              <lucide_react_1.Pencil className="w-4 h-4"/>
                            </button>
                            <button type="button" onClick={function () { return handleDeleteBranch(branch.id); }} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors" aria-label={"Delete ".concat(branch.name)}>
                              <lucide_react_1.Trash2 className="w-4 h-4"/>
                            </button>
                          </div>
                        </td>
                      </tr>); })}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <span className="text-xs text-slate-500">
                  {branches.length === 0
                ? 'Showing 0 of 0'
                : "Showing ".concat((branchPage - 1) * ORDERS_PER_PAGE + 1, "-").concat(Math.min(branchPage * ORDERS_PER_PAGE, branches.length), " of ").concat(branches.length)}
                </span>
                <button type="button" onClick={function () { return setBranchPage(function (current) { return Math.max(1, current - 1); }); }} disabled={branchPage === 1 || branches.length === 0} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  Previous
                </button>
                <span className="text-xs font-semibold text-slate-600 min-w-16 text-center">
                  {branchPage} / {totalBranchPages}
                </span>
                <button type="button" onClick={function () { return setBranchPage(function (current) { return Math.min(totalBranchPages, current + 1); }); }} disabled={branchPage === totalBranchPages || branches.length === 0} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  Next
                </button>
              </div>
            </div>

            {isBranchModalOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <button type="button" aria-label="Close modal" onClick={closeAddBranchModal} className="absolute inset-0 bg-slate-900/45"/>
                <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white border border-slate-100 shadow-2xl">
                  <div className="px-6 py-5 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-primary">{editingBranchId ? 'Edit Branch' : 'Add Branch'}</h3>
                    <p className="text-sm text-slate-500 mt-1">Fill in the branch details below.</p>
                  </div>

                  <form onSubmit={handleAddBranchSubmit} className="px-6 py-5 space-y-4">
                    {branchFormError && (<div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                        {branchFormError}
                      </div>)}

                    <div className="space-y-1">
                      <label htmlFor="branch-unit-id" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Unit ID</label>
                      <input id="branch-unit-id" value={branchForm.unitId} onChange={function (e) { return setBranchForm(function (current) { return (__assign(__assign({}, current), { unitId: e.target.value })); }); }} placeholder="12345" maxLength={5} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none" required/>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="branch-name" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Name</label>
                      <input id="branch-name" value={branchForm.name} onChange={function (e) { return setBranchForm(function (current) { return (__assign(__assign({}, current), { name: e.target.value })); }); }} placeholder="Central Branch" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none" required/>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="branch-address" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Address</label>
                      <input id="branch-address" value={branchForm.address} onChange={function (e) { return setBranchForm(function (current) { return (__assign(__assign({}, current), { address: e.target.value })); }); }} placeholder="123 Main Street" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"/>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="branch-contact" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Contact</label>
                      <input id="branch-contact" value={branchForm.contact} onChange={function (e) { return setBranchForm(function (current) { return (__assign(__assign({}, current), { contact: e.target.value })); }); }} placeholder="+63 900 000 0000" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"/>
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                      <button type="button" onClick={closeAddBranchModal} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50">
                        Cancel
                      </button>
                      <button type="submit" className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-container">
                        {editingBranchId ? 'Update Branch' : 'Save Branch'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>)}
          </section>) : (<>
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
              <div>
                <p className="text-secondary font-bold text-xs uppercase tracking-widest mb-2">Owner Dashboard</p>
                <h2 className="text-4xl font-bold text-primary">Business Overview</h2>
                {isAdminUser && branches.length > 0 && (<div className="mt-3">
                    <select value={overviewBranchFilter} onChange={function (e) { return setOverviewBranchFilter(e.target.value); }} className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-sm">
                      <option value="">All Branches</option>
                      {branches.map(function (b) { return (<option key={b.id} value={String(b.id)}>{b.name || b.unitId}</option>); })}
                    </select>
                  </div>)}
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <button className="flex-1 md:flex-none px-6 py-3 rounded-xl border border-outline-variant text-primary font-bold hover:bg-surface-container transition-all flex items-center justify-center gap-2 text-sm">
                  <lucide_react_1.FileText className="w-4 h-4"/>
                  Generate Report
                </button>
              </div>
            </header>

        {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Daily Sales */}
          <react_1.motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
            {(function () {
                var _a;
                var series = dailySales
                    ? [dailySales.day7, dailySales.day6, dailySales.day5, dailySales.day4, dailySales.day3, dailySales.day2, dailySales.day1]
                    : [0, 0, 0, 0, 0, 0, 0];
                var maxValue = Math.max.apply(Math, __spreadArray(__spreadArray([], series, false), [1], false));
                var todaySales = (_a = dailySales === null || dailySales === void 0 ? void 0 : dailySales.day1) !== null && _a !== void 0 ? _a : 0;
                var sevenDayTotal = series.reduce(function (sum, value) { return sum + value; }, 0);
                var fmtMoney = function (v) {
                    return v.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' });
                };
                return (<>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Daily Sales</p>
                      <h3 className="text-3xl font-black text-primary mt-2">{fmtMoney(todaySales)}</h3>
                    </div>
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-black">
                      7D {fmtMoney(sevenDayTotal)}
                    </span>
                  </div>
                  {isDailySalesLoading ? (<div className="h-20 w-full flex items-center justify-center">
                      <span className="text-sm text-slate-400">Loading...</span>
                    </div>) : (<div className="h-20 w-full flex items-end gap-1.5">
                      {series.map(function (value, i) {
                            var height = Math.max(6, Math.round((value / maxValue) * 100));
                            return (<div key={i} className={"flex-1 rounded-t-sm transition-all duration-500 ".concat(i === 6 ? 'bg-primary' : 'bg-primary/20')} style={{ height: "".concat(height, "%") }} title={"Day ".concat(7 - i, ": ").concat(fmtMoney(value))}/>);
                        })}
                    </div>)}
                </>);
            })()}
          </react_1.motion.div>

          {/* Inventory Capacity */}
          {(function () {
                var _a, _b;
                var cap = (_a = inventoryCapacity === null || inventoryCapacity === void 0 ? void 0 : inventoryCapacity.capacity) !== null && _a !== void 0 ? _a : 0;
                var dem = (_b = inventoryCapacity === null || inventoryCapacity === void 0 ? void 0 : inventoryCapacity.demand) !== null && _b !== void 0 ? _b : 0;
                var pct = cap > 0 ? Math.min(100, Math.round((dem / cap) * 100)) : 0;
                var circumference = 301.6;
                var dashOffset = circumference * (1 - pct / 100);
                var fmtGal = function (v) {
                    return v >= 1000 ? "".concat((v / 1000).toFixed(1), "k gal") : "".concat(v, " gal");
                };
                return (<react_1.motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                <div className="h-full flex flex-col">
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Demand VS Capacity</p>
                  {isInventoryCapacityLoading ? (<div className="mt-6 flex items-center justify-center flex-grow">
                      <span className="text-sm text-slate-400">Loading...</span>
                    </div>) : (<div className="mt-6 flex items-center gap-8 flex-grow">
                      <div className="relative w-28 h-28 flex-shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle className="text-slate-100" cx="56" cy="56" fill="transparent" r="48" stroke="currentColor" strokeWidth="8"/>
                          <react_1.motion.circle initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: dashOffset }} transition={{ duration: 1.5, ease: 'easeOut' }} className="text-secondary" cx="56" cy="56" fill="transparent" r="48" stroke="currentColor" strokeDasharray={String(circumference)} strokeWidth="8"/>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-black text-primary">{pct}%</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-secondary"/>
                          <span className="text-xs font-bold text-slate-700">Demand: {fmtGal(dem)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-200"/>
                          <span className="text-xs font-bold text-slate-700">Stock: {fmtGal(cap)}</span>
                        </div>
                      </div>
                    </div>)}
                </div>
              </react_1.motion.div>);
            })()}

          {/* System Health */}
          <react_1.motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-primary text-white p-8 rounded-2xl shadow-xl shadow-primary/20 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h4 className="font-bold text-lg">System Health</h4>
              <lucide_react_1.ShieldCheck className="w-6 h-6 text-secondary-container"/>
            </div>
            <div className="space-y-6 flex-grow">
              <div>
                <div className="flex justify-between text-xs font-bold mb-2 text-on-primary-container uppercase tracking-wider">
                  <span>Filtration Efficiency</span>
                  <span>99.8%</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <react_1.motion.div initial={{ width: 0 }} animate={{ width: '99.8%' }} transition={{ duration: 1, delay: 0.5 }} className="bg-secondary-container h-full"/>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-2 text-on-primary-container uppercase tracking-wider">
                  <span>Delivery Fleet</span>
                  <span>Optimal</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <react_1.motion.div initial={{ width: 0 }} animate={{ width: '94%' }} transition={{ duration: 1, delay: 0.7 }} className="bg-secondary-container h-full"/>
                </div>
              </div>
            </div>
            <button className="w-full mt-8 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-bold transition-all uppercase tracking-widest">
              View Technical Logs
            </button>
          </react_1.motion.div>
        </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Active Orders */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-primary">Active Orders</h3>
              <button className="text-secondary text-sm font-bold hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500 font-black">
                  <tr>
                    <th className="px-8 py-5">Order ID</th>
                    <th className="px-8 py-5">Customer</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5">Type</th>
                    <th className="px-8 py-5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {isActiveOrdersLoading ? (<tr>
                      <td colSpan={5} className="px-8 py-8 text-center text-xs text-slate-400">Loading...</td>
                    </tr>) : activeOrders.length === 0 ? (<tr>
                      <td colSpan={5} className="px-8 py-8 text-center text-xs text-slate-400">No active orders</td>
                    </tr>) : activeOrders.map(function (order) {
                var _a, _b;
                var initials = ((_a = order.customerName) !== null && _a !== void 0 ? _a : 'N/A')
                    .split(' ')
                    .slice(0, 2)
                    .map(function (w) { var _a, _b; return (_b = (_a = w[0]) === null || _a === void 0 ? void 0 : _a.toUpperCase()) !== null && _b !== void 0 ? _b : ''; })
                    .join('');
                var statusColorClass = order.orderStatus === 'out-for-delivery' ? 'bg-blue-50 text-blue-600' :
                    order.orderStatus === 'confirmed' ? 'bg-emerald-50 text-emerald-600' :
                        order.orderStatus === 'pending' ? 'bg-amber-50 text-amber-600' :
                            'bg-slate-100 text-slate-500';
                return (<tr key={order.orderNumber} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-8 py-5 font-mono text-xs text-slate-500 tracking-tight">{order.orderNumber}</td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary text-[10px] font-black">
                              {initials}
                            </div>
                            <span className="text-sm font-bold text-primary">{(_b = order.customerName) !== null && _b !== void 0 ? _b : '—'}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className={"px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ".concat(statusColorClass)}>
                            {order.orderStatus.replace(/-/g, ' ')}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-xs font-semibold text-slate-500 capitalize">{order.orderType.replace(/-/g, ' ')}</td>
                        <td className="px-8 py-5 text-right">
                          <span className="text-xs font-bold text-primary">₱{order.totalAmount.toFixed(2)}</span>
                        </td>
                      </tr>);
            })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-4 space-y-8">
            <div>
              <h3 className="font-bold text-primary mb-6">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                { icon: lucide_react_1.Droplet, label: 'Test Quality', color: 'secondary' },
                { icon: lucide_react_1.Map, label: 'Fleet Map', color: 'primary' },
                { icon: lucide_react_1.UserPlus, label: 'Add Lead', color: 'primary' },
                { icon: lucide_react_1.Receipt, label: 'Send Invoice', color: 'primary' },
            ].map(function (action) { return (<button key={action.label} className="flex flex-col items-center justify-center p-6 bg-white border border-slate-100 rounded-2xl hover:border-secondary/30 hover:bg-surface-container transition-all group shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <action.icon className="w-6 h-6 text-primary"/>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{action.label}</span>
                  </button>); })}
              </div>
            </div>

            <div className="bg-surface-container rounded-2xl p-8 relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="font-black text-primary uppercase tracking-widest text-xs mb-3">Sustainability Goal</h4>
                <p className="text-xs text-primary/70 leading-relaxed font-bold mb-6">You're 200 gallons away from hitting this month's water conservation target.</p>
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-black text-primary">82%</span>
                  <div className="flex-1 h-3 bg-white/50 rounded-full overflow-hidden">
                    <react_1.motion.div initial={{ width: 0 }} animate={{ width: '82%' }} transition={{ duration: 1, delay: 0.5 }} className="h-full bg-primary"/>
                  </div>
                </div>
              </div>
              <lucide_react_1.Leaf className="absolute -bottom-6 -right-6 w-32 h-32 text-primary opacity-5 transform rotate-12"/>
            </div>
          </div>
            </div>
          </>)}
      </main>
    </div>);
}
