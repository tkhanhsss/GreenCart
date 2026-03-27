# 🛒 GreenCart

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

## **Nền tảng thương mại điện tử fullstack hiện đại, xây dựng trên MERN Stack**

## 📋 Mục lục
- [Giới thiệu dự án](#-giới-thiệu-dự-án)
- [Tính năng nổi bật](#-tính-năng-nổi-bật)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Kiến trúc CSDL & Luồng hoạt động](#-kiến-trúc-csdl--luồng-hoạt-động)
- [Hướng dẫn cài đặt](#-hướng-dẫn-cài-đặt)
- [Biến môi trường](#-biến-môi-trường)
- [Hướng dẫn sử dụng](#-hướng-dẫn-sử-dụng)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)

---

## 📖 Giới thiệu dự án

**GreenCart** là ứng dụng thương mại điện tử giao diện hiện đại, đầy đủ tiện ích và tính năng thông minh, được vận hành trên hạ tầng **MERN** (MongoDB, Express, React, Node.js). Hệ thống được chuẩn hóa luồng logic, cô lập theo kiến trúc độc lập nhằm tối ưu hóa tải truy cập vào hai khâu là: luồng mua sắm mượt mà dành cho User và luồng quản lý dòng vốn của Shop bán hàng.

| Ứng dụng  | Vai trò cơ bản | Cổng chạy Local mặc định |
| --------- | ------- | ------------------------ |
| `client/` | Giao diện mua sắm cho Khách hàng & Bảng điều khiển quản trị (Seller Dashboard) | `http://localhost:5173` |
| `server/` | Máy chủ API RESTful xử lý toàn bộ logic nghiệp vụ cốt lõi và hệ thống Database | `http://localhost:4000` |

---

## ✨ Tính năng nổi bật

### 🛍 Giao diện khách hàng (Customer Portal)
- **Quản lý tài khoản (Auth)**: Người dùng thực hiện Đăng nhập/Đăng ký xác thực qua `JWT Token`, Token được phân bổ an toàn qua môi trường HTTP Cookie. Mật khẩu mã hoá qua lớp `Bcrypt`.
- **Sổ địa chỉ (Address book)**: Hỗ trợ người dùng lưu trữ, chỉnh sửa, xoá đa dạng các địa chỉ nhận hàng trong một tệp tài khoản.
- **Trải nghiệm mua sắm đồng bộ**:
  - Giao diện duyệt sản phẩm phân tầng chuyên sâu qua các Danh mục (Category).
  - Tự động hiển thị phân luồng sản phẩm mới ra mắt hoặc BestSeller.
  - Quản lý **Giỏ hàng trực tuyến**: Thêm/bớt số lượng linh hoạt, tự động nội suy tổng hóa đơn (`Subtotal`) Realtime trên Client.
  - **Checkout chi tiết**: Hỗ trợ chuẩn thanh toán nhận hàng trả tiền COD (`Cash on Delivery`), tự động tính tỷ lệ Thuế (Tax Rate 2%) trực tiếp bằng Logic Server để chặn sửa đổi gian lận.
- **Lịch sử đơn hàng**: Khách hàng được quyền theo dõi tiến độ vận đơn của gói hàng sát với thời gian thực của Shop (_Order Placed, Packing, Shipped, Out for Delivery, Delivered, Cancelled_).

### 🔧 Bảng quản trị & Kho hàng (Seller/Admin Dashboard)
- **Truy cập / Phân quyền**: Được chỉ định phân đoạn riêng biệt thông qua đường dẫn bảo mật `/seller` (Lọc xác thực qua Middleware của Admin).
- **Quản lý Sản phẩm (Products)**: Thêm mới hồ sơ sản phẩm, tự động kéo và đẩy Base64 hình ảnh lên CDN `Cloudinary`. Điều hướng được giá gốc với giá thành khuyến mãi.
- **Nghiệp vụ Kho Hàng nâng cao (Warehouse Receipts)**:
  - Tạo Phiếu Nhập Kho (Restock) sẽ sinh tự động mã phiếu định dạng Audit chuẩn: `IR-YYYYMMDD-XXX`.
  - Quản lý chính xác vốn lưu động (`unitCost`). Số lượng gia tăng sẽ tự động được đồng bộ bằng lệnh CSDL `bulkWrite` vào kho lượng gốc của `Product stock`.
- **Phiếu Hủy Khấu Trừ (Cancellation Voucher)**:
  - Tạo cơ chế bảo vệ vốn cho các trường hợp rủi ro kho bãi (Lỗi, Hỏng, Mất, Quá Hạn - Damaged, Lost, Expired, Other). 
  - Khi lập phiếu sẽ nhả mã `CV-YYYYMMDD-XXX`, và lập tức xé kho trừ trực tiếp vào lượng tồn trong Kho mà không tạo "Ghi nhận doanh thu rác".
- **Quản lý Vận Đơn (Orders)**:
  - Hệ thống cho phép điều hành lệnh trạng thái (Packing, Shipped...). Đặc biệt, khi đơn chuyển sang vòng đời bị hủy (Cancelled), số lượng đã ghim trong giỏ lập tức được bù ngược lại vào kho hàng.
- **Phân tích Dashboard toàn diện**:
  - Tích hợp 100% bằng sức mạnh của MongoDB Aggregate Pipelines để bóc tách: Tổng Doanh Thu (`Gross Revenue`), Tổng Vốn Nhập (`importCost`), và Tổn thất Hủy hàng (`cancellationLoss`).
  - Hệ thống tự nội suy **Gross Profit** (Lợi Nhuận Gộp ròng) qua công thức chéo chuẩn xác.
  - Tích hợp biểu đồ phân tích xu thế bán hàng 7 ngày và báo động sản phẩm sắp cạn kho (`quantity <= 5`).
- **Quản lý Ban người dùng**: Chức năng Lock Account (Khóa tài khoản nóng bằng Toggle Delete) trực tiếp bảo vệ sân chơi sạch.

---

## 🛠 Công nghệ sử dụng

### Frontend (Client)
| Công nghệ | Chức năng (Vai trò) |
| --- | --- |
| **React 19** | Thư viện ảo DOM tạo Component UI cốt lõi |
| **Vite** | Công cụ Build tool siêu tốc (Fast HMR) |
| **React Router v7** | Xử lý định tuyến Route trên Client (SPA Architecture) |
| **Tailwind CSS 4** | Khung sườn Styling Utility-first hiện đại |
| **Axios** | Call Web API theo tiêu chuẩn RESTful |
| **React Hot Toast** | Thông báo đẩy popup bắt mắt, thân thiện với UI |

### Backend (Server)
| Công nghệ | Chức năng (Vai trò) |
| --- | --- |
| **Node.js 18+** | Môi trường hệ thống Runtime cho Javascript |
| **Express.js 5** | Bộ Middleware định tuyến Framework để Build API |
| **MongoDB + Mongoose 9** | Hệ quản trị DB phi cấu trúc (NoSQL Document Base) |
| **JWT & Bcryptjs** | Xử lý Auth, Băm Session Token và Mã hóa Mật khẩu |
| **Cloudinary & Multer** | Parser xử lý và chứa Files Upload (Hình ảnh SP) |
| **CORS / Cookie-Parser** | Xử lý thông dịch bảo mật kết nối và truyền tin Cookie HTTP |

---

## 🏗 Kiến trúc CSDL & Luồng hoạt động

Mongoose DB của GreenCart là hệ sinh thái liên kết Schema với Object References mạnh mẽ:

1. **User & Address**: Mỗi Profile `User` (1) nắm giữ cấu trúc mảng nhiều `Address` (N) độc lập dùng cho tùy chọn giao hàng COD linh hoạt.
2. **Product & Category**: Các `Product` (N) được quy hoạch trong `1` hạng mục `Category` chung. Tồn kho (`quantity`) được áp dụng giải thức **Atomic Update** ngăn lệch dữ liệu bằng MongoDB `$inc`.
3. **Order**: Thiết lập phương thức Snapshot cứng chi tiết danh sách Cart + Địa chỉ vào ngay thời khắc nhấn "Đặt Hàng".
4. **WarehouseReceipt & CancellationVoucher**: Bộ công cụ thiết lập luồng Kế toán dòng tiền:
   - `WarehouseReceipt`: Tiêm vốn (`unitCost`) -> Cộng Stock Hàng.
   - `CancellationVoucher`: Theo dõi suy thoái -> Trừ trực tiếp Stock lỗi.

### Sơ đồ luồng ứng dụng mô phỏng

```mermaid
graph TD
    Cust([Khách Hàng]) -->|Duyệt Hàng, Chốt COD Checkout| Client[Frontend - React 19 + Vite]
    Admin([Seller / Admin]) -->|Dashboard, Nhập kho/Hủy kho| Client
    Client -- "Client Server Connect Req (Axios)" --> Server[Backend - Express 5 API]

    Server -->|Express Route + JWT Cookie Auth| Control[Controllers Logic Xử Lý]
    Control -->|CRUD Operations & bulkWrite| DB[(MongoDB Mongoose 9)]
    Control -->|Upload & Optimize IMG| Cloud[Cloudinary Storage]

    subgraph Data Models (Logic Liên Kết)
        DB --> U[User Schema & Address]
        DB --> O[Order - Phương Thức COD]
        DB --> P[Product & Root Category]
        DB --> W[Warehouse Receipt<br>& Cancellation Voucher]
    end
```

---

## 🚀 Hướng dẫn cài đặt

### Yêu cầu hệ thống thiết yếu
- **Node.js**: Phiên bản khuyên dùng `>= 18.x`
- **MongoDB**: Hệ CSDL Local (Máy chủ ảo) hoặc dạng Cloud như MongoDB Atlas.
- **Cloudinary**: Thông tin API tài khoản (Cho tính năng Upload đa phương tiện).

### Các bước cài đặt luồng chạy Local

**1. Clone dự án về ổ đĩa**
```bash
git clone https://github.com/your-username/GreenCart.git
cd GreenCart
```

**2. Tiêm các thư viện lõi (Dependencies)**
```bash
# Bật Terminal cài đặt lõi cho Server
cd server
npm install

# Bật Terminal khác cài đặt lõi cho Client
cd ../client
npm install
```

**3. Khai báo nạp biến môi trường**
(Tạo file chuẩn `.env` tại mục `server/` dựa theo cấu trúc ở phần [Biến môi trường](#-biến-môi-trường) ngay bên dưới)

**4. Khởi chạy toàn nền tảng (Dùng 2 Terminal Độc Lập)**

```bash
# Terminal 1 - Đánh thức Backend Server (Cổng Local: 4000)
cd server
npm run server  # Start qua Nodemon hỗ trợ Live Reload Core

# Terminal 2 - Đánh thức Frontend Client (Cổng Local: 5173)
cd client
npm run dev     # Xúc tác Vite khởi động local server siêu tốc
```

---

## 🔐 Biến môi trường hệ thống

Bạn phải cấu hình đủ các biến này và lưu với tên tệp chuẩn là `.env` (Đặt ngay gốc rễ trong thư mục `server/`):

```env
# Cổng chạy API Backend
PORT=4000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>
JWT_SECRET=mang_chuoi_bi_mat_ma_hoa_cua_ban

# Khóa cấu hình giao tiếp Upload tĩnh (Cloudinary)
CLOUDINARY_CLOUD_NAME=ten_cloud_cua_ban
CLOUDINARY_API_KEY=key_api_cua_ban
CLOUDINARY_API_SECRET=mat_khau_api_cua_ban

# ---- TÀI KHOẢN MỘC DÙNG TEST SELLER (DEMO) ----
# Email: admin@example.com
# Password: 1
```

---

## 💻 Hướng dẫn Test & Sử dụng đường dẫn Base

| Tuyến App Khai Sinh | Định dạng đường dẫn truy cập | Lưu ý phân ranh bảo mật |
| --- | --- | --- |
| **Khách hàng** | `http://localhost:5173` | Kênh UI tiêu chuẩn để duyệt sản phẩm |
| **Bảng Quản trị (Admin)** | `http://localhost:5173/seller` | Điểm truy cập bị giới nghiêm. Bắt buộc có cờ Xác thực quyền khóa Middleware. |
| **Máy API (Base API)** | `http://localhost:4000` | Trạm Endpoints nền vận tải ngầm (Không gắn giao diện). |

---

## 📂 Tổ chức phân luồng thư mục lõi

```text
GreenCart/
│
├── client/                      # Khu chứa mảng Frontend
│   ├── src/
│   │   ├── components/          # Element mảnh tái sử dụng chung (Navbar, Sidebar v.v.)
│   │   ├── pages/               # Tầng Root (Home, Cart, Product, MyOrders...)
│   │   │   └── seller/          # Tầng đặc vụ quản lý Seller (Dashboard, Warehouse...)
│   │   ├── context/             # Phân hệ nhúng AppContext (Quản lý User, Giỏ, Xác thực)
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                      # Khu chứa mảng Logic API Backend
│   ├── controllers/             # Nhân xử lý sự kiện (user, product, order, warehouse, stats...)
│   ├── middlewares/             # Security Tường rào (authUser, authSeller, multer-upload)
│   ├── models/                  # Đóng gói Schema thiết kế DB
│   ├── routes/                  # RESTful API Endpoint List
│   ├── config/                  # MongoDB Connect, Setup Cloudinary
│   ├── server.js                # Index Point (Root Code base)
│   └── package.json
│
└── README.md                    # Tài liệu lõi gốc của dự án (Chính là file đang đọc)
```
