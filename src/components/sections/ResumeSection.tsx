import { motion } from 'framer-motion';
import { Briefcase, GraduationCap, Calendar, MapPin, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  period: string;
  description: string;
  details: string[];
  technologies: string[];
  type: 'work' | 'education';
}

const experiences: Experience[] = [
  {
  id: 'fl-dor',
  title: 'Computer Systems Business Analyst',
  company: 'Florida Department of Revenue (DOR)',
  location: 'Tallahassee, FL',
  period: 'Nov 2025 - Present',
  description: 'Supporting enterprise government financial systems by analyzing business workflows, validating system behavior, and improving operational efficiency and compliance.',
  details: [
    'Analyzed end-to-end payment processing workflows including posting, clearing, distribution, disbursement, and exception handling to ensure compliance with program rules and audit requirements.',
    'Investigated production issues and payment exceptions by reviewing system logs, control locks, and workflow triggers; documented findings and recommended fixes.',
    'Gathered and documented business requirements (BRDs/user stories), created process flows, and translated stakeholder needs into actionable technical requirements.',
    'Validated business logic for work request creation (duplicate prevention, threshold rules, final status checks, batch-driven processing) across multiple scenario types.',
    'Executed functional testing and regression testing, prepared test evidence, and coordinated UAT with stakeholders to confirm enhancements before release.',
    'Created dashboards/status reports for leadership and cross-functional teams to track defect trends, progress, and delivery timelines.',
    'Worked closely with developers, QA, and program teams to support releases, change requests, and post-deployment verification.'
  ],
  technologies: ['Business Analysis', 'SQL', 'UAT', 'Process Mapping', 'Testing', 'Government Systems'],
  type: 'work',
},
  {
    id: 'valqari',
    title: 'AI/ML Intern',
    company: 'Valqari',
    location: 'Chicago, IL',
    period: 'May 2024 - Present',
    description: 'Working on cutting-edge drone delivery AI systems and computer vision applications.',
    details: [
      'Developed computer vision models for autonomous drone navigation and obstacle detection',
      'Implemented real-time object tracking using YOLOv8 and custom CNN architectures',
      'Built predictive maintenance ML models reducing drone downtime by 35%',
      'Created data pipelines for processing aerial imagery and telemetry data',
    ],
    technologies: ['Python', 'TensorFlow', 'OpenCV', 'AWS', 'Docker'],
    type: 'work',
  },
  {
    id: 'dotnet',
    title: '.NET Developer',
    company: 'Enterprise Solutions',
    location: 'Kansas City, MO',
    period: 'Aug 2023 - May 2024',
    description: 'Full-stack development of enterprise applications using .NET and React.',
    details: [
      'Architected and developed RESTful APIs using ASP.NET Core',
      'Built responsive front-end interfaces with React and TypeScript',
      'Implemented microservices architecture improving system scalability',
      'Optimized database queries reducing response times by 40%',
    ],
    technologies: ['.NET Core', 'React', 'SQL Server', 'Azure', 'Redis'],
    type: 'work',
  },
  {
    id: 'ta',
    title: 'Graduate Teaching Assistant',
    company: 'Governors State University',
    location: 'Chicago, IL',
    period: 'Aug 2023 - May 2025',
    description: 'Assisted in teaching undergraduate computer science courses.',
    details: [
      'Conducted lab sessions for Data Structures and Algorithms course',
      'Graded assignments and provided detailed feedback to 50+ students',
      'Held office hours and tutoring sessions for struggling students',
      'Created supplementary learning materials and coding exercises',
    ],
    technologies: ['Java', 'Python', 'Data Structures', 'Algorithms'],
    type: 'work',
  },
  {
    id: 'capgemini',
    title: 'Software Engineer',
    company: 'Capgemini',
    location: 'Hyderabad, India',
    period: 'Jan 2021 - Jul 2023',
    description: 'Enterprise software development and PEGA implementations.',
    details: [
      "Developed enterprise-scale web applications for a GE client using Angular and TypeScript, delivering modular, responsive, and high-performance user interfaces.",
      "Implemented Java (Spring Boot) backend services and REST APIs to handle core business logic and secure data processing.",
      "Designed and optimized MySQL databases, including schema design, complex queries, and performance tuning for large datasets.",
      "Integrated frontend and backend systems using RESTful services, ensuring seamless data flow and application reliability.",
      "Implemented automated unit and integration testing, reducing QA and regression testing time by approximately 50%.",
      "Collaborated with cross-functional teams to deliver enterprise integrations and supported production deployments.",
      "Conducted code reviews, enforced best practices, and mentored junior developers to improve overall code quality.",
    ],
    technologies: ['PEGA', 'Java', 'SAP', 'Salesforce', 'REST APIs'],
    type: 'work',
  },
  {
    id: 'ms',
    title: 'MS in Computer Science',
    company: 'Governors State University',
    location: 'Chicago, IL',
    period: 'Aug 2023 - Jul 2024',
    description: 'Graduate studies focusing on AI/ML and Cloud Computing.',
    details: [
      'GPA: 3.9/4.0',
      'Coursework: Machine Learning, Deep Learning, Cloud Architecture',
      'Research: Computer Vision applications in autonomous systems',
      'Graduate Teaching Assistant for CS department',
    ],
    technologies: ['AI/ML', 'Cloud Computing', 'Research', 'Teaching'],
    type: 'education',
  },
  {
    id: 'btech',
    title: 'B.Tech in Computer Science',
    company: 'Lovely Professional University',
    location: 'Punjab, India',
    period: 'Aug 2017 - May 2021',
    description: 'Undergraduate degree with focus on software engineering.',
    details: [
      'GPA: 8.5/10',
      'Coursework: Software Engineering, Database Systems, Web Development',
      'Final Year Project: Smart Attendance System using Face Recognition',
      'Active member of Coding Club and Hackathon organizer',
    ],
    technologies: ['Programming', 'Software Engineering', 'Database', 'Web Dev'],
    type: 'education',
  },
];

