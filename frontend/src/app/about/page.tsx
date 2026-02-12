import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  HeartIcon,
  ShieldIcon,
  StarIcon,
  SparkleIcon,
  TruckIcon,
  GiftIcon,
  ArrowRightIcon,
  UserIcon,
} from '@/components/icons';

export const metadata: Metadata = {
  title: 'Về chúng tôi - Baby Bliss | Yêu thương từng khoảnh khắc',
  description:
    'Tìm hiểu câu chuyện Baby Bliss - thương hiệu đồ dùng cho bé hàng đầu Việt Nam. Cam kết chất lượng, an toàn và tận tâm phục vụ hơn 50.000 gia đình.',
  openGraph: {
    title: 'Về chúng tôi - Baby Bliss',
    description: 'Tìm hiểu câu chuyện Baby Bliss - thương hiệu đồ dùng cho bé hàng đầu Việt Nam.',
    type: 'website',
    url: '/about',
  },
};

const coreValues = [
  {
    icon: StarIcon,
    title: 'Chất lượng',
    description:
      'Mỗi sản phẩm đều được tuyển chọn kỹ lưỡng, đạt tiêu chuẩn quốc tế về an toàn và chất lượng cho trẻ em.',
    color: 'bg-amber-100 text-amber-500',
  },
  {
    icon: ShieldIcon,
    title: 'An toàn',
    description:
      'An toàn là ưu tiên hàng đầu. Tất cả sản phẩm đều được kiểm nghiệm và chứng nhận không chứa chất độc hại.',
    color: 'bg-blue-100 text-blue-500',
  },
  {
    icon: HeartIcon,
    title: 'Tận tâm',
    description:
      'Đội ngũ tư vấn viên luôn sẵn sàng hỗ trợ, đồng hành cùng ba mẹ trong hành trình chăm sóc bé yêu.',
    color: 'bg-pink-100 text-pink-500',
  },
  {
    icon: SparkleIcon,
    title: 'Sáng tạo',
    description:
      'Không ngừng đổi mới, mang đến những sản phẩm thiết kế xinh xắn, tiện dụng và phù hợp xu hướng.',
    color: 'bg-purple-100 text-purple-500',
  },
];

const stats = [
  { value: '5+', label: 'Năm kinh nghiệm' },
  { value: '50K+', label: 'Khách hàng tin tưởng' },
  { value: '2,000+', label: 'Sản phẩm chất lượng' },
  { value: '4.9/5', label: 'Đánh giá trung bình' },
];

const teamMembers = [
  {
    name: 'Nguyễn Thanh Hà',
    role: 'Nhà sáng lập & CEO',
    bio: 'Với hơn 10 năm kinh nghiệm trong ngành bán lẻ, Hà đã sáng lập Baby Bliss với mong muốn mang đến những sản phẩm tốt nhất cho trẻ em Việt Nam.',
    avatarColor: 'from-pink-300 to-pink-400',
  },
  {
    name: 'Trần Minh Đức',
    role: 'Giám đốc Sản phẩm',
    bio: 'Đức phụ trách tuyển chọn và đảm bảo chất lượng sản phẩm, với tiêu chí an toàn và phù hợp cho từng lứa tuổi.',
    avatarColor: 'from-blue-300 to-blue-400',
  },
  {
    name: 'Lê Phương Anh',
    role: 'Giám đốc Trải nghiệm Khách hàng',
    bio: 'Phương Anh và đội ngũ tư vấn luôn lắng nghe và đồng hành cùng ba mẹ, đảm bảo mọi trải nghiệm đều trọn vẹn.',
    avatarColor: 'from-purple-300 to-purple-400',
  },
];

const commitments = [
  {
    icon: GiftIcon,
    title: 'Đổi trả dễ dàng',
    description: 'Đổi trả miễn phí trong 30 ngày nếu sản phẩm không phù hợp.',
  },
  {
    icon: ShieldIcon,
    title: '100% chính hãng',
    description: 'Cam kết tất cả sản phẩm đều là hàng chính hãng, có đầy đủ giấy tờ chứng nhận.',
  },
  {
    icon: StarIcon,
    title: 'Bảo hành tận tâm',
    description: 'Chính sách bảo hành rõ ràng, hỗ trợ nhanh chóng cho mọi sản phẩm.',
  },
  {
    icon: TruckIcon,
    title: 'Giao hàng nhanh',
    description: 'Giao hàng toàn quốc trong 2-5 ngày. Miễn phí vận chuyển cho đơn từ 500K.',
  },
];

