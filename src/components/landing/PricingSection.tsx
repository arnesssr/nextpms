'use client';

import { motion } from 'framer-motion';
import { Check, Zap, Crown, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Card3D = ({ children, className = "", delay = 0, featured = false }: { 
  children: React.ReactNode, 
  className?: string, 
  delay?: number,
  featured?: boolean 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ 
        y: -10,
        transition: { duration: 0.2 }
      }}
      className={`transform-gpu transition-all duration-200 ${className} ${
        featured ? 'scale-105 z-10' : ''
      }`}
    >
      {children}
    </motion.div>
  );
};

export const PricingSection = () => {
  const plans = [
    {
      name: "Starter",
      icon: Zap,
      price: 29,
      period: "month",
      description: "Perfect for small businesses getting started",
      features: [
        "Up to 1,000 products",
        "Basic inventory tracking",
        "Order management",
        "Email support",
        "Mobile app access",
        "Basic analytics"
      ],
      buttonText: "Start Free Trial",
      popular: false,
      color: "from-blue-400 to-cyan-600"
    },
    {
      name: "Professional",
      icon: Crown,
      price: 79,
      period: "month",
      description: "Advanced features for growing businesses",
      features: [
        "Up to 10,000 products",
        "Advanced inventory tracking",
        "Multi-location support",
        "Priority support",
        "Advanced analytics",
        "API access",
        "Custom integrations",
        "Automated workflows"
      ],
      buttonText: "Get Started",
      popular: true,
      color: "from-green-400 to-emerald-600"
    },
    {
      name: "Enterprise",
      icon: Rocket,
      price: 199,
      period: "month",
      description: "Complete solution for large organizations",
      features: [
        "Unlimited products",
        "Enterprise inventory management",
        "Unlimited locations",
        "24/7 dedicated support",
        "Custom analytics",
        "White-label solution",
        "Advanced security",
        "Custom development",
        "SLA guarantee"
      ],
      buttonText: "Contact Sales",
      popular: false,
      color: "from-purple-400 to-pink-600"
    }
  ];

  return (
    <section className="py-32 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl font-bold mb-6">
            Choose your
            <br />
            <span className="bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
              perfect plan
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Start with a free trial, then choose the plan that scales with your business.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <Card3D 
                key={plan.name} 
                delay={index * 0.1}
                featured={plan.popular}
                className="relative"
              >
                <div className={`bg-gradient-to-br from-gray-900 to-black border rounded-2xl p-8 h-full relative overflow-hidden ${
                  plan.popular 
                    ? 'border-green-500/40 shadow-2xl shadow-green-500/20' 
                    : 'border-green-500/20'
                }`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-green-400 to-emerald-600 text-black">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <div className="flex items-center mb-6">
                    <div className={`w-12 h-12 bg-gradient-to-r ${plan.color} rounded-lg flex items-center justify-center mr-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{plan.name}</h3>
                      <p className="text-gray-400 text-sm">{plan.description}</p>
                    </div>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-gray-400 ml-2">/{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.li
                        key={feature}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + featureIndex * 0.1 }}
                        className="flex items-center"
                      >
                        <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>

                  <Button 
                    className={`w-full ${
                      plan.popular
                        ? 'bg-gradient-to-r from-green-400 to-emerald-600 text-black hover:from-green-500 hover:to-emerald-700'
                        : 'bg-gray-800 text-white hover:bg-gray-700'
                    }`}
                    size="lg"
                  >
                    {plan.buttonText}
                  </Button>

                  {/* Background decoration */}
                  <div className={`absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-r ${plan.color} rounded-full opacity-10 blur-3xl`} />
                </div>
              </Card3D>
            );
          })}
        </div>

        {/* FAQ or additional info */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="text-gray-400 mb-4">
            All plans include a 14-day free trial. No credit card required.
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500">
            <span>✓ Cancel anytime</span>
            <span>✓ 99.9% uptime SLA</span>
            <span>✓ SOC 2 compliant</span>
            <span>✓ GDPR ready</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};