import { motion } from 'framer-motion';
import { Code2, Database, Cloud, Brain, Server, Palette } from 'lucide-react';
import { useMood } from '@/contexts/MoodContext';

const skills = [
  { name: 'Angular/React/TypeScript', level: 95, icon: Code2 },
  { name: 'Python/AI-ML/', level: 90, icon: Brain },
  { name: 'Cloud (AWS/Azure)', level: 85, icon: Cloud },
  { name: 'Databases', level: 88, icon: Database },
  { name: 'Backend (.NET/Node)', level: 85, icon: Server },
  { name: 'UI/UX Design', level: 80, icon: Palette },
];

const coreSkills = [
  'JavaScript', 'TypeScript', 'Python', 'C#', 'Java',
  'React', 'Next.js', 'Node.js', '.NET',
  'TensorFlow', 'PyTorch', 'OpenAI',
  'AWS', 'Azure', 'GCP',
  'PostgreSQL', 'MongoDB', 'Redis',
  'Docker', 'Kubernetes', 'CI/CD',
];

export function AboutSection() {
  const { currentMood } = useMood();

  return (
    <section id="about" className="py-20 section-transition">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            About <span className="mood-text-gradient">Me</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A passionate developer with expertise in building scalable applications
            and implementing AI-driven solutions.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass rounded-2xl p-8"
          >
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start mb-8">
              <motion.div
                className="w-32 h-32 rounded-2xl mood-gradient flex items-center justify-center text-5xl mood-glow"
                whileHover={{ scale: 1.05 }}
              >
                JR
              </motion.div>
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2">Jaswanth Reddy</h3>
                <p className="text-primary mb-2">MS in Computer Science</p>
                <p className="text-muted-foreground text-sm">
                  Governors State University 
                </p>
              </div>
            </div>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              I'm a Computer Science graduate with a passion for creating innovative
              software solutions. My journey spans from AI internships to enterprise
              .NET development, teaching assistance, and cloud computing. I thrive on
              solving complex problems and turning ideas into reality.
            </p>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="glass rounded-xl p-4">
                <div className="text-3xl font-bold mood-text-gradient">3+</div>
                <div className="text-sm text-muted-foreground">Years Experience</div>
              </div>
              <div className="glass rounded-xl p-4">
                <div className="text-3xl font-bold mood-text-gradient">15+</div>
                <div className="text-sm text-muted-foreground">Projects Completed</div>
              </div>
              <div className="glass rounded-xl p-4">
                <div className="text-3xl font-bold mood-text-gradient">4</div>
                <div className="text-sm text-muted-foreground">Certifications</div>
              </div>
              <div className="glass rounded-xl p-4">
                <div className="text-3xl font-bold mood-text-gradient">2</div>
                <div className="text-sm text-muted-foreground">Degrees</div>
              </div>
            </div>
          </motion.div>

          {/* Skills */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass rounded-2xl p-8 mb-8"
            >
              <h3 className="text-xl font-semibold mb-6">Technical Proficiency</h3>
              <div className="space-y-4">
                {skills.map((skill, index) => (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <skill.icon className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">{skill.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{skill.level}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full mood-gradient"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Core Skills Tags */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="glass rounded-2xl p-8"
            >
              <h3 className="text-xl font-semibold mb-6">Core Technologies</h3>
              <div className="flex flex-wrap gap-2">
                {coreSkills.map((skill, index) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={{ scale: 1.1 }}
                    className="px-3 py-1 text-sm bg-muted rounded-full hover:mood-gradient hover:text-white transition-all cursor-default"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
