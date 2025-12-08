import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Pizza, 
  Coffee, 
  IceCream, 
  Utensils, 
  Cake, 
  Salad,
  ChevronRight 
} from "lucide-react";
import { Card } from "../../ui/Card";

export const CategoryGrid: React.FC = () => {
  const categories = [
    {
      id: "pizza",
      name: "Pizza",
      icon: Pizza,
      description: "Fresh, hot pizzas",
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
      count: "25+ restaurants"
    },
    {
      id: "coffee",
      name: "Coffee & Tea",
      icon: Coffee,
      description: "Perfect brews",
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
      count: "15+ cafes"
    },
    {
      id: "desserts",
      name: "Desserts",
      icon: IceCream,
      description: "Sweet treats",
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50",
      iconColor: "text-pink-600",
      count: "20+ options"
    },
    {
      id: "indian",
      name: "Indian Cuisine",
      icon: Utensils,
      description: "Authentic flavors",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      count: "30+ restaurants"
    },
    {
      id: "bakery",
      name: "Bakery",
      icon: Cake,
      description: "Fresh baked goods",
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600",
      count: "12+ bakeries"
    },
    {
      id: "healthy",
      name: "Healthy Food",
      icon: Salad,
      description: "Nutritious options",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      count: "18+ options"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Browse by Category
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover your favorite type of cuisine. From pizza to healthy salads, 
            we have something for every taste and mood.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Link to={`/restaurants?category=${category.id}`}>
                <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 overflow-hidden">
                  <div className="relative">
                    {/* Background Gradient */}
                    <div className={`h-32 bg-gradient-to-br ${category.color} relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/10"></div>
                      
                      {/* Icon */}
                      <div className="absolute top-4 left-4">
                        <div className={`w-12 h-12 ${category.bgColor} rounded-xl flex items-center justify-center shadow-lg`}>
                          <category.icon className={`w-6 h-6 ${category.iconColor}`} />
                        </div>
                      </div>

                      {/* Decorative Elements */}
                      <div className="absolute top-4 right-4 opacity-20">
                        <div className="w-16 h-16 bg-white rounded-full"></div>
                      </div>
                      <div className="absolute bottom-4 right-4 opacity-10">
                        <div className="w-8 h-8 bg-white rounded-full"></div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                          {category.name}
                        </h3>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
                      </div>
                      
                      <p className="text-gray-600 mb-3">
                        {category.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          {category.count}
                        </span>
                        <div className="text-sm font-medium text-orange-600 group-hover:text-orange-700">
                          Order Now →
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All Categories CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link to="/restaurants">
            <button className="inline-flex items-center px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition-colors shadow-lg hover:shadow-xl">
              View All Categories
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
