import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import FeaturedProducts from '@/components/FeaturedProducts';
import Categories from '@/components/Categories';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--warm-white)]">
      <Header />
      <main>
        <Hero />
        <Features />
        <FeaturedProducts />
        <Categories />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
