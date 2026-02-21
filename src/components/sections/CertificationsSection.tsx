import { motion } from 'framer-motion';
import { Award, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  credentialId: string;
  image: string;
  color: string;
}

const certifications: Certification[] = [
  {
    id: 'pega-csa',
    name: 'PEGA Certified System Architect',
    issuer: 'Pegasystems',
    date: 'March 2021',
    credentialId: 'PCSA-2021-XXXXX',
    image: '/placeholder.svg',
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'pega-cssa',
    name: 'PEGA Certified Senior System Architect',
    issuer: 'Pegasystems',
    date: 'August 2022',
    credentialId: 'PCSSA-2022-XXXXX',
    image: '/placeholder.svg',
    color: 'from-blue-600 to-purple-600',
  },
  {
    id: 'sap-hana',
    name: 'SAP HANA 2.0 Certification',
    issuer: 'SAP',
    date: 'January 2022',
    credentialId: 'SAP-HANA-XXXXX',
    image: '/placeholder.svg',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    id: 'aws-ccp',
    name: 'AWS Certified Cloud Practitioner',
    issuer: 'Amazon Web Services',
    date: 'June 2023',
    credentialId: 'AWS-CCP-XXXXX',
    image: '/placeholder.svg',
    color: 'from-orange-500 to-yellow-500',
  },
];

export function CertificationsSection() {
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);

  return (
    <section id="certifications" className="py-20 section-transition">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="mood-text-gradient">Certifications</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Professional certifications that validate my expertise across various technologies.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {certifications.map((cert, index) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              onClick={() => setSelectedCert(cert)}
              className="glass rounded-2xl p-6 cursor-pointer group"
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${cert.color} flex items-center justify-center mb-4 group-hover:mood-glow transition-all`}>
                <Award className="w-8 h-8 text-white" />
              </div>

              <h3 className="font-semibold mb-2 group-hover:mood-text-gradient transition-all line-clamp-2">
                {cert.name}
              </h3>

              <p className="text-primary text-sm mb-1">{cert.issuer}</p>
              <p className="text-muted-foreground text-sm">{cert.date}</p>

              <div className="mt-4 flex items-center text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink className="w-3 h-3 mr-1" />
                Click to view details
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Certificate Modal */}
      <Dialog open={!!selectedCert} onOpenChange={() => setSelectedCert(null)}>
        <DialogContent className="glass max-w-md">
          {selectedCert && (
            <div className="text-center">
              <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${selectedCert.color} flex items-center justify-center mx-auto mb-6 mood-glow`}>
                <Award className="w-12 h-12 text-white" />
              </div>

              <h3 className="text-xl font-bold mb-2 mood-text-gradient">
                {selectedCert.name}
              </h3>

              <p className="text-primary mb-1">{selectedCert.issuer}</p>
              <p className="text-muted-foreground text-sm mb-4">{selectedCert.date}</p>

              <div className="glass rounded-xl p-4 mb-4">
                <p className="text-xs text-muted-foreground mb-1">Credential ID</p>
                <p className="font-mono text-sm">{selectedCert.credentialId}</p>
              </div>

              <motion.a
                href="#"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-6 py-3 mood-gradient text-white rounded-full font-semibold"
              >
                <ExternalLink className="w-4 h-4" />
                Verify Credential
              </motion.a>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
