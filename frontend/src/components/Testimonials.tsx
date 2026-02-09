'use client';

import { StarIcon, ArrowRightIcon, UserIcon } from './icons';

const testimonials = [
  {
    id: '1',
    name: 'Nguyễn Thị Minh',
    role: 'Mẹ bỉm sữa',
    content:
      'Sản phẩm chất lượng tuyệt vời! Con tôi rất thích những bộ quần áo từ Baby Bliss. Chất liệu mềm mại và an toàn cho da bé.',
    rating: 5,
    product: 'Bộ Body Cotton Organic',
    avatarColor: 'from-pink-300 to-pink-400',
  },
  {
    id: '2',
    name: 'Trần Văn Hùng',
    role: 'Bố của 2 bé',
    content:
      'Giao hàng nhanh, đóng gói cẩn thận. Đã mua nhiều lần và luôn hài lòng với dịch vụ của shop.',
    rating: 5,
    product: 'Xe đẩy gấp gọn',
    avatarColor: 'from-blue-300 to-blue-400',
  },
  {
    id: '3',
    name: 'Lê Thị Hương',
    role: 'Mẹ bầu',
    content:
      'Tư vấn nhiệt tình, sản phẩm đúng như mô tả. Sẽ tiếp tục ủng hộ Baby Bliss trong tương lai.',
    rating: 5,
    product: 'Nôi điện tự động',
    avatarColor: 'from-purple-300 to-purple-400',
  },
];

// Custom Avatar SVG Component
const AvatarIllustration = ({ name, colorClass }: { name: string; colorClass: string }) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  return (
    <div
      className={`w-14 h-14 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-md relative overflow-hidden`}
    >
      {/* Background pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 56 56">
        <circle cx="14" cy="14" r="8" fill="white" />
        <circle cx="42" cy="42" r="6" fill="white" />
        <circle cx="42" cy="14" r="4" fill="white" />
      </svg>
      {/* Initials */}
      <span className="text-white font-bold text-lg relative z-10">{initials}</span>
    </div>
  );
};

export default function Testimonials() {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-pink-100/50 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
      <div className="absolute top-1/2 right-0 w-72 h-72 bg-purple-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100 text-pink-600 font-medium text-sm mb-4">
            <UserIcon size={16} />
            Đánh giá khách hàng
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4">
            Khách hàng nói gì về chúng tôi
          </h2>
          <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
            Hàng ngàn bậc phụ huynh đã tin tưởng Baby Bliss cho bé yêu của họ
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="relative p-8 rounded-3xl bg-gradient-to-br from-pink-50 to-white border border-pink-100 hover:shadow-xl transition-all duration-500 animate-fade-in-up group"
              style={{
                animationDelay: `${index * 0.15}s`,
                opacity: 0,
                animationFillMode: 'forwards',
              }}
            >
              {/* Quote Icon */}
              <div className="absolute top-4 right-4 text-6xl text-pink-100 font-serif">
                &ldquo;
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    size={18}
                    className={i < testimonial.rating ? 'text-amber-400' : 'text-gray-200'}
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-[var(--text-secondary)] mb-6 leading-relaxed relative z-10">
                {testimonial.content}
              </p>

              {/* Product Badge */}
              <div className="inline-block px-3 py-1 rounded-full bg-pink-100 text-pink-600 text-xs font-medium mb-6">
                {testimonial.product}
              </div>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="group-hover:scale-110 transition-transform duration-300">
                  <AvatarIllustration
                    name={testimonial.name}
                    colorClass={testimonial.avatarColor}
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-[var(--text-primary)]">{testimonial.name}</h4>
                  <p className="text-sm text-[var(--text-muted)]">{testimonial.role}</p>
                </div>
              </div>

              {/* Hover Accent */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-400 to-purple-400 rounded-b-3xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <button className="btn-secondary inline-flex items-center gap-2 group">
            <span>Xem tất cả đánh giá</span>
            <ArrowRightIcon size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}