function TeamAvatar({ name, colorClass }: { name: string; colorClass: string }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(-2);

  return (
    <div
      className={`w-20 h-20 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-lg`}
    >
      <span className="text-white font-bold text-xl">{initials}</span>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--warm-white)]">
      <Header />
      <main>
        {/* ===== HERO / MISSION SECTION ===== */}
        <section
          aria-labelledby="about-hero-heading"
          className="relative overflow-hidden gradient-hero animate-gradient"
        >
          {/* Background Decorations */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-pink-300/30 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl"></div>
            <div className="absolute top-20 left-10 text-white/20">
              <SparkleIcon size={48} />
            </div>
            <div className="absolute bottom-20 right-10 text-white/20">
              <HeartIcon size={40} />
            </div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm text-pink-600 font-medium text-sm mb-6">
              <HeartIcon size={16} />
              Về chúng tôi
            </span>
            <h1
              id="about-hero-heading"
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--text-primary)] mb-6 leading-tight"
            >
              Yêu thương từng <span className="text-gradient">khoảnh khắc</span>
            </h1>
            <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
              Baby Bliss ra đời với sứ mệnh mang đến những sản phẩm chất lượng cao, an toàn và đáng
              yêu nhất cho bé yêu của bạn — vì mỗi khoảnh khắc bên bé đều xứng đáng được trọn vẹn.
            </p>
          </div>

          {/* Bottom Wave */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" className="w-full">
              <path
                d="M0 60C240 100 480 20 720 60C960 100 1200 20 1440 60V120H0V60Z"
                fill="var(--warm-white)"
              />
            </svg>
          </div>
        </section>

        {/* ===== BRAND STORY SECTION ===== */}
        <section aria-labelledby="story-heading" className="py-20 bg-[var(--warm-white)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Text Column */}
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100 text-pink-600 font-medium text-sm mb-4">
                  <SparkleIcon size={16} />
                  Câu chuyện
                </span>
                <h2
                  id="story-heading"
                  className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-6"
                >
                  Câu chuyện của chúng tôi
                </h2>
                <div className="space-y-4 text-[var(--text-secondary)] leading-relaxed">
                  <p>
                    Baby Bliss được thành lập vào năm 2021, bắt nguồn từ hành trình làm cha mẹ của
                    chính những người sáng lập. Khi chào đón thiên thần nhỏ đầu tiên, chúng tôi nhận
                    ra rằng việc tìm kiếm những sản phẩm an toàn, chất lượng và có thiết kế đẹp cho
                    bé tại Việt Nam không hề dễ dàng.
                  </p>
                  <p>
                    Từ đó, Baby Bliss ra đời với mong muốn trở thành người bạn đồng hành đáng tin
                    cậy của mọi gia đình. Chúng tôi tuyển chọn kỹ lưỡng từng sản phẩm, từ quần áo,
                    đồ chơi đến các vật dụng chăm sóc, đảm bảo tiêu chuẩn an toàn quốc tế và phù hợp
                    với nhu cầu của ba mẹ Việt.
                  </p>
                  <p>
                    Sau hơn 5 năm phát triển, Baby Bliss tự hào đã phục vụ hơn 50.000 gia đình trên
                    toàn quốc, trở thành thương hiệu đồ dùng cho bé được yêu thích hàng đầu tại Việt
                    Nam.
                  </p>
                </div>
              </div>

              {/* Visual Column */}
              <div className="relative flex items-center justify-center">
                <div className="relative w-full max-w-md aspect-square">
                  {/* Background Circles */}
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-200/60 to-purple-200/60 rounded-3xl blur-sm"></div>
                  <div className="relative z-10 w-full h-full rounded-3xl bg-gradient-to-br from-pink-100 to-white shadow-xl flex items-center justify-center overflow-hidden">
                    <div className="text-center p-8">
                      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center shadow-lg">
                        <HeartIcon size={48} className="text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                        Từ năm 2021
                      </h3>
                      <p className="text-[var(--text-secondary)]">
                        Đồng hành cùng hàng ngàn gia đình Việt
                      </p>
                    </div>
                  </div>
                  {/* Decorative Elements */}
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-pink-200 rounded-full blur-md"></div>
                  <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-purple-200 rounded-full blur-md"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== CORE VALUES SECTION ===== */}
        <section
          aria-labelledby="values-heading"
          className="py-20 bg-white relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-pink-50/50 to-transparent pointer-events-none"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            {/* Section Header */}
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100 text-pink-600 font-medium text-sm mb-4">
                <StarIcon size={16} />
                Giá trị cốt lõi
              </span>
              <h2
                id="values-heading"
                className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4"
              >
                Giá trị mà chúng tôi theo đuổi
              </h2>
              <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
                Bốn giá trị cốt lõi định hình mọi hoạt động và quyết định của Baby Bliss
              </p>
            </div>

            {/* Values Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {coreValues.map((value) => {
                const IconComponent = value.icon;
                return (
                  <div
                    key={value.title}
                    className="group p-6 rounded-2xl bg-white border border-pink-100 hover:border-pink-200 hover:shadow-lg transition-all duration-500 text-center"
                  >
                    <div
                      className={`inline-flex p-4 rounded-xl ${value.color} transition-all duration-300 group-hover:scale-110 mb-4`}
                    >
                      <IconComponent size={28} />
                    </div>
                    <h3 className="font-semibold text-lg text-[var(--text-primary)] mb-2">
                      {value.title}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===== STATS SECTION ===== */}
        <section aria-labelledby="stats-heading" className="py-20 gradient-pink relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2
              id="stats-heading"
              className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-12"
            >
              Những con số ấn tượng
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="p-6">
                  <div className="text-4xl sm:text-5xl font-bold text-pink-500 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-[var(--text-secondary)] font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== TEAM SECTION ===== */}
        <section
          aria-labelledby="team-heading"
          className="py-20 bg-[var(--warm-white)] relative overflow-hidden"
        >
          <div className="absolute top-1/2 left-0 w-72 h-72 bg-pink-100/50 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
          <div className="absolute top-1/2 right-0 w-72 h-72 bg-purple-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            {/* Section Header */}
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100 text-pink-600 font-medium text-sm mb-4">
                <UserIcon size={16} />
                Đội ngũ
              </span>
              <h2
                id="team-heading"
                className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4"
              >
                Những người đứng sau Baby Bliss
              </h2>
              <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
                Đội ngũ đam mê và tận tâm, luôn nỗ lực vì sứ mệnh chung
              </p>
            </div>

            {/* Team Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {teamMembers.map((member) => (
                <div
                  key={member.name}
                  className="group relative p-8 rounded-3xl bg-gradient-to-br from-pink-50 to-white border border-pink-100 hover:shadow-xl transition-all duration-500 text-center overflow-hidden"
                >
                  <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <TeamAvatar name={member.name} colorClass={member.avatarColor} />
                  </div>
                  <h3 className="font-semibold text-lg text-[var(--text-primary)] mb-1">
                    {member.name}
                  </h3>
                  <p className="text-pink-500 font-medium text-sm mb-4">{member.role}</p>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {member.bio}
                  </p>

                  {/* Hover Accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-400 to-purple-400 rounded-b-3xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== COMMITMENTS SECTION ===== */}
        <section
          aria-labelledby="commitments-heading"
          className="py-20 bg-white relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-pink-50/30 to-transparent pointer-events-none"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            {/* Section Header */}
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100 text-pink-600 font-medium text-sm mb-4">
                <ShieldIcon size={16} />
                Cam kết
              </span>
              <h2
                id="commitments-heading"
                className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4"
              >
                Cam kết của chúng tôi
              </h2>
              <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
                Những cam kết vững chắc để bạn an tâm mua sắm tại Baby Bliss
              </p>
            </div>

            {/* Commitments Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {commitments.map((commitment) => {
                const IconComponent = commitment.icon;
                return (
                  <div
                    key={commitment.title}
                    className="group p-6 rounded-2xl bg-gradient-to-br from-pink-50 to-white border border-pink-100 hover:border-pink-200 hover:shadow-lg transition-all duration-500 text-center"
                  >
                    <div className="inline-flex p-4 rounded-xl bg-pink-100 text-pink-500 transition-all duration-300 group-hover:scale-110 mb-4">
                      <IconComponent size={28} />
                    </div>
                    <h3 className="font-semibold text-[var(--text-primary)] mb-2">
                      {commitment.title}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      {commitment.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===== CTA SECTION ===== */}
        <section
          aria-labelledby="cta-heading"
          className="py-20 gradient-pink relative overflow-hidden"
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 text-pink-400/20">
              <SparkleIcon size={64} />
            </div>
            <div className="absolute bottom-10 right-10 text-purple-400/20">
              <HeartIcon size={56} />
            </div>
          </div>

          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2
              id="cta-heading"
              className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4"
            >
              Khám phá thế giới Baby Bliss
            </h2>
            <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-xl mx-auto">
              Hàng ngàn sản phẩm chất lượng đang chờ bạn. Trao cho bé yêu những điều tốt đẹp nhất
              ngay hôm nay!
            </p>
            <Link
              href="/products"
              className="btn-primary inline-flex items-center gap-3 group text-lg"
            >
              <span>Mua sắm ngay</span>
              <ArrowRightIcon
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
