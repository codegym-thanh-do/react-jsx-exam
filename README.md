# React Production Template (JSX, Vite, React Router v6+)

## Cây thư mục

```
react-jsx-exam/
├── .eslintrc.json
├── .prettierrc
├── package.json
├── vite.config.js
├── README.md
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── assets/
│   ├── components/
│   │   ├── Header.jsx
│   │   └── Footer.jsx
│   ├── context/
│   ├── hooks/
│   ├── layouts/
│   │   └── MainLayout.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   └── About.jsx
│   ├── services/
│   ├── styles/
│   │   └── global.css
│   ├── utils/
```

## Hướng dẫn chạy dự án

```bash
npm install
npm run dev
```

Truy cập http://localhost:5173 để xem ứng dụng.

## Giải thích cấu trúc
- **src/**: Chứa toàn bộ mã nguồn, chia rõ các module giúp dễ mở rộng, bảo trì.
- **components/**: Các component tái sử dụng (Header, Footer...)
- **pages/**: Các trang chính, mỗi trang là một file riêng biệt.
- **layouts/**: Layout chung cho toàn bộ app, giúp quản lý giao diện nhất quán.
- **hooks/**, **context/**, **utils/**, **services/**: Tách biệt logic, state, tiện ích, API rõ ràng.
- **assets/**, **styles/**: Quản lý hình ảnh, style toàn cục.
- **App.jsx/main.jsx**: Điểm khởi tạo và root component.
- **ESLint + Prettier**: Đảm bảo code sạch, chuẩn, dễ kiểm soát.

Cấu trúc này giúp dự án dễ mở rộng, chia module rõ ràng, phù hợp cho team và production thực tế.
