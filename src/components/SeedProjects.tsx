import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Database } from 'lucide-react';

const dummyProjects = [
  {
    title: "E-Commerce Platform",
    description: `# E-Commerce Platform

## Overview
A modern, full-stack e-commerce platform built with **React** and **Node.js**. This platform provides a seamless shopping experience with advanced features for both customers and administrators.

## Key Features

### Customer Features
- 🛒 **Shopping Cart** - Real-time cart updates with persistent storage
- 💳 **Secure Checkout** - Integrated with Stripe for payment processing
- 📦 **Order Tracking** - Real-time order status updates
- ⭐ **Product Reviews** - Rating and review system for products
- 🔍 **Advanced Search** - Filter by category, price, brand, and more

### Admin Dashboard
- 📊 **Analytics Dashboard** - Sales metrics and customer insights
- 📝 **Inventory Management** - Stock tracking and alerts
- 👥 **Customer Management** - User profiles and order history
- 🏷️ **Dynamic Pricing** - Discount codes and promotional campaigns

## Technical Stack

### Frontend
- React 18 with TypeScript
- Redux Toolkit for state management
- Tailwind CSS for styling
- React Query for data fetching

### Backend
- Node.js with Express
- PostgreSQL database
- Redis for caching
- JWT authentication

## Performance Metrics
- **Page Load Time**: < 2 seconds
- **API Response Time**: < 200ms
- **Uptime**: 99.9%
- **Mobile Score**: 95/100 (Lighthouse)

## Deployment
Deployed on AWS with:
- EC2 instances for backend
- RDS for database
- CloudFront CDN
- S3 for static assets`,
    category_name: "Web Development",
    image_url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
    demo_url: "https://demo-ecommerce.example.com",
    github_url: "https://github.com/example/ecommerce-platform",
    featured: true,
    tags: ["React", "Node.js", "PostgreSQL", "Stripe", "AWS", "TypeScript", "Redux"]
  },
  {
    title: "AI-Powered Task Manager",
    description: `# AI-Powered Task Manager

## Project Overview
An intelligent task management application that uses **machine learning** to help users prioritize and organize their work more effectively.

## Core Features

### AI Capabilities
- 🤖 **Smart Prioritization** - ML algorithms analyze task patterns
- 📅 **Intelligent Scheduling** - Automatic time slot suggestions
- 🎯 **Goal Tracking** - Progress visualization and predictions
- 💡 **Insights & Analytics** - Productivity patterns and recommendations

### Collaboration Tools
- 👥 Team workspaces with role-based permissions
- 💬 Real-time chat and comments
- 📎 File sharing and version control
- 📊 Team performance dashboards

## Technology Stack

\`\`\`javascript
const techStack = {
  frontend: {
    framework: "Next.js 14",
    ui: "Shadcn UI",
    state: "Zustand",
    realtime: "Socket.io"
  },
  backend: {
    runtime: "Node.js",
    framework: "NestJS",
    database: "MongoDB",
    cache: "Redis"
  },
  ai: {
    framework: "TensorFlow.js",
    nlp: "OpenAI API",
    analytics: "Python + Pandas"
  }
};
\`\`\`

## Machine Learning Features

### Task Classification
The system automatically categorizes tasks based on:
- Natural language processing of task descriptions
- Historical user behavior patterns
- Project context and deadlines

### Time Estimation
- Analyzes similar completed tasks
- Considers user's working patterns
- Adjusts estimates based on feedback

## Results & Impact
- **30%** increase in task completion rates
- **25%** reduction in missed deadlines
- **4.8/5** average user satisfaction score`,
    category_name: "Productivity",
    image_url: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&q=80",
    demo_url: "https://taskmanager-ai.demo.com",
    demo_video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    github_url: "https://github.com/example/ai-task-manager",
    featured: true,
    tags: ["Next.js", "AI", "Machine Learning", "MongoDB", "TypeScript", "NestJS", "TensorFlow"]
  },
  {
    title: "Real-Time Analytics Dashboard",
    description: `# Real-Time Analytics Dashboard

## Executive Summary
A comprehensive analytics platform that processes and visualizes **millions of data points** in real-time, providing actionable insights for business decision-making.

## Key Features

### Data Processing
- 📊 **Stream Processing** - Apache Kafka for real-time data ingestion
- 🔄 **ETL Pipeline** - Automated data transformation and loading
- 💾 **Data Warehouse** - Optimized storage with Snowflake
- 🚀 **Low Latency** - Sub-second query response times

### Visualization Capabilities
- Interactive charts with D3.js
- Customizable dashboards
- Export to PDF/Excel
- Mobile-responsive design

## Architecture

### Microservices Design
\`\`\`yaml
services:
  - name: data-ingestion
    tech: Node.js + Kafka
    purpose: Collect data from multiple sources
    
  - name: processing-engine
    tech: Apache Spark
    purpose: Process and transform data
    
  - name: api-gateway
    tech: GraphQL + Apollo
    purpose: Unified API for all services
    
  - name: visualization
    tech: React + D3.js
    purpose: Interactive dashboards
\`\`\`

## Performance Benchmarks

| Metric | Target | Actual |
|--------|--------|--------|
| Data Ingestion | 100K events/sec | 125K events/sec |
| Query Response | < 500ms | 350ms avg |
| Dashboard Load | < 2 sec | 1.5 sec |
| Concurrent Users | 10,000 | 15,000 tested |

## Use Cases
1. **E-commerce** - Track sales, inventory, and customer behavior
2. **Finance** - Monitor transactions and detect anomalies
3. **Healthcare** - Patient monitoring and resource allocation
4. **IoT** - Device telemetry and predictive maintenance

## Integration Options
- REST API
- GraphQL endpoint
- WebSocket connections
- Webhook notifications`,
    category_name: "Data Science",
    image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    demo_url: "https://analytics-demo.example.com",
    github_url: "https://github.com/example/analytics-dashboard",
    featured: false,
    tags: ["React", "D3.js", "GraphQL", "Apache Kafka", "Snowflake", "Docker", "Kubernetes"]
  },
  {
    title: "Mobile Fitness Tracker",
    description: `# Mobile Fitness Tracker

## About
A cross-platform mobile application that helps users track their fitness journey with **AI-powered coaching** and social features.

## Features

### Workout Tracking
- 🏃 **Activity Recognition** - Automatic exercise detection using device sensors
- 📱 **GPS Tracking** - Route mapping for outdoor activities
- ⏱️ **Interval Timer** - Customizable HIIT and circuit training
- 📈 **Progress Charts** - Visual representation of improvements

### Health Monitoring
- ❤️ Heart rate monitoring
- 🔥 Calorie burn estimation
- 😴 Sleep pattern analysis
- 💧 Hydration reminders

### Social Features
- 👥 Friend challenges and leaderboards
- 🏆 Achievement badges and milestones
- 💬 Community forums and groups
- 🤝 Find workout partners nearby

## Technical Implementation

### Mobile Development
\`\`\`typescript
// React Native implementation
const techStack = {
  framework: "React Native",
  state: "Redux Toolkit",
  navigation: "React Navigation 6",
  animations: "Reanimated 3",
  storage: "AsyncStorage + SQLite",
  backend: "Firebase + Node.js"
};
\`\`\`

### AI Coach Features
- Personalized workout recommendations
- Form correction using computer vision
- Adaptive training plans
- Nutrition suggestions based on goals

## Platform Support
- ✅ **iOS** - Native performance on iPhone/iPad
- ✅ **Android** - Material Design compliance
- ✅ **Apple Watch** - Companion app
- ✅ **Wear OS** - Google smartwatch support

## User Statistics
- **500K+** active users
- **4.7★** App Store rating
- **92%** user retention after 3 months
- **2M+** workouts logged monthly`,
    category_name: "Mobile Development",
    image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
    demo_url: "https://apps.apple.com/fitness-tracker-demo",
    demo_video_url: "https://vimeo.com/123456789",
    github_url: "https://github.com/example/fitness-tracker",
    featured: false,
    tags: ["React Native", "Firebase", "TypeScript", "Redux", "iOS", "Android", "HealthKit"]
  },
  {
    title: "Blockchain Supply Chain",
    description: `# Blockchain Supply Chain Management

## Introduction
A decentralized supply chain solution leveraging **blockchain technology** to ensure transparency, traceability, and authenticity in global supply chains.

## Problem Statement
Traditional supply chains suffer from:
- Lack of transparency
- Counterfeit products
- Inefficient tracking
- Trust issues between parties

## Solution Architecture

### Blockchain Implementation
\`\`\`solidity
contract SupplyChain {
    struct Product {
        uint256 id;
        string name;
        address manufacturer;
        uint256 timestamp;
        Location[] journey;
        bool verified;
    }
    
    mapping(uint256 => Product) public products;
    
    function addProduct(string memory _name) public {
        // Product registration logic
    }
    
    function updateLocation(uint256 _id, Location _loc) public {
        // Track product movement
    }
}
\`\`\`

### Key Components
1. **Smart Contracts** - Ethereum-based automated agreements
2. **IPFS Storage** - Decentralized document storage
3. **Oracle Integration** - Real-world data feeds
4. **Multi-signature Wallets** - Secure transactions

## Features

### For Manufacturers
- Product registration and certification
- Batch tracking and serialization
- Quality assurance documentation
- Automated compliance reporting

### For Distributors
- Real-time inventory tracking
- Automated payment processing
- Route optimization
- Temperature and condition monitoring

### For Consumers
- Product authenticity verification
- Complete product journey visibility
- Recall notifications
- Sustainability metrics

## Technology Stack
- **Blockchain**: Ethereum + Polygon
- **Smart Contracts**: Solidity
- **Frontend**: Vue.js + Web3.js
- **Backend**: Node.js + Express
- **Database**: MongoDB + IPFS
- **IoT Integration**: Arduino + Raspberry Pi

## Impact Metrics
- **80%** reduction in counterfeit products
- **60%** faster dispute resolution
- **45%** decrease in documentation errors
- **$2M** saved in operational costs annually`,
    category_name: "Blockchain",
    image_url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80",
    demo_url: "https://blockchain-supply.demo.com",
    github_url: "https://github.com/example/blockchain-supply-chain",
    featured: true,
    tags: ["Blockchain", "Ethereum", "Solidity", "Web3", "Vue.js", "Smart Contracts", "IPFS"]
  }
];

