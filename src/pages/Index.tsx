import { MoodProvider } from '../contexts/MoodContext';
import { Navigation } from '@/components/Navigation';
import { HeroSection } from '@/components/sections/HeroSection';
import { AboutSection } from '@/components/sections/AboutSection';
import { ResumeSection } from '@/components/sections/ResumeSection';
import { CertificationsSection } from '@/components/sections/CertificationsSection';
import { ContactSection } from '@/components/sections/ContactSection';
import { AIControlPanel } from '@/components/AIControlPanel';
import { Footer } from '@/components/Footer';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { SkillsShowcase, AIFeatureSpotlight, SkipLink } from '@/components/sections/SkillsShowcase';

const Index = () => {
  return (
    <MoodProvider>
      <div className="min-h-screen bg-background transition-colors duration-500">
        <SkipLink />
        <Navigation />
        <main>
          <HeroSection />
          <AboutSection />
          <SkillsShowcase />
          <ResumeSection />
          <ProjectsSection />
          <CertificationsSection />
          <ContactSection />
        </main>
        <Footer />
        <AIControlPanel />
        <AIFeatureSpotlight />
      </div>
    </MoodProvider>
  );
};

export default Index;
