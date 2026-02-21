import { MoodProvider } from '../contexts/MoodContext';
import { Navigation } from '@/components/Navigation';
import { HeroSection } from '@/components/sections/HeroSection';
import { AboutSection } from '@/components/sections/AboutSection';
import { ResumeSection } from '@/components/sections/ResumeSection';
import { CertificationsSection } from '@/components/sections/CertificationsSection';
import { ContactSection } from '@/components/sections/ContactSection';
import { AIControlPanel } from '@/components/AIControlPanel';
import { Footer } from '@/components/Footer';

const Index = () => {
  return (
    <MoodProvider>
      <div className="min-h-screen bg-background transition-colors duration-500">
        <Navigation />
        <main>
          <HeroSection />
          <AboutSection />
          <ResumeSection />
          <CertificationsSection />
          <ContactSection />
        </main>
        <Footer />
        <AIControlPanel />
      </div>
    </MoodProvider>
  );
};

export default Index;