export function ResumeSection() {
  const [selectedExp, setSelectedExp] = useState<Experience | null>(null);

  const workExperiences = experiences.filter(e => e.type === 'work');
  const education = experiences.filter(e => e.type === 'education');

  return (
    <section id="resume" className="py-20 section-transition">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            My <span className="mood-text-gradient">Journey</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A timeline of my professional experience and educational background.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Work Experience */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="p-3 mood-gradient rounded-xl">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Work Experience</h3>
            </motion.div>

            <div className="space-y-6">
              {workExperiences.map((exp, index) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedExp(exp)}
                  className="glass rounded-2xl p-6 cursor-pointer hover:mood-glow transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold group-hover:mood-text-gradient transition-all">
                        {exp.title}
                      </h4>
                      <p className="text-primary">{exp.company}</p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {exp.period}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {exp.location}
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm mb-4">{exp.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {exp.technologies.slice(0, 3).map(tech => (
                      <span
                        key={tech}
                        className="px-2 py-1 text-xs bg-muted rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                    {exp.technologies.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-muted rounded-full">
                        +{exp.technologies.length - 3}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="p-3 mood-gradient rounded-xl">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Education</h3>
            </motion.div>

            <div className="space-y-6">
              {education.map((exp, index) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedExp(exp)}
                  className="glass rounded-2xl p-6 cursor-pointer hover:mood-glow transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold group-hover:mood-text-gradient transition-all">
                        {exp.title}
                      </h4>
                      <p className="text-primary">{exp.company}</p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {exp.period}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {exp.location}
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm mb-4">{exp.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {exp.technologies.map(tech => (
                      <span
                        key={tech}
                        className="px-2 py-1 text-xs bg-muted rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedExp} onOpenChange={() => setSelectedExp(null)}>
        <DialogContent className="glass max-w-2xl">
          {selectedExp && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl mood-text-gradient">
                  {selectedExp.title}
                </DialogTitle>
                <p className="text-primary">{selectedExp.company}</p>
              </DialogHeader>

              <div className="flex gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {selectedExp.period}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {selectedExp.location}
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <h4 className="font-semibold">Key Achievements</h4>
                <ul className="space-y-2">
                  {selectedExp.details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-2 text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Technologies Used</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedExp.technologies.map(tech => (
                    <span
                      key={tech}
                      className="px-3 py-1 text-sm mood-gradient text-white rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
