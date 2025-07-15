'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import dynamic from 'next/dynamic';
import { 
  Package, 
  TrendingUp, 
  Zap, 
  Shield, 
  Globe, 
  ArrowRight,
  BarChart3,
  ShoppingCart,
  Warehouse,
  Users,
  ChevronDown,
  Play,
  Sparkles,
  Star,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InteractiveDemo } from '@/components/landing/InteractiveDemo';
import { ParticleBackground } from '@/components/landing/ParticleBackground';
import { AnimatedLogo } from '@/components/landing/AnimatedLogo';
import { PricingSection } from '@/components/landing/PricingSection';

// 3D Card Component
const Card3D = ({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateXValue = (y - centerY) / 10;
    const rotateYValue = (centerX - x) / 10;
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transform-gpu transition-transform duration-200 ${className}`}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      }}
    >
      {children}
    </motion.div>
  );
};

// Floating Elements Component (moved to separate file)
// Dynamic import with SSR disabled to prevent hydration errors
const DynamicFloatingElements = dynamic(
  () => import('@/components/landing/FloatingElements').then(mod => mod.FloatingElements),
  { 
    ssr: false,
    loading: () => null
  }
);

// Stats Counter Component
const StatsCounter = ({ end, duration = 2, suffix = "" }: { end: number, duration?: number, suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref);

  useEffect(() => {
    if (isInView) {
      let startTime: number;
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
        setCount(Math.floor(progress * end));
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [isInView, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const features = [
    {
      icon: Package,
      title: "Smart Inventory",
      description: "AI-powered stock management with predictive analytics",
      color: "from-green-400 to-emerald-600"
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Live dashboards with actionable business insights",
      color: "from-blue-400 to-cyan-600"
    },
    {
      icon: ShoppingCart,
      title: "Order Management",
      description: "Streamlined order processing and fulfillment",
      color: "from-purple-400 to-pink-600"
    },
    {
      icon: Warehouse,
      title: "Multi-location",
      description: "Manage inventory across multiple warehouses",
      color: "from-orange-400 to-red-600"
    }
  ];

  const stats = [
    { label: "Active Users", value: 15000, suffix: "+" },
    { label: "Products Managed", value: 2500000, suffix: "M+" },
    { label: "Orders Processed", value: 850000, suffix: "K+" },
    { label: "Uptime", value: 99.9, suffix: "%" }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <ParticleBackground />
      <DynamicFloatingElements />
      
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-green-500/20"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
            <AnimatedLogo size="sm" />
            <span className="text-xl font-bold">NextPMS</span>
          </motion.div>
          
          <div className="hidden md:flex items-center space-x-8">
            {['Features', 'Pricing', 'About', 'Contact'].map((item) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-gray-300 hover:text-green-400 transition-colors"
                whileHover={{ y: -2 }}
              >
                {item}
              </motion.a>
            ))}
          </div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button className="bg-gradient-to-r from-green-400 to-emerald-600 text-black hover:from-green-500 hover:to-emerald-700" asChild>
              <a href="/dashboard">Get Started</a>
            </Button>
          </motion.div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <motion.div style={{ y, opacity }} className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        </motion.div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mb-4">
                <Sparkles className="w-3 h-3 mr-1" />
                Next Generation PMS
              </Badge>
            </motion.div>

            <motion.h1 
              className="text-6xl lg:text-7xl font-bold leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              The <span className="bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">Product</span>
              <br />
              Management
              <br />
              <span className="text-gray-400">Revolution</span>
            </motion.h1>

            <motion.p 
              className="text-xl text-gray-300 max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Transform your business with AI-powered inventory management, 
              real-time analytics, and seamless order processing.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-green-400 to-emerald-600 text-black hover:from-green-500 hover:to-emerald-700 group"
                asChild
              >
                <a href="/dashboard">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-green-500/30 text-green-400 hover:bg-green-500/10 group"
              >
                <Play className="mr-2 w-4 h-4" />
                Watch Demo
              </Button>
            </motion.div>

            <motion.div 
              className="flex items-center space-x-8 pt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {stats.slice(0, 2).map((stat, index) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    <StatsCounter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* 3D Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <Card3D className="relative">
              <div className="bg-gradient-to-br from-gray-900 to-black border border-green-500/20 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Dashboard Overview</h3>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { label: "Products", value: "1,234", change: "+12%" },
                    { label: "Orders", value: "856", change: "+8%" },
                    { label: "Revenue", value: "$45K", change: "+15%" },
                    { label: "Stock", value: "23", change: "-5%" }
                  ].map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="bg-gray-800/50 rounded-lg p-3"
                    >
                      <div className="text-sm text-gray-400">{item.label}</div>
                      <div className="text-xl font-bold">{item.value}</div>
                      <div className="text-xs text-green-400">{item.change}</div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="h-32 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg flex items-end justify-between p-4">
                  {[40, 65, 45, 80, 55, 90, 70].map((height, index) => (
                    <motion.div
                      key={index}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                      className="bg-gradient-to-t from-green-400 to-emerald-600 w-6 rounded-t"
                    />
                  ))}
                </div>
              </div>
            </Card3D>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <ChevronDown className="w-6 h-6 text-green-400" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold mb-6">
              Everything you need to
              <br />
              <span className="bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
                scale your business
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              From inventory management to analytics, NextPMS provides all the tools 
              you need to run a successful product business.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card3D key={feature.title} delay={index * 0.1}>
                <div className="bg-gradient-to-br from-gray-900 to-black border border-green-500/20 rounded-2xl p-8 h-full group hover:border-green-500/40 transition-colors">
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </Card3D>
            ))}
          </div>
        </div>
      </section>

      {/* Process Flow Section */}
      <section className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold mb-6">
              Seamless workflow
              <br />
              <span className="bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
                from start to finish
              </span>
            </h2>
          </motion.div>

          <div className="relative">
            {/* Flow Line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-green-400 to-emerald-600 transform -translate-y-1/2 hidden lg:block" />
            
            <div className="grid lg:grid-cols-4 gap-8">
              {[
                { icon: Package, title: "Add Products", desc: "Import and manage your product catalog" },
                { icon: Warehouse, title: "Track Inventory", desc: "Monitor stock levels across locations" },
                { icon: ShoppingCart, title: "Process Orders", desc: "Handle orders with automated workflows" },
                { icon: TrendingUp, title: "Analyze Performance", desc: "Get insights with real-time analytics" }
              ].map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="relative text-center"
                >
                  <div className="bg-gradient-to-br from-gray-900 to-black border border-green-500/20 rounded-2xl p-8 relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <step.icon className="w-8 h-8 text-black" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                    <p className="text-gray-400">{step.desc}</p>
                  </div>
                  
                  {/* Step Number */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-black font-bold text-sm z-20">
                    {index + 1}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold mb-6">
              Experience NextPMS
              <br />
              <span className="bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
                in action
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Try our interactive demo to see how NextPMS can transform your 
              product management workflow.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <InteractiveDemo />
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-32 px-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-5xl font-bold text-green-400 mb-2">
                  <StatsCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold mb-6">
              Trusted by
              <br />
              <span className="bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
                industry leaders
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Operations Manager",
                company: "TechCorp",
                content: "NextPMS transformed our inventory management. We reduced stock-outs by 80% and improved efficiency dramatically.",
                rating: 5
              },
              {
                name: "Michael Chen",
                role: "CEO",
                company: "GrowthCo",
                content: "The real-time analytics helped us make data-driven decisions that increased our revenue by 45% in just 6 months.",
                rating: 5
              },
              {
                name: "Emily Rodriguez",
                role: "Supply Chain Director",
                company: "LogiFlow",
                content: "Multi-location inventory tracking has never been easier. NextPMS simplified our complex operations across 15 warehouses.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card3D key={testimonial.name} delay={index * 0.1}>
                <div className="bg-gradient-to-br from-gray-900 to-black border border-green-500/20 rounded-2xl p-8 h-full">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  <p className="text-gray-300 mb-6 italic">"{testimonial.content}"</p>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full flex items-center justify-center mr-4">
                      <span className="text-black font-bold">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-gray-400">
                        {testimonial.role} at {testimonial.company}
                      </div>
                    </div>
                  </div>
                </div>
              </Card3D>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl font-bold mb-6">
              Ready to transform
              <br />
              <span className="bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
                your business?
              </span>
            </h2>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Join thousands of businesses already using NextPMS to streamline 
              their operations and boost productivity.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-green-400 to-emerald-600 text-black hover:from-green-500 hover:to-emerald-700 group"
                asChild
              >
                <a href="/dashboard">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-green-500/30 text-green-400 hover:bg-green-500/10"
              >
                Schedule Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-green-500/20 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <AnimatedLogo size="sm" />
              <span className="text-xl font-bold">NextPMS</span>
            </div>
            
            <div className="text-gray-400 text-sm">
              © 2024 NextPMS. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}