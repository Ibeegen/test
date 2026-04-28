import {AnimatePresence, motion} from 'motion/react';
import {
  ArrowRight,
  Leaf,
  Menu,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  X,
} from 'lucide-react';
import {useMemo, useState} from 'react';

type Category = 'Tất cả' | 'Phòng khách' | 'Phòng ngủ' | 'Trang trí';

type Product = {
  id: number;
  name: string;
  category: Exclude<Category, 'Tất cả'>;
  price: number;
  originalPrice?: number;
  description: string;
  badge: string;
  image: string;
};

type CartItem = Product & {
  quantity: number;
};

type CheckoutForm = {
  name: string;
  phone: string;
  address: string;
  note: string;
};

const categories: Category[] = ['Tất cả', 'Phòng khách', 'Phòng ngủ', 'Trang trí'];

const products: Product[] = [
  {
    id: 1,
    name: 'Sofa Portico Boucle',
    category: 'Phòng khách',
    price: 28900000,
    originalPrice: 32500000,
    description: 'Phom thấp, tựa lưng sâu và chất liệu boucle kem cho không gian tiếp khách hiện đại.',
    badge: 'Bán chạy',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 2,
    name: 'Ghế Lounge Solis',
    category: 'Phòng khách',
    price: 12400000,
    description: 'Khung gỗ ash hoàn thiện dầu mờ, đệm ngồi rộng và góc tựa tối ưu cho thư giãn cuối ngày.',
    badge: 'Mới về',
    image:
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 3,
    name: 'Giường Noma Walnut',
    category: 'Phòng ngủ',
    price: 21700000,
    originalPrice: 24600000,
    description: 'Đầu giường bo cong, gỗ óc chó phủ satin và tỷ lệ tinh gọn cho phòng ngủ cao cấp.',
    badge: 'Ưu đãi tuần này',
    image:
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 4,
    name: 'Bộ chăn ga Vale Linen',
    category: 'Phòng ngủ',
    price: 3690000,
    description: 'Linen stonewashed thoáng nhẹ, bảng màu trung tính và hoàn thiện mềm ngay từ lần dùng đầu tiên.',
    badge: 'Best value',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80&sat=-35&bri=6',
  },
  {
    id: 5,
    name: 'Đèn sàn Halo Brass',
    category: 'Trang trí',
    price: 5900000,
    description: 'Đèn sàn thân brass đánh xước, ánh sáng ấm và chụp vải tạo lớp sáng dịu cho phòng khách.',
    badge: 'Studio pick',
    image:
      'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 6,
    name: 'Bình gốm Arco',
    category: 'Trang trí',
    price: 1850000,
    description: 'Men cát nhám, miệng bình cao và tỷ lệ điêu khắc giúp góc nhỏ trông tinh hơn tức thì.',
    badge: 'Giới hạn',
    image:
      'https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=1200&q=80',
  },
];

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price);

