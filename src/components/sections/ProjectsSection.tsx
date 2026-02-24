import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Play, X, ChevronRight, Cpu, Code2, Eye, Layers } from 'lucide-react';
import { useMood } from '@/contexts/MoodContext';
import yoloTraining from '@/assets/yolo-training.png';
import comparisions from '@/assets/comparisions.png';
import detectionLive from '@/assets/detection-live.jpg';
import droneVideo from '@/assets/DronePathWithCameraView.mp4';
import picamVideo from '@/assets/Picam_with_yoloTinyV4.mp4';
import minuteClinicVideo from '@/assets/minuteClinic.mp4';

interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  icon: typeof Cpu;
  images: { src: string; caption: string }[];
  videoSlots: { label: string; videoSrc?: string }[];
  highlights: string[];
  color: string;
}

const projects: Project[] = [
  {
    id: 'valqari',
    title: 'Valqari AI Intern',
    subtitle: 'YOLO Object Detection on Raspberry Pi',
    description:
      'Built a real-time DCC detection system using YOLOv4-Tiny on a Raspberry Pi 5. Collected custom datasets, annotated with CVAT, trained multiple YOLO variants, and deployed for live inference.',
    tags: ['YOLOv8', 'Raspberry Pi', 'CVAT', 'Python', 'ONNX', 'Computer Vision'],
    icon: Eye,
    images: [
      { src: yoloTraining, caption: 'Data collection & CVAT annotation pipeline' },
      { src: comparisions, caption: 'Model performance comparison table' },
      { src: detectionLive, caption: 'Live DCC detection with bounding boxes' },
    ],
    videoSlots: [
      { label: 'Drone Path with Camera View', videoSrc: droneVideo },
      { label: 'Pi Camera YOLO Detection', videoSrc: picamVideo },
    ],
    highlights: [
      'Custom dataset from real-world environments',
      'YOLOv4-Tiny achieved ~7-8 FPS on Pi 5',
      'Bounding box annotation with CVAT',
      'Exported to ONNX for edge deployment',
    ],
    color: 'from-orange-500 to-amber-500',
  },
  {
    id: 'minuteclinic',
    title: 'MinuteClinic',
    subtitle: '.NET Healthcare Management System',
    description:
      'A comprehensive healthcare management application built with .NET framework featuring appointment scheduling, patient records, and clinic workflow automation.',
    tags: ['.NET', 'C#', 'SQL Server', 'REST API', 'Healthcare'],
    icon: Code2,
    images: [],
    videoSlots: [{ label: 'Project Walkthrough', videoSrc: minuteClinicVideo }],
    highlights: [
      'Full-stack .NET application',
      'Patient record management',
      'Appointment scheduling system',
      'Secure authentication & authorization',
    ],
    color: 'from-blue-500 to-cyan-500',
  },
];

function ImageGallery({ images }: { images: Project['images'] }) {
  const [selected, setSelected] = useState(0);

  if (images.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Main image */}
      <motion.div
        className="relative overflow-hidden rounded-xl aspect-video cursor-pointer group"
        layoutId={`gallery-main`}
        onClick={() => setSelected((s) => (s + 1) % images.length)}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={selected}
            src={images[selected].src}
            alt={images[selected].caption}
            className="w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <motion.p
          className="absolute bottom-3 left-3 right-3 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {images[selected].caption}
        </motion.p>
      </motion.div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((img, i) => (
            <motion.button
              key={i}
              onClick={() => setSelected(i)}
              className={`relative flex-1 aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                i === selected ? 'border-primary ring-2 ring-primary/30' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <img src={img.src} alt={img.caption} className="w-full h-full object-cover" />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}

function VideoSlot({ slot }: { slot: { label: string; videoSrc?: string } }) {
  const [playing, setPlaying] = useState(false);

  if (slot.videoSrc) {
    return (
      <motion.div
        className="relative aspect-video rounded-xl overflow-hidden bg-muted"
        whileHover={{ scale: 1.01 }}
      >
        {playing ? (
          <video
            src={slot.videoSrc}
            controls
            autoPlay
            className="w-full h-full object-cover"
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            className="w-full h-full flex flex-col items-center justify-center gap-3 group"
          >
            <motion.div
              className="w-16 h-16 rounded-full mood-gradient flex items-center justify-center mood-glow"
              whileHover={{ scale: 1.1 }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Play className="w-6 h-6 text-white ml-1" />
            </motion.div>
            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              {slot.label}
            </span>
          </button>
        )}
      </motion.div>
    );
  }

  // Placeholder for videos not yet uploaded
  return (
    <motion.div
      className="relative aspect-video rounded-xl overflow-hidden border-2 border-dashed border-muted-foreground/20 bg-muted/30"
      whileHover={{ borderColor: 'hsl(var(--primary) / 0.5)' }}
    >
      <div className="w-full h-full flex flex-col items-center justify-center gap-3">
        <motion.div
          className="w-14 h-14 rounded-full bg-muted flex items-center justify-center"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        >
          <Play className="w-5 h-5 text-muted-foreground ml-0.5" />
        </motion.div>
        <span className="text-sm font-medium text-muted-foreground">{slot.label}</span>
        <span className="text-xs text-muted-foreground/60">Video coming soon</span>
      </div>
    </motion.div>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = project.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: index * 0.2 }}
      className="relative"
    >
      {/* Timeline connector */}
      <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent hidden lg:block" />

      <motion.div
        className="glass rounded-2xl overflow-hidden"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div
          className="relative p-6 pb-4 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          {/* Accent bar */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${project.color}`} />

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <motion.div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${project.color} flex items-center justify-center shrink-0`}
                whileHover={{ rotate: 5 }}
              >
                <Icon className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h3 className="text-xl font-bold">{project.title}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{project.subtitle}</p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: expanded ? 90 : 0 }}
              className="mt-1 text-muted-foreground"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-4">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 text-xs rounded-full bg-muted text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Expanded content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 space-y-6">
                <p className="text-muted-foreground leading-relaxed">{project.description}</p>

                {/* Images */}
                {project.images.length > 0 && <ImageGallery images={project.images} />}

                {/* Highlights */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    Key Highlights
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {project.highlights.map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        {h}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Videos */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Play className="w-4 h-4 text-primary" />
                    Demo Videos
                  </h4>
                  <div className={`grid gap-3 ${project.videoSlots.length > 1 ? 'sm:grid-cols-2' : ''}`}>
                    {project.videoSlots.map((slot, i) => (
                      <VideoSlot key={i} slot={slot} />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export function ProjectsSection() {
  return (
    <section id="projects" className="py-20 section-transition">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Featured <span className="mood-text-gradient">Projects</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Hands-on projects showcasing AI, computer vision, and full-stack development.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-8">
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
