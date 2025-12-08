import React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Card } from "../../ui/Card";

export const Testimonials: React.FC = () => {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Food Blogger",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "GlobalEats has completely changed how I order food. The variety is amazing and delivery is always on time. My go-to app for all my meals!",
      highlight: "Amazing variety"
    },
    {
      id: 2,
      name: "Mike Chen",
      role: "Software Engineer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "The food quality is consistently excellent. I love how I can track my order in real-time and the customer service is top-notch.",
      highlight: "Excellent quality"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "Marketing Manager",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "Fast delivery, fresh food, and great deals. What more could you ask for? GlobalEats has become my family's favorite food delivery service.",
      highlight: "Fast delivery"
    },
    {
      id: 4,
      name: "David Kim",
      role: "Student",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "As a student, I need affordable and quick food options. GlobalEats delivers both! The student discounts are a huge plus.",
      highlight: "Great value"
    },
    {
      id: 5,
      name: "Lisa Thompson",
      role: "Working Mom",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "Perfect for busy families! The kids love the variety and I love the convenience. Ordering is so easy and the food always arrives hot.",
      highlight: "Perfect for families"
    },
    {
      id: 6,
      name: "Alex Kumar",
      role: "Chef",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "Even as a chef, I appreciate the quality and presentation of food from GlobalEats. It's my go-to when I want to take a break from cooking.",
      highlight: "Chef-approved"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Don't just take our word for it. Here's what real customers have to say 
            about their GlobalEats experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 border-0">
                <div className="relative">
                  {/* Quote Icon */}
                  <div className="absolute -top-2 -left-2 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <Quote className="w-4 h-4 text-orange-600" />
                  </div>

                  {/* Rating */}
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>

                  {/* Testimonial Text */}
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    "{testimonial.text}"
                  </p>

                  {/* Highlight */}
                  <div className="inline-block bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
                    {testimonial.highlight}
                  </div>

                  {/* Author */}
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Overall Rating */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 p-8 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-orange-600 mb-2">4.8</div>
                <div className="flex items-center justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600">Based on 5,000+ reviews</p>
              </div>
              
              <div className="hidden md:block w-px h-16 bg-orange-200"></div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">50,000+</div>
                <p className="text-gray-600">Happy Customers</p>
              </div>
              
              <div className="hidden md:block w-px h-16 bg-orange-200"></div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">25 min</div>
                <p className="text-gray-600">Average Delivery Time</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};
