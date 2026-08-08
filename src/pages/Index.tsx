import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import LatestVideos from "@/components/videos/LatestVideos";
import ServicesSection from "@/components/ServicesSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen">
    <Header />
    <HeroSection />
    <LatestVideos />
    <ServicesSection />
    <CTASection />
    <Footer />
  </div>
);

export default Index;