const shippingThreshold = 30000000;

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('Tất cả');
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutForm, setCheckoutForm] = useState<CheckoutForm>({
    name: '',
    phone: '',
    address: '',
    note: '',
  });
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {...products[0], quantity: 1},
  ]);

  const filteredProducts =
    selectedCategory === 'Tất cả'
      ? products
      : products.filter((product) => product.category === selectedCategory);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );
  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems],
  );
  const shippingRemaining = Math.max(0, shippingThreshold - cartTotal);

  const addToCart = (product: Product) => {
    setCartOpen(true);
    setCheckoutError('');
    setCartItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id ? {...item, quantity: item.quantity + 1} : item,
        );
      }
      return [...current, {...product, quantity: 1}];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCartItems((current) =>
      current
        .map((item) =>
          item.id === id ? {...item, quantity: item.quantity + delta} : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const openCheckout = () => {
    if (cartItems.length === 0) {
      setCheckoutError('Giỏ hàng đang trống, hãy chọn sản phẩm trước khi thanh toán.');
      return;
    }
    setCheckoutError('');
    setOrderPlaced(false);
    setCheckoutOpen(true);
  };

  const closeCheckout = () => {
    setCheckoutOpen(false);
    setCheckoutError('');
  };

  const handleCheckoutFieldChange =
    (field: keyof CheckoutForm) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setCheckoutForm((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const handleCheckoutSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!checkoutForm.name.trim() || !checkoutForm.phone.trim() || !checkoutForm.address.trim()) {
      setCheckoutError('Vui lòng nhập đầy đủ họ tên, số điện thoại và địa chỉ giao hàng.');
      return;
    }

    setCheckoutError('');
    setOrderPlaced(true);
    setCartItems([]);
  };

  return (
    <div className="min-h-screen bg-[var(--color-cream)] text-[var(--color-ink)]">
      <header className="absolute inset-x-0 top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 text-white md:px-8">
          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-white/20 bg-white/10 backdrop-blur md:hidden"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Mở menu"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div className="flex items-baseline gap-3">
            <span className="font-serif text-3xl leading-none tracking-tight md:text-4xl">
              MOC Atelier
            </span>
            <span className="hidden text-xs uppercase tracking-[0.35em] text-white/65 md:inline">
              Curated Home Objects
            </span>
          </div>

          <nav className="hidden items-center gap-8 text-sm text-white/85 md:flex">
            <a href="#shop" className="hover:text-white">
              Cửa hàng
            </a>
            <a href="#collections" className="hover:text-white">
              Bộ sưu tập
            </a>
            <a href="#journal" className="hover:text-white">
              Không gian sống
            </a>
          </nav>

          <button
            className="inline-flex items-center gap-3 rounded-md border border-white/20 bg-white/10 px-4 py-3 text-sm backdrop-blur"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBag size={16} />
            <span className="hidden md:inline">Giỏ hàng</span>
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-sm bg-white px-1.5 text-xs font-semibold text-[var(--color-ink)]">
              {cartCount}
            </span>
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{opacity: 0, y: -12}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0, y: -12}}
              className="mx-5 rounded-md border border-white/15 bg-[rgba(12,16,18,0.9)] p-5 text-white shadow-2xl backdrop-blur md:hidden"
            >
              <div className="flex flex-col gap-4 text-sm">
                <a href="#shop" onClick={() => setMenuOpen(false)}>
                  Cửa hàng
                </a>
                <a href="#collections" onClick={() => setMenuOpen(false)}>
                  Bộ sưu tập
                </a>
                <a href="#journal" onClick={() => setMenuOpen(false)}>
                  Không gian sống
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        <section className="relative min-h-[100svh] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1800&q=80"
            alt="Phòng khách sang trọng"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,12,14,0.82)_0%,rgba(9,12,14,0.55)_42%,rgba(9,12,14,0.15)_100%)]" />

          <div className="relative mx-auto flex min-h-[100svh] max-w-7xl items-end px-5 pb-12 pt-28 md:px-8 md:pb-16 md:pt-36">
            <div className="max-w-2xl">
              <motion.p
                initial={{opacity: 0, y: 24}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.6}}
                className="mb-5 text-sm uppercase tracking-[0.32em] text-[var(--color-gold-soft)]"
              >
                Bộ sưu tập nội thất cao cấp cho căn hộ và villa hiện đại
              </motion.p>
              <motion.h1
                initial={{opacity: 0, y: 30}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.7, delay: 0.05}}
                className="max-w-xl font-serif text-[3.2rem] leading-[0.92] text-white md:text-[5.8rem]"
              >
                Sắm một không gian sống đẹp như showroom.
              </motion.h1>
              <motion.p
                initial={{opacity: 0, y: 24}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.7, delay: 0.12}}
                className="mt-6 max-w-xl text-base leading-7 text-white/78 md:text-lg"
              >
                MOC Atelier tuyển chọn sofa, giường, ánh sáng và phụ kiện trang trí
                với tỷ lệ chuẩn, bảng màu tĩnh và dịch vụ giao lắp cho khách hàng cần
                trải nghiệm mua sắm chuyên nghiệp thật sự.
              </motion.p>

              <motion.div
                initial={{opacity: 0, y: 24}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.7, delay: 0.18}}
                className="mt-8 flex flex-col gap-4 sm:flex-row"
              >
                <a
                  href="#shop"
                  className="inline-flex items-center justify-center gap-3 rounded-md bg-[var(--color-clay)] px-6 py-4 text-sm font-semibold text-white transition-transform duration-200 hover:translate-y-[-1px]"
                >
                  Mua bộ sưu tập mới
                  <ArrowRight size={16} />
                </a>
                <a
                  href="#journal"
                  className="inline-flex items-center justify-center rounded-md border border-white/20 px-6 py-4 text-sm font-semibold text-white/92 backdrop-blur hover:bg-white/10"
                >
                  Xem không gian mẫu
                </a>
              </motion.div>

              <motion.div
                initial={{opacity: 0, y: 28}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.75, delay: 0.24}}
                className="mt-12 grid gap-3 border-t border-white/15 pt-6 text-white/82 sm:grid-cols-3"
              >
                <div>
                  <p className="text-3xl font-semibold text-white">48h</p>
                  <p className="mt-1 text-sm">Giao nhanh tại HCM và Hà Nội</p>
                </div>
                <div>
                  <p className="text-3xl font-semibold text-white">5 năm</p>
                  <p className="mt-1 text-sm">Bảo hành kết cấu cho dòng chủ lực</p>
                </div>
                <div>
                  <p className="text-3xl font-semibold text-white">4.9/5</p>
                  <p className="mt-1 text-sm">Đánh giá thực từ khách mua lại lần hai</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="border-b border-[var(--color-line)] bg-white/80">
          <div className="mx-auto grid max-w-7xl gap-6 px-5 py-5 text-sm md:grid-cols-3 md:px-8">
            <div className="flex items-center gap-3">
              <Truck size={18} className="text-[var(--color-clay)]" />
              <span>Miễn phí giao hàng cho đơn từ {formatPrice(shippingThreshold)}</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck size={18} className="text-[var(--color-forest)]" />
              <span>Kiểm tra hàng và hoàn trả trong 7 ngày</span>
            </div>
            <div className="flex items-center gap-3">
              <Leaf size={18} className="text-[var(--color-gold)]" />
              <span>Vật liệu bền vững, hoàn thiện thủ công tại xưởng đối tác</span>
            </div>
          </div>
        </section>

        <section id="shop" className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="section-kicker">Cửa hàng</p>
              <h2 className="section-title">Danh mục bán chạy được tuyển chọn theo từng phòng.</h2>
              <p className="section-copy">
                Bạn có thể lọc nhanh theo không gian, thêm vào giỏ và xem tổng giá trị
                đơn hàng ngay trong cùng một màn hình.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-md px-4 py-3 text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-[var(--color-forest)] text-white'
                      : 'bg-white text-[var(--color-ink)] shadow-[inset_0_0_0_1px_var(--color-line)] hover:bg-[var(--color-sand)]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-x-6 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product, index) => (
              <motion.article
                key={product.id}
                initial={{opacity: 0, y: 24}}
                whileInView={{opacity: 1, y: 0}}
                viewport={{once: true, amount: 0.25}}
                transition={{duration: 0.45, delay: index * 0.05}}
                className="group"
              >
                <div className="relative overflow-hidden rounded-md bg-[var(--color-sand)]">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="aspect-[4/4.2] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute left-4 top-4 rounded-sm bg-[rgba(248,243,236,0.92)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-ink)]">
                    {product.badge}
                  </div>
                </div>

                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">
                      {product.category}
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-tight">{product.name}</h3>
                  </div>
                  <button
                    className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-[var(--color-ink)] text-white transition hover:bg-[var(--color-forest)]"
                    onClick={() => addToCart(product)}
                    aria-label={`Thêm ${product.name} vào giỏ`}
                  >
                    <Plus size={18} />
                  </button>
                </div>

                <p className="mt-3 max-w-md text-sm leading-7 text-[var(--color-muted)]">
                  {product.description}
                </p>

                <div className="mt-4 flex items-center gap-3">
                  <span className="text-lg font-semibold">{formatPrice(product.price)}</span>
                  {product.originalPrice ? (
                    <span className="text-sm text-[var(--color-muted)] line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  ) : null}
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="collections" className="bg-[var(--color-ink)] text-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-[1.15fr_0.85fr] md:px-8 md:py-24">
            <div className="grid gap-4 sm:grid-cols-2">
              <img
                src="https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80"
                alt="Không gian phòng ngủ"
                className="h-full min-h-[320px] w-full rounded-md object-cover"
              />
              <div className="grid gap-4">
                <img
                  src="https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80"
                  alt="Chi tiết phòng bếp"
                  className="h-[210px] w-full rounded-md object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80"
                  alt="Góc đèn trang trí"
                  className="h-[210px] w-full rounded-md object-cover"
                />
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <p className="section-kicker text-[var(--color-gold-soft)]">Bộ sưu tập theo ngữ cảnh</p>
              <h2 className="section-title text-white">
                Thiết kế nhà đẹp hơn khi mua theo set thay vì mua từng món rời.
              </h2>
              <p className="section-copy text-white/72">
                Mỗi set của MOC Atelier được dựng sẵn theo tông màu, vật liệu và chiều
                cao tương thích để khách hàng ít phải chỉnh sửa sau khi nhận hàng.
              </p>

              <div className="mt-10 space-y-5 border-t border-white/12 pt-6">
                {[
                  'Set living room tối giản với sofa boucle, đèn brass và bàn trà mặt đá.',
                  'Set bedroom cân bằng ánh sáng ấm, ga linen và tab đầu giường tông walnut.',
                  'Set decor hoàn thiện góc đọc sách, console và phụ kiện gốm thủ công.',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 text-white/85">
                    <ArrowRight size={18} className="mt-1 shrink-0 text-[var(--color-gold-soft)]" />
                    <p className="leading-7">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="journal" className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
          <div className="grid gap-10 md:grid-cols-[0.95fr_1.05fr] md:items-center">
            <div>
              <p className="section-kicker">Không gian sống</p>
              <h2 className="section-title">
                Một website bán hàng chuyên nghiệp phải cho khách thấy món đồ sẽ sống trong nhà họ ra sao.
              </h2>
              <p className="section-copy">
                Vì vậy mỗi sản phẩm đều đi kèm ảnh ngữ cảnh thật, mô tả ngắn gọn và thông
                tin đủ để ra quyết định nhanh: chất liệu, cảm giác sử dụng và phạm vi phù hợp.
              </p>

              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <div className="rounded-md bg-white p-6 shadow-[inset_0_0_0_1px_var(--color-line)]">
                  <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-muted)]">
                    Đội stylist
                  </p>
                  <p className="mt-3 text-lg leading-8">
                    Hỗ trợ chọn set theo diện tích, ngân sách và tông màu trong vòng 24 giờ.
                  </p>
                </div>
                <div className="rounded-md bg-[var(--color-sand)] p-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-muted)]">
                    Khách hàng yêu thích
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-[var(--color-clay)]">
                    {Array.from({length: 5}).map((_, index) => (
                      <Star key={index} size={18} fill="currentColor" />
                    ))}
                  </div>
                  <p className="mt-3 text-lg leading-8">
                    “Ảnh và chất liệu thực tế gần như trùng hoàn toàn, giao lắp rất gọn.”
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-md">
              <img
                src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80&sat=-10"
                alt="Showroom nội thất"
                className="aspect-[1.1/1] w-full object-cover"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--color-line)] bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 md:grid-cols-[1fr_auto_auto] md:px-8">
          <div>
            <p className="font-serif text-3xl tracking-tight">MOC Atelier</p>
            <p className="mt-3 max-w-md text-sm leading-7 text-[var(--color-muted)]">
              Nội thất và decor cao cấp dành cho những căn nhà muốn vừa đẹp trong ảnh,
              vừa sống tốt trong đời thực.
            </p>
          </div>
          <div className="text-sm text-[var(--color-muted)]">
            <p className="font-semibold uppercase tracking-[0.25em] text-[var(--color-ink)]">
              Liên hệ
            </p>
            <p className="mt-3">showroom@mocatelier.vn</p>
            <p className="mt-2">028 7777 2288</p>
          </div>
          <div className="text-sm text-[var(--color-muted)]">
            <p className="font-semibold uppercase tracking-[0.25em] text-[var(--color-ink)]">
              Showroom
            </p>
            <p className="mt-3">Quận 2, TP. Hồ Chí Minh</p>
            <p className="mt-2">Ba Đình, Hà Nội</p>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.button
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              className="fixed inset-0 z-40 bg-[rgba(12,16,18,0.48)]"
              onClick={() => setCartOpen(false)}
              aria-label="Đóng giỏ hàng"
            />
            <motion.aside
              initial={{x: '100%'}}
              animate={{x: 0}}
              exit={{x: '100%'}}
              transition={{type: 'tween', ease: 'easeOut', duration: 0.32}}
              className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-line)] px-5 py-5">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-muted)]">
                    Giỏ hàng
                  </p>
                  <h3 className="mt-1 text-2xl font-semibold tracking-tight">
                    {cartCount} sản phẩm
                  </h3>
                </div>
                <button
                  onClick={() => setCartOpen(false)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-[var(--color-sand)]"
                  aria-label="Đóng"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="border-b border-[var(--color-line)] px-5 py-4">
                <div className="flex items-center justify-between text-sm text-[var(--color-muted)]">
                  <span>Tiến độ miễn phí vận chuyển</span>
                  <span>
                    {shippingRemaining === 0
                      ? 'Đã đạt'
                      : `Còn ${formatPrice(shippingRemaining)}`}
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--color-sand)]">
                  <div
                    className="h-full bg-[var(--color-forest)] transition-all"
                    style={{
                      width: `${Math.min(100, (cartTotal / shippingThreshold) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
                {cartItems.map((item) => (
                  <article
                    key={item.id}
                    className="grid grid-cols-[96px_1fr] gap-4 rounded-md bg-[var(--color-sand)] p-3"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-28 w-full rounded-md object-cover"
                    />
                    <div className="flex flex-col">
                      <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-muted)]">
                        {item.category}
                      </p>
                      <h4 className="mt-1 text-lg font-semibold">{item.name}</h4>
                      <p className="mt-2 text-sm text-[var(--color-muted)]">
                        {formatPrice(item.price)}
                      </p>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="inline-flex items-center rounded-md bg-white shadow-[inset_0_0_0_1px_var(--color-line)]">
                          <button
                            className="inline-flex h-10 w-10 items-center justify-center"
                            onClick={() => updateQuantity(item.id, -1)}
                            aria-label={`Giảm số lượng ${item.name}`}
                          >
                            <Minus size={16} />
                          </button>
                          <span className="inline-flex min-w-10 items-center justify-center text-sm font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            className="inline-flex h-10 w-10 items-center justify-center"
                            onClick={() => updateQuantity(item.id, 1)}
                            aria-label={`Tăng số lượng ${item.name}`}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <p className="font-semibold">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="border-t border-[var(--color-line)] px-5 py-5">
                <div className="flex items-center justify-between text-sm text-[var(--color-muted)]">
                  <span>Tạm tính</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-lg font-semibold">
                  <span>Tổng cộng</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                {checkoutError ? (
                  <p className="mt-4 rounded-md bg-[#efe3d7] px-4 py-3 text-sm text-[var(--color-clay)]">
                    {checkoutError}
                  </p>
                ) : null}
                <button
                  onClick={openCheckout}
                  className="mt-5 inline-flex w-full items-center justify-center gap-3 rounded-md bg-[var(--color-ink)] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[var(--color-forest)]"
                >
                  Tiến hành thanh toán
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {checkoutOpen && (
          <>
            <motion.button
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              className="fixed inset-0 z-[60] bg-[rgba(12,16,18,0.56)]"
              onClick={closeCheckout}
              aria-label="Đóng thanh toán"
            />
            <motion.div
              initial={{opacity: 0, y: 24}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0, y: 24}}
              className="fixed inset-x-4 top-[6vh] z-[70] mx-auto max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-md bg-white shadow-2xl md:inset-x-0"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-line)] px-5 py-5 md:px-8">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-muted)]">
                    Thanh toán
                  </p>
                  <h3 className="mt-1 font-serif text-4xl leading-none">Hoàn tất đơn hàng</h3>
                </div>
                <button
                  onClick={closeCheckout}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-[var(--color-sand)]"
                  aria-label="Đóng"
                >
                  <X size={18} />
                </button>
              </div>

              {orderPlaced ? (
                <div className="px-5 py-10 md:px-8">
                  <div className="rounded-md bg-[var(--color-sand)] p-6">
                    <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-forest)]">
                      Đặt hàng thành công
                    </p>
                    <h4 className="mt-3 text-2xl font-semibold tracking-tight">
                      MOC Atelier đã nhận yêu cầu của bạn.
                    </h4>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--color-muted)]">
                      Đội ngũ tư vấn sẽ liên hệ xác nhận đơn, phí vận chuyển và thời gian lắp đặt
                      trong vòng 30 phút làm việc.
                    </p>
                  </div>
                  <button
                    onClick={closeCheckout}
                    className="mt-6 inline-flex items-center justify-center rounded-md bg-[var(--color-ink)] px-5 py-3 text-sm font-semibold text-white"
                  >
                    Đóng
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCheckoutSubmit} className="grid gap-8 px-5 py-6 md:grid-cols-[1fr_0.9fr] md:px-8">
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-semibold">Họ và tên</label>
                      <input
                        value={checkoutForm.name}
                        onChange={handleCheckoutFieldChange('name')}
                        className="w-full rounded-md border border-[var(--color-line)] bg-white px-4 py-3 outline-none transition focus:border-[var(--color-forest)]"
                        placeholder="Nguyen Van A"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold">Số điện thoại</label>
                      <input
                        value={checkoutForm.phone}
                        onChange={handleCheckoutFieldChange('phone')}
                        className="w-full rounded-md border border-[var(--color-line)] bg-white px-4 py-3 outline-none transition focus:border-[var(--color-forest)]"
                        placeholder="09xx xxx xxx"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold">Địa chỉ giao hàng</label>
                      <textarea
                        value={checkoutForm.address}
                        onChange={handleCheckoutFieldChange('address')}
                        className="min-h-28 w-full rounded-md border border-[var(--color-line)] bg-white px-4 py-3 outline-none transition focus:border-[var(--color-forest)]"
                        placeholder="So nha, duong, quan/huyen, tinh/thanh"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold">Ghi chú</label>
                      <textarea
                        value={checkoutForm.note}
                        onChange={handleCheckoutFieldChange('note')}
                        className="min-h-24 w-full rounded-md border border-[var(--color-line)] bg-white px-4 py-3 outline-none transition focus:border-[var(--color-forest)]"
                        placeholder="Khung gio giao hang, yeu cau lap dat..."
                      />
                    </div>
                    {checkoutError ? (
                      <p className="rounded-md bg-[#efe3d7] px-4 py-3 text-sm text-[var(--color-clay)]">
                        {checkoutError}
                      </p>
                    ) : null}
                  </div>

                  <div className="rounded-md bg-[var(--color-sand)] p-5">
                    <p className="text-sm uppercase tracking-[0.28em] text-[var(--color-muted)]">
                      Tóm tắt đơn hàng
                    </p>
                    <div className="mt-5 space-y-4">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold">{item.name}</p>
                            <p className="mt-1 text-sm text-[var(--color-muted)]">
                              {item.quantity} x {formatPrice(item.price)}
                            </p>
                          </div>
                          <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 border-t border-[var(--color-line)] pt-4">
                      <div className="flex items-center justify-between text-sm text-[var(--color-muted)]">
                        <span>Tạm tính</span>
                        <span>{formatPrice(cartTotal)}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-sm text-[var(--color-muted)]">
                        <span>Vận chuyển</span>
                        <span>{cartTotal >= shippingThreshold ? 'Miễn phí' : 'Xác nhận sau'}</span>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-lg font-semibold">
                        <span>Tổng thanh toán</span>
                        <span>{formatPrice(cartTotal)}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-md bg-[var(--color-ink)] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[var(--color-forest)]"
                    >
                      Xác nhận đặt hàng
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
