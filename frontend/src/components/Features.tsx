'use client';

import { TruckIcon, ShieldIcon, GiftIcon, PhoneIcon } from './icons';

const features = [
  {
    icon: TruckIcon,
    title: 'Miễn phí vận chuyển',
    description: 'Cho đơn hàng từ 500.000đ',
    color: 'bg-pink-100 text-pink-500',
  },
  {
    icon: ShieldIcon,
    title: 'An toàn tuyệt đối',
    description: 'Sản phẩm được chứng nhận',
    color: 'bg-blue-100 text-blue-500',
  },
  {
    icon: GiftIcon,
    title: 'Quà tặng hấp dẫn',
    description: 'Nhiều khuyến mãi độc quyền',
    color: 'bg-purple-100 text-purple-500',
  },
  {
    icon: PhoneIcon,
    title: 'Hỗ trợ 24/7',
    description: 'Tư vấn tận tâm mọi lúc',
    color: 'bg-green-100 text-green-500',
  },
];

export default function Features() {
  return (
    <section className="py-16 bg-white relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-pink-50/50 to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-white border border-pink-100 hover:border-pink-200 hover:shadow-lg transition-all duration-500 animate-fade-in-up"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  opacity: 0,
                  animationFillMode: 'forwards',
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-xl ${feature.color} transition-all duration-300 group-hover:scale-110`}
                  >
                    <IconComponent size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)] mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-[var(--text-muted)]">{feature.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
