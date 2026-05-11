import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { CATEGORIES } from '@/data/mockData';
import { CheckCircle, ShieldCheck, Zap, Users } from 'lucide-react';
import { motion } from 'motion/react';

export function Landing() {
  return (
    <div className="flex flex-col space-y-16 pb-20">
      {/* Hero Section */}
      <section className="pt-12 text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 px-4">
            Solucioná tus problemas, <span className="text-blue-600">encontrá a tu experto.</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto px-4">
            La plataforma líder en Buenos Aires para conectar especialistas verificados con clientes que necesitan soluciones hoy mismo.
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center px-4"
        >
          <Link to="/register">
            <Button size="lg" className="w-full sm:w-auto">
              Empezar ahora
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Tengo una cuenta
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Categories Grid */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold px-4">¿Qué estás buscando?</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
          {CATEGORIES.slice(0, 8).map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="flex flex-col items-center justify-center py-6 hover:border-blue-500 transition-all cursor-pointer">
                <CategoryIcon name={cat.icono} size={32} className="text-blue-600 mb-3" />
                <span className="font-semibold text-sm">{cat.nombre}</span>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-blue-600 rounded-3xl p-8 text-white mx-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureItem 
            icon={<ShieldCheck size={32} />} 
            title="Especialistas Verificados" 
            desc="Validamos la identidad y antecedentes de cada profesional."
          />
          <FeatureItem 
            icon={<Zap size={32} />} 
            title="Respuesta Rápida" 
            desc="Recibí propuestas en minutos para tus urgencias."
          />
          <FeatureItem 
            icon={<CheckCircle size={32} />} 
            title="Garantía de Satisfacción" 
            desc="Tu pago está protegido hasta que el trabajo esté terminado."
          />
        </div>
      </section>

      {/* Specialist CTA */}
      <section className="bg-gray-100 rounded-3xl p-8 mx-4 text-center space-y-4">
        <h2 className="text-2xl font-bold">¿Sos especialista?</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Unite a la red más grande de prestadores de servicios en Buenos Aires y hacé crecer tu negocio.
        </p>
        <Link to="/register?role=especialista">
          <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
            Registrarme como especialista
          </Button>
        </Link>
      </section>
    </div>
  );
}

function FeatureItem({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="flex flex-col items-center text-center space-y-2">
      <div className="p-3 bg-white/10 rounded-2xl mb-2">
        {icon}
      </div>
      <h3 className="font-bold text-lg">{title}</h3>
      <p className="text-blue-100 text-sm">{desc}</p>
    </div>
  );
}