interface SeedProjectsProps {
  onSeedComplete?: () => void;
}

export default function SeedProjects({ onSeedComplete }: SeedProjectsProps = {}) {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedingStatus, setSeedingStatus] = useState<string[]>([]);

  const addStatus = (message: string) => {
    setSeedingStatus(prev => [...prev, message]);
  };

  const seedData = async () => {
    setIsSeeding(true);
    setSeedingStatus([]);
    
    try {
      addStatus('🚀 Starting to seed projects...');
      
      // Create categories
      const categoryMap = new Map();
      for (const project of dummyProjects) {
        if (project.category_name && !categoryMap.has(project.category_name)) {
          const { data, error } = await supabase
            .from('categories')
            .upsert({ name: project.category_name }, { onConflict: 'name' })
            .select()
            .single();
          
          if (data) {
            categoryMap.set(project.category_name, data.id);
            addStatus(`✅ Category: ${project.category_name}`);
          } else if (error) {
            addStatus(`❌ Error creating category ${project.category_name}`);
            console.error(error);
          }
        }
      }

      // Insert projects
      for (const project of dummyProjects) {
        const { tags, category_name, ...projectData } = project;
        
        // Add category_id
        if (category_name && categoryMap.has(category_name)) {
          (projectData as any).category_id = categoryMap.get(category_name);
        }
        
        // Insert project
        const { data: projectRecord, error: projectError } = await supabase
          .from('projects')
          .insert(projectData)
          .select()
          .single();
        
        if (projectRecord) {
          addStatus(`✅ Project: ${projectData.title}`);
          
          // Create and associate tags
          if (tags && tags.length > 0) {
            for (const tagName of tags) {
              const { data: tagData } = await supabase
                .from('tags')
                .upsert({ name: tagName }, { onConflict: 'name' })
                .select()
                .single();
              
              if (tagData) {
                // Associate tag with project
                await supabase
                  .from('project_tags')
                  .upsert({
                    project_id: projectRecord.id,
                    tag_id: tagData.id
                  });
              }
            }
            addStatus(`   📌 Added ${tags.length} tags`);
          }
        } else if (projectError) {
          addStatus(`❌ Error: ${projectData.title}`);
          console.error(projectError);
        }
      }
      
      addStatus('✨ Seeding completed successfully!');
      toast.success('Projects seeded successfully!');
      
      // Call the callback if provided
      if (onSeedComplete) {
        onSeedComplete();
      }
    } catch (error) {
      console.error('Seeding error:', error);
      addStatus('❌ Error during seeding');
      toast.error('Failed to seed projects');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Seed Dummy Projects
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This will add {dummyProjects.length} sample projects with markdown content to your database.
        </p>
        
        <Button 
          onClick={seedData} 
          disabled={isSeeding}
          className="w-full"
        >
          {isSeeding ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Seeding Projects...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Seed Projects
            </>
          )}
        </Button>

        {seedingStatus.length > 0 && (
          <div className="mt-4 p-4 bg-muted rounded-lg max-h-96 overflow-y-auto">
            <div className="space-y-1 font-mono text-xs">
              {seedingStatus.map((status, index) => (
                <div 
                  key={index} 
                  className={`flex items-start gap-2 ${
                    status.includes('✅') ? 'text-green-600' : 
                    status.includes('❌') ? 'text-red-600' : 
                    status.includes('📌') ? 'text-blue-600' :
                    'text-muted-foreground'
                  }`}
                >
                  <span>{status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
